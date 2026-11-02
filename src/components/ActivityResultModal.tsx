import type { EquippedAccessories, GrowthStage, PetId } from '../game/types'
import { CompositePetRenderer } from './svg/CompositePetRenderer'
import { StarIcon, FoodFruitIcon, PlayIcon, TreeIcon, SparkleIcon } from './svg/Icons'

interface ActivityResultModalProps {
  isOpen: boolean
  activityTitle: string
  petId: PetId
  petName: string
  stage?: GrowthStage
  equippedAccessories?: EquippedAccessories | null
  starsEarned?: number
  onReplay: () => void
  onBackToForest: () => void
}

export default function ActivityResultModal({
  isOpen,
  activityTitle,
  petId,
  petName,
  stage = 'baby',
  equippedAccessories = null,
  starsEarned = 3,
  onReplay,
  onBackToForest,
}: ActivityResultModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="activity-result-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="¡Actividad completada con éxito!"
    >
      <div className="activity-result-card">
        {/* Destellos festivos superiores */}
        <div className="result-sparkles-row">
          <SparkleIcon size={28} />
          <span className="result-congrats-pill">¡Completado!</span>
          <SparkleIcon size={28} />
        </div>

        <h2 className="result-game-title">{activityTitle}</h2>

        {/* Fila de 3 estrellas ganadas */}
        <div className="result-stars-display" aria-label={`${starsEarned} estrellas ganadas`}>
          {[1, 2, 3].map((s) => (
            <div key={s} className={`result-star-wrapper ${s <= starsEarned ? 'star-pop' : ''}`}>
              <StarIcon size={46} filled={s <= starsEarned} />
            </div>
          ))}
        </div>

        {/* Mascota activa sonriendo feliz con etapa real y accesorios */}
        <div className="result-pet-avatar-wrap">
          <CompositePetRenderer
            id={petId}
            stage={stage}
            reaction="happy"
            size={170}
            equippedAccessories={equippedAccessories}
          />
        </div>

        {/* Recompensa atómica: exactamente 1 fruta deliciosa */}
        <div className="result-reward-pill">
          <FoodFruitIcon size={40} />
          <div className="result-reward-text">
            <span className="reward-label">+1 Fruta fresca ganada</span>
            <span className="reward-sub">¡Para alimentar y hacer crecer a {petName}!</span>
          </div>
        </div>

        {/* Botones de acción táctiles grandes (>= 64px) */}
        <div className="result-actions-grid">
          <button
            type="button"
            className="btn-result-action btn-result-replay"
            onClick={onReplay}
            aria-label="Jugar otra vez esta actividad"
          >
            <PlayIcon size={34} />
            <span>Repetir</span>
          </button>

          <button
            type="button"
            className="btn-result-action btn-result-forest"
            onClick={onBackToForest}
            aria-label="Regresar al bosque central"
          >
            <TreeIcon size={34} />
            <span>Al Bosque</span>
          </button>
        </div>
      </div>
    </div>
  )
}
