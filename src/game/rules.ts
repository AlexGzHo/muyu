/* ============================================================
   Muyu: Crece Conmigo — Reglas Puras del Negocio (Fase 4 / PRD V2)
   Funciones deterministas, puras e idempotentes
   ============================================================ */

import type {
  GameState,
  PetId,
  GrowthStage,
  ActivityId,
  ActiveMatch,
  ActiveScreen,
  ActivityCardInfo,
  DifficultyLevel,
  MatchResult,
  MedalId,
  PetMedal,
  PetProgress,
  PetGrowthProgress,
  RecommendationInfo,
  AccessoryId,
  AccessoryItem,
  AccessoryCategory,
  EquippedAccessories,
} from './types.ts'
import { generateCountingRound } from './activitiesModel.ts'
import { isAccessoryCompatible } from './petAnchors.ts'

// Umbrales de crecimiento configurables de Muyu V2: 0, 35, 80, 145
export const GROWTH_THRESHOLDS = {
  baby: 0,
  sprout: 35,
  young: 80,
  adult: 145,
} as const

export const GROWTH_THRESHOLDS_LIST: readonly [number, number, number, number] = [0, 35, 80, 145]

export const GROWTH_UNITS_PER_FIRST_COMBO = 10
export const GROWTH_UNITS_PER_FEED = 3
export const MAX_PET_SCORE = 630

// Constantes legadas preservadas para compatibilidad de interfaz
export const FEEDINGS_PER_STAGE = 2
export const FEEDINGS_FOR_ADULT = 6

export const STAGE_ORDER: readonly GrowthStage[] = ['baby', 'sprout', 'young', 'adult']

/**
 * Devuelve el umbral base en unidades de crecimiento para una etapa dada.
 */
export const calculateGrowthUnitsForStage = (stage: GrowthStage): number => {
  return GROWTH_THRESHOLDS[stage] ?? 0
}

/**
 * Calcula la etapa de crecimiento en base a las unidades de crecimiento.
 * Garantiza stage floor: nunca rebaja ninguna etapa previamente alcanzada (ni adult ni intermedias).
 */
export const calculateStage = (
  growthUnits: number,
  currentStage?: GrowthStage
): GrowthStage => {
  if (currentStage === 'adult') return 'adult'

  const safeUnits = Math.max(0, Math.floor(Number.isFinite(growthUnits) ? growthUnits : 0))

  let calculatedStage: GrowthStage = 'baby'
  if (safeUnits >= GROWTH_THRESHOLDS.adult) {
    calculatedStage = 'adult'
  } else if (safeUnits >= GROWTH_THRESHOLDS.young) {
    calculatedStage = 'young'
  } else if (safeUnits >= GROWTH_THRESHOLDS.sprout) {
    calculatedStage = 'sprout'
  } else {
    calculatedStage = 'baby'
  }

  // Salvaguarda: nunca rebajar de etapa si la mascota ya alcanzó un nivel superior
  if (currentStage) {
    const currentIdx = STAGE_ORDER.indexOf(currentStage)
    const calculatedIdx = STAGE_ORDER.indexOf(calculatedStage)
    if (currentIdx > calculatedIdx) {
      return currentStage
    }
  }

  return calculatedStage
}

/**
 * Mantiene compatibilidad con el cálculo de ciclo de alimentación en etapa.
 */
export const calculateFeedingsInStage = (totalFeedings: number): number => {
  const safeFeedings = Math.max(0, Math.floor(Number.isFinite(totalFeedings) ? totalFeedings : 0))
  if (safeFeedings >= FEEDINGS_FOR_ADULT) return 0
  return safeFeedings % FEEDINGS_PER_STAGE
}

/**
 * Calcula deterministamente las estrellas de una sesión según las reglas pedagógicas de Fase 4:
 * - 3 estrellas: errores <= 1 Y pistas manuales === 0
 * - 2 estrellas: errores <= 3 Y pistas manuales <= 1
 * - 1 estrella: cualquier otro desempeño al completar
 * Fallback visual automático y repetición de voz no computan como pistas manuales.
 */
export const calculateMatchStars = (
  errorsCount: number,
  manualHintsCount: number
): 1 | 2 | 3 => {
  const safeErrors = Math.max(0, Math.floor(Number.isFinite(errorsCount) ? errorsCount : 0))
  const safeHints = Math.max(0, Math.floor(Number.isFinite(manualHintsCount) ? manualHintsCount : 0))

  if (safeErrors <= 1 && safeHints === 0) {
    return 3
  }
  if (safeErrors <= 3 && safeHints <= 1) {
    return 2
  }
  return 1
}

/**
 * Alimenta a la mascota seleccionada consumiendo exactamente 1 alimento.
 * Suma +3 unidades de crecimiento (growthUnits).
 * Regla V2: SOLO alimentar confirma y materializa el avance de etapa.
 * Al saltar umbrales desbloquea automáticamente todas las etapas intermedias alcanzadas.
 * Las mascotas adultas pueden seguir comiendo y jugando sin bloquearse ni retroceder.
 */
