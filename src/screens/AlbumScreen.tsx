import { useState } from 'react'
import type { PetId, PetProgress, GrowthStage, DifficultyLevel } from '../game/types'
import {
  ACTIVITIES_CATALOG,
  getPetMedals,
  getPetTotalScore,
  getPetGrowthProgress,
  VALID_ACTIVITIES,
  VALID_DIFFICULTIES,
} from '../game/rules'
import { PetRenderer } from '../components/svg/PetIllustrations'
import { CompositePetRenderer } from '../components/svg/CompositePetRenderer'
import {
  BackIcon,
  SproutStageIcon,
  StarIcon,
  FoodFruitIcon,
  SparkleIcon,
  MedalBadgeIcon,
} from '../components/svg/Icons'
import { TropicalHills } from '../components/svg/Scenery'
import EvolutionModal from '../components/EvolutionModal'

interface AlbumScreenProps {
  pets: Record<PetId, PetProgress>
  initialPetId?: PetId
  completedMatchCount: number
  onBackToForest: () => void
}

const STAGE_LIST: readonly { id: GrowthStage; name: string }[] = [
  { id: 'baby', name: 'Bebé' },
  { id: 'sprout', name: 'Pequeño' },
  { id: 'young', name: 'Explorador' },
  { id: 'adult', name: 'Adulto' },
]

const DIFFICULTY_COLUMNS: readonly { id: DifficultyLevel; label: string; age: string }[] = [
  { id: 'initial', label: 'Inicial', age: '~3a' },
  { id: 'medium', label: 'Medio', age: '~4a' },
  { id: 'advanced', label: 'Avanzado', age: '~5a' },
]

