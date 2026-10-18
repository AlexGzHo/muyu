import { useState } from 'react'
import type { PetProgress, DifficultyLevel } from '../game/types'
import { PetRenderer } from '../components/svg/PetIllustrations'
import {
  PlayIcon,
  SoundOnIcon,
  SoundOffIcon,
  SettingsIcon,
  SparkleIcon,
  HeartIcon,
  SproutStageIcon,
} from '../components/svg/Icons'
import { TropicalSun, JungleCanopy, TropicalHills, DeepForestBackdrop } from '../components/svg/Scenery'
import AdultModal from '../components/AdultModal'
import { soundManager } from '../audio/soundManager'

interface WelcomeScreenProps {
  pets: Record<string, PetProgress>
  hasProgress: boolean
  soundEnabled: boolean
  difficultyLevel?: DifficultyLevel
  onToggleSound: () => void
  onChangeDifficulty?: (level: DifficultyLevel) => void
  onResetGame: () => void
  onStart: () => void
}

export default function WelcomeScreen({
  pets,
  hasProgress,
  soundEnabled,
  difficultyLevel = 'initial',
  onToggleSound,
  onChangeDifficulty,
  onResetGame,
  onStart,
}: WelcomeScreenProps) {
  const [isAdultOpen, setIsAdultOpen] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [petReaction, setPetReaction] = useState<Record<string, 'none' | 'tap' | 'pet'>>({
    monkey: 'none',
    turtle: 'none',
    toucan: 'none',
  })

  const triggerPetGreet = (id: string) => {
    setPetReaction((prev) => ({ ...prev, [id]: 'tap' }))
    setTimeout(() => {
      setPetReaction((prev) => ({ ...prev, [id]: 'none' }))
    }, 700)
  }

  return (
    <main className="screen-container welcome-screen">
      {/* Fondo escénico de bosque profundo en capas */}
      <div className="forest-backdrop-full" aria-hidden="true">
        <DeepForestBackdrop />
      </div>

      <div className="scenery-layer canopy-top">
        <JungleCanopy />
      </div>

      <div className="sun-decoration">
        <TropicalSun />
      </div>

      {/* Controles discretos superiores */}
      <header className="welcome-top-nav">
        <button
          type="button"
          className="btn-round-nav"
          onClick={() => setShowGuide(true)}
          aria-label="Ver guía del juego"
          title="¿Cómo jugar?"
        >
          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#489B6E' }}>?</span>
        </button>

        <div className="top-right-controls">
          <button
            type="button"
            className="btn-round-nav"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Silenciar sonido' : 'Activar sonido'}
          >
            {soundEnabled ? <SoundOnIcon size={28} /> : <SoundOffIcon size={28} />}
          </button>
          <button
            type="button"
            className="btn-round-nav btn-settings"
            onClick={() => setIsAdultOpen(true)}
            aria-label="Ajustes para adultos"
          >
            <SettingsIcon size={28} />
          </button>
        </div>
      </header>

      <div className="welcome-content">
        {/* Identidad MUYU */}
        <div className="logo-container">
          <h1 className="brand-title">MUYU</h1>
          <p className="brand-tagline">Crece Conmigo</p>
        </div>

        {/* Las 3 mascotas interactivas reunidas en el bosque */}
        <div className="welcome-trio-stage" role="region" aria-label="Mascotas del bosque">
          {/* Mono */}
          <button
            type="button"
            className={`welcome-pet-avatar monkey-pos ${petReaction.monkey !== 'none' ? 'bounce-tap' : ''}`}
            onClick={() => triggerPetGreet('monkey')}
            aria-label={`Saludar a ${pets.monkey?.name || 'Monito'}`}
          >
            <PetRenderer
              id="monkey"
              stage={pets.monkey?.stage || 'baby'}
              reaction={petReaction.monkey}
              size={110}
            />
          </button>

          {/* Tortuga */}
          <button
            type="button"
            className={`welcome-pet-avatar turtle-pos ${petReaction.turtle !== 'none' ? 'bounce-tap' : ''}`}
            onClick={() => triggerPetGreet('turtle')}
            aria-label={`Saludar a ${pets.turtle?.name || 'Tortuguita'}`}
          >
            <PetRenderer
              id="turtle"
              stage={pets.turtle?.stage || 'baby'}
              reaction={petReaction.turtle}
              size={105}
            />
          </button>

          {/* Tucán */}
          <button
            type="button"
            className={`welcome-pet-avatar toucan-pos ${petReaction.toucan !== 'none' ? 'bounce-tap' : ''}`}
            onClick={() => triggerPetGreet('toucan')}
            aria-label={`Saludar a ${pets.toucan?.name || 'Tucancito'}`}
          >
            <PetRenderer
              id="toucan"
              stage={pets.toucan?.stage || 'baby'}
              reaction={petReaction.toucan}
              size={110}
            />
          </button>
        </div>

        {/* Botón táctil gigante de entrada/continuación */}
        <button
          type="button"
          className="btn-play-hero pulse-gentle"
          onClick={onStart}
          aria-label={hasProgress ? 'Continuar tu aventura en Muyu' : 'Empezar a jugar'}
        >
          <PlayIcon size={52} />
          <span className="btn-play-text">{hasProgress ? 'CONTINUAR' : 'JUGAR'}</span>
        </button>
      </div>

      <div className="scenery-layer hills-bottom">
        <TropicalHills />
      </div>

      {/* Modal de guía pictográfica con audio y opción de omitir */}
      {showGuide && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Guía rápida pictográfica">
          <div className="modal-card guide-modal-card">
            <header className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 className="modal-title" style={{ margin: 0 }}>¿Cómo jugar en Muyu?</h2>
                <button
                  type="button"
                  className="btn-round-nav"
                  style={{ width: '42px', height: '42px', minWidth: '42px' }}
                  onClick={() =>
                    soundManager.speakSpanish(
                      'Bienvenido a Muyu. Paso 1: Elige tu amigo del bosque. Paso 2: Juega actividades divertidas. Paso 3: Gana frutas para alimentarlo. Paso 4: ¡Míralo crecer feliz!',
                      soundEnabled
                    )
                  }
                  aria-label="Repetir narración de la guía"
                  title="Repetir narración"
                >
                  <SoundOnIcon size={24} />
                </button>
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => {
                  soundManager.cancelSpeech()
                  setShowGuide(false)
                }}
                aria-label="Cerrar guía"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </header>
            <div className="guide-steps-grid">
              <div className="guide-step-item">
                <span className="guide-step-num">1</span>
                <HeartIcon size={36} />
                <p>Elige tu amigo del bosque</p>
              </div>
              <div className="guide-step-item">
                <span className="guide-step-num">2</span>
                <PlayIcon size={36} />
                <p>Juega actividades divertidas</p>
              </div>
              <div className="guide-step-item">
                <span className="guide-step-num">3</span>
                <SparkleIcon size={36} />
                <p>Gana frutas para alimentarlo</p>
              </div>
              <div className="guide-step-item">
                <span className="guide-step-num">4</span>
                <SproutStageIcon size={36} active={true} />
                <p>¡Míralo crecer feliz!</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  soundManager.cancelSpeech()
                  setShowGuide(false)
                  onStart()
                }}
                aria-label="Entrar a jugar ahora"
              >
                ¡Jugar ahora!
              </button>
              <button
                type="button"
                className="btn-round-nav"
                style={{
                  width: 'auto',
                  borderRadius: 'var(--radius-pill)',
                  padding: '0 16px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  height: '48px',
                }}
                onClick={() => {
                  soundManager.cancelSpeech()
                  setShowGuide(false)
                }}
                aria-label="Omitir guía"
              >
                Omitir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de adultos */}
      <AdultModal
        isOpen={isAdultOpen}
        soundEnabled={soundEnabled}
        difficultyLevel={difficultyLevel}
        activePet={pets.monkey || Object.values(pets)[0]}
        onToggleSound={onToggleSound}
        onChangeDifficulty={onChangeDifficulty}
        onResetGame={onResetGame}
        onClose={() => setIsAdultOpen(false)}
      />
    </main>
  )
}
