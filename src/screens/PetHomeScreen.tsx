import { useState, useRef, useEffect } from 'react'
import type { PetId, PetProgress, DifficultyLevel, GrowthStage, PetReaction } from '../game/types'
import {
  calculateStage,
  calculateGrowthUnitsForStage,
  GROWTH_UNITS_PER_FEED,
  GROWTH_THRESHOLDS,
  getPetGrowthProgress,
  getPetTotalScore,
} from '../game/rules'
import { CompositePetRenderer } from '../components/svg/CompositePetRenderer'
import {
  BackIcon,
  SoundOnIcon,
  SoundOffIcon,
  SettingsIcon,
  FoodFruitIcon,
  AlbumIcon,
  ShopIcon,
  PlayIcon,
  HeartIcon,
  SparkleIcon,
  SproutStageIcon,
  StarIcon,
} from '../components/svg/Icons'
import { TropicalSun, TropicalHills, DeepForestBackdrop } from '../components/svg/Scenery'
import AdultModal from '../components/AdultModal'
import EvolutionModal from '../components/EvolutionModal'
import { soundManager } from '../audio/soundManager'

interface PetHomeScreenProps {
  pet: PetProgress
  pets: Record<PetId, PetProgress>
  selectedPetId: PetId
  soundEnabled: boolean
  difficultyLevel?: DifficultyLevel
  onToggleSound: () => void
  onChangeDifficulty?: (level: DifficultyLevel) => void
  onResetGame: () => void
  onSelectPet: (id: PetId) => void
  onOpenActivities: () => void
  onOpenAlbum: () => void
  onOpenShop: () => void
  onBackToWelcome: () => void
  onInteract: () => void
  onFeedPet: () => boolean
}

interface FloatingParticle {
  id: number
  type: 'heart' | 'sparkle'
  x: number
  y: number
}

const STAGES_META: Array<{ id: GrowthStage; name: string; threshold: number }> = [
  { id: 'baby', name: 'Bebé', threshold: GROWTH_THRESHOLDS.baby },
  { id: 'sprout', name: 'Pequeño', threshold: GROWTH_THRESHOLDS.sprout },
  { id: 'young', name: 'Explorador', threshold: GROWTH_THRESHOLDS.young },
  { id: 'adult', name: 'Adulto', threshold: GROWTH_THRESHOLDS.adult },
]

const PET_TABS: Array<{ id: PetId; name: string }> = [
  { id: 'monkey', name: 'Monito' },
  { id: 'turtle', name: 'Tortuguita' },
  { id: 'toucan', name: 'Tucancito' },
]

