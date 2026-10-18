/* ============================================================
   Muyu 2.0 — Modelo Canónico y Generadores Puros de Minijuegos
   Fase 3: 7 Minijuegos x 3 Dificultades x 3 Rondas = 21 Modos
   Funciones deterministas puras estables por semilla
   ============================================================ */

import type { DifficultyLevel } from './types'

// PRNG determinista basado en FNV-1a y LCG para estabilidad tras recarga
export function createSeededRandom(seed: string): () => number {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 0x01000193)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

/* ============================================================
   J1: Fiesta de frutas (counting)
   ============================================================ */
export interface CountingRoundData {
  targetCount: number
  availableFruits: number
  fruitType: 'mango' | 'apple' | 'orange' | 'strawberry'
  promptText: string
  audioText: string
}

export function formatCountingFruitPrompt(
  fruitType: CountingRoundData['fruitType'],
  count: number
): { promptText: string; audioText: string } {
  const fruitInfo: Record<
    CountingRoundData['fruitType'],
    { singular: string; plural: string; gender: 'm' | 'f' }
  > = {
    mango: { singular: 'mango', plural: 'mangos', gender: 'm' },
    apple: { singular: 'manzana', plural: 'manzanas', gender: 'f' },
    orange: { singular: 'naranja', plural: 'naranjas', gender: 'f' },
    strawberry: { singular: 'fresa', plural: 'fresas', gender: 'f' },
  }

  const fruit = fruitInfo[fruitType]
  const fruitWord = count === 1 ? fruit.singular : fruit.plural
  const audioCountWord = count === 1 ? (fruit.gender === 'f' ? 'una' : 'un') : `${count}`

  return {
    promptText: `Lleva ${count === 1 ? '1' : count} ${fruitWord} a la canasta`,
    audioText: `Coloca ${audioCountWord} ${fruitWord} en la canasta.`,
  }
}

export function generateCountingRound(
  matchId: string,
  roundIndex: number,
  difficulty: DifficultyLevel
): CountingRoundData {
  const rand = createSeededRandom(`counting_${matchId}_${roundIndex}_${difficulty}`)
  let targetCount = 3
  let availableFruits = 5
  let fruitType: CountingRoundData['fruitType'] = 'mango'

  const fruits: CountingRoundData['fruitType'][] = ['mango', 'apple', 'orange', 'strawberry']
  fruitType = fruits[Math.floor(rand() * fruits.length)]

  if (difficulty === 'initial') {
    // 1 a 3 frutas
    const targets = [1, 2, 3]
    targetCount = targets[roundIndex % targets.length]
    availableFruits = targetCount + 1
  } else if (difficulty === 'medium') {
    // 3 a 5 frutas
    const targets = [3, 4, 5]
    targetCount = targets[roundIndex % targets.length]
    availableFruits = targetCount + 2
  } else {
    // 4 a 6 frutas
    const targets = [4, 5, 6]
    targetCount = targets[roundIndex % targets.length]
    availableFruits = targetCount + 2
  }

  const { promptText, audioText } = formatCountingFruitPrompt(fruitType, targetCount)

  return {
    targetCount,
    availableFruits,
    fruitType,
    promptText,
    audioText,
  }
}

/* ============================================================
   J2: El camino de los patrones (patterns)
   ============================================================ */
export type PatternSymbol = 'circle' | 'square' | 'triangle' | 'star' | 'leaf' | 'flower'

export interface PatternRoundData {
  sequence: (PatternSymbol | null)[] // null representa la casilla vacía '?'
  missingIndex: number
  correctAnswer: PatternSymbol
  options: PatternSymbol[]
  promptText: string
}

