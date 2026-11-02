import { useState } from 'react'
import type { DifficultyLevel, PetProgress } from '../game/types'
import { getPedagogicalRecommendation } from '../game/rules'
import { SoundOnIcon, SoundOffIcon, SparkleIcon, CloseIcon } from './svg/Icons'

interface AdultModalProps {
  isOpen: boolean
  soundEnabled: boolean
  difficultyLevel?: DifficultyLevel
  activePet?: PetProgress
  onToggleSound: () => void
  onChangeDifficulty?: (level: DifficultyLevel) => void
  onResetGame: () => void
  onClose: () => void
}

export default function AdultModal({
  isOpen,
  soundEnabled,
  difficultyLevel = 'initial',
  activePet,
  onToggleSound,
  onChangeDifficulty,
  onResetGame,
  onClose,
}: AdultModalProps) {
  const [confirmReset, setConfirmReset] = useState(false)

  if (!isOpen) return null

  const handleConfirmReset = () => {
    onResetGame()
    setConfirmReset(false)
    onClose()
  }

  // Recomendación pedagógica basada en el desempeño de la mascota activa
  const recommendation = activePet
    ? getPedagogicalRecommendation(activePet, difficultyLevel)
    : null

  const isRecommendedDiff =
    recommendation && recommendation.recommendedDifficulty !== difficultyLevel

  const getDifficultyName = (lvl: DifficultyLevel): string => {
    switch (lvl) {
      case 'initial':
        return 'Inicial (~3 años)'
      case 'medium':
        return 'Medio (~4 años)'
      case 'advanced':
        return 'Avanzado (~5 años)'
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Ajustes para adultos">
      <div className="modal-card adult-modal-card">
        <header className="modal-header">
          <h2 className="modal-title">Zona de Adultos</h2>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Cerrar ajustes"
            style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <CloseIcon size={24} />
          </button>
        </header>

        <div className="modal-body">
          {/* Tarjeta de recomendación pedagógica basada en desempeño real */}
          {activePet && recommendation && (
            <div className="recommendation-card" role="region" aria-label="Recomendación pedagógica">
              <div className="recommendation-header-row">
                <div className="recommendation-badge-tag">
                  <SparkleIcon size={20} />
                  <span>Sugerencia para {activePet.name}</span>
                </div>
                <span className="recommendation-diff-highlight">
                  {getDifficultyName(recommendation.recommendedDifficulty)}
                </span>
              </div>

              <p className="recommendation-reason-text">{recommendation.reason}</p>

              {isRecommendedDiff && onChangeDifficulty && (
                <button
                  type="button"
                  className="btn-apply-recommendation"
                  onClick={() => onChangeDifficulty(recommendation.recommendedDifficulty)}
                  aria-label={`Aplicar nivel recomendado: ${getDifficultyName(recommendation.recommendedDifficulty)}`}
                >
                  Aplicar nivel recomendado
                </button>
              )}
            </div>
          )}

          {/* Selección manual del nivel pedagógico de dificultad (siempre accesible) */}
          <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
            <div className="setting-info">
              <span className="setting-label">Nivel de aprendizaje</span>
              <span className="setting-desc">Elige manualmente el nivel deseado en cualquier momento</span>
            </div>
            <div className="difficulty-selector-group" role="radiogroup" aria-label="Nivel de dificultad manual">
              {(
                [
                  { id: 'initial', label: 'Inicial', age: '~3 años' },
                  { id: 'medium', label: 'Medio', age: '~4 años' },
                  { id: 'advanced', label: 'Avanzado', age: '~5 años' },
                ] as const
              ).map((opt) => {
                const isSelected = difficultyLevel === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`difficulty-pill-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => onChangeDifficulty?.(opt.id)}
                  >
                    <span className="diff-pill-label">{opt.label}</span>
                    <span className="diff-pill-age">{opt.age}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Control de sonido */}
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Sonido del juego</span>
              <span className="setting-desc">{soundEnabled ? 'Efectos y voces activados' : 'Silencio'}</span>
            </div>
            <button
              type="button"
              className={`toggle-btn ${soundEnabled ? 'active' : ''}`}
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}
            >
              {soundEnabled ? <SoundOnIcon size={28} /> : <SoundOffIcon size={28} />}
            </button>
          </div>

          {/* Reinicio de progreso con confirmación propia */}
          <div className="setting-row-danger">
            {!confirmReset ? (
              <button
                type="button"
                className="btn-secondary-danger"
                onClick={() => setConfirmReset(true)}
              >
                Reiniciar todo el progreso
              </button>
            ) : (
              <div className="confirm-box">
                <p className="confirm-text">¿Reiniciar el crecimiento de todas las mascotas a cero?</p>
                <div className="confirm-actions">
                  <button
                    type="button"
                    className="btn-confirm-yes"
                    onClick={handleConfirmReset}
                  >
                    Sí, reiniciar
                  </button>
                  <button
                    type="button"
                    className="btn-confirm-no"
                    onClick={() => setConfirmReset(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="modal-footer">
          <button type="button" className="btn-primary-action" onClick={onClose}>
            Listo
          </button>
        </footer>
      </div>
    </div>
  )
}