export default function AlbumScreen({
  pets,
  initialPetId = 'monkey',
  onBackToForest,
}: AlbumScreenProps) {
  const [selectedPet, setSelectedPet] = useState<PetId>(initialPetId)
  const [replayingStage, setReplayingStage] = useState<GrowthStage | null>(null)
  const [activeTab, setActiveTab] = useState<'stages' | 'medals' | 'marks'>('stages')

  const currentPet = pets[selectedPet]
  const unlocked = currentPet.unlockedStages || ['baby']

  // Selectores canónicos
  const petScore = getPetTotalScore(currentPet)
  const petGrowth = getPetGrowthProgress(currentPet)
  const medals = getPetMedals(currentPet)
  const unlockedMedalsCount = medals.filter((m) => m.unlocked).length

  // Cálculo de las 21 marcas canónicas de juego + nivel
  let achievedMarksCount = 0
  VALID_ACTIVITIES.forEach((act) => {
    VALID_DIFFICULTIES.forEach((diff) => {
      if ((currentPet.bestStars?.[`${act}_${diff}`] ?? 0) > 0) {
        achievedMarksCount++
      }
    })
  })

  return (
    <main className="screen-container album-screen">
      {/* Barra superior con navegación */}
      <header className="top-nav-bar">
        <button
          type="button"
          className="btn-round-nav"
          onClick={onBackToForest}
          aria-label="Volver al bosque"
        >
          <BackIcon size={32} />
        </button>
        <h2 className="screen-header-title">Álbum del Bosque</h2>
        <div style={{ width: '48px' }} aria-hidden="true" />
      </header>

      {/* Selector visual de las 3 mascotas con PetRenderer */}
      <div className="album-pet-visual-tabs" role="tablist" aria-label="Seleccionar amigo para ver su álbum">
        {(['monkey', 'turtle', 'toucan'] as const).map((id) => {
          const p = pets[id]
          const isTabActive = selectedPet === id
          const stageName = STAGE_LIST.find((s) => s.id === p.stage)?.name ?? 'Bebé'
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isTabActive}
              className={`album-pet-visual-card ${isTabActive ? 'active' : ''}`}
              onClick={() => setSelectedPet(id)}
              aria-label={`Ver colección de ${p.name} (${stageName})`}
            >
              <div className="tab-pet-avatar">
                <PetRenderer id={id} stage={p.stage} size={56} />
              </div>
              <div className="tab-pet-info">
                <span className="tab-pet-name">{p.name}</span>
                <span className="tab-pet-score">
                  {getPetTotalScore(p)} pts
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Tarjeta de resumen de inventario y progreso */}
      <section className="album-stats-overview" aria-label="Resumen de progreso e inventario">
        <div className="overview-stat-pill">
          <FoodFruitIcon size={30} />
          <div className="stat-pill-text">
            <span className="stat-pill-val">{currentPet.foodCount}</span>
            <span className="stat-pill-label">Frutas</span>
          </div>
        </div>

        <div className="overview-stat-pill">
          <SproutStageIcon size={28} active={true} />
          <div className="stat-pill-text">
            <span className="stat-pill-val">{petGrowth.growthUnits} u</span>
            <span className="stat-pill-label">Crecimiento</span>
          </div>
        </div>

        <div className="overview-stat-pill">
          <StarIcon size={28} filled={true} />
          <div className="stat-pill-text">
            <span className="stat-pill-val">{petScore} / 630</span>
            <span className="stat-pill-label">Puntos</span>
          </div>
        </div>

        <div className="overview-stat-pill">
          <MedalBadgeIcon size={28} unlocked={true} />
          <div className="stat-pill-text">
            <span className="stat-pill-val">{unlockedMedalsCount} / 6</span>
            <span className="stat-pill-label">Medallas</span>
          </div>
        </div>
      </section>

      {/* Pestañas de secciones del Álbum: Formas, Medallas, 21 Marcas */}
      <div className="album-subnav-row" role="tablist" aria-label="Secciones del álbum">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'stages'}
          className={`album-subnav-btn ${activeTab === 'stages' ? 'active' : ''}`}
          onClick={() => setActiveTab('stages')}
        >
          Formas y Evolución
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'medals'}
          className={`album-subnav-btn ${activeTab === 'medals' ? 'active' : ''}`}
          onClick={() => setActiveTab('medals')}
        >
          6 Medallas ({unlockedMedalsCount}/6)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'marks'}
          className={`album-subnav-btn ${activeTab === 'marks' ? 'active' : ''}`}
          onClick={() => setActiveTab('marks')}
        >
          21 Marcas ({achievedMarksCount}/21)
        </button>
      </div>

      {/* 1. SECCIÓN: Formas desbloqueadas y Replay de Evolución */}
      {activeTab === 'stages' && (
        <section className="album-stages-section" aria-label={`Etapas de crecimiento de ${currentPet.name}`}>
          <div className="album-stages-grid">
            {STAGE_LIST.map((s, idx) => {
              const isUnlocked = unlocked.includes(s.id)
              const isCurrent = currentPet.stage === s.id

              return (
                <div
                  key={s.id}
                  className={`album-stage-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`}
                >
                  <div className="album-stage-avatar">
                    {isUnlocked ? (
                      isCurrent ? (
                        <CompositePetRenderer
                          id={selectedPet}
                          stage={s.id}
                          size={110}
                          equippedAccessories={currentPet.equippedAccessories}
                        />
                      ) : (
                        <PetRenderer id={selectedPet} stage={s.id} size={110} />
                      )
                    ) : (
                      <div className="album-stage-silhouette" aria-hidden="true">
                        <SproutStageIcon size={52} active={false} />
                        <span className="locked-label">Etapa {idx + 1}</span>
                      </div>
                    )}
                  </div>

                  <span className="album-stage-name">{s.name}</span>
                  {isCurrent && <span className="album-current-badge">Etapa Actual</span>}

                  {isUnlocked && (
                    <button
                      type="button"
                      className="btn-replay-evolution"
                      onClick={() => setReplayingStage(s.id)}
                      aria-label={`Ver celebración de evolución para la etapa ${s.name}`}
                    >
                      <SparkleIcon size={16} />
                      <span>Ver animación</span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 2. SECCIÓN: 6 Medallas Funcionales (getPetMedals) */}
      {activeTab === 'medals' && (
        <section className="album-medals-section" aria-label={`Medallas de ${currentPet.name}`}>
          <div className="album-medals-grid">
            {medals.map((m) => (
              <div
                key={m.id}
                className={`album-medal-card ${m.unlocked ? 'medal-unlocked' : 'medal-locked'}`}
              >
                <div className="medal-icon-wrap">
                  <MedalBadgeIcon size={54} unlocked={m.unlocked} />
                </div>
                <div className="medal-info-wrap">
                  <div className="medal-title-row">
                    <h4 className="medal-title">{m.title}</h4>
                    <span className={`medal-status-pill ${m.unlocked ? 'status-achieved' : 'status-locked'}`}>
                      {m.unlocked ? 'Logrado' : 'Pendiente'}
                    </span>
                  </div>
                  <p className="medal-desc">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. SECCIÓN: 21 Marcas canónicas (7 actividades x 3 dificultades, máximo 630 pts) */}
      {activeTab === 'marks' && (
        <section className="album-marks-section" aria-label="21 marcas canónicas de actividades">
          <div className="marks-summary-banner">
            <span>Marcas obtenidas: <strong>{achievedMarksCount} de 21</strong></span>
            <span>Puntos acumulados: <strong>{petScore} de 630</strong></span>
          </div>

          <div className="album-marks-table" role="table" aria-label="Tabla de 21 marcas por actividad y dificultad">
            <div className="marks-table-header" role="row">
              <span className="col-act" role="columnheader">Actividad</span>
              {DIFFICULTY_COLUMNS.map((col) => (
                <span key={col.id} className="col-diff" role="columnheader">
                  {col.label} <small>({col.age})</small>
                </span>
              ))}
            </div>

            {ACTIVITIES_CATALOG.map((act) => (
              <div key={act.id} className="marks-table-row" role="row">
                <div className="marks-act-info" role="rowheader">
                  <span className="marks-code-tag">{act.code}</span>
                  <span className="marks-title-text">{act.title}</span>
                </div>

                {DIFFICULTY_COLUMNS.map((col) => {
                  const key = `${act.id}_${col.id}`
                  const stars = currentPet.bestStars?.[key] ?? 0

                  return (
                    <div
                      key={col.id}
                      className={`marks-stars-cell ${stars > 0 ? 'cell-has-stars' : 'cell-empty'}`}
                      role="cell"
                      aria-label={`${act.title} nivel ${col.label}: ${stars} estrellas`}
                    >
                      <div className="cell-stars-wrapper">
                        {[1, 2, 3].map((s) => (
                          <StarIcon key={s} size={18} filled={s <= stars} />
                        ))}
                      </div>
                      <span className="cell-pts-text">{stars * 10} pts</span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="scenery-layer hills-bottom">
        <TropicalHills />
      </div>

      {replayingStage && (
        <EvolutionModal
          isOpen={true}
          petId={selectedPet}
          petName={currentPet.name}
          stage={replayingStage}
          onClose={() => setReplayingStage(null)}
        />
      )}
    </main>
  )
}
