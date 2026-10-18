import { useState, useRef, useEffect } from 'react'
import type { ActiveMatch, DifficultyLevel } from '../../game/types'
import { generatePlantRound, type PlantTool } from '../../game/activitiesModel'
import { BackIcon, SoundOnIcon, SparkleIcon, FoodFruitIcon } from '../../components/svg/Icons'
import {
  WateringCan,
  SunTool,
  SeedTool,
  SoilTool,
  CareTool,
  PlantPotStage,
  ShoeDistractor,
  HatDistractor,
  BallDistractor,
} from '../../components/svg/GameIllustrations'
import { TropicalHills } from '../../components/svg/Scenery'
import { soundManager } from '../../audio/soundManager'

interface PlantGameProps {
  soundEnabled: boolean
  activeMatch?: ActiveMatch | null
  onUpdateRound?: (roundIndex: number, partialData?: Record<string, unknown>) => void
  onComplete: (activityId: string, matchId: string) => void
  onRestart?: () => void
  onExit: () => void
}

const TOOL_NAMES_ES: Record<string, string> = {
  seed: 'Semilla',
  soil: 'Tierra',
  water: 'Agua',
  sun: 'Luz del Sol',
  care: 'Cuidado y cariño',
  shoe: 'Zapato',
  hat: 'Sombrero',
  ball: 'Pelota',
}

