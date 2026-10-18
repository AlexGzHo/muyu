/* ============================================================
   Muyu: Crece Conmigo — Persistencia y Sanitización Determinista
   Adaptado con patrón de Tamagochi (MIT - 2026 Tamagochi contributors)
   ============================================================ */

import type { GameState, PetId, PetProgress, ActiveMatch, ActiveScreen, ActivityId } from './types.ts'
import { calculateStage, calculateFeedingsInStage } from './rules.ts'

const STORAGE_KEY = 'muyu_game_save_v1'

const PET_IDS: readonly PetId[] = ['monkey', 'turtle', 'toucan']

const VALID_SCREENS: readonly ActiveScreen[] = [
  'welcome',
  'select',
  'home',
  'activity-counting',
  'activity-plant',
  'activity-listening',
]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const finite = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const bounded = (value: unknown, fallback: number, minimum: number, maximum: number): number =>
  Math.max(minimum, Math.min(maximum, finite(value, fallback)))

const integer = (value: unknown, fallback: number, minimum: number, maximum: number): number =>
  Math.floor(bounded(value, fallback, minimum, maximum))

export const createDefaultPet = (id: PetId): PetProgress => {
  const names: Record<PetId, string> = {
    monkey: 'Monito',
    turtle: 'Tortuguita',
    toucan: 'Tucancito',
  }

  return {
    id,
    name: names[id],
    stage: 'baby',
    foodCount: 0,
    feedingsInStage: 0,
    totalFeedings: 0,
    interactionsCount: 0,
  }
}

export const createDefaultGameState = (): GameState => ({
  version: 1,
  currentScreen: 'welcome',
  selectedPetId: 'monkey',
  pets: {
    monkey: createDefaultPet('monkey'),
    turtle: createDefaultPet('turtle'),
    toucan: createDefaultPet('toucan'),
  },
  settings: {
    soundEnabled: true,
  },
  completedMatchIds: [],
  activeMatch: null,
})

const sanitizePet = (id: PetId, raw: unknown): PetProgress => {
  const defaultPet = createDefaultPet(id)
  if (!isRecord(raw)) return defaultPet

  const totalFeedings = integer(raw.totalFeedings, 0, 0, 999)
  // Coherencia obligatoria: derivar etapa y avance de totalFeedings deterministamente
  const stage = calculateStage(totalFeedings)
  const feedingsInStage = calculateFeedingsInStage(totalFeedings)

  return {
    id,
    name: typeof raw.name === 'string' && raw.name.trim().length > 0 ? raw.name.slice(0, 30) : defaultPet.name,
    stage,
    foodCount: integer(raw.foodCount, 0, 0, 999),
    feedingsInStage,
    totalFeedings,
    interactionsCount: integer(raw.interactionsCount, 0, 0, 9999),
  }
}

const sanitizePartialData = (
  activityId: ActivityId,
  raw: unknown
): Record<string, unknown> => {
  if (!isRecord(raw)) return {}

  if (activityId === 'counting') {
    const countRaw = raw.inBasketCount
    const inBasketCount =
      typeof countRaw === 'number' && Number.isFinite(countRaw)
        ? Math.max(0, Math.min(5, Math.floor(countRaw)))
        : 0
    return { inBasketCount }
  }

  if (activityId === 'plant') {
    const validPlantTools = ['water', 'sun', 'shoe', 'hat', 'ball']
    const givenItems = Array.isArray(raw.givenItems)
      ? Array.from(
          new Set(
            raw.givenItems.filter((it): it is string => typeof it === 'string' && validPlantTools.includes(it))
          )
        )
      : []
    const stageRaw = raw.plantVisualStage
    const plantVisualStage =
      stageRaw === 1 || stageRaw === 2 || stageRaw === 3 ? stageRaw : 1
    return { givenItems, plantVisualStage }
  }

  return {}
}