export function generatePatternsRound(
  matchId: string,
  roundIndex: number,
  difficulty: DifficultyLevel
): PatternRoundData {
  const rand = createSeededRandom(`patterns_${matchId}_${roundIndex}_${difficulty}`)
  const allSymbols: PatternSymbol[] = ['circle', 'square', 'triangle', 'star', 'leaf', 'flower']

  // Selección de símbolos base
  const s1 = allSymbols[(roundIndex * 2) % allSymbols.length]
  const s2 = allSymbols[(roundIndex * 2 + 1) % allSymbols.length]
  const s3 = allSymbols[(roundIndex * 2 + 2) % allSymbols.length]

  let fullSeq: PatternSymbol[] = []
  let missingIndex = 3
  let optionsCount = 2

  if (difficulty === 'initial') {
    // Patrón AB-AB
    fullSeq = [s1, s2, s1, s2]
    missingIndex = 3 // Última casilla
    optionsCount = 2
  } else if (difficulty === 'medium') {
    // Patrón AAB-AAB o ABB-ABB
    const useAAB = roundIndex % 2 === 0
    fullSeq = useAAB ? [s1, s1, s2, s1, s1, s2] : [s1, s2, s2, s1, s2, s2]
    missingIndex = fullSeq.length - 1
    optionsCount = 3
  } else {
    // Patrón ABC-ABC o hueco alterno
    fullSeq = [s1, s2, s3, s1, s2, s3]
    missingIndex = roundIndex % 2 === 0 ? 4 : 5
    optionsCount = 4
  }

  const correctAnswer = fullSeq[missingIndex]
  const sequenceWithHole: (PatternSymbol | null)[] = fullSeq.map((s, idx) =>
    idx === missingIndex ? null : s
  )

  // Generar opciones asegurando incluir la respuesta correcta
  const distractors = allSymbols.filter((s) => s !== correctAnswer)
  // Mezcla determinista de distractores
  for (let i = distractors.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const temp = distractors[i]
    distractors[i] = distractors[j]
    distractors[j] = temp
  }

  const options: PatternSymbol[] = [correctAnswer, ...distractors.slice(0, optionsCount - 1)]
  // Barajar opciones deterministamente
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const temp = options[i]
    options[i] = options[j]
    options[j] = temp
  }

  return {
    sequence: sequenceWithHole,
    missingIndex,
    correctAnswer,
    options,
    promptText: '¿Qué figura sigue en el camino de patrones?',
  }
}

/* ============================================================
   J3: El huerto de Muyu (plant)
   ============================================================ */
export type PlantTool = 'water' | 'sun' | 'seed' | 'soil' | 'care' | 'shoe' | 'hat' | 'ball'

export interface PlantRoundData {
  instructionText: string
  audioText: string
  requiredTools: PlantTool[]
  options: PlantTool[]
  targetVisualStage: 1 | 2 | 3
}

