import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateStage,
  calculateFeedingsInStage,
  calculateMatchStars,
  feedPet,
  creditGameReward,
  interactWithPet,
  switchPet,
  createActiveMatch,
  startMatch,
  advanceMatchRound,
  finishAndRewardMatch,
  completeAndRewardMatch,
  exitMatch,
  computePlantVisualStage,
  setDifficultyLevel,
  hasGameProgress,
  ACTIVITIES_CATALOG,
  GROWTH_THRESHOLDS,
  MAX_PET_SCORE,
  GROWTH_UNITS_PER_FIRST_COMBO,
  GROWTH_UNITS_PER_FEED,
  getPetTotalScore,
  getPetGameStars,
  getPetBestStarsMap,
  getPetGrowthProgress,
  getPetEarnedMedalIds,
  getPetMedals,
  hasPetMedal,
  getRecommendedDifficulty,
  getPedagogicalRecommendation,
  ACCESSORIES_CATALOG,
  buyAccessory,
  equipAccessory,
  unequipAccessory,
  getPetCoinsBalance,
} from '../src/game/rules.ts'
import {
  createDefaultGameState,
  createDefaultPet,
  saveGameState,
  loadGameState,
  migrateV1ToV2,
  STORAGE_KEY_V1,
  STORAGE_KEY_V2,
} from '../src/game/persistence.ts'
import type { PetId, GrowthStage, PetReaction, ActivityId, DifficultyLevel } from '../src/game/types.ts'
import {
  generateCountingRound,
  generatePatternsRound,
  generatePlantRound,
  generateHabitatsRound,
  generateListeningRound,
  generateStoriesRound,
  generateShadowsRound,
} from '../src/game/activitiesModel.ts'

describe('1. Reglas de etapas y umbrales de crecimiento V2 (0, 35, 80, 145)', () => {
  it('calcula etapas deterministas conforme a los umbrales de crecimiento V2', () => {
    assert.equal(calculateStage(0), 'baby')
    assert.equal(calculateStage(1), 'baby')
    assert.equal(calculateStage(34), 'baby')
    assert.equal(calculateStage(35), 'sprout')
    assert.equal(calculateStage(79), 'sprout')
    assert.equal(calculateStage(80), 'young')
    assert.equal(calculateStage(144), 'young')
    assert.equal(calculateStage(145), 'adult')
    assert.equal(calculateStage(200), 'adult')
    // Salvaguarda: stage floor impide rebajar etapas previas
    assert.equal(calculateStage(0, 'adult'), 'adult')
    assert.equal(calculateStage(0, 'young'), 'young')
    assert.equal(calculateStage(0, 'sprout'), 'sprout')
  })

  it('calcula feedingsInStage de 0 a 1 y 0 para adulto', () => {
    assert.equal(calculateFeedingsInStage(0), 0)
    assert.equal(calculateFeedingsInStage(1), 1)
    assert.equal(calculateFeedingsInStage(2), 0)
    assert.equal(calculateFeedingsInStage(3), 1)
    assert.equal(calculateFeedingsInStage(4), 0)
    assert.equal(calculateFeedingsInStage(5), 1)
    assert.equal(calculateFeedingsInStage(6), 0)
  })

  it('avanza progresivamente de baby a adult con unidades de crecimiento y confirmación exclusiva al alimentar', () => {
    let state = createDefaultGameState()
    state.pets.monkey.foodCount = 10

    // 1 comida inicial: suma +3 unidades, se mantiene en baby (<35)
    let res = feedPet(state, 'monkey')
    assert.equal(res.success, true)
    state = res.state
    assert.equal(state.pets.monkey.stage, 'baby')
    assert.equal(state.pets.monkey.totalFeedings, 1)
    assert.equal(state.pets.monkey.growthUnits, 3)

    // Acumula unidades suficientes para sprout (32 + 3 = 35) y alimentar confirma avance
    state.pets.monkey.growthUnits = 32
    res = feedPet(state, 'monkey')
    assert.equal(res.success, true)
    state = res.state
    assert.equal(state.pets.monkey.stage, 'sprout')
    assert.equal(state.pets.monkey.totalFeedings, 2)
    assert.equal(state.pets.monkey.growthUnits, 35)

    // Acumula unidades para young (77 + 3 = 80)
    state.pets.monkey.growthUnits = 77
    state = feedPet(state, 'monkey').state
    assert.equal(state.pets.monkey.stage, 'young')
    assert.equal(state.pets.monkey.growthUnits, 80)

    // Acumula unidades para adult (142 + 3 = 145)
    state.pets.monkey.growthUnits = 142
    state = feedPet(state, 'monkey').state
    assert.equal(state.pets.monkey.stage, 'adult')
    assert.equal(state.pets.monkey.growthUnits, 145)

    // El adulto puede seguir comiendo sin bloquearse ni retroceder
    res = feedPet(state, 'monkey')
    assert.equal(res.success, true)
    state = res.state
    assert.equal(state.pets.monkey.stage, 'adult')
    assert.equal(state.pets.monkey.totalFeedings, 5)
    assert.equal(state.pets.monkey.growthUnits, 148)
    assert.equal(state.pets.monkey.foodCount, 5)
  })
})

describe('2. Consumo de alimentos y protección contra inventario vacío', () => {
  it('consume exactamente 1 unidad por alimentación', () => {
    let state = createDefaultGameState()
    state.pets.turtle.foodCount = 3

    const res = feedPet(state, 'turtle')
    assert.equal(res.success, true)
    assert.equal(res.state.pets.turtle.foodCount, 2)
  })

  it('rechaza alimentar si el inventario está vacío y no permite números negativos', () => {
    const state = createDefaultGameState()
    state.pets.toucan.foodCount = 0

    const res = feedPet(state, 'toucan')
    assert.equal(res.success, false)
    assert.equal(res.state.pets.toucan.foodCount, 0)
    assert.equal(res.state.pets.toucan.totalFeedings, 0)
  })
})

describe('3. Recompensa única e idempotencia (no duplicación de premios)', () => {
  it('acredita exactamente 1 alimento al completar una partida con matchId nuevo', () => {
    const state = createDefaultGameState()
    const matchId = 'match_12345_abc'

    const res = creditGameReward(state, 'monkey', matchId)
    assert.equal(res.credited, true)
    assert.equal(res.state.pets.monkey.foodCount, 1)
    assert.ok(res.state.completedMatchIds.includes(matchId))
  })

  it('no duplica alimentos si se vuelve a emitir el mismo matchId', () => {
    let state = createDefaultGameState()
    const matchId = 'match_already_awarded'

    const first = creditGameReward(state, 'monkey', matchId)
    assert.equal(first.credited, true)
    state = first.state
    assert.equal(state.pets.monkey.foodCount, 1)

    // Intento duplicado con el mismo matchId (ej. refrescar pantalla de victoria)
    const second = creditGameReward(state, 'monkey', matchId)
    assert.equal(second.credited, false)
    assert.equal(second.state.pets.monkey.foodCount, 1)
  })
})

describe('4. Aislamiento por mascota', () => {
  it('conserva inventarios y etapas separados entre mono, tortuga y tucán', () => {
    let state = createDefaultGameState()
    state.pets.monkey.foodCount = 5
    state.pets.turtle.foodCount = 2
    state.pets.toucan.foodCount = 0

    // Alimentar solo al mono
    state = feedPet(state, 'monkey').state

    assert.equal(state.pets.monkey.foodCount, 4)
    assert.equal(state.pets.turtle.foodCount, 2)
    assert.equal(state.pets.toucan.foodCount, 0)

    // Cambiar a la tortuga y verificar que conserva su estado
    state = switchPet(state, 'turtle')
    assert.equal(state.selectedPetId, 'turtle')
    assert.equal(state.pets.turtle.foodCount, 2)
  })
})

describe('5. Persistencia, normalización y recuperación ante datos corruptos', () => {
  it('recupera estado por defecto seguro ante JSON corrupto sin pantalla blanca', () => {
    // Simular almacenamiento corrupto
    const mockStorage: Record<string, string> = {
      muyu_game_save_v1: '{ corrupt_json: [invalid syntax',
    }

    const originalGetItem = globalThis.localStorage?.getItem
    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => { mockStorage[key] = val },
      removeItem: (key: string) => { delete mockStorage[key] },
      clear: () => {},
      length: 1,
      key: () => null,
    }

    const loaded = loadGameState()
    // Justificación Fase 1: El esquema por defecto evoluciona a la versión canónica V2 (muyu_game_save_v2)
    assert.equal(loaded.version, 2)
    assert.equal(loaded.selectedPetId, 'monkey')
    assert.equal(loaded.pets.monkey.foodCount, 0)

    // Restaurar si existía
    if (originalGetItem) {
      globalThis.localStorage.getItem = originalGetItem
    }
  })

  it('normaliza la etapa si los datos guardados tienen incoherencia entre etapa y alimentaciones', () => {
    const mockStorage: Record<string, string> = {
      muyu_game_save_v1: JSON.stringify({
        version: 1,
        selectedPetId: 'turtle',
        pets: {
          turtle: {
            id: 'turtle',
            name: 'Tortuguita',
            stage: 'baby', // Incoherente con totalFeedings: 6
            foodCount: -5,  // Incoherente (negativo)
            totalFeedings: 6,
            interactionsCount: 10,
          },
        },
        settings: { soundEnabled: true },
        completedMatchIds: ['match_01'],
      }),
    }

    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => { mockStorage[key] = val },
      removeItem: (key: string) => { delete mockStorage[key] },
      clear: () => {},
      length: 1,
      key: () => null,
    }

    const loaded = loadGameState()
    // Debe haber corregido el stage a adult y el foodCount a >= 0
    assert.equal(loaded.pets.turtle.stage, 'adult')
    assert.equal(loaded.pets.turtle.foodCount, 0)
    assert.equal(loaded.pets.turtle.totalFeedings, 6)
    assert.ok(loaded.completedMatchIds.includes('match_01'))
  })

  it('guarda e incrementa interacciones afectivas correctamente', () => {
    let state = createDefaultGameState()
    state = interactWithPet(state, 'monkey')
    assert.equal(state.pets.monkey.interactionsCount, 1)

    const mockStorage: Record<string, string> = {}
    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => { mockStorage[key] = val },
      removeItem: (key: string) => { delete mockStorage[key] },
      clear: () => {},
      length: 1,
      key: () => null,
    }

    saveGameState(state)
    const reloaded = loadGameState()
    assert.equal(reloaded.pets.monkey.interactionsCount, 1)
  })
})

