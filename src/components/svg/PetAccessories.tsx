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
   Coordenadas en el sistema viewBox "0 0 200 200"
   Adaptadas a las 3 especies en sus 4 etapas (12 formas)
   ============================================================ */

interface AnchorTransform {
  x: number
  y: number
  scale: number
  rotation?: number
}

// 1. ANCLAJES PARA CABEZA (head: gorrita, sombrero, corona, lazo)
const HEAD_ANCHORS: Record<PetId, Record<GrowthStage, AnchorTransform>> = {
  monkey: {
    baby: { x: 100, y: 44, scale: 0.95 },
    sprout: { x: 100, y: 46, scale: 0.92 },
    young: { x: 100, y: 46, scale: 0.90 },
    adult: { x: 100, y: 42, scale: 1.0 },
  },
  turtle: {
    baby: { x: 100, y: 46, scale: 0.78 },
    sprout: { x: 100, y: 44, scale: 0.80 },
    young: { x: 100, y: 42, scale: 0.82 },
    adult: { x: 100, y: 38, scale: 0.85 },
  },
  toucan: {
    baby: { x: 100, y: 56, scale: 0.82, rotation: -4 },
    sprout: { x: 100, y: 52, scale: 0.85, rotation: -3 },
    young: { x: 100, y: 48, scale: 0.88, rotation: -2 },
    adult: { x: 100, y: 46, scale: 0.92, rotation: -2 },
  },
}

// 2. ANCLAJES PARA ROSTRO / OJOS (face: lentes redondos, gafas de estrella)
const FACE_ANCHORS: Record<PetId, Record<GrowthStage, AnchorTransform>> = {
  monkey: {
    baby: { x: 100, y: 72, scale: 0.95 },
    sprout: { x: 100, y: 74, scale: 0.92 },
    young: { x: 100, y: 74, scale: 0.92 },
    adult: { x: 100, y: 74, scale: 0.98 },
  },
  turtle: {
    baby: { x: 102, y: 65, scale: 0.78 },
    sprout: { x: 102, y: 64, scale: 0.80 },
    young: { x: 102, y: 62, scale: 0.82 },
    adult: { x: 102, y: 60, scale: 0.85 },
  },
  toucan: {
    baby: { x: 94, y: 72, scale: 0.80, rotation: -3 },
    sprout: { x: 94, y: 70, scale: 0.82, rotation: -2 },
    young: { x: 94, y: 68, scale: 0.85, rotation: -2 },
    adult: { x: 94, y: 68, scale: 0.88, rotation: -2 },
  },
}

// 3. ANCLAJES PARA CUELLO / PECHO (neck: pañuelo, medalla, collar de flores)
const NECK_ANCHORS: Record<PetId, Record<GrowthStage, AnchorTransform>> = {
  monkey: {
    baby: { x: 100, y: 114, scale: 0.90 },
    sprout: { x: 100, y: 116, scale: 0.95 },
    young: { x: 100, y: 116, scale: 1.0 },
    adult: { x: 100, y: 118, scale: 1.1 },
  },
  turtle: {
    baby: { x: 100, y: 96, scale: 0.80 },
    sprout: { x: 100, y: 94, scale: 0.85 },
    young: { x: 100, y: 92, scale: 0.90 },
    adult: { x: 100, y: 90, scale: 0.98 },
  },
  toucan: {
    baby: { x: 100, y: 114, scale: 0.85 },
    sprout: { x: 100, y: 112, scale: 0.90 },
    young: { x: 100, y: 110, scale: 0.95 },
    adult: { x: 100, y: 108, scale: 1.05 },
  },
}

// 4. ANCLAJES PARA ESPALDA / CUERPO (back: mochila pequeña, mochila explorador, capa)
const BACK_ANCHORS: Record<PetId, Record<GrowthStage, AnchorTransform>> = {
  monkey: {
    baby: { x: 100, y: 140, scale: 0.90 },
    sprout: { x: 100, y: 138, scale: 0.98 },
    young: { x: 100, y: 136, scale: 1.05 },
    adult: { x: 100, y: 134, scale: 1.15 },
  },
  turtle: {
    baby: { x: 100, y: 130, scale: 0.88 },
    sprout: { x: 100, y: 128, scale: 0.95 },
    young: { x: 100, y: 124, scale: 1.05 },
    adult: { x: 100, y: 120, scale: 1.15 },
  },
  toucan: {
    baby: { x: 88, y: 134, scale: 0.85, rotation: 5 },
    sprout: { x: 86, y: 132, scale: 0.90, rotation: 5 },
    young: { x: 84, y: 130, scale: 0.98, rotation: 5 },
    adult: { x: 82, y: 128, scale: 1.08, rotation: 5 },
  },
}

/* ============================================================
   ILUSTRACIONES VECTORIALES NATIVAS (12 ACCESORIOS CANÓNICOS)
   Diseño infantil coherente, contornos limpios, estilo Muyu
   ============================================================ */

