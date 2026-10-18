import type { SVGProps } from 'react'
import type { GrowthStage, PetId, PetReaction } from '../../game/types'

export interface PetIllustrationProps extends SVGProps<SVGSVGElement> {
  stage?: GrowthStage
  reaction?: PetReaction
  size?: number | string
}

/* ============================================================
   1. MONO (Monkey) — Cálido, curioso y juguetón
   4 formas anatómicas (bebé, brote, explorador, adulto)
   4 reacciones (idle, happy, eating, petting)
   ============================================================ */
export const MonkeyIllustration = ({
  stage = 'baby',
  reaction = 'none',
  size = 200,
  className = '',
  ...props
}: PetIllustrationProps) => {
  const isBaby = stage === 'baby'
  const isSprout = stage === 'sprout'
  const isYoung = stage === 'young'
  const isAdult = stage === 'adult'

  const isHappy = reaction === 'happy' || reaction === 'tap'
  const isPetting = reaction === 'petting' || reaction === 'pet'
  const isEating = reaction === 'eating' || reaction === 'feed'

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* 1. COLA ANATÓMICA ESPECÍFICA POR ETAPA */}
      {isBaby && (
        // Bebé: colita corta y curvada tierna
        <path
          d="M68 152C50 152 42 140 46 128C48 122 56 122 56 128"
          stroke="#8A5A36"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {isSprout && (
        // Brote: cola en "S" activa y curiosa
        <path
          d="M62 148C40 148 28 132 35 116C40 104 54 104 55 116C56 124 48 132 38 130"
          stroke="#8A5A36"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {isYoung && (
        // Explorador: cola prensil trepadora en espiral alta
        <path
          d="M58 144C32 144 18 122 24 96C28 78 48 76 54 90C58 102 46 116 32 112"
          stroke="#8A5A36"
          strokeWidth="10.5"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {isAdult && (
        // Adulto: cola gruesa, estilizada y majestuosa
        <path
          d="M56 142C26 142 12 116 20 86C26 64 52 62 58 80C64 96 48 112 30 106"
          stroke="#7F4F24"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
        />
      )}

      {/* 2. CUERPO Y TORSO SEGÚN ETAPA ANATÓMICA */}
      {isBaby && (
        // Bebé: torso pequeño, redondito y tierno (proporción 1:1 con la cabeza)
        <ellipse cx="100" cy="144" rx="32" ry="33" fill="#9C6644" />
      )}
      {isSprout && (
        // Brote: cuerpo en desarrollo, más estilizado
        <ellipse cx="100" cy="138" rx="36" ry="38" fill="#9C6644" />
      )}
      {isYoung && (
        // Explorador: torso atlético con postura ágil
        <ellipse cx="100" cy="136" rx="40" ry="41" fill="#9C6644" />
      )}
      {isAdult && (
        // Adulto: pecho ancho, robusto y seguro
        <ellipse cx="100" cy="134" rx="46" ry="46" fill="#9C6644" />
      )}

      {/* Pelaje de hombros en etapa adulta */}
      {isAdult && (
        <>
          <path d="M52 122C46 128 48 138 56 140C62 136 62 126 52 122Z" fill="#7F4F24" />
          <path d="M148 122C154 128 152 138 144 140C138 136 138 126 148 122Z" fill="#7F4F24" />
        </>
      )}

      {/* Barriga suave */}
      <ellipse
        cx="100"
        cy={isBaby ? 147 : isSprout ? 142 : isYoung ? 140 : 138}
        rx={isBaby ? 20 : isSprout ? 24 : isYoung ? 27 : 31}
        ry={isBaby ? 22 : isSprout ? 26 : isYoung ? 29 : 33}
        fill="#EDE0D4"
      />

      {/* 3. PATAS TRASERAS */}
      <ellipse
        cx={isBaby ? "74" : isSprout ? "70" : isYoung ? "66" : "62"}
        cy={isBaby ? "172" : "172"}
        rx={isBaby ? "13" : isSprout ? "15" : isYoung ? "16" : "18"}
        ry={isBaby ? "8.5" : isSprout ? "9.5" : isYoung ? "10.5" : "11.5"}
        fill="#7F4F24"
      />
      <ellipse
        cx={isBaby ? "126" : isSprout ? "130" : isYoung ? "134" : "138"}
        cy={isBaby ? "172" : "172"}
        rx={isBaby ? "13" : isSprout ? "15" : isYoung ? "16" : "18"}
        ry={isBaby ? "8.5" : isSprout ? "9.5" : isYoung ? "10.5" : "11.5"}
        fill="#7F4F24"
      />

      {/* 4. BRAZOS Y REACCIONES */}
      {isEating ? (
        // Comiendo: manitas sosteniendo la fruta en la boca
        <>
          <path d="M68 138C76 124 88 114 94 108" stroke="#8A5A36" strokeWidth={isBaby ? "8" : "10"} strokeLinecap="round" />
          <path d="M132 138C124 124 112 114 106 108" stroke="#8A5A36" strokeWidth={isBaby ? "8" : "10"} strokeLinecap="round" />
          {/* Mini fruta sabrosa */}
          <circle cx="100" cy="106" r="10" fill="#FFA500" />
          <circle cx="98" cy="104" r="8" fill="#FF6B4A" />
          <path d="M100 97C101 93 104 91 106 91" stroke="#654321" strokeWidth="2" strokeLinecap="round" />
          <path d="M102 94C105 92 108 94 108 96C106 98 103 98 102 94Z" fill="#6EC6A0" />
        </>
      ) : isHappy ? (
        // Feliz: brazos levantados saludando
        <>
          <path d="M68 135C50 112 46 92 60 84" stroke="#8A5A36" strokeWidth={isBaby ? "8.5" : isAdult ? "11" : "10"} strokeLinecap="round" />
          <path d="M132 135C150 112 154 92 140 84" stroke="#8A5A36" strokeWidth={isBaby ? "8.5" : isAdult ? "11" : "10"} strokeLinecap="round" />
        </>
      ) : isPetting ? (
        // Acariciado: manos tocando su barriga con ternura
        <>
          <path d="M68 135C78 142 88 145 92 144" stroke="#8A5A36" strokeWidth={isBaby ? "8" : "9.5"} strokeLinecap="round" />
          <path d="M132 135C122 142 112 145 108 144" stroke="#8A5A36" strokeWidth={isBaby ? "8" : "9.5"} strokeLinecap="round" />
        </>
      ) : (
        // Reposo / Idle: brazos descansando
        <>
          <path d="M68 135C56 145 56 158 64 166" stroke="#8A5A36" strokeWidth={isBaby ? "8" : isAdult ? "10.5" : "9.5"} strokeLinecap="round" />
          <path d="M132 135C144 145 144 158 136 166" stroke="#8A5A36" strokeWidth={isBaby ? "8" : isAdult ? "10.5" : "9.5"} strokeLinecap="round" />
        </>
      )}

      {/* Pañuelo bandana de explorador (solo en etapa young) */}
      {isYoung && (
        <g>
          <path d="M78 106C88 116 112 116 122 106L100 120Z" fill="#489B6E" />
          <path d="M120 108C126 110 130 116 126 122C123 120 121 114 120 108Z" fill="#3A8A5F" />
        </g>
      )}

      {/* 5. OREJAS */}
      <circle cx={isBaby ? "48" : "50"} cy="80" r={isBaby ? "22" : isSprout ? "20" : isYoung ? "19" : "21"} fill="#9C6644" />
      <circle cx={isBaby ? "48" : "50"} cy="80" r={isBaby ? "13" : isSprout ? "12" : isYoung ? "11" : "13"} fill="#EDE0D4" />
      <circle cx={isBaby ? "152" : "150"} cy="80" r={isBaby ? "22" : isSprout ? "20" : isYoung ? "19" : "21"} fill="#9C6644" />
      <circle cx={isBaby ? "152" : "150"} cy="80" r={isBaby ? "13" : isSprout ? "12" : isYoung ? "11" : "13"} fill="#EDE0D4" />

      {/* 6. CABEZA ANATÓMICA */}
      <circle
        cx="100"
        cy={isBaby ? "76" : "80"}
        r={isBaby ? "45" : isSprout ? "41" : isYoung ? "39" : "44"}
        fill="#9C6644"
      />

      {/* Mascarilla facial clara en corazón doble */}
      <ellipse cx={isBaby ? "86" : "87"} cy={isBaby ? "73" : "76"} rx={isBaby ? "19" : "18"} ry={isBaby ? "22" : "21"} fill="#EDE0D4" />
      <ellipse cx={isBaby ? "114" : "113"} cy={isBaby ? "73" : "76"} rx={isBaby ? "19" : "18"} ry={isBaby ? "22" : "21"} fill="#EDE0D4" />
      <ellipse cx="100" cy={isBaby ? "88" : "92"} rx={isBaby ? "22" : "22"} ry={isBaby ? "17" : "16"} fill="#EDE0D4" />

      {/* 7. OJOS SEGÚN REACCIÓN */}
      {isPetting ? (
        // Ojos semicirculares tiernos ^ ^
        <>
          <path d="M80 73C84 68 92 68 96 73" stroke="#4A2810" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M104 73C108 68 116 68 120 73" stroke="#4A2810" strokeWidth="3.5" strokeLinecap="round" />
        </>
      ) : isEating ? (
        // Ojos cerrados de placer degustando
        <>
          <path d="M80 75C85 71 93 71 97 75" stroke="#4A2810" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M103 75C107 71 115 71 120 75" stroke="#4A2810" strokeWidth="3.2" strokeLinecap="round" />
        </>
      ) : (
        // Ojos abiertos brillantes con catchlights
        <>
          <circle cx="87" cy={isBaby ? "72" : "74"} r={isBaby ? "7.5" : "6.8"} fill="#3D200E" />
          <circle cx="85" cy={isBaby ? "70" : "72"} r="2.8" fill="#FFFFFF" />
          <circle cx="113" cy={isBaby ? "72" : "74"} r={isBaby ? "7.5" : "6.8"} fill="#3D200E" />
          <circle cx="111" cy={isBaby ? "70" : "72"} r="2.8" fill="#FFFFFF" />
        </>
      )}

      {/* Nariz */}
      <ellipse cx="100" cy={isBaby ? "82" : "85"} rx="4" ry="3" fill="#583115" />

      {/* Boca según reacción */}
      {isEating ? (
        // Boca masticando feliz
        <ellipse cx="100" cy={isBaby ? "89" : "93"} rx="5" ry="4" fill="#D94E4E" stroke="#583115" strokeWidth="1.8" />
      ) : isHappy ? (
        // Gran sonrisa abierta con lengua
        <path
          d={isBaby ? "M92 88C92 98 108 98 108 88H92Z" : "M91 92C91 102 109 102 109 92H91Z"}
          fill="#D94E4E"
          stroke="#583115"
          strokeWidth="2"
        />
      ) : (
        // Sonrisa amable
        <path
          d={isBaby ? "M94 88C97 92 103 92 106 88" : "M93 92C96 96 104 96 107 92"}
          stroke="#583115"
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}

      {/* Mejillas sonrojadas */}
      <ellipse cx="77" cy={isBaby ? "83" : "86"} rx={isPetting || isEating ? "6" : "4.5"} ry="3.5" fill="#FF9E7D" opacity="0.75" />
      <ellipse cx="123" cy={isBaby ? "83" : "86"} rx={isPetting || isEating ? "6" : "4.5"} ry="3.5" fill="#FF9E7D" opacity="0.75" />

      {/* 8. ATRIBUTO DISTINTIVO EN LA CABEZA SEGÚN ETAPA */}
      {isBaby && (
        // Bebé: pequeño mechón infantil tierno
        <path d="M100 34C96 28 104 26 102 33" stroke="#8A5A36" strokeWidth="3.5" strokeLinecap="round" />
      )}
      {isSprout && (
        // Brote: dos mechones juveniles erizados
        <g>
          <path d="M96 38C90 28 100 28 98 37" stroke="#8A5A36" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M103 38C108 27 116 30 106 37" stroke="#8A5A36" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      )}
      {isYoung && (
        // Explorador: mechón estilizado hacia adelante
        <path d="M95 40C88 28 102 24 108 34C114 26 122 30 112 40" fill="#7F4F24" />
      )}
      {isAdult && (
        // Adulto: corona selvática de hojas y flor solar dorada
        <g>
          <path d="M78 40C82 30 94 32 92 44" fill="#489B6E" />
          <path d="M94 36C98 26 108 28 106 40" fill="#6EC6A0" />
          <path d="M108 38C116 30 124 34 118 44" fill="#489B6E" />
          <circle cx="100" cy="42" r="5.5" fill="#FFD166" stroke="#FFA500" strokeWidth="1.5" />
        </g>
      )}
    </svg>
  )
}

/* ============================================================
   2. TORTUGA (Turtle) — Dulce, paciente y colorida
   4 formas anatómicas (bebé lisa, brote con placas, exploradora hexagonal, adulta de gran volumen con flor)
   4 reacciones (idle, happy, eating, petting)
   ============================================================ */
export const TurtleIllustration = ({
  stage = 'baby',
  reaction = 'none',
  size = 200,
  className = '',
  ...props
}: PetIllustrationProps) => {
  const isBaby = stage === 'baby'
  const isSprout = stage === 'sprout'
  const isYoung = stage === 'young'
  const isAdult = stage === 'adult'

  const isHappy = reaction === 'happy' || reaction === 'tap'
  const isPetting = reaction === 'petting' || reaction === 'pet'
  const isEating = reaction === 'eating' || reaction === 'feed'

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* 1. COLITA SEGÚN ETAPA */}
      <path
        d={isBaby ? "M100 170L100 178" : isSprout ? "M100 170L100 182" : isYoung ? "M100 168L100 184" : "M100 166L100 186"}
        stroke="#489B6E"
        strokeWidth={isBaby ? "4" : isSprout ? "6" : isYoung ? "7" : "8"}
        strokeLinecap="round"
      />

      {/* 2. PATAS / ALETAS TRASERAS */}
      <ellipse
        cx={isBaby ? "68" : isSprout ? "64" : isYoung ? "60" : "56"}
        cy="156"
        rx={isBaby ? "13" : isSprout ? "15" : isYoung ? "17" : "19"}
        ry={isBaby ? "9" : isSprout ? "10.5" : isYoung ? "12" : "13.5"}
        transform={`rotate(-25 ${isBaby ? 68 : isSprout ? 64 : isYoung ? 60 : 56} 156)`}
        fill="#58B283"
      />
      <ellipse
        cx={isBaby ? "132" : isSprout ? "136" : isYoung ? "140" : "144"}
        cy="156"
        rx={isBaby ? "13" : isSprout ? "15" : isYoung ? "17" : "19"}
        ry={isBaby ? "9" : isSprout ? "10.5" : isYoung ? "12" : "13.5"}
        transform={`rotate(25 ${isBaby ? 132 : isSprout ? 136 : isYoung ? 140 : 144} 156)`}
        fill="#58B283"
      />

      {/* 3. ALETAS DELANTERAS SEGÚN REACCIÓN Y ETAPA */}
      {isHappy ? (
        // Aletas arriba saludando alegremente
        <>
          <ellipse cx="44" cy="98" rx="20" ry="12" transform="rotate(-40 44 98)" fill="#68C795" />
          <ellipse cx="156" cy="98" rx="20" ry="12" transform="rotate(40 156 98)" fill="#68C795" />
        </>
      ) : isEating ? (
        // Comiendo: aletas cerca de la boca sosteniendo comidita
        <>
          <ellipse cx="56" cy="96" rx="18" ry="11" transform="rotate(-10 56 96)" fill="#68C795" />
          <ellipse cx="144" cy="96" rx="18" ry="11" transform="rotate(10 144 96)" fill="#68C795" />
          {/* Hojita / fruta sabrosa */}
          <path d="M96 82C90 76 96 70 102 70C108 70 110 78 100 84Z" fill="#85DDAF" />
        </>
      ) : (
        // Reposo / Acariciado: aletas a los costados
        <>
          <ellipse
            cx={isBaby ? "52" : isSprout ? "48" : isYoung ? "44" : "40"}
            cy="118"
            rx={isBaby ? "15" : isSprout ? "18" : isYoung ? "21" : "23"}
            ry={isBaby ? "10" : isSprout ? "11.5" : isYoung ? "13" : "14"}
            transform={`rotate(-15 ${isBaby ? 52 : isSprout ? 48 : isYoung ? 44 : 40} 118)`}
            fill="#58B283"
          />
          <ellipse
            cx={isBaby ? "148" : isSprout ? "152" : isYoung ? "156" : "160"}
            cy="118"
            rx={isBaby ? "15" : isSprout ? "18" : isYoung ? "21" : "23"}
            ry={isBaby ? "10" : isSprout ? "11.5" : isYoung ? "13" : "14"}
            transform={`rotate(15 ${isBaby ? 148 : isSprout ? 152 : isYoung ? 156 : 160} 118)`}
            fill="#58B283"
          />
        </>
      )}

      {/* Escamas turquesas en aletas de exploradora y adulta */}
      {(isYoung || isAdult) && (
        <>
          <circle cx="48" cy="116" r="2.5" fill="#74D89E" />
          <circle cx="152" cy="116" r="2.5" fill="#74D89E" />
        </>
      )}

      {/* 4. CAPARAZÓN ANATÓMICO DIFERENCIADO EN 4 FORMAS */}
      {isBaby && (
        // Bebé: caparazón pequeño, liso y redondeado sin placas duras (recién nacida)
        <g>
          <ellipse cx="100" cy="134" rx="44" ry="40" fill="#3A8A5F" />
          <ellipse cx="100" cy="136" rx="40" ry="36" fill="#4EA875" />
          <ellipse cx="100" cy="137" rx="34" ry="29" fill="#5EBC86" opacity="0.6" />
        </g>
      )}
      {isSprout && (
        // Brote: caparazón con borde y 3 placas centrales sencillas
        <g>
          <ellipse cx="100" cy="130" rx="49" ry="44" fill="#3A8A5F" />
          <ellipse cx="100" cy="132" rx="45" ry="40" fill="#4EA875" />
          {/* Rombo central */}
          <polygon points="100,116 112,128 100,140 88,128" fill="#74D89E" stroke="#3A8A5F" strokeWidth="2" />
          <path d="M100 116V104M112 128L128 126M100 140V152M88 128L72 126" stroke="#3A8A5F" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
      {isYoung && (
        // Exploradora: caparazón aerodinámico con patrón geométrico hexagonal completo
        <g>
          <ellipse cx="100" cy="126" rx="53" ry="48" fill="#2E704D" />
          <ellipse cx="100" cy="128" rx="49" ry="44" fill="#4EA875" />
          {/* Hexágono central y placas radiales */}
          <polygon points="100,110 116,120 116,138 100,148 84,138 84,120" fill="#74D89E" stroke="#2E704D" strokeWidth="2.5" />
          <path
            d="M100 110V96M116 120L134 114M116 138L132 150M100 148V162M84 138L68 150M84 120L66 114"
            stroke="#2E704D"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      )}
      {isAdult && (
        // Adulta: caparazón volumétrico robusto con doble ribete y diseño ornamental de placas talladas
        <g>
          <ellipse cx="100" cy="122" rx="58" ry="52" fill="#265B3E" />
          <ellipse cx="100" cy="124" rx="54" ry="48" fill="#3D8E63" />
          <ellipse cx="100" cy="125" rx="50" ry="44" fill="#4EA875" />
          {/* Gran mosaico hexagonal concéntrico */}
          <polygon points="100,104 120,116 120,138 100,150 80,138 80,116" fill="#8BE3B0" stroke="#265B3E" strokeWidth="3" />
          <polygon points="100,112 113,121 113,134 100,142 87,134 87,121" fill="#60C890" stroke="#265B3E" strokeWidth="1.5" />
          <path
            d="M100 104V90M120 116L142 110M120 138L140 152M100 150V164M80 138L60 152M80 116L58 110"
            stroke="#265B3E"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* 5. CABEZA ANATÓMICA SEGÚN ETAPA */}
      <ellipse
        cx="100"
        cy={isPetting ? "74" : isBaby ? "70" : isSprout ? "68" : isYoung ? "66" : "64"}
        rx={isBaby ? "30" : isSprout ? "31" : isYoung ? "30" : "32"}
        ry={isBaby ? "28" : isSprout ? "27" : isYoung ? "26" : "28"}
        fill="#6EC6A0"
      />

      {/* 6. OJOS SEGÚN REACCIÓN */}
      {isPetting ? (
        // Ojos en arcos felices ^ ^
        <>
          <path d="M86 64C90 59 96 59 100 64" stroke="#1D4E35" strokeWidth="3" strokeLinecap="round" />
          <path d="M104 64C108 59 114 59 118 64" stroke="#1D4E35" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : isEating ? (
        // Ojos cerrados de deleite
        <>
          <path d="M86 66C90 62 96 62 100 66" stroke="#1D4E35" strokeWidth="3" strokeLinecap="round" />
          <path d="M104 66C108 62 114 62 118 66" stroke="#1D4E35" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        // Ojos abiertos y simpáticos
        <>
          <circle cx="89" cy="64" r={isBaby ? "6.8" : "6"} fill="#1D4E35" />
          <circle cx="87.5" cy="62" r={isBaby ? "2.6" : "2.2"} fill="#FFFFFF" />
          <circle cx="111" cy="64" r={isBaby ? "6.8" : "6"} fill="#1D4E35" />
          <circle cx="109.5" cy="62" r={isBaby ? "2.6" : "2.2"} fill="#FFFFFF" />
        </>
      )}

      {/* 7. BOCA SEGÚN REACCIÓN */}
      {isEating ? (
        // Boquita masticando con migajita
        <ellipse cx="100" cy="74" rx="4" ry="3" fill="#D94E4E" stroke="#1D4E35" strokeWidth="1.5" />
      ) : isHappy ? (
        // Sonrisa grande abierta
        <path d="M92 73C94 80 106 80 108 73" stroke="#1D4E35" strokeWidth="3" strokeLinecap="round" fill="#D94E4E" />
      ) : (
        // Sonrisa apacible
        <path d="M95 73C98 76 102 76 105 73" stroke="#1D4E35" strokeWidth="2.5" strokeLinecap="round" />
      )}

      {/* Mejillas rosaditas */}
      <circle cx="82" cy="70" r={isPetting || isEating ? "5" : "4"} fill="#FF9E7D" opacity="0.65" />
      <circle cx="118" cy="70" r={isPetting || isEating ? "5" : "4"} fill="#FF9E7D" opacity="0.65" />

      {/* 8. ATRIBUTO DISTINTIVO DE ETAPA */}
      {isAdult && (
        // Adulta: hermosa flor de loto tropical en la cabeza
        <g>
          <ellipse cx="118" cy="46" rx="7" ry="5" fill="#FF70A6" transform="rotate(-15 118 46)" />
          <ellipse cx="126" cy="48" rx="6" ry="4.5" fill="#FF85B2" transform="rotate(20 126 48)" />
          <circle cx="121" cy="48" r="4" fill="#FFD166" />
          <circle cx="121" cy="48" r="2" fill="#FFFFFF" />
        </g>
      )}
      {isYoung && (
        // Exploradora: marca de concha aventurera
        <path d="M98 48C100 42 104 42 106 48" stroke="#489B6E" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  )
}

/* ============================================================
   3. TUCÁN (Toucan) — Exótico, alegre y vivaz
   4 formas anatómicas (bebé pico corto, brote 2 colores, explorador pico 3 franjas con vuelo, adulto majestuoso)
   4 reacciones (idle, happy, eating, petting)
   ============================================================ */
export const ToucanIllustration = ({
  stage = 'baby',
  reaction = 'none',
  size = 200,
  className = '',
  ...props
}: PetIllustrationProps) => {
  const isBaby = stage === 'baby'
  const isSprout = stage === 'sprout'
  const isYoung = stage === 'young'
  const isAdult = stage === 'adult'

  const isHappy = reaction === 'happy' || reaction === 'tap'
  const isPetting = reaction === 'petting' || reaction === 'pet'
  const isEating = reaction === 'eating' || reaction === 'feed'

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* 1. RAMA DE SOPORTE */}
      <path
        d="M40 175C75 168 125 174 165 170"
        stroke="#8B5A2B"
        strokeWidth={isBaby ? "8" : "10"}
        strokeLinecap="round"
      />
      {/* Brotes verdes en la rama */}
      <path d="M140 172C150 162 165 162 170 168" stroke="#6EC6A0" strokeWidth="4" strokeLinecap="round" />
      {isAdult && (
        // Flor de orquídea en la rama del adulto
        <circle cx="152" cy="164" r="4.5" fill="#FF70A6" />
      )}

      {/* Patitas anaranjadas */}
      <circle cx="92" cy="170" r="5" fill="#FF8C42" />
      <circle cx="108" cy="170" r="5" fill="#FF8C42" />

      {/* 2. COLA DE PLUMAS SEGÚN ETAPA */}
      {isBaby && (
        // Bebé: colita diminuta de plumón suave
        <path d="M72 154C62 162 58 170 56 174C64 172 70 166 76 160Z" fill="#1E2A38" />
      )}
      {isSprout && (
        // Brote: cola de plumas rectas cortas
        <path d="M64 148C50 160 44 172 40 180C50 176 60 168 68 156Z" fill="#1E2A38" />
      )}
      {isYoung && (
        // Explorador: cola escalonada de 3 plumas activas
        <g>
          <path d="M60 144C44 158 36 176 32 188C44 182 56 172 66 158Z" fill="#1E2A38" />
          <path d="M64 148C52 162 46 176 44 184C52 180 62 172 68 160Z" fill="#2E4057" />
        </g>
      )}
      {isAdult && (
        // Adulto: cola larga, majestuosa y lustrosa
        <g>
          <path d="M58 142C38 160 28 182 24 194C38 188 54 176 64 158Z" fill="#1E2A38" />
          <path d="M62 146C46 164 38 182 36 190C48 184 60 174 68 162Z" fill="#FF5400" opacity="0.8" />
        </g>
      )}

      {/* 3. CUERPO PLUMOSO SEGÚN ETAPA */}
      <ellipse
        cx="100"
        cy={isBaby ? "138" : isSprout ? "135" : isYoung ? "132" : "130"}
        rx={isBaby ? "32" : isSprout ? "35" : isYoung ? "37" : "40"}
        ry={isBaby ? "36" : isSprout ? "40" : isYoung ? "42" : "46"}
        fill="#26384C"
      />

      {/* Pecho / babero amarillo dorado */}
      <path
        d={
          isBaby
            ? "M94 112C114 112 122 126 120 146C118 156 106 160 96 158C90 156 86 148 88 138C90 126 92 112 94 112Z"
            : "M92 105C118 105 128 122 126 148C124 162 108 166 94 164C86 162 82 152 84 138C86 122 88 105 92 105Z"
        }
        fill="#FFF3B0"
      />
      {/* Borde escarlata del babero */}
      <path
        d={isBaby ? "M96 148C102 151 112 150 116 145" : "M94 148C104 152 116 150 122 144"}
        stroke="#FF6B4A"
        strokeWidth={isBaby ? "2.5" : "3.5"}
        strokeLinecap="round"
      />

      {/* 4. ALAS Y REACCIONES */}
      {isHappy ? (
        // Alas alzadas festivas batiendo enérgicamente
        <g>
          <path d="M78 120C60 98 48 110 56 135C62 150 78 152 82 144Z" fill="#1A2532" />
          {isAdult && <path d="M52 106C42 90 32 100 42 124" stroke="#4CC9F0" strokeWidth="2.5" fill="none" />}
        </g>
      ) : isEating ? (
        // Ala descansando mientras come
        <path d="M76 124C70 134 70 148 78 158C84 162 88 156 86 146Z" fill="#1A2532" />
      ) : (
        // Reposo / Petting: ala plegada al costado
        <path
          d={
            isBaby
              ? "M78 128C72 136 72 146 78 152C82 156 86 150 84 142Z"
              : "M75 125C68 135 68 150 76 160C82 165 88 158 86 146Z"
          }
          fill="#1A2532"
        />
      )}

      {/* 5. CABEZA DEL TUCÁN */}
      <circle
        cx="102"
        cy={isBaby ? "84" : isSprout ? "82" : isYoung ? "80" : "80"}
        r={isBaby ? "30" : isSprout ? "33" : isYoung ? "35" : "37"}
        fill="#26384C"
      />

      {/* Babero del cuello */}
      <path
        d={
          isBaby
            ? "M88 80C88 68 112 68 116 82C118 92 114 104 98 102C90 100 88 92 88 80Z"
            : "M84 76C84 62 114 62 118 78C122 92 118 108 98 106C88 104 84 92 84 76Z"
        }
        fill="#FFF9E6"
      />

      {/* 6. PICO ANATÓMICO DIFERENCIADO EN 4 FORMAS */}
      {isBaby && (
        // Bebé: pico corto y cónico de polluelo (apenas 26px, amarillo pastel liso)
        <g>
          <path d="M106 72C116 71 126 75 132 83C126 89 118 90 106 86Z" fill="#FFE066" />
          <path d="M124 77C128 80 132 83 132 83C128 87 124 88 120 86Z" fill="#FFA500" />
          <path d="M106 81H130" stroke="#7A4E1D" strokeWidth="1.5" />
        </g>
      )}
      {isSprout && (
        // Brote: pico mediano más curvado con dos colores (base amarilla y punta naranja)
        <g>
          <path d="M106 66C124 64 144 71 154 82C148 90 132 92 106 87Z" fill="#FFD166" />
          <path d="M138 72C148 76 154 82 154 82C148 90 142 90 134 86Z" fill="#FF8C42" />
          <path d="M106 65L111 65L111 87L106 87Z" fill="#6EC6A0" />
          <path d="M107 78H150" stroke="#551B08" strokeWidth="1.8" />
        </g>
      )}
      {isYoung && (
        // Explorador: pico largo curvado con 3 franjas (base menta, medio amarillo, punta rojo vivo)
        <g>
          <path d="M108 63C132 61 158 68 172 82C164 93 140 95 108 87Z" fill="#FFB703" />
          <path d="M148 70C164 75 172 82 172 82C164 93 152 93 144 88Z" fill="#FF5400" />
          <path d="M107 63L114 63L114 87L107 87Z" fill="#6EC6A0" />
          <path d="M109 76C130 76 152 80 168 83" stroke="#551B08" strokeWidth="2" />
        </g>
      )}
      {isAdult && (
        // Adulto: pico majestuoso y curvado de gran longitud (76px) con gradiente completo y cresta
        <g>
          <path d="M108 60C138 57 172 67 186 84C178 97 148 98 108 88Z" fill="#FFB703" />
          <path d="M152 68C174 74 186 84 186 84C178 97 162 97 148 91Z" fill="#FF4400" />
          <path d="M174 76C182 80 186 84 186 84C182 92 178 93 172 88Z" fill="#1A1A1A" />
          <path d="M107 61L115 61L115 88L107 88Z" fill="#6EC6A0" />
          <path d="M109 76C138 76 164 80 182 85" stroke="#551B08" strokeWidth="2.5" />
          {/* Pequeños dientes de sierra característicos del pico maduro */}
          <path d="M130 76L132 78L134 76M142 77L144 79L146 77M154 78L156 80L158 78" stroke="#551B08" strokeWidth="1.2" />
        </g>
      )}

      {/* Comida en el pico si reaction es eating */}
      {isEating && (
        <circle cx={isBaby ? "134" : isSprout ? "156" : isYoung ? "174" : "188"} cy="84" r="7" fill="#FF4D6D" stroke="#FFE066" strokeWidth="1.5" />
      )}

      {/* 7. OJO CON ANILLO CELESTE */}
      <circle cx="94" cy="74" r={isBaby ? "9.5" : "11"} fill="#4CC9F0" />
      {isPetting ? (
        // Ojo cerrado ^ en caricia
        <path d="M88 74C91 70 97 70 100 74" stroke="#102538" strokeWidth="3" strokeLinecap="round" />
      ) : isEating ? (
        // Ojo cerrado gozando alimento
        <path d="M88 75C91 71 97 71 100 75" stroke="#102538" strokeWidth="3" strokeLinecap="round" />
      ) : (
        // Ojo abierto con brillo
        <>
          <circle cx="94" cy="74" r={isBaby ? "6" : "6.5"} fill="#102538" />
          <circle cx="92" cy="72" r={isBaby ? "2.2" : "2.5"} fill="#FFFFFF" />
        </>
      )}

      {/* Mejilla sonrojada */}
      <circle cx="86" cy="86" r={isPetting || isEating ? "5" : "4.5"} fill="#FF9E7D" opacity="0.65" />

      {/* 8. ATRIBUTO DISTINTIVO EN CORONA */}
      {isAdult && (
        // Cresta dorada de plumas elegantes en la nuca del adulto
        <path
          d="M92 46C94 38 104 36 110 40C114 43 108 50 100 50Z"
          fill="#FFB703"
          stroke="#FFA500"
          strokeWidth="1.5"
        />
      )}
      {isYoung && (
        // Plumas jóvenes en la corona
        <path d="M96 50C98 44 104 43 106 48" stroke="#FFB703" strokeWidth="2.5" strokeLinecap="round" />
      )}
    </svg>
  )
}

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
  switch (id) {
    case 'monkey':
      return <MonkeyIllustration stage={stage} reaction={reaction} size={size} className={className} />
    case 'turtle':
      return <TurtleIllustration stage={stage} reaction={reaction} size={size} className={className} />
    case 'toucan':
      return <ToucanIllustration stage={stage} reaction={reaction} size={size} className={className} />
  }
}
