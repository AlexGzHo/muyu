import { useState, useRef, useEffect } from 'react'
import type { ActiveMatch, DifficultyLevel } from '../../game/types'
import {
  generateCountingRound,
  formatCountingFruitPrompt,
  type CountingRoundData,
} from '../../game/activitiesModel'
import { BackIcon, PlayIcon, SoundOnIcon, SparkleIcon, FoodFruitIcon } from '../../components/svg/Icons'
import {
  MangoFruit,
  AppleFruit,
  OrangeFruit,
  StrawberryFruit,
  BasketCradle,
} from '../../components/svg/GameIllustrations'
import { TropicalHills } from '../../components/svg/Scenery'
import { soundManager } from '../../audio/soundManager'

interface CountingGameProps {
  soundEnabled: boolean
  activeMatch?: ActiveMatch | null
  onUpdateRound?: (roundIndex: number, partialData?: Record<string, unknown>) => void
  onComplete: (activityId: string, matchId: string) => void
  onRestart?: () => void
  onExit: () => void
}

export default function CountingGame({
  soundEnabled,
  activeMatch,
  onUpdateRound,
  onComplete,
  onRestart,
  onExit,
}: CountingGameProps) {
  const [matchId, setMatchId] = useState<string>(
    () => activeMatch?.id ?? `match_counting_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  )
  const difficulty: DifficultyLevel = activeMatch?.difficulty ?? 'initial'

  const [roundIndex, setRoundIndex] = useState(
    () => (activeMatch ? Math.min(2, Math.max(0, activeMatch.roundIndex)) : 0)
  )

  const roundData = generateCountingRound(matchId, roundIndex, difficulty)

  // Respetar metas guardadas o legadas de la partida si existen
  const savedTargets = activeMatch?.roundTargets
  const currentTarget =
    savedTargets && typeof savedTargets[roundIndex] === 'number'
      ? savedTargets[roundIndex]
      : roundData.targetCount

  const { promptText, audioText } = formatCountingFruitPrompt(
    roundData.fruitType,
    currentTarget
  )
  const availableFruits = Math.max(roundData.availableFruits, currentTarget + 2)

  const initialBasketCount =
    typeof activeMatch?.partialData?.inBasketCount === 'number'
      ? Math.max(0, Math.min(10, Math.floor(activeMatch.partialData.inBasketCount)))
      : 0

  const [inBasketCount, setInBasketCount] = useState(initialBasketCount)
  const inBasketCountRef = useRef(initialBasketCount)
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'retry'>('idle')
  const [errorsCount, setErrorsCount] = useState<number>(
    () => (typeof activeMatch?.partialData?.errorsCount === 'number' ? activeMatch.partialData.errorsCount : 0)
  )
  const [hintsUsed, setHintsUsed] = useState<number>(
    () => (typeof activeMatch?.partialData?.hintsUsed === 'number' ? activeMatch.partialData.hintsUsed : 0)
  )
  const [showHint, setShowHint] = useState(false)
  const [completed, setCompleted] = useState(() => Boolean(activeMatch?.completed))
  const [showDemo, setShowDemo] = useState(true)

  const isProcessingRef = useRef(false)
  const timersRef = useRef<number[]>([])
  const basketRef = useRef<HTMLDivElement>(null)

  // Drag controls
  const isDraggingRef = useRef(false)
  const hasDraggedRef = useRef(false)
  const suppressClickRef = useRef(false)
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null)
  const [dragState, setDragState] = useState<{ active: boolean; x: number; y: number } | null>(null)

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

  const playPromptAudio = () => {
    soundManager.speakSpanish(audioText, soundEnabled)
  }

  useEffect(() => {
    soundManager.speakSpanish(audioText, soundEnabled)
  }, [roundIndex, matchId, audioText, soundEnabled])

  const renderFruitItem = (type: CountingRoundData['fruitType'], size = 84) => {
    switch (type) {
      case 'apple':
        return <AppleFruit size={size} />
      case 'orange':
        return <OrangeFruit size={size} />
      case 'strawberry':
        return <StrawberryFruit size={size} />
      default:
        return <MangoFruit size={size} />
    }
  }

  const addFruit = () => {
    if (isProcessingRef.current || feedback === 'success' || completed) return
    if (inBasketCountRef.current >= availableFruits || inBasketCountRef.current >= 10) return

    soundManager.playClick(soundEnabled)
    setShowDemo(false)
    const nextCount = inBasketCountRef.current + 1
    inBasketCountRef.current = nextCount
    setInBasketCount(nextCount)
    setFeedback('idle')
    onUpdateRound?.(roundIndex, {
      inBasketCount: nextCount,
      errorsCount,
      hintsUsed,
    })
  }

  const removeFruit = () => {
    if (isProcessingRef.current || feedback === 'success' || completed) return
    if (inBasketCountRef.current <= 0) return

    soundManager.playClick(soundEnabled)
    const nextCount = inBasketCountRef.current - 1
    inBasketCountRef.current = nextCount
    setInBasketCount(nextCount)
    setFeedback('idle')
    onUpdateRound?.(roundIndex, {
      inBasketCount: nextCount,
      errorsCount,
      hintsUsed,
    })
  }

  const handleVerify = () => {
    if (isProcessingRef.current || feedback === 'success' || completed) return

    if (inBasketCount === currentTarget) {
      isProcessingRef.current = true
      setFeedback('success')
      soundManager.playSuccess(soundEnabled)

      safeSetTimeout(() => {
        if (roundIndex < 2) {
          const nextR = roundIndex + 1
          setRoundIndex(nextR)
          inBasketCountRef.current = 0
          setInBasketCount(0)
          setFeedback('idle')
          setShowHint(false)
          setShowDemo(true)
          isProcessingRef.current = false
          onUpdateRound?.(nextR, { inBasketCount: 0, errorsCount, hintsUsed })
        } else {
          setCompleted(true)
          onComplete('counting', matchId)
          isProcessingRef.current = false
        }
      }, 1500)
    } else {
      const nextErrors = errorsCount + 1
      setErrorsCount(nextErrors)
      setFeedback('retry')
      soundManager.playClick(soundEnabled)

      if (nextErrors >= 2) {
        setShowHint(true)
      }

      onUpdateRound?.(roundIndex, {
        inBasketCount,
        errorsCount: nextErrors,
        hintsUsed,
      })

      if (soundEnabled) {
        const diff = currentTarget - inBasketCount
        if (diff > 0) {
          soundManager.speakSpanish(`Faltan ${diff} frutas más`, soundEnabled)
        } else {
          soundManager.speakSpanish(`Pusiste ${Math.abs(diff)} frutas de más, toca la canasta para quitar`, soundEnabled)
        }
      }

      safeSetTimeout(() => {
        setFeedback('idle')
      }, 800)
    }
  }

  const handleUseHint = () => {
    if (showHint || feedback === 'success' || completed) return
    const nextHints = hintsUsed + 1
    setHintsUsed(nextHints)
    setShowHint(true)
    soundManager.playClick(soundEnabled)
    soundManager.speakSpanish(`La canasta necesita exactamente ${currentTarget} frutas`, soundEnabled)
    onUpdateRound?.(roundIndex, { inBasketCount, errorsCount, hintsUsed: nextHints })
  }

  // Pointer drag gestures
  const handlePointerDownFruit = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isProcessingRef.current || feedback === 'success' || completed) return
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    isDraggingRef.current = true
    hasDraggedRef.current = false
    suppressClickRef.current = false
    dragStartPosRef.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerMoveFruit = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !dragStartPosRef.current) return

    const dx = e.clientX - dragStartPosRef.current.x
    const dy = e.clientY - dragStartPosRef.current.y
    const dist = Math.hypot(dx, dy)

    if (dist > 8 && !hasDraggedRef.current) {
      hasDraggedRef.current = true
      suppressClickRef.current = true
    }

    if (hasDraggedRef.current) {
      setDragState({
        active: true,
        x: e.clientX,
        y: e.clientY,
      })
    }
  }

  const handlePointerUpFruit = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
    isDraggingRef.current = false

    if (hasDraggedRef.current) {
      const basket = basketRef.current
      if (basket) {
        const rect = basket.getBoundingClientRect()
        const inside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom

        if (inside) {
          addFruit()
        }
      }
      safeSetTimeout(() => {
        suppressClickRef.current = false
      }, 50)
    }

    hasDraggedRef.current = false
    dragStartPosRef.current = null
    setDragState(null)
  }

  const handlePointerCancel = () => {
    isDraggingRef.current = false
    hasDraggedRef.current = false
    suppressClickRef.current = false
    dragStartPosRef.current = null
    setDragState(null)
  }

  const handleFruitClick = () => {
    if (suppressClickRef.current) return
    addFruit()
  }

  const handleRestart = () => {
    if (onRestart) {
      onRestart()
      return
    }
    const newId = `match_counting_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    setMatchId(newId)
    setRoundIndex(0)
    inBasketCountRef.current = 0
    setInBasketCount(0)
    setFeedback('idle')
    setErrorsCount(0)
    setHintsUsed(0)
    setShowHint(false)
    setShowDemo(true)
    setCompleted(false)
    isProcessingRef.current = false
    onUpdateRound?.(0, { inBasketCount: 0, errorsCount: 0, hintsUsed: 0 })
  }

  return (
    <main className="screen-container activity-screen counting-game-screen">
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
            aria-label="Repetir instrucción"
          >
            <SoundOnIcon size={28} />
          </button>
          <button
            type="button"
            className={`btn-round-nav ${showHint ? 'btn-hint-active' : ''}`}
            onClick={handleUseHint}
            aria-label="Pedir pista visual"
          >
            <SparkleIcon size={28} />
          </button>
        </div>
      </header>

      {/* Banner de instrucción */}
      <div className="game-instruction-banner">
        <p className="instruction-text">{promptText}</p>
      </div>

      {!completed ? (
        <div className="counting-game-play-area">
          {/* Zona de frutas en el árbol */}
          <div className="fruit-source-zone">
            {showDemo && (
              <div className="source-tap-hint">
                <span>¡Toca o arrastra la fruta!</span>
              </div>
            )}
            <div
              className="source-fruit-anchor"
              onPointerDown={handlePointerDownFruit}
              onPointerMove={handlePointerMoveFruit}
              onPointerUp={handlePointerUpFruit}
              onPointerCancel={handlePointerCancel}
              onClick={handleFruitClick}
              role="button"
              tabIndex={0}
              aria-label={`Fruta disponible: ${roundData.fruitType}. Toca o arrastra a la canasta`}
              style={{ touchAction: 'none' }}
            >
              {renderFruitItem(roundData.fruitType, 84)}
            </div>
          </div>

          {/* Canasta receptora */}
          <div
            ref={basketRef}
            className={`basket-drop-zone ${feedback === 'retry' ? 'shake-feedback' : ''} ${
              feedback === 'success' ? 'bounce-feedback' : ''
            } ${showHint ? 'basket-hint-pulse' : ''}`}
            onClick={removeFruit}
            role="button"
            tabIndex={0}
            title="Toca para retirar una fruta si pusiste de más"
            aria-label={`Canasta con ${inBasketCount} de ${currentTarget} frutas`}
          >
            <BasketCradle count={inBasketCount} targetCount={currentTarget} size={230} />
            {inBasketCount > 0 && (
              <span className="basket-remove-hint">Toca la canasta para quitar fruta</span>
            )}
          </div>

          {/* Botón de verificación */}
          <div className="activity-actions-bar">
            <button
              type="button"
              className="btn-primary-action btn-verify-action"
              onClick={handleVerify}
              aria-label="Comprobar cantidad"
            >
              <PlayIcon size={36} />
              <span>¡Listo!</span>
            </button>
          </div>
        </div>
      ) : (
        /* Modal de celebración y resultados */
        <div className="game-modal-backdrop" role="dialog" aria-modal="true" aria-label="¡Juego completado!">
          <div className="game-celebration-card">
            <div className="celebration-sparkles">
              <SparkleIcon size={56} />
            </div>
            <h2 className="celebration-title">¡Excelente conteo!</h2>
            <p className="celebration-subtitle">Completaste las 3 rondas con éxito.</p>
            <div className="reward-badge-pill">
              <FoodFruitIcon size={24} />
              <span>+1 Alimento ganado</span>
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

      {/* Fruta fantasma durante el arrastre */}
      {dragState?.active && (
        <div
          className="dragging-fruit-proxy"
          style={{
            position: 'fixed',
            left: `${dragState.x - 42}px`,
            top: `${dragState.y - 42}px`,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          {renderFruitItem(roundData.fruitType, 84)}
        </div>
      )}

      <div className="scenery-layer hills-bottom">
        <TropicalHills />
      </div>
    </main>
  )
}
