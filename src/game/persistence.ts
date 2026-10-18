/* ============================================================
   Muyu: Crece Conmigo — Persistencia y Migración Determinista (Fase 4 / PRD V2)
   Adaptado con patrón de Tamagochi (MIT - 2026 Tamagochi contributors)
   Preserva intacta la clave V1 y migra de forma segura a V2
   ============================================================ */

import type {
  GameState,
  PetId,
  PetProgress,
  GrowthStage,
  ActiveMatch,
  ActiveScreen,
  ActivityId,
  DifficultyLevel,
  MatchResult,
  AccessoryId,
  EquippedAccessories,
} from './types.ts'
import {
  calculateFeedingsInStage,
  calculateGrowthUnitsForStage,
  getPetEarnedMedalIds,
  STAGE_ORDER,
} from './rules.ts'

export const STORAGE_KEY_V1 = 'muyu_game_save_v1'
export const STORAGE_KEY_V2 = 'muyu_game_save_v2'

const PET_IDS: readonly PetId[] = ['monkey', 'turtle', 'toucan']

const VALID_SCREENS: readonly ActiveScreen[] = [
  'welcome',
  'select',
  'home',
  'forest',
  'activities',
  'album',
  'shop',
  'activity-counting',
  'activity-patterns',
  'activity-plant',
  'activity-habitats',
  'activity-listening',
  'activity-stories',
  'activity-shadows',
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
    growthUnits: 0,
    feedingsInStage: 0,
    totalFeedings: 0,
    interactionsCount: 0,
    unlockedStages: ['baby'],
    bestStars: {},
    medals: [],
    coinsBalance: 0,
    purchasedAccessories: [],
    equippedAccessories: {},
  }
}

export const createDefaultGameState = (): GameState => ({
  version: 2,
  currentScreen: 'welcome',
  selectedPetId: 'monkey',
  pets: {
    monkey: createDefaultPet('monkey'),
    turtle: createDefaultPet('turtle'),
    toucan: createDefaultPet('toucan'),
  },
  settings: {
    soundEnabled: true,
    difficultyLevel: 'initial',
  },
  completedMatchIds: [],
  activeMatch: null,
  bestStars: {},
  introSeen: false,
})

