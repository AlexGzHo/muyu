import { useState, useRef, useEffect } from 'react'
import type { ActiveMatch, DifficultyLevel } from '../../game/types'
import { generatePatternsRound, type PatternSymbol } from '../../game/activitiesModel'
import { BackIcon, SoundOnIcon, SparkleIcon, FoodFruitIcon } from '../../components/svg/Icons'
import { PatternTile } from '../../components/svg/GameIllustrations'
import { TropicalHills } from '../../components/svg/Scenery'
import { soundManager } from '../../audio/soundManager'

const PATTERN_SYMBOL_NAMES_ES: Record<PatternSymbol, string> = {
  circle: 'Círculo',
  square: 'Cuadrado',
  triangle: 'Triángulo',
  star: 'Estrella',
  leaf: 'Hoja',
  flower: 'Flor',
}

interface PatternsGameProps {
  soundEnabled: boolean
  activeMatch?: ActiveMatch | null
  onUpdateRound?: (roundIndex: number, partialData?: Record<string, unknown>) => void
  onComplete: (activityId: string, matchId: string) => void
  onRestart?: () => void
  onExit: () => void
}

export default function PatternsGame({
  soundEnabled,
  activeMatch,
  onUpdateRound,
  onComplete,
  onRestart,
  onExit,
}: PatternsGameProps) {
  const [matchId, setMatchId] = useState<string>(
    () => activeMatch?.id ?? `match_patterns_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  )
  const difficulty: DifficultyLevel = activeMatch?.difficulty ?? 'initial'

  const [roundIndex, setRoundIndex] = useState(
    () => (activeMatch ? Math.min(2, Math.max(0, activeMatch.roundIndex)) : 0)
  )

  const initialAnswer = (() => {
    if (typeof activeMatch?.partialData?.selectedAnswer === 'string') {
      const valid: PatternSymbol[] = ['circle', 'square', 'triangle', 'star', 'leaf', 'flower']
      if (valid.includes(activeMatch.partialData.selectedAnswer as PatternSymbol)) {
        return activeMatch.partialData.selectedAnswer as PatternSymbol
      }
    }
    return null
  })()
  const [selectedAnswer, setSelectedAnswer] = useState<PatternSymbol | null>(initialAnswer)
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'retry'>('idle')
  const [errorsCount, setErrorsCount] = useState<number>(
    () => (typeof activeMatch?.partialData?.errorsCount === 'number' ? activeMatch.partialData.errorsCount : 0)
  )
  const [hintsUsed, setHintsUsed] = useState<number>(
    () => (typeof activeMatch?.partialData?.hintsUsed === 'number' ? activeMatch.partialData.hintsUsed : 0)
  )
  const [showHint, setShowHint] = useState(false)
  const [completed, setCompleted] = useState(() => Boolean(activeMatch?.completed))

  const isProcessingRef = useRef(false)
  const timersRef = useRef<number[]>([])
  const dropTargetRef = useRef<HTMLDivElement>(null)

  // Drag & drop state
  const isDraggingRef = useRef(false)
  const hasDraggedRef = useRef(false)
  const suppressClickRef = useRef(false)
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null)
  const draggingSymbolRef = useRef<PatternSymbol | null>(null)
  const [draggingItem, setDraggingItem] = useState<PatternSymbol | null>(null)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)

  const roundData = generatePatternsRound(matchId, roundIndex, difficulty)

  const safeSetTimeout = (fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay)
    timersRef.current.push(id)
    return id
  }

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((t) => clearTimeout(t))
    }
  }, [])

  const playPromptAudio = () => {
    soundManager.speakSpanish(roundData.promptText, soundEnabled)
  }

  useEffect(() => {
    soundManager.speakSpanish(roundData.promptText, soundEnabled)
  }, [roundIndex, matchId, roundData.promptText, soundEnabled])

  const handleSelectOption = (symbol: PatternSymbol) => {
    if (isProcessingRef.current || feedback === 'success' || completed) return

    if (symbol === roundData.correctAnswer) {
      setSelectedAnswer(symbol)
      setFeedback('success')
      soundManager.playSuccess(soundEnabled)
      isProcessingRef.current = true

      onUpdateRound?.(roundIndex, {
        selectedAnswer: symbol,
        errorsCount,
        hintsUsed,
      })

      safeSetTimeout(() => {
        if (roundIndex < 2) {
          const nextR = roundIndex + 1
          setRoundIndex(nextR)
          setSelectedAnswer(null)
          setFeedback('idle')
          setShowHint(false)
          isProcessingRef.current = false
          onUpdateRound?.(nextR, { errorsCount, hintsUsed })
        } else {
          setCompleted(true)
          onComplete('patterns', matchId)
          isProcessingRef.current = false
        }
      }, 1200)
    } else {
      const nextErrors = errorsCount + 1
      setErrorsCount(nextErrors)
      setFeedback('retry')
      soundManager.playClick(soundEnabled)

      if (nextErrors >= 2) {
        setShowHint(true)
      }

      onUpdateRound?.(roundIndex, {
        errorsCount: nextErrors,
        hintsUsed,
      })

      safeSetTimeout(() => {
        setFeedback('idle')
      }, 600)
    }
  }

  const handleUseHint = () => {
    if (showHint || feedback === 'success' || completed) return
    const nextHints = hintsUsed + 1
    setHintsUsed(nextHints)
    setShowHint(true)
    soundManager.playClick(soundEnabled)
    onUpdateRound?.(roundIndex, { errorsCount, hintsUsed: nextHints })
  }

  // Pointer drag handling con umbral de 8px y supresión de click tras arrastre
  const handlePointerDown = (symbol: PatternSymbol, e: React.PointerEvent) => {
    if (isProcessingRef.current || feedback === 'success' || completed) return
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    } catch {}
    isDraggingRef.current = true
    hasDraggedRef.current = false
    suppressClickRef.current = false
    dragStartPosRef.current = { x: e.clientX, y: e.clientY }
    draggingSymbolRef.current = symbol
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !dragStartPosRef.current) return
    const dist = Math.hypot(
      e.clientX - dragStartPosRef.current.x,
      e.clientY - dragStartPosRef.current.y
    )
    if (!hasDraggedRef.current && dist > 8) {
      hasDraggedRef.current = true
      suppressClickRef.current = true
      setDraggingItem(draggingSymbolRef.current)
    }
    if (hasDraggedRef.current) {
      setDragPos({ x: e.clientX, y: e.clientY })
    }
  }

  const handlePointerUp = (symbol: PatternSymbol, e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
    } catch {}

    if (hasDraggedRef.current) {
      const targetEl = dropTargetRef.current
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect()
        const inTarget =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom

        if (inTarget) {
          handleSelectOption(symbol)
        }
      }
      suppressClickRef.current = true
      setTimeout(() => {
        suppressClickRef.current = false
      }, 100)
    }

    isDraggingRef.current = false
    hasDraggedRef.current = false
    dragStartPosRef.current = null
    draggingSymbolRef.current = null
    setDraggingItem(null)
    setDragPos(null)
  }

  const handlePointerCancel = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
    } catch {}
    isDraggingRef.current = false
    hasDraggedRef.current = false
    suppressClickRef.current = false
    dragStartPosRef.current = null
    draggingSymbolRef.current = null
    setDraggingItem(null)
    setDragPos(null)
  }

  const handleOptionClick = (opt: PatternSymbol) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    handleSelectOption(opt)
  }

  const handleRestart = () => {
    if (onRestart) {
      onRestart()
      return
    }
    const newId = `match_patterns_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    setMatchId(newId)
    setRoundIndex(0)
    setSelectedAnswer(null)
    setFeedback('idle')
    setErrorsCount(0)
    setHintsUsed(0)
    setShowHint(false)
    setCompleted(false)
    isProcessingRef.current = false
    onUpdateRound?.(0, { errorsCount: 0, hintsUsed: 0 })
  }

  return (
    <main className="screen-container activity-screen patterns-game-screen">
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

      {/* Título e instrucción pictográfica */}
      <div className="game-instruction-banner">
        <p className="instruction-text">{roundData.promptText}</p>
      </div>

      {/* Camino de secuencia visual */}
      <section className="pattern-road-container" aria-label="Camino de patrones">
        <div className="pattern-track">
          {roundData.sequence.map((item, idx) => {
            const isHole = idx === roundData.missingIndex
            return (
              <div
                key={idx}
                ref={isHole ? dropTargetRef : null}
                className={`pattern-slot ${isHole ? 'slot-missing' : 'slot-filled'} ${
                  isHole && feedback === 'success' ? 'slot-success-glow' : ''
                }`}
                aria-label={isHole ? 'Casilla vacía a completar' : `Figura ${item ? PATTERN_SYMBOL_NAMES_ES[item] : ''}`}
              >
                {isHole ? (
                  selectedAnswer ? (
                    <PatternTile symbol={selectedAnswer} size={54} />
                  ) : (
                    <div className="missing-question-mark">?</div>
                  )
                ) : (
                  item && <PatternTile symbol={item} size={54} />
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Opciones disponibles */}
      {!completed && (
        <section className="pattern-options-container" aria-label="Opciones para completar el patrón">
          <p className="options-hint-text">Toca o arrastra la figura correcta:</p>
          <div className="pattern-options-row">
            {roundData.options.map((opt, i) => {
              const isCorrect = opt === roundData.correctAnswer
              const highlight = showHint && isCorrect
              return (
                <button
                  key={`${opt}-${i}`}
                  type="button"
                  className={`pattern-option-btn ${highlight ? 'option-highlighted' : ''} ${
                    feedback === 'retry' ? 'option-wiggle' : ''
                  }`}
                  onClick={() => handleOptionClick(opt)}
                  onPointerDown={(e) => handlePointerDown(opt, e)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={(e) => handlePointerUp(opt, e)}
                  onPointerCancel={handlePointerCancel}
                  aria-label={`Seleccionar figura ${PATTERN_SYMBOL_NAMES_ES[opt]}`}
                  style={{ touchAction: 'none' }}
                >
                  <PatternTile symbol={opt} size={64} />
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Proxy flotante para arrastre visual suave */}
      {draggingItem && dragPos && (
        <div
          className="drag-floating-proxy"
          style={{
            position: 'fixed',
            left: dragPos.x - 32,
            top: dragPos.y - 32,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          <PatternTile symbol={draggingItem} size={64} />
        </div>
      )}

      {/* Escenario de fondo */}
      <div className="scenery-layer hills-bottom">
        <TropicalHills />
      </div>

      {/* Modal de celebración y resultados al completar 3 rondas */}
      {completed && (
        <div className="game-modal-backdrop" role="dialog" aria-modal="true" aria-label="¡Juego completado!">
          <div className="game-celebration-card">
            <div className="celebration-sparkles">
              <SparkleIcon size={56} />
            </div>
            <h2 className="celebration-title">¡Excelente Trabajo!</h2>
            <p className="celebration-subtitle">
              ¡Completaste el camino de los patrones!
            </p>
            <div className="reward-badge-pill">
              <FoodFruitIcon size={26} />
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
    </main>
  )
}
