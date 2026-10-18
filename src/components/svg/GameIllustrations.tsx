import type { SVGProps } from 'react'

export interface GameSvgProps extends SVGProps<SVGSVGElement> {
  size?: number | string
}

/* ============================================================
   1. FRUTAS Y OBJETOS DE CONTEO
   ============================================================ */

export const MangoFruit = ({ size = 60, ...props }: GameSvgProps) => (
  <svg viewBox="0 0 60 60" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <ellipse cx="30" cy="34" rx="19" ry="21" fill="#FFA500" />
    <path d="M17 33C17 22 25 16 35 18C42 20 46 29 44 38C41 46 32 51 22 47C18 45 17 40 17 33Z" fill="#FF5942" />
    <ellipse cx="25" cy="28" rx="5" ry="9" transform="rotate(-20 25 28)" fill="#FFD166" opacity="0.6" />
    <path d="M30 15C30 10 34 7 36 5" stroke="#654321" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M33 11C39 9 44 11 46 15C44 18 39 19 33 17Z" fill="#6EC6A0" />
  </svg>
)

export const AppleFruit = ({ size = 60, ...props }: GameSvgProps) => (
  <svg viewBox="0 0 60 60" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <ellipse cx="24" cy="34" rx="16" ry="18" fill="#E63946" />
    <ellipse cx="36" cy="34" rx="16" ry="18" fill="#E63946" />
    <ellipse cx="20" cy="28" rx="4" ry="8" transform="rotate(-15 20 28)" fill="#FFAAA6" opacity="0.6" />
    <path d="M30 17C30 11 32 8 34 6" stroke="#654321" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M32 12C38 10 42 12 43 15C41 18 37 19 32 16Z" fill="#6EC6A0" />
  </svg>
)

export interface BasketCradleProps extends Omit<GameSvgProps, 'target'> {
  count?: number
  targetCount?: number
}

export const BasketCradle = ({
  count = 0,
  targetCount = 3,
  size = 200,
  ...props
}: BasketCradleProps) => {
  return (
    <svg viewBox="0 0 200 160" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Asa */}
      <path
        d="M45 80C45 35 65 18 100 18C135 18 155 35 155 80"
        stroke="#9A7B56"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />

      {/* Frutas dentro de la canasta (según count) */}
      {count >= 1 && <circle cx="70" cy="74" r="18" fill="#E63946" />}
      {count >= 2 && <circle cx="130" cy="74" r="18" fill="#FFA500" />}
      {count >= 3 && <circle cx="100" cy="62" r="19" fill="#8AC926" />}
      {count >= 4 && <circle cx="82" cy="52" r="17" fill="#E63946" />}
      {count >= 5 && <circle cx="118" cy="52" r="17" fill="#FFA500" />}

      {/* Cuerpo tejido de la canasta */}
      <path
        d="M30 78H170L156 142C154.5 149 148 154 140 154H60C52 154 45.5 149 44 142L30 78Z"
        fill="#D4A373"
      />
      <path d="M24 78H176" stroke="#8A633F" strokeWidth="10" strokeLinecap="round" />
      <path d="M54 82V148M85 82V152M115 82V152M146 82V148" stroke="#BC8A5F" strokeWidth="5" />
      <path d="M34 112H166" stroke="#BC8A5F" strokeWidth="5" />

      {/* Placa con indicador numérico y puntos */}
      <rect x="74" y="104" width="52" height="34" rx="10" fill="#FFF8F0" stroke="#8A633F" strokeWidth="3" />
      <text
        x="100"
        y="128"
        textAnchor="middle"
        fontFamily="Nunito, sans-serif"
        fontSize="22"
        fontWeight="900"
        fill="#8A633F"
      >
        {count}/{targetCount}
      </text>
    </svg>
  )
}

/* ============================================================
   2. ELEMENTOS DE CIENCIA Y PLANTA
   ============================================================ */

