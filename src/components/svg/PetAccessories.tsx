import type { SVGProps } from 'react'
import type { AccessoryId, GrowthStage, PetId } from '../../game/types'

export interface AccessoryLayerProps extends SVGProps<SVGSVGElement> {
  accessoryId: AccessoryId
  petId: PetId
  stage: GrowthStage
  size?: number | string
  className?: string
}

/* ============================================================
   TRANSFORMACIONES Y ANCLAJES ANATÓMICOS EXACTOS
   Sistema de composición vestibular por especie y etapa.
   Coordenadas en el sistema viewBox "0 0 200 200"
   ============================================================ */

export interface WearableTransform {
  x: number
  y: number
  scale: number
  rotation?: number
}

/**
 * Matriz Anatómica Específica por Accesorio, Especie y Etapa Evolutiva.
 * En lugar de agrupar todos los accesorios de cabeza o rostro con el mismo offset,
 * cada pieza tiene afinamiento exacto sobre la anatomía de la mascota.
 */
const WEARABLE_CONFIG: Record<
  AccessoryId,
  Record<PetId, Record<GrowthStage, WearableTransform>>
> = {
  // ==========================================
  // CABEZA (head)
  // ==========================================
  orange_cap: {
    monkey: {
      baby: { x: 99, y: 44, scale: 0.98, rotation: 0 },
      sprout: { x: 92, y: 46, scale: 0.92, rotation: -4 },
      young: { x: 109, y: 50, scale: 0.92, rotation: 6 },
      adult: { x: 87, y: 40, scale: 0.88, rotation: -2 },
    },
    turtle: {
      baby: { x: 111, y: 48, scale: 0.78, rotation: 6 },
      sprout: { x: 130, y: 42, scale: 0.80, rotation: 8 },
      young: { x: 129, y: 66, scale: 0.78, rotation: 10 },
      adult: { x: 147, y: 50, scale: 0.82, rotation: 8 },
    },
    toucan: {
      baby: { x: 92, y: 42, scale: 0.82, rotation: -4 },
      sprout: { x: 102, y: 40, scale: 0.84, rotation: -2 },
      young: { x: 112, y: 56, scale: 0.85, rotation: -2 },
      adult: { x: 108, y: 40, scale: 0.88, rotation: -2 },
    },
  },

  explorer_hat: {
    monkey: {
      baby: { x: 99, y: 42, scale: 0.92, rotation: 0 },
      sprout: { x: 92, y: 44, scale: 0.88, rotation: -4 },
      young: { x: 109, y: 48, scale: 0.88, rotation: 6 },
      adult: { x: 87, y: 38, scale: 0.84, rotation: -2 },
    },
    turtle: {
      baby: { x: 111, y: 46, scale: 0.74, rotation: 6 },
      sprout: { x: 130, y: 40, scale: 0.76, rotation: 8 },
      young: { x: 129, y: 64, scale: 0.74, rotation: 10 },
      adult: { x: 147, y: 48, scale: 0.78, rotation: 8 },
    },
    toucan: {
      baby: { x: 92, y: 40, scale: 0.76, rotation: -4 },
      sprout: { x: 102, y: 38, scale: 0.78, rotation: -2 },
      young: { x: 112, y: 54, scale: 0.80, rotation: -2 },
      adult: { x: 108, y: 38, scale: 0.82, rotation: -2 },
    },
  },

  leaf_crown: {
    monkey: {
      baby: { x: 99, y: 44, scale: 0.96, rotation: 0 },
      sprout: { x: 92, y: 46, scale: 0.90, rotation: -4 },
      young: { x: 109, y: 50, scale: 0.92, rotation: 6 },
      adult: { x: 87, y: 42, scale: 0.86, rotation: -2 },
    },
    turtle: {
      baby: { x: 111, y: 50, scale: 0.78, rotation: 6 },
      sprout: { x: 130, y: 44, scale: 0.80, rotation: 8 },
      young: { x: 129, y: 68, scale: 0.78, rotation: 10 },
      adult: { x: 147, y: 52, scale: 0.82, rotation: 8 },
    },
    toucan: {
      baby: { x: 94, y: 44, scale: 0.82, rotation: -4 },
      sprout: { x: 104, y: 42, scale: 0.84, rotation: -2 },
      young: { x: 113, y: 58, scale: 0.86, rotation: -2 },
      adult: { x: 110, y: 42, scale: 0.88, rotation: -2 },
    },
  },

  color_bow: {
    monkey: {
      // En la oreja/copete del monito
      baby: { x: 124, y: 46, scale: 0.88, rotation: 15 },
      sprout: { x: 116, y: 48, scale: 0.84, rotation: 12 },
      young: { x: 130, y: 54, scale: 0.85, rotation: 18 },
      adult: { x: 108, y: 44, scale: 0.82, rotation: 14 },
    },
    turtle: {
      baby: { x: 128, y: 48, scale: 0.75, rotation: 20 },
      sprout: { x: 146, y: 42, scale: 0.76, rotation: 22 },
      young: { x: 144, y: 64, scale: 0.75, rotation: 25 },
      adult: { x: 162, y: 48, scale: 0.78, rotation: 22 },
    },
    toucan: {
      baby: { x: 82, y: 44, scale: 0.80, rotation: -12 },
      sprout: { x: 92, y: 40, scale: 0.82, rotation: -10 },
      young: { x: 102, y: 54, scale: 0.84, rotation: -8 },
      adult: { x: 98, y: 40, scale: 0.85, rotation: -10 },
    },
  },

  // ==========================================
  // ROSTRO (face: Lentes adaptados a la especie)
  // ==========================================
  round_glasses: {
    monkey: {
      baby: { x: 99, y: 73, scale: 0.90, rotation: 0 },
      sprout: { x: 92, y: 72, scale: 0.85, rotation: -4 },
      young: { x: 109, y: 75, scale: 0.85, rotation: 6 },
      adult: { x: 87, y: 64, scale: 0.80, rotation: -2 },
    },
    turtle: {
      baby: { x: 116, y: 72, scale: 0.72, rotation: 8 },
      sprout: { x: 134, y: 66, scale: 0.74, rotation: 10 },
      young: { x: 133, y: 88, scale: 0.72, rotation: 12 },
      adult: { x: 151, y: 72, scale: 0.76, rotation: 10 },
    },
    toucan: {
      // En tucán, el monóculo se asienta sobre el ojo y su borde posterior sin tapar el pico
      baby: { x: 84, y: 62, scale: 0.74, rotation: -4 },
      sprout: { x: 94, y: 60, scale: 0.76, rotation: -2 },
      young: { x: 104, y: 76, scale: 0.78, rotation: -2 },
      adult: { x: 100, y: 60, scale: 0.80, rotation: -2 },
    },
  },

  star_glasses: {
    monkey: {
      baby: { x: 99, y: 73, scale: 0.88, rotation: 0 },
      sprout: { x: 92, y: 72, scale: 0.84, rotation: -4 },
      young: { x: 109, y: 75, scale: 0.84, rotation: 6 },
      adult: { x: 87, y: 64, scale: 0.78, rotation: -2 },
    },
    turtle: {
      baby: { x: 116, y: 72, scale: 0.70, rotation: 8 },
      sprout: { x: 134, y: 66, scale: 0.72, rotation: 10 },
      young: { x: 133, y: 88, scale: 0.70, rotation: 12 },
      adult: { x: 151, y: 72, scale: 0.74, rotation: 10 },
    },
    toucan: {
      baby: { x: 84, y: 62, scale: 0.73, rotation: -4 },
      sprout: { x: 94, y: 60, scale: 0.75, rotation: -2 },
      young: { x: 104, y: 76, scale: 0.76, rotation: -2 },
      adult: { x: 100, y: 60, scale: 0.78, rotation: -2 },
    },
  },

  // ==========================================
  // CUELLO / PECHO (neck)
  // ==========================================
  explorer_scarf: {
    monkey: {
      baby: { x: 99, y: 106, scale: 0.90, rotation: 0 },
      sprout: { x: 93, y: 104, scale: 0.86, rotation: -2 },
      young: { x: 106, y: 110, scale: 0.90, rotation: 4 },
      adult: { x: 88, y: 96, scale: 0.86, rotation: 0 },
    },
    turtle: {
      baby: { x: 104, y: 108, scale: 0.78, rotation: 6 },
      sprout: { x: 120, y: 102, scale: 0.80, rotation: 8 },
      young: { x: 118, y: 120, scale: 0.80, rotation: 10 },
      adult: { x: 136, y: 110, scale: 0.85, rotation: 8 },
    },
    toucan: {
      baby: { x: 96, y: 104, scale: 0.82, rotation: 0 },
      sprout: { x: 104, y: 102, scale: 0.85, rotation: 0 },
      young: { x: 112, y: 114, scale: 0.86, rotation: 0 },
      adult: { x: 108, y: 100, scale: 0.90, rotation: 0 },
    },
  },

  gold_medal: {
    monkey: {
      baby: { x: 99, y: 102, scale: 0.88, rotation: 0 },
      sprout: { x: 93, y: 100, scale: 0.84, rotation: -2 },
      young: { x: 106, y: 106, scale: 0.88, rotation: 4 },
      adult: { x: 88, y: 92, scale: 0.84, rotation: 0 },
    },
    turtle: {
      baby: { x: 104, y: 104, scale: 0.76, rotation: 4 },
      sprout: { x: 120, y: 98, scale: 0.78, rotation: 6 },
      young: { x: 118, y: 116, scale: 0.78, rotation: 8 },
      adult: { x: 136, y: 106, scale: 0.82, rotation: 6 },
    },
    toucan: {
      baby: { x: 96, y: 102, scale: 0.80, rotation: 0 },
      sprout: { x: 104, y: 100, scale: 0.82, rotation: 0 },
      young: { x: 112, y: 112, scale: 0.84, rotation: 0 },
      adult: { x: 108, y: 98, scale: 0.88, rotation: 0 },
    },
  },

  flower_necklace: {
    monkey: {
      baby: { x: 99, y: 104, scale: 0.92, rotation: 0 },
      sprout: { x: 93, y: 102, scale: 0.88, rotation: -2 },
      young: { x: 106, y: 108, scale: 0.92, rotation: 4 },
      adult: { x: 88, y: 94, scale: 0.88, rotation: 0 },
    },
    turtle: {
      baby: { x: 104, y: 106, scale: 0.78, rotation: 6 },
      sprout: { x: 120, y: 100, scale: 0.80, rotation: 8 },
      young: { x: 118, y: 118, scale: 0.80, rotation: 10 },
      adult: { x: 136, y: 108, scale: 0.84, rotation: 8 },
    },
    toucan: {
      baby: { x: 96, y: 102, scale: 0.84, rotation: 0 },
      sprout: { x: 104, y: 100, scale: 0.86, rotation: 0 },
      young: { x: 112, y: 112, scale: 0.88, rotation: 0 },
      adult: { x: 108, y: 98, scale: 0.92, rotation: 0 },
    },
  },

  // ==========================================
  // ESPALDA / CUERPO (back: Ubicadas con perspectiva)
  // ==========================================
  small_backpack: {
    monkey: {
      baby: { x: 74, y: 116, scale: 0.86, rotation: 6 },
      sprout: { x: 68, y: 114, scale: 0.84, rotation: 8 },
      young: { x: 72, y: 118, scale: 0.88, rotation: 10 },
      adult: { x: 64, y: 110, scale: 0.85, rotation: 6 },
    },
    turtle: {
      // En tortuga, la mochila reposa sobre el caparazón posterior
      baby: { x: 68, y: 112, scale: 0.80, rotation: -12 },
      sprout: { x: 72, y: 106, scale: 0.84, rotation: -14 },
      young: { x: 64, y: 118, scale: 0.84, rotation: -16 },
      adult: { x: 74, y: 114, scale: 0.95, rotation: -14 },
    },
    toucan: {
      // En tucán, la mochila asoma tras el ala/lomo izquierdo
      baby: { x: 62, y: 116, scale: 0.80, rotation: 8 },
      sprout: { x: 66, y: 114, scale: 0.84, rotation: 8 },
      young: { x: 64, y: 120, scale: 0.86, rotation: 10 },
      adult: { x: 60, y: 114, scale: 0.90, rotation: 8 },
    },
  },

  explorer_backpack: {
    monkey: {
      baby: { x: 74, y: 114, scale: 0.84, rotation: 6 },
      sprout: { x: 68, y: 112, scale: 0.82, rotation: 8 },
      young: { x: 72, y: 116, scale: 0.86, rotation: 10 },
      adult: { x: 64, y: 108, scale: 0.84, rotation: 6 },
    },
    turtle: {
      baby: { x: 68, y: 110, scale: 0.78, rotation: -12 },
      sprout: { x: 72, y: 104, scale: 0.82, rotation: -14 },
      young: { x: 64, y: 116, scale: 0.82, rotation: -16 },
      adult: { x: 74, y: 112, scale: 0.92, rotation: -14 },
    },
    toucan: {
      baby: { x: 62, y: 114, scale: 0.78, rotation: 8 },
      sprout: { x: 66, y: 112, scale: 0.82, rotation: 8 },
      young: { x: 64, y: 118, scale: 0.84, rotation: 10 },
      adult: { x: 60, y: 112, scale: 0.88, rotation: 8 },
    },
  },

  short_cape: {
    monkey: {
      baby: { x: 99, y: 116, scale: 0.95, rotation: 0 },
      sprout: { x: 93, y: 114, scale: 0.92, rotation: -2 },
      young: { x: 102, y: 120, scale: 0.96, rotation: 4 },
      adult: { x: 88, y: 110, scale: 0.92, rotation: 0 },
    },
    turtle: {
      baby: { x: 80, y: 114, scale: 0.85, rotation: -8 },
      sprout: { x: 88, y: 108, scale: 0.88, rotation: -10 },
      young: { x: 82, y: 120, scale: 0.88, rotation: -12 },
      adult: { x: 94, y: 116, scale: 0.98, rotation: -10 },
    },
    toucan: {
      baby: { x: 84, y: 118, scale: 0.86, rotation: 4 },
      sprout: { x: 88, y: 116, scale: 0.90, rotation: 4 },
      young: { x: 90, y: 122, scale: 0.94, rotation: 6 },
      adult: { x: 86, y: 116, scale: 0.98, rotation: 4 },
    },
  },
}