export function generatePlantRound(
  matchId: string,
  roundIndex: number,
  difficulty: DifficultyLevel,
  contentVersion: 1 | 2 = 2
): PlantRoundData {
  if (contentVersion === 1) {
    if (roundIndex === 0) {
      return {
        instructionText: 'Riega la semillita con la regadera para ayudarla a crecer.',
        audioText: 'Riega la planta con agua fresca.',
        requiredTools: ['water'],
        options: ['water', 'sun', 'seed'],
        targetVisualStage: 1,
      }
    }
    if (roundIndex === 1) {
      return {
        instructionText: 'El brote verde necesita calor. ¡Dale la luz del sol!',
        audioText: 'Dale la luz del sol a la planta.',
        requiredTools: ['sun'],
        options: ['water', 'sun', 'seed'],
        targetVisualStage: 2,
      }
    }
    return {
      instructionText: '¡Aplica agua y sol para ver florecer la planta!',
      audioText: 'Aplica agua y sol para ver florecer la planta.',
      requiredTools: ['water', 'sun'],
      options: ['water', 'sun', 'seed'],
      targetVisualStage: 3,
    }
  }

  const rand = createSeededRandom(`plant_${matchId}_${roundIndex}_${difficulty}`)
  const distractorsPool: PlantTool[] = ['shoe', 'hat', 'ball']
  const d1 = distractorsPool[roundIndex % distractorsPool.length]
  const d2 = distractorsPool[(roundIndex + 1) % distractorsPool.length]

  if (difficulty === 'initial') {
    // 1 acción directa por ronda con 2 opciones (1 correcta, 1 distractor evidente)
    if (roundIndex === 0) {
      return {
        instructionText: 'Siembra la semillita en la tierra fértil.',
        audioText: 'Siembra la semillita en la maceta con tierra.',
        requiredTools: ['seed'],
        options: rand() > 0.5 ? ['seed', d1] : [d1, 'seed'],
        targetVisualStage: 1,
      }
    }
    if (roundIndex === 1) {
      return {
        instructionText: 'El brote verde tiene sed. ¡Dale agua con la regadera!',
        audioText: 'El brote verde necesita agua. Dale agua fresca con la regadera.',
        requiredTools: ['water'],
        options: rand() > 0.5 ? ['water', d1] : [d1, 'water'],
        targetVisualStage: 2,
      }
    }
    return {
      instructionText: '¡La flor necesita la luz del sol para abrirse y sonreír!',
      audioText: 'Para que la flor sonría, dale luz con el sol.',
      requiredTools: ['sun'],
      options: rand() > 0.5 ? ['sun', d2] : [d2, 'sun'],
      targetVisualStage: 3,
    }
  }

  if (difficulty === 'medium') {
    // Secuencias de 2 herramientas en orden con 3 opciones
    if (roundIndex === 0) {
      return {
        instructionText: 'Prepara la tierra fértil y siembra la semilla.',
        audioText: 'Primero coloca la tierra y luego siembra la semilla.',
        requiredTools: ['soil', 'seed'],
        options: ['soil', 'seed', d1],
        targetVisualStage: 1,
      }
    }
    if (roundIndex === 1) {
      return {
        instructionText: 'El tallo necesita agua fresca y calor de sol para crecer.',
        audioText: 'Dale agua y sol al brote verde para crecer fuerte.',
        requiredTools: ['water', 'sun'],
        options: ['water', 'sun', d1],
        targetVisualStage: 2,
      }
    }
    return {
      instructionText: 'Cuida la flor con agua y dale mucho cariño para florecer.',
      audioText: 'Para florecer, dale agua y mucho cuidado con cariño.',
      requiredTools: ['water', 'care'],
      options: ['water', 'care', d2],
      targetVisualStage: 3,
    }
  }

  // Avanzado: 3 pasos / herramientas según orden pedagógico con 4 opciones
  if (roundIndex === 0) {
    return {
      instructionText: 'Prepara tierra fértil, siembra la semilla y riega con agua.',
      audioText: 'Siembra con cuidado: tierra, semilla y agua fresca.',
      requiredTools: ['soil', 'seed', 'water'],
      options: ['soil', 'seed', 'water', d1],
      targetVisualStage: 1,
    }
  }
  if (roundIndex === 1) {
    return {
      instructionText: 'El brote crece fuerte con agua, luz de sol y cuidado.',
      audioText: 'Dale agua, luz de sol y abono de cuidado al brote.',
      requiredTools: ['water', 'sun', 'care'],
      options: ['water', 'sun', 'care', d1],
      targetVisualStage: 2,
    }
  }
  return {
    instructionText: 'Floración mágica: dale luz de sol radiante, agua y cuidado especial.',
    audioText: 'Dale sol radiante, agua fresca y cariño para la flor mágica.',
    requiredTools: ['sun', 'water', 'care'],
    options: ['sun', 'water', 'care', d2],
    targetVisualStage: 3,
  }
}

/* ============================================================
   J4: Cada animal en su hogar (habitats)
   ============================================================ */
export type HabitatId = 'tree' | 'river' | 'ground'
export type AnimalSpeciesId = 'toucan' | 'monkey' | 'fish' | 'turtle' | 'bear' | 'armadillo'

export interface AnimalToClassify {
  id: AnimalSpeciesId
  name: string
  correctHabitat: HabitatId
}

export interface HabitatsRoundData {
  animals: AnimalToClassify[]
  habitats: { id: HabitatId; name: string }[]
  promptText: string
}

