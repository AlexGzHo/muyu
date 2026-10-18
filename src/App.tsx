import { useState, useEffect, useRef } from 'react'
import './styles/global.css'
import type {
  ActiveScreen,
  GameState,
  PetId,
  ActivityId,
  DifficultyLevel,
  AccessoryId,
  AccessoryCategory,
} from './game/types'
import {
  loadGameState,
  saveGameState,
  clearGameState,
} from './game/persistence'
import {
  feedPet,
  interactWithPet,
  switchPet,
  toggleSound,
  setDifficultyLevel,
  hasGameProgress,
  startMatch,
  finishAndRewardMatch,
  exitMatch,
  buyAccessory,
  equipAccessory,
  unequipAccessory,
} from './game/rules'
import { soundManager } from './audio/soundManager'
import WelcomeScreen from './screens/WelcomeScreen'
import SelectPetScreen from './screens/SelectPetScreen'
import PetHomeScreen from './screens/PetHomeScreen'
import ActivitiesScreen from './screens/ActivitiesScreen'
import AlbumScreen from './screens/AlbumScreen'
import ShopScreen from './screens/ShopScreen'
import ResultScreen from './screens/ResultScreen'
import CountingGame from './activities/counting/CountingGame'
import PatternsGame from './activities/patterns/PatternsGame'
import PlantGame from './activities/plant/PlantGame'
import HabitatsGame from './activities/habitats/HabitatsGame'
import ListeningGame from './activities/listening/ListeningGame'
import StoriesGame from './activities/stories/StoriesGame'
import ShadowsGame from './activities/shadows/ShadowsGame'