const sanitizePet = (id: PetId, raw: unknown): PetProgress => {
  const defaultPet = createDefaultPet(id)
  if (!isRecord(raw)) return defaultPet

  const totalFeedings = integer(raw.totalFeedings, 0, 0, 999)
  const rawStage =
    typeof raw.stage === 'string' && STAGE_ORDER.includes(raw.stage as GrowthStage)
      ? (raw.stage as GrowthStage)
      : undefined

  // 1. Determinar etapa base y evaluar presencia de unlockedStages como certificador
  let maxStageIdx = rawStage ? STAGE_ORDER.indexOf(rawStage) : 0

  let rawUnlocked: GrowthStage[] = []
  if (Array.isArray(raw.unlockedStages)) {
    rawUnlocked = raw.unlockedStages.filter((s): s is GrowthStage =>
      STAGE_ORDER.includes(s as GrowthStage)
    )
    for (const s of rawUnlocked) {
      const idx = STAGE_ORDER.indexOf(s)
      if (idx > maxStageIdx) {
        maxStageIdx = idx
      }
    }
  }

  const hasExplicitGrowthUnits =
    typeof raw.growthUnits === 'number' && Number.isFinite(raw.growthUnits)

  if (!hasExplicitGrowthUnits) {
    // Para V1 o saves previos a Fase 4 (sin growthUnits), totalFeedings >= 6 certifica adulto según reglas legadas
    let legacyFeedIdx = 0
    if (totalFeedings >= 6) legacyFeedIdx = 3 // adult
    else if (totalFeedings >= 4) legacyFeedIdx = 2 // young
    else if (totalFeedings >= 2) legacyFeedIdx = 1 // sprout

    if (legacyFeedIdx > maxStageIdx) {
      maxStageIdx = legacyFeedIdx
    }
  }

  const stage = STAGE_ORDER[maxStageIdx]

  // Inicializa growthUnits con el piso mínimo equivalente a la etapa alcanzada
  const minGrowthForStage = calculateGrowthUnitsForStage(stage)
  const rawGrowth = hasExplicitGrowthUnits ? Math.floor(raw.growthUnits as number) : undefined
  const growthUnits = Math.max(minGrowthForStage, rawGrowth ?? minGrowthForStage)

  const feedingsInStage = calculateFeedingsInStage(totalFeedings)

  // Etapas desbloqueadas en el álbum: incluye todas las intermedias hasta la etapa alcanzada
  const defaultUnlocked = STAGE_ORDER.slice(0, maxStageIdx + 1)
  const unlockedStages = Array.from(new Set([...defaultUnlocked, ...rawUnlocked]))

  // Sanitización de estrellas individuales por mascota (21 combinaciones posibles)
  const bestStars: Record<string, number> = {}
  if (isRecord(raw.bestStars)) {
    const validActivities = [
      'counting',
      'patterns',
      'plant',
      'habitats',
      'listening',
      'stories',
      'shadows',
    ]
    const validDiffs = ['initial', 'medium', 'advanced']
    for (const [key, val] of Object.entries(raw.bestStars)) {
      const parts = key.split('_')
      if (
        parts.length === 2 &&
        validActivities.includes(parts[0]) &&
        validDiffs.includes(parts[1])
      ) {
        if (typeof val === 'number' && Number.isFinite(val) && val >= 1 && val <= 3) {
          bestStars[key] = Math.floor(val)
        }
      }
    }
  }

  // Sanitización de accesorios comprados y equipados
  const VALID_ACCESSORY_IDS: readonly AccessoryId[] = [
    'orange_cap',
    'explorer_hat',
    'leaf_crown',
    'color_bow',
    'round_glasses',
    'star_glasses',
    'explorer_scarf',
    'gold_medal',
    'flower_necklace',
    'small_backpack',
    'explorer_backpack',
    'short_cape',
  ]

  let purchasedAccessories: AccessoryId[] = []
  if (Array.isArray(raw.purchasedAccessories)) {
    purchasedAccessories = Array.from(
      new Set(
        raw.purchasedAccessories.filter((acc): acc is AccessoryId =>
          typeof acc === 'string' && VALID_ACCESSORY_IDS.includes(acc as AccessoryId)
        )
      )
    )
  }

  const equippedAccessories: EquippedAccessories = {}
  if (isRecord(raw.equippedAccessories)) {
    const categories: Array<'head' | 'face' | 'neck' | 'back'> = ['head', 'face', 'neck', 'back']
    for (const cat of categories) {
      const val = raw.equippedAccessories[cat]
      if (
        typeof val === 'string' &&
        VALID_ACCESSORY_IDS.includes(val as AccessoryId) &&
        purchasedAccessories.includes(val as AccessoryId)
      ) {
        equippedAccessories[cat] = val as AccessoryId
      } else {
        equippedAccessories[cat] = null
      }
    }
  }

  // Inicialización idempotente del saldo canjeable (coinsBalance)
  // Si no existía coinsBalance previo en el guardado, se inicializa a partir de los puntos históricos calculados
  const rawCoins = raw.coinsBalance
  let coinsBalance: number
  if (typeof rawCoins === 'number' && Number.isFinite(rawCoins)) {
    coinsBalance = Math.max(0, Math.floor(rawCoins))
  } else {
    // Migración inicial: calcular puntos derivados de las estrellas existentes
    let initialPoints = 0
    for (const stars of Object.values(bestStars)) {
      initialPoints += stars * 10
    }
    coinsBalance = initialPoints
  }

  const petTemp: PetProgress = {
    id,
    name:
      typeof raw.name === 'string' && raw.name.trim().length > 0
        ? raw.name.slice(0, 30)
        : defaultPet.name,
    stage,
    foodCount: integer(raw.foodCount, 0, 0, 999),
    growthUnits,
    feedingsInStage,
    totalFeedings,
    interactionsCount: integer(raw.interactionsCount, 0, 0, 9999),
    unlockedStages,
    bestStars,
    coinsBalance,
    purchasedAccessories,
    equippedAccessories,
  }

  // Derivación determinista de medallas individuales
  petTemp.medals = getPetEarnedMedalIds(petTemp)

  return petTemp
}