/* ============================================================
   ILUSTRACIONES VECTORIALES NATIVAS (12 ACCESORIOS CANÓNICOS)
   Con soporte para variantes anatómicas por especie:
   - monkey: Frontal / curvatura facial
   - turtle: 3/4 redondeado / perspectiva ocular derecha
   - toucan: Monóculo / perfil con respeto estricto al pico
   ============================================================ */

export interface AccessoryGraphicProps {
  accessoryId: AccessoryId
  petId?: PetId
}

export const AccessoryGraphic = ({
  accessoryId,
  petId = 'monkey',
}: AccessoryGraphicProps) => {
  switch (accessoryId) {
    // ----------------------------------------------------
    // CABEZA
    // ----------------------------------------------------
    case 'orange_cap':
      return (
        <g id="acc-orange_cap" className="wearable-part">
          {/* Corona de la gorra con volumen e iluminación superior */}
          <path
            d="M-26 2C-26 -19 26 -19 26 2Z"
            fill="url(#cap-orange-grad)"
            stroke="#D95F00"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Brillo superior curvo */}
          <path
            d="M-18 -8C-12 -16 12 -16 18 -8"
            stroke="#FFAE66"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Botón superior esférico con sombra */}
          <circle cx="0" cy="-18" r="3.5" fill="#FFE066" stroke="#D95F00" strokeWidth="1.5" />
          <circle cx="-1" cy="-19" r="1.2" fill="#FFF" />
          {/* Visera curva deportiva con grosor y perspectiva */}
          <path
            d="M-28 2C-15 8 18 8 32 -1C30 5 15 10 -24 5Z"
            fill="#E66A00"
            stroke="#B34B00"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Borde inferior de la visera (sombra propia) */}
          <path
            d="M-25 4C-12 9 16 9 30 1"
            stroke="#993D00"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Gradiente interno para volumen */}
          <defs>
            <linearGradient id="cap-orange-grad" x1="0" y1="-19" x2="0" y2="2" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFA14D" />
              <stop offset="70%" stopColor="#FF7A00" />
              <stop offset="100%" stopColor="#E65C00" />
            </linearGradient>
          </defs>
        </g>
      )

    case 'explorer_hat':
      return (
        <g id="acc-explorer_hat" className="wearable-part">
          {/* Ala ancha inferior sombreada */}
          <ellipse cx="0" cy="5" rx="39" ry="11" fill="#B38054" />
          {/* Ala ancha superior del sombrero */}
          <ellipse cx="0" cy="3" rx="38" ry="10" fill="#D4A373" stroke="#8C5C36" strokeWidth="2.8" />
          {/* Copa del sombrero con volumen cónico */}
          <path
            d="M-22 3C-20 -19 20 -19 22 3Z"
            fill="#E2B78A"
            stroke="#8C5C36"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          {/* Hendidura superior de safari */}
          <path d="M-8 -15C-2 -12 2 -12 8 -15" stroke="#8C5C36" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Cinta verde de expedición */}
          <path
            d="M-22 0C-10 3 10 3 22 0V3C10 6 -10 6 -22 3Z"
            fill="#489B6E"
            stroke="#2A6F48"
            strokeWidth="1.5"
          />
          {/* Hebilla dorada miniatura de la cinta */}
          <rect x="-3" y="0.5" width="6" height="3" rx="1" fill="#FFD166" stroke="#8C5C36" strokeWidth="1" />
        </g>
      )

    case 'leaf_crown':
      return (
        <g id="acc-leaf_crown" className="wearable-part">
          {/* Tallo arqueado base */}
          <path
            d="M-28 2C-10 6 10 6 28 2"
            stroke="#40804D"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Hojas laterales izquierda */}
          <path
            d="M-22 2C-30 -8 -22 -16 -17 -2C-13 -16 -5 -10 -9 2"
            fill="#74C69D"
            stroke="#2D6A4F"
            strokeWidth="2"
          />
          {/* Hoja central dorada y esmeralda */}
          <path
            d="M0 -2C-7 -19 0 -25 7 -2C13 -25 20 -17 11 2"
            fill="#FFD166"
            stroke="#D48B00"
            strokeWidth="2"
          />
          {/* Hojas laterales derecha */}
          <path
            d="M17 2C13 -10 21 -16 25 -2C29 -12 35 -6 29 4"
            fill="#95D5B2"
            stroke="#2D6A4F"
            strokeWidth="2"
          />
          {/* Brote joya de rubí amazónico */}
          <circle cx="0" cy="-4" r="3.2" fill="#E63946" stroke="#9B2226" strokeWidth="1.2" />
          <circle cx="-1" cy="-5" r="1" fill="#FFF" />
        </g>
      )

    case 'color_bow':
      return (
        <g id="acc-color_bow" className="wearable-part">
          {/* Ala izquierda con pliegue */}
          <polygon
            points="-2 -2 -24 -15 -21 11"
            fill="#FF5D8F"
            stroke="#C9184A"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <polygon points="-2 -2 -17 -9 -15 7" fill="#FF85A1" />
          {/* Ala derecha con pliegue */}
          <polygon
            points="2 -2 24 -15 21 11"
            fill="#FF5D8F"
            stroke="#C9184A"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <polygon points="2 -2 17 -9 15 7" fill="#FF85A1" />
          {/* Cintas doradas colgantes festivas */}
          <path
            d="M-5 4L-13 19L-7 17L-2 6"
            fill="#FFD166"
            stroke="#D48B00"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M5 4L13 19L7 17L2 6"
            fill="#FFD166"
            stroke="#D48B00"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Nudo central esférico */}
          <circle cx="0" cy="-1" r="5" fill="#FFE66D" stroke="#D48B00" strokeWidth="2" />
          <circle cx="-1.5" cy="-2.5" r="1.5" fill="#FFF" />
        </g>
      )

    // ----------------------------------------------------
    // ROSTRO (Lentes con variantes anatómicas por especie)
    // ----------------------------------------------------
    case 'round_glasses': {
      // VARIANTE TUCANCITO: Monóculo académico elegante sobre el ojo visible sin invadir el pico
      if (petId === 'toucan') {
        return (
          <g id="acc-round_glasses-toucan" className="wearable-part glasses-variant-toucan">
            {/* Lente circular único con cristal translúcido */}
            <circle
              cx="0"
              cy="0"
              r="15"
              fill="#A8DADC"
              fillOpacity="0.32"
              stroke="#E09F3E"
              strokeWidth="3.2"
            />
            {/* Catchlight curvo de cristal */}
            <path d="M-9 -6C-5 -11 3 -11 7 -7" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            {/* Marco interior sutil */}
            <circle cx="0" cy="0" r="12" stroke="#FFF" strokeWidth="1" strokeOpacity="0.4" fill="none" />
            {/* Cadena dorada colgante de monóculo hacia atrás de la pluma */}
            <path
              d="M-15 0C-24 6 -26 22 -18 28"
              stroke="#D48B00"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="3 2"
              fill="none"
            />
          </g>
        )
      }

      // VARIANTE TORTUGUITA: Gafas adaptadas a perspectiva 3/4 (ojo derecho dominante, izquierdo comprimido)
      if (petId === 'turtle') {
        return (
          <g id="acc-round_glasses-turtle" className="wearable-part glasses-variant-turtle">
            {/* Ojo izquierdo en perspectiva lejana */}
            <ellipse
              cx="-16"
              cy="1"
              rx="9"
              ry="11"
              fill="#A8DADC"
              fillOpacity="0.30"
              stroke="#E09F3E"
              strokeWidth="3.0"
            />
            <path d="M-20 -3C-18 -7 -14 -7 -12 -5" stroke="#FFF" strokeWidth="1.6" strokeLinecap="round" fill="none" />

            {/* Ojo derecho en primer plano */}
            <circle
              cx="11"
              cy="-1"
              r="14"
              fill="#A8DADC"
              fillOpacity="0.32"
              stroke="#E09F3E"
              strokeWidth="3.2"
            />
            <path d="M5 -5C8 -9 14 -9 17 -6" stroke="#FFFFFF" strokeWidth="2.0" strokeLinecap="round" fill="none" />

            {/* Puente anatómico curvo */}
            <path d="M-7 0C-4 -3 0 -3 2 0" stroke="#E09F3E" strokeWidth="3" strokeLinecap="round" fill="none" />

            {/* Patilla hacia la cabeza de la tortuga */}
            <path d="M-25 1H-30" stroke="#E09F3E" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        )
      }

      // VARIANTE MONITO (Default): Frontal curvada simétrica que respeta la línea de ojos y cejas
      return (
        <g id="acc-round_glasses-monkey" className="wearable-part glasses-variant-monkey">
          {/* Marco izquierdo */}
          <circle
            cx="-15"
            cy="0"
            r="13"
            fill="#A8DADC"
            fillOpacity="0.30"
            stroke="#E09F3E"
            strokeWidth="3.2"
          />
          {/* Reflejo izquierdo */}
          <path d="M-21 -4C-18 -8 -13 -8 -11 -6" stroke="#FFFFFF" strokeWidth="2.0" strokeLinecap="round" fill="none" />

          {/* Marco derecho */}
          <circle
            cx="15"
            cy="0"
            r="13"
            fill="#A8DADC"
            fillOpacity="0.30"
            stroke="#E09F3E"
            strokeWidth="3.2"
          />
          {/* Reflejo derecho */}
          <path d="M9 -4C12 -8 17 -8 19 -6" stroke="#FFFFFF" strokeWidth="2.0" strokeLinecap="round" fill="none" />

          {/* Puente nasal anatómico */}
          <path d="M-2 -2C-1 -5 1 -5 2 -2" stroke="#E09F3E" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          {/* Patillas laterales que abrazan la cabeza */}
          <path d="M-28 0H-33" stroke="#E09F3E" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M28 0H33" stroke="#E09F3E" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )
    }

    case 'star_glasses': {
      // VARIANTE TUCANCITO: Estrella estelar en ojo visible
      if (petId === 'toucan') {
        return (
          <g id="acc-star_glasses-toucan" className="wearable-part star-variant-toucan">
            <polygon
              points="0,-16 4.5,-5 16,-5 7,2 10.5,13 0,7 -10.5,13 -7,2 -16,-5 -4.5,-5"
              fill="#FFD166"
              fillOpacity="0.45"
              stroke="#E09F3E"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            <circle cx="-3" cy="-3" r="2" fill="#FFF" opacity="0.9" />
            <path
              d="M-15 0C-22 5 -24 18 -18 24"
              stroke="#D48B00"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="2 2"
              fill="none"
            />
          </g>
        )
      }

      // VARIANTE TORTUGUITA: Estrellas en perspectiva
      if (petId === 'turtle') {
        return (
          <g id="acc-star_glasses-turtle" className="wearable-part star-variant-turtle">
            {/* Izquierda pequeña */}
            <g transform="translate(-16, 2) scale(0.75)">
              <polygon
                points="0,-15 4,-5 15,-5 6,2 9,12 0,6 -9,12 -6,2 -15,-5 -4,-5"
                fill="#FFD166"
                fillOpacity="0.42"
                stroke="#E09F3E"
                strokeWidth="3.0"
                strokeLinejoin="round"
              />
            </g>
            {/* Derecha frontal */}
            <g transform="translate(12, -1) scale(1.0)">
              <polygon
                points="0,-15 4,-5 15,-5 6,2 9,12 0,6 -9,12 -6,2 -15,-5 -4,-5"
                fill="#FFD166"
                fillOpacity="0.45"
                stroke="#E09F3E"
                strokeWidth="2.8"
                strokeLinejoin="round"
              />
              <circle cx="-3" cy="-3" r="1.8" fill="#FFF" />
            </g>
            <path d="M-6 0H4" stroke="#E09F3E" strokeWidth="2.8" strokeLinecap="round" />
          </g>
        )
      }

      // VARIANTE MONITO (Default)
      return (
        <g id="acc-star_glasses-monkey" className="wearable-part star-variant-monkey">
          {/* Estrella izquierda */}
          <polygon
            points="-15,-13 -11,-4 -3,-4 -9,2 -7,11 -15,6 -23,11 -21,2 -27,-4 -19,-4"
            fill="#FFD166"
            fillOpacity="0.45"
            stroke="#E09F3E"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          {/* Estrella derecha */}
          <polygon
            points="15,-13 19,-4 27,-4 21,2 23,11 15,6 7,11 9,2 3,-4 11,-4"
            fill="#FFD166"
            fillOpacity="0.45"
            stroke="#E09F3E"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          {/* Puente */}
          <path d="M-3 -1H3" stroke="#E09F3E" strokeWidth="3" strokeLinecap="round" />
          <circle cx="-17" cy="-5" r="1.5" fill="#FFF" />
          <circle cx="13" cy="-5" r="1.5" fill="#FFF" />
        </g>
      )
    }

    // ----------------------------------------------------
    // CUELLO / PECHO
    // ----------------------------------------------------
    case 'explorer_scarf':
      return (
        <g id="acc-explorer_scarf" className="wearable-part">
          {/* Banda que rodea el cuello con caída natural */}
          <path
            d="M-22 -6C-8 1 8 1 22 -6C25 0 22 6 16 8C6 11 -6 11 -16 8C-22 6 -25 0 -22 -6Z"
            fill="#489B6E"
            stroke="#2A6F48"
            strokeWidth="2.5"
          />
          {/* Pañuelo triangular caído */}
          <polygon
            points="-8 5 8 5 0 23"
            fill="#5EBC86"
            stroke="#2A6F48"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Pliegue de tela */}
          <line x1="0" y1="5" x2="0" y2="18" stroke="#3D8E63" strokeWidth="1.8" />
          {/* Nudo central con detalle */}
          <circle cx="0" cy="6" r="4.5" fill="#3D8E63" stroke="#2A6F48" strokeWidth="2" />
        </g>
      )

    case 'gold_medal':
      return (
        <g id="acc-gold_medal" className="wearable-part">
          {/* Cinta en V texturizada */}
          <path d="M-14 -10L-4 6L-10 12" stroke="#3A86FF" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M14 -10L4 6L10 12" stroke="#3A86FF" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          {/* Medalla dorada */}
          <circle cx="0" cy="15" r="11" fill="#FFB703" stroke="#D48B00" strokeWidth="2.5" />
          <circle cx="0" cy="15" r="8.5" fill="#FFD166" />
          {/* Estrella en relieve */}
          <polygon
            points="0,9 2.5,13.5 7,14 3.5,17 4.5,21.5 0,19.5 -4.5,21.5 -3.5,17 -7,14 -2.5,13.5"
            fill="#FB8500"
          />
          <circle cx="-3" cy="12" r="1.5" fill="#FFF" />
        </g>
      )

    case 'flower_necklace':
      return (
        <g id="acc-flower_necklace" className="wearable-part">
          {/* Guirnalda curvada */}
          <path
            d="M-22 -4C-12 12 12 12 22 -4"
            stroke="#52B788"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
          {/* Flor 1 (izquierda) */}
          <circle cx="-16" cy="1" r="5" fill="#FF5D8F" />
          <circle cx="-16" cy="1" r="2" fill="#FFE66D" />
          {/* Flor 2 (centro-izq) */}
          <circle cx="-6" cy="9" r="6" fill="#4CC9F0" />
          <circle cx="-6" cy="9" r="2.5" fill="#FFE66D" />
          {/* Flor 3 (centro-der) */}
          <circle cx="6" cy="9" r="6" fill="#FF70A6" />
          <circle cx="6" cy="9" r="2.5" fill="#FFE66D" />
          {/* Flor 4 (derecha) */}
          <circle cx="16" cy="1" r="5" fill="#FFB703" />
          <circle cx="16" cy="1" r="2" fill="#E63946" />
        </g>
      )

    // ----------------------------------------------------
    // ESPALDA / CUERPO
    // ----------------------------------------------------
    case 'small_backpack':
      return (
        <g id="acc-small_backpack" className="wearable-part">
          {/* Sombra de la mochila */}
          <rect x="-18" y="-13" width="38" height="36" rx="8" fill="#B38054" />
          {/* Cuerpo de cuero aventurero */}
          <rect
            x="-20"
            y="-16"
            width="40"
            height="36"
            rx="8"
            fill="#D4A373"
            stroke="#8C5C36"
            strokeWidth="2.8"
          />
          {/* Bolsillo exterior */}
          <rect
            x="-14"
            y="2"
            width="28"
            height="14"
            rx="4"
            fill="#E2B78A"
            stroke="#8C5C36"
            strokeWidth="2"
          />
          {/* Tapa con costura */}
          <path d="M-18 -11H18" stroke="#8C5C36" strokeWidth="2.5" strokeLinecap="round" />
          {/* Hebilla dorada */}
          <rect x="-4" y="-1" width="8" height="6" rx="2" fill="#FFE066" stroke="#8C5C36" strokeWidth="1.5" />
          {/* Asas laterales */}
          <path d="M-20 -7C-26 -1 -26 11 -20 15" stroke="#6F4522" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M20 -7C26 -1 26 11 20 15" stroke="#6F4522" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      )

    case 'explorer_backpack':
      return (
        <g id="acc-explorer_backpack" className="wearable-part">
          {/* Mochila grande con esterilla superior */}
          <rect
            x="-22"
            y="-10"
            width="44"
            height="40"
            rx="8"
            fill="#489B6E"
            stroke="#2A6F48"
            strokeWidth="3"
          />
          {/* Saco de dormir / esterilla enrollada arriba */}
          <rect
            x="-24"
            y="-22"
            width="48"
            height="12"
            rx="6"
            fill="#E76F51"
            stroke="#B23A1F"
            strokeWidth="2.5"
          />
          <line x1="-12" y1="-22" x2="-12" y2="-10" stroke="#8A2510" strokeWidth="2" />
          <line x1="12" y1="-22" x2="12" y2="-10" stroke="#8A2510" strokeWidth="2" />
          {/* Cantimplora lateral */}
          <rect x="22" y="2" width="8" height="18" rx="4" fill="#4CC9F0" stroke="#1A658F" strokeWidth="2" />
          {/* Bolsillo frontal */}
          <rect x="-15" y="8" width="30" height="16" rx="4" fill="#5EBC86" stroke="#2A6F48" strokeWidth="2" />
          <rect x="-4" y="6" width="8" height="6" rx="2" fill="#FFD166" stroke="#A67300" strokeWidth="1.5" />
        </g>
      )

    case 'short_cape':
      return (
        <g id="acc-short_cape" className="wearable-part">
          {/* Capa ondeante de héroe */}
          <path
            d="M-18 -12C-30 8 -24 32 -32 44C-18 40 -8 44 0 40C8 44 18 40 32 44C24 32 30 8 18 -12Z"
            fill="#E63946"
            stroke="#9B2226"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Pliegues de sombra */}
          <path d="M-8 4C-12 18 -14 36 -16 42" stroke="#BA181B" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 4C12 18 14 36 16 42" stroke="#BA181B" strokeWidth="2" strokeLinecap="round" />
          {/* Broche dorado del cuello */}
          <circle cx="0" cy="-12" r="4.5" fill="#FFD166" stroke="#C78A00" strokeWidth="2" />
        </g>
      )
  }
}

/* ============================================================
   COMPONENTE DE CAPA DE ACCESORIO INDIVIDUAL
   Calcula la transformación exacta para la combinación:
   (accessoryId, petId, stage)
   ============================================================ */

export const AccessoryLayer = ({
  accessoryId,
  petId,
  stage,
}: {
  accessoryId: AccessoryId
  petId: PetId
  stage: GrowthStage
}) => {
  const transformConfig = WEARABLE_CONFIG[accessoryId]?.[petId]?.[stage] ?? {
    x: 100,
    y: 100,
    scale: 1,
  }

  const rot = transformConfig.rotation ? ` rotate(${transformConfig.rotation})` : ''
  const transform = `translate(${transformConfig.x}, ${transformConfig.y}) scale(${transformConfig.scale})${rot}`

  return (
    <g transform={transform} className={`accessory-layer accessory-${accessoryId} for-${petId}-${stage}`}>
      <AccessoryGraphic accessoryId={accessoryId} petId={petId} />
    </g>
  )
}