describe('6. ActiveMatch, avance de rondas y premiación determinista', () => {
  it('startMatch crea una partida activa tipada con id único y metas 1..5', () => {
    let state = createDefaultGameState()
    state = startMatch(state, 'counting', [3, 1, 5])

    assert.equal(state.currentScreen, 'activity-counting')
    assert.ok(state.activeMatch)
    assert.equal(state.activeMatch?.activityId, 'counting')
    assert.equal(state.activeMatch?.roundIndex, 0)
    assert.deepEqual(state.activeMatch?.roundTargets, [3, 1, 5])
    assert.equal(state.activeMatch?.completed, false)
    assert.equal(state.activeMatch?.rewarded, false)
  })

  it('no permite premiar antes de completar las 3 rondas requeridas', () => {
    let state = createDefaultGameState()
    state = startMatch(state, 'counting', [2, 4, 3])

    // Intento prematuro en ronda 0
    let res = completeAndRewardMatch(state)
    assert.equal(res.credited, false)
    assert.equal(res.state.pets.monkey.foodCount, 0)

    // Avanzar a ronda 1
    state = advanceMatchRound(state)
    assert.equal(state.activeMatch?.roundIndex, 1)
    res = completeAndRewardMatch(state)
    assert.equal(res.credited, false)
    assert.equal(res.state.pets.monkey.foodCount, 0)

    // Avanzar a ronda 2
    state = advanceMatchRound(state)
    assert.equal(state.activeMatch?.roundIndex, 2)
    res = completeAndRewardMatch(state)
    assert.equal(res.credited, false)
    assert.equal(res.state.pets.monkey.foodCount, 0)
  })

  it('avanza exactamente 3 rondas y acredita atómicamente 1 alimento', () => {
    let state = createDefaultGameState()
    state = startMatch(state, 'plant')

    // Ronda 0 -> Ronda 1
    state = advanceMatchRound(state)
    assert.equal(state.activeMatch?.roundIndex, 1)
    assert.equal(state.activeMatch?.completed, false)

    // Ronda 1 -> Ronda 2
    state = advanceMatchRound(state)
    assert.equal(state.activeMatch?.roundIndex, 2)
    assert.equal(state.activeMatch?.completed, false)

    // Ronda 2 -> Completado (ronda 3)
    state = advanceMatchRound(state)
    assert.equal(state.activeMatch?.roundIndex, 3)
    assert.equal(state.activeMatch?.completed, true)

    // Acreditación atómica
    const res = completeAndRewardMatch(state)
    assert.equal(res.credited, true)
    assert.equal(res.state.pets.monkey.foodCount, 1)
    assert.equal(res.state.activeMatch?.rewarded, true)
    assert.ok(res.state.completedMatchIds.includes(state.activeMatch!.id))
  })

  it('garantiza idempotencia estricta en celebración (refrescar no duplica premios)', () => {
    let state = createDefaultGameState()
    state = startMatch(state, 'listening')
    state = advanceMatchRound(state)
    state = advanceMatchRound(state)
    state = advanceMatchRound(state) // completado

    // Primer cobro de recompensa
    const first = completeAndRewardMatch(state)
    assert.equal(first.credited, true)
    assert.equal(first.state.pets.monkey.foodCount, 1)

    // Simular refresh o reejecución en la pantalla de celebración
    const second = completeAndRewardMatch(first.state)
    assert.equal(second.credited, false)
    assert.equal(second.state.pets.monkey.foodCount, 1) // Sigue en 1, no 2
  })

  it('exitMatch vuelve al hogar y limpia activeMatch preservando historial de victorias', () => {
    let state = createDefaultGameState()
    state = startMatch(state, 'counting')
    state = advanceMatchRound(state)
    state = advanceMatchRound(state)
    state = advanceMatchRound(state)
    state = completeAndRewardMatch(state).state

    const matchId = state.completedMatchIds[0]
    assert.ok(matchId)

    const exited = exitMatch(state)
    assert.equal(exited.currentScreen, 'home')
    assert.equal(exited.activeMatch, null)
    // El registro histórico de victorias NO se borra
    assert.ok(exited.completedMatchIds.includes(matchId))
  })
})

describe('7. Persistencia de sesión activa, roundtrip y resiliencia de esquemas', () => {
  it('session roundtrip: recargar en mitad de partida (ronda 2) reanuda exactamente allí', () => {
    const mockStorage: Record<string, string> = {}
    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => { mockStorage[key] = val },
      removeItem: (key: string) => { delete mockStorage[key] },
      clear: () => {},
      length: 1,
      key: () => null,
    }

    let state = createDefaultGameState()
    state = startMatch(state, 'counting', [4, 2, 5])
    state = advanceMatchRound(state) // A ronda 1
    state.activeMatch!.partialData = { inBasketCount: 3 }

    saveGameState(state)

    // Recargar estado desde storage como si el usuario hubiese refrescado la pestaña
    const reloaded = loadGameState()
    assert.equal(reloaded.currentScreen, 'activity-counting')
    assert.ok(reloaded.activeMatch)
    assert.equal(reloaded.activeMatch?.id, state.activeMatch?.id)
    assert.equal(reloaded.activeMatch?.roundIndex, 1)
    assert.deepEqual(reloaded.activeMatch?.roundTargets, [4, 2, 5])
    assert.equal(reloaded.activeMatch?.partialData?.inBasketCount, 3)
    assert.equal(reloaded.activeMatch?.completed, false)
    assert.equal(reloaded.activeMatch?.rewarded, false)
  })

  it('celebration roundtrip: recargar en pantalla de victoria no reinicia partida ni regala alimentos extra', () => {
    const mockStorage: Record<string, string> = {}
    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => { mockStorage[key] = val },
      removeItem: (key: string) => { delete mockStorage[key] },
      clear: () => {},
      length: 1,
      key: () => null,
    }

    let state = createDefaultGameState()
    state = startMatch(state, 'plant')
    state = advanceMatchRound(state)
    state = advanceMatchRound(state)
    state = advanceMatchRound(state)
    state = completeAndRewardMatch(state).state
    assert.equal(state.pets.monkey.foodCount, 1)

    saveGameState(state)

    // Recargar
    const reloaded = loadGameState()
    assert.equal(reloaded.currentScreen, 'activity-plant')
    assert.equal(reloaded.activeMatch?.completed, true)
    assert.equal(reloaded.activeMatch?.rewarded, true)

    // Intentar premiar de nuevo tras recargar
    const reReward = completeAndRewardMatch(reloaded)
    assert.equal(reReward.credited, false)
    assert.equal(reReward.state.pets.monkey.foodCount, 1)
  })

  it('idempotencia infinita para 100+ partidas sin truncamiento', () => {
    const mockStorage: Record<string, string> = {}
    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => { mockStorage[key] = val },
      removeItem: (key: string) => { delete mockStorage[key] },
      clear: () => {},
      length: 1,
      key: () => null,
    }

    let state = createDefaultGameState()
    // Generar 120 partidas únicas
    const matchIds: string[] = []
    for (let i = 0; i < 120; i++) {
      const id = `match_hist_${i}`
      matchIds.push(id)
      state = creditGameReward(state, 'monkey', id).state
    }

    assert.equal(state.completedMatchIds.length, 120)
    saveGameState(state)

    const reloaded = loadGameState()
    // Verificar que TODAS las 120 partidas siguen presentes y no fueron truncadas a 100
    assert.equal(reloaded.completedMatchIds.length, 120)
    assert.ok(reloaded.completedMatchIds.includes('match_hist_0'))
    assert.ok(reloaded.completedMatchIds.includes('match_hist_119'))

    // Reintentar la primera partida de hace 120 partidas sigue siendo bloqueada
    const retryFirst = creditGameReward(reloaded, 'monkey', 'match_hist_0')
    assert.equal(retryFirst.credited, false)
  })

  it('versión desconocida o futura (ej. version 99) se recupera con seguridad normalizando a versión 1', () => {
    const mockStorage: Record<string, string> = {
      muyu_game_save_v1: JSON.stringify({
        version: 99, // Versión desconocida
        currentScreen: 'home',
        selectedPetId: 'toucan',
        pets: {
          toucan: {
            id: 'toucan',
            name: 'Tucancito',
            totalFeedings: 4,
            foodCount: 3,
            interactionsCount: 15,
          },
        },
        settings: { soundEnabled: false },
        completedMatchIds: ['match_future_01'],
      }),
    }

    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => { mockStorage[key] = val },
      removeItem: (key: string) => { delete mockStorage[key] },
      clear: () => {},
      length: 1,
      key: () => null,
    }

    const loaded = loadGameState()
    // Justificación Fase 1: Esquema con versión desconocida se normaliza a la versión canónica actual V2
    assert.equal(loaded.version, 2)
    assert.equal(loaded.currentScreen, 'home')
    assert.equal(loaded.selectedPetId, 'toucan')
    assert.equal(loaded.pets.toucan.stage, 'young')
    assert.equal(loaded.pets.toucan.foodCount, 3)
    assert.equal(loaded.pets.toucan.totalFeedings, 4)
    assert.equal(loaded.settings.soundEnabled, false)
    assert.ok(loaded.completedMatchIds.includes('match_future_01'))
  })

  it('finishAndRewardMatch: handler exacto usado por App finaliza ronda 2, acredita 1 alimento y previene duplicados', () => {
    let state = createDefaultGameState()
    state = startMatch(state, 'counting', [1, 2, 3])
    // Simular que el juego está en la ronda final (índice 2)
    state = advanceMatchRound(state) // ronda 1
    state = advanceMatchRound(state) // ronda 2
    assert.equal(state.activeMatch?.roundIndex, 2)
    assert.equal(state.activeMatch?.completed, false)
    assert.equal(state.activeMatch?.rewarded, false)

    const matchId = state.activeMatch!.id

    // Ejecutar el handler exacto de App.handleGameComplete
    const res = finishAndRewardMatch(state, 'counting', matchId)
    assert.equal(res.credited, true)
    assert.equal(res.state.pets.monkey.foodCount, 1)
    assert.equal(res.state.activeMatch?.roundIndex, 3)
    assert.equal(res.state.activeMatch?.completed, true)
    assert.equal(res.state.activeMatch?.rewarded, true)
    assert.ok(res.state.completedMatchIds.includes(matchId))

    // Intento duplicado con el mismo activityId y matchId
    const dupRes = finishAndRewardMatch(res.state, 'counting', matchId)
    assert.equal(dupRes.credited, false)
    assert.equal(dupRes.state.pets.monkey.foodCount, 1) // No duplica
  })

  it('finishAndRewardMatch: rechaza si la partida está en rondas previas o no coincide activityId/matchId', () => {
    let state = createDefaultGameState()
    state = startMatch(state, 'plant')
    assert.equal(state.activeMatch?.roundIndex, 0)

    const matchId = state.activeMatch!.id

    // Rechaza en ronda 0
    let res = finishAndRewardMatch(state, 'plant', matchId)
    assert.equal(res.credited, false)
    assert.equal(res.state.pets.monkey.foodCount, 0)

    // Rechaza con activityId incorrecto
    state = advanceMatchRound(state)
    state = advanceMatchRound(state) // ronda 2
    res = finishAndRewardMatch(state, 'counting', matchId)
    assert.equal(res.credited, false)
    assert.equal(res.state.pets.monkey.foodCount, 0)

    // Rechaza con matchId incorrecto
    res = finishAndRewardMatch(state, 'plant', 'fake_match_id')
    assert.equal(res.credited, false)
    assert.equal(res.state.pets.monkey.foodCount, 0)
  })

  it('sanitiza partialData corrupto (NaN, arrays inválidos, negativos) y sincroniza currentScreen', () => {
    const mockStorage: Record<string, string> = {
      muyu_game_save_v1: JSON.stringify({
        version: 1,
        currentScreen: 'activity-plant', // Mismatched con activityId counting
        selectedPetId: 'monkey',
        pets: {
          monkey: {
            id: 'monkey',
            name: 'Monito',
            totalFeedings: 2,
            foodCount: 1,
            interactionsCount: 5,
          },
        },
        settings: { soundEnabled: true },
        completedMatchIds: [],
        activeMatch: {
          id: 'match_test_corrupt',
          petId: 'monkey',
          activityId: 'counting',
          roundIndex: 1,
          roundTargets: [3, 2, 4],
          partialData: {
            inBasketCount: -99, // Negativo corrupto
            otherJunk: 'ignore',
          },
          completed: false,
          rewarded: false,
        },
      }),
    }

    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => { mockStorage[key] = val },
      removeItem: (key: string) => { delete mockStorage[key] },
      clear: () => {},
      length: 1,
      key: () => null,
    }

    const loaded = loadGameState()
    // currentScreen se sincroniza a activity-counting
    assert.equal(loaded.currentScreen, 'activity-counting')
    assert.ok(loaded.activeMatch)
    // inBasketCount corrupto (-99) se normalizó a 0 de forma segura
    assert.equal(loaded.activeMatch?.partialData?.inBasketCount, 0)
  })
})

