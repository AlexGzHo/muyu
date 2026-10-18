import { useState, useRef, useEffect } from 'react'
import type { ActiveMatch, DifficultyLevel } from '../../game/types'
import {
  generateHabitatsRound,
  type AnimalSpeciesId,
  type HabitatId,
  type AnimalToClassify,
} from '../../game/activitiesModel'
import { BackIcon, SoundOnIcon, SparkleIcon, FoodFruitIcon } from '../../components/svg/Icons'
import { HabitatBackdrop, AnimalBadge } from '../../components/svg/GameIllustrations'
import { TropicalHills } from '../../components/svg/Scenery'
import { soundManager } from '../../audio/soundManager'

interface HabitatsGameProps {
  soundEnabled: boolean
  activeMatch?: ActiveMatch | null
  onUpdateRound?: (roundIndex: number, partialData?: Record<string, unknown>) => void
  onComplete: (activityId: string, matchId: string) => void
  onRestart?: () => void
  onExit: () => void
}

export default function HabitatsGame({
  soundEnabled,
  activeMatch,
  onUpdateRound,
  onComplete,
  onRestart,
  onExit,
}: HabitatsGameProps) {
  const [matchId, setMatchId] = useState<string>(
    () => activeMatch?.id ?? `match_habitats_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  )
  const difficulty: DifficultyLevel = activeMatch?.difficulty ?? 'initial'

  const [roundIndex, setRoundIndex] = useState(
    () => (activeMatch ? Math.min(2, Math.max(0, activeMatch.roundIndex)) : 0)
  )

  const initialPlaced = (() => {
    if (activeMatch?.partialData?.placedAnimals && typeof activeMatch.partialData.placedAnimals === 'object') {
      return activeMatch.partialData.placedAnimals as Record<string, HabitatId>
    }
    return {}
  })()
  const [placedAnimals, setPlacedAnimals] = useState<Record<string, HabitatId>>(initialPlaced)
  const [selectedAnimalId, setSelectedAnimalId] = useState<AnimalSpeciesId | null>(null)
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
  const habitatRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Drag state
  const isDraggingRef = useRef(false)
  const hasDraggedRef = useRef(false)
  const suppressClickRef = useRef(false)
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null)
  const draggingAnimalRef = useRef<AnimalToClassify | null>(null)
  const [draggingAnimal, setDraggingAnimal] = useState<AnimalToClassify | null>(null)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)

  const roundData = generateHabitatsRound(matchId, roundIndex, difficulty)

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

  // Animales aún por clasificar
  const unplacedAnimals = roundData.animals.filter((a) => !placedAnimals[a.id])

  const handlePlaceAnimal = (animal: AnimalToClassify, habitatId: HabitatId) => {
    if (isProcessingRef.current || feedback === 'success' || completed) return

    if (animal.correctHabitat === habitatId) {
      soundManager.playSuccess(soundEnabled)
      const nextPlaced = { ...placedAnimals, [animal.id]: habitatId }
      setPlacedAnimals(nextPlaced)
      setSelectedAnimalId(null)

      const remaining = roundData.animals.filter((a) => !nextPlaced[a.id])

      onUpdateRound?.(roundIndex, {
        placedAnimals: nextPlaced,
        errorsCount,
        hintsUsed,
      })

      if (remaining.length === 0) {
        setFeedback('success')
        isProcessingRef.current = true

        safeSetTimeout(() => {
          if (roundIndex < 2) {
            const nextR = roundIndex + 1
            setRoundIndex(nextR)
            setPlacedAnimals({})
            setSelectedAnimalId(null)
            setFeedback('idle')
            setShowHint(false)
            isProcessingRef.current = false
            onUpdateRound?.(nextR, { errorsCount, hintsUsed })
          } else {
            setCompleted(true)
            onComplete('habitats', matchId)
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

  const handleTapAnimal = (animal: AnimalToClassify) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    if (selectedAnimalId === animal.id) {
      setSelectedAnimalId(null)
    } else {
      setSelectedAnimalId(animal.id)
      soundManager.playClick(soundEnabled)
    }
  }

  const handleTapHabitat = (habitatId: HabitatId) => {
    if (!selectedAnimalId) return
    const animal = roundData.animals.find((a) => a.id === selectedAnimalId)
    if (animal) {
      handlePlaceAnimal(animal, habitatId)
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

  // Pointer drag con umbral de 8px y supresión de click tras arrastre
  const handlePointerDown = (animal: AnimalToClassify, e: React.PointerEvent) => {
    if (isProcessingRef.current || feedback === 'success' || completed) return
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    } catch {}
    isDraggingRef.current = true
    hasDraggedRef.current = false
    suppressClickRef.current = false
    dragStartPosRef.current = { x: e.clientX, y: e.clientY }
    draggingAnimalRef.current = animal
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
      setDraggingAnimal(draggingAnimalRef.current)
    }
    if (hasDraggedRef.current) {
      setDragPos({ x: e.clientX, y: e.clientY })
    }
  }

  const handlePointerUp = (animal: AnimalToClassify, e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
    } catch {}

    if (hasDraggedRef.current) {
      // Check collision with habitat zones
      for (const habitat of roundData.habitats) {
        const el = habitatRefs.current[habitat.id]
        if (el) {
          const rect = el.getBoundingClientRect()
          const inside =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom

          if (inside) {
            handlePlaceAnimal(animal, habitat.id)
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
    draggingAnimalRef.current = null
    setDraggingAnimal(null)
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
    draggingAnimalRef.current = null
    setDraggingAnimal(null)
    setDragPos(null)
  }

  const handleRestart = () => {
    if (onRestart) {
      onRestart()
      return
    }
    const newId = `match_habitats_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    setMatchId(newId)
    setRoundIndex(0)
    setPlacedAnimals({})
    setSelectedAnimalId(null)
    setFeedback('idle')
    setErrorsCount(0)
    setHintsUsed(0)
    setShowHint(false)
    setCompleted(false)
    isProcessingRef.current = false
    onUpdateRound?.(0, { errorsCount: 0, hintsUsed: 0 })
  }

  return (
    <main className="screen-container activity-screen habitats-game-screen">
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

      {/* Zonas de hábitats */}
      <section className="habitats-zones-row" aria-label="Zonas de hábitats">
        {roundData.habitats.map((habitat) => {
          const animalsInThisHabitat = roundData.animals.filter(
            (a) => placedAnimals[a.id] === habitat.id
          )
          const isTargetedBySelection = selectedAnimalId !== null
          const activeAnimal = roundData.animals.find((a) => a.id === selectedAnimalId)
          const highlightCorrect = showHint && activeAnimal && activeAnimal.correctHabitat === habitat.id

          return (
            <div
              key={habitat.id}
              ref={(el) => {
                habitatRefs.current[habitat.id] = el
              }}
              className={`habitat-zone-card ${isTargetedBySelection ? 'habitat-drop-ready' : ''} ${
                highlightCorrect ? 'habitat-hint-glow' : ''
              }`}
              onClick={() => handleTapHabitat(habitat.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleTapHabitat(habitat.id)
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Hábitat ${habitat.name}`}
            >
              <div className="habitat-backdrop-wrap">
                <HabitatBackdrop id={habitat.id} size={130} />
              </div>
              <h4 className="habitat-title-label">{habitat.name}</h4>

              {/* Animales ya ubicados con éxito en este hábitat */}
              <div className="placed-animals-cluster">
                {animalsInThisHabitat.map((a) => (
                  <div key={a.id} className="placed-animal-badge">
                    <AnimalBadge id={a.id} size={50} />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </section>

      {/* Bandeja de animales por ubicar */}
      {!completed && unplacedAnimals.length > 0 && (
        <section className="unplaced-animals-tray" aria-label="Animales por colocar">
          <p className="tray-instruction-hint">Toca o arrastra al animal a su hogar:</p>
          <div className="animals-tokens-row">
            {unplacedAnimals.map((animal) => {
              const isSelected = selectedAnimalId === animal.id
              return (
                <button
                  key={animal.id}
                  type="button"
                  className={`animal-token-btn ${isSelected ? 'animal-selected-glow' : ''} ${
                    feedback === 'retry' && isSelected ? 'animal-wiggle' : ''
                  }`}
                  onClick={() => handleTapAnimal(animal)}
                  onPointerDown={(e) => handlePointerDown(animal, e)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={(e) => handlePointerUp(animal, e)}
                  onPointerCancel={handlePointerCancel}
                  aria-label={`${animal.name}. Toca para seleccionar`}
                  style={{ touchAction: 'none' }}
                >
                  <AnimalBadge id={animal.id} size={64} />
                  <span className="animal-name-caption">{animal.name}</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Drag floating proxy */}
      {draggingAnimal && dragPos && (
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
          <AnimalBadge id={draggingAnimal.id} size={64} />
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
            <h2 className="celebration-title">¡Misión Cumplida!</h2>
            <p className="celebration-subtitle">
              ¡Todos los animalitos están felices en su hogar!
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
