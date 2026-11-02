import type { AccessoryCategory, AccessoryId, GrowthStage, PetId } from './types'

/* ============================================================
   MUYU 4.0 — SISTEMA ANATÓMICO DE ANCLAJES Y COMPATIBILIDAD
   Sustituye los números mágicos manuales por anclajes proporcionales
   medidos sobre el sistema de coordenadas viewBox "0 0 200 200".
   ============================================================ */

export interface BodyBoundingBox {
  top: number
  bottom: number
  left: number
  right: number
}

export interface HeadAnchor {
  x: number // centro horizontal de la coronilla / tope
  y: number // altura superior de la cabeza
  width: number // ancho aparente de la cabeza
  tilt: number // inclinación de la cabeza en grados
}

export interface EyesAnchor {
  x: number // punto medio entre ambos ojos
  y: number // centro vertical ocular
  eyeSpan: number // distancia entre centros oculares
  tilt: number // inclinación de la línea de mirada en grados
}

export interface NeckAnchor {
  x: number // centro del cuello / base de garganta
  y: number // altura del cuello / pecho superior
  width: number // ancho del cuello / pecho
  tilt: number // inclinación del cuello
}

export interface BackAnchor {
  x: number // punto de suspensión de mochila o capa
  y: number // altura de suspensión en espalda
  tilt: number // ángulo de apoyo sobre el lomo / caparazón / torso
}

export interface PetAnatomyAnchor {
  bodyBox: BodyBoundingBox
  head: HeadAnchor
  eyes: EyesAnchor
  neck: NeckAnchor
  back: BackAnchor
}

export interface WearableTransform {
  x: number
  y: number
  scale: number
  rotation: number
}

/* ============================================================
   ESCALAS DE CRECIMIENTO POR ETAPA (Pies anclados en y = 184)
   bebé: 72% | pequeño: 81% | explorador: 91% | adulto: 100%
   ============================================================ */
export const STAGE_SCALES: Record<GrowthStage, number> = {
  baby: 0.72,
  sprout: 0.81,
  young: 0.91,
  adult: 1.0,
}

export const GROUND_Y = 184

export const getStageScaleTransform = (stage: GrowthStage = 'baby'): string => {
  const scale = STAGE_SCALES[stage] ?? 1.0
  if (scale === 1.0) return ''
  return `translate(100, ${GROUND_Y}) scale(${scale}) translate(-100, -${GROUND_Y})`
}

/* ============================================================
   MATRIZ DE 12 ANCLAJES ANATÓMICOS (3 especies x 4 etapas)
   Medidos a partir de los assets rasterizados actuales en 0..200
   ============================================================ */