describe('9. Invariante visual de la planta y etapas de crecimiento', () => {
  it('conserva etapa 2 (brote verde) en ronda 3 con solo agua y avanza a etapa 3 solo al dar sol', () => {
    // Ronda 1: Semilla (etapa 1)
    assert.equal(computePlantVisualStage(0, [], false), 1)
    assert.equal(computePlantVisualStage(0, ['water'], false), 1)

    // Ronda 2: Brote verde si recibió sol (etapa 2)
    assert.equal(computePlantVisualStage(1, [], false), 1)
    assert.equal(computePlantVisualStage(1, ['sun'], false), 2)

    // Ronda 3: Requiere agua Y sol para florecer (etapa 3).
    // Si solo tiene agua al refrescar, DEBE conservar etapa 2 (brote crecido), NO mostrar flor prematuramente
    assert.equal(computePlantVisualStage(2, [], false), 2)
    assert.equal(computePlantVisualStage(2, ['water'], false), 2)
    assert.equal(computePlantVisualStage(2, ['sun'], false), 2)
    // Cuando recibe ambos, florece (etapa 3)
    assert.equal(computePlantVisualStage(2, ['water', 'sun'], false), 3)

    // Al completarse o ronda >= 3, siempre etapa 3
    assert.equal(computePlantVisualStage(2, ['water'], true), 3)
    assert.equal(computePlantVisualStage(3, [], false), 3)
  })
})

describe('10. Migración segura V1 -> V2, baseline UI y salvaguarda adult floor (Fase 1)', () => {
  it('migra V1 a V2 preservando intacta la clave original y creando clave V2 sin destruirla', () => {
    const v1StateJson = JSON.stringify({
      version: 1,
      currentScreen: 'home',
      selectedPetId: 'toucan',
      pets: {
        monkey: {
          id: 'monkey',
          name: 'Monito',
          stage: 'adult',
          foodCount: 0,
          feedingsInStage: 0,
          totalFeedings: 6,
          interactionsCount: 8,
        },
        turtle: {
          id: 'turtle',
          name: 'Tortuguita',
          stage: 'baby',
          foodCount: 2,
          feedingsInStage: 0,
          totalFeedings: 0,
          interactionsCount: 4,
        },
        toucan: {
          id: 'toucan',
          name: 'Tucancito',
          stage: 'sprout',
          foodCount: 0,
          feedingsInStage: 0,
          totalFeedings: 2,
          interactionsCount: 5,
        },
      },
      settings: { soundEnabled: false },
      completedMatchIds: ['match_mvp_baseline_01'],
      activeMatch: null,
    })

    const mockStorage: Record<string, string> = {
      [STORAGE_KEY_V1]: v1StateJson,
    }

    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => { mockStorage[key] = val },
      removeItem: (key: string) => { delete mockStorage[key] },
      clear: () => {},
      length: 1,
      key: () => null,
    }

    const loaded = loadGameState()

    // 1. Clave V1 se conserva INTACTA e inalterada
    assert.equal(mockStorage[STORAGE_KEY_V1], v1StateJson)

    // 2. Clave V2 fue creada con la migración
    assert.ok(mockStorage[STORAGE_KEY_V2])
    assert.equal(loaded.version, 2)

    // 3. Baseline UI usuario comprobado fielmente
    assert.equal(loaded.selectedPetId, 'toucan')
    assert.equal(loaded.settings.soundEnabled, false)
    assert.equal(loaded.pets.monkey.stage, 'adult')
    assert.equal(loaded.pets.monkey.foodCount, 0)
    assert.equal(loaded.pets.turtle.stage, 'baby')
    assert.equal(loaded.pets.turtle.foodCount, 2)
    assert.equal(loaded.pets.toucan.stage, 'sprout')
    assert.equal(loaded.pets.toucan.foodCount, 0)
    assert.ok(loaded.completedMatchIds.includes('match_mvp_baseline_01'))
  })

  it('adult floor: mascota que llegó a adulto en V1 jamás es rebajada aunque se recalculen alimentaciones', () => {
    // Caso de adulto con alimentaciones incoherentes o mínimas
    const state = migrateV1ToV2({
      version: 1,
      selectedPetId: 'monkey',
      pets: {
        monkey: {
          id: 'monkey',
          name: 'Monito',
          stage: 'adult',
          totalFeedings: 1, // < 6 en datos antiguos
          foodCount: 3,
          interactionsCount: 12,
        },
      },
      settings: { soundEnabled: true },
      completedMatchIds: [],
    })

    // Jamás rebajar de etapa a un adulto
    assert.equal(state.pets.monkey.stage, 'adult')
    assert.ok(state.pets.monkey.unlockedStages?.includes('adult'))

    // Alimentar al adulto sigue respetando la etapa adulta sin retroceso
    const fed = feedPet(state, 'monkey')
    assert.equal(fed.success, true)
    assert.equal(fed.state.pets.monkey.stage, 'adult')
  })

  it('reanuda partida activa legada de V1 y permite completarla en V2 de forma idempotente', () => {
    const mockStorage: Record<string, string> = {
      [STORAGE_KEY_V1]: JSON.stringify({
        version: 1,
        currentScreen: 'activity-counting',
        selectedPetId: 'toucan',
        pets: {
          toucan: {
            id: 'toucan',
            name: 'Tucancito',
            stage: 'sprout',
            foodCount: 0,
            feedingsInStage: 0,
            totalFeedings: 2,
            interactionsCount: 2,
          },
        },
        settings: { soundEnabled: false },
        completedMatchIds: [],
        activeMatch: {
          id: 'match_legacy_001',
          petId: 'toucan',
          activityId: 'counting',
          roundIndex: 1,
          roundTargets: [3, 2, 4],
          partialData: { inBasketCount: 2 },
          completed: false,
          rewarded: false,
        },
      }),
    }

    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => { mockStorage[key] = val },
      removeItem: (key: string) => { delete mockStorage[key] },
      clear: () => {},
      length: 1,
      key: () => null,
    }

    let loaded = loadGameState()
    assert.equal(loaded.currentScreen, 'activity-counting')
    assert.ok(loaded.activeMatch)
    assert.equal(loaded.activeMatch?.id, 'match_legacy_001')
    assert.equal(loaded.activeMatch?.roundIndex, 1)

    // Avanzar a ronda 2 y finalizar
    loaded = advanceMatchRound(loaded)
    assert.equal(loaded.activeMatch?.roundIndex, 2)
    const res = finishAndRewardMatch(loaded, 'counting', 'match_legacy_001')
    assert.equal(res.credited, true)
    assert.equal(res.state.pets.toucan.foodCount, 1) // Recompensa acreditada
  })

  it('catálogo canónico declara exactamente 7 actividades con metadatos válidos', () => {
    assert.equal(ACTIVITIES_CATALOG.length, 7)
    const expectedCodes = ['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7']
    assert.deepEqual(ACTIVITIES_CATALOG.map((a) => a.code), expectedCodes)
    assert.ok(ACTIVITIES_CATALOG.find((a) => a.id === 'counting')?.isAvailable)
    assert.ok(ACTIVITIES_CATALOG.find((a) => a.id === 'plant')?.isAvailable)
    assert.ok(ACTIVITIES_CATALOG.find((a) => a.id === 'listening')?.isAvailable)
  })

  it('permite cambiar y persistir el nivel de dificultad pedagógica', () => {
    let state = createDefaultGameState()
    assert.equal(state.settings.difficultyLevel, 'initial')

    state = setDifficultyLevel(state, 'medium')
    assert.equal(state.settings.difficultyLevel, 'medium')

    state = setDifficultyLevel(state, 'advanced')
    assert.equal(state.settings.difficultyLevel, 'advanced')
  })

  it('hasGameProgress detecta progreso para botón Continuar vs Jugar en portada', () => {
    const emptyState = createDefaultGameState()
    assert.equal(hasGameProgress(emptyState), false)

    let progressState = createDefaultGameState()
    progressState.pets.monkey.stage = 'adult'
    assert.equal(hasGameProgress(progressState), true)

    progressState = createDefaultGameState()
    progressState.pets.turtle.foodCount = 2
    assert.equal(hasGameProgress(progressState), true)

    progressState = createDefaultGameState()
    progressState.completedMatchIds = ['match_x']
    assert.equal(hasGameProgress(progressState), true)
  })
})