export const sanitizePartialData = (
  activityId: ActivityId,
  raw: unknown
): Record<string, unknown> => {
  if (!isRecord(raw)) return {}

  const errorsCount =
    typeof raw.errorsCount === 'number' && Number.isFinite(raw.errorsCount)
      ? Math.max(0, Math.floor(raw.errorsCount))
      : 0

  const hintsUsed =
    typeof raw.hintsUsed === 'number' && Number.isFinite(raw.hintsUsed)
      ? Math.max(0, Math.floor(raw.hintsUsed))
      : 0

  const base: Record<string, unknown> = {
    errorsCount,
    hintsUsed,
  }

  if (activityId === 'counting') {
    const countRaw = raw.inBasketCount
    const inBasketCount =
      typeof countRaw === 'number' && Number.isFinite(countRaw)
        ? Math.max(0, Math.min(10, Math.floor(countRaw)))
        : 0
    return { ...base, inBasketCount }
  }

  if (activityId === 'plant') {
    const validPlantTools = ['water', 'sun', 'seed', 'soil', 'care', 'shoe', 'hat', 'ball']
    const givenItems = Array.isArray(raw.givenItems)
      ? raw.givenItems.filter((it): it is string => typeof it === 'string' && validPlantTools.includes(it))
      : []
    const stageRaw = raw.plantVisualStage
    const plantVisualStage =
      stageRaw === 1 || stageRaw === 2 || stageRaw === 3 ? stageRaw : 1
    return { ...base, givenItems, plantVisualStage }
  }

  if (activityId === 'patterns') {
    const validSymbols = ['circle', 'square', 'triangle', 'star', 'leaf', 'flower']
    const selectedAnswer =
      typeof raw.selectedAnswer === 'string' && validSymbols.includes(raw.selectedAnswer)
        ? raw.selectedAnswer
        : null
    return { ...base, selectedAnswer }
  }

  if (activityId === 'habitats') {
    const validHabitats = ['tree', 'river', 'ground']
    const validSpecies = ['toucan', 'monkey', 'fish', 'turtle', 'bear', 'armadillo']
    const placedAnimals: Record<string, string> = {}
    if (isRecord(raw.placedAnimals)) {
      for (const [k, v] of Object.entries(raw.placedAnimals)) {
        if (validSpecies.includes(k) && typeof v === 'string' && validHabitats.includes(v)) {
          placedAnimals[k] = v
        }
      }
    }
    return { ...base, placedAnimals }
  }

  if (activityId === 'stories') {
    let placedCards: unknown[] = []
    if (Array.isArray(raw.placedCards)) {
      placedCards = raw.placedCards.map((c) => {
        if (!isRecord(c)) return null
        if (typeof c.id === 'string' && typeof c.stepNumber === 'number') {
          return {
            id: c.id,
            stepNumber: c.stepNumber,
            title: typeof c.title === 'string' ? c.title : '',
            description: typeof c.description === 'string' ? c.description : '',
            illustrationKey: typeof c.illustrationKey === 'string' ? c.illustrationKey : '',
          }
        }
        return null
      })
    }
    return { ...base, placedCards }
  }

  if (activityId === 'shadows') {
    const matchedIds = Array.isArray(raw.matchedIds)
      ? Array.from(new Set(raw.matchedIds.filter((id): id is string => typeof id === 'string')))
      : []
    return { ...base, matchedIds }
  }

  return base
}

const sanitizeMatchResult = (raw: unknown): MatchResult | undefined => {
  if (!isRecord(raw)) return undefined

  const stars = integer(raw.stars, 1, 1, 3) as 1 | 2 | 3
  const previousBestStars = integer(raw.previousBestStars, 0, 0, 3)
  const deltaStars = integer(raw.deltaStars, 0, 0, 3)
  const deltaPoints = integer(raw.deltaPoints, 0, 0, 30)
  const fruitEarned = integer(raw.fruitEarned, 0, 0, 1)
  const growthEarned = integer(raw.growthEarned, 0, 0, 10)
  const errorsCount = integer(raw.errorsCount, 0, 0, 99)
  const hintsUsed = integer(raw.hintsUsed, 0, 0, 99)

  return {
    stars,
    previousBestStars,
    deltaStars,
    deltaPoints,
    fruitEarned,
    growthEarned,
    errorsCount,
    hintsUsed,
  }
}