export const WateringCan = ({ size = 80, ...props }: GameSvgProps) => (
  <svg viewBox="0 0 90 80" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Cuerpo de regadera */}
    <rect x="22" y="28" width="46" height="42" rx="14" fill="#4CC9F0" />
    <path d="M22 40H68" stroke="#3AA8CC" strokeWidth="3" />
    {/* Asa trasera */}
    <path d="M22 36C8 36 6 62 22 64" stroke="#3AA8CC" strokeWidth="7" strokeLinecap="round" fill="none" />
    {/* Pico vertedor */}
    <path d="M62 44L82 24" stroke="#4CC9F0" strokeWidth="8" strokeLinecap="round" />
    {/* Rosa rociadora */}
    <ellipse cx="83" cy="23" rx="7" ry="11" transform="rotate(-35 83 23)" fill="#F72585" />
    {/* Gotitas de agua cayendo */}
    <circle cx="86" cy="38" r="2.5" fill="#4CC9F0" />
    <circle cx="82" cy="46" r="3" fill="#4CC9F0" />
    <circle cx="88" cy="54" r="2.5" fill="#4CC9F0" />
  </svg>
)

export const SunTool = ({ size = 80, ...props }: GameSvgProps) => (
  <svg viewBox="0 0 90 90" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g stroke="#FFA500" strokeWidth="5" strokeLinecap="round">
      <line x1="45" y1="8" x2="45" y2="18" />
      <line x1="45" y1="72" x2="45" y2="82" />
      <line x1="8" y1="45" x2="18" y2="45" />
      <line x1="72" y1="45" x2="82" y2="45" />
      <line x1="19" y1="19" x2="26" y2="26" />
      <line x1="64" y1="64" x2="71" y2="71" />
      <line x1="19" y1="71" x2="26" y2="64" />
      <line x1="64" y1="26" x2="71" y2="19" />
    </g>
    <circle cx="45" cy="45" r="24" fill="#FFC043" />
    <circle cx="45" cy="45" r="20" fill="#FFE066" />
    <circle cx="38" cy="42" r="2.5" fill="#8B5A2B" />
    <circle cx="52" cy="42" r="2.5" fill="#8B5A2B" />
    <path d="M40 50C42 53 48 53 50 50" stroke="#8B5A2B" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)

export const SeedTool = ({ size = 80, ...props }: GameSvgProps) => (
  <svg viewBox="0 0 90 90" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="25" y="20" width="40" height="50" rx="8" fill="#E8D5B5" stroke="#BC8A5F" strokeWidth="4" />
    <path d="M25 35H65" stroke="#BC8A5F" strokeWidth="3" />
    <ellipse cx="45" cy="50" rx="8" ry="12" fill="#8B5A2B" />
    <path d="M45 42C47 45 47 55 45 58" stroke="#FFE082" strokeWidth="2" strokeLinecap="round" />
    <circle cx="36" cy="58" r="3" fill="#D4A373" />
    <circle cx="54" cy="58" r="3" fill="#D4A373" />
  </svg>
)

export const SoilTool = ({ size = 80, ...props }: GameSvgProps) => (
  <svg viewBox="0 0 90 90" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <ellipse cx="45" cy="62" rx="28" ry="14" fill="#583115" />
    <ellipse cx="45" cy="58" rx="22" ry="10" fill="#7D441D" />
    <path d="M35 38L55 18" stroke="#BC8A5F" strokeWidth="7" strokeLinecap="round" />
    <circle cx="58" cy="15" r="5" fill="#8A633F" />
    <path d="M25 48L42 32L50 40L32 56C28 58 24 54 25 48Z" fill="#A8DADC" stroke="#457B9D" strokeWidth="2.5" />
    <circle cx="30" cy="66" r="2.5" fill="#8B5A2B" />
    <circle cx="58" cy="64" r="3" fill="#8B5A2B" />
  </svg>
)

export const CareTool = ({ size = 80, ...props }: GameSvgProps) => (
  <svg viewBox="0 0 90 90" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="45" cy="45" r="32" fill="#FFF0F5" stroke="#FF70A6" strokeWidth="3" />
    <path
      d="M45 60C45 60 25 46 25 34C25 26 31 22 38 24C42 25 45 28 45 28C45 28 48 25 52 24C59 22 65 26 65 34C65 46 45 60 45 60Z"
      fill="#FF5964"
    />
    <path d="M36 29C34 32 34 37 36 40" stroke="#FFAAA6" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="22" cy="22" r="3" fill="#FFD166" />
    <circle cx="68" cy="24" r="4" fill="#FFD166" />
    <circle cx="66" cy="56" r="3" fill="#FFD166" />
  </svg>
)