export default function PlantGame({
  soundEnabled,
  activeMatch,
  onUpdateRound,
  onComplete,
  onRestart,
  onExit,
}: PlantGameProps) {
  const [matchId, setMatchId] = useState<string>(
    () => activeMatch?.id ?? `match_plant_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  )
  const difficulty: DifficultyLevel = activeMatch?.difficulty ?? 'initial'

  const [roundIndex, setRoundIndex] = useState(
    () => (activeMatch ? Math.min(2, Math.max(0, activeMatch.roundIndex)) : 0)
  )

  const initialGivenItems = (() => {
    if (Array.isArray(activeMatch?.partialData?.givenItems)) {
      const valid: PlantTool[] = ['water', 'sun', 'seed', 'soil', 'care', 'shoe', 'hat', 'ball']
      return (activeMatch.partialData.givenItems as PlantTool[]).filter((it) => valid.includes(it))
    }
    return []
  })()

  const [givenItems, setGivenItems] = useState<PlantTool[]>(initialGivenItems)
  const isInitialCompleted = Boolean(activeMatch?.completed)
  const [completed, setCompleted] = useState(isInitialCompleted)

  const [plantVisualStage, setPlantVisualStage] = useState<1 | 2 | 3>(() => {
    if (isInitialCompleted) return 3
    const rIdx = activeMatch ? Math.min(2, Math.max(0, activeMatch.roundIndex)) : 0
    if (rIdx === 0) return 1
    if (rIdx === 1) return initialGivenItems.length > 0 ? 2 : 1
    return initialGivenItems.length > 0 ? 3 : 2
  })

  const [feedback, setFeedback] = useState<'idle' | 'success' | 'retry'>('idle')
  const [errorsCount, setErrorsCount] = useState<number>(
    () => (typeof activeMatch?.partialData?.errorsCount === 'number' ? activeMatch.partialData.errorsCount : 0)
  )
  const [hintsUsed, setHintsUsed] = useState<number>(
    () => (typeof activeMatch?.partialData?.hintsUsed === 'number' ? activeMatch.partialData.hintsUsed : 0)
  )
  const [showHint, setShowHint] = useState(false)
  const [showDemo, setShowDemo] = useState(true)

  const isProcessingRef = useRef(false)
  const timersRef = useRef<number[]>([])
  const potRef = useRef<HTMLDivElement>(null)

  // Drag controls
  const isDraggingRef = useRef(false)
  const hasDraggedRef = useRef(false)
  const suppressClickRef = useRef(false)
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null)
  const draggingToolRef = useRef<PlantTool | null>(null)
  const [draggingItem, setDraggingItem] = useState<PlantTool | null>(null)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)

  const contentVersion = activeMatch?.contentVersion ?? 2
  const currentRound = generatePlantRound(matchId, roundIndex, difficulty, contentVersion)

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
    soundManager.speakSpanish(currentRound.audioText, soundEnabled)
  }

  useEffect(() => {
    soundManager.speakSpanish(currentRound.audioText, soundEnabled)
  }, [roundIndex, matchId, currentRound.audioText, soundEnabled])

  const renderToolIcon = (tool: PlantTool, size = 70) => {
    switch (tool) {
      case 'water':
        return <WateringCan size={size} />
      case 'sun':
        return <SunTool size={size} />
      case 'seed':
        return <SeedTool size={size} />
      case 'soil':
        return <SoilTool size={size} />
      case 'care':
        return <CareTool size={size} />
      case 'shoe':
        return <ShoeDistractor size={size} />
      case 'hat':
        return <HatDistractor size={size} />
      case 'ball':
        return <BallDistractor size={size} />
    }
  }

  const applyItemToPlant = (item: PlantTool) => {
    if (isProcessingRef.current || feedback === 'success' || completed) return
    setShowDemo(false)

    // Exigir exactamente el paso esperado por la receta pedagógica
    const expectedTool = currentRound.requiredTools[givenItems.length]
    if (item === expectedTool) {
      const updatedGiven = [...givenItems, item]
      setGivenItems(updatedGiven)
      soundManager.playSuccess(soundEnabled)

      const isRoundDone = updatedGiven.length === currentRound.requiredTools.length
      const nextVisualStage: 1 | 2 | 3 = isRoundDone
        ? (roundIndex === 0 ? 1 : roundIndex === 1 ? 2 : 3)
        : (roundIndex === 0 ? 1 : roundIndex === 1 ? 1 : 2)
      setPlantVisualStage(nextVisualStage)

      onUpdateRound?.(roundIndex, {
        givenItems: updatedGiven,
        plantVisualStage: nextVisualStage,
        errorsCount,
        hintsUsed,
      })

      if (isRoundDone) {
        setFeedback('success')
        isProcessingRef.current = true

        safeSetTimeout(() => {
          if (roundIndex < 2) {
            const nextRound = roundIndex + 1
            const nextRoundStage: 1 | 2 | 3 = nextRound === 1 ? 1 : 2
            setRoundIndex(nextRound)
            setGivenItems([])
            setPlantVisualStage(nextRoundStage)
            setFeedback('idle')
            setShowHint(false)
            setShowDemo(true)
            isProcessingRef.current = false
            onUpdateRound?.(nextRound, {
              givenItems: [],
              plantVisualStage: nextRoundStage,
              errorsCount,
              hintsUsed,
            })
          } else {
            setCompleted(true)
            setPlantVisualStage(3)
            onComplete('plant', matchId)
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
        givenItems,
        plantVisualStage,
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
    playPromptAudio()
    onUpdateRound?.(roundIndex, {
      givenItems,
      plantVisualStage,
      errorsCount,
      hintsUsed: nextHints,
    })
  }

  // Pointer drag gestures con umbral > 8px y supresión de click tras arrastre
  const handlePointerDown = (tool: PlantTool, e: React.PointerEvent) => {
    if (isProcessingRef.current || feedback === 'success' || completed) return
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    } catch {}
    isDraggingRef.current = true
    hasDraggedRef.current = false
    suppressClickRef.current = false
    dragStartPosRef.current = { x: e.clientX, y: e.clientY }
    draggingToolRef.current = tool
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
      setDraggingItem(draggingToolRef.current)
    }
    if (hasDraggedRef.current) {
      setDragPos({ x: e.clientX, y: e.clientY })
    }
  }

  const handlePointerUp = (tool: PlantTool, e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
    } catch {}

    if (hasDraggedRef.current) {
      const pot = potRef.current
      if (pot) {
        const rect = pot.getBoundingClientRect()
        const inside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom

        if (inside) {
          applyItemToPlant(tool)
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
    draggingToolRef.current = null
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
    draggingToolRef.current = null
    setDraggingItem(null)
    setDragPos(null)
  }

  const handleToolClick = (tool: PlantTool) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    applyItemToPlant(tool)
  }

  const handleRestart = () => {
    if (onRestart) {
      onRestart()
      return
    }
    const newId = `match_plant_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    setMatchId(newId)
    setRoundIndex(0)
    setGivenItems([])
    setPlantVisualStage(1)
    setFeedback('idle')
    setErrorsCount(0)
    setHintsUsed(0)
    setShowHint(false)
    setShowDemo(true)
    setCompleted(false)
    isProcessingRef.current = false
    onUpdateRound?.(0, {
      givenItems: [],
      plantVisualStage: 1,
      errorsCount: 0,
      hintsUsed: 0,
    })
  }

  return (
    <main className="screen-container activity-screen plant-game-screen">
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
        <p className="instruction-text">{currentRound.instructionText}</p>
      </div>

      {!completed ? (
        <div className="plant-game-play-area">
          {/* Pasos pictográficos de la receta */}
          <div className="plant-recipe-steps" aria-label="Pasos de la receta para el huerto">
            {currentRound.requiredTools.map((reqTool, idx) => {
              const isDone = idx < givenItems.length
              const isCurrent = idx === givenItems.length
              return (
                <div
                  key={idx}
                  className={`recipe-step-badge ${isDone ? 'step-done' : isCurrent ? 'step-current' : 'step-pending'}`}
                  title={`Paso ${idx + 1}`}
                >
                  <span className="step-num-pill">{idx + 1}</span>
                  <div className="step-icon-thumb">{renderToolIcon(reqTool, 34)}</div>
                </div>
              )
            })}
          </div>

          {/* Maceta interactiva */}
          <div
            ref={potRef}
            className={`plant-pot-target ${feedback === 'retry' ? 'shake-feedback' : ''} ${
              feedback === 'success' ? 'bounce-feedback' : ''
            }`}
            role="region"
            aria-label={`Maceta en etapa de crecimiento ${plantVisualStage}`}
          >
            <PlantPotStage stage={plantVisualStage} size={210} />
          </div>

          {/* Bandeja de herramientas y distractores */}
          <div className="plant-tools-shelf" role="toolbar" aria-label="Herramientas de cuidado">
            {showDemo && (
              <div className="tools-shelf-hint">
                <span>Toca o arrastra el elemento correcto a la maceta</span>
              </div>
            )}
            <div className="plant-tools-row">
              {currentRound.options.map((item, idx) => {
                const isAlreadyGiven = givenItems.includes(item)
                const isNeeded = currentRound.requiredTools.includes(item) && !isAlreadyGiven
                const highlight = showHint && isNeeded

                return (
                  <button
                    key={`${item}-${idx}`}
                    type="button"
                    className={`tool-option-card ${isAlreadyGiven ? 'tool-already-used' : ''} ${
                      highlight ? 'tool-highlighted' : ''
                    } ${feedback === 'retry' && !isNeeded ? 'tool-wiggle' : ''}`}
                    onClick={() => handleToolClick(item)}
                    onPointerDown={(e) => handlePointerDown(item, e)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={(e) => handlePointerUp(item, e)}
                    onPointerCancel={handlePointerCancel}
                    disabled={isAlreadyGiven}
                    aria-label={`Herramienta ${TOOL_NAMES_ES[item] || item}. ${isAlreadyGiven ? 'Ya aplicada' : 'Toca para aplicar'}`}
                    style={{ touchAction: 'none' }}
                  >
                    {renderToolIcon(item, 70)}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Modal de celebración y resultados */
        <div className="game-modal-backdrop" role="dialog" aria-modal="true" aria-label="¡Juego completado!">
          <div className="game-celebration-card">
            <div className="celebration-sparkles">
              <SparkleIcon size={56} />
            </div>
            <h2 className="celebration-title">¡Qué hermosa flor!</h2>
            <p className="celebration-subtitle">Cuidaste la planta con éxito en las 3 etapas.</p>
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

      {/* Floating drag proxy */}
      {draggingItem && dragPos && (
        <div
          className="drag-floating-proxy"
          style={{
            position: 'fixed',
            left: dragPos.x - 35,
            top: dragPos.y - 35,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          {renderToolIcon(draggingItem, 70)}
        </div>
      )}

      <div className="scenery-layer hills-bottom">
        <TropicalHills />
      </div>
    </main>
  )
}