const sanitizeActiveMatch = (
  raw: unknown,
  defaultContentVersion: 1 | 2 = 2
): ActiveMatch | null => {
  if (!isRecord(raw)) return null
  if (typeof raw.id !== 'string' || raw.id.trim().length === 0) return null
  const petId = String(raw.petId)
  if (!PET_IDS.includes(petId as PetId)) return null
  const activityId = String(raw.activityId)
  if (
    !['counting', 'patterns', 'plant', 'habitats', 'listening', 'stories', 'shadows'].includes(
      activityId
    )
  ) {
    return null
  }

  const roundIndex = integer(raw.roundIndex, 0, 0, 3)
  const completed = Boolean(raw.completed)
  const rewarded = Boolean(raw.rewarded)

  let roundTargets: number[] | undefined = undefined
  if (Array.isArray(raw.roundTargets)) {
    roundTargets = raw.roundTargets
      .map((n) => (typeof n === 'number' && Number.isFinite(n) ? Math.floor(n) : 0))
      .filter((n) => n >= 1 && n <= 10)
    if (roundTargets.length < 3) {
      roundTargets = undefined
    } else {
      roundTargets = roundTargets.slice(0, 3)
    }
  }

  const partialData = sanitizePartialData(activityId as ActivityId, raw.partialData)

  const difficulty: DifficultyLevel =
    raw.difficulty === 'medium' || raw.difficulty === 'advanced'
      ? (raw.difficulty as DifficultyLevel)
      : 'initial'

  const contentVersion: 1 | 2 =
    raw.contentVersion === 1 || raw.contentVersion === 2
      ? raw.contentVersion
      : defaultContentVersion

  const result = sanitizeMatchResult(raw.result)

  return {
    id: raw.id.trim(),
    petId: petId as PetId,
    activityId: activityId as ActivityId,
    roundIndex,
    roundTargets,
    partialData,
    completed,
    rewarded,
    difficulty,
    contentVersion,
    result,
  }
}

const sanitizeScreen = (raw: unknown, activeMatch: ActiveMatch | null): ActiveScreen => {
  if (typeof raw !== 'string' || !VALID_SCREENS.includes(raw as ActiveScreen)) {
    return 'welcome'
  }
  const screen = raw as ActiveScreen
  // Si la pantalla es una actividad pero no existe una partida activa válida, recuperar al bosque/hogar
  if (screen.startsWith('activity-')) {
    if (!activeMatch) {
      return 'forest'
    }
    const expectedScreen: ActiveScreen = `activity-${activeMatch.activityId}`
    if (screen !== expectedScreen) {
      return expectedScreen
    }
  }
  return screen
}

export const migrateV1ToV2 = (parsedV1: unknown): GameState => {
  if (!isRecord(parsedV1)) return createDefaultGameState()

  const selectedPetRaw = String(parsedV1.selectedPetId)
  const selectedPetId: PetId = PET_IDS.includes(selectedPetRaw as PetId)
    ? (selectedPetRaw as PetId)
    : 'monkey'

  const rawPets = isRecord(parsedV1.pets) ? parsedV1.pets : {}
  const pets: Record<PetId, PetProgress> = {
    monkey: sanitizePet('monkey', rawPets.monkey),
    turtle: sanitizePet('turtle', rawPets.turtle),
    toucan: sanitizePet('toucan', rawPets.toucan),
  }

  const rawSettings = isRecord(parsedV1.settings) ? parsedV1.settings : {}
  const soundEnabled =
    typeof rawSettings.soundEnabled === 'boolean' ? rawSettings.soundEnabled : true
  const difficultyLevel: DifficultyLevel =
    rawSettings.difficultyLevel === 'medium' || rawSettings.difficultyLevel === 'advanced'
      ? rawSettings.difficultyLevel
      : 'initial'

  const rawMatches = Array.isArray(parsedV1.completedMatchIds) ? parsedV1.completedMatchIds : []
  const completedMatchIds: string[] = Array.from(
    new Set(rawMatches.filter((m): m is string => typeof m === 'string' && m.trim().length > 0))
  )

  // Partidas migradas desde V1 reciben contentVersion: 1 por compatibilidad legada
  const activeMatch = sanitizeActiveMatch(parsedV1.activeMatch, 1)
  const currentScreen = sanitizeScreen(parsedV1.currentScreen, activeMatch)

  // Vista proyectada de bestStars para la mascota activa
  const bestStars = pets[selectedPetId].bestStars || {}

  return {
    version: 2,
    currentScreen,
    selectedPetId,
    pets,
    settings: {
      soundEnabled,
      difficultyLevel,
    },
    completedMatchIds,
    activeMatch,
    bestStars,
    introSeen: Boolean(parsedV1.introSeen),
  }
}

