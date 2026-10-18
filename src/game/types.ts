/* ============================================================
   Muyu: Crece Conmigo — Tipos del Modelo de Juego (Fase 4 / PRD V2)
   ============================================================ */

export type PetId = 'monkey' | 'turtle' | 'toucan'

export type GrowthStage = 'baby' | 'sprout' | 'young' | 'adult'

export type PetReaction =
  | 'none'
  | 'idle'
  | 'happy'
  | 'tap'
  | 'eating'
  | 'feed'
  | 'petting'
  | 'pet'

export type DifficultyLevel = 'initial' | 'medium' | 'advanced'

export type MedalId =
  | 'first_activity'
  | 'first_feed'
  | 'three_distinct_types'
  | 'first_evolution'
  | 'seven_distinct_types'
  | 'adult'
  | 'primera_actividad'
  | 'primer_alimento'
  | '3_tipos_distintos'
  | 'primera_evolucion'
  | '7_tipos'
  | 'adulto'

export interface PetMedal {
  id: MedalId
  title: string
  description: string
  unlocked: boolean
  unlockedAtStage?: GrowthStage
}

export interface MatchResult {
  stars: 1 | 2 | 3
  previousBestStars: number
  deltaStars: number
  deltaPoints: number
  fruitEarned: number
  growthEarned: number
  errorsCount: number
  hintsUsed: number
}

export interface RecommendationInfo {
  recommendedDifficulty: DifficultyLevel
  reason: string
  canAdvance: boolean
}

export interface PetGrowthProgress {
  growthUnits: number
  currentStage: GrowthStage
  nextStage: GrowthStage | null
  currentThreshold: number
  nextThreshold: number | null
  progressPercent: number
  canEvolve: boolean
}

export type AccessoryCategory = 'head' | 'face' | 'neck' | 'back'

export type AccessoryId =
  // CABEZA
  | 'orange_cap'
  | 'explorer_hat'
  | 'leaf_crown'
  | 'color_bow'
  // ROSTRO
  | 'round_glasses'
  | 'star_glasses'
  // CUELLO/PECHO
  | 'explorer_scarf'
  | 'gold_medal'
  | 'flower_necklace'
  // ESPALDA/CUERPO
  | 'small_backpack'
  | 'explorer_backpack'
  | 'short_cape'

export interface AccessoryItem {
  id: AccessoryId
  name: string
  category: AccessoryCategory
  price: number // en puntos canjeables (ej. 30, 40, 50, 60)
  description: string
  previewSvgId: string
}

export type EquippedAccessories = {
  [K in AccessoryCategory]?: AccessoryId | null
}

export interface PetProgress {
  id: PetId
  name: string
  stage: GrowthStage // baby -> sprout -> young -> adult
  foodCount: number // Alimentos disponibles para esta mascota (nunca negativo)
  growthUnits?: number // Unidades de crecimiento acumuladas (+10 primera combinación, +3 comida)
  feedingsInStage: number // 0 o 1 (compatibilidad legada)
  totalFeedings: number // Total acumulado de alimentaciones
  interactionsCount: number // Caricias / toques recibidos
  unlockedStages?: GrowthStage[] // Etapas desbloqueadas en el álbum
  bestStars?: Record<string, number> // Individuales por mascota: `${activityId}_${difficulty}` -> 1..3
  medals?: MedalId[] // Medallas ganadas por esta mascota individual
  coinsBalance?: number // Saldo canjeable de puntos para la Tienda del Bosque (desacoplado de records)
  purchasedAccessories?: AccessoryId[] // Accesorios comprados y disponibles en el ropero
  equippedAccessories?: EquippedAccessories // Accesorios actualmente equipados por categoría
}

export interface GameSettings {
  soundEnabled: boolean
  difficultyLevel: DifficultyLevel // Nivel pedagógico para 3, 4 y 5 años
}

export type ActiveScreen =
  | 'welcome'
  | 'select'
  | 'home'
  | 'forest'
  | 'activities'
  | 'album'
  | 'shop'
  | 'activity-counting'
  | 'activity-patterns'
  | 'activity-plant'
  | 'activity-habitats'
  | 'activity-listening'
  | 'activity-stories'
  | 'activity-shadows'

export type ActivityId =
  | 'counting'
  | 'patterns'
  | 'plant'
  | 'habitats'
  | 'listening'
  | 'stories'
  | 'shadows'

export interface ActivityCardInfo {
  id: ActivityId
  code: string // J1..J7
  title: string
  area: string
  subtitle: string
  isAvailable: boolean
}

export interface ActiveMatch {
  id: string
  petId: PetId
  activityId: ActivityId
  roundIndex: number // 0..2 (o 3 al completar)
  roundTargets?: number[] // Metas de conteo (1..5 o 1..6)
  partialData?: Record<string, unknown> // Datos de ronda activa
  completed: boolean
  rewarded: boolean
  difficulty?: DifficultyLevel
  contentVersion?: 1 | 2 // 1: V1 legado, 2: V2 canónico
  result?: MatchResult // Resultado real de la sesión para pantallas de resumen
}

export interface GameState {
  version: number
  currentScreen: ActiveScreen
  selectedPetId: PetId
  pets: Record<PetId, PetProgress>
  settings: GameSettings
  completedMatchIds: string[] // Registro permanente de partidas ya premiadas (idempotente)
  activeMatch: ActiveMatch | null
  bestStars?: Record<string, number> // Vista proyectada para la mascota seleccionada
  introSeen?: boolean
}