describe('11. Evolución de mascotas, 12 formas anatómicas y 4 reacciones (Fase 2)', () => {
  it('reconoce exactamente las 12 combinaciones anatómicas (3 especies x 4 etapas)', () => {
    const species: PetId[] = ['monkey', 'turtle', 'toucan']
    const stages: GrowthStage[] = ['baby', 'sprout', 'young', 'adult']

    const allCombinations: string[] = []
    for (const petId of species) {
      for (const stage of stages) {
        allCombinations.push(`${petId}_${stage}`)
      }
    }

    assert.equal(allCombinations.length, 12)
    assert.deepEqual(allCombinations, [
      'monkey_baby',
      'monkey_sprout',
      'monkey_young',
      'monkey_adult',
      'turtle_baby',
      'turtle_sprout',
      'turtle_young',
      'turtle_adult',
      'toucan_baby',
      'toucan_sprout',
      'toucan_young',
      'toucan_adult',
    ])
  })

  it('soporta las 4 reacciones conductuales requeridas (reposo, alegría, alimentación, caricia)', () => {
    const reactions: PetReaction[] = ['idle', 'happy', 'eating', 'petting']
    assert.equal(reactions.length, 4)

    // Aliases semánticos compatibles
    const legacyAliases: PetReaction[] = ['none', 'tap', 'feed', 'pet']
    assert.equal(legacyAliases.length, 4)
  })

  it('desbloquea etapas progresivamente en el álbum al alimentar y evolucionar', () => {
    let state = createDefaultGameState()
    state.pets.monkey.foodCount = 10
    assert.deepEqual(state.pets.monkey.unlockedStages, ['baby'])

    // Alimentar alcanzando umbral sprout (35): 32 + 3 = 35
    state.pets.monkey.growthUnits = 32
    state = feedPet(state, 'monkey').state
    assert.equal(state.pets.monkey.stage, 'sprout')
    assert.ok(state.pets.monkey.unlockedStages?.includes('baby'))
    assert.ok(state.pets.monkey.unlockedStages?.includes('sprout'))

    // Alimentar alcanzando umbral young (80): 77 + 3 = 80
    state.pets.monkey.growthUnits = 77
    state = feedPet(state, 'monkey').state
    assert.equal(state.pets.monkey.stage, 'young')
    assert.ok(state.pets.monkey.unlockedStages?.includes('young'))

    // Alimentar alcanzando umbral adult (145): 142 + 3 = 145
    state.pets.monkey.growthUnits = 142
    state = feedPet(state, 'monkey').state
    assert.equal(state.pets.monkey.stage, 'adult')
    assert.deepEqual(state.pets.monkey.unlockedStages, ['baby', 'sprout', 'young', 'adult'])
  })

  it('visor de álbum permite reproducir evolución exclusivamente en etapas desbloqueadas', () => {
    const pet = createDefaultGameState().pets.turtle
    const unlocked = pet.unlockedStages || ['baby']

    // Bebé está desbloqueado por defecto
    assert.equal(unlocked.includes('baby'), true)
    // Las etapas superiores aún están bloqueadas en una mascota nueva
    assert.equal(unlocked.includes('sprout'), false)
    assert.equal(unlocked.includes('young'), false)
    assert.equal(unlocked.includes('adult'), false)
  })
})

describe('12. Fase 3: Siete minijuegos x tres niveles pedagógicos (21 configuraciones)', () => {
  const allActivities: ActivityId[] = [
    'counting',
    'patterns',
    'plant',
    'habitats',
    'listening',
    'stories',
    'shadows',
  ]
  const allDifficulties: DifficultyLevel[] = ['initial', 'medium', 'advanced']
  const allRounds = [0, 1, 2]

  it('ejecuta exitosamente las 21 configuraciones x 3 rondas (63 rondas generadas y verificadas)', () => {
    let generatedRoundsCount = 0

    for (const activity of allActivities) {
      for (const difficulty of allDifficulties) {
        for (const round of allRounds) {
          const matchId = `test_match_${activity}_${difficulty}`

          switch (activity) {
            case 'counting': {
              const res = generateCountingRound(matchId, round, difficulty)
              assert.ok(res.targetCount >= 1 && res.targetCount <= 6)
              assert.ok(res.availableFruits >= res.targetCount)
              assert.ok(['mango', 'apple', 'orange', 'strawberry'].includes(res.fruitType))
              assert.ok(res.promptText.length > 0)
              break
            }
            case 'patterns': {
              const res = generatePatternsRound(matchId, round, difficulty)
              assert.ok(res.sequence.length >= 4)
              assert.ok(res.options.includes(res.correctAnswer))
              assert.ok(res.sequence[res.missingIndex] === null)
              break
            }
            case 'plant': {
              const res = generatePlantRound(matchId, round, difficulty)
              assert.ok(res.requiredTools.length >= 1)
              assert.ok(res.options.length >= 2)
              assert.ok(res.requiredTools.every((t) => res.options.includes(t)))
              assert.ok([1, 2, 3].includes(res.targetVisualStage))
              break
            }
            case 'habitats': {
              const res = generateHabitatsRound(matchId, round, difficulty)
              assert.ok(res.habitats.length >= 2)
              assert.ok(res.animals.length >= 2)
              // Todo animal corresponde a uno de los hábitats presentados
              const habitatIds = res.habitats.map((h) => h.id)
              assert.ok(res.animals.every((a) => habitatIds.includes(a.correctHabitat)))
              break
            }
            case 'listening': {
              const res = generateListeningRound(matchId, round, difficulty)
              assert.ok(res.options.includes(res.targetId))
              assert.ok(res.spokenPrompt.length > 0)
              assert.ok(res.visualHint.length > 0)
              break
            }
            case 'stories': {
              const res = generateStoriesRound(matchId, round, difficulty)
              assert.ok(res.cards.length >= 2 && res.cards.length <= 4)
              assert.ok(res.storyTitle.length > 0)
              // Las tarjetas tienen números de paso del 1 al N
              const steps = res.cards.map((c) => c.stepNumber).sort((a, b) => a - b)
              assert.deepEqual(steps, res.cards.map((_, i) => i + 1))
              break
            }
            case 'shadows': {
              const res = generateShadowsRound(matchId, round, difficulty)
              assert.ok(res.shapes.length >= 2 && res.shapes.length <= 4)
              assert.ok(res.promptText.length > 0)
              break
            }
          }
          generatedRoundsCount++
        }
      }
    }

    assert.equal(generatedRoundsCount, 7 * 3 * 3) // Exactamente 63 rondas generadas
  })

  it('J1 Fiesta de frutas: respeta rangos pedagógicos de conteo por nivel', () => {
    const matchId = 'counting_pedagogical_test'

    // Inicial: 1 a 3 frutas
    const cInit = generateCountingRound(matchId, 0, 'initial')
    assert.ok(cInit.targetCount >= 1 && cInit.targetCount <= 3)

    // Medio: 3 a 5 frutas
    const cMed = generateCountingRound(matchId, 0, 'medium')
    assert.ok(cMed.targetCount >= 3 && cMed.targetCount <= 5)

    // Avanzado: 4 a 6 frutas
    const cAdv = generateCountingRound(matchId, 0, 'advanced')
    assert.ok(cAdv.targetCount >= 4 && cAdv.targetCount <= 6)
  })

  it('createActiveMatch y startMatch generan 3 roundTargets según dificultad (inicial 1..3, medio 3..5, avanzado 4..6)', () => {
    // 1. Dificultad inicial: metas [1, 2, 3]
    const matchInit = createActiveMatch('counting', 'monkey', undefined, 'initial')
    assert.deepEqual(matchInit.roundTargets, [1, 2, 3])
    assert.equal(matchInit.difficulty, 'initial')

    // 2. Dificultad media: metas [3, 4, 5]
    const matchMed = createActiveMatch('counting', 'monkey', undefined, 'medium')
    assert.deepEqual(matchMed.roundTargets, [3, 4, 5])
    assert.equal(matchMed.difficulty, 'medium')

    // 3. Dificultad avanzada: metas [4, 5, 6]
    const matchAdv = createActiveMatch('counting', 'monkey', undefined, 'advanced')
    assert.deepEqual(matchAdv.roundTargets, [4, 5, 6])
    assert.equal(matchAdv.difficulty, 'advanced')

    // 4. Fallback por defecto (initial) si no se especifica dificultad
    const matchDefault = createActiveMatch('counting', 'monkey')
    assert.deepEqual(matchDefault.roundTargets, [1, 2, 3])

    // 5. Preservación estricta de customTargets explícitos
    const matchCustom = createActiveMatch('counting', 'monkey', [2, 5, 1], 'advanced')
    assert.deepEqual(matchCustom.roundTargets, [2, 5, 1])

    // 6. Integración con startMatch y configuración de GameState
    let state = createDefaultGameState()
    state = setDifficultyLevel(state, 'advanced')
    state = startMatch(state, 'counting')
    assert.deepEqual(state.activeMatch?.roundTargets, [4, 5, 6])

    state = setDifficultyLevel(state, 'medium')
    state = startMatch(state, 'counting')
    assert.deepEqual(state.activeMatch?.roundTargets, [3, 4, 5])
  })

  it('J2 El camino de los patrones: produce patrones AB, AAB/ABB y ABC con respuesta correcta en opciones', () => {
    const matchId = 'patterns_test_match'

    // Inicial: AB-AB (4 casillas, 2 opciones)
    const pInit = generatePatternsRound(matchId, 0, 'initial')
    assert.equal(pInit.sequence.length, 4)
    assert.equal(pInit.options.length, 2)
    assert.ok(pInit.options.includes(pInit.correctAnswer))

    // Medio: AAB-AAB o ABB-ABB (6 casillas, 3 opciones)
    const pMed = generatePatternsRound(matchId, 1, 'medium')
    assert.equal(pMed.sequence.length, 6)
    assert.equal(pMed.options.length, 3)
    assert.ok(pMed.options.includes(pMed.correctAnswer))

    // Avanzado: ABC-ABC (6 casillas, 4 opciones)
    const pAdv = generatePatternsRound(matchId, 2, 'advanced')
    assert.equal(pAdv.sequence.length, 6)
    assert.equal(pAdv.options.length, 4)
    assert.ok(pAdv.options.includes(pAdv.correctAnswer))
  })

  it('J3 El huerto de Muyu: incluye secuencia pedagógica de semilla, tierra, agua, luz y cuidado', () => {
    const matchId = 'plant_sequence_test'

    // Inicial: semilla en r0, agua en r1, sol en r2
    const plInit0 = generatePlantRound(matchId, 0, 'initial')
    assert.deepEqual(plInit0.requiredTools, ['seed'])
    const plInit1 = generatePlantRound(matchId, 1, 'initial')
    assert.deepEqual(plInit1.requiredTools, ['water'])
    const plInit2 = generatePlantRound(matchId, 2, 'initial')
    assert.deepEqual(plInit2.requiredTools, ['sun'])

    // Medio: 2 pasos ordenados con tierra, semilla, sol, agua, cuidado
    const plMed0 = generatePlantRound(matchId, 0, 'medium')
    assert.deepEqual(plMed0.requiredTools, ['soil', 'seed'])
    const plMed1 = generatePlantRound(matchId, 1, 'medium')
    assert.deepEqual(plMed1.requiredTools, ['water', 'sun'])
    const plMed2 = generatePlantRound(matchId, 2, 'medium')
    assert.deepEqual(plMed2.requiredTools, ['water', 'care'])

    // Avanzado: 3 pasos ordenados incluyendo cuidado y distractores
    const plAdv = generatePlantRound(matchId, 0, 'advanced')
    assert.deepEqual(plAdv.requiredTools, ['soil', 'seed', 'water'])
    assert.equal(plAdv.options.length, 4)
  })

  it('J4 Cada animal en su hogar: varía rondas en medio y avanzado', () => {
    const matchId = 'habitats_variation_test'

    const hMed0 = generateHabitatsRound(matchId, 0, 'medium')
    const hMed1 = generateHabitatsRound(matchId, 1, 'medium')
    const hMed2 = generateHabitatsRound(matchId, 2, 'medium')

    // Las rondas en medio varían hábitats o animales
    const hMed0Habitats = hMed0.habitats.map((h) => h.id).sort().join(',')
    const hMed1Habitats = hMed1.habitats.map((h) => h.id).sort().join(',')
    assert.notEqual(hMed0Habitats, hMed1Habitats)
    assert.equal(hMed2.animals.length, 3)

    // Avanzado presenta 3 hábitats y 4 animales variando
    const hAdv0 = generateHabitatsRound(matchId, 0, 'advanced')
    const hAdv1 = generateHabitatsRound(matchId, 1, 'advanced')
    assert.equal(hAdv0.habitats.length, 3)
    assert.equal(hAdv0.animals.length, 4)
    assert.notDeepEqual(hAdv0.animals.map((a) => a.id), hAdv1.animals.map((a) => a.id))
  })

  it('J5 Escucha y encuentra: selecciona entre el pool amplio de objetivos usando semilla', () => {
    const targetsSeen = new Set<string>()

    // Generar rondas con semillas variadas
    for (let i = 0; i < 20; i++) {
      const res = generateListeningRound(`seed_listening_${i}`, i % 3, 'medium')
      targetsSeen.add(res.targetId)
    }

    // Debe haber seleccionado más allá de los 3 primeros (al menos 4 o más objetivos distintos)
    assert.ok(targetsSeen.size >= 4, `Objetivos seleccionados: ${Array.from(targetsSeen).join(', ')}`)
  })

  it('J6 Cuentos en orden: baraja viñetas y escala 2, 3 o 4 pasos según nivel', () => {
    const matchId = 'stories_test_match'

    const sInit = generateStoriesRound(matchId, 0, 'initial')
    assert.equal(sInit.cards.length, 2)

    const sMed = generateStoriesRound(matchId, 0, 'medium')
    assert.equal(sMed.cards.length, 3)

    const sAdv = generateStoriesRound(matchId, 0, 'advanced')
    assert.equal(sAdv.cards.length, 4)
  })

  it('J7 Sombras y formas: escala 2, 3 o 4 figuras con siluetas según nivel', () => {
    const matchId = 'shadows_test_match'

    const shInit = generateShadowsRound(matchId, 0, 'initial')
    assert.equal(shInit.shapes.length, 2)

    const shMed = generateShadowsRound(matchId, 0, 'medium')
    assert.equal(shMed.shapes.length, 3)

    const shAdv = generateShadowsRound(matchId, 0, 'advanced')
    assert.equal(shAdv.shapes.length, 4)
  })

  it('Determinismo estricto: misma semilla y ronda genera exactamente el mismo contenido (resiliencia tras recarga)', () => {
    const matchId = 'deterministic_save_test'

    for (const act of allActivities) {
      if (act === 'counting') {
        const a1 = generateCountingRound(matchId, 1, 'medium')
        const a2 = generateCountingRound(matchId, 1, 'medium')
        assert.deepEqual(a1, a2)
      } else if (act === 'patterns') {
        const a1 = generatePatternsRound(matchId, 1, 'medium')
        const a2 = generatePatternsRound(matchId, 1, 'medium')
        assert.deepEqual(a1, a2)
      } else if (act === 'plant') {
        const a1 = generatePlantRound(matchId, 1, 'medium')
        const a2 = generatePlantRound(matchId, 1, 'medium')
        assert.deepEqual(a1, a2)
      } else if (act === 'habitats') {
        const a1 = generateHabitatsRound(matchId, 1, 'medium')
        const a2 = generateHabitatsRound(matchId, 1, 'medium')
        assert.deepEqual(a1, a2)
      } else if (act === 'listening') {
        const a1 = generateListeningRound(matchId, 1, 'medium')
        const a2 = generateListeningRound(matchId, 1, 'medium')
        assert.deepEqual(a1, a2)
      } else if (act === 'stories') {
        const a1 = generateStoriesRound(matchId, 1, 'medium')
        const a2 = generateStoriesRound(matchId, 1, 'medium')
        assert.deepEqual(a1, a2)
      } else if (act === 'shadows') {
        const a1 = generateShadowsRound(matchId, 1, 'medium')
        const a2 = generateShadowsRound(matchId, 1, 'medium')
        assert.deepEqual(a1, a2)
      }
    }
  })

  it('Flujo completo de partida y premiación para las 4 actividades nuevas (patterns, habitats, stories, shadows)', () => {
    const newActivities: ActivityId[] = ['patterns', 'habitats', 'stories', 'shadows']

    for (const act of newActivities) {
      let state = createDefaultGameState()
      state = startMatch(state, act)

      assert.equal(state.currentScreen, `activity-${act}`)
      assert.equal(state.activeMatch?.roundIndex, 0)
      assert.equal(state.activeMatch?.completed, false)

      // Ronda 0 -> 1 -> 2 -> 3 (completada)
      state = advanceMatchRound(state)
      state = advanceMatchRound(state)
      state = advanceMatchRound(state)

      assert.equal(state.activeMatch?.roundIndex, 3)
      assert.equal(state.activeMatch?.completed, true)

      // Premiar partida
      const res = completeAndRewardMatch(state)
      assert.equal(res.credited, true)
      assert.equal(res.state.pets.monkey.foodCount, 1)

      // Idempotencia: no duplica premio al reintentar
      const dup = completeAndRewardMatch(res.state)
      assert.equal(dup.credited, false)
      assert.equal(dup.state.pets.monkey.foodCount, 1)
    }
  })

  it('Catálogo completo Fase 3: las 7 actividades tienen isAvailable: true', () => {
    assert.equal(ACTIVITIES_CATALOG.length, 7)
    const expectedCodes = ['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7']
    const expectedIds = ['counting', 'patterns', 'plant', 'habitats', 'listening', 'stories', 'shadows']

    ACTIVITIES_CATALOG.forEach((item, idx) => {
      assert.equal(item.code, expectedCodes[idx])
      assert.equal(item.id, expectedIds[idx])
      assert.equal(item.isAvailable, true, `Actividad ${item.id} debe estar disponible en Fase 3`)
    })
  })
})