export const PlantPotStage = ({
  stage = 1,
  size = 200,
  ...props
}: GameSvgProps & { stage: 1 | 2 | 3 }) => {
  return (
    <svg viewBox="0 0 200 220" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Maceta con tierra */}
      <path
        d="M50 140H150L140 205C139 211 133 216 126 216H74C67 216 61 211 60 205L50 140Z"
        fill="#C97A53"
      />
      <rect x="42" y="130" width="116" height="18" rx="6" fill="#9E5434" />
      {/* Montículo de tierra fértil */}
      <ellipse cx="100" cy="132" rx="46" ry="10" fill="#583115" />

      {/* Fase 1: Semilla que apenas germina con brote diminuto */}
      {stage === 1 && (
        <g>
          <ellipse cx="100" cy="128" rx="10" ry="7" fill="#8B5A2B" />
          <path d="M100 125V105" stroke="#489B6E" strokeWidth="5" strokeLinecap="round" />
          <path d="M100 108C108 104 114 96 112 88C104 88 98 96 100 108Z" fill="#6EC6A0" />
        </g>
      )}

      {/* Fase 2: Tallo vigoroso con 4 hojas verdes */}
      {stage === 2 && (
        <g>
          <path d="M100 130V70" stroke="#489B6E" strokeWidth="7" strokeLinecap="round" />
          <path d="M100 105C118 100 128 85 125 70C110 70 98 85 100 105Z" fill="#6EC6A0" />
          <path d="M100 90C82 85 72 70 75 55C90 55 102 70 100 90Z" fill="#85DDAF" />
          <path d="M100 70C108 60 118 55 116 42C106 44 98 55 100 70Z" fill="#6EC6A0" />
          <path d="M100 70C92 60 82 55 84 42C94 44 102 55 100 70Z" fill="#85DDAF" />
        </g>
      )}

      {/* Fase 3: Planta adulta frondosa con gran flor tropical florecida */}
      {stage === 3 && (
        <g>
          <path d="M100 130V55" stroke="#3A8A5F" strokeWidth="8" strokeLinecap="round" />
          {/* Hojas frondosas */}
          <path d="M100 110C125 105 138 85 135 68C115 68 100 85 100 110Z" fill="#6EC6A0" />
          <path d="M100 95C75 90 62 70 65 52C85 52 100 70 100 95Z" fill="#85DDAF" />
          {/* Flor tropical grande */}
          <circle cx="100" cy="40" r="13" fill="#FF5964" />
          <circle cx="85" cy="40" r="11" fill="#FF70A6" />
          <circle cx="115" cy="40" r="11" fill="#FF70A6" />
          <circle cx="100" cy="25" r="11" fill="#FF70A6" />
          <circle cx="100" cy="55" r="11" fill="#FF70A6" />
          {/* Centro dorado de la flor */}
          <circle cx="100" cy="40" r="8" fill="#FFD166" />
          <circle cx="100" cy="40" r="4" fill="#FFA500" />
        </g>
      )}
    </svg>
  )
}

/* Distractores infantiles para el juego de planta */
export const ShoeDistractor = ({ size = 70, ...props }: GameSvgProps) => (
  <svg viewBox="0 0 80 60" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M12 28C12 22 18 16 26 16H36C40 16 44 20 46 24L52 34H66C72 34 76 38 76 44C76 48 72 52 66 52H20C14 52 12 46 12 40V28Z"
      fill="#588B8B"
    />
    <path d="M12 48H76V52H12V48Z" fill="#3D5A5A" />
    <circle cx="28" cy="24" r="3" fill="#FFFFFF" />
    <circle cx="34" cy="28" r="3" fill="#FFFFFF" />
  </svg>
)

export const HatDistractor = ({ size = 70, ...props }: GameSvgProps) => (
  <svg viewBox="0 0 80 60" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <ellipse cx="40" cy="42" rx="36" ry="10" fill="#E9C46A" />
    <path d="M22 42C22 22 28 14 40 14C52 14 58 22 58 42Z" fill="#F4A261" />
    <path d="M22 38H58V42H22V38Z" fill="#E76F51" />
  </svg>
)

