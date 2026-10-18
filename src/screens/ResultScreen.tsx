import { useEffect } from 'react'
import type { ActiveMatch, PetProgress, ActivityId } from '../game/types'
import { ACTIVITIES_CATALOG, getPetTotalScore } from '../game/rules'
import { PetRenderer } from '../components/svg/PetIllustrations'
import {
  StarIcon,
  FoodFruitIcon,
  RepeatIcon,
  TreeIcon,
  SparkleIcon,
  SproutStageIcon,
} from '../components/svg/Icons'
import { TropicalSun, TropicalHills, DeepForestBackdrop } from '../components/svg/Scenery'
import { soundManager } from '../audio/soundManager'

interface ResultScreenProps {
  activeMatch: ActiveMatch
  pet: PetProgress
  soundEnabled: boolean
  onRestart: (activityId: ActivityId) => void
  onExit: () => void
}

export default function ResultScreen({
  activeMatch,
  pet,
  soundEnabled,
  onRestart,
  onExit,
}: ResultScreenProps) {
  const result = activeMatch.result
  const totalScore = getPetTotalScore(pet)

  const activityInfo = ACTIVITIES_CATALOG.find((a) => a.id === activeMatch.activityId)
  const activityTitle = activityInfo ? activityInfo.title : 'Actividad del Bosque'

  useEffect(() => {
    soundManager.playSuccess(soundEnabled)
    soundManager.speakSpanish('¡Excelente trabajo! Ganaste una fruta para tu amigo.', soundEnabled)
  }, [soundEnabled])

  return (
    <main className="screen-container result-screen">
      {/* Fondo de bosque y escenografía */}
      <div className="forest-backdrop-full" aria-hidden="true">
        <DeepForestBackdrop />
      </div>

      <div className="sun-decoration-home">
        <TropicalSun width="85" height="85" />
      </div>

      {/* Contenedor central de la celebración */}
      <div className="result-card-container">
        {/* Cabecera con destellos */}
        <header className="result-header">
          <div className="result-sparkles-row" aria-hidden="true">
            <SparkleIcon size={30} />
            <span className="result-badge-code">{activityInfo?.code || 'MUYU'}</span>
            <SparkleIcon size={30} />
          </div>
          <h1 className="result-title">¡Bien Hecho!</h1>
          <p className="result-activity-name">{activityTitle}</p>
        </header>

        {/* Estrellas de desempeño SVG */}
        {result ? (
          <section className="result-stars-section" aria-label={`Obtuviste ${result.stars} de 3 estrellas`}>
            <div className="result-stars-row">
              {[1, 2, 3].map((s) => {
                const filled = s <= result.stars
                return (
                  <div
                    key={s}
                    className={`result-star-wrapper ${filled ? 'star-filled pulse-gentle' : 'star-unfilled'}`}
                  >
                    <StarIcon size={56} filled={filled} />
                  </div>
                )
              })}
            </div>
            {result.deltaStars > 0 && (
              <div className="result-record-pill">
                <SparkleIcon size={20} />
                <span>¡Nueva mejor marca personal!</span>
              </div>
            )}
          </section>
        ) : (
          <section className="result-stars-section" aria-label="Partida guardada completada">
            <div className="result-legacy-pill">
              <SparkleIcon size={24} />
              <span>¡Actividad superada con éxito!</span>
            </div>
          </section>
        )}

        {/* Mascota protagonista alegre */}
        <section className="result-pet-stage" aria-label={`${pet.name} celebra contigo`}>
          <div className="result-pet-glow" />
          <PetRenderer
            id={pet.id}
            stage={pet.stage}
            reaction="happy"
            size={190}
          />
        </section>

        {/* Recompensas reales obtenidas (1 fruta real + puntos reales) */}
        <section className="result-rewards-grid" aria-label="Recompensas obtenidas">
          {/* 1 Fruta real ganada */}
          <div className="result-reward-pill reward-fruit">
            <div className="reward-icon-wrap">
              <FoodFruitIcon size={42} />
            </div>
            <div className="reward-text-col">
              <span className="reward-val">+1 Fruta</span>
              <span className="reward-desc">Alimento ganado</span>
            </div>
          </div>

          {/* Puntuación individual de la mascota */}
          <div className="result-reward-pill reward-score">
            <div className="reward-icon-wrap">
              <StarIcon size={36} filled={true} />
            </div>
            <div className="reward-text-col">
              <span className="reward-val">
                {result && result.deltaPoints > 0 ? `+${result.deltaPoints} pts` : `${totalScore} pts`}
              </span>
              <span className="reward-desc">
                {result && result.deltaPoints > 0
                  ? `Total: ${totalScore} pts`
                  : 'Puntuación total'}
              </span>
            </div>
          </div>

          {/* Crecimiento ganado si fue primera combinación */}
          {result && result.growthEarned > 0 && (
            <div className="result-reward-pill reward-growth">
              <div className="reward-icon-wrap">
                <SproutStageIcon size={34} active={true} />
              </div>
              <div className="reward-text-col">
                <span className="reward-val">+{result.growthEarned} Crecimiento</span>
                <span className="reward-desc">¡Nuevo descubrimiento!</span>
              </div>
            </div>
          )}
        </section>

        {/* Botones grandes pictográficos Repetir y Bosque */}
        <nav className="result-actions-nav" aria-label="Acciones finales de la actividad">
          <button
            type="button"
            className="btn-result-action btn-result-repeat pulse-gentle"
            onClick={() => onRestart(activeMatch.activityId)}
            aria-label="Repetir esta actividad con un nuevo desafío"
          >
            <RepeatIcon size={38} />
            <span className="btn-result-text">REPETIR</span>
          </button>

          <button
            type="button"
            className="btn-result-action btn-result-forest"
            onClick={onExit}
            aria-label="Volver al bosque con tu mascota"
          >
            <TreeIcon size={38} />
            <span className="btn-result-text">BOSQUE</span>
          </button>
        </nav>
      </div>

      <div className="scenery-layer hills-bottom">
        <TropicalHills />
      </div>
    </main>
  )
}
