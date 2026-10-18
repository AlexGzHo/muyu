import { useState, useEffect, useRef } from 'react'
import './styles/global.css'
import type { ActiveScreen, GameState, PetId } from './game/types'
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
  startMatch,
  finishAndRewardMatch,
  exitMatch,
} from './game/rules'
import { soundManager } from './audio/soundManager'
import WelcomeScreen from './screens/WelcomeScreen'
import SelectPetScreen from './screens/SelectPetScreen'
import PetHomeScreen from './screens/PetHomeScreen'
import CountingGame from './activities/counting/CountingGame'
import PlantGame from './activities/plant/PlantGame'
import ListeningGame from './activities/listening/ListeningGame'

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

  // Navegación simple entre pantallas
  const handleNavigate = (targetScreen: ActiveScreen) => {
    commitState({ ...stateRef.current, currentScreen: targetScreen })
  }

  // Selección de mascota (aislamiento de inventario y progreso por mascota)
  const handleSelectPet = (id: PetId) => {
    const switched = switchPet(stateRef.current, id)
    commitState({ ...switched, currentScreen: 'home' })
  }

  // Alternar sonido cancelando locución en curso al silenciar
  const handleToggleSound = () => {
    const next = toggleSound(stateRef.current)
    if (!next.settings.soundEnabled) {
      soundManager.cancelSpeech()
    }
    commitState(next)
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

  // Alimentar a la mascota activa (consume exactamente 1 unidad de forma determinista y síncrona)
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
  const handleLaunchActivity = (activity: 'counting' | 'plant' | 'listening') => {
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
    const { state: next } = finishAndRewardMatch(stateRef.current, activityId as any, matchId)
    commitState(next)
  }

  // Volver al hogar desde un minijuego (preserva el registro histórico de partidas ganadas)
  const handleExitActivity = () => {
    commitState(exitMatch(stateRef.current))
  }

  const currentPet = gameState.pets[gameState.selectedPetId]

  return (
    <>
      {screen === 'welcome' && (
        <WelcomeScreen onStart={() => handleNavigate('select')} />
      )}

      {screen === 'select' && (
        <SelectPetScreen
          pets={gameState.pets}
          selectedPetId={gameState.selectedPetId}
          onSelectPet={handleSelectPet}
          onBack={() => handleNavigate('welcome')}
        />
      )}

      {screen === 'home' && currentPet && (
        <PetHomeScreen
          pet={currentPet}
          soundEnabled={gameState.settings.soundEnabled}
          onToggleSound={handleToggleSound}
          onResetGame={handleResetGame}
          onBackToSelect={() => handleNavigate('select')}
          onInteract={handlePetInteract}
          onFeedPet={handleFeedPet}
          onLaunchActivity={handleLaunchActivity}
        />
      )}

      {screen === 'activity-counting' && (
        <CountingGame
          soundEnabled={gameState.settings.soundEnabled}
          activeMatch={gameState.activeMatch}
          onUpdateRound={handleUpdateMatchRound}
          onComplete={handleGameComplete}
          onExit={handleExitActivity}
        />
      )}

      {screen === 'activity-plant' && (
        <PlantGame
          soundEnabled={gameState.settings.soundEnabled}
          activeMatch={gameState.activeMatch}
          onUpdateRound={handleUpdateMatchRound}
          onComplete={handleGameComplete}
          onExit={handleExitActivity}
        />
      )}

      {screen === 'activity-listening' && (
        <ListeningGame
          soundEnabled={gameState.settings.soundEnabled}
          activeMatch={gameState.activeMatch}
          onUpdateRound={handleUpdateMatchRound}
          onComplete={handleGameComplete}
          onExit={handleExitActivity}
        />
      )}
    </>
  )
}

export default App