export const AccessoryGraphic = ({ accessoryId }: { accessoryId: AccessoryId }) => {
  switch (accessoryId) {
    // ----------------------------------------------------
    // CABEZA
    // ----------------------------------------------------
    case 'orange_cap':
      return (
        <g id="acc-orange_cap">
          {/* Corona de la gorra */}
          <path
            d="M-26 2C-26 -18 26 -18 26 2Z"
            fill="#FF7A00"
            stroke="#D95F00"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Botón superior */}
          <circle cx="0" cy="-18" r="3.5" fill="#FFE066" stroke="#D95F00" strokeWidth="1.5" />
          {/* Visera curva */}
          <path
            d="M-28 2C-15 8 18 8 32 -1C30 5 15 10 -24 5Z"
            fill="#E66A00"
            stroke="#B34B00"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Línea decorativa */}
          <path d="M-12 0C-4 -8 4 -8 12 0" stroke="#FFA34D" strokeWidth="2" strokeLinecap="round" />
        </g>
      )

    case 'explorer_hat':
      return (
        <g id="acc-explorer_hat">
          {/* Ala ancha del sombrero */}
          <ellipse cx="0" cy="4" rx="38" ry="10" fill="#D4A373" stroke="#8C5C36" strokeWidth="3" />
          {/* Copa del sombrero */}
          <path
            d="M-22 4C-20 -18 20 -18 22 4Z"
            fill="#E2B78A"
            stroke="#8C5C36"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Hendidura superior */}
          <path d="M-8 -14C-2 -11 2 -11 8 -14" stroke="#8C5C36" strokeWidth="2.5" strokeLinecap="round" />
          {/* Cinta verde bosque */}
          <path
            d="M-22 1C-10 4 10 4 22 1V4C10 7 -10 7 -22 4Z"
            fill="#489B6E"
            stroke="#2A6F48"
            strokeWidth="1.5"
          />
        </g>
      )

    case 'leaf_crown':
      return (
        <g id="acc-leaf_crown">
          {/* Corona de hojas doradas y verdes */}
          <path
            d="M-28 2C-10 6 10 6 28 2"
            stroke="#5E9A68"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          {/* Hojas centrales */}
          <path
            d="M-20 2C-28 -8 -20 -16 -16 -2C-12 -16 -4 -10 -8 2"
            fill="#74C69D"
            stroke="#2D6A4F"
            strokeWidth="2"
          />
          <path
            d="M0 -2C-6 -18 0 -24 6 -2C12 -24 18 -16 10 2"
            fill="#FFD166"
            stroke="#E09F3E"
            strokeWidth="2"
          />
          <path
            d="M16 2C12 -10 20 -16 24 -2C28 -12 34 -6 28 4"
            fill="#95D5B2"
            stroke="#2D6A4F"
            strokeWidth="2"
          />
          {/* Brote joya central */}
          <circle cx="0" cy="-4" r="3" fill="#E63946" stroke="#9B2226" strokeWidth="1" />
        </g>
      )

    case 'color_bow':
      return (
        <g id="acc-color_bow">
          {/* Ala izquierda del lazo */}
          <polygon
            points="-2 -2 -22 -14 -20 10"
            fill="#FF5D8F"
            stroke="#C9184A"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <polygon points="-2 -2 -16 -8 -15 6" fill="#FF85A1" />
          {/* Ala derecha del lazo */}
          <polygon
            points="2 -2 22 -14 20 10"
            fill="#FF5D8F"
            stroke="#C9184A"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <polygon points="2 -2 16 -8 15 6" fill="#FF85A1" />
          {/* Cintas colgantes */}
          <path
            d="M-4 4L-12 18L-6 16L-2 6"
            fill="#FFD166"
            stroke="#D48B00"
            strokeWidth="1.5"
          />
          <path
            d="M4 4L12 18L6 16L2 6"
            fill="#FFD166"
            stroke="#D48B00"
            strokeWidth="1.5"
          />
          {/* Nudo central */}
          <circle cx="0" cy="-1" r="5" fill="#FFE66D" stroke="#D48B00" strokeWidth="2" />
        </g>
      )

    // ----------------------------------------------------
    // ROSTRO
    // ----------------------------------------------------
    case 'round_glasses':
      return (
        <g id="acc-round_glasses">
          {/* Marco izquierdo */}
          <circle
            cx="-15"
            cy="0"
            r="12"
            fill="#80ED99"
            fillOpacity="0.25"
            stroke="#E09F3E"
            strokeWidth="3"
          />
          {/* Catchlight izquierdo */}
          <path d="M-21 -4C-18 -8 -13 -8 -11 -6" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
          {/* Marco derecho */}
          <circle
            cx="15"
            cy="0"
            r="12"
            fill="#80ED99"
            fillOpacity="0.25"
            stroke="#E09F3E"
            strokeWidth="3"
          />
          {/* Catchlight derecho */}
          <path d="M9 -4C12 -8 17 -8 19 -6" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
          {/* Puente */}
          <path d="M-3 -2C-1 -5 1 -5 3 -2" stroke="#E09F3E" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Patillas */}
          <path d="M-27 0H-33" stroke="#E09F3E" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M27 0H33" stroke="#E09F3E" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )

    case 'star_glasses':
      return (
        <g id="acc-star_glasses">
          {/* Estrella izquierda */}
          <polygon
            points="-16,-12 -12,-4 -4,-4 -10,2 -8,11 -16,6 -24,11 -22,2 -28,-4 -20,-4"
            fill="#FFD166"
            fillOpacity="0.4"
            stroke="#E09F3E"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Estrella derecha */}
          <polygon
            points="16,-12 20,-4 28,-4 22,2 24,11 16,6 8,11 10,2 4,-4 12,-4"
            fill="#FFD166"
            fillOpacity="0.4"
            stroke="#E09F3E"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Puente */}
          <path d="M-4 -2H4" stroke="#E09F3E" strokeWidth="3" strokeLinecap="round" />
        </g>
      )

    // ----------------------------------------------------
    // CUELLO / PECHO
    // ----------------------------------------------------
    case 'explorer_scarf':
      return (
        <g id="acc-explorer_scarf">
          {/* Banda que rodea el cuello */}
          <path
            d="M-22 -8C-8 -2 8 -2 22 -8C26 0 22 6 16 8C6 10 -6 10 -16 8C-22 6 -26 0 -22 -8Z"
            fill="#489B6E"
            stroke="#2A6F48"
            strokeWidth="2.5"
          />
          {/* Pañuelo triangular caído */}
          <polygon points="-8 4 8 4 0 22" fill="#5EBC86" stroke="#2A6F48" strokeWidth="2.5" strokeLinejoin="round" />
          {/* Nudo */}
          <circle cx="0" cy="5" r="4.5" fill="#3D8E63" stroke="#2A6F48" strokeWidth="2" />
        </g>
      )

    case 'gold_medal':
      return (
        <g id="acc-gold_medal">
          {/* Cinta en V */}
          <path d="M-14 -12L-4 4L-10 10" stroke="#3A86FF" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M14 -12L4 4L10 10" stroke="#3A86FF" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Medalla redonda dorada */}
          <circle cx="0" cy="14" r="11" fill="#FFB703" stroke="#D48B00" strokeWidth="2.5" />
          <circle cx="0" cy="14" r="8" fill="#FFD166" />
          {/* Estrella en relieve */}
          <polygon
            points="0,8 2.5,12.5 7,13 3.5,16 4.5,20.5 0,18.5 -4.5,20.5 -3.5,16 -7,13 -2.5,12.5"
            fill="#FB8500"
          />
        </g>
      )

    case 'flower_necklace':
      return (
        <g id="acc-flower_necklace">
          {/* Guirnalda curvada */}
          <path
            d="M-22 -4C-12 12 12 12 22 -4"
            stroke="#52B788"
            strokeWidth="2.5"
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
        <g id="acc-small_backpack">
          {/* Cuerpo de la mochila */}
          <rect
            x="-20"
            y="-16"
            width="40"
            height="36"
            rx="8"
            fill="#D4A373"
            stroke="#8C5C36"
            strokeWidth="3"
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
          {/* Tapa y hebilla */}
          <path d="M-18 -12H18" stroke="#8C5C36" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="-4" y="-2" width="8" height="6" rx="2" fill="#FFE066" stroke="#8C5C36" strokeWidth="1.5" />
          {/* Correas laterales */}
          <path d="M-20 -8C-28 -2 -28 12 -20 16" stroke="#6F4522" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M20 -8C28 -2 28 12 20 16" stroke="#6F4522" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      )

    case 'explorer_backpack':
      return (
        <g id="acc-explorer_backpack">
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
        <g id="acc-short_cape">
          {/* Capa ondeante */}
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
   Calcula automáticamente la transformación de anclaje según
   especie (petId), etapa (stage) y categoría anatómica.
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
  // Determinar la categoría anatómica del accesorio
  let anchor: AnchorTransform = { x: 100, y: 100, scale: 1 }

  if (
    accessoryId === 'orange_cap' ||
    accessoryId === 'explorer_hat' ||
    accessoryId === 'leaf_crown' ||
    accessoryId === 'color_bow'
  ) {
    anchor = HEAD_ANCHORS[petId][stage]
  } else if (accessoryId === 'round_glasses' || accessoryId === 'star_glasses') {
    anchor = FACE_ANCHORS[petId][stage]
  } else if (
    accessoryId === 'explorer_scarf' ||
    accessoryId === 'gold_medal' ||
    accessoryId === 'flower_necklace'
  ) {
    anchor = NECK_ANCHORS[petId][stage]
  } else if (
    accessoryId === 'small_backpack' ||
    accessoryId === 'explorer_backpack' ||
    accessoryId === 'short_cape'
  ) {
    anchor = BACK_ANCHORS[petId][stage]
  }

  const rot = anchor.rotation ? ` rotate(${anchor.rotation})` : ''
  const transform = `translate(${anchor.x}, ${anchor.y}) scale(${anchor.scale})${rot}`

  return (
    <g transform={transform} className={`accessory-layer accessory-${accessoryId}`}>
      <AccessoryGraphic accessoryId={accessoryId} />
    </g>
  )
}

