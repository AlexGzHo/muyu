import type { SVGProps } from 'react'
import type { GrowthStage, PetId, PetReaction } from '../../game/types'

export interface PetIllustrationProps extends Omit<SVGProps<SVGSVGElement>, 'id'> {
  id?: PetId
  stage?: GrowthStage
  reaction?: PetReaction
  size?: number | string
  className?: string
}

/* ============================================================
   MUYU 2.1 — SISTEMA VISUAL DE MASCOTAS
   12 Ilustraciones finales diferenciadas por especie y etapa evolutiva:
   - Bebé (baby): Cabeza/ojos grandes, cuerpo compacto, expresión tierna kawaii
   - Pequeño (sprout): Niñez juguetona, postura curiosa y sonriente
   - Explorador (young): Dinámico, ágil, extremidades activas en movimiento
   - Adulto (adult): Joven adulto seguro, postura erguida y madura
   ============================================================ */

interface AnimalIllustrationProps extends PetIllustrationProps {
  id: PetId
}

const CharacterIllustration = ({
  id,
  stage = 'baby',
  reaction = 'none',
  size = 200,
  className = '',
  ...props
}: AnimalIllustrationProps) => {
  const isHappy = reaction === 'happy' || reaction === 'tap'
  const isPetting = reaction === 'petting' || reaction === 'pet'
  const isEating = reaction === 'eating' || reaction === 'feed'

  const isBaby = stage === 'baby'
  const isAdult = stage === 'adult'
  const shadowRadius = isBaby ? 40 : isAdult ? 52 : 46

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pet-character-svg pet-${id} pet-${stage} pet-react-${reaction} ${className}`}
      aria-label={`${id} en etapa ${stage}`}
      {...props}
    >
      <defs>
        {/* Sombra suave difusa para integrar la mascota en el escenario */}
        <radialGradient id={`pet-shadow-grad-${id}-${stage}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0B1E13" stopOpacity="0.32" />
          <stop offset="60%" stopColor="#0B1E13" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0B1E13" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 1. Sombra de contacto suave en el piso */}
      <ellipse
        cx="100"
        cy="184"
        rx={shadowRadius}
        ry="8"
        fill={`url(#pet-shadow-grad-${id}-${stage})`}
        className="pet-ground-shadow"
      />

      {/* 2. Cuerpo del personaje con animación por código CSS */}
      <g className={`pet-body-group ${isHappy ? 'anim-happy' : ''} ${isPetting ? 'anim-petting' : ''} ${isEating ? 'anim-eating' : ''}`}>
        <image
          href={`/pets/${id}/${stage}.png`}
          x="10"
          y="10"
          width="180"
          height="180"
          preserveAspectRatio="xMidYMid meet"
          className="pet-raster-art"
        />
      </g>

      {/* 3. Reacciones emocionales interactivas por código */}
      {isPetting && (
        <g className="pet-reaction-overlay anim-hearts">
          {/* Corazoncito flotante izquierdo */}
          <path
            d="M50 48 C50 42 56 38 61 43 C66 38 72 42 72 48 C72 56 61 64 61 64 C61 64 50 56 50 48 Z"
            fill="#FF4D6D"
            opacity="0.9"
            transform="scale(0.85) translate(8, -12)"
          />
          {/* Corazoncito flotante derecho */}
          <path
            d="M136 38 C136 32 142 28 147 33 C152 28 158 32 158 38 C158 46 147 54 147 54 C147 54 136 46 136 38 Z"
            fill="#FF758F"
            opacity="0.85"
            transform="scale(0.95) translate(4, -8)"
          />
          {/* Rubor en mejillas */}
          <ellipse cx="68" cy="88" rx="8" ry="4.5" fill="#FF758F" opacity="0.45" />
          <ellipse cx="132" cy="88" rx="8" ry="4.5" fill="#FF758F" opacity="0.45" />
        </g>
      )}

      {isHappy && (
        <g className="pet-reaction-overlay anim-sparkles">
          {/* Destellos de alegría */}
          <path
            d="M54 36 L57 44 L65 47 L57 50 L54 58 L51 50 L43 47 L51 44 Z"
            fill="#FFD166"
            opacity="0.9"
          />
          <path
            d="M148 42 L150 48 L156 50 L150 52 L148 58 L146 52 L140 50 L146 48 Z"
            fill="#FFD166"
            opacity="0.85"
          />
          <circle cx="100" cy="30" r="3" fill="#FFF" opacity="0.8" />
        </g>
      )}

      {isEating && (
        <g className="pet-reaction-overlay anim-eating-bites">
          {/* Bocado / miguitas de alimento feliz */}
          <circle cx="68" cy="120" r="4" fill="#FFB703" opacity="0.8" />
          <circle cx="74" cy="114" r="3" fill="#FB8500" opacity="0.75" />
          <circle cx="130" cy="118" r="3.5" fill="#90BE6D" opacity="0.8" />
        </g>
      )}
    </svg>
  )
}

/* ============================================================
   Componentes específicos de cada mascota (exportaciones individuales)
   ============================================================ */
export const MonkeyIllustration = (props: PetIllustrationProps) => (
  <CharacterIllustration id="monkey" {...props} />
)

export const TurtleIllustration = (props: PetIllustrationProps) => (
  <CharacterIllustration id="turtle" {...props} />
)

export const ToucanIllustration = (props: PetIllustrationProps) => (
  <CharacterIllustration id="toucan" {...props} />
)

/* ============================================================
   Selector universal de componente de mascota
   ============================================================ */
export const PetRenderer = ({
  id,
  stage = 'baby',
  reaction = 'none',
  size = 200,
  className = '',
}: {
  id: PetId
  stage?: GrowthStage
  reaction?: PetReaction
  size?: number | string
  className?: string
}) => {
  return (
    <CharacterIllustration
      id={id}
      stage={stage}
      reaction={reaction}
      size={size}
      className={className}
    />
  )
}