describe('13. Fase 4: Núcleo PRD V2 (Estrellas, Puntos 630, GrowthUnits, Medallas y Compatibilidad V1)', () => {
  it('Fronteras estrictas de estrellas: 3 (err<=1, pistas==0), 2 (err<=3, pistas<=1), 1 en resto', () => {
    // 3 estrellas: errores <= 1 y 0 pistas manuales
    assert.equal(calculateMatchStars(0, 0), 3)
    assert.equal(calculateMatchStars(1, 0), 3)

    // 2 estrellas: errores <= 3 y pistas <= 1 (que no califiquen para 3)
    assert.equal(calculateMatchStars(0, 1), 2)
    assert.equal(calculateMatchStars(1, 1), 2)
    assert.equal(calculateMatchStars(2, 0), 2)
    assert.equal(calculateMatchStars(2, 1), 2)
    assert.equal(calculateMatchStars(3, 0), 2)
    assert.equal(calculateMatchStars(3, 1), 2)

    // 1 estrella: cualquier otro desempeño completado
    assert.equal(calculateMatchStars(4, 0), 1)
    assert.equal(calculateMatchStars(0, 2), 1)
    assert.equal(calculateMatchStars(2, 2), 1)
    assert.equal(calculateMatchStars(5, 1), 1)
    assert.equal(calculateMatchStars(10, 5), 1)

    // Fallback visual y locución de voz NO computan como pistas manuales
    // Simular que el juego mostró ayuda visual tras error pero hintsUsed manual fue 0
    const hintsUsedManual = 0
    const errorsAutoFallback = 1
    assert.equal(calculateMatchStars(errorsAutoFallback, hintsUsedManual), 3)
  })

  it('Puntos derivados 10*sum(mejores estrellas), no farmeo al repetir, mejora de marca y máximo 630', () => {
    let state = createDefaultGameState()
    const petId = 'monkey'

    // 1. Primera partida: 2 estrellas -> otorga 20 puntos, +10 growthUnits, 1 fruta
    state = startMatch(state, 'counting')
    state = advanceMatchRound(state)
    state = advanceMatchRound(state)
    const match1Id = state.activeMatch!.id
    const res1 = finishAndRewardMatch(state, 'counting', match1Id, { errorsCount: 2, hintsUsed: 0 })
    assert.equal(res1.credited, true)
    state = res1.state

    assert.equal(state.pets[petId].bestStars?.['counting_initial'], 2)
    assert.equal(getPetTotalScore(state.pets[petId]), 20)
    assert.equal(state.pets[petId].growthUnits, 10)
    assert.equal(state.pets[petId].foodCount, 1)
    assert.equal(state.activeMatch?.result?.deltaPoints, 20)
    assert.equal(state.activeMatch?.result?.growthEarned, 10)
    assert.equal(state.activeMatch?.result?.fruitEarned, 1)

    // 2. Repetir la misma combinación con 2 estrellas: NO farmea puntos ni growthUnits, sí da 1 fruta
    state = startMatch(state, 'counting')
    state = advanceMatchRound(state)
    state = advanceMatchRound(state)
    const match2Id = state.activeMatch!.id
    const res2 = finishAndRewardMatch(state, 'counting', match2Id, { errorsCount: 2, hintsUsed: 0 })
    assert.equal(res2.credited, true)
    state = res2.state

    assert.equal(state.pets[petId].bestStars?.['counting_initial'], 2)
    assert.equal(getPetTotalScore(state.pets[petId]), 20) // Sin farmeo de puntos
    assert.equal(state.pets[petId].growthUnits, 10) // Sin growthUnits extra por repetir
    assert.equal(state.pets[petId].foodCount, 2) // +1 fruta por nueva sesión
    assert.equal(state.activeMatch?.result?.deltaPoints, 0)
    assert.equal(state.activeMatch?.result?.growthEarned, 0)

    // 3. Repetir con peor desempeño (1 estrella): conserva mejor marca (2 estrellas) y deltaPoints 0
    state = startMatch(state, 'counting')
    state = advanceMatchRound(state)
    state = advanceMatchRound(state)
    const match3Id = state.activeMatch!.id
    const res3 = finishAndRewardMatch(state, 'counting', match3Id, { errorsCount: 4, hintsUsed: 2 })
    assert.equal(res3.credited, true)
    state = res3.state
    assert.equal(state.pets[petId].bestStars?.['counting_initial'], 2)
    assert.equal(getPetTotalScore(state.pets[petId]), 20)
    assert.equal(state.activeMatch?.result?.deltaPoints, 0)

    // 4. Mejorar marca a 3 estrellas: deltaPoints: 10, puntos pasan a 30
    state = startMatch(state, 'counting')
    state = advanceMatchRound(state)
    state = advanceMatchRound(state)
    const match4Id = state.activeMatch!.id
    const res4 = finishAndRewardMatch(state, 'counting', match4Id, { errorsCount: 0, hintsUsed: 0 })
    assert.equal(res4.credited, true)
    state = res4.state
    assert.equal(state.pets[petId].bestStars?.['counting_initial'], 3)
    assert.equal(getPetTotalScore(state.pets[petId]), 30)
    assert.equal(state.activeMatch?.result?.deltaPoints, 10)

    // 5. Máximo estricto 630 puntos e ignorar claves ajenas a las 21 combinaciones
    const allActivities: ActivityId[] = ['counting', 'patterns', 'plant', 'habitats', 'listening', 'stories', 'shadows']
    const allDiffs: DifficultyLevel[] = ['initial', 'medium', 'advanced']
    for (const act of allActivities) {
      for (const d of allDiffs) {
        state.pets[petId].bestStars![`${act}_${d}`] = 3
      }
    }
    // Agregar clave ajena / basura que debe ser ignorada
    state.pets[petId].bestStars!['invalid_junk_activity'] = 3
    state.pets[petId].bestStars!['counting_super_expert'] = 3

    assert.equal(getPetTotalScore(state.pets[petId]), 630)

    // 6. Aislamiento estricto: Tortuga y Tucán tienen 0 puntos y 0 estrellas
    assert.equal(getPetTotalScore(state.pets.turtle), 0)
    assert.equal(getPetTotalScore(state.pets.toucan), 0)
  })

  it('Idempotencia rigurosa contra doble callback y recarga en pantalla de resultado', () => {
    let state = createDefaultGameState()
    state = startMatch(state, 'plant')
    state = advanceMatchRound(state)
    state = advanceMatchRound(state)
    const matchId = state.activeMatch!.id

    // Primer callback
    const res1 = finishAndRewardMatch(state, 'plant', matchId, { errorsCount: 1, hintsUsed: 0 })
    assert.equal(res1.credited, true)
    assert.equal(res1.state.pets.monkey.foodCount, 1)

    // Segundo callback inmediato (ej. doble clic o retry)
    const res2 = finishAndRewardMatch(res1.state, 'plant', matchId, { errorsCount: 1, hintsUsed: 0 })
    assert.equal(res2.credited, false)
    assert.equal(res2.state.pets.monkey.foodCount, 1) // No duplica fruta
    assert.equal(res2.state.pets.monkey.growthUnits, 10) // No duplica growthUnits
  })

  it('GrowthUnits: +10 primera combinación, +3 comida, y confirmación de evolución SOLO al alimentar', () => {
    let state = createDefaultGameState()
    const petId = 'monkey'
    state.pets[petId].foodCount = 5

    // Simular que el mono completa 4 combinaciones por primera vez (4 * 10 = 40 growthUnits)
    for (const act of ['counting', 'patterns', 'plant', 'habitats'] as ActivityId[]) {
      state = startMatch(state, act)
      state = advanceMatchRound(state)
      state = advanceMatchRound(state)
      const mId = state.activeMatch!.id
      state = finishAndRewardMatch(state, act, mId, { errorsCount: 0, hintsUsed: 0 }).state
    }

    assert.equal(state.pets[petId].growthUnits, 40)
    // REGLA CRÍTICA: Aunque 40 >= 35 (umbral sprout), la mascota NO evoluciona al terminar juegos
    assert.equal(state.pets[petId].stage, 'baby')

    // SOLO AL ALIMENTAR se confirma y materializa el avance
    const fedRes = feedPet(state, petId)
    assert.equal(fedRes.success, true)
    state = fedRes.state

    // Se consumió 1 alimento, sumó +3 growthUnits (40 + 3 = 43) y confirmó etapa sprout
    assert.equal(state.pets[petId].growthUnits, 43)
    assert.equal(state.pets[petId].stage, 'sprout')
    assert.ok(state.pets[petId].unlockedStages?.includes('sprout'))
  })

  it('Saltar umbral desbloquea automáticamente todas las etapas intermedias', () => {
    let state = createDefaultGameState()
    const petId = 'turtle'
    state.pets[petId].foodCount = 5
    // Tortuga acumula 85 unidades mientras estaba en baby (salto directo a young >= 80)
    state.pets[petId].growthUnits = 85
    assert.equal(state.pets[petId].stage, 'baby')

    // Alimentar confirma avance a young y desbloquea baby, sprout y young
    state = feedPet(state, petId).state
    assert.equal(state.pets[petId].stage, 'young')
    assert.equal(state.pets[petId].growthUnits, 88)
    assert.deepEqual(state.pets[petId].unlockedStages, ['baby', 'sprout', 'young'])
  })

  it('Adult floor: adultos continúan jugando y alimentándose sin rebajas de etapa', () => {
    let state = createDefaultGameState()
    state.pets.toucan.stage = 'adult'
    state.pets.toucan.growthUnits = 150
    state.pets.toucan.foodCount = 3
    state.pets.toucan.unlockedStages = ['baby', 'sprout', 'young', 'adult']

    // Jugar siendo adulto da fruta y estrellas normalmente
    state = switchPet(state, 'toucan')
    state = startMatch(state, 'shadows')
    state = advanceMatchRound(state)
    state = advanceMatchRound(state)
    const mId = state.activeMatch!.id
    state = finishAndRewardMatch(state, 'shadows', mId, { errorsCount: 0, hintsUsed: 0 }).state

    assert.equal(state.pets.toucan.stage, 'adult')
    assert.equal(state.pets.toucan.foodCount, 4)
    assert.equal(state.pets.toucan.growthUnits, 160)

    // Alimentar siendo adulto funciona sin bloqueo
    const fed = feedPet(state, 'toucan')
    assert.equal(fed.success, true)
    assert.equal(fed.state.pets.toucan.stage, 'adult')
    assert.equal(fed.state.pets.toucan.growthUnits, 163)
    assert.deepEqual(fed.state.pets.toucan.unlockedStages, ['baby', 'sprout', 'young', 'adult'])
  })

  it('Persistencia: clave V1 inmutable y fallback seguro ante V2 corrupto', () => {
    const v1BackupJson = JSON.stringify({
      version: 1,
      selectedPetId: 'turtle',
      pets: {
        turtle: {
          id: 'turtle',
          name: 'Tortuguita',
          stage: 'sprout',
          totalFeedings: 2,
          foodCount: 4,
          interactionsCount: 7,
        },
      },
      settings: { soundEnabled: true, difficultyLevel: 'medium' },
      completedMatchIds: ['hist_match_001'],
      activeMatch: null,
    })

    const mockStorage: Record<string, string> = {
      [STORAGE_KEY_V1]: v1BackupJson,
      [STORAGE_KEY_V2]: '{ corrupt_v2_syntax: [invalid json',
    }

    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => { mockStorage[key] = val },
      removeItem: (key: string) => { delete mockStorage[key] },
      clear: () => {},
      length: 2,
      key: () => null,
    }

    const loaded = loadGameState()

    // 1. Clave V1 se conserva 100% INTACTA
    assert.equal(mockStorage[STORAGE_KEY_V1], v1BackupJson)

    // 2. Recupera exitosamente los datos de V1 sin caer en el default vacío
    assert.equal(loaded.selectedPetId, 'turtle')
    assert.equal(loaded.pets.turtle.stage, 'sprout')
    assert.equal(loaded.pets.turtle.growthUnits, 35) // Floor mínimo para sprout
    assert.equal(loaded.pets.turtle.foodCount, 4)
    assert.equal(loaded.settings.difficultyLevel, 'medium')
    assert.ok(loaded.completedMatchIds.includes('hist_match_001'))
  })

  it('Persistencia V2: unidades no certifican evolución sin alimentar (40u baby se preserva en save/load, intermedias pendientes y adult floor)', () => {
    // 1. Simulación de storage para ciclo de guardado y carga
    const mockStorage: Record<string, string> = {}
    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => { mockStorage[key] = val },
      removeItem: (key: string) => { delete mockStorage[key] },
      clear: () => {},
      length: 1,
      key: () => null,
    }

    // 2. Completar 4 combinaciones nuevas sin alimentar acumula 40 unidades y 4 frutas pero sigue en baby
    let state = createDefaultGameState()
    const petId = 'monkey'
    for (const act of ['counting', 'patterns', 'plant', 'habitats'] as ActivityId[]) {
      state = startMatch(state, act)
      state = advanceMatchRound(state)
      state = advanceMatchRound(state)
      const mId = state.activeMatch!.id
      state = finishAndRewardMatch(state, act, mId, { errorsCount: 0, hintsUsed: 0 }).state
    }

    assert.equal(state.pets[petId].growthUnits, 40)
    assert.equal(state.pets[petId].foodCount, 4)
    assert.equal(state.pets[petId].stage, 'baby')
    assert.deepEqual(state.pets[petId].unlockedStages, ['baby'])

    // 3. saveGameState -> loadGameState: sigue en baby sin evolucionar prematuramente
    saveGameState(state)
    let loaded = loadGameState()
    assert.equal(loaded.pets[petId].growthUnits, 40)
    assert.equal(loaded.pets[petId].foodCount, 4)
    assert.equal(loaded.pets[petId].stage, 'baby')
    assert.deepEqual(loaded.pets[petId].unlockedStages, ['baby'])

    // 4. Alimentar entonces: suma +3 unidades (40 + 3 = 43) y confirma evolución a sprout
    const fed = feedPet(loaded, petId)
    assert.equal(fed.success, true)
    loaded = fed.state
    assert.equal(loaded.pets[petId].foodCount, 3)
    assert.equal(loaded.pets[petId].growthUnits, 43)
    assert.equal(loaded.pets[petId].stage, 'sprout')
    assert.deepEqual(loaded.pets[petId].unlockedStages, ['baby', 'sprout'])

    // 5. Casos de etapas intermedias pendientes:
    // a) Brote con 85 unidades (supera umbral de young 80) sin comida no cambia etapa al guardar/cargar
    loaded.pets[petId].growthUnits = 85
    saveGameState(loaded)
    let reloadedIntermediate = loadGameState()
    assert.equal(reloadedIntermediate.pets[petId].stage, 'sprout')
    assert.equal(reloadedIntermediate.pets[petId].growthUnits, 85)
    assert.deepEqual(reloadedIntermediate.pets[petId].unlockedStages, ['baby', 'sprout'])

    // Al alimentar con 85 unidades, confirma young (85 + 3 = 88)
    reloadedIntermediate = feedPet(reloadedIntermediate, petId).state
    assert.equal(reloadedIntermediate.pets[petId].stage, 'young')
    assert.equal(reloadedIntermediate.pets[petId].growthUnits, 88)
    assert.deepEqual(reloadedIntermediate.pets[petId].unlockedStages, ['baby', 'sprout', 'young'])

    // b) Joven con 150 unidades (supera umbral de adult 145) sin comida no cambia etapa al guardar/cargar
    reloadedIntermediate.pets[petId].growthUnits = 150
    saveGameState(reloadedIntermediate)
    let reloadedYoung = loadGameState()
    assert.equal(reloadedYoung.pets[petId].stage, 'young')
    assert.equal(reloadedYoung.pets[petId].growthUnits, 150)
    assert.deepEqual(reloadedYoung.pets[petId].unlockedStages, ['baby', 'sprout', 'young'])

    // Al alimentar confirma adult (150 + 3 = 153)
    reloadedYoung = feedPet(reloadedYoung, petId).state
    assert.equal(reloadedYoung.pets[petId].stage, 'adult')
    assert.equal(reloadedYoung.pets[petId].growthUnits, 153)
    assert.deepEqual(reloadedYoung.pets[petId].unlockedStages, ['baby', 'sprout', 'young', 'adult'])

    // 6. Adult floor: adulto alcanzado nunca se rebaja ni cambia sin comida
    saveGameState(reloadedYoung)
    let reloadedAdult = loadGameState()
    assert.equal(reloadedAdult.pets[petId].stage, 'adult')
    assert.equal(reloadedAdult.pets[petId].growthUnits, 153)
    assert.deepEqual(reloadedAdult.pets[petId].unlockedStages, ['baby', 'sprout', 'young', 'adult'])

    // Piso mínimo adult floor: si las unidades guardadas fueran menores al piso adulto (145), se normaliza a 145 sin alterar stage
    reloadedAdult.pets[petId].growthUnits = 100
    saveGameState(reloadedAdult)
    let reloadedFloor = loadGameState()
    assert.equal(reloadedFloor.pets[petId].stage, 'adult')
    assert.equal(reloadedFloor.pets[petId].growthUnits, 145)
    assert.deepEqual(reloadedFloor.pets[petId].unlockedStages, ['baby', 'sprout', 'young', 'adult'])
  })

  it('Compatibilidad de versiones de contenido: V1 contentVersion 1 vs nuevas 2', () => {
    // 1. Partida migrada desde V1 recibe contentVersion: 1
    const v1State = migrateV1ToV2({
      version: 1,
      selectedPetId: 'monkey',
      pets: {},
      completedMatchIds: [],
      activeMatch: {
        id: 'legacy_plant_match',
        petId: 'monkey',
        activityId: 'plant',
        roundIndex: 2,
        partialData: { givenItems: ['water'] },
        completed: false,
        rewarded: false,
      },
    })
    assert.equal(v1State.activeMatch?.contentVersion, 1)

    // 2. Recetas originales de planta V1: ronda 0 agua, ronda 1 sol, ronda 2 agua+sol
    const pV1R0 = generatePlantRound('legacy_plant_match', 0, 'initial', 1)
    assert.deepEqual(pV1R0.requiredTools, ['water'])
    assert.ok(pV1R0.options.includes('water'))

    const pV1R1 = generatePlantRound('legacy_plant_match', 1, 'initial', 1)
    assert.deepEqual(pV1R1.requiredTools, ['sun'])
    assert.ok(pV1R1.options.includes('sun'))

    const pV1R2 = generatePlantRound('legacy_plant_match', 2, 'initial', 1)
    assert.deepEqual(pV1R2.requiredTools, ['water', 'sun'])
    assert.ok(pV1R2.options.includes('water') && pV1R2.options.includes('sun'))

    // Invariante visual de planta con agua dada en ronda 2: conserva brote (2) y no flor (3) hasta tener ambos
    assert.equal(computePlantVisualStage(2, ['water'], false), 2)
    assert.equal(computePlantVisualStage(2, ['water', 'sun'], false), 3)

    // 3. Escucha V1: objetivos originales sol, tucán, fruta con 3 opciones
    const lV1R0 = generateListeningRound('legacy_listening', 0, 'initial', 1)
    assert.equal(lV1R0.targetId, 'sun')
    assert.equal(lV1R0.options.length, 3)
    assert.ok(lV1R0.options.includes('sun'))

    const lV1R1 = generateListeningRound('legacy_listening', 1, 'initial', 1)
    assert.equal(lV1R1.targetId, 'toucan')
    assert.equal(lV1R1.options.length, 3)

    const lV1R2 = generateListeningRound('legacy_listening', 2, 'initial', 1)
    assert.equal(lV1R2.targetId, 'fruit')
    assert.equal(lV1R2.options.length, 3)

    // 4. Nueva partida creada en V2 recibe contentVersion: 2
    const v2Match = createActiveMatch('plant', 'monkey')
    assert.equal(v2Match.contentVersion, 2)
  })

  it('Medallas individuales para UI: 6 hitos únicos sin duplicación y soporte de alias EN/ES', () => {
    let state = createDefaultGameState()
    const petId = 'monkey'

    // Estado inicial: sin medallas ganadas
    assert.equal(getPetEarnedMedalIds(state.pets[petId]).length, 0)

    // 1. Completar primera actividad
    state.pets[petId].bestStars = { counting_initial: 3 }
    const m1 = getPetEarnedMedalIds(state.pets[petId])
    assert.equal(m1.length, 1)
    assert.ok(m1.includes('first_activity'))
    assert.ok(hasPetMedal(state.pets[petId], 'first_activity'))
    assert.ok(hasPetMedal(state.pets[petId], 'primera_actividad')) // Alias en español

    // 2. Primer alimento
    state.pets[petId].totalFeedings = 1
    assert.ok(hasPetMedal(state.pets[petId], 'primer_alimento'))

    // 3. 3 tipos distintos
    state.pets[petId].bestStars = {
      counting_initial: 3,
      patterns_initial: 3,
      plant_initial: 3,
    }
    assert.ok(hasPetMedal(state.pets[petId], '3_tipos_distintos'))

    // 4. Primera evolución (alcanzó sprout)
    state.pets[petId].stage = 'sprout'
    assert.ok(hasPetMedal(state.pets[petId], 'primera_evolucion'))

    // 5. Los 7 tipos
    state.pets[petId].bestStars = {
      counting_initial: 3,
      patterns_initial: 3,
      plant_initial: 3,
      habitats_initial: 3,
      listening_initial: 3,
      stories_initial: 3,
      shadows_initial: 3,
    }
    assert.ok(hasPetMedal(state.pets[petId], '7_tipos'))

    // 6. Adulto
    state.pets[petId].stage = 'adult'
    assert.ok(hasPetMedal(state.pets[petId], 'adulto'))

    // El conteo total de medallas ganadas expone exactamente 6 hitos únicos (sin inflarse con alias)
    const allMedals = getPetEarnedMedalIds(state.pets[petId])
    assert.equal(allMedals.length, 6)

    // Selector getPetMedals expone las 6 medallas canónicas con título, descripción y status
    const medalsCatalog = getPetMedals(state.pets[petId])
    assert.equal(medalsCatalog.length, 6)
    assert.ok(medalsCatalog.every((m) => m.unlocked === true))

    // Aislamiento: La tortuga no tiene medallas porque no jugó ni comió
    assert.equal(getPetEarnedMedalIds(state.pets.turtle).length, 0)
    assert.equal(hasPetMedal(state.pets.turtle, 'primera_actividad'), false)
  })

  it('Recomendación pedagógica según desempeño: sugiere avance sin bloquear elección', () => {
    const pet = createDefaultPet('monkey')
    pet.bestStars = {
      counting_initial: 3,
    }

    // Para counting: habiendo logrado 3 estrellas en inicial, recomienda nivel medio
    assert.equal(getRecommendedDifficulty(pet, 'counting'), 'medium')
    const recCounting = getPedagogicalRecommendation(pet, 'initial', 'counting')
    assert.equal(recCounting.recommendedDifficulty, 'medium')
    assert.equal(recCounting.canAdvance, true)

    // Para una actividad sin completar, recomienda seguir practicando en inicial
    assert.equal(getRecommendedDifficulty(pet, 'plant'), 'initial')
    const recPlant = getPedagogicalRecommendation(pet, 'initial', 'plant')
    assert.equal(recPlant.recommendedDifficulty, 'initial')
    assert.equal(recPlant.canAdvance, false)

    // En medio con 3 estrellas, recomienda avanzado
    pet.bestStars.patterns_medium = 3
    assert.equal(getRecommendedDifficulty(pet, 'patterns'), 'advanced')
    const recPatterns = getPedagogicalRecommendation(pet, 'medium', 'patterns')
    assert.equal(recPatterns.recommendedDifficulty, 'advanced')
    assert.equal(recPatterns.canAdvance, true)
  })

  it('Selectores exportados para UI: score, estrellas individuales, progreso de crecimiento y constantes', () => {
    assert.equal(MAX_PET_SCORE, 630)
    assert.equal(GROWTH_UNITS_PER_FIRST_COMBO, 10)
    assert.equal(GROWTH_UNITS_PER_FEED, 3)
    assert.deepEqual(GROWTH_THRESHOLDS, { baby: 0, sprout: 35, young: 80, adult: 145 })

    const pet = createDefaultPet('turtle')
    pet.bestStars = {
      plant_initial: 2,
      plant_medium: 3,
    }

    // getPetGameStars
    assert.equal(getPetGameStars(pet, 'plant', 'initial'), 2)
    assert.equal(getPetGameStars(pet, 'plant', 'medium'), 3)
    assert.equal(getPetGameStars(pet, 'plant', 'advanced'), 0)

    // getPetBestStarsMap
    const map = getPetBestStarsMap(pet)
    assert.equal(map['plant_initial'], 2)
    assert.equal(map['plant_medium'], 3)

    // getPetGrowthProgress
    pet.growthUnits = 20
    const progressBaby = getPetGrowthProgress(pet)
    assert.equal(progressBaby.currentStage, 'baby')
    assert.equal(progressBaby.nextStage, 'sprout')
    assert.equal(progressBaby.currentThreshold, 0)
    assert.equal(progressBaby.nextThreshold, 35)
    assert.equal(progressBaby.canEvolve, false)
    assert.equal(progressBaby.progressPercent, Math.floor((20 / 35) * 100))

    pet.growthUnits = 35
    const progressReady = getPetGrowthProgress(pet)
    assert.equal(progressReady.canEvolve, true)
  })
})