export const BallDistractor = ({ size = 70, ...props }: GameSvgProps) => (
  <svg viewBox="0 0 70 70" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="35" cy="35" r="28" fill="#F4A261" />
    <path d="M35 7C48 18 52 38 43 55C38 60 30 62 25 61" stroke="#E76F51" strokeWidth="6" fill="none" />
    <path d="M15 17C28 28 32 48 23 62" stroke="#2A9D8F" strokeWidth="6" fill="none" />
  </svg>
)

/* ============================================================
   3. OBJETOS PARA EL JUEGO DE ESCUCHA Y ENCUENTRA
   ============================================================ */

export type ListeningItemId =
  | 'sun'
  | 'flower'
  | 'basket'
  | 'turtle'
  | 'toucan'
  | 'monkey'
  | 'fruit'
  | 'leaf'
  | 'watering-can'

export const ListeningItemIcon = ({
  id,
  size = 90,
}: {
  id: ListeningItemId
  size?: number | string
}) => {
  switch (id) {
    case 'sun':
      return <SunTool size={size} />
    case 'flower':
      return (
        <svg viewBox="0 0 80 80" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="26" r="13" fill="#FF5964" />
          <circle cx="26" cy="40" r="13" fill="#FF70A6" />
          <circle cx="54" cy="40" r="13" fill="#FF70A6" />
          <circle cx="30" cy="54" r="13" fill="#FF5964" />
          <circle cx="50" cy="54" r="13" fill="#FF5964" />
          <circle cx="40" cy="40" r="11" fill="#FFD166" />
        </svg>
      )
    case 'basket':
      return (
        <svg viewBox="0 0 80 80" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 40H60L55 68H25L20 40Z" fill="#D4A373" stroke="#8A633F" strokeWidth="4" />
          <path d="M26 40C26 24 32 16 40 16C48 16 54 24 54 40" stroke="#8A633F" strokeWidth="5" fill="none" />
          <circle cx="34" cy="38" r="7" fill="#E63946" />
          <circle cx="46" cy="38" r="7" fill="#FFA500" />
        </svg>
      )
    case 'turtle':
      return (
        <svg viewBox="0 0 80 80" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="44" rx="22" ry="18" fill="#4EA875" />
          <circle cx="40" cy="24" r="12" fill="#6EC6A0" />
          <circle cx="36" cy="22" r="2.5" fill="#1D4E35" />
          <circle cx="44" cy="22" r="2.5" fill="#1D4E35" />
          <ellipse cx="20" cy="38" rx="7" ry="5" fill="#58B283" />
          <ellipse cx="60" cy="38" rx="7" ry="5" fill="#58B283" />
          <ellipse cx="24" cy="54" rx="6" ry="4" fill="#58B283" />
          <ellipse cx="56" cy="54" rx="6" ry="4" fill="#58B283" />
        </svg>
      )
    case 'toucan':
      return (
        <svg viewBox="0 0 80 80" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="34" cy="42" r="18" fill="#26384C" />
          <path d="M34 32C46 30 62 36 70 44C66 50 52 50 34 46Z" fill="#FFB703" />
          <path d="M56 38C66 42 70 44 70 44C66 50 60 50 54 47Z" fill="#FF5400" />
          <circle cx="30" cy="38" r="4.5" fill="#4CC9F0" />
          <circle cx="30" cy="38" r="2.5" fill="#102538" />
        </svg>
      )
    case 'monkey':
      return (
        <svg viewBox="0 0 80 80" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="36" r="9" fill="#9C6644" />
          <circle cx="60" cy="36" r="9" fill="#9C6644" />
          <circle cx="40" cy="38" r="20" fill="#9C6644" />
          <ellipse cx="40" cy="42" rx="13" ry="11" fill="#EDE0D4" />
          <circle cx="34" cy="35" r="3" fill="#3D200E" />
          <circle cx="46" cy="35" r="3" fill="#3D200E" />
          <path d="M37 45C39 47 41 47 43 45" stroke="#583115" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'fruit':
      return <MangoFruit size={size} />
    case 'leaf':
      return (
        <svg viewBox="0 0 80 80" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 58C22 58 26 30 58 22C58 22 58 50 22 58Z" fill="#6EC6A0" stroke="#3A8A5F" strokeWidth="3" />
          <path d="M22 58L54 26" stroke="#3A8A5F" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'watering-can':
      return <WateringCan size={size} />
  }
}

/* ============================================================
   4. ILUSTRACIONES ADICIONALES PARA FASE 3 (J1, J2, J4, J6, J7)
   ============================================================ */

export const OrangeFruit = ({ size = 60, ...props }: GameSvgProps) => (
  <svg viewBox="0 0 60 60" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="30" cy="33" r="19" fill="#FFA500" />
    <circle cx="30" cy="33" r="17" fill="#FF9100" />
    <ellipse cx="24" cy="27" rx="4" ry="7" transform="rotate(-20 24 27)" fill="#FFE082" opacity="0.6" />
    <path d="M30 14V8" stroke="#654321" strokeWidth="3" strokeLinecap="round" />
    <path d="M30 11C35 9 39 11 40 14C38 17 34 17 30 14Z" fill="#6EC6A0" />
  </svg>
)

export const StrawberryFruit = ({ size = 60, ...props }: GameSvgProps) => (
  <svg viewBox="0 0 60 60" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M30 52C22 46 14 36 14 26C14 18 20 16 30 19C40 16 46 18 46 26C46 36 38 46 30 52Z" fill="#E63946" />
    {/* Semillitas */}
    <circle cx="24" cy="26" r="1.5" fill="#FFE066" />
    <circle cx="36" cy="26" r="1.5" fill="#FFE066" />
    <circle cx="30" cy="34" r="1.5" fill="#FFE066" />
    <circle cx="25" cy="41" r="1.5" fill="#FFE066" />
    <circle cx="35" cy="41" r="1.5" fill="#FFE066" />
    {/* Hojitas superiores */}
    <path d="M22 17C26 14 30 17 30 17C30 17 34 14 38 17C36 21 30 20 30 20C30 20 24 21 22 17Z" fill="#489B6E" />
    <path d="M30 16V10" stroke="#3D5A2B" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)

/* Fichas de patrones para J2 */
export const PatternTile = ({
  symbol,
  size = 64,
}: {
  symbol: 'circle' | 'square' | 'triangle' | 'star' | 'leaf' | 'flower'
  size?: number | string
}) => {
  switch (symbol) {
    case 'circle':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="24" fill="#FF5964" />
          <circle cx="28" cy="26" r="6" fill="#FFAAA6" opacity="0.6" />
        </svg>
      )
    case 'square':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="12" width="40" height="40" rx="8" fill="#4CC9F0" />
          <rect x="18" y="18" width="12" height="12" rx="3" fill="#A0E7FF" opacity="0.6" />
        </svg>
      )
    case 'triangle':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="32,10 54,50 10,50" fill="#FFD166" />
          <polygon points="32,20 44,46 20,46" fill="#FFF2A3" opacity="0.5" />
        </svg>
      )
    case 'star':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 8L38 24H55L41 35L46 51L32 41L18 51L23 35L9 24H26L32 8Z" fill="#FFA500" />
        </svg>
      )
    case 'leaf':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 48C16 48 20 22 48 16C48 16 48 42 16 48Z" fill="#6EC6A0" stroke="#3A8A5F" strokeWidth="2.5" />
          <path d="M16 48L44 20" stroke="#3A8A5F" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    case 'flower':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="20" r="10" fill="#FF70A6" />
          <circle cx="20" cy="32" r="10" fill="#FF70A6" />
          <circle cx="44" cy="32" r="10" fill="#FF70A6" />
          <circle cx="24" cy="44" r="10" fill="#FF70A6" />
          <circle cx="40" cy="44" r="10" fill="#FF70A6" />
          <circle cx="32" cy="32" r="8.5" fill="#FFD166" />
        </svg>
      )
  }
}

