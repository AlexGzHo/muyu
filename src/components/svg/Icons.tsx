import type { SVGProps } from 'react'

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
}

export const PlayIcon = ({ size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M16 10.5C16 8.93 17.72 7.97 19.05 8.79L37.5 20.29C38.79 21.09 38.79 22.91 37.5 23.71L19.05 35.21C17.72 36.03 16 35.07 16 33.5V10.5Z"
      fill="currentColor"
    />
  </svg>
)

export const BackIcon = ({ size = 36, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M22 8L12 18L22 28"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const SoundOnIcon = ({ size = 36, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M7 13H12L19 7V29L12 23H7C5.89543 23 5 22.1046 5 21V15C5 13.8954 5.89543 13 7 13Z"
      fill="currentColor"
    />
    <path
      d="M24 12C26.5 14 28 16 28 18C28 20 26.5 22 24 24"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M28 8C31.5 11 33 14.5 33 18C33 21.5 31.5 25 28 28"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
  </svg>
)

export const SoundOffIcon = ({ size = 36, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M7 13H12L19 7V29L12 23H7C5.89543 23 5 22.1046 5 21V15C5 13.8954 5.89543 13 7 13Z"
      fill="currentColor"
    />
    <line
      x1="24"
      y1="12"
      x2="32"
      y2="24"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <line
      x1="32"
      y1="12"
      x2="24"
      y2="24"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
  </svg>
)

export const SettingsIcon = ({ size = 36, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M18 12C14.6863 12 12 14.6863 12 18C12 21.3137 14.6863 24 18 24C21.3137 24 24 21.3137 24 18C24 14.6863 21.3137 12 18 12Z"
      fill="currentColor"
    />
    <path
      d="M29.5 16.5H27.8C27.5 15.3 27 14.2 26.3 13.2L27.5 12C28.1 11.4 28.1 10.4 27.5 9.8L26.2 8.5C25.6 7.9 24.6 7.9 24 8.5L22.8 9.7C21.8 9 20.7 8.5 19.5 8.2V6.5C19.5 5.7 18.8 5 18 5C17.2 5 16.5 5.7 16.5 6.5V8.2C15.3 8.5 14.2 9 13.2 9.7L12 8.5C11.4 7.9 10.4 7.9 9.8 8.5L8.5 9.8C7.9 10.4 7.9 11.4 8.5 12L9.7 13.2C9 14.2 8.5 15.3 8.2 16.5H6.5C5.7 16.5 5 17.2 5 18C5 18.8 5.7 19.5 6.5 19.5H8.2C8.5 20.7 9 21.8 9.7 22.8L8.5 24C7.9 24.6 7.9 25.6 8.5 26.2L9.8 27.5C10.4 28.1 11.4 28.1 12 27.5L13.2 26.3C14.2 27 15.3 27.5 16.5 27.8V29.5C16.5 30.3 17.2 31 18 31C18.8 31 19.5 30.3 19.5 29.5V27.8C20.7 27.5 21.8 27 22.8 26.3L24 27.5C24.6 28.1 25.6 28.1 26.2 27.5L27.5 26.2C28.1 25.6 28.1 24.6 27.5 24L26.3 22.8C27 21.8 27.5 20.7 27.8 19.5H29.5C30.3 19.5 31 18.8 31 18C31 17.2 30.3 16.5 29.5 16.5Z"
      stroke="currentColor"
      strokeWidth="2.5"
    />
  </svg>
)

export const FoodFruitIcon = ({ size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <ellipse cx="24" cy="27" rx="15" ry="16" fill="#FFA500" />
    <path
      d="M14 26C14 18 20 13 28 15C34 16.5 37 23 35 30C33 37 25 41 18 38C15 36 14 31 14 26Z"
      fill="#FF6B4A"
    />
    <ellipse cx="20" cy="22" rx="4" ry="7" transform="rotate(-20 20 22)" fill="#FFD166" opacity="0.6" />
    <path d="M24 13C24 9 27 6 29 5" stroke="#654321" strokeWidth="3" strokeLinecap="round" />
    <path
      d="M26 10C31 8 36 10 37 13C36 16 31 17 26 15C25.5 13 25.5 11.5 26 10Z"
      fill="#6EC6A0"
    />
  </svg>
)

export const BasketGameIcon = ({ size = 56, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="21" cy="20" r="9" fill="#FF5964" />
    <circle cx="34" cy="19" r="8.5" fill="#FFB703" />
    <circle cx="28" cy="15" r="7" fill="#8AC926" />
    <path
      d="M12 25H44L40 46C39.6 48.2 37.7 49.8 35.5 49.8H20.5C18.3 49.8 16.4 48.2 16 46L12 25Z"
      fill="#D4A373"
    />
    <path d="M10 25H46" stroke="#9A7B56" strokeWidth="4" strokeLinecap="round" />
    <path d="M19 26V48" stroke="#BC8A5F" strokeWidth="2.5" />
    <path d="M28 26V49" stroke="#BC8A5F" strokeWidth="2.5" />
    <path d="M37 26V48" stroke="#BC8A5F" strokeWidth="2.5" />
    <path d="M14 36H42" stroke="#BC8A5F" strokeWidth="2.5" />
    <path
      d="M16 25C16 14 21 8 28 8C35 8 40 14 40 25"
      stroke="#9A7B56"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
)

export const PlantGameIcon = ({ size = 56, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="41" cy="15" r="7" fill="#FFD166" />
    <path d="M41 5V7M41 23V25M31 15H33M49 15H51" stroke="#FFA500" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M16 35H40L37 49C36.8 50.1 35.8 51 34.7 51H21.3C20.2 51 19.2 50.1 19 49L16 35Z" fill="#C97A53" />
    <path d="M14 35H42" stroke="#9E5434" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M28 35V22" stroke="#489B6E" strokeWidth="4" strokeLinecap="round" />
    <path
      d="M28 24C34 22 38 16 37 11C32 11 28 17 28 24Z"
      fill="#6EC6A0"
    />
    <path
      d="M28 29C22 28 18 23 19 18C24 18 28 23 28 29Z"
      fill="#85DDAF"
    />
    <path
      d="M13 14C13 17 15 19 17 19C19 19 21 17 21 14C21 11 17 7 17 7C17 7 13 11 13 14Z"
      fill="#4CC9F0"
    />
  </svg>
)

export const ListenGameIcon = ({ size = 56, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M13 28C13 19.7 19.7 13 28 13C36.3 13 43 19.7 43 28"
      stroke="#FF8C42"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
    <rect x="9" y="27" width="9" height="15" rx="4.5" fill="#FF8C42" />
    <rect x="38" y="27" width="9" height="15" rx="4.5" fill="#FF8C42" />
    <circle cx="28" cy="29" r="6" fill="#FFD166" />
    <path
      d="M28 21V37M20 29H36"
      stroke="#FF6B4A"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
)

export const PatternsGameIcon = ({ size = 56, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Secuencia visual AB-A */}
    <rect x="8" y="16" width="16" height="16" rx="4" fill="#FF5964" />
    <circle cx="34" cy="24" r="8" fill="#FFD166" />
    <rect x="18" y="32" width="16" height="16" rx="4" fill="#FF5964" />
    <circle cx="42" cy="40" r="7" stroke="#489B6E" strokeWidth="3" strokeDasharray="4 4" fill="none" />
  </svg>
)

export const HabitatsGameIcon = ({ size = 56, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Selva, río y montaña */}
    <circle cx="28" cy="28" r="23" fill="#D8F3DC" />
    <path d="M12 38C18 34 24 35 30 38C36 41 42 40 46 37V48H12V38Z" fill="#52B788" />
    <path d="M18 38C22 30 26 22 28 17C30 22 34 30 38 38" fill="#40916C" />
    <circle cx="39" cy="18" r="5" fill="#FFD166" />
  </svg>
)

export const StoriesGameIcon = ({ size = 56, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Libro de viñetas secuenciales */}
    <rect x="10" y="14" width="36" height="28" rx="4" fill="#FFE8D6" stroke="#DDA15E" strokeWidth="3" />
    <line x1="28" y1="14" x2="28" y2="42" stroke="#DDA15E" strokeWidth="3" />
    <circle cx="19" cy="23" r="4" fill="#FF8C42" />
    <path d="M15 34H23" stroke="#BC6C25" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="37" cy="23" r="4" fill="#6EC6A0" />
    <path d="M33 34H41" stroke="#BC6C25" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)

export const ShadowsGameIcon = ({ size = 56, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Objeto colorido y su silueta gemela */}
    <circle cx="20" cy="28" r="13" fill="#2D3142" opacity="0.35" />
    <circle cx="36" cy="28" r="13" fill="#FFB703" />
    <path d="M36 21L38 26L43 27L39 31L40 36L36 33L32 36L33 31L29 27L34 26L36 21Z" fill="#FFF" />
  </svg>
)

export const AlbumIcon = ({ size = 40, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Álbum ilustrado de medallas */}
    <rect x="7" y="6" width="26" height="28" rx="4" fill="#FFF" stroke="#489B6E" strokeWidth="3" />
    <path d="M12 6V34" stroke="#489B6E" strokeWidth="3" strokeDasharray="3 3" />
    <circle cx="23" cy="18" r="6" fill="#FFD166" />
    <path d="M23 13L24.5 16.5L28 17L25.5 19.5L26 23L23 21L20 23L20.5 19.5L18 17L21.5 16.5L23 13Z" fill="#FF8C42" />
  </svg>
)

export const StarIcon = ({ size = 28, filled = true, ...props }: IconProps & { filled?: boolean }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M14 2L17.5 9.5L25.5 10.5L19.5 16L21 24L14 20L7 24L8.5 16L2.5 10.5L10.5 9.5L14 2Z"
      fill={filled ? '#FFD166' : '#E0D6CE'}
      stroke={filled ? '#FFA500' : '#C7B8AD'}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
)

export const HeartIcon = ({ size = 32, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M16 28S4 20 4 11C4 6.5 7.5 3 12 3C14.5 3 15.8 4.2 16 4.5C16.2 4.2 17.5 3 20 3C24.5 3 28 6.5 28 11C28 20 16 28 16 28Z"
      fill="#FF4D6D"
    />
  </svg>
)

export const SparkleIcon = ({ size = 28, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M14 0L17.5 10.5L28 14L17.5 17.5L14 28L10.5 17.5L0 14L10.5 10.5L14 0Z"
      fill="#FFD166"
    />
  </svg>
)

export const SproutStageIcon = ({ size = 28, active = false, ...props }: IconProps & { active?: boolean }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="14" cy="14" r="13" fill={active ? '#6EC6A0' : '#E8D5C4'} />
    <path
      d="M14 20V12M14 12C14 8 18 7 19 7C20 10 18 12 14 12ZM14 14C14 10 10 9 9 9C8 12 10 14 14 14Z"
      stroke={active ? '#FFFFFF' : '#A88E7B'}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const TreeIcon = ({ size = 32, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="13.5" y="19" width="5" height="10" rx="1.5" fill="#8B5A2B" />
    <circle cx="16" cy="12" r="9" fill="#489B6E" />
    <circle cx="11" cy="14" r="6" fill="#3D8B60" />
    <circle cx="21" cy="14" r="6" fill="#58AC7E" />
  </svg>
)

export const RepeatIcon = ({ size = 36, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M28 14C26.5 9.5 22 6 17 6C10.9 6 6 10.9 6 17C6 23.1 10.9 28 17 28C22.2 28 26.5 24.4 27.7 19.5"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M22 14H29V7"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const MedalBadgeIcon = ({ size = 36, unlocked = true, ...props }: IconProps & { unlocked?: boolean }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 4L18 16L24 4H12Z"
      fill={unlocked ? '#FF8C42' : '#C7B8AD'}
    />
    <path
      d="M7 4L13 16L10 4H7Z"
      fill={unlocked ? '#E66A1F' : '#A8998E'}
    />
    <path
      d="M29 4L23 16L26 4H29Z"
      fill={unlocked ? '#E66A1F' : '#A8998E'}
    />
    <circle
      cx="18"
      cy="23"
      r="10"
      fill={unlocked ? '#FFD166' : '#E8DFD8'}
      stroke={unlocked ? '#FFA500' : '#B5A599'}
      strokeWidth="2.5"
    />
    <path
      d="M18 17L19.5 21L23.5 21.5L20.5 24.2L21.3 28.2L18 26L14.7 28.2L15.5 24.2L12.5 21.5L16.5 21L18 17Z"
      fill={unlocked ? '#FF8C42' : '#8A7A6E'}
    />
  </svg>
)

export const ShopIcon = ({ size = 36, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Toldo a rayas */}
    <path
      d="M4 14L7 6H29L32 14H4Z"
      fill="#FF7A00"
      stroke="#D95F00"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M11 6L9 14M18 6V14M25 6L27 14" stroke="#FFE3A8" strokeWidth="2.5" />
    {/* Ondeado inferior del toldo */}
    <path
      d="M4 14C5.5 16 8.5 16 10 14C11.5 16 14.5 16 16 14C17.5 16 20.5 16 22 14C23.5 16 26.5 16 28 14C29.5 16 32 15 32 14"
      stroke="#D95F00"
      strokeWidth="2"
      fill="none"
    />
    {/* Estructura tienda */}
    <rect
      x="6"
      y="15"
      width="24"
      height="15"
      rx="2"
      fill="#FFF4E0"
      stroke="#B36B34"
      strokeWidth="2"
    />
    {/* Puerta/mostrador */}
    <rect x="13" y="20" width="10" height="10" rx="1.5" fill="#489B6E" />
    <circle cx="21" cy="25" r="1.2" fill="#FFE066" />
  </svg>
)

export const CoinIcon = ({ size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="12" cy="12" r="10" fill="#FFB703" stroke="#D48B00" strokeWidth="2" />
    <circle cx="12" cy="12" r="7.5" fill="#FFD166" />
    <polygon
      points="12,7 13.5,10.5 17,11 14.5,13.5 15,17 12,15.2 9,17 9.5,13.5 7,11 10.5,10.5"
      fill="#FB8500"
    />
  </svg>
)

export const HelpQuestionIcon = ({ size = 28, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="16" cy="16" r="13" fill="#E8F8F0" stroke="#489B6E" strokeWidth="2.5" />
    <path
      d="M12.5 12C12.5 10 14 8.5 16 8.5C18 8.5 19.5 10 19.5 11.5C19.5 13.5 16 14.5 16 17"
      stroke="#489B6E"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="21.5" r="1.5" fill="#489B6E" />
  </svg>
)

export const CloseIcon = ({ size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="12" cy="12" r="10" fill="#F4EBE2" />
    <path
      d="M8.5 8.5L15.5 15.5M15.5 8.5L8.5 15.5"
      stroke="#7A5C4A"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
)

export const CheckmarkIcon = ({ size = 20, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="10" cy="10" r="9" fill="#6EC6A0" />
    <path
      d="M6 10.5L8.8 13.2L14 7.5"
      stroke="#FFFFFF"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const QuestionBadgeIcon = ({ size = 44, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 44 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="4" y="4" width="36" height="36" rx="12" fill="#FFF9ED" stroke="#FFB703" strokeWidth="2.5" />
    <path
      d="M17 18C17 15.2 19.2 13 22 13C24.8 13 27 15.2 27 17.5C27 20.5 22 21.8 22 25"
      stroke="#D48B00"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="22" cy="30.5" r="2" fill="#D48B00" />
  </svg>
)