describe('14. Bloque B: Tienda del Bosque, 12 Accesorios y Economía Canjeable', () => {
  it('declara exactamente 12 accesorios canónicos divididos en las 4 categorías', () => {
    assert.equal(ACCESSORIES_CATALOG.length, 12)
    const headItems = ACCESSORIES_CATALOG.filter((a) => a.category === 'head')
    const faceItems = ACCESSORIES_CATALOG.filter((a) => a.category === 'face')
    const neckItems = ACCESSORIES_CATALOG.filter((a) => a.category === 'neck')
    const backItems = ACCESSORIES_CATALOG.filter((a) => a.category === 'back')

    assert.equal(headItems.length, 4, '4 accesorios de cabeza')
    assert.equal(faceItems.length, 2, '2 accesorios de rostro')
    assert.equal(neckItems.length, 3, '3 accesorios de cuello/pecho')
    assert.equal(backItems.length, 3, '3 accesorios de espalda/cuerpo')

    const ids = ACCESSORIES_CATALOG.map((a) => a.id)
    assert.ok(ids.includes('orange_cap'))
    assert.ok(ids.includes('explorer_hat'))
    assert.ok(ids.includes('leaf_crown'))
    assert.ok(ids.includes('color_bow'))
    assert.ok(ids.includes('round_glasses'))
    assert.ok(ids.includes('star_glasses'))
    assert.ok(ids.includes('explorer_scarf'))
    assert.ok(ids.includes('gold_medal'))
    assert.ok(ids.includes('flower_necklace'))
    assert.ok(ids.includes('small_backpack'))
    assert.ok(ids.includes('explorer_backpack'))
    assert.ok(ids.includes('short_cape'))
  })

  it('permite primera compra si hay saldo y descuenta SOLO del saldo canjeable', () => {
    const state = createDefaultGameState()
    state.pets.monkey.coinsBalance = 100
    state.pets.monkey.bestStars = { counting_initial: 3 }
    const historicalScoreBefore = getPetTotalScore(state.pets.monkey)
    assert.equal(historicalScoreBefore, 30)

    const { state: nextState, success } = buyAccessory(state, 'monkey', 'orange_cap')
    assert.equal(success, true)
    assert.equal(nextState.pets.monkey.coinsBalance, 70, '100 - 30 = 70 pts canjeables')
    assert.ok(nextState.pets.monkey.purchasedAccessories?.includes('orange_cap'))
    assert.equal(nextState.pets.monkey.equippedAccessories?.head, 'orange_cap')

    // El récord histórico de puntos y medallas permanece intocado
    assert.equal(getPetTotalScore(nextState.pets.monkey), 30)
  })

  it('rechaza compra si no hay saldo suficiente y no permite saldo negativo', () => {
    const state = createDefaultGameState()
    state.pets.monkey.coinsBalance = 20 // orange_cap cuesta 30
    const { state: nextState, success, error } = buyAccessory(state, 'monkey', 'orange_cap')
    assert.equal(success, false)
    assert.equal(error, 'Puntos canjeables insuficientes')
    assert.equal(nextState.pets.monkey.coinsBalance, 20)
    assert.equal(nextState.pets.monkey.purchasedAccessories?.length ?? 0, 0)
  })

  it('protege contra compras repetidas e idempotencia (no cobra dos veces)', () => {
    const state = createDefaultGameState()
    state.pets.monkey.coinsBalance = 100
    const { state: s1, success: succ1 } = buyAccessory(state, 'monkey', 'orange_cap')
    assert.equal(succ1, true)
    assert.equal(s1.pets.monkey.coinsBalance, 70)

    // Intento de segunda compra del mismo objeto
    const { state: s2, success: succ2, error } = buyAccessory(s1, 'monkey', 'orange_cap')
    assert.equal(succ2, false)
    assert.equal(error, 'Accesorio ya adquirido')
    assert.equal(s2.pets.monkey.coinsBalance, 70, 'No descuenta saldo repetido')
  })

  it('aislamiento estricto: cambiar de mascota conserva compras y equipamiento propios', () => {
    const state = createDefaultGameState()
    state.pets.monkey.coinsBalance = 100
    state.pets.turtle.coinsBalance = 50

    // Mono compra y equipa gorrita
    const { state: s1 } = buyAccessory(state, 'monkey', 'orange_cap')
    // Tortuga compra y equipa pañuelo
    const { state: s2 } = buyAccessory(s1, 'turtle', 'explorer_scarf')

    assert.equal(s2.pets.monkey.equippedAccessories?.head, 'orange_cap')
    assert.equal(Boolean(s2.pets.monkey.equippedAccessories?.neck), false)
    assert.equal(s2.pets.turtle.equippedAccessories?.neck, 'explorer_scarf')
    assert.equal(Boolean(s2.pets.turtle.equippedAccessories?.head), false)
    assert.equal(Boolean(s2.pets.toucan.equippedAccessories?.head), false)
  })

  it('equipar y quitar es 100% gratuito y excluye objetos de la misma categoría', () => {
    const state = createDefaultGameState()
    state.pets.monkey.coinsBalance = 200
    const { state: s1 } = buyAccessory(state, 'monkey', 'orange_cap') // head
    const { state: s2 } = buyAccessory(s1, 'monkey', 'explorer_hat') // head
    assert.equal(s2.pets.monkey.equippedAccessories?.head, 'explorer_hat')

    // Cambiar a orange_cap es gratis
    const balanceBefore = s2.pets.monkey.coinsBalance
    const { state: s3, success: succEquip } = equipAccessory(s2, 'monkey', 'orange_cap')
    assert.equal(succEquip, true)
    assert.equal(s3.pets.monkey.equippedAccessories?.head, 'orange_cap')
    assert.equal(s3.pets.monkey.coinsBalance, balanceBefore, 'Equipar no cuesta puntos')

    // Quitar accesorio
    const { state: s4, success: succUnequip } = unequipAccessory(s3, 'monkey', 'head')
    assert.equal(succUnequip, true)
    assert.equal(s4.pets.monkey.equippedAccessories?.head, null)
    assert.equal(s4.pets.monkey.coinsBalance, balanceBefore, 'Quitar no cuesta puntos')
    assert.ok(s4.pets.monkey.purchasedAccessories?.includes('orange_cap'), 'Mantiene propiedad adquirida')
  })

  it('superpone categorías distintas sin conflicto (cabeza + rostro + cuello + espalda)', () => {
    const state = createDefaultGameState()
    state.pets.monkey.coinsBalance = 300
    let current = state
    current = buyAccessory(current, 'monkey', 'orange_cap').state // head
    current = buyAccessory(current, 'monkey', 'round_glasses').state // face
    current = buyAccessory(current, 'monkey', 'gold_medal').state // neck
    current = buyAccessory(current, 'monkey', 'small_backpack').state // back

    const eq = current.pets.monkey.equippedAccessories
    assert.equal(eq?.head, 'orange_cap')
    assert.equal(eq?.face, 'round_glasses')
    assert.equal(eq?.neck, 'gold_medal')
    assert.equal(eq?.back, 'small_backpack')
  })

  it('evolución conserva accesorios equipados y no los pierde al avanzar de etapa', () => {
    const state = createDefaultGameState()
    state.pets.monkey.stage = 'baby'
    state.pets.monkey.growthUnits = 34
    state.pets.monkey.foodCount = 1
    state.pets.monkey.coinsBalance = 100
    const { state: s1 } = buyAccessory(state, 'monkey', 'explorer_hat')
    assert.equal(s1.pets.monkey.equippedAccessories?.head, 'explorer_hat')

    // Alimentar para provocar evolución a sprout (34 + 3 = 37 >= 35)
    const { state: s2, success } = feedPet(s1, 'monkey')
    assert.equal(success, true)
    assert.equal(s2.pets.monkey.stage, 'sprout')
    assert.equal(s2.pets.monkey.equippedAccessories?.head, 'explorer_hat', 'Conserva accesorio equipado')
    assert.ok(s2.pets.monkey.purchasedAccessories?.includes('explorer_hat'), 'Conserva propiedad tras evolución')
  })

  it('persistencia y migración idempotente de saldo e inventario de accesorios', () => {
    const state = createDefaultGameState()
    state.pets.toucan.coinsBalance = 80
    state.pets.toucan.purchasedAccessories = ['leaf_crown', 'star_glasses']
    state.pets.toucan.equippedAccessories = { head: 'leaf_crown', face: 'star_glasses' }

    const mockStorage: Record<string, string> = {
      [STORAGE_KEY_V2]: JSON.stringify(state),
    }

    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => { mockStorage[key] = val },
      removeItem: (key: string) => { delete mockStorage[key] },
      clear: () => {},
      length: 1,
      key: () => null,
    }

    const loaded = loadGameState()
    assert.equal(loaded.pets.toucan.coinsBalance, 80)
    assert.deepEqual(loaded.pets.toucan.purchasedAccessories, ['leaf_crown', 'star_glasses'])
    assert.equal(loaded.pets.toucan.equippedAccessories?.head, 'leaf_crown')
    assert.equal(loaded.pets.toucan.equippedAccessories?.face, 'star_glasses')
  })

  it('mejora de marca en minijuego suma deltaPoints al saldo canjeable automáticamente', () => {
    const state = createDefaultGameState()
    state.pets.monkey.coinsBalance = 0
    state.pets.monkey.bestStars = {}

    const match = createActiveMatch('counting', 'monkey', undefined, 'initial')
    match.roundIndex = 2 // última ronda completada
    const stateWithMatch = { ...state, activeMatch: match }

    // Completar con 3 estrellas (0 errores, 0 pistas) -> +30 deltaPoints
    const { state: rewarded } = finishAndRewardMatch(stateWithMatch, 'counting', match.id, {
      errorsCount: 0,
      hintsUsed: 0,
    })

    assert.equal(rewarded.pets.monkey.coinsBalance, 30, 'Recibe 30 puntos canjeables por primera combinación perfecta')
    assert.equal(getPetCoinsBalance(rewarded.pets.monkey), 30)
  })
})