/* Hábitats para J4 */
export const HabitatBackdrop = ({
  id,
  size = 140,
}: {
  id: 'tree' | 'river' | 'ground'
  size?: number | string
}) => {
  switch (id) {
    case 'tree':
      return (
        <svg viewBox="0 0 160 140" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="160" height="140" rx="20" fill="#E8F8F0" />
          <path d="M80 80L80 140" stroke="#8B5A2B" strokeWidth="18" strokeLinecap="round" />
          <circle cx="80" cy="65" r="44" fill="#6EC6A0" />
          <circle cx="55" cy="75" r="32" fill="#489B6E" />
          <circle cx="105" cy="75" r="32" fill="#85DDAF" />
        </svg>
      )
    case 'river':
      return (
        <svg viewBox="0 0 160 140" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="160" height="140" rx="20" fill="#E6F4FA" />
          <path d="M0 70C40 50 80 90 120 60C140 45 150 55 160 50V140H0V70Z" fill="#4CC9F0" />
          <path d="M0 95C40 85 80 115 120 90C140 80 150 85 160 80V140H0V95Z" fill="#3AA8CC" />
          <circle cx="40" cy="80" r="4" fill="#FFFFFF" opacity="0.6" />
          <circle cx="110" cy="100" r="5" fill="#FFFFFF" opacity="0.6" />
        </svg>
      )
    case 'ground':
      return (
        <svg viewBox="0 0 160 140" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="160" height="140" rx="20" fill="#FFF4E6" />
          <ellipse cx="80" cy="110" rx="70" ry="32" fill="#D4A373" />
          <ellipse cx="80" cy="100" rx="42" ry="24" fill="#583115" />
          <circle cx="40" cy="120" r="6" fill="#8A633F" />
          <circle cx="120" cy="122" r="7" fill="#8A633F" />
        </svg>
      )
  }
}