export const feedPet = (
  state: GameState,
  petId: PetId
): { state: GameState; success: boolean } => {
  const currentPet = state.pets[petId]
  if (!currentPet) return { state, success: false }

  // Restricción: no permite consumo si el inventario está en cero o negativo
  if (currentPet.foodCount <= 0) {
    return { state, success: false }
  }

  const nextFoodCount = Math.max(0, currentPet.foodCount - 1)
  const nextTotalFeedings = currentPet.totalFeedings + 1

  const currentGrowth = currentPet.growthUnits ?? calculateGrowthUnitsForStage(currentPet.stage)
  const nextGrowthUnits = currentGrowth + GROWTH_UNITS_PER_FEED

  // Confirmar avance de etapa sólo al alimentar
  const nextStage = calculateStage(nextGrowthUnits, currentPet.stage)
  const nextFeedingsInStage = calculateFeedingsInStage(nextTotalFeedings)

  // Desbloqueo de etapas: incluye todas las intermedias alcanzadas
  const targetIdx = STAGE_ORDER.indexOf(nextStage)
  const stagesUpToTarget = STAGE_ORDER.slice(0, targetIdx + 1)
  const nextUnlocked = Array.from(
    new Set([...(currentPet.unlockedStages || ['baby']), ...stagesUpToTarget])
  )

  const updatedPetTemp: PetProgress = {
    ...currentPet,
    foodCount: nextFoodCount,
    totalFeedings: nextTotalFeedings,
    growthUnits: nextGrowthUnits,
    stage: nextStage,
    feedingsInStage: nextFeedingsInStage,
    unlockedStages: nextUnlocked,
  }

  // Actualizar medallas ganadas por esta mascota
  const nextMedals = getPetEarnedMedalIds(updatedPetTemp)

  const updatedPet: PetProgress = {
    ...updatedPetTemp,
    medals: nextMedals,
  }

  const updatedState: GameState = {
    ...state,
    pets: {
      ...state.pets,
      [petId]: updatedPet,
    },
  }

  return { state: updatedState, success: true }
}

/**
 * Acredita la recompensa de una partida de minijuego (exactamente 1 alimento).
 * Garantiza idempotencia mediante matchId único: si ya se acreditó esa partida, no duplica.
 */
export const creditGameReward = (
  state: GameState,
  petId: PetId,
  matchId: string
): { state: GameState; credited: boolean } => {
  if (!matchId || typeof matchId !== 'string' || matchId.trim().length === 0) {
    return { state, credited: false }
  }

  if (state.completedMatchIds.includes(matchId)) {
    return { state, credited: false }
  }

  const currentPet = state.pets[petId]
  if (!currentPet) return { state, credited: false }

  const nextFoodCount = currentPet.foodCount + 1

  const updatedState: GameState = {
    ...state,
    completedMatchIds: [...state.completedMatchIds, matchId],
    pets: {
      ...state.pets,
      [petId]: {
        ...currentPet,
        foodCount: nextFoodCount,
      },
    },
  }

  return { state: updatedState, credited: true }
}

/**
 * Registra una interacción afectiva (toque o caricia) con la mascota.
 */
export const interactWithPet = (state: GameState, petId: PetId): GameState => {
  const currentPet = state.pets[petId]
  if (!currentPet) return state

  return {
    ...state,
    pets: {
      ...state.pets,
      [petId]: {
        ...currentPet,
        interactionsCount: currentPet.interactionsCount + 1,
      },
    },
  }
}

/**
 * Cambia la mascota activa preservando aislados los inventarios, estrellas y estados individuales.
 * Sincroniza la vista de bestStars para la UI activa.
 */
export const switchPet = (state: GameState, petId: PetId): GameState => {
  const targetPet = state.pets[petId]
  if (!targetPet) return state
  return {
    ...state,
    selectedPetId: petId,
    bestStars: targetPet.bestStars || {},
  }
}

/**
 * Alterna la configuración de sonido.
 */
export const toggleSound = (state: GameState): GameState => ({
  ...state,
  settings: {
    ...state.settings,
    soundEnabled: !state.settings.soundEnabled,
  },
})

/**
 * Cambia el nivel de dificultad pedagógica (inicial, medio, avanzado).
 */
export const setDifficultyLevel = (
  state: GameState,
  difficultyLevel: DifficultyLevel
): GameState => ({
  ...state,
  settings: {
    ...state.settings,
    difficultyLevel,
  },
})

/**
 * Marca la guía visual de inicio como vista.
 */
export const setIntroSeen = (state: GameState, introSeen = true): GameState => ({
  ...state,
  introSeen,
})

/**
 * Determina si existe una partida guardada con progreso previo
 * para mostrar "CONTINUAR" en lugar de "JUGAR" en la portada.
 */