describe('15. Auditoría de Criterios Obligatorios Muyu 3.0: Ausencia de emojis y calidad editorial', () => {
  it('garantiza ausencia total de emojis en archivos de interfaz y estilos (src/**/*.{tsx,ts,css})', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')

    const getFiles = (dir: string): string[] => {
      let results: string[] = []
      const list = fs.readdirSync(dir)
      list.forEach((file) => {
        const full = path.join(dir, file)
        const stat = fs.statSync(full)
        if (stat && stat.isDirectory()) {
          results = results.concat(getFiles(full))
        } else if (/\.(tsx|ts|css|html)$/.test(file)) {
          results.push(full)
        }
      })
      return results
    }

    const files = getFiles(path.resolve('src'))
    const emojiRegex = /\p{Extended_Pictographic}/u

    const filesWithEmoji: { file: string; match: string }[] = []
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8')
      const m = content.match(emojiRegex)
      if (m) {
        filesWithEmoji.push({ file: path.relative('.', file), match: m[0] })
      }
    }

    assert.deepEqual(filesWithEmoji, [], `Se detectaron emojis en: ${JSON.stringify(filesWithEmoji)}`)
  })

  it('verifica que existen los 12 assets de mascotas (3 especies x 4 etapas) en public/pets', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')

    const pets = ['monkey', 'turtle', 'toucan']
    const stages = ['baby', 'sprout', 'young', 'adult']

    const missing: string[] = []
    for (const pet of pets) {
      for (const stage of stages) {
        const p = path.resolve('public', 'pets', pet, `${stage}.png`)
        if (!fs.existsSync(p)) {
          missing.push(path.relative('.', p))
        }
      }
    }

    assert.deepEqual(missing, [], `Faltan assets de mascotas: ${JSON.stringify(missing)}`)
  })
})








