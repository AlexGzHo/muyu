import { useState, useRef, useEffect } from 'react'
import type { ActiveMatch, DifficultyLevel } from '../../game/types'
import { generateShadowsRound, type ShapeItem } from '../../game/activitiesModel'
import { BackIcon, SoundOnIcon, SparkleIcon, FoodFruitIcon } from '../../components/svg/Icons'
import { ShapePiece } from '../../components/svg/GameIllustrations'
import { TropicalHills } from '../../components/svg/Scenery'
import { soundManager } from '../../audio/soundManager'

interface ShadowsGameProps {
  soundEnabled: boolean
  activeMatch?: ActiveMatch | null
  onUpdateRound?: (roundIndex: number, partialData?: Record<string, unknown>) => void
  onComplete: (activityId: string, matchId: string) => void
  onRestart?: () => void
  onExit: () => void
}

export default function ShadowsGame({
  soundEnabled,
  activeMatch,
  onUpdateRound,
  onComplete,
  onRestart,
  onExit,
}: ShadowsGameProps) {
  const [matchId, setMatchId] = useState<string>(
    () => activeMatch?.id ?? `match_shadows_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  )
  const difficulty: DifficultyLevel = activeMatch?.difficulty ?? 'initial'

  const [roundIndex, setRoundIndex] = useState(
    () => (activeMatch ? Math.min(2, Math.max(0, activeMatch.roundIndex)) : 0)
  )

  const roundData = generateShadowsRound(matchId, roundIndex, difficulty)

  // Restaurar figuras encajadas desde partialData tras recarga
  const initialMatchedIds = (() => {
    if (Array.isArray(activeMatch?.partialData?.matchedIds)) {
      const validIds: string[] = roundData.shapes.map((s) => s.id)
      return (activeMatch.partialData.matchedIds as string[]).filter(
        (id) => typeof id === 'string' && validIds.includes(id)
      )
    }
    return []
  })()

  const [matchedIds, setMatchedIds] = useState<string[]>(initialMatchedIds)
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null)
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
  const shadowRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  // Gestos y arrastre (protocolo HabitatsGame)
  const isDraggingRef = useRef(false)
  const hasDraggedRef = useRef(false)
  const suppressClickRef = useRef(false)
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null)
  const draggingShapeRef = useRef<ShapeItem | null>(null)
  const [draggingShape, setDraggingShape] = useState<ShapeItem | null>(null)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)

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

  // Snapshot al montar para reanudar ronda resuelta tras recarga (ejecución única garantizada por key)
  const mountResumeRef = useRef({
    shouldResume:
      !activeMatch?.completed &&
      initialMatchedIds.length === roundData.shapes.length &&
      roundData.shapes.length > 0,
    roundIndex,
    matchId,
    errorsCount,
    hintsUsed,
    onComplete,
    onUpdateRound,
  })

  // Resiliencia tras recarga: reanudar una sola vez al montar si ya estaba resuelta
  useEffect(() => {
    const snap = mountResumeRef.current
    if (!snap.shouldResume || isProcessingRef.current) return

    isProcessingRef.current = true
    setFeedback('success')

    const timerId = window.setTimeout(() => {
      if (snap.roundIndex < 2) {
        const nextR = snap.roundIndex + 1
        setRoundIndex(nextR)
        setMatchedIds([])
        setSelectedShapeId(null)
        setFeedback('idle')
        setShowHint(false)
        isProcessingRef.current = false
        snap.onUpdateRound?.(nextR, { errorsCount: snap.errorsCount, hintsUsed: snap.hintsUsed })
      } else {
        setCompleted(true)
        snap.onComplete('shadows', snap.matchId)
        isProcessingRef.current = false
      }
    }, 1200)
    timersRef.current.push(timerId)
  }, [])

  // Piezas no encajadas todavía
  const remainingShapes = roundData.shapes.filter((s) => !matchedIds.includes(s.id))

  const handleMatchShape = (shapeId: string, shadowId: string) => {
    if (isProcessingRef.current || feedback === 'success' || completed) return

    if (shapeId === shadowId) {
      soundManager.playSuccess(soundEnabled)
      const nextMatched = [...matchedIds, shapeId]
      setMatchedIds(nextMatched)
      setSelectedShapeId(null)

      onUpdateRound?.(roundIndex, {
        matchedIds: nextMatched,
        errorsCount,
        hintsUsed,
      })

      // Verificar si completó todas las figuras de la ronda
      if (nextMatched.length === roundData.shapes.length) {
        setFeedback('success')
        isProcessingRef.current = true

        safeSetTimeout(() => {
          if (roundIndex < 2) {
            const nextR = roundIndex + 1
            setRoundIndex(nextR)
            setMatchedIds([])
            setSelectedShapeId(null)
            setFeedback('idle')
            setShowHint(false)
            isProcessingRef.current = false
            onUpdateRound?.(nextR, { errorsCount, hintsUsed })
          } else {
            setCompleted(true)
            onComplete('shadows', matchId)
            isProcessingRef.current = false
          }
        }, 1200)
      }
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

  const handleTapPiece = (shape: ShapeItem) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    if (selectedShapeId === shape.id) {
      setSelectedShapeId(null)
    } else {
      setSelectedShapeId(shape.id)
      soundManager.playClick(soundEnabled)
    }
  }

  const handleTapShadow = (shadowId: string) => {
    if (!selectedShapeId) return
    handleMatchShape(selectedShapeId, shadowId)
  }

  const handleUseHint = () => {
    if (showHint || feedback === 'success' || completed) return
    const nextHints = hintsUsed + 1
    setHintsUsed(nextHints)
    setShowHint(true)
    soundManager.playClick(soundEnabled)
    onUpdateRound?.(roundIndex, { errorsCount, hintsUsed: nextHints })
  }

  // Pointer drag con umbral de 8px, captura en currentTarget y supresión de click tras arrastre
  const handlePointerDown = (shape: ShapeItem, e: React.PointerEvent) => {
    if (isProcessingRef.current || feedback === 'success' || completed) return
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    } catch {}
    isDraggingRef.current = true
    hasDraggedRef.current = false
    suppressClickRef.current = false
    dragStartPosRef.current = { x: e.clientX, y: e.clientY }
    draggingShapeRef.current = shape
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
      setDraggingShape(draggingShapeRef.current)
    }
    if (hasDraggedRef.current) {
      setDragPos({ x: e.clientX, y: e.clientY })
    }
  }

  const handlePointerUp = (shape: ShapeItem, e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
    } catch {}

    if (hasDraggedRef.current) {
      for (const targetShape of roundData.shapes) {
        const el = shadowRefs.current[targetShape.id]
        if (el) {
          const rect = el.getBoundingClientRect()
          const inside =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom

          if (inside) {
            handleMatchShape(shape.id, targetShape.id)
            break
          }
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
    draggingShapeRef.current = null
    setDraggingShape(null)
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
    draggingShapeRef.current = null
    setDraggingShape(null)
    setDragPos(null)
  }

  const handleRestart = () => {
    if (onRestart) {
      onRestart()
      return
    }
    const newId = `match_shadows_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    setMatchId(newId)
    setRoundIndex(0)
    setMatchedIds([])
    setSelectedShapeId(null)
    setFeedback('idle')
    setErrorsCount(0)
    setHintsUsed(0)
    setShowHint(false)
    setCompleted(false)
    isProcessingRef.current = false
    onUpdateRound?.(0, { errorsCount: 0, hintsUsed: 0 })
  }

  return (
    <main className="screen-container activity-screen shadows-game-screen">
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
        <p className="instruction-text">{roundData.promptText}</p>
      </div>

      {/* Fila de siluetas / sombras superiores accesibles como botones */}
      <section className="shadows-targets-row" aria-label="Sombras donde encajar las figuras">
        {roundData.shapes.map((shape) => {
          const isMatched = matchedIds.includes(shape.id)
          const isTargeted = selectedShapeId !== null && !isMatched
          const isHintTarget = showHint && selectedShapeId === shape.id

          return (
            <button
              type="button"
              key={shape.id}
              ref={(el) => {
                shadowRefs.current[shape.id] = el
              }}
              className={`shadow-target-card ${isMatched ? 'shadow-matched' : ''} ${
                isTargeted ? 'shadow-target-ready' : ''
              } ${isHintTarget ? 'shadow-hint-glow' : ''}`}
              onClick={() => handleTapShadow(shape.id)}
              aria-label={isMatched ? `Silueta de ${shape.name} completada` : `Sombra de ${shape.name}`}
            >
              {isMatched ? (
                <div className="matched-piece-wrap">
                  <ShapePiece id={shape.id} isShadow={false} size={84} />
                </div>
              ) : (
                <div className="silhouette-wrap">
                  <ShapePiece id={shape.id} isShadow={true} size={84} />
                </div>
              )}
            </button>
          )
        })}
      </section>

      {/* Bandeja inferior con piezas de colores */}
      {!completed && remainingShapes.length > 0 && (
        <section className="shadows-pieces-tray" aria-label="Piezas disponibles">
          <p className="tray-instruction-hint">Toca o arrastra la figura a su silueta:</p>
          <div className="shadows-pieces-row">
            {remainingShapes.map((shape) => {
              const isSelected = selectedShapeId === shape.id
              return (
                <button
                  key={shape.id}
                  type="button"
                  className={`shape-piece-btn ${isSelected ? 'piece-selected-glow' : ''} ${
                    feedback === 'retry' && isSelected ? 'piece-wiggle' : ''
                  }`}
                  onClick={() => handleTapPiece(shape)}
                  onPointerDown={(e) => handlePointerDown(shape, e)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={(e) => handlePointerUp(shape, e)}
                  onPointerCancel={handlePointerCancel}
                  aria-label={`Figura ${shape.name}`}
                  style={{ touchAction: 'none' }}
                >
                  <ShapePiece id={shape.id} isShadow={false} size={76} />
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Floating drag proxy */}
      {draggingShape && dragPos && (
        <div
          className="drag-floating-proxy"
          style={{
            position: 'fixed',
            left: dragPos.x - 38,
            top: dragPos.y - 38,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          <ShapePiece id={draggingShape.id} isShadow={false} size={76} />
        </div>
      )}

      <div className="scenery-layer hills-bottom">
        <TropicalHills />
      </div>

      {/* Modal de celebración y resultados */}
      {completed && (
        <div className="game-modal-backdrop" role="dialog" aria-modal="true" aria-label="¡Juego completado!">
          <div className="game-celebration-card">
            <div className="celebration-sparkles">
              <SparkleIcon size={56} />
            </div>
            <h2 className="celebration-title">¡Gran Percepción!</h2>
            <p className="celebration-subtitle">
              ¡Encajaste todas las figuras en sus sombras!
            </p>
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
    </main>
  )
}