export const hasGameProgress = (state: GameState): boolean => {
  if (state.completedMatchIds.length > 0) return true
  for (const pet of Object.values(state.pets)) {
    if (
      pet.totalFeedings > 0 ||
      pet.foodCount > 0 ||
      (pet.growthUnits ?? 0) > 0 ||
      pet.stage !== 'baby' ||
      Object.keys(pet.bestStars || {}).length > 0
    ) {
      return true
    }
  }
  return false
}

/**
 * Catálogo canónico de exactamente 7 minijuegos para Muyu 2.0.
 */
export const ACTIVITIES_CATALOG: readonly ActivityCardInfo[] = [
  {
    id: 'counting',
    code: 'J1',
    title: 'Fiesta de frutas',
    area: 'Matemática',
    subtitle: 'Cuenta y lleva frutas a la canasta',
    isAvailable: true,
  },
  {
    id: 'patterns',
    code: 'J2',
    title: 'El camino de los patrones',
    area: 'Matemática / Lógica',
    subtitle: 'Completa secuencias de formas y colores',
    isAvailable: true,
  },
  {
    id: 'plant',
    code: 'J3',
    title: 'El huerto de Muyu',
    area: 'Ciencia y ambiente',
    subtitle: 'Riega y dale sol para verla crecer',
    isAvailable: true,
  },
  {
    id: 'habitats',
    code: 'J4',
    title: 'Cada animal en su hogar',
    area: 'Ciencia y ambiente',
    subtitle: 'Acompaña a cada amigo a su hábitat',
    isAvailable: true,
  },
  {
    id: 'listening',
    code: 'J5',
    title: 'Escucha y encuentra',
    area: 'Comunicación',
    subtitle: 'Oye el sonido y elige la figura',
    isAvailable: true,
  },
  {
    id: 'stories',
    code: 'J6',
    title: 'Cuentos en orden',
    area: 'Comunicación',
    subtitle: 'Ordena la historia paso a paso',
    isAvailable: true,
  },
  {
    id: 'shadows',
    code: 'J7',
    title: 'Sombras y formas',
    area: 'Percepción',
    subtitle: 'Une cada figura con su silueta',
    isAvailable: true,
  },
]

/**
 * Genera 3 metas distintas de conteo dentro del rango 1..5.
 */
export const generateCountingTargets = (): number[] => {
  const pool = [1, 2, 3, 4, 5]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = pool[i]
    pool[i] = pool[j]
    pool[j] = temp
  }
  return pool.slice(0, 3)
}

/**
 * Crea una partida activa determinista con ID estable, contentVersion: 2 y metas preparadas.
 */
