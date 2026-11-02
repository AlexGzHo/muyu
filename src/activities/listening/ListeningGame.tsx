import { useState, useEffect, useRef } from 'react'
import type { ActiveMatch, DifficultyLevel } from '../../game/types'
import { generateListeningRound } from '../../game/activitiesModel'
import { BackIcon, SoundOnIcon, SparkleIcon, FoodFruitIcon } from '../../components/svg/Icons'
import { ListeningItemIcon, type ListeningItemId } from '../../components/svg/GameIllustrations'
import { TropicalHills } from '../../components/svg/Scenery'
import { soundManager } from '../../audio/soundManager'


interface ListeningGameProps {
  soundEnabled: boolean
  activeMatch?: ActiveMatch | null
  onUpdateRound?: (roundIndex: number, partialData?: Record<string, unknown>) => void
  onComplete: (activityId: string, matchId: string) => void
  onRestart?: () => void
  onExit: () => void
}

const ITEM_NAMES_ES: Record<string, string> = {
  sun: 'Sol',
  flower: 'Flor',
  basket: 'Canasta',
  turtle: 'Tortuga',
  toucan: 'Tucán',
  monkey: 'Mono',
  fruit: 'Fruta',
  leaf: 'Hoja',
  'watering-can': 'Regadera',
  bear: 'Oso',
  butterfly: 'Mariposa',
}