/* Animales a clasificar para J4 */
export const AnimalBadge = ({
  id,
  size = 70,
}: {
  id: 'toucan' | 'monkey' | 'fish' | 'turtle' | 'bear' | 'armadillo'
  size?: number | string
}) => {
  switch (id) {
    case 'fish':
      return (
        <svg viewBox="0 0 70 70" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M48 35C48 24 34 18 20 22C14 24 10 30 10 35C10 40 14 46 20 48C34 52 48 46 48 35Z" fill="#FFA500" />
          <polygon points="46,35 62,20 58,35 62,50" fill="#FF5964" />
          <circle cx="20" cy="32" r="3" fill="#1D4E35" />
          <circle cx="19" cy="31" r="1.2" fill="#FFFFFF" />
        </svg>
      )
    case 'armadillo':
      return (
        <svg viewBox="0 0 70 70" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="36" cy="38" rx="22" ry="16" fill="#C97A53" />
          <path d="M22 38C22 28 30 24 42 24C48 24 54 28 54 38" stroke="#8A5A36" strokeWidth="3" fill="none" />
          <circle cx="52" cy="40" r="2.5" fill="#3D200E" />
          <ellipse cx="26" cy="52" rx="4" ry="2.5" fill="#8A5A36" />
          <ellipse cx="46" cy="52" rx="4" ry="2.5" fill="#8A5A36" />
        </svg>
      )
    case 'toucan':
      return <ListeningItemIcon id="toucan" size={size} />
    case 'monkey':
      return <ListeningItemIcon id="monkey" size={size} />
    case 'turtle':
      return <ListeningItemIcon id="turtle" size={size} />
    case 'bear':
      return (
        <svg viewBox="0 0 70 70" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="24" r="8" fill="#7D5738" />
          <circle cx="50" cy="24" r="8" fill="#7D5738" />
          <circle cx="35" cy="38" r="20" fill="#8A5A36" />
          <ellipse cx="35" cy="44" rx="10" ry="8" fill="#EDE0D4" />
          <circle cx="30" cy="36" r="2.5" fill="#2B1704" />
          <circle cx="40" cy="36" r="2.5" fill="#2B1704" />
          <ellipse cx="35" cy="42" rx="3.5" ry="2.5" fill="#2B1704" />
        </svg>
      )
  }
}

