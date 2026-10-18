/* ============================================================
   Muyu: Crece Conmigo — Tipos del Modelo de Juego (Fase 3)
   ============================================================ */

export type PetId = 'monkey' | 'turtle' | 'toucan'

export type GrowthStage = 'baby' | 'sprout' | 'young' | 'adult'

export interface PetProgress {
  id: PetId
  name: string
  stage: GrowthStage // baby -> sprout -> young -> adult
  foodCount: number // Alimentos disponibles para esta mascota (nunca negativo)
  feedingsInStage: number // 0 o 1 (cada 2 alimentaciones avanza de etapa)
  totalFeedings: number // Total acumulado de alimentaciones (6 para adulto)
  interactionsCount: number // Caricias / toques recibidos
}

export interface GameSettings {
  soundEnabled: boolean
}

export type ActiveScreen =
  | 'welcome'
  | 'select'
  | 'home'
  | 'activity-counting'
  | 'activity-plant'
  | 'activity-listening'

export type ActivityId = 'counting' | 'plant' | 'listening'

export interface ActiveMatch {
  id: string
  petId: PetId
  activityId: ActivityId
  roundIndex: number // 0..2 (o 3 al completar)
  roundTargets?: number[] // Metas de conteo (1..5)
  partialData?: Record<string, unknown> // Datos de ronda activa
  completed: boolean
  rewarded: boolean
}

export interface GameState {
  version: number
  currentScreen: ActiveScreen
  selectedPetId: PetId
  pets: Record<PetId, PetProgress>
  settings: GameSettings
  completedMatchIds: string[] // Registro permanente de partidas ya premiadas (idempotente)
  activeMatch: ActiveMatch | null
}