export function generateHabitatsRound(
  matchId: string,
  roundIndex: number,
  difficulty: DifficultyLevel
): HabitatsRoundData {
  const rand = createSeededRandom(`habitats_${matchId}_${roundIndex}_${difficulty}`)

  if (difficulty === 'initial') {
    // 2 hábitats y 2 animales inequívocos
    const allPairs: { animals: AnimalToClassify[]; habitats: { id: HabitatId; name: string }[] }[] = [
      {
        habitats: [
          { id: 'tree', name: 'Árboles' },
          { id: 'river', name: 'Río' },
        ],
        animals: [
          { id: 'toucan', name: 'Tucán', correctHabitat: 'tree' },
          { id: 'fish', name: 'Pez', correctHabitat: 'river' },
        ],
      },
      {
        habitats: [
          { id: 'tree', name: 'Árboles' },
          { id: 'river', name: 'Río' },
        ],
        animals: [
          { id: 'monkey', name: 'Mono', correctHabitat: 'tree' },
          { id: 'turtle', name: 'Tortuga', correctHabitat: 'river' },
        ],
      },
      {
        habitats: [
          { id: 'river', name: 'Río' },
          { id: 'ground', name: 'Tierra' },
        ],
        animals: [
          { id: 'fish', name: 'Pez', correctHabitat: 'river' },
          { id: 'armadillo', name: 'Armadillo', correctHabitat: 'ground' },
        ],
      },
    ]
    return {
      ...allPairs[roundIndex % allPairs.length],
      promptText: 'Lleva a cada animalito a su hogar en el bosque',
    }
  }

  if (difficulty === 'medium') {
    // 2 hábitats y 3 animales (variando cada ronda)
    const mediumRounds: { animals: AnimalToClassify[]; habitats: { id: HabitatId; name: string }[] }[] = [
      {
        habitats: [
          { id: 'tree', name: 'Árboles' },
          { id: 'river', name: 'Río' },
        ],
        animals: [
          { id: 'monkey', name: 'Mono', correctHabitat: 'tree' },
          { id: 'fish', name: 'Pez', correctHabitat: 'river' },
          { id: 'toucan', name: 'Tucán', correctHabitat: 'tree' },
        ],
      },
      {
        habitats: [
          { id: 'river', name: 'Río' },
          { id: 'ground', name: 'Tierra' },
        ],
        animals: [
          { id: 'turtle', name: 'Tortuga', correctHabitat: 'river' },
          { id: 'armadillo', name: 'Armadillo', correctHabitat: 'ground' },
          { id: 'fish', name: 'Pez', correctHabitat: 'river' },
        ],
      },
      {
        habitats: [
          { id: 'tree', name: 'Árboles' },
          { id: 'ground', name: 'Tierra' },
        ],
        animals: [
          { id: 'toucan', name: 'Tucán', correctHabitat: 'tree' },
          { id: 'armadillo', name: 'Armadillo', correctHabitat: 'ground' },
          { id: 'monkey', name: 'Mono', correctHabitat: 'tree' },
        ],
      },
    ]
    const chosenRound = mediumRounds[roundIndex % mediumRounds.length]
    const animals = [...chosenRound.animals]
    for (let i = animals.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      const temp = animals[i]
      animals[i] = animals[j]
      animals[j] = temp
    }
    return {
      habitats: chosenRound.habitats,
      animals,
      promptText: 'Acompaña a cada amigo a su hogar natural',
    }
  }

  // Avanzado: 3 hábitats y 4 animales (variando cada ronda)
  const advancedSets: AnimalToClassify[][] = [
    [
      { id: 'toucan', name: 'Tucán', correctHabitat: 'tree' },
      { id: 'fish', name: 'Pez', correctHabitat: 'river' },
      { id: 'armadillo', name: 'Armadillo', correctHabitat: 'ground' },
      { id: 'monkey', name: 'Mono', correctHabitat: 'tree' },
    ],
    [
      { id: 'turtle', name: 'Tortuga', correctHabitat: 'river' },
      { id: 'monkey', name: 'Mono', correctHabitat: 'tree' },
      { id: 'armadillo', name: 'Armadillo', correctHabitat: 'ground' },
      { id: 'fish', name: 'Pez', correctHabitat: 'river' },
    ],
    [
      { id: 'toucan', name: 'Tucán', correctHabitat: 'tree' },
      { id: 'turtle', name: 'Tortuga', correctHabitat: 'river' },
      { id: 'armadillo', name: 'Armadillo', correctHabitat: 'ground' },
      { id: 'monkey', name: 'Mono', correctHabitat: 'tree' },
    ],
  ]

  const pool = [...advancedSets[roundIndex % advancedSets.length]]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const temp = pool[i]
    pool[i] = pool[j]
    pool[j] = temp
  }

  return {
    habitats: [
      { id: 'tree', name: 'Árboles' },
      { id: 'river', name: 'Río' },
      { id: 'ground', name: 'Tierra' },
    ],
    animals: pool,
    promptText: 'Clasifica a los 4 amigos en su hogar correcto',
  }
}

/* ============================================================
   J5: Escucha y encuentra (listening)
   ============================================================ */
export type ListeningTargetId =
  | 'sun'
  | 'flower'
  | 'basket'
  | 'turtle'
  | 'toucan'
  | 'monkey'
  | 'fruit'
  | 'leaf'
  | 'watering-can'