export default function PetHomeScreen({
  pet,
  pets,
  selectedPetId,
  soundEnabled,
  difficultyLevel = 'initial',
  onToggleSound,
  onChangeDifficulty,
  onResetGame,
  onSelectPet,
  onOpenActivities,
  onOpenAlbum,
  onOpenShop,
  onBackToWelcome,
  onInteract,
  onFeedPet,
}: PetHomeScreenProps) {
  const [reaction, setReaction] = useState<PetReaction>('none')
  const [evolutionData, setEvolutionData] = useState<{
    petId: PetId
    petName: string
    stage: GrowthStage
  } | null>(null)
  const [particles, setParticles] = useState<FloatingParticle[]>([])
  const [isAdultModalOpen, setIsAdultModalOpen] = useState(false)
  const [foodFeedback, setFoodFeedback] = useState<'idle' | 'empty' | 'fed'>('idle')
  const [isFoodSelected, setIsFoodSelected] = useState(false)

  // Dragging del alimento hacia la mascota
  const [foodDragProxy, setFoodDragProxy] = useState<{ x: number; y: number } | null>(null)
  const isFoodDraggingRef = useRef(false)
  const foodDragStartPosRef = useRef<{ x: number; y: number } | null>(null)
  const foodDragPosRef = useRef<{ x: number; y: number } | null>(null)

  // Dragging de caricias en la mascota
  const isPetDraggingRef = useRef(false)
  const hasPetDraggedRef = useRef(false)
  const suppressPetClickRef = useRef(false)
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null)

  const petContainerRef = useRef<HTMLDivElement>(null)
  const particleIdRef = useRef(0)
  const timersRef = useRef<number[]>([])

  const safeSetTimeout = (fn: () => void, delay: number) => {
    const t = window.setTimeout(fn, delay)
    timersRef.current.push(t)
    return t
  }

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((t) => clearTimeout(t))
    }
  }, [])

  // Progreso de crecimiento detallado y puntuación individual
  const growthProgress = getPetGrowthProgress(pet)
  const petScore = getPetTotalScore(pet)

  const spawnParticle = (type: 'heart' | 'sparkle', clientX: number, clientY: number, rect?: DOMRect) => {
    const x = rect ? clientX - rect.left : clientX
    const y = rect ? clientY - rect.top : clientY
    const newId = ++particleIdRef.current

    setParticles((prev) => [...prev.slice(-6), { id: newId, type, x, y }])

    safeSetTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newId))
    }, 900)
  }

  // Alimentación: cálculo canónico de evolución usando growthUnits + 3 y calculateStage
  const triggerFeed = (clientX?: number, clientY?: number) => {
    if (pet.foodCount <= 0) {
      setFoodFeedback('empty')
      soundManager.playGentleRetry(soundEnabled)
      safeSetTimeout(() => setFoodFeedback('idle'), 700)
      return
    }

    const currentGrowth = pet.growthUnits ?? calculateGrowthUnitsForStage(pet.stage)
    const nextGrowthUnits = currentGrowth + GROWTH_UNITS_PER_FEED
    const nextStage = calculateStage(nextGrowthUnits, pet.stage)
    const willEvolve = nextStage !== pet.stage

    const success = onFeedPet()
    if (success) {
      setFoodFeedback('fed')
      setReaction('eating')
      soundManager.playSuccess(soundEnabled)
      setIsFoodSelected(false)

      const rect = petContainerRef.current?.getBoundingClientRect()
      const x = clientX && rect ? clientX - rect.left : 120
      const y = clientY && rect ? clientY - rect.top : 100

      spawnParticle('heart', x, y)
      spawnParticle('sparkle', x + 20, y - 20)

      safeSetTimeout(() => {
        setReaction('none')
        setFoodFeedback('idle')
      }, 950)

      if (willEvolve) {
        safeSetTimeout(() => {
          setEvolutionData({
            petId: pet.id,
            petName: pet.name,
            stage: nextStage,
          })
        }, 850)
      }
    }
  }

  const handlePetTap = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPetDraggingRef.current || hasPetDraggedRef.current || suppressPetClickRef.current) return

    if (isFoodSelected) {
      triggerFeed(e.clientX, e.clientY)
      return
    }

    setReaction('tap')
    onInteract()

    const rect = e.currentTarget.getBoundingClientRect()
    spawnParticle('sparkle', e.clientX, e.clientY, rect)

    safeSetTimeout(() => {
      setReaction('none')
    }, 700)
  }

  const handlePetPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    isPetDraggingRef.current = false
    hasPetDraggedRef.current = false
    suppressPetClickRef.current = false
    lastPointerRef.current = { x: e.clientX, y: e.clientY }
  }

  const handlePetPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!lastPointerRef.current) return

    const dx = Math.abs(e.clientX - lastPointerRef.current.x)
    const dy = Math.abs(e.clientY - lastPointerRef.current.y)

    if (dx + dy > 16) {
      hasPetDraggedRef.current = true
      isPetDraggingRef.current = true
      lastPointerRef.current = { x: e.clientX, y: e.clientY }
      setReaction('pet')
      onInteract()

      const rect = e.currentTarget.getBoundingClientRect()
      if (Math.random() > 0.45) {
        spawnParticle('heart', e.clientX, e.clientY, rect)
      }
    }
  }

  const handlePetPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }

    if (hasPetDraggedRef.current) {
      suppressPetClickRef.current = true
      setTimeout(() => {
        suppressPetClickRef.current = false
      }, 150)
    }

    lastPointerRef.current = null
    safeSetTimeout(() => {
      setReaction('none')
      isPetDraggingRef.current = false
      hasPetDraggedRef.current = false
    }, 600)
  }

  const handlePetPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    lastPointerRef.current = null
    isPetDraggingRef.current = false
    hasPetDraggedRef.current = false
    suppressPetClickRef.current = false
    setReaction('none')
  }

  const handlePetKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (isFoodSelected) {
        triggerFeed()
      } else {
        setReaction('tap')
        onInteract()
        spawnParticle('sparkle', 120, 100)
        safeSetTimeout(() => setReaction('none'), 700)
      }
    }
  }

  // Manejo de alimentación por arrastre
  const handleFoodPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pet.foodCount <= 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    isFoodDraggingRef.current = false
    foodDragStartPosRef.current = { x: e.clientX, y: e.clientY }
    foodDragPosRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleFoodPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!foodDragStartPosRef.current) return
    const dist = Math.hypot(
      e.clientX - foodDragStartPosRef.current.x,
      e.clientY - foodDragStartPosRef.current.y
    )

    if (dist > 8) {
      isFoodDraggingRef.current = true
      foodDragPosRef.current = { x: e.clientX, y: e.clientY }
      setFoodDragProxy({ x: e.clientX, y: e.clientY })
    }
  }

  const handleFoodPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }

    if (isFoodDraggingRef.current && foodDragPosRef.current && petContainerRef.current) {
      const petRect = petContainerRef.current.getBoundingClientRect()
      const { x, y } = foodDragPosRef.current

      if (
        x >= petRect.left - 20 &&
        x <= petRect.right + 20 &&
        y >= petRect.top - 20 &&
        y <= petRect.bottom + 20
      ) {
        triggerFeed(x, y)
      }
    }

    isFoodDraggingRef.current = false
    foodDragStartPosRef.current = null
    foodDragPosRef.current = null
    setFoodDragProxy(null)
  }

  const handleFoodPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    isFoodDraggingRef.current = false
    foodDragStartPosRef.current = null
    foodDragPosRef.current = null
    setFoodDragProxy(null)
  }

  const handleFoodClick = () => {
    if (pet.foodCount <= 0) {
      setFoodFeedback('empty')
      soundManager.playGentleRetry(soundEnabled)
      safeSetTimeout(() => setFoodFeedback('idle'), 700)
      return
    }

    soundManager.playClick(soundEnabled)
    setIsFoodSelected((prev) => !prev)
  }

  const handleFoodKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleFoodClick()
    }
  }

  const currentStageIndex = STAGES_META.findIndex((s) => s.id === pet.stage)

  return (
    <main className="screen-container home-screen forest-screen">
      {/* Fondo de bosque profundo ilustrado */}
      <div className="forest-backdrop-full" aria-hidden="true">
        <DeepForestBackdrop />
      </div>

      <div className="sun-decoration-home">
        <TropicalSun width="85" height="85" />
      </div>

      {/* Barra superior con navegación, selector de mascota y controles */}
      <header className="home-top-bar forest-top-bar">
        <button
          type="button"
          className="btn-round-nav"
          onClick={onBackToWelcome}
          aria-label="Volver a la portada"
        >
          <BackIcon size={32} />
        </button>

        {/* Selector rápido y accesible de las 3 mascotas */}
        <div className="forest-pet-selector" role="tablist" aria-label="Cambiar de amigo">
          {PET_TABS.map((tab) => {
            const isTabActive = tab.id === selectedPetId
            const tabPet = pets[tab.id]
            const tabStageName = STAGES_META.find((s) => s.id === tabPet?.stage)?.name ?? 'Bebé'
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isTabActive}
                className={`forest-pet-pill ${isTabActive ? 'active' : ''}`}
                onClick={() => onSelectPet(tab.id)}
                aria-label={`Seleccionar ${tab.name} (${tabStageName})`}
              >
                <span className="pet-pill-name">{tab.name}</span>
              </button>
            )
          })}
        </div>

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
            onClick={() => setIsAdultModalOpen(true)}
            aria-label="Ajustes para adultos"
          >
            <SettingsIcon size={28} />
          </button>
        </div>
      </header>

      {/* Indicador de crecimiento por unidades y umbrales (0, 35, 80, 145) + Puntuación individual */}
      <section className="growth-tracker-container" aria-label="Progreso de crecimiento y puntuación">
        {/* Puntos y etapas */}
        <div className="hub-header-stats-row">
          <div className="growth-tracker-pills" role="group" aria-label="Etapas de crecimiento">
            {STAGES_META.map((s, index) => {
              const isActive = index <= currentStageIndex
              const isCurrent = index === currentStageIndex
              return (
                <div
                  key={s.id}
                  className={`stage-pill-item ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                  title={`${s.name} (${s.threshold} u)`}
                >
                  <SproutStageIcon size={24} active={isActive} />
                </div>
              )
            })}
          </div>

          {/* Puntuación individual de la mascota seleccionada */}
          <div className="hub-score-pill" aria-label={`Puntuación: ${petScore} de 630 puntos`}>
            <StarIcon size={20} filled={true} />
            <span className="hub-score-text">{petScore} / 630 pts</span>
          </div>
        </div>

        {/* Barra de progreso de crecimiento y umbral */}
        <div className="growth-bar-wrapper" aria-label={`Crecimiento: ${growthProgress.growthUnits} unidades`}>
          <div className="growth-bar-track">
            <div
              className="growth-bar-fill"
              style={{ width: `${growthProgress.progressPercent}%` }}
            />
          </div>
          <div className="growth-bar-labels">
            <span className="growth-units-text">
              {growthProgress.nextThreshold !== null
                ? `${growthProgress.growthUnits} / ${growthProgress.nextThreshold} unidades`
                : `${growthProgress.growthUnits} unidades (Nivel Adulto)`}
            </span>
            <span className={`growth-feed-hint ${growthProgress.canEvolve ? 'ready-evolve pulse-gentle' : ''}`}>
              {growthProgress.canEvolve
                ? '¡Alimenta para crecer!'
                : growthProgress.nextStage
                  ? 'Alimenta para crecer'
                  : '¡Compañero Sabio!'}
            </span>
          </div>
        </div>
      </section>

      {/* Mascota protagonista en su hábitat central */}
      <section className="pet-habitat-stage">
        <div
          ref={petContainerRef}
          className={`interactive-pet-wrapper ${reaction === 'tap' ? 'bounce-tap' : ''} ${reaction === 'pet' ? 'wiggle-pet' : ''} ${isFoodSelected ? 'pet-awaiting-food' : ''}`}
          onPointerDown={handlePetPointerDown}
          onPointerMove={handlePetPointerMove}
          onPointerUp={handlePetPointerUp}
          onPointerCancel={handlePetPointerCancel}
          onClick={handlePetTap}
          onKeyDown={handlePetKeyDown}
          role="button"
          tabIndex={0}
          aria-label={
            isFoodSelected
              ? `Toca a ${pet.name} para darle la fruta`
              : `Toca o acaricia para jugar con ${pet.name}`
          }
          style={{ touchAction: 'none' }}
        >
          <CompositePetRenderer
            id={pet.id}
            stage={pet.stage}
            reaction={reaction}
            size={240}
            equippedAccessories={pet.equippedAccessories}
          />

          {particles.map((p) => (
            <div
              key={p.id}
              className="floating-particle-item"
              style={{ left: `${p.x}px`, top: `${p.y}px` }}
            >
              {p.type === 'heart' ? <HeartIcon size={32} /> : <SparkleIcon size={28} />}
            </div>
          ))}
        </div>
      </section>

      {/* 4 Áreas Principales: CUIDAR, JUGAR, ÁLBUM, TIENDA */}
      <nav className="forest-action-areas" aria-label="Acciones principales del bosque">
        {/* 1. Área CUIDAR / Alimento */}
        <div
          className={`hub-action-card care-area-card ${foodFeedback === 'empty' ? 'shake-feedback' : ''} ${isFoodSelected ? 'food-pill-selected' : ''}`}
          onPointerDown={handleFoodPointerDown}
          onPointerMove={handleFoodPointerMove}
          onPointerUp={handleFoodPointerUp}
          onPointerCancel={handleFoodPointerCancel}
          onClick={handleFoodClick}
          onKeyDown={handleFoodKeyDown}
          role="button"
          tabIndex={0}
          aria-label={`Cuidar: tienes ${pet.foodCount} frutas. Arrastra o toca para alimentar a ${pet.name}.`}
        >
          <div className="hub-card-icon-wrap">
            <FoodFruitIcon size={44} />
          </div>
          <div className="hub-card-text">
            <span className="hub-card-title">CUIDAR</span>
            <span className="hub-card-count">{pet.foodCount} {pet.foodCount === 1 ? 'fruta' : 'frutas'}</span>
          </div>
        </div>

        {/* 2. Área JUGAR (Botón central grande que abre el catálogo de 7 actividades) */}
        <button
          type="button"
          className="hub-action-card play-area-card pulse-gentle"
          onClick={onOpenActivities}
          aria-label="Jugar: abrir catálogo de 7 actividades"
        >
          <div className="hub-card-icon-wrap">
            <PlayIcon size={46} />
          </div>
          <div className="hub-card-text">
            <span className="hub-card-title play-title">JUGAR</span>
            <span className="hub-card-sub">7 actividades</span>
          </div>
        </button>

        {/* 3. Área COLECCIÓN / ÁLBUM */}
        <button
          type="button"
          className="hub-action-card album-area-card"
          onClick={onOpenAlbum}
          aria-label="Colección: ver álbum de etapas y medallas"
        >
          <div className="hub-card-icon-wrap">
            <AlbumIcon size={40} />
          </div>
          <div className="hub-card-text">
            <span className="hub-card-title">ÁLBUM</span>
            <span className="hub-card-sub">Logros y etapas</span>
          </div>
        </button>

        {/* 4. Área TIENDA DEL BOSQUE */}
        <button
          type="button"
          className="hub-action-card shop-area-card"
          onClick={onOpenShop}
          aria-label="Tienda del Bosque: comprar y probar accesorios con puntos"
        >
          <div className="hub-card-icon-wrap">
            <ShopIcon size={40} />
          </div>
          <div className="hub-card-text">
            <span className="hub-card-title">TIENDA</span>
            <span className="hub-card-sub">Accesorios</span>
          </div>
        </button>
      </nav>

      {/* Fruta fantasma durante el arrastre */}
      {foodDragProxy && (
        <div
          className="dragging-fruit-proxy"
          style={{
            left: `${foodDragProxy.x - 24}px`,
            top: `${foodDragProxy.y - 24}px`,
          }}
        >
          <FoodFruitIcon size={54} />
        </div>
      )}

      <div className="scenery-layer hills-bottom">
        <TropicalHills />
      </div>

      <AdultModal
        isOpen={isAdultModalOpen}
        soundEnabled={soundEnabled}
        difficultyLevel={difficultyLevel}
        activePet={pet}
        onToggleSound={onToggleSound}
        onChangeDifficulty={onChangeDifficulty}
        onResetGame={onResetGame}
        onClose={() => setIsAdultModalOpen(false)}
      />

      {evolutionData && (
        <EvolutionModal
          isOpen={true}
          petId={evolutionData.petId}
          petName={evolutionData.petName}
          stage={evolutionData.stage}
          equippedAccessories={pet.equippedAccessories}
          onClose={() => setEvolutionData(null)}
        />
      )}
    </main>
  )
}
