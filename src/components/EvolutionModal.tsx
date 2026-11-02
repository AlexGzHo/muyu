import { useEffect } from 'react'
import type { PetId, GrowthStage, EquippedAccessories } from '../game/types'
import { CompositePetRenderer } from './svg/CompositePetRenderer'
import { SparkleIcon, StarIcon } from './svg/Icons'

interface EvolutionModalProps {
  isOpen: boolean
  petId: PetId
  petName: string
  stage: GrowthStage
  equippedAccessories?: EquippedAccessories | null
  onClose: () => void
}

const STAGE_NAMES: Record<GrowthStage, string> = {
  baby: 'Bebé',
  sprout: 'Pequeño',
  young: 'Explorador',
  adult: 'Adulto',
}

const STAGE_DESCRIPTIONS: Record<PetId, Record<GrowthStage, string>> = {
  monkey: {
    baby: 'Pequeño, tierno y con curiosidad infinita por el bosque.',
    sprout: 'Ágil y juguetón con su colita enérgica en movimiento.',
    young: '¡Un explorador intrépido con su bandana de aventurero!',
    adult: 'Fuerte, sabio y coronado como guardián de la selva.',
  },
  turtle: {
    baby: 'Recién nacida con caparazón suave y mirada dulce.',
    sprout: 'Desarrollando sus primeras placas protectoras.',
    young: 'Navegante de ríos con caparazón geométrico ágil.',
    adult: 'Serena y majestuosa con su flor de loto florecida.',
  },
  toucan: {
    baby: 'Polluelo redondito con piquito tierno y plumón suave.',
    sprout: 'Iniciando el vuelo con pico de doble tono tropical.',
    young: 'Explorador de las copas con pico tricolor y alas vivaces.',
    adult: 'El rey del dosel con su pico aserrado y cresta dorada.',
  },
}

export default function EvolutionModal({
  isOpen,
  petId,
  petName,
  stage,
  equippedAccessories = null,
  onClose,
}: EvolutionModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const stageLabel = STAGE_NAMES[stage]
  const stageDescription = STAGE_DESCRIPTIONS[petId]?.[stage] || '¡Ha crecido felizmente en el bosque!'

  return (
    <div
      className="evolution-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`¡Evolución de ${petName}!`}
    >
      <div className="evolution-card">
        {/* Destellos festivos */}
        <div className="evolution-header-sparks">
          <SparkleIcon size={32} />
          <StarIcon size={36} filled={true} />
          <SparkleIcon size={32} />
        </div>

        <h2 className="evolution-title">¡EVOLUCIÓN!</h2>
        <p className="evolution-stage-desc">
          ¡{petName} ha alcanzado la etapa de <strong>{stageLabel}</strong>!
        </p>

        {/* Mascota en gran formato con aura de luz y accesorios */}
        <div className="evolution-pet-wrap">
          <div className="evolution-sparks-bg" aria-hidden="true" />
          <CompositePetRenderer
            id={petId}
            stage={stage}
            reaction="happy"
            size={220}
            equippedAccessories={equippedAccessories}
            className="evolution-pet-avatar"
          />
        </div>

        <p className="evolution-bio-text">{stageDescription}</p>

        <footer className="evolution-footer">
          <button
            type="button"
            className="btn-primary"
            style={{ width: '100%', minHeight: '56px', fontSize: '1.25rem' }}
            onClick={onClose}
            autoFocus
          >
            ¡Qué alegría!
          </button>
        </footer>
      </div>
    </div>
  )
}
