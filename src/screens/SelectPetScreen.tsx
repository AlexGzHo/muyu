import { useState } from 'react'
import type { PetId, PetProgress } from '../game/types'
import { PetRenderer } from '../components/svg/PetIllustrations'
import { BackIcon, SproutStageIcon } from '../components/svg/Icons'
import { TropicalHills } from '../components/svg/Scenery'

interface SelectPetScreenProps {
  pets: Record<PetId, PetProgress>
  selectedPetId: PetId
  onSelectPet: (id: PetId) => void
  onBack: () => void
}

const PET_DATA: Array<{ id: PetId; name: string; color: string; desc: string }> = [
  { id: 'monkey', name: 'Monito', color: '#FFD7BA', desc: 'Juguetón y curioso' },
  { id: 'turtle', name: 'Tortuguita', color: '#D8F3DC', desc: 'Tranquila y dulce' },
  { id: 'toucan', name: 'Tucancito', color: '#BDE0FE', desc: 'Colorido y alegre' },
]

export default function SelectPetScreen({
  pets,
  selectedPetId,
  onSelectPet,
  onBack,
}: SelectPetScreenProps) {
  const [animatingId, setAnimatingId] = useState<PetId | null>(null)

  const handlePick = (id: PetId) => {
    setAnimatingId(id)
    setTimeout(() => {
      onSelectPet(id)
    }, 280)
  }

  return (
    <main className="screen-container select-screen">
      {/* Barra superior con botón volver */}
      <header className="top-nav-bar">
        <button
          type="button"
          className="btn-round-nav"
          onClick={onBack}
          aria-label="Volver a la bienvenida"
        >
          <BackIcon size={32} />
        </button>
        <h2 className="screen-header-title">Elige tu amigo</h2>
        <div style={{ width: '64px' }} aria-hidden="true" />
      </header>

      {/* Grid de las tres mascotas */}
      <div className="pet-cards-container">
        {PET_DATA.map((item) => {
          const pet = pets[item.id]
          const isSelected = selectedPetId === item.id
          const isAnimating = animatingId === item.id

          return (
            <button
              key={item.id}
              type="button"
              className={`pet-selection-card ${isSelected ? 'selected' : ''} ${isAnimating ? 'picked-bounce' : ''}`}
              style={{ backgroundColor: item.color }}
              onClick={() => handlePick(item.id)}
              aria-label={`Elegir ${item.name}`}
            >
              <div className="pet-card-avatar">
                <PetRenderer
                  id={item.id}
                  stage={pet.stage}
                  reaction={isAnimating ? 'tap' : 'none'}
                  size={150}
                />
              </div>

              <div className="pet-card-info">
                <h3 className="pet-card-name">{item.name}</h3>

                {/* Indicador pictográfico de etapa actual */}
                {(() => {
                  const stageText = pet.stage === 'baby' ? 'Bebé' : pet.stage === 'sprout' ? 'Joven' : pet.stage === 'young' ? 'Explorador' : 'Adulto'
                  return (
                    <div className="pet-card-stage-indicator" aria-label={`Etapa: ${stageText}`}>
                      <SproutStageIcon size={22} active={true} />
                      <span className="stage-name-badge">{stageText}</span>
                    </div>
                  )
                })()}
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
