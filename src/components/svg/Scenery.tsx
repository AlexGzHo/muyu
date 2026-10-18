import type { SVGProps } from 'react'

export const TropicalSun = ({ className = '', ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 120 120"
    width="100"
    height="100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Rayos suaves */}
    <g stroke="#FFD166" strokeWidth="6" strokeLinecap="round" opacity="0.8">
      <line x1="60" y1="10" x2="60" y2="22" />
      <line x1="60" y1="98" x2="60" y2="110" />
      <line x1="10" y1="60" x2="22" y2="60" />
      <line x1="98" y1="60" x2="110" y2="60" />
      <line x1="25" y1="25" x2="33" y2="33" />
      <line x1="87" y1="87" x2="95" y2="95" />
      <line x1="25" y1="95" x2="33" y2="87" />
      <line x1="87" y1="33" x2="95" y2="25" />
    </g>
    {/* Disco solar cálido */}
    <circle cx="60" cy="60" r="34" fill="#FFC043" />
    <circle cx="60" cy="60" r="30" fill="#FFE066" />
    {/* Carita sonriente amable */}
    <circle cx="50" cy="55" r="3.5" fill="#8B5A2B" />
    <circle cx="70" cy="55" r="3.5" fill="#8B5A2B" />
    <circle cx="46" cy="62" r="3" fill="#FF9E7D" opacity="0.7" />
    <circle cx="74" cy="62" r="3" fill="#FF9E7D" opacity="0.7" />
    <path
      d="M52 66C55 70 65 70 68 66"
      stroke="#8B5A2B"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
)

export const TropicalHills = ({ className = '', ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 1000 240"
    preserveAspectRatio="none"
    width="100%"
    height="100%"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Colina trasera */}
    <path
      d="M0 120C180 80 340 160 520 110C700 60 840 130 1000 90V240H0V120Z"
      fill="#A8E6CF"
      opacity="0.6"
    />
    {/* Colina intermedia */}
    <path
      d="M0 150C220 110 400 190 620 140C800 100 900 170 1000 140V240H0V150Z"
      fill="#85DDAF"
      opacity="0.8"
    />
    {/* Colina delantera pradera suave */}
    <path
      d="M0 180C260 140 480 210 740 170C880 150 950 180 1000 175V240H0V180Z"
      fill="#6EC6A0"
    />
    {/* Flores silvestres estilizadas */}
    <circle cx="120" cy="205" r="5" fill="#FFD166" />
    <circle cx="120" cy="205" r="2.5" fill="#FF8C42" />
    <circle cx="340" cy="215" r="6" fill="#FF8C42" />
    <circle cx="340" cy="215" r="3" fill="#FFE066" />
    <circle cx="780" cy="210" r="5.5" fill="#FF70A6" />
    <circle cx="780" cy="210" r="2.5" fill="#FFE066" />
    <circle cx="910" cy="218" r="4.5" fill="#FFD166" />
  </svg>
)

export const JungleCanopy = ({ className = '', ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 1000 140"
    preserveAspectRatio="none"
    width="100%"
    height="100%"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Hojas grandes de palma superior izquierda */}
    <path
      d="M-40 -20C40 30 120 70 200 40C160 80 80 90 -40 70V-20Z"
      fill="#4E9F76"
      opacity="0.75"
    />
    <path
      d="M-20 -40C80 20 180 30 260 -10C210 40 120 60 -20 20V-40Z"
      fill="#5FB88A"
      opacity="0.85"
    />
    {/* Hojas superiores derecha */}
    <path
      d="M1040 -20C960 30 880 70 800 40C840 80 920 90 1040 70V-20Z"
      fill="#4E9F76"
      opacity="0.75"
    />
    <path
      d="M1020 -40C920 20 820 30 740 -10C790 40 880 60 1020 20V-40Z"
      fill="#5FB88A"
      opacity="0.85"
    />
  </svg>
)

export const DeepForestBackdrop = ({ className = '', ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 1000 800"
    preserveAspectRatio="xMidYMid slice"
    width="100%"
    height="100%"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <defs>
      <linearGradient id="skyGlow" x1="500" y1="0" x2="500" y2="800" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFF9EB" />
        <stop offset="45%" stopColor="#EAF7EC" />
        <stop offset="100%" stopColor="#D2EED8" />
      </linearGradient>
      <linearGradient id="sunRay1" x1="200" y1="0" x2="400" y2="800" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFEDA6" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#FFEDA6" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="sunRay2" x1="320" y1="0" x2="600" y2="800" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFE494" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#FFE494" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Fondo de cielo con resplandor cálido */}
    <rect width="1000" height="800" fill="url(#skyGlow)" />

    {/* Rayos de sol suaves entre las copas ("God rays") */}
    <polygon points="120,0 220,0 480,800 260,800" fill="url(#sunRay1)" />
    <polygon points="260,0 360,0 720,800 500,800" fill="url(#sunRay2)" />

    {/* Capa 1: Árboles lejanos en bruma (profundidad atmosférica) */}
    <g opacity="0.42">
      <circle cx="80" cy="380" r="140" fill="#95D1AD" />
      <circle cx="220" cy="340" r="160" fill="#88C9A2" />
      <circle cx="420" cy="360" r="150" fill="#95D1AD" />
      <circle cx="640" cy="330" r="170" fill="#88C9A2" />
      <circle cx="840" cy="350" r="150" fill="#95D1AD" />
      <circle cx="960" cy="370" r="140" fill="#88C9A2" />
    </g>

    {/* Capa 2: Árboles medios con troncos estilizados y follaje exuberante */}
    <g opacity="0.75">
      {/* Troncos intermedios */}
      <path d="M120 400L130 800H110L120 400Z" fill="#7D5738" opacity="0.6" />
      <path d="M880 390L895 800H870L880 390Z" fill="#7D5738" opacity="0.6" />
      <circle cx="120" cy="420" r="110" fill="#5EBC86" />
      <circle cx="280" cy="460" r="120" fill="#6EC6A0" />
      <circle cx="740" cy="450" r="125" fill="#6EC6A0" />
      <circle cx="890" cy="410" r="115" fill="#5EBC86" />
    </g>

    {/* Capa 3: Vegetación y árboles en primer plano */}
    <g>
      {/* Tronco izquierdo de ceiba selvática con enredadera */}
      <path
        d="M-20 0C40 260 20 540 -30 800H20C60 540 80 260 30 0H-20Z"
        fill="#6D4327"
        opacity="0.85"
      />
      {/* Enredadera con hojitas en el tronco izquierdo */}
      <path d="M5 120C25 180 15 280 35 360C50 420 30 520 45 640" stroke="#489B6E" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="20" cy="180" r="6" fill="#85DDAF" />
      <circle cx="30" cy="300" r="7" fill="#6EC6A0" />
      <circle cx="38" cy="450" r="8" fill="#FF8C42" />

      {/* Tronco derecho */}
      <path
        d="M1020 0C960 280 980 540 1030 800H980C940 540 920 280 970 0H1020Z"
        fill="#6D4327"
        opacity="0.85"
      />
      <path d="M995 140C975 220 985 320 965 420C950 500 970 600 955 700" stroke="#489B6E" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="980" cy="240" r="7" fill="#FF70A6" />
      <circle cx="965" cy="380" r="6" fill="#FFD166" />
      <circle cx="960" cy="540" r="8" fill="#85DDAF" />
    </g>

    {/* Mariposas y luciérnagas mágicas flotantes */}
    <g opacity="0.85">
      {/* Mariposa celeste izquierda */}
      <g transform="translate(180, 260)">
        <path d="M0 0C-10 -12 -2 -20 8 -8C18 -20 26 -12 16 0C24 6 18 16 8 8C-2 16 -8 6 0 0Z" fill="#4CC9F0" />
        <circle cx="8" cy="0" r="2" fill="#102538" />
      </g>
      {/* Mariposa dorada derecha */}
      <g transform="translate(760, 240)">
        <path d="M0 0C-9 -10 -2 -18 7 -7C16 -18 23 -10 14 0C21 5 16 14 7 7C-2 14 -7 5 0 0Z" fill="#FFB703" />
        <circle cx="7" cy="0" r="1.8" fill="#8B5A2B" />
      </g>
      {/* Luciérnagas doradas cálidas */}
      <circle cx="320" cy="380" r="4.5" fill="#FFF176" opacity="0.9" />
      <circle cx="320" cy="380" r="9" fill="#FFF176" opacity="0.3" />
      <circle cx="680" cy="340" r="4" fill="#FFF176" opacity="0.9" />
      <circle cx="680" cy="340" r="8" fill="#FFF176" opacity="0.3" />
      <circle cx="480" cy="480" r="3.5" fill="#FFF176" opacity="0.8" />
      <circle cx="480" cy="480" r="7" fill="#FFF176" opacity="0.25" />
    </g>
  </svg>
)