/* Viñetas ilustradas de cuentos para J6 */
export const StoryVignette = ({
  illustrationKey,
  size = 110,
}: {
  illustrationKey: string
  size?: number | string
}) => {
  return (
    <svg viewBox="0 0 110 110" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="110" height="110" rx="18" fill="#FFF8F0" stroke="#E8D5C4" strokeWidth="3" />
      {illustrationKey === 'egg-nest' && (
        <g>
          <ellipse cx="55" cy="74" rx="36" ry="16" fill="#BC8A5F" />
          <ellipse cx="55" cy="52" rx="16" ry="22" fill="#FFF9E6" stroke="#D4A373" strokeWidth="2.5" />
          <circle cx="52" cy="48" r="3" fill="#FFE082" />
        </g>
      )}
      {illustrationKey === 'hatched-chick' && (
        <g>
          <ellipse cx="55" cy="76" rx="36" ry="16" fill="#BC8A5F" />
          <circle cx="55" cy="50" r="18" fill="#FFD166" />
          <polygon points="55,50 68,54 55,58" fill="#FF8C42" />
          <circle cx="50" cy="46" r="3" fill="#1D4E35" />
        </g>
      )}
      {illustrationKey === 'flying-bird' && (
        <g>
          {/* Rama con fruta como destino del vuelo */}
          <path d="M76 80C84 74 94 72 106 72" stroke="#8B5A2B" strokeWidth="5" strokeLinecap="round" />
          <circle cx="90" cy="65" r="6" fill="#FF4D6D" />
          {/* Tucán volando hacia la rama */}
          <circle cx="42" cy="50" r="16" fill="#26384C" />
          <path d="M40 38C52 36 68 42 76 50C72 56 58 56 40 52Z" fill="#FFB703" />
          <path d="M28 46C14 34 22 24 38 38Z" fill="#4CC9F0" />
        </g>
      )}
      {illustrationKey === 'eating-bird' && (
        <g>
          {/* Rama donde se posa a comer */}
          <path d="M15 74H95" stroke="#8B5A2B" strokeWidth="5" strokeLinecap="round" />
          {/* Tucán posado disfrutando la fruta */}
          <circle cx="45" cy="50" r="18" fill="#26384C" />
          <path d="M43 40C55 38 72 44 80 52Z" fill="#FFB703" />
          <circle cx="82" cy="52" r="8" fill="#FF4D6D" />
        </g>
      )}
      {illustrationKey === 'seed-ground' && (
        <g>
          <path d="M10 80C30 76 80 76 100 80V100H10V80Z" fill="#654321" />
          <ellipse cx="55" cy="72" rx="9" ry="6" fill="#8B5A2B" />
        </g>
      )}
      {illustrationKey === 'green-sprout' && (
        <g>
          <path d="M10 82C30 78 80 78 100 82V100H10V82Z" fill="#654321" />
          <path d="M55 80V50" stroke="#489B6E" strokeWidth="5" strokeLinecap="round" />
          <path d="M55 56C65 50 72 40 68 30C58 32 54 44 55 56Z" fill="#6EC6A0" />
        </g>
      )}
      {illustrationKey === 'bloomed-flower' && (
        <g>
          <path d="M55 86V54" stroke="#489B6E" strokeWidth="6" strokeLinecap="round" />
          <circle cx="55" cy="40" r="14" fill="#FF5964" />
          <circle cx="42" cy="40" r="11" fill="#FF70A6" />
          <circle cx="68" cy="40" r="11" fill="#FF70A6" />
          <circle cx="55" cy="40" r="9" fill="#FFD166" />
        </g>
      )}
      {illustrationKey === 'butterfly-flower' && (
        <g>
          <circle cx="45" cy="60" r="10" fill="#FF70A6" />
          <g transform="translate(62, 34)">
            <path d="M0 0C-10 -12 -2 -20 8 -8C18 -20 26 -12 16 0C24 6 18 16 8 8C-2 16 -8 6 0 0Z" fill="#4CC9F0" />
            <circle cx="8" cy="0" r="2" fill="#102538" />
          </g>
        </g>
      )}
      {illustrationKey === 'waking-monkey' && (
        <g>
          <circle cx="55" cy="55" r="24" fill="#9C6644" />
          <ellipse cx="55" cy="60" rx="14" ry="12" fill="#EDE0D4" />
          <circle cx="85" cy="30" r="14" fill="#FFD166" />
        </g>
      )}
      {illustrationKey === 'climbing-monkey' && (
        <g>
          {/* Plátanos arriba que el monito trepa para alcanzar */}
          <path d="M52 14C58 16 64 22 62 30C60 24 56 20 52 14Z" fill="#FFD166" />
          <path d="M58 12C64 14 70 20 68 28C66 22 62 18 58 12Z" fill="#FFC72C" />
          {/* Liana y monito trepando hacia ellos */}
          <path d="M30 10C50 40 30 70 50 100" stroke="#489B6E" strokeWidth="6" fill="none" />
          <circle cx="55" cy="48" r="16" fill="#9C6644" />
          <ellipse cx="60" cy="68" rx="14" ry="16" fill="#9C6644" />
        </g>
      )}
      {illustrationKey === 'eating-monkey' && (
        <g>
          {/* Monito compartiendo plátanos */}
          <circle cx="55" cy="52" r="22" fill="#9C6644" />
          <path d="M50 48L72 38C72 44 66 56 52 54Z" fill="#FFD166" />
          <path d="M46 52L68 42C68 48 62 60 48 58Z" fill="#FFC72C" />
        </g>
      )}
      {illustrationKey === 'sleeping-monkey' && (
        <g>
          <rect width="110" height="110" rx="18" fill="#1A2532" />
          <path d="M80 20C75 25 75 35 80 40C85 35 85 25 80 20Z" fill="#FFE066" />
          <circle cx="55" cy="65" r="18" fill="#9C6644" />
          <path d="M48 64C52 68 58 68 62 64" stroke="#EDE0D4" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}

/* Figuras y siluetas para J7 (Sombras y formas) */
export const ShapePiece = ({
  id,
  isShadow = false,
  size = 80,
}: {
  id: string
  isShadow?: boolean
  size?: number | string
}) => {
  const fillColor = isShadow ? '#2B3A42' : undefined
  const strokeColor = isShadow ? '#5A6E78' : undefined

  switch (id) {
    case 'circle':
      return (
        <svg viewBox="0 0 80 80" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="30" fill={fillColor ?? '#FFD166'} stroke={strokeColor} strokeWidth={isShadow ? 3 : 0} strokeDasharray={isShadow ? '6 6' : undefined} />
        </svg>
      )
    case 'square':
      return (
        <svg viewBox="0 0 80 80" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="14" y="14" width="52" height="52" rx="10" fill={fillColor ?? '#4CC9F0'} stroke={strokeColor} strokeWidth={isShadow ? 3 : 0} strokeDasharray={isShadow ? '6 6' : undefined} />
        </svg>
      )
    case 'triangle':
      return (
        <svg viewBox="0 0 80 80" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="40,12 68,66 12,66" fill={fillColor ?? '#FF5964'} stroke={strokeColor} strokeWidth={isShadow ? 3 : 0} strokeDasharray={isShadow ? '6 6' : undefined} />
        </svg>
      )
    case 'star':
      return (
        <svg viewBox="0 0 80 80" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M40 10L48 30H70L52 44L58 64L40 52L22 64L28 44L10 30H32L40 10Z" fill={fillColor ?? '#FFA500'} stroke={strokeColor} strokeWidth={isShadow ? 3 : 0} strokeDasharray={isShadow ? '6 6' : undefined} />
        </svg>
      )
    case 'heart':
      return (
        <svg viewBox="0 0 80 80" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M40 68S12 50 12 28C12 17 21 9 32 9C38 9 40 12 40 12C40 12 42 9 48 9C59 9 68 17 68 28C68 50 40 68 40 68Z" fill={fillColor ?? '#FF70A6'} stroke={strokeColor} strokeWidth={isShadow ? 3 : 0} strokeDasharray={isShadow ? '6 6' : undefined} />
        </svg>
      )
    case 'leaf-shape':
      return (
        <svg viewBox="0 0 80 80" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 60C20 60 25 28 60 20C60 20 60 52 20 60Z" fill={fillColor ?? '#6EC6A0'} stroke={strokeColor} strokeWidth={isShadow ? 3 : 0} strokeDasharray={isShadow ? '6 6' : undefined} />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 80 80" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="28" fill={fillColor ?? '#FFD166'} />
        </svg>
      )
  }
}

