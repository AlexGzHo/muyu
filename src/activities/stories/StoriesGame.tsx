import { useState, useRef, useEffect } from 'react'
import type { ActiveMatch, DifficultyLevel } from '../../game/types'
import { generateStoriesRound, type StoryCard } from '../../game/activitiesModel'
import { BackIcon, SoundOnIcon, SparkleIcon, FoodFruitIcon } from '../../components/svg/Icons'
import { StoryVignette } from '../../components/svg/GameIllustrations'
import { TropicalHills } from '../../components/svg/Scenery'
import { soundManager } from '../../audio/soundManager'

interface StoriesGameProps {
  soundEnabled: boolean
  activeMatch?: ActiveMatch | null
  onUpdateRound?: (roundIndex: number, partialData?: Record<string, unknown>) => void
  onComplete: (activityId: string, matchId: string) => void
  onRestart?: () => void
  onExit: () => void
}

export default function StoriesGame({
  soundEnabled,
  activeMatch,
  onUpdateRound,
  onComplete,
  onRestart,
  onExit,
}: StoriesGameProps) {
  const [matchId, setMatchId] = useState<string>(
    () => activeMatch?.id ?? `match_stories_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  )
  const difficulty: DifficultyLevel = activeMatch?.difficulty ?? 'initial'

  const [roundIndex, setRoundIndex] = useState(
    () => (activeMatch ? Math.min(2, Math.max(0, activeMatch.roundIndex)) : 0)
  )

  const roundData = generateStoriesRound(matchId, roundIndex, difficulty)
  const totalSlots = roundData.cards.length

  // Restaurar colocaciones desde partialData tras recarga
  const initialPlacedCards = (() => {
    if (Array.isArray(activeMatch?.partialData?.placedCards)) {
      const raw = activeMatch.partialData.placedCards
      const restored: (StoryCard | null)[] = new Array(totalSlots).fill(null)
      raw.forEach((c, idx) => {
        if (idx < totalSlots && c && typeof c === 'object' && 'id' in c) {
          const found = roundData.cards.find((card) => card.id === (c as { id: string }).id)
          if (found) {
            restored[idx] = found
          }
        }
      })
      return restored
    }
    return new Array(totalSlots).fill(null)
  })()

  const [placedCards, setPlacedCards] = useState<(StoryCard | null)[]>(initialPlacedCards)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
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
  const slotRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Gestos y arrastre (protocolo HabitatsGame)
  const isDraggingRef = useRef(false)
  const hasDraggedRef = useRef(false)
  const suppressClickRef = useRef(false)
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null)
  const draggingItemRef = useRef<StoryCard | null>(null)
  const [draggingCard, setDraggingCard] = useState<StoryCard | null>(null)
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
      initialPlacedCards.length === totalSlots &&
      initialPlacedCards.every((c, idx) => c && c.stepNumber === idx + 1),
    roundIndex,
    matchId,
    difficulty,
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
        const nextRoundData = generateStoriesRound(snap.matchId, nextR, snap.difficulty)
        setRoundIndex(nextR)
        setPlacedCards(new Array(nextRoundData.cards.length).fill(null))
        setSelectedCardId(null)
        setFeedback('idle')
        setShowHint(false)
        isProcessingRef.current = false
        snap.onUpdateRound?.(nextR, { errorsCount: snap.errorsCount, hintsUsed: snap.hintsUsed })
      } else {
        setCompleted(true)
        snap.onComplete('stories', snap.matchId)
        isProcessingRef.current = false
      }
    }, 1200)
    timersRef.current.push(timerId)
  }, [])

  // Tarjetas disponibles en la bandeja (no colocadas todavía)
  const placedIds = placedCards.filter(Boolean).map((c) => c!.id)
  const trayCards = roundData.cards.filter((c) => !placedIds.includes(c.id))

  // Colocar una tarjeta en una casilla
  const handleAssignToSlot = (card: StoryCard, slotIdx: number) => {
    if (isProcessingRef.current || feedback === 'success' || completed) return

    const nextSlots = [...placedCards]
    // Si la tarjeta ya estaba en otro slot, vaciar ese slot previo
    const prevIdx = nextSlots.findIndex((c) => c?.id === card.id)
    if (prevIdx !== -1) {
      nextSlots[prevIdx] = null
    }

    // Colocar la tarjeta en el slot destino
    nextSlots[slotIdx] = card
    setPlacedCards(nextSlots)
    setSelectedCardId(null)
    soundManager.playClick(soundEnabled)

    // Comprobar si todas las casillas están ocupadas
    const allFilled = nextSlots.every((c) => c !== null)
    if (allFilled) {
      // Validar si el orden es correcto (stepNumber coincide con slotIdx + 1)
      const isOrdered = nextSlots.every((c, idx) => c && c.stepNumber === idx + 1)

      if (isOrdered) {
        setFeedback('success')
        soundManager.playSuccess(soundEnabled)
        isProcessingRef.current = true

        onUpdateRound?.(roundIndex, {
          placedCards: nextSlots,
          errorsCount,
          hintsUsed,
        })

        // Narrar la secuencia ordenada al niño
        const storyStoryNarrative = nextSlots.map((c) => c!.description).join('. ')
        soundManager.speakSpanish(storyStoryNarrative, soundEnabled)

        safeSetTimeout(() => {
          if (roundIndex < 2) {
            const nextR = roundIndex + 1
            const nextRoundData = generateStoriesRound(matchId, nextR, difficulty)
            setRoundIndex(nextR)
            setPlacedCards(new Array(nextRoundData.cards.length).fill(null))
            setSelectedCardId(null)
            setFeedback('idle')
            setShowHint(false)
            isProcessingRef.current = false
            onUpdateRound?.(nextR, { errorsCount, hintsUsed })
          } else {
            setCompleted(true)
            onComplete('stories', matchId)
            isProcessingRef.current = false
          }
        }, 2200)
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
        }, 700)
      }
    } else {
      onUpdateRound?.(roundIndex, {
        placedCards: nextSlots,
        errorsCount,
        hintsUsed,
      })
    }
  }

  // Quitar tarjeta de slot y devolverla a la bandeja
  const handleRemoveFromSlot = (slotIdx: number) => {
    if (isProcessingRef.current || feedback === 'success' || completed) return
    if (!placedCards[slotIdx]) return

    const nextSlots = [...placedCards]
    nextSlots[slotIdx] = null
    setPlacedCards(nextSlots)
    soundManager.playClick(soundEnabled)
    onUpdateRound?.(roundIndex, {
      placedCards: nextSlots,
      errorsCount,
      hintsUsed,
    })
  }

  const handleTapTrayCard = (card: StoryCard) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    if (selectedCardId === card.id) {
      setSelectedCardId(null)
    } else {
      setSelectedCardId(card.id)
      soundManager.playClick(soundEnabled)
    }
  }

  const handleTapSlot = (slotIdx: number) => {
    if (selectedCardId) {
      const card = roundData.cards.find((c) => c.id === selectedCardId)
      if (card) {
        handleAssignToSlot(card, slotIdx)
      }
    } else {
      handleRemoveFromSlot(slotIdx)
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

  // Pointer drag con umbral de 8px, captura de currentTarget y supresión de click tras arrastre
  const handlePointerDown = (card: StoryCard, e: React.PointerEvent) => {
    if (isProcessingRef.current || feedback === 'success' || completed) return
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    } catch {}
    isDraggingRef.current = true
    hasDraggedRef.current = false
    suppressClickRef.current = false
    dragStartPosRef.current = { x: e.clientX, y: e.clientY }
    draggingItemRef.current = card
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
      setDraggingCard(draggingItemRef.current)
    }
    if (hasDraggedRef.current) {
      setDragPos({ x: e.clientX, y: e.clientY })
    }
  }

  const handlePointerUp = (card: StoryCard, e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
    } catch {}

    if (hasDraggedRef.current) {
      for (let i = 0; i < totalSlots; i++) {
        const el = slotRefs.current[i]
        if (el) {
          const rect = el.getBoundingClientRect()
          const inside =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom

          if (inside) {
            handleAssignToSlot(card, i)
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
    draggingItemRef.current = null
    setDraggingCard(null)
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
    draggingItemRef.current = null
    setDraggingCard(null)
    setDragPos(null)
  }

  const handleRestart = () => {
    if (onRestart) {
      onRestart()
      return
    }
    const newId = `match_stories_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    setMatchId(newId)
    setRoundIndex(0)
    setPlacedCards(new Array(totalSlots).fill(null))
    setSelectedCardId(null)
    setFeedback('idle')
    setErrorsCount(0)
    setHintsUsed(0)
    setShowHint(false)
    setCompleted(false)
    isProcessingRef.current = false
    onUpdateRound?.(0, { errorsCount: 0, hintsUsed: 0 })
  }

  return (
    <main className="screen-container activity-screen stories-game-screen">
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

      {/* Banner de instrucción con título de la historia */}
      <div className="game-instruction-banner">
        <p className="instruction-text">
          {roundData.storyTitle}: Ordena los momentos del cuento
        </p>
      </div>

      {/* Línea de tiempo con casillas numeradas 1, 2, ... */}
      <section className="story-timeline-slots" aria-label="Línea de tiempo de la historia">
        {placedCards.map((card, idx) => {
          const stepNum = idx + 1
          const isSlotActive = selectedCardId !== null && !card
          const isHighlighted =
            showHint && selectedCardId && roundData.cards.find((c) => c.id === selectedCardId)?.stepNumber === stepNum

          return (
            <button
              type="button"
              key={idx}
              ref={(el) => {
                slotRefs.current[idx] = el
              }}
              className={`story-slot-card ${isSlotActive ? 'story-slot-active' : ''} ${
                isHighlighted ? 'story-slot-hint-glow' : ''
              } ${feedback === 'retry' ? 'story-slot-shake' : ''}`}
              onClick={() => handleTapSlot(idx)}
              aria-label={
                card
                  ? `Paso ${stepNum}: ${card.title}. Toca para retirar de la casilla`
                  : `Paso ${stepNum} de la historia vacío. Toca para colocar aquí`
              }
            >
              <span className="slot-number-badge">{stepNum}</span>
              {card ? (
                <div className="slotted-vignette-wrap">
                  <StoryVignette illustrationKey={card.illustrationKey} size={90} />
                  <span className="slotted-vignette-title">{card.title}</span>
                </div>
              ) : (
                <div className="slot-placeholder-prompt">
                  <span>Toca para colocar aquí</span>
                </div>
              )}
            </button>
          )
        })}
      </section>

      {/* Bandeja inferior con viñetas por ordenar */}
      {!completed && trayCards.length > 0 && (
        <section className="story-tray-container" aria-label="Viñetas disponibles para ordenar">
          <p className="tray-instruction-hint">Toca o arrastra la viñeta a su casilla:</p>
          <div className="story-tray-row">
            {trayCards.map((card) => {
              const isSelected = selectedCardId === card.id
              return (
                <button
                  key={card.id}
                  type="button"
                  className={`story-tray-item-btn ${isSelected ? 'story-item-selected' : ''}`}
                  onClick={() => handleTapTrayCard(card)}
                  onPointerDown={(e) => handlePointerDown(card, e)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={(e) => handlePointerUp(card, e)}
                  onPointerCancel={handlePointerCancel}
                  aria-label={`${card.title}: ${card.description}`}
                  style={{ touchAction: 'none' }}
                >
                  <StoryVignette illustrationKey={card.illustrationKey} size={90} />
                  <span className="story-item-caption">{card.title}</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Floating drag proxy */}
      {draggingCard && dragPos && (
        <div
          className="drag-floating-proxy"
          style={{
            position: 'fixed',
            left: dragPos.x - 45,
            top: dragPos.y - 45,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          <StoryVignette illustrationKey={draggingCard.illustrationKey} size={90} />
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
            <h2 className="celebration-title">¡Hermoso Cuento!</h2>
            <p className="celebration-subtitle">
              ¡Ordenaste la historia paso a paso a la perfección!
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
