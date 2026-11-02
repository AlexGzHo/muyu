import type { GrowthStage, PetId, PetReaction, EquippedAccessories } from '../../game/types'
import { PetRenderer } from './PetIllustrations'
import { AccessoryLayer } from './PetAccessories'

export interface CompositePetRendererProps {
  id: PetId
  stage?: GrowthStage
  reaction?: PetReaction
  size?: number | string
  className?: string
  equippedAccessories?: EquippedAccessories | null
}

/**
 * CompositePetRenderer
 * Arquitectura modular de composición de capas (SVG DOM Stacking):
 * 1. Capa de Espalda (z-index inferior): Mochilas, capas detrás del cuerpo.
 * 2. Mascota Base Anatómica: 12 formas vectoriales intactas con sus 4 reacciones.
 * 3. Capa de Cuello / Pecho: Pañuelos, medallas, collares sobre el pecho.
 * 4. Capa de Rostro: Gafas y lentes sobre los ojos sin obstruir boca.
 * 5. Capa de Cabeza: Gorras, sombreros, coronas y lazos sobre la frente/corona.
 */
export const CompositePetRenderer = ({
  id,
  stage = 'baby',
  reaction = 'none',
  size = 200,
  className = '',
  equippedAccessories = null,
}: CompositePetRendererProps) => {
  const backAcc = equippedAccessories?.back
  const neckAcc = equippedAccessories?.neck
  const faceAcc = equippedAccessories?.face
  const headAcc = equippedAccessories?.head

  const hasAnyAccessory = Boolean(backAcc || neckAcc || faceAcc || headAcc)

  // Si no tiene accesorios equipados, renderizar directamente PetRenderer para máxima eficiencia
  if (!hasAnyAccessory) {
    return (
      <PetRenderer
        id={id}
        stage={stage}
        reaction={reaction}
        size={size}
        className={className}
      />
    )
  }

  const isHappy = reaction === 'happy' || reaction === 'tap'
  const isPetting = reaction === 'petting' || reaction === 'pet'
  const isEating = reaction === 'eating' || reaction === 'feed'
  const numSize = typeof size === 'number' ? size : 200

  return (
    <div
      className={`composite-pet-container ${className}`}
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className={`composite-anim-group ${isHappy ? 'anim-happy' : ''} ${isPetting ? 'anim-petting' : ''} ${isEating ? 'anim-eating' : ''}`}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 1. Capa trasera (Back layer): mochilas y capas por detrás del cuerpo */}
        {backAcc && (
          <svg
            viewBox="0 0 200 200"
            width={numSize}
            height={numSize}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 1,
            }}
            aria-hidden="true"
          >
            <AccessoryLayer accessoryId={backAcc} petId={id} stage={stage} />
          </svg>
        )}

        {/* 2. Mascota base anatómica (cuerpo, extremidades, cabeza, ojos) */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex' }}>
          <PetRenderer
            id={id}
            stage={stage}
            reaction={reaction}
            size={size}
          />
        </div>

        {/* 3. Capa frontal (Neck, Face, Head): sobre el cuerpo y rostro */}
        {(neckAcc || faceAcc || headAcc) && (
          <svg
            viewBox="0 0 200 200"
            width={numSize}
            height={numSize}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 3,
            }}
            aria-hidden="true"
          >
            {neckAcc && <AccessoryLayer accessoryId={neckAcc} petId={id} stage={stage} />}
            {faceAcc && <AccessoryLayer accessoryId={faceAcc} petId={id} stage={stage} />}
            {headAcc && <AccessoryLayer accessoryId={headAcc} petId={id} stage={stage} />}
          </svg>
        )}
      </div>
    </div>
  )
}