export const PET_ANATOMY_ANCHORS: Record<PetId, Record<GrowthStage, PetAnatomyAnchor>> = {
  monkey: {
    baby: {
      bodyBox: { top: 24, bottom: 184, left: 21, right: 179 },
      head: { x: 99, y: 43, width: 70, tilt: 0 },
      eyes: { x: 99, y: 72, eyeSpan: 32, tilt: 0 },
      neck: { x: 99, y: 103, width: 50, tilt: 0 },
      back: { x: 74, y: 115, tilt: 6 },
    },
    sprout: {
      bodyBox: { top: 23, bottom: 184, left: 33, right: 167 },
      head: { x: 92, y: 45, width: 66, tilt: -4 },
      eyes: { x: 92, y: 72, eyeSpan: 30, tilt: -3 },
      neck: { x: 93, y: 101, width: 46, tilt: -2 },
      back: { x: 68, y: 113, tilt: 8 },
    },
    young: {
      bodyBox: { top: 23, bottom: 184, left: 23, right: 177 },
      head: { x: 109, y: 49, width: 66, tilt: 6 },
      eyes: { x: 108, y: 76, eyeSpan: 30, tilt: 5 },
      neck: { x: 106, y: 107, width: 48, tilt: 4 },
      back: { x: 72, y: 117, tilt: 10 },
    },
    adult: {
      bodyBox: { top: 23, bottom: 184, left: 54, right: 146 },
      head: { x: 87, y: 40, width: 63, tilt: -2 },
      eyes: { x: 88, y: 66, eyeSpan: 28, tilt: -2 },
      neck: { x: 88, y: 93, width: 44, tilt: 0 },
      back: { x: 64, y: 109, tilt: 6 },
    },
  },

  turtle: {
    baby: {
      bodyBox: { top: 37, bottom: 184, left: 21, right: 179 },
      head: { x: 111, y: 48, width: 56, tilt: 6 },
      eyes: { x: 112, y: 74, eyeSpan: 25, tilt: 6 },
      neck: { x: 104, y: 105, width: 45, tilt: 5 },
      back: { x: 68, y: 112, tilt: -12 },
    },
    sprout: {
      bodyBox: { top: 32, bottom: 184, left: 21, right: 179 },
      head: { x: 130, y: 42, width: 57, tilt: 8 },
      eyes: { x: 131, y: 68, eyeSpan: 26, tilt: 8 },
      neck: { x: 120, y: 99, width: 46, tilt: 7 },
      back: { x: 72, y: 106, tilt: -14 },
    },
    young: {
      bodyBox: { top: 58, bottom: 184, left: 21, right: 179 },
      head: { x: 129, y: 66, width: 56, tilt: 10 },
      eyes: { x: 129, y: 90, eyeSpan: 25, tilt: 8 },
      neck: { x: 118, y: 117, width: 46, tilt: 9 },
      back: { x: 64, y: 118, tilt: -16 },
    },
    adult: {
      bodyBox: { top: 40, bottom: 184, left: 21, right: 179 },
      head: { x: 147, y: 50, width: 59, tilt: 8 },
      eyes: { x: 148, y: 76, eyeSpan: 26, tilt: 8 },
      neck: { x: 136, y: 107, width: 48, tilt: 7 },
      back: { x: 74, y: 114, tilt: -14 },
    },
  },

  toucan: {
    baby: {
      bodyBox: { top: 23, bottom: 184, left: 30, right: 170 },
      head: { x: 93, y: 42, width: 59, tilt: -4 },
      eyes: { x: 84, y: 68, eyeSpan: 22, tilt: -4 },
      neck: { x: 96, y: 102, width: 47, tilt: 0 },
      back: { x: 62, y: 114, tilt: 8 },
    },
    sprout: {
      bodyBox: { top: 23, bottom: 184, left: 31, right: 169 },
      head: { x: 103, y: 40, width: 60, tilt: -2 },
      eyes: { x: 94, y: 66, eyeSpan: 23, tilt: -2 },
      neck: { x: 104, y: 100, width: 48, tilt: 0 },
      back: { x: 66, y: 112, tilt: 8 },
    },
    young: {
      bodyBox: { top: 42, bottom: 184, left: 21, right: 179 },
      head: { x: 112, y: 56, width: 61, tilt: -2 },
      eyes: { x: 104, y: 82, eyeSpan: 24, tilt: -2 },
      neck: { x: 112, y: 112, width: 49, tilt: 0 },
      back: { x: 64, y: 118, tilt: 10 },
    },
    adult: {
      bodyBox: { top: 23, bottom: 184, left: 30, right: 170 },
      head: { x: 109, y: 40, width: 63, tilt: -2 },
      eyes: { x: 100, y: 66, eyeSpan: 25, tilt: -2 },
      neck: { x: 108, y: 98, width: 50, tilt: 0 },
      back: { x: 60, y: 112, tilt: 8 },
    },
  },
}

/* ============================================================
   REGLAS DE PROYECCIÓN DE ACCESORIOS POR CATEGORÍA
   ============================================================ */
interface AccessoryRuleSpec {
  category: AccessoryCategory
  baseScale: number
  dy: number
  dRot: number
}