export interface ListeningRoundData {
  targetId: ListeningTargetId
  targetName: string
  spokenPrompt: string
  visualHint: string
  options: ListeningTargetId[]
}

export function generateListeningRound(
  matchId: string,
  roundIndex: number,
  difficulty: DifficultyLevel,
  contentVersion: 1 | 2 = 2
): ListeningRoundData {
  if (contentVersion === 1) {
    const v1Rounds: ListeningRoundData[] = [
      {
        targetId: 'sun',
        targetName: 'El Sol',
        spokenPrompt: 'Encuentra el sol brillante',
        visualHint: 'Es redondo y da luz dorada',
        options: ['sun', 'toucan', 'fruit'],
      },
      {
        targetId: 'toucan',
        targetName: 'El Tucán',
        spokenPrompt: '¿Dónde está el tucancito alegre?',
        visualHint: 'Tiene un pico colorido',
        options: ['sun', 'toucan', 'fruit'],
      },
      {
        targetId: 'fruit',
        targetName: 'La Fruta',
        spokenPrompt: 'Busca la fruta dulce del árbol',
        visualHint: 'Es deliciosa para comer',
        options: ['sun', 'toucan', 'fruit'],
      },
    ]
    return v1Rounds[Math.min(2, Math.max(0, roundIndex))]
  }

  const rand = createSeededRandom(`listening_${matchId}_${roundIndex}_${difficulty}`)

  const targetsPool: {
    targetId: ListeningTargetId
    targetName: string
    spokenPrompt: string
    visualHint: string
  }[] = [
    { targetId: 'sun', targetName: 'El Sol', spokenPrompt: 'Encuentra el sol brillante', visualHint: 'Es redondo y da luz dorada' },
    { targetId: 'toucan', targetName: 'El Tucán', spokenPrompt: '¿Dónde está el tucancito alegre?', visualHint: 'Tiene un pico colorido' },
    { targetId: 'fruit', targetName: 'La Fruta', spokenPrompt: 'Busca la fruta dulce del árbol', visualHint: 'Es deliciosa para comer' },
    { targetId: 'flower', targetName: 'La Flor', spokenPrompt: 'Encuentra la flor hermosa', visualHint: 'Tiene pétalos rosados' },
    { targetId: 'monkey', targetName: 'El Monito', spokenPrompt: '¿Dónde está el monito juguetón?', visualHint: 'Tiene cola larga y orejas redondas' },
    { targetId: 'turtle', targetName: 'La Tortuga', spokenPrompt: 'Busca a la dulce tortuguita', visualHint: 'Lleva un caparazón verde' },
  ]

  const offset = Math.floor(rand() * targetsPool.length)
  const chosenIndex = (offset + roundIndex) % targetsPool.length
  const chosen = targetsPool[chosenIndex]
  const allIds: ListeningTargetId[] = ['sun', 'flower', 'basket', 'turtle', 'toucan', 'monkey', 'fruit', 'leaf', 'watering-can']
  const distractors = allIds.filter((id) => id !== chosen.targetId)

  // Mezcla de distractores
  for (let i = distractors.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const temp = distractors[i]
    distractors[i] = distractors[j]
    distractors[j] = temp
  }

  const count = difficulty === 'initial' ? 2 : difficulty === 'medium' ? 3 : 4
  const options = [chosen.targetId, ...distractors.slice(0, count - 1)]

  // Mezcla de opciones
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const temp = options[i]
    options[i] = options[j]
    options[j] = temp
  }

  return {
    targetId: chosen.targetId,
    targetName: chosen.targetName,
    spokenPrompt: chosen.spokenPrompt,
    visualHint: chosen.visualHint,
    options,
  }
}

/* ============================================================
   J6: Cuentos en orden (stories)
   ============================================================ */
export interface StoryCard {
  id: string
  stepNumber: number // 1..N orden cronológico
  title: string
  description: string
  illustrationKey: string
}

export interface StoriesRoundData {
  storyTitle: string
  cards: StoryCard[]
  promptText: string
}