export const normalizeV2GameState = (parsedV2: Record<string, unknown>): GameState => {
  const selectedPetRaw = String(parsedV2.selectedPetId)
  const selectedPetId: PetId = PET_IDS.includes(selectedPetRaw as PetId)
    ? (selectedPetRaw as PetId)
    : 'monkey'

  const rawPets = isRecord(parsedV2.pets) ? parsedV2.pets : {}
  const pets: Record<PetId, PetProgress> = {
    monkey: sanitizePet('monkey', rawPets.monkey),
    turtle: sanitizePet('turtle', rawPets.turtle),
    toucan: sanitizePet('toucan', rawPets.toucan),
  }

  const rawSettings = isRecord(parsedV2.settings) ? parsedV2.settings : {}
  const soundEnabled =
    typeof rawSettings.soundEnabled === 'boolean' ? rawSettings.soundEnabled : true
  const difficultyLevel: DifficultyLevel =
    rawSettings.difficultyLevel === 'medium' || rawSettings.difficultyLevel === 'advanced'
      ? rawSettings.difficultyLevel
      : 'initial'

  const rawMatches = Array.isArray(parsedV2.completedMatchIds) ? parsedV2.completedMatchIds : []
  const completedMatchIds: string[] = Array.from(
    new Set(rawMatches.filter((m): m is string => typeof m === 'string' && m.trim().length > 0))
  )

  // En V2, las sesiones activas conservan su flag de contentVersion (1 o 2), con 2 por defecto
  const activeMatch = sanitizeActiveMatch(parsedV2.activeMatch, 2)
  const currentScreen = sanitizeScreen(parsedV2.currentScreen, activeMatch)

  const bestStars = pets[selectedPetId].bestStars || {}

  return {
    version: 2,
    currentScreen,
    selectedPetId,
    pets,
    settings: {
      soundEnabled,
      difficultyLevel,
    },
    completedMatchIds,
    activeMatch,
    bestStars,
    introSeen: Boolean(parsedV2.introSeen),
  }
}

export const loadGameState = (): GameState => {
  try {
    // 1. Intentar cargar desde la clave nueva V2
    const serializedV2 = localStorage.getItem(STORAGE_KEY_V2)
    if (serializedV2) {
      try {
        const parsed: unknown = JSON.parse(serializedV2)
        if (isRecord(parsed)) {
          return normalizeV2GameState(parsed)
        }
      } catch {
        // V2 corrupto: proceder inmediatamente al fallback de V1 válido
      }
    }

    // 2. Si no hay V2 o V2 es JSON corrupto, buscar V1 y migrar conservando V1 INTACTA
    const serializedV1 = localStorage.getItem(STORAGE_KEY_V1)
    if (serializedV1) {
      try {
        const parsedV1: unknown = JSON.parse(serializedV1)
        if (isRecord(parsedV1)) {
          const migrated = migrateV1ToV2(parsedV1)
          try {
            localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migrated))
          } catch {
            // Ignorar error de cuota
          }
          return migrated
        }
      } catch {
        // V1 corrupto también
      }
    }

    return createDefaultGameState()
  } catch {
    return createDefaultGameState()
  }
}

export const saveGameState = (state: GameState): void => {
  try {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(state))
  } catch {
    // Falla silenciosa si localStorage está bloqueado o lleno; no romper la UX
  }
}

export const clearGameState = (): GameState => {
  try {
    localStorage.removeItem(STORAGE_KEY_V2)
  } catch {
    // Ignorar error de acceso
  }
  return createDefaultGameState()
}