const ACCESSORY_RULES: Record<AccessoryId, AccessoryRuleSpec> = {
  // Cabeza
  orange_cap: { category: 'head', baseScale: 1.0, dy: 1, dRot: 0 },
  explorer_hat: { category: 'head', baseScale: 0.94, dy: -1, dRot: 0 },
  leaf_crown: { category: 'head', baseScale: 0.98, dy: 1, dRot: 0 },
  color_bow: { category: 'head', baseScale: 0.96, dy: -3, dRot: 10 },

  // Rostro
  round_glasses: { category: 'face', baseScale: 1.0, dy: 0, dRot: 0 },
  star_glasses: { category: 'face', baseScale: 1.0, dy: 0, dRot: 0 },

  // Cuello
  explorer_scarf: { category: 'neck', baseScale: 0.98, dy: 1, dRot: 0 },
  gold_medal: { category: 'neck', baseScale: 0.92, dy: -1, dRot: 0 },
  flower_necklace: { category: 'neck', baseScale: 0.96, dy: 1, dRot: 0 },

  // Espalda
  small_backpack: { category: 'back', baseScale: 0.88, dy: 1, dRot: 0 },
  explorer_backpack: { category: 'back', baseScale: 0.86, dy: -1, dRot: 0 },
  short_cape: { category: 'back', baseScale: 1.0, dy: 11, dRot: 0 },
}

/**
 * Micro-ajustes justificados para singularidades anatómicas extremas:
 * 1. color_bow en mono: colocado en la oreja derecha en vez del centro de coronilla.
 * 2. color_bow en tucán: colocado hacia la nuca para equilibrar la cresta.
 * 3. short_cape en tortuga: centrada sobre el caparazón en vez de garganta.
 */
interface MicroAdjustment {
  dx?: number
  dy?: number
  dScale?: number
  dRot?: number
}

const MICRO_ADJUSTMENTS: Partial<
  Record<AccessoryId, Partial<Record<PetId, MicroAdjustment>>>
> = {
  color_bow: {
    monkey: { dx: 22, dy: -6, dRot: 12 },
    toucan: { dx: -15, dy: -4, dRot: -8 },
  },
  short_cape: {
    turtle: { dx: -24, dy: 9, dRot: -14 },
    toucan: { dx: -14, dy: 15, dRot: 4 },
  },
}

/**
 * Calcula dinámicamente la transformación precisa (x, y, escala, rotación)
 * basándose en los anclajes anatómicos de la mascota y la regla del accesorio.
 * Elimina las 144 entradas hardcodeadas del código previo.
 */
export function calculateWearableTransform(
  accessoryId: AccessoryId,
  petId: PetId,
  stage: GrowthStage
): WearableTransform {
  const anchor = PET_ANATOMY_ANCHORS[petId][stage]
  const rule = ACCESSORY_RULES[accessoryId]
  const micro = MICRO_ADJUSTMENTS[accessoryId]?.[petId] ?? {}

  let x = 100
  let y = 100
  let scale = 1.0
  let rotation = 0

  switch (rule.category) {
    case 'head': {
      const headScaleRatio = anchor.head.width / 70
      scale = headScaleRatio * rule.baseScale
      x = anchor.head.x + (micro.dx ?? 0)
      y = anchor.head.y + rule.dy + (micro.dy ?? 0)
      rotation = anchor.head.tilt + rule.dRot + (micro.dRot ?? 0)
      break
    }
    case 'face': {
      const headScaleRatio = anchor.head.width / 70
      scale = headScaleRatio * rule.baseScale
      x = anchor.eyes.x + (micro.dx ?? 0)
      y = anchor.eyes.y + rule.dy + (micro.dy ?? 0)
      rotation = anchor.eyes.tilt + rule.dRot + (micro.dRot ?? 0)
      break
    }
    case 'neck': {
      const neckScaleRatio = anchor.neck.width / 48
      scale = neckScaleRatio * rule.baseScale
      x = anchor.neck.x + (micro.dx ?? 0)
      y = anchor.neck.y + rule.dy + (micro.dy ?? 0)
      rotation = anchor.neck.tilt + rule.dRot + (micro.dRot ?? 0)
      break
    }
    case 'back': {
      const bodyScaleRatio = anchor.neck.width / 48
      scale = bodyScaleRatio * rule.baseScale
      if (accessoryId === 'short_cape') {
        x = anchor.neck.x + (micro.dx ?? 0)
        y = anchor.neck.y + rule.dy + (micro.dy ?? 0)
        rotation = anchor.neck.tilt + rule.dRot + (micro.dRot ?? 0)
      } else {
        x = anchor.back.x + (micro.dx ?? 0)
        y = anchor.back.y + rule.dy + (micro.dy ?? 0)
        rotation = anchor.back.tilt + rule.dRot + (micro.dRot ?? 0)
      }
      break
    }
  }

  if (micro.dScale) {
    scale += micro.dScale
  }

  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
    scale: Math.round(scale * 100) / 100,
    rotation: Math.round(rotation * 10) / 10,
  }
}

