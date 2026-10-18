import type { ActivityId, DifficultyLevel, PetProgress } from '../game/types'
import { ACTIVITIES_CATALOG, getPetTotalScore } from '../game/rules'
import {
  BackIcon,
  BasketGameIcon,
  PlantGameIcon,
  ListenGameIcon,
  PatternsGameIcon,
  HabitatsGameIcon,
  StoriesGameIcon,
  ShadowsGameIcon,
  StarIcon,
} from '../components/svg/Icons'
import { TropicalHills } from '../components/svg/Scenery'

interface ActivitiesScreenProps {
  pet: PetProgress
  difficultyLevel: DifficultyLevel
  bestStars?: Record<string, number>
  onLaunchActivity: (activityId: ActivityId) => void
  onBackToForest: () => void
}

export default function ActivitiesScreen({
  pet,
  difficultyLevel,
  bestStars = {},
  onLaunchActivity,
  onBackToForest,
}: ActivitiesScreenProps) {
  const petScore = getPetTotalScore(pet)

  const renderIcon = (id: ActivityId) => {
    switch (id) {
      case 'counting':
        return <BasketGameIcon size={56} />
      case 'patterns':
        return <PatternsGameIcon size={56} />
      case 'plant':
        return <PlantGameIcon size={56} />
      case 'habitats':
        return <HabitatsGameIcon size={56} />
      case 'listening':
        return <ListenGameIcon size={56} />
      case 'stories':
        return <StoriesGameIcon size={56} />
      case 'shadows':
        return <ShadowsGameIcon size={56} />
    }
  }

  const diffLabel =
    difficultyLevel === 'initial'
      ? 'Inicial (~3 años)'
      : difficultyLevel === 'medium'
        ? 'Medio (~4 años)'
        : 'Avanzado (~5 años)'

  return (
    <main className="screen-container activities-catalog-screen">
      {/* Barra superior con navegación clara, nivel y puntuación individual */}
      <header className="top-nav-bar catalog-nav-bar">
        <button
          type="button"
          className="btn-round-nav"
          onClick={onBackToForest}
          aria-label="Volver al bosque"
        >
          <BackIcon size={32} />
        </button>

        <div className="catalog-header-text">
          <h2 className="screen-header-title">Actividades del Bosque</h2>
          <div className="catalog-status-tags">
            <span className="catalog-difficulty-badge">Nivel: {diffLabel}</span>
            <span className="catalog-pet-score-badge" aria-label={`Puntos de ${pet.name}: ${petScore} de 630 puntos`}>
              <StarIcon size={18} filled={true} />
              <span>{pet.name}: {petScore} pts</span>
            </span>
          </div>
        </div>

        <div style={{ width: '48px' }} aria-hidden="true" />
      </header>

      {/* Grid de las exactamente 7 actividades canónicas */}
      <div className="activities-grid-container" role="list" aria-label="Catálogo de 7 actividades">
        {ACTIVITIES_CATALOG.map((item) => {
          const starsKey = `${item.id}_${difficultyLevel}`
          const stars = pet.bestStars?.[starsKey] ?? bestStars[starsKey] ?? 0

          return (
            <button
              key={item.id}
              type="button"
              className="activity-card-item card-available"
              onClick={() => onLaunchActivity(item.id)}
              aria-label={`${item.code}: ${item.title}. ${item.subtitle}. ${stars} estrellas obtenidas en nivel ${diffLabel}. Toca para jugar`}
            >
              <div className="activity-card-top-row">
                <span className="activity-code-badge">{item.code}</span>
                <span className="activity-area-tag">{item.area}</span>
              </div>

              <div className="activity-card-icon-wrap">
                {renderIcon(item.id)}
              </div>

              <div className="activity-card-info">
                <h3 className="activity-card-title">{item.title}</h3>
                <p className="activity-card-desc">{item.subtitle}</p>
              </div>

              <div className="activity-card-footer">
                <div
                  className="activity-stars-row"
                  aria-label={`${stars} de 3 estrellas conseguidas por ${pet.name}`}
                >
                  {[1, 2, 3].map((s) => (
                    <StarIcon key={s} size={24} filled={s <= stars} />
                  ))}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="scenery-layer hills-bottom">
        <TropicalHills />
      </div>
    </main>
  )
}