const sanitizeActiveMatch = (raw: unknown): ActiveMatch | null => {
  if (!isRecord(raw)) return null
  if (typeof raw.id !== 'string' || raw.id.trim().length === 0) return null
  const petId = String(raw.petId)
  if (!PET_IDS.includes(petId as PetId)) return null
  const activityId = String(raw.activityId)
  if (!['counting', 'plant', 'listening'].includes(activityId)) return null

  const roundIndex = integer(raw.roundIndex, 0, 0, 3)
  const completed = Boolean(raw.completed)
  const rewarded = Boolean(raw.rewarded)

  let roundTargets: number[] | undefined = undefined
  if (Array.isArray(raw.roundTargets)) {
    roundTargets = raw.roundTargets
      .map((n) => (typeof n === 'number' && Number.isFinite(n) ? Math.floor(n) : 0))
      .filter((n) => n >= 1 && n <= 5)
    if (roundTargets.length < 3) {
      roundTargets = undefined
    }
  }

  const partialData = sanitizePartialData(activityId as ActivityId, raw.partialData)

  return {
    id: raw.id.trim(),
    petId: petId as PetId,
    activityId: activityId as ActivityId,
    roundIndex,
    roundTargets,
    partialData,
    completed,
    rewarded,
  }
}

const sanitizeScreen = (raw: unknown, activeMatch: ActiveMatch | null): ActiveScreen => {
  if (typeof raw !== 'string' || !VALID_SCREENS.includes(raw as ActiveScreen)) {
    return 'welcome'
  }
  const screen = raw as ActiveScreen
  // Si la pantalla es una actividad pero no existe una partida activa válida, recuperar al hogar
  if (screen.startsWith('activity-')) {
    if (!activeMatch) {
      return 'home'
    }
    // currentScreen debe coincidir con activeMatch.activityId al cargar o recuperar seguro
    const expectedScreen: ActiveScreen = `activity-${activeMatch.activityId}`
    if (screen !== expectedScreen) {
      return expectedScreen
    }
  }
  return screen
}

export const loadGameState = (): GameState => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY)
    if (!serialized) return createDefaultGameState()

    const parsed: unknown = JSON.parse(serialized)
    if (!isRecord(parsed)) return createDefaultGameState()

    const selectedPetRaw = String(parsed.selectedPetId)
    const selectedPetId: PetId = PET_IDS.includes(selectedPetRaw as PetId)
      ? (selectedPetRaw as PetId)
      : 'monkey'

    const rawPets = isRecord(parsed.pets) ? parsed.pets : {}
    const pets: Record<PetId, PetProgress> = {
      monkey: sanitizePet('monkey', rawPets.monkey),
      turtle: sanitizePet('turtle', rawPets.turtle),
      toucan: sanitizePet('toucan', rawPets.toucan),
    }

    const rawSettings = isRecord(parsed.settings) ? parsed.settings : {}
    const soundEnabled = typeof rawSettings.soundEnabled === 'boolean' ? rawSettings.soundEnabled : true

    // Sanitizar completedMatchIds sin slice(-100), preservando todos los IDs únicos para idempotencia total
    const rawMatches = Array.isArray(parsed.completedMatchIds) ? parsed.completedMatchIds : []
    const completedMatchIds: string[] = Array.from(
      new Set(rawMatches.filter((m): m is string => typeof m === 'string' && m.trim().length > 0))
    )

    const activeMatch = sanitizeActiveMatch(parsed.activeMatch)
    const currentScreen = sanitizeScreen(parsed.currentScreen, activeMatch)

    return {
      version: 1, // Normalización de esquema ante versiones desconocidas o futuras
      currentScreen,
      selectedPetId,
      pets,
      settings: { soundEnabled },
      completedMatchIds,
      activeMatch,
    }
  } catch {
    return createDefaultGameState()
  }
}

export const saveGameState = (state: GameState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Falla silenciosa si localStorage está bloqueado o lleno; no romper la UX
  }
}

export const clearGameState = (): GameState => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignorar error de acceso
  }
  return createDefaultGameState()
}