function App() {
  const [gameState, setGameState] = useState<GameState>(() => loadGameState())
  const stateRef = useRef<GameState>(gameState)
  const screen = gameState.currentScreen

  // Transición atómica de estado fuera de updaters y fuera de render
  const commitState = (next: GameState) => {
    stateRef.current = next
    setGameState(next)
    saveGameState(next)
  }

  // Persistir automáticamente ante cualquier cambio de estado y sincronizar ref
  useEffect(() => {
    stateRef.current = gameState
    saveGameState(gameState)
  }, [gameState])

  // Navegación predecible entre pantallas
  const handleNavigate = (targetScreen: ActiveScreen) => {
    commitState({ ...stateRef.current, currentScreen: targetScreen })
  }

  // Continuar o iniciar desde la portada
  const handleStartFromWelcome = () => {
    if (hasGameProgress(stateRef.current)) {
      // Si ya hay progreso, continuar directamente al bosque central
      commitState({ ...stateRef.current, currentScreen: 'forest' })
    } else {
      // Si es primera vez, ir a elegir mascota
      commitState({ ...stateRef.current, currentScreen: 'select' })
    }
  }

  // Selección de mascota (aislamiento de inventario y progreso por mascota)
  const handleSelectPet = (id: PetId) => {
    const switched = switchPet(stateRef.current, id)
    commitState({ ...switched, currentScreen: 'forest' })
  }

  // Alternar sonido cancelando locución en curso al silenciar
  const handleToggleSound = () => {
    const next = toggleSound(stateRef.current)
    if (!next.settings.soundEnabled) {
      soundManager.cancelSpeech()
    }
    commitState(next)
  }

  // Cambiar nivel pedagógico
  const handleChangeDifficulty = (level: DifficultyLevel) => {
    commitState(setDifficultyLevel(stateRef.current, level))
  }

  // Reiniciar partida desde modal de adultos
  const handleResetGame = () => {
    const fresh = clearGameState()
    stateRef.current = fresh
    setGameState(fresh)
  }

  // Registro de interacción con la mascota
  const handlePetInteract = () => {
    commitState(interactWithPet(stateRef.current, stateRef.current.selectedPetId))
  }

  // Alimentar a la mascota activa (consume exactamente 1 unidad)
  const handleFeedPet = (): boolean => {
    const current = stateRef.current
    const petId = current.selectedPetId
    const currentPet = current.pets[petId]
    if (!currentPet || currentPet.foodCount <= 0) {
      return false
    }

    const { state: nextState, success } = feedPet(current, petId)
    if (success) {
      commitState(nextState)
      return true
    }
    return false
  }

  // Lanzar un minijuego real con partida activa tipada y persistida
  const handleLaunchActivity = (activity: ActivityId) => {
    commitState(startMatch(stateRef.current, activity))
  }

  // Reiniciar una actividad con una nueva partida activa limpia y premiable
  const handleRestartActivity = (activity: ActivityId) => {
    commitState(startMatch(stateRef.current, activity))
  }

  // Actualizar ronda o datos parciales de la partida activa
  const handleUpdateMatchRound = (roundIndex: number, partialData?: Record<string, unknown>) => {
    const current = stateRef.current
    if (!current.activeMatch) return
    const nextMatch = {
      ...current.activeMatch,
      roundIndex,
      partialData: partialData ?? current.activeMatch.partialData ?? {},
    }
    commitState({ ...current, activeMatch: nextMatch })
  }

  // Finalización de 3 rondas válidas: entrega exactamente 1 alimento atómico con matchId único (idempotente)
  const handleGameComplete = (activityId: string, matchId: string) => {
    const { state: next } = finishAndRewardMatch(stateRef.current, activityId as ActivityId, matchId)
    commitState(next)
  }

  // Salir de un minijuego: vuelve al catálogo de actividades
  const handleExitToActivities = () => {
    commitState({
      ...stateRef.current,
      currentScreen: 'activities',
      activeMatch: null,
    })
  }

  // Volver al bosque desde el botón BOSQUE de la pantalla de resultados
  const handleExitToForest = () => {
    commitState(exitMatch(stateRef.current))
  }

  // Comprar accesorio en la tienda
  const handleBuyAccessory = (petId: PetId, accessoryId: AccessoryId): boolean => {
    const { state: next, success } = buyAccessory(stateRef.current, petId, accessoryId)
    if (success) {
      commitState(next)
      return true
    }
    return false
  }

  // Equipar accesorio adquirido
  const handleEquipAccessory = (petId: PetId, accessoryId: AccessoryId) => {
    const { state: next, success } = equipAccessory(stateRef.current, petId, accessoryId)
    if (success) {
      commitState(next)
    }
  }

  // Desequipar accesorio
  const handleUnequipAccessory = (petId: PetId, category: AccessoryCategory) => {
    const { state: next, success } = unequipAccessory(stateRef.current, petId, category)
    if (success) {
      commitState(next)
    }
  }

  const currentPet = gameState.pets[gameState.selectedPetId]
  const progressExists = hasGameProgress(gameState)

  // Detección de partida activa culminada para presentar la pantalla unificada de resultados
  const isMatchCompleted = Boolean(
    gameState.activeMatch &&
      gameState.activeMatch.completed &&
      gameState.currentScreen.startsWith('activity-')
  )

  return (
    <>
      {screen === 'welcome' && (
        <WelcomeScreen
          pets={gameState.pets}
          hasProgress={progressExists}
          soundEnabled={gameState.settings.soundEnabled}
          difficultyLevel={gameState.settings.difficultyLevel}
          onToggleSound={handleToggleSound}
          onChangeDifficulty={handleChangeDifficulty}
          onResetGame={handleResetGame}
          onStart={handleStartFromWelcome}
        />
      )}

      {screen === 'select' && (
        <SelectPetScreen
          pets={gameState.pets}
          selectedPetId={gameState.selectedPetId}
          onSelectPet={handleSelectPet}
          onBack={() => handleNavigate('welcome')}
        />
      )}

      {(screen === 'home' || screen === 'forest') && currentPet && (
        <PetHomeScreen
          pet={currentPet}
          pets={gameState.pets}
          selectedPetId={gameState.selectedPetId}
          soundEnabled={gameState.settings.soundEnabled}
          difficultyLevel={gameState.settings.difficultyLevel}
          onToggleSound={handleToggleSound}
          onChangeDifficulty={handleChangeDifficulty}
          onResetGame={handleResetGame}
          onSelectPet={handleSelectPet}
          onOpenActivities={() => handleNavigate('activities')}
          onOpenAlbum={() => handleNavigate('album')}
          onOpenShop={() => handleNavigate('shop')}
          onBackToWelcome={() => handleNavigate('welcome')}
          onInteract={handlePetInteract}
          onFeedPet={handleFeedPet}
        />
      )}

      {screen === 'activities' && currentPet && (
        <ActivitiesScreen
          pet={currentPet}
          difficultyLevel={gameState.settings.difficultyLevel || 'initial'}
          bestStars={currentPet.bestStars || gameState.bestStars}
          onLaunchActivity={handleLaunchActivity}
          onBackToForest={() => handleNavigate('forest')}
        />
      )}

      {screen === 'album' && currentPet && (
        <AlbumScreen
          pets={gameState.pets}
          initialPetId={gameState.selectedPetId}
          completedMatchCount={gameState.completedMatchIds.length}
          onBackToForest={() => handleNavigate('forest')}
        />
      )}

      {screen === 'shop' && currentPet && (
        <ShopScreen
          pets={gameState.pets}
          selectedPetId={gameState.selectedPetId}
          soundEnabled={gameState.settings.soundEnabled}
          onSelectPet={handleSelectPet}
          onBuyAccessory={handleBuyAccessory}
          onEquipAccessory={handleEquipAccessory}
          onUnequipAccessory={handleUnequipAccessory}
          onBackToForest={() => handleNavigate('forest')}
        />
      )}

      {/* Pantalla central común de resultados para los 7 juegos al completar partida */}
      {isMatchCompleted && currentPet && gameState.activeMatch ? (
        <ResultScreen
          key={gameState.activeMatch.id}
          activeMatch={gameState.activeMatch}
          pet={currentPet}
          soundEnabled={gameState.settings.soundEnabled}
          onRestart={handleRestartActivity}
          onExit={handleExitToForest}
        />
      ) : (
        <>
          {screen === 'activity-counting' && (
            <CountingGame
              key={gameState.activeMatch?.id ?? 'counting_fallback'}
              soundEnabled={gameState.settings.soundEnabled}
              activeMatch={gameState.activeMatch}
              onUpdateRound={handleUpdateMatchRound}
              onComplete={handleGameComplete}
              onRestart={() => handleRestartActivity('counting')}
              onExit={handleExitToActivities}
            />
          )}

          {screen === 'activity-patterns' && (
            <PatternsGame
              key={gameState.activeMatch?.id ?? 'patterns_fallback'}
              soundEnabled={gameState.settings.soundEnabled}
              activeMatch={gameState.activeMatch}
              onUpdateRound={handleUpdateMatchRound}
              onComplete={handleGameComplete}
              onRestart={() => handleRestartActivity('patterns')}
              onExit={handleExitToActivities}
            />
          )}

          {screen === 'activity-plant' && (
            <PlantGame
              key={gameState.activeMatch?.id ?? 'plant_fallback'}
              soundEnabled={gameState.settings.soundEnabled}
              activeMatch={gameState.activeMatch}
              onUpdateRound={handleUpdateMatchRound}
              onComplete={handleGameComplete}
              onRestart={() => handleRestartActivity('plant')}
              onExit={handleExitToActivities}
            />
          )}

          {screen === 'activity-habitats' && (
            <HabitatsGame
              key={gameState.activeMatch?.id ?? 'habitats_fallback'}
              soundEnabled={gameState.settings.soundEnabled}
              activeMatch={gameState.activeMatch}
              onUpdateRound={handleUpdateMatchRound}
              onComplete={handleGameComplete}
              onRestart={() => handleRestartActivity('habitats')}
              onExit={handleExitToActivities}
            />
          )}

          {screen === 'activity-listening' && (
            <ListeningGame
              key={gameState.activeMatch?.id ?? 'listening_fallback'}
              soundEnabled={gameState.settings.soundEnabled}
              activeMatch={gameState.activeMatch}
              onUpdateRound={handleUpdateMatchRound}
              onComplete={handleGameComplete}
              onRestart={() => handleRestartActivity('listening')}
              onExit={handleExitToActivities}
            />
          )}

          {screen === 'activity-stories' && (
            <StoriesGame
              key={gameState.activeMatch?.id ?? 'stories_fallback'}
              soundEnabled={gameState.settings.soundEnabled}
              activeMatch={gameState.activeMatch}
              onUpdateRound={handleUpdateMatchRound}
              onComplete={handleGameComplete}
              onRestart={() => handleRestartActivity('stories')}
              onExit={handleExitToActivities}
            />
          )}

          {screen === 'activity-shadows' && (
            <ShadowsGame
              key={gameState.activeMatch?.id ?? 'shadows_fallback'}
              soundEnabled={gameState.settings.soundEnabled}
              activeMatch={gameState.activeMatch}
              onUpdateRound={handleUpdateMatchRound}
              onComplete={handleGameComplete}
              onRestart={() => handleRestartActivity('shadows')}
              onExit={handleExitToActivities}
            />
          )}
        </>
      )}
    </>
  )
}

export default App