export function generateStoriesRound(
  matchId: string,
  roundIndex: number,
  difficulty: DifficultyLevel
): StoriesRoundData {
  const rand = createSeededRandom(`stories_${matchId}_${roundIndex}_${difficulty}`)

  // Historias preescolares con causalidad clara
  const storyThemes = [
    {
      title: 'El nacimiento del pajarito',
      allCards: [
        { id: 'c1', stepNumber: 1, title: 'El nido', description: 'Mamá cuida el huevito en el nido', illustrationKey: 'egg-nest' },
        { id: 'c2', stepNumber: 2, title: 'El cascarón', description: 'El cascarón se abre y asoma el polluelo', illustrationKey: 'hatched-chick' },
        { id: 'c3', stepNumber: 3, title: 'Vuelo a la rama', description: 'El tucancito vuela hasta la rama con fruta', illustrationKey: 'flying-bird' },
        { id: 'c4', stepNumber: 4, title: 'Come fruta', description: 'Disfruta y come la fruta madura en la rama', illustrationKey: 'eating-bird' },
      ],
    },
    {
      title: 'El ciclo de la flor',
      allCards: [
        { id: 'c1', stepNumber: 1, title: 'La semilla', description: 'Se coloca la semilla en la tierra fértil', illustrationKey: 'seed-ground' },
        { id: 'c2', stepNumber: 2, title: 'El brote', description: 'Con agüita nace un brote verde', illustrationKey: 'green-sprout' },
        { id: 'c3', stepNumber: 3, title: 'La flor', description: 'El sol abre sus hermosos pétalos', illustrationKey: 'bloomed-flower' },
        { id: 'c4', stepNumber: 4, title: 'La mariposa', description: 'Una mariposa viene a visitarla', illustrationKey: 'butterfly-flower' },
      ],
    },
    {
      title: 'El día del monito',
      allCards: [
        { id: 'c1', stepNumber: 1, title: 'Despertar', description: 'El monito despierta con el sol matutino', illustrationKey: 'waking-monkey' },
        { id: 'c2', stepNumber: 2, title: 'Trepar', description: 'El monito trepa para alcanzar los plátanos', illustrationKey: 'climbing-monkey' },
        { id: 'c3', stepNumber: 3, title: 'Compartir', description: 'Cosecha plátanos y los comparte con sus amigos', illustrationKey: 'eating-monkey' },
        { id: 'c4', stepNumber: 4, title: 'Dormir', description: 'Descansa bajo la luna y las estrellas', illustrationKey: 'sleeping-monkey' },
      ],
    },
  ]

  const story = storyThemes[roundIndex % storyThemes.length]
  const cardCount = difficulty === 'initial' ? 2 : difficulty === 'medium' ? 3 : 4
  const selectedCards = story.allCards.slice(0, cardCount)

  // Barajar las tarjetas para que el niño las ordene
  const shuffled = [...selectedCards]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const temp = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = temp
  }

  return {
    storyTitle: story.title,
    cards: shuffled,
    promptText: `Ordena los pasos de la historia: "${story.title}"`,
  }
}

/* ============================================================
   J7: Sombras y formas (shadows)
   ============================================================ */
export type ShadowShapeId = 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'toucan-shape' | 'turtle-shape' | 'leaf-shape'

export interface ShapeItem {
  id: ShadowShapeId
  name: string
  color: string
}

export interface ShadowsRoundData {
  shapes: ShapeItem[]
  promptText: string
}

export function generateShadowsRound(
  matchId: string,
  roundIndex: number,
  difficulty: DifficultyLevel
): ShadowsRoundData {
  const rand = createSeededRandom(`shadows_${matchId}_${roundIndex}_${difficulty}`)

  const allShapes: ShapeItem[] = [
    { id: 'circle', name: 'Círculo', color: '#FFD166' },
    { id: 'square', name: 'Cuadrado', color: '#4CC9F0' },
    { id: 'triangle', name: 'Triángulo', color: '#FF5964' },
    { id: 'star', name: 'Estrella', color: '#FFA500' },
    { id: 'heart', name: 'Corazón', color: '#FF70A6' },
    { id: 'leaf-shape', name: 'Hoja', color: '#6EC6A0' },
  ]

  const count = difficulty === 'initial' ? 2 : difficulty === 'medium' ? 3 : 4
  const offset = (roundIndex * 2) % allShapes.length
  const pool: ShapeItem[] = []
  for (let i = 0; i < allShapes.length; i++) {
    pool.push(allShapes[(offset + i) % allShapes.length])
  }

  // Mezclar
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const temp = pool[i]
    pool[i] = pool[j]
    pool[j] = temp
  }

  return {
    shapes: pool.slice(0, count),
    promptText: 'Encaja cada figura en su sombra correspondiente',
  }
}
