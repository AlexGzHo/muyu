/* ============================================================
   Muyu: Crece Conmigo — Reglas Puras del Negocio (Fase 3)
   Funciones deterministas, puras e idempotentes
   ============================================================ */

import type { GameState, PetId, GrowthStage, ActivityId, ActiveMatch, ActiveScreen } from './types.ts'

// Umbrales de crecimiento: 2 alimentaciones por etapa, 6 para llegar a adulto
export const FEEDINGS_PER_STAGE = 2
export const FEEDINGS_FOR_ADULT = 6

export const calculateStage = (totalFeedings: number): GrowthStage => {
  const safeFeedings = Math.max(0, Math.floor(Number.isFinite(totalFeedings) ? totalFeedings : 0))
  if (safeFeedings >= FEEDINGS_FOR_ADULT) return 'adult'
  if (safeFeedings >= 4) return 'young'
  if (safeFeedings >= 2) return 'sprout'
  return 'baby'
}

export const calculateFeedingsInStage = (totalFeedings: number): number => {
  const safeFeedings = Math.max(0, Math.floor(Number.isFinite(totalFeedings) ? totalFeedings : 0))
  if (safeFeedings >= FEEDINGS_FOR_ADULT) return 0
  return safeFeedings % FEEDINGS_PER_STAGE
}

/**
 * Alimenta a la mascota seleccionada consumiendo exactamente 1 alimento.
 * Si el inventario está vacío, rechaza la operación sin números negativos.
 * Si la mascota ya es adulta, puede seguir comiendo sin bloquearse ni retroceder.
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
  const nextStage = calculateStage(nextTotalFeedings)
  const nextFeedingsInStage = calculateFeedingsInStage(nextTotalFeedings)

  const updatedState: GameState = {
    ...state,
    pets: {
      ...state.pets,
      [petId]: {
        ...currentPet,
        foodCount: nextFoodCount,
        totalFeedings: nextTotalFeedings,
        stage: nextStage,
        feedingsInStage: nextFeedingsInStage,
      },
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

  // Idempotencia: si ya fue recompensado, no otorgar premio doble
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
 * Cambia la mascota activa preservando aislados los inventarios y estados individuales.
 */
export const switchPet = (state: GameState, petId: PetId): GameState => {
  if (!state.pets[petId]) return state
  return {
    ...state,
    selectedPetId: petId,
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
 * Crea una partida activa determinista con ID estable y metas preparadas.
 */
export const createActiveMatch = (
  activityId: ActivityId,
  petId: PetId,
  customTargets?: number[]
): ActiveMatch => {
  const id = `match_${activityId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  return {
    id,
    petId,
    activityId,
    roundIndex: 0,
    roundTargets:
      activityId === 'counting'
        ? customTargets && customTargets.length >= 3
          ? customTargets.slice(0, 3)
          : generateCountingTargets()
        : undefined,
    partialData: {},
    completed: false,
    rewarded: false,
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
  const match = createActiveMatch(activityId, state.selectedPetId, customTargets)
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
        partialData: {},
      },
    }
  }

  return {
    ...state,
    activeMatch: {
      ...match,
      roundIndex: totalRounds,
      completed: true,
      partialData: {},
    },
  }
}

/**
 * Actualiza datos de la ronda en curso (por ejemplo frutas en canasta o herramientas aplicadas).
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
 * Valida de forma estricta:
 * 1. Existencia de activeMatch.
 * 2. Coincidencia exacta de activityId y matchId.
 * 3. Que la partida esté en la última ronda esperada (roundIndex >= 2) o completada.
 * Si roundIndex < 2, rechaza la premiación (credited: false).
 * Si ya fue premiada, garantiza idempotencia estricta (credited: false) sin duplicar comida.
 * Al premiar: fija roundIndex: 3, completed: true, rewarded: true, acredita exactamente 1 alimento.
 */
export const finishAndRewardMatch = (
  state: GameState,
  activityId: ActivityId,
  matchId: string
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

  const updatedState: GameState = {
    ...state,
    completedMatchIds: [...state.completedMatchIds, match.id],
    activeMatch: {
      ...match,
      roundIndex: 3,
      completed: true,
      rewarded: true,
    },
    pets: {
      ...state.pets,
      [match.petId]: {
        ...pet,
        foodCount: pet.foodCount + 1,
      },
    },
  }

  return { state: updatedState, credited: true }
}

/**
 * Finaliza y acredita atómicamente la partida activa si y solo si completó las 3 rondas.
 * Idempotente: nunca acredita dos veces la misma partida aunque se refresque en la celebración.
 */
export const completeAndRewardMatch = (
  state: GameState
): { state: GameState; credited: boolean } => {
  if (!state.activeMatch) {
    return { state, credited: false }
  }
  const match = state.activeMatch
  if (!match.completed && match.roundIndex < 3) {
    return { state, credited: false }
  }
  return finishAndRewardMatch(state, match.activityId, match.id)
}

/**
 * Sale de la actividad hacia el hogar, limpiando la partida activa pero PRESERVANDO el historial de completadas.
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