/* ============================================================
   DECLARACIÓN DE COMPATIBILIDAD BIOLÓGICA Y ANATÓMICA
   Define claramente qué accesorios encajan en cada especie.
   Si una especie no es compatible, la Tienda bloquea la compra
   y no se renderiza en la mascota (preservando el dato en savegame).
   ============================================================ */

export interface CompatibilityResult {
  compatible: boolean
  reason?: string
}

export const ACCESSORY_COMPATIBILITY: Record<
  AccessoryId,
  {
    compatiblePets: PetId[]
    reasons?: Partial<Record<PetId, string>>
  }
> = {
  // CABEZA (Universales: 100% compatibles)
  orange_cap: {
    compatiblePets: ['monkey', 'turtle', 'toucan'],
  },
  explorer_hat: {
    compatiblePets: ['monkey', 'turtle', 'toucan'],
  },
  leaf_crown: {
    compatiblePets: ['monkey', 'turtle', 'toucan'],
  },
  color_bow: {
    compatiblePets: ['monkey', 'turtle', 'toucan'],
  },

  // ROSTRO (Compatibilidad anatómica: lentes redondos usan variante monóculo en tucán)
  round_glasses: {
    compatiblePets: ['monkey', 'turtle', 'toucan'],
  },
  star_glasses: {
    compatiblePets: ['monkey'],
    reasons: {
      turtle: 'No disponible: marco rígido frontal incompatible con la visión lateral a 3/4 de Tortuguita',
      toucan: 'No disponible: marco rígido frontal colisiona y atraviesa el volumen del pico de Tucancito',
    },
  },

  // CUELLO / PECHO (Universales: 100% compatibles)
  explorer_scarf: {
    compatiblePets: ['monkey', 'turtle', 'toucan'],
  },
  gold_medal: {
    compatiblePets: ['monkey', 'turtle', 'toucan'],
  },
  flower_necklace: {
    compatiblePets: ['monkey', 'turtle', 'toucan'],
  },

  // ESPALDA / CUERPO (Universales: adaptadas al caparazón de tortuga y hombro alar de tucán)
  small_backpack: {
    compatiblePets: ['monkey', 'turtle', 'toucan'],
  },
  explorer_backpack: {
    compatiblePets: ['monkey', 'turtle', 'toucan'],
  },
  short_cape: {
    compatiblePets: ['monkey', 'turtle', 'toucan'],
  },
}

/**
 * Verifica si un accesorio es anatómicamente compatible con una mascota.
 */
export function isAccessoryCompatible(
  accessoryId: AccessoryId,
  petId: PetId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _stage?: GrowthStage
): CompatibilityResult {
  const def = ACCESSORY_COMPATIBILITY[accessoryId]
  if (!def) {
    return { compatible: false, reason: 'Accesorio desconocido' }
  }

  if (def.compatiblePets.includes(petId)) {
    return { compatible: true }
  }

  const reason =
    def.reasons?.[petId] ??
    `No disponible: no se adapta a la anatomía de esta mascota`

  return { compatible: false, reason }
}