export default function ListeningGame({
  soundEnabled,
  activeMatch,
  onUpdateRound,
  onComplete,
  onRestart,
  onExit,
}: ListeningGameProps) {
  const [matchId, setMatchId] = useState<string>(
    () => activeMatch?.id ?? `match_listening_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  )
  const difficulty: DifficultyLevel = activeMatch?.difficulty ?? 'initial'

  const [roundIndex, setRoundIndex] = useState(
    () => (activeMatch ? Math.min(2, Math.max(0, activeMatch.roundIndex)) : 0)
  )

  const hasVoice = soundManager.hasVoiceSupport()
  const [showVisualClue, setShowVisualClue] = useState(!soundEnabled || !hasVoice)
  const [feedback, setFeedback] = useState<{ id: ListeningItemId; state: 'success' | 'retry' } | null>(null)
  const [errorsCount, setErrorsCount] = useState<number>(
    () => (typeof activeMatch?.partialData?.errorsCount === 'number' ? activeMatch.partialData.errorsCount : 0)
  )
  const [hintsUsed, setHintsUsed] = useState<number>(
    () => (typeof activeMatch?.partialData?.hintsUsed === 'number' ? activeMatch.partialData.hintsUsed : 0)
  )
  const [completed, setCompleted] = useState(() => Boolean(activeMatch?.completed))

  const isProcessingRef = useRef(false)
  const timersRef = useRef<number[]>([])

  const contentVersion = activeMatch?.contentVersion ?? 2
  const currentRound = generateListeningRound(matchId, roundIndex, difficulty, contentVersion)

  const safeSetTimeout = (fn: () => void, delay: number) => {
    const timerId = window.setTimeout(fn, delay)
    timersRef.current.push(timerId)
    return timerId
  }

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((t) => clearTimeout(t))
    }
  }, [])

  const isVisualClueActive = showVisualClue || !soundEnabled || !hasVoice

  const playPromptAudio = () => {
    soundManager.speakSpanish(currentRound.spokenPrompt, soundEnabled)
  }

  useEffect(() => {
    if (!soundEnabled) {
      soundManager.cancelSpeech()
    } else {
      soundManager.speakSpanish(currentRound.spokenPrompt, soundEnabled)
    }
  }, [currentRound.spokenPrompt, soundEnabled, roundIndex, matchId])

  const handleSelect = (id: ListeningItemId) => {
    if (isProcessingRef.current || completed) return

    if (id === currentRound.targetId) {
      isProcessingRef.current = true
      setFeedback({ id, state: 'success' })
      soundManager.playSuccess(soundEnabled)

      safeSetTimeout(() => {
        if (roundIndex < 2) {
          const nextR = roundIndex + 1
          setRoundIndex(nextR)
          setFeedback(null)
          setShowVisualClue(!soundEnabled || !hasVoice)
          isProcessingRef.current = false
          onUpdateRound?.(nextR, { errorsCount, hintsUsed })
        } else {
          setCompleted(true)
          onComplete('listening', matchId)
          isProcessingRef.current = false
        }
      }, 1200)
    } else {
      const nextErrors = errorsCount + 1
      setErrorsCount(nextErrors)
      setFeedback({ id, state: 'retry' })
      soundManager.playClick(soundEnabled)

      if (nextErrors >= 2) {
        setShowVisualClue(true)
      }

      onUpdateRound?.(roundIndex, {
        errorsCount: nextErrors,
        hintsUsed,
      })

      safeSetTimeout(() => {
        setFeedback(null)
      }, 600)
    }
  }

  const handleUseHint = () => {
    if (isVisualClueActive || completed) return
    const nextHints = hintsUsed + 1
    setHintsUsed(nextHints)
    setShowVisualClue(true)
    soundManager.playClick(soundEnabled)
    playPromptAudio()
    onUpdateRound?.(roundIndex, { errorsCount, hintsUsed: nextHints })
  }

  const handleRestart = () => {
    onRestart?.()
    const newId = `match_listening_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    setMatchId(newId)
    setRoundIndex(0)
    setFeedback(null)
    setErrorsCount(0)
    setHintsUsed(0)
    setShowVisualClue(!soundEnabled || !hasVoice)
    setCompleted(false)
    isProcessingRef.current = false
    onUpdateRound?.(0, { errorsCount: 0, hintsUsed: 0 })
  }

  return (
    <main className="screen-container activity-screen listening-game-screen">
      {/* Barra de navegación superior */}
      <header className="game-nav-bar">
        <button
          type="button"
          className="btn-round-nav"
          onClick={onExit}
          aria-label="Volver al catálogo"
        >
          <BackIcon size={32} />
        </button>

        <div className="game-round-pill">
          <span className="round-badge">Ronda {roundIndex + 1}/3</span>
        </div>

        <div className="game-nav-actions">
          <button
            type="button"
            className="btn-round-nav"
            onClick={playPromptAudio}
            aria-label="Escuchar de nuevo la palabra"
          >
            <SoundOnIcon size={28} />
          </button>
          <button
            type="button"
            className={`btn-round-nav ${isVisualClueActive ? 'btn-hint-active' : ''}`}
            onClick={handleUseHint}
            aria-label="Pista visual"
          >
            <SparkleIcon size={28} />
          </button>
        </div>
      </header>

      {/* Franja de indicación auditiva o visual */}
      <div className="game-instruction-banner">
        <div className="listening-prompt-row">
          <button
            type="button"
            className="listening-speech-bubble-btn"
            onClick={playPromptAudio}
            aria-label={`Reproducir audio: ${currentRound.spokenPrompt}`}
          >
            <SoundOnIcon size={32} />
            <span className="listening-prompt-text">{currentRound.spokenPrompt}</span>
          </button>
        </div>

        {isVisualClueActive && (
          <div className="visual-fallback-banner" role="status">
            <div className="visual-hint-content">
              <div className="visual-hint-icon" aria-hidden="true">
                <ListeningItemIcon id={currentRound.targetId} size={44} />
              </div>
              <div className="visual-hint-text-wrap">
                <span className="visual-hint-pill">Pista: {currentRound.visualHint}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {!completed ? (
        <div className="listening-game-play-area">
          <p className="listening-action-hint">Toca la figura correcta:</p>
          <div className="listening-options-grid">
            {currentRound.options.map((optionId) => {
              const isSuccess = feedback?.id === optionId && feedback.state === 'success'
              const isRetry = feedback?.id === optionId && feedback.state === 'retry'
              const isTargetHint = isVisualClueActive && optionId === currentRound.targetId
              const itemLabel = ITEM_NAMES_ES[optionId] || optionId

              return (
                <button
                  key={optionId}
                  type="button"
                  className={`listening-option-card ${isSuccess ? 'listening-card-success' : ''} ${
                    isRetry ? 'listening-card-retry' : ''
                  } ${isTargetHint ? 'listening-card-hinted' : ''}`}
                  onClick={() => handleSelect(optionId)}
                  aria-label={`Opción ${itemLabel}${isTargetHint ? ' (pista sugerida)' : ''}`}
                >
                  {isTargetHint && (
                    <span className="listening-card-hint-badge" aria-hidden="true">
                      <SparkleIcon size={20} />
                    </span>
                  )}
                  <ListeningItemIcon id={optionId} size={100} />
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        /* Modal de celebración y resultados */
        <div className="game-modal-backdrop" role="dialog" aria-modal="true" aria-label="¡Juego completado!">
          <div className="game-celebration-card">
            <div className="celebration-sparkles">
              <SparkleIcon size={56} />
            </div>
            <h2 className="celebration-title">¡Gran Oído!</h2>
            <p className="celebration-subtitle">Escuchaste con atención y hallaste cada figura.</p>
            <div className="reward-badge-pill">
              <FoodFruitIcon size={24} />
              <span>+1 Fruta para tu amigo</span>
            </div>

            <div className="celebration-actions-row">
              <button
                type="button"
                className="btn-primary-action btn-repeat"
                onClick={handleRestart}
              >
                Volver a jugar
              </button>
              <button
                type="button"
                className="btn-secondary-action btn-forest"
                onClick={onExit}
              >
                Volver al bosque
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="scenery-layer hills-bottom">
        <TropicalHills />
      </div>
    </main>
  )
}