export const createActiveMatch = (
  activityId: ActivityId,
  petId: PetId,
  customTargets?: number[],
  difficulty?: DifficultyLevel
): ActiveMatch => {
  const id = `match_${activityId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const diff = difficulty ?? 'initial'
  return {
    id,
    petId,
    activityId,
    roundIndex: 0,
    roundTargets:
      activityId === 'counting'
        ? customTargets && customTargets.length >= 3
          ? customTargets.slice(0, 3)
          : [0, 1, 2].map((ronda) => generateCountingRound(id, ronda, diff).targetCount)
        : undefined,
    partialData: {},
    completed: false,
    rewarded: false,
    difficulty: diff,
    contentVersion: 2,
  }
}

/**
 * Inicia una partida de minijuego para la mascota activa, transicionando de pantalla de forma persistente.
 */
export const startMatch = (
  state: GameState,
  activityId: ActivityId,
  customTargets?: number[]
): GameState => {
  const match = createActiveMatch(
    activityId,
    state.selectedPetId,
    customTargets,
    state.settings.difficultyLevel
  )
  return {
    ...state,
    currentScreen: `activity-${activityId}` as ActiveScreen,
    activeMatch: match,
  }
}

/**
 * Avanza la ronda de la partida activa si no ha culminado.
 * Al completar 3 rondas marca completed: true.
 * Determinista: no avanza si ya está completada.
 */
export const advanceMatchRound = (state: GameState, totalRounds = 3): GameState => {
  if (!state.activeMatch || state.activeMatch.completed) return state

  const match = state.activeMatch
  if (match.roundIndex < totalRounds - 1) {
    return {
      ...state,
      activeMatch: {
        ...match,
        roundIndex: match.roundIndex + 1,
        partialData: {
          errorsCount: match.partialData?.errorsCount ?? 0,
          hintsUsed: match.partialData?.hintsUsed ?? 0,
        },
      },
    }
  }

  return {
    ...state,
    activeMatch: {
      ...match,
      roundIndex: totalRounds,
      completed: true,
      partialData: {
        errorsCount: match.partialData?.errorsCount ?? 0,
        hintsUsed: match.partialData?.hintsUsed ?? 0,
      },
    },
  }
}

/**
 * Actualiza datos de la ronda en curso (errores, pistas, objetos seleccionados, etc.).
 */
export const updateMatchPartial = (
  state: GameState,
  partialData: Record<string, unknown>
): GameState => {
  if (!state.activeMatch || state.activeMatch.completed) return state
  return {
    ...state,
    activeMatch: {
      ...state.activeMatch,
      partialData: {
        ...(state.activeMatch.partialData || {}),
        ...partialData,
      },
    },
  }
}

/**
 * Finaliza y acredita atómicamente la última ronda de una partida activa.
 * Reglas de premiación Fase 4:
 * 1. Cada NUEVA sesión completada da exactamente 1 fruta.
 * 2. Idempotente contra doble callback o recarga en la celebración.
 * 3. Evalúa estrellas (1..3) y actualiza la mejor marca de la mascota para esa combinación (`${activityId}_${difficulty}`).
 * 4. Puntos derivados: 10 * sum(mejores estrellas). Repetir una actividad no farmea puntos si no mejora la marca.
 * 5. Cada primera combinación completada por la mascota otorga +10 growthUnits una sola vez.
 * 6. Guarda el resultado completo en activeMatch.result para la pantalla de resumen.
 * 7. NO confirma evolución aquí: solo alimentar confirma el avance de etapa.
 */
export const finishAndRewardMatch = (
  state: GameState,
  activityId: ActivityId,
  matchId: string,
  performanceOverride?: { errorsCount?: number; hintsUsed?: number }
): { state: GameState; credited: boolean } => {
  if (!state.activeMatch) {
    return { state, credited: false }
  }

  const match = state.activeMatch

  // Validación estricta de activityId y matchId
  if (match.id !== matchId || match.activityId !== activityId) {
    return { state, credited: false }
  }

  // Validación de ronda: debe haber alcanzado la última ronda (índice 2) o estar completada
  if (!match.completed && match.roundIndex < 2) {
    return { state, credited: false }
  }

  // Idempotencia: si ya fue recompensada o su ID está registrado, no duplicar premio
  if (match.rewarded || state.completedMatchIds.includes(match.id)) {
    const updatedState: GameState = {
      ...state,
      activeMatch: {
        ...match,
        roundIndex: 3,
        completed: true,
        rewarded: true,
      },
    }
    return { state: updatedState, credited: false }
  }

  const pet = state.pets[match.petId]
  if (!pet) {
    return { state, credited: false }
  }

  // Evaluación de desempeño
  const errorsCount =
    performanceOverride?.errorsCount ??
    (typeof match.partialData?.errorsCount === 'number' ? match.partialData.errorsCount : 0)
  const hintsUsed =
    performanceOverride?.hintsUsed ??
    (typeof match.partialData?.hintsUsed === 'number' ? match.partialData.hintsUsed : 0)

  const stars = calculateMatchStars(errorsCount, hintsUsed)
  const diff = match.difficulty ?? 'initial'
  const comboKey = `${match.activityId}_${diff}`

  const petStarsMap = pet.bestStars || {}
  const prevBestStars = petStarsMap[comboKey] ?? 0
  const isFirstCombo = petStarsMap[comboKey] === undefined
  const nextBestStars = Math.max(prevBestStars, stars)
  const updatedPetStars = {
    ...petStarsMap,
    [comboKey]: nextBestStars,
  }

  const deltaStars = Math.max(0, stars - prevBestStars)
  const deltaPoints = deltaStars * 10
  const growthEarned = isFirstCombo ? GROWTH_UNITS_PER_FIRST_COMBO : 0
  const fruitEarned = 1

  const currentGrowth = pet.growthUnits ?? calculateGrowthUnitsForStage(pet.stage)
  const nextGrowthUnits = currentGrowth + growthEarned
  const nextFoodCount = pet.foodCount + fruitEarned

  const result: MatchResult = {
    stars,
    previousBestStars: prevBestStars,
    deltaStars,
    deltaPoints,
    fruitEarned,
    growthEarned,
    errorsCount,
    hintsUsed,
  }

  const currentCoins = pet.coinsBalance ?? 0
  const nextCoinsBalance = currentCoins + deltaPoints

  const updatedPetTemp: PetProgress = {
    ...pet,
    foodCount: nextFoodCount,
    growthUnits: nextGrowthUnits,
    bestStars: updatedPetStars,
    coinsBalance: nextCoinsBalance,
  }

  const nextMedals = getPetEarnedMedalIds(updatedPetTemp)

  const updatedPet: PetProgress = {
    ...updatedPetTemp,
    medals: nextMedals,
  }

  const updatedState: GameState = {
    ...state,
    completedMatchIds: [...state.completedMatchIds, match.id],
    activeMatch: {
      ...match,
      roundIndex: 3,
      completed: true,
      rewarded: true,
      result,
    },
    pets: {
      ...state.pets,
      [match.petId]: updatedPet,
    },
    bestStars: state.selectedPetId === match.petId ? updatedPetStars : state.bestStars,
  }

  return { state: updatedState, credited: true }
}

/**
 * Finaliza y acredita atómicamente la partida activa si y solo si completó las 3 rondas.
 * Idempotente: nunca acredita dos veces la misma partida aunque se refresque en la celebración.
 */
export const completeAndRewardMatch = (
  state: GameState,
  performanceOverride?: { errorsCount?: number; hintsUsed?: number }
): { state: GameState; credited: boolean } => {
  if (!state.activeMatch) {
    return { state, credited: false }
  }
  const match = state.activeMatch
  if (!match.completed && match.roundIndex < 3) {
    return { state, credited: false }
  }
  return finishAndRewardMatch(state, match.activityId, match.id, performanceOverride)
}

/**
 * Sale de la actividad hacia el hogar/bosque, limpiando la partida activa pero PRESERVANDO el historial de completadas.
 */
export const exitMatch = (state: GameState): GameState => ({
  ...state,
  currentScreen: 'home',
  activeMatch: null,
})

/**
 * Calcula la etapa visual de la maceta (1: semilla, 2: brote verde, 3: flor completa)
 * garantizando que en ronda 3 (roundIndex: 2) se mantenga en etapa 2 (brote) si solo se ha dado agua,
 * y solo avance a 3 (flor) cuando se apliquen AMBOS elementos ('water' y 'sun') o se complete.
 */
export const computePlantVisualStage = (
  roundIndex: number,
  givenItems: string[],
  isCompleted: boolean = false
): 1 | 2 | 3 => {
  if (isCompleted || roundIndex >= 3) return 3
  if (roundIndex === 0) return 1
  if (roundIndex === 1) return givenItems.includes('sun') ? 2 : 1
  if (roundIndex === 2) {
    return givenItems.includes('water') && givenItems.includes('sun') ? 3 : 2
  }
  return 1
}

/* ============================================================
   SELECTORES EXPORTADOS PARA UI (Score / Growth / Medals / Recommendation)
   ============================================================ */

export const VALID_ACTIVITIES: readonly ActivityId[] = [
  'counting',
  'patterns',
  'plant',
  'habitats',
  'listening',
  'stories',
  'shadows',
]

export const VALID_DIFFICULTIES: readonly DifficultyLevel[] = [
  'initial',
  'medium',
  'advanced',
]

/**
 * Calcula la puntuación total derivada de una mascota: 10 * suma de mejores estrellas.
 * Máximo estricto: 630 puntos (21 combinaciones canónicas x 3 estrellas x 10 puntos).
 * Ignora estrictamente claves ajenas a las 21 combinaciones oficiales.
 */
export const getPetTotalScore = (pet: PetProgress): number => {
  if (!pet || !pet.bestStars) return 0
  let totalStars = 0
  for (const act of VALID_ACTIVITIES) {
    for (const diff of VALID_DIFFICULTIES) {
      const key = `${act}_${diff}`
      const stars = pet.bestStars[key]
      if (typeof stars === 'number' && Number.isFinite(stars)) {
        totalStars += Math.max(0, Math.min(3, Math.floor(stars)))
      }
    }
  }
  return Math.min(MAX_PET_SCORE, totalStars * 10)
}

/**
 * Obtiene la mejor marca en estrellas para una actividad y dificultad específica de la mascota.
 */
export const getPetGameStars = (
  pet: PetProgress,
  activityId: ActivityId,
  difficulty: DifficultyLevel
): number => {
  if (!pet || !pet.bestStars) return 0
  const key = `${activityId}_${difficulty}`
  return pet.bestStars[key] ?? 0
}

/**
 * Devuelve un mapa inmutable con todas las mejores marcas de la mascota.
 */
export const getPetBestStarsMap = (pet: PetProgress): Record<string, number> => {
  if (!pet || !pet.bestStars) return {}
  return { ...pet.bestStars }
}

/**
 * Devuelve el progreso de crecimiento detallado de una mascota para visualizaciones de UI y barras de avance.
 */
export const getPetGrowthProgress = (pet: PetProgress): PetGrowthProgress => {
  const currentUnits = pet.growthUnits ?? calculateGrowthUnitsForStage(pet.stage)
  const currentStage = pet.stage

  const stageOrder: GrowthStage[] = ['baby', 'sprout', 'young', 'adult']
  const stageIndex = stageOrder.indexOf(currentStage)
  const nextStage: GrowthStage | null = stageIndex < stageOrder.length - 1 ? stageOrder[stageIndex + 1] : null

  const currentThreshold = GROWTH_THRESHOLDS[currentStage]
  const nextThreshold = nextStage ? GROWTH_THRESHOLDS[nextStage] : null

  let progressPercent = 100
  let canEvolve = false

  if (nextThreshold !== null) {
    const range = nextThreshold - currentThreshold
    const progress = Math.max(0, currentUnits - currentThreshold)
    progressPercent = range > 0 ? Math.min(100, Math.floor((progress / range) * 100)) : 100
    canEvolve = currentUnits >= nextThreshold
  }

  return {
    growthUnits: currentUnits,
    currentStage,
    nextStage,
    currentThreshold,
    nextThreshold,
    progressPercent,
    canEvolve,
  }
}

export const CANONICAL_MEDAL_IDS: readonly MedalId[] = [
  'first_activity',
  'first_feed',
  'three_distinct_types',
  'first_evolution',
  'seven_distinct_types',
  'adult',
]

const MEDAL_ALIAS_MAP: Record<MedalId, MedalId> = {
  first_activity: 'first_activity',
  primera_actividad: 'first_activity',
  first_feed: 'first_feed',
  primer_alimento: 'first_feed',
  three_distinct_types: 'three_distinct_types',
  '3_tipos_distintos': 'three_distinct_types',
  first_evolution: 'first_evolution',
  primera_evolucion: 'first_evolution',
  seven_distinct_types: 'seven_distinct_types',
  '7_tipos': 'seven_distinct_types',
  adult: 'adult',
  adulto: 'adult',
}

/**
 * Lista de los 6 hitos únicos de medallas ganadas por la mascota.
 * Expone identificadores canónicos únicos sin duplicar conteos.
 * Regla: Medallas individuales; no usa contadores globales para mascotas que no jugaron.
 */
export const getPetEarnedMedalIds = (pet: PetProgress): MedalId[] => {
  if (!pet) return []
  const earned: MedalId[] = []

  const completedKeys = Object.keys(pet.bestStars || {}).filter((k) => {
    const parts = k.split('_')
    return (
      parts.length === 2 &&
      VALID_ACTIVITIES.includes(parts[0] as ActivityId) &&
      VALID_DIFFICULTIES.includes(parts[1] as DifficultyLevel)
    )
  })
  const distinctActivities = new Set(completedKeys.map((k) => k.split('_')[0]))

  // 1. Primera actividad completada por esta mascota
  if (completedKeys.length > 0) {
    earned.push('first_activity')
  }

  // 2. Primer alimento consumido por esta mascota
  if (pet.totalFeedings > 0) {
    earned.push('first_feed')
  }

  // 3. Tres tipos distintos de minijuegos
  if (distinctActivities.size >= 3) {
    earned.push('three_distinct_types')
  }

  // 4. Primera evolución (alcanzó al menos 'sprout')
  if (pet.stage !== 'baby') {
    earned.push('first_evolution')
  }

  // 5. Los siete tipos de minijuegos completados
  if (distinctActivities.size >= 7) {
    earned.push('seven_distinct_types')
  }

  // 6. Adulto alcanzado
  if (pet.stage === 'adult') {
    earned.push('adult')
  }

  return earned
}

/**
 * Verifica si una mascota tiene una medalla específica (acepta clave canónica o alias en español).
 */
export const hasPetMedal = (pet: PetProgress, medalId: MedalId): boolean => {
  const canonical = MEDAL_ALIAS_MAP[medalId] ?? medalId
  const earned = getPetEarnedMedalIds(pet)
  return earned.includes(canonical)
}

/**
 * Lista completa de las 6 medallas canónicas con metadatos descriptivos y estado de desbloqueo.
 */
export const getPetMedals = (pet: PetProgress): PetMedal[] => {
  const earned = getPetEarnedMedalIds(pet)

  return [
    {
      id: 'first_activity',
      title: 'Primeros Pasos',
      description: 'Completa tu primera actividad con esta mascota.',
      unlocked: earned.includes('first_activity'),
    },
    {
      id: 'first_feed',
      title: 'Nutrición con Amor',
      description: 'Alimenta a tu mascota por primera vez.',
      unlocked: earned.includes('first_feed'),
    },
    {
      id: 'three_distinct_types',
      title: 'Explorador Curioso',
      description: 'Supera actividades en al menos 3 áreas diferentes.',
      unlocked: earned.includes('three_distinct_types'),
    },
    {
      id: 'first_evolution',
      title: 'Brote de Crecimiento',
      description: 'Consigue tu primera evolución.',
      unlocked: earned.includes('first_evolution'),
    },
    {
      id: 'seven_distinct_types',
      title: 'Maestro del Bosque',
      description: 'Supera los 7 tipos de actividades disponibles.',
      unlocked: earned.includes('seven_distinct_types'),
    },
    {
      id: 'adult',
      title: 'Compañero Sabio',
      description: 'Acompaña a tu mascota hasta su etapa adulta.',
      unlocked: earned.includes('adult'),
    },
  ]
}

/**
 * Regla de recomendación pedagógica según desempeño.
 * Si el usuario ya dominó una actividad o nivel con 3 estrellas, recomienda avanzar.
 * No bloquea la elección de juegos ni niveles en ningún momento.
 */
export const getRecommendedDifficulty = (
  pet: PetProgress,
  activityId?: ActivityId
): DifficultyLevel => {
  if (!pet || !pet.bestStars) return 'initial'

  if (activityId) {
    const advStars = pet.bestStars[`${activityId}_advanced`] ?? 0
    const medStars = pet.bestStars[`${activityId}_medium`] ?? 0
    const initStars = pet.bestStars[`${activityId}_initial`] ?? 0

    if (advStars === 3) return 'advanced'
    if (medStars === 3) return 'advanced'
    if (initStars === 3) return 'medium'
    return 'initial'
  }

  // Recomendación general basada en volumen de actividades con 3 estrellas
  let initial3Stars = 0
  let medium3Stars = 0

  for (const [key, stars] of Object.entries(pet.bestStars)) {
    if (stars === 3) {
      if (key.endsWith('_initial')) initial3Stars++
      if (key.endsWith('_medium')) medium3Stars++
    }
  }

  if (medium3Stars >= 4) return 'advanced'
  if (initial3Stars >= 4) return 'medium'
  return 'initial'
}

/**
 * Entrega información pedagógica completa de recomendación para la UI.
 */
export const getPedagogicalRecommendation = (
  pet: PetProgress,
  currentDifficulty: DifficultyLevel,
  activityId?: ActivityId
): RecommendationInfo => {
  const recommended = getRecommendedDifficulty(pet, activityId)

  if (activityId) {
    const currentStars = pet.bestStars?.[`${activityId}_${currentDifficulty}`] ?? 0
    if (currentStars === 3) {
      if (currentDifficulty === 'initial') {
        return {
          recommendedDifficulty: 'medium',
          reason: '¡Dominaste este reto con 3 estrellas! Prueba el nivel Medio para seguir aprendiendo.',
          canAdvance: true,
        }
      }
      if (currentDifficulty === 'medium') {
        return {
          recommendedDifficulty: 'advanced',
          reason: '¡Excelente maestría! Estás listo para el nivel Avanzado.',
          canAdvance: true,
        }
      }
      return {
        recommendedDifficulty: 'advanced',
        reason: '¡Completaste el reto máximo con calificación perfecta!',
        canAdvance: false,
      }
    }

    return {
      recommendedDifficulty: currentDifficulty,
      reason: 'Sigue practicando en este nivel para conseguir las 3 estrellas.',
      canAdvance: false,
    }
  }

  const canAdvance =
    (currentDifficulty === 'initial' && recommended !== 'initial') ||
    (currentDifficulty === 'medium' && recommended === 'advanced')

  return {
    recommendedDifficulty: recommended,
    reason: canAdvance
      ? `Tu desempeño demuestra gran preparación. Se sugiere el nivel ${recommended === 'medium' ? 'Medio' : 'Avanzado'}.`
      : 'Continúa explorando y consolidando tus logros en este nivel pedagógico.',
    canAdvance,
  }
}

/* ============================================================
   TIENDA DEL BOSQUE — CATÁLOGO DE 12 ACCESORIOS Y LÓGICA PURA
   ============================================================ */

export const ACCESSORIES_CATALOG: readonly AccessoryItem[] = [
  // CABEZA (4)
  {
    id: 'orange_cap',
    name: 'Gorrita Naranja',
    category: 'head',
    price: 30,
    description: 'Gorrita deportiva color naranja alegre con visera curva.',
    previewSvgId: 'preview_orange_cap',
  },
  {
    id: 'explorer_hat',
    name: 'Sombrero de Explorador',
    category: 'head',
    price: 50,
    description: 'Sombrero clásico de safari con cinta verde bosque.',
    previewSvgId: 'preview_explorer_hat',
  },
  {
    id: 'leaf_crown',
    name: 'Corona de Hojas',
    category: 'head',
    price: 60,
    description: 'Corona ceremonial tejida con hojas amazónicas y brotes dorados.',
    previewSvgId: 'preview_leaf_crown',
  },
  {
    id: 'color_bow',
    name: 'Lazo de Colores',
    category: 'head',
    price: 40,
    description: 'Lazo festivo con cinta fucsia y amarillo brillante.',
    previewSvgId: 'preview_color_bow',
  },

  // ROSTRO (2)
  {
    id: 'round_glasses',
    name: 'Lentes Redondos',
    category: 'face',
    price: 30,
    description: 'Gafas de marco circular dorado con cristales translúcidos.',
    previewSvgId: 'preview_round_glasses',
  },
  {
    id: 'star_glasses',
    name: 'Gafas de Estrella',
    category: 'face',
    price: 50,
    description: 'Lentes festivos con marco en forma de estrellas amarillas.',
    previewSvgId: 'preview_star_glasses',
  },

  // CUELLO/PECHO (3)
  {
    id: 'explorer_scarf',
    name: 'Pañuelo de Explorador',
    category: 'neck',
    price: 30,
    description: 'Pañuelo triangular de expedición en color verde esmeralda.',
    previewSvgId: 'preview_explorer_scarf',
  },
  {
    id: 'gold_medal',
    name: 'Medalla Dorada',
    category: 'neck',
    price: 60,
    description: 'Medalla de honor al mérito con cinta azul y estrella grabada.',
    previewSvgId: 'preview_gold_medal',
  },
  {
    id: 'flower_necklace',
    name: 'Collar de Flores',
    category: 'neck',
    price: 40,
    description: 'Guirnalda floral con pétalos tropicales de colores vivos.',
    previewSvgId: 'preview_flower_necklace',
  },

  // ESPALDA/CUERPO (3)
  {
    id: 'small_backpack',
    name: 'Mochila Pequeña',
    category: 'back',
    price: 40,
    description: 'Mochila compacta de senderismo con correa y hebilla segura.',
    previewSvgId: 'preview_small_backpack',
  },
  {
    id: 'explorer_backpack',
    name: 'Mochila de Explorador',
    category: 'back',
    price: 60,
    description: 'Mochila completa de aventura con cantimplora y bolsillos.',
    previewSvgId: 'preview_explorer_backpack',
  },
  {
    id: 'short_cape',
    name: 'Capa Corta',
    category: 'back',
    price: 50,
    description: 'Capa corta de héroe del bosque en tela carmesí ondeante.',
    previewSvgId: 'preview_short_cape',
  },
]

/**
 * Obtiene el saldo canjeable actual de una mascota.
 */
export const getPetCoinsBalance = (pet: PetProgress): number => {
  return pet.coinsBalance ?? 0
}

/**
 * Compra un accesorio descontando únicamente el saldo canjeable (coinsBalance).
 * NUNCA resta puntos históricos ni altera growthUnits, medallas o evolución.
 * Idempotente y protegido contra compra repetida, saldo insuficiente o pérdida de propiedad.
 */
export const buyAccessory = (
  state: GameState,
  petId: PetId,
  accessoryId: AccessoryId
): { state: GameState; success: boolean; error?: string } => {
  const currentPet = state.pets[petId]
  if (!currentPet) {
    return { state, success: false, error: 'Mascota no encontrada' }
  }

  const item = ACCESSORIES_CATALOG.find((a) => a.id === accessoryId)
  if (!item) {
    return { state, success: false, error: 'Accesorio no existe en el catálogo' }
  }

  const compat = isAccessoryCompatible(accessoryId, petId, currentPet.stage)
  if (!compat.compatible) {
    return { state, success: false, error: compat.reason || 'Accesorio incompatible' }
  }

  const currentPurchased = currentPet.purchasedAccessories ?? []
  if (currentPurchased.includes(accessoryId)) {
    return { state, success: false, error: 'Accesorio ya adquirido' }
  }

  const currentCoins = currentPet.coinsBalance ?? 0
  if (currentCoins < item.price) {
    return { state, success: false, error: 'Puntos canjeables insuficientes' }
  }

  const nextCoins = currentCoins - item.price
  const nextPurchased = [...currentPurchased, accessoryId]

  // Al comprar, se equipa automáticamente en su categoría
  const currentEquipped: EquippedAccessories = { ...(currentPet.equippedAccessories ?? {}) }
  currentEquipped[item.category] = accessoryId

  const updatedPet: PetProgress = {
    ...currentPet,
    coinsBalance: nextCoins,
    purchasedAccessories: nextPurchased,
    equippedAccessories: currentEquipped,
  }

  const updatedState: GameState = {
    ...state,
    pets: {
      ...state.pets,
      [petId]: updatedPet,
    },
  }

  return { state: updatedState, success: true }
}

/**
 * Equipa un accesorio comprado en la mascota activa.
 * Excluye cualquier accesorio previo de la misma categoría (1 por categoría).
 * Equipar es 100% gratuito.
 */
export const equipAccessory = (
  state: GameState,
  petId: PetId,
  accessoryId: AccessoryId
): { state: GameState; success: boolean } => {
  const currentPet = state.pets[petId]
  if (!currentPet) return { state, success: false }

  const item = ACCESSORIES_CATALOG.find((a) => a.id === accessoryId)
  if (!item) return { state, success: false }

  const compat = isAccessoryCompatible(accessoryId, petId, currentPet.stage)
  if (!compat.compatible) return { state, success: false }

  const purchased = currentPet.purchasedAccessories ?? []
  if (!purchased.includes(accessoryId)) {
    return { state, success: false }
  }

  const nextEquipped: EquippedAccessories = { ...(currentPet.equippedAccessories ?? {}) }
  nextEquipped[item.category] = accessoryId

  const updatedPet: PetProgress = {
    ...currentPet,
    equippedAccessories: nextEquipped,
  }

  return {
    state: {
      ...state,
      pets: {
        ...state.pets,
        [petId]: updatedPet,
      },
    },
    success: true,
  }
}

/**
 * Quita un accesorio de una categoría de la mascota.
 * Quitar es 100% gratuito y mantiene la propiedad adquirida.
 */
export const unequipAccessory = (
  state: GameState,
  petId: PetId,
  category: AccessoryCategory
): { state: GameState; success: boolean } => {
  const currentPet = state.pets[petId]
  if (!currentPet) return { state, success: false }

  const nextEquipped: EquippedAccessories = { ...(currentPet.equippedAccessories ?? {}) }
  nextEquipped[category] = null

  const updatedPet: PetProgress = {
    ...currentPet,
    equippedAccessories: nextEquipped,
  }

  return {
    state: {
      ...state,
      pets: {
        ...state.pets,
        [petId]: updatedPet,
      },
    },
    success: true,
  }
}

