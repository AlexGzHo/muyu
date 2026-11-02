import { useState } from 'react'
import type {
  PetId,
  PetProgress,
  AccessoryCategory,
  AccessoryId,
  AccessoryItem,
  EquippedAccessories,
} from '../game/types'
import {
  ACCESSORIES_CATALOG,
  getPetCoinsBalance,
} from '../game/rules'
import { isAccessoryCompatible } from '../game/petAnchors'
import { CompositePetRenderer } from '../components/svg/CompositePetRenderer'
import { AccessoryGraphic } from '../components/svg/PetAccessories'
import {
  BackIcon,
  CoinIcon,
  ShopIcon,
  SparkleIcon,
  CheckmarkIcon,
} from '../components/svg/Icons'
import { TropicalHills } from '../components/svg/Scenery'
import { soundManager } from '../audio/soundManager'

interface ShopScreenProps {
  pets: Record<PetId, PetProgress>
  selectedPetId: PetId
  soundEnabled: boolean
  onSelectPet: (id: PetId) => void
  onBuyAccessory: (petId: PetId, accessoryId: AccessoryId) => boolean
  onEquipAccessory: (petId: PetId, accessoryId: AccessoryId) => void
  onUnequipAccessory: (petId: PetId, category: AccessoryCategory) => void
  onBackToForest: () => void
}

const CATEGORY_TABS: Array<{ id: AccessoryCategory; name: string }> = [
  { id: 'head', name: 'Cabeza' },
  { id: 'face', name: 'Rostro' },
  { id: 'neck', name: 'Cuello' },
  { id: 'back', name: 'Espalda' },
]

const PET_TABS: Array<{ id: PetId; name: string }> = [
  { id: 'monkey', name: 'Monito' },
  { id: 'turtle', name: 'Tortuguita' },
  { id: 'toucan', name: 'Tucancito' },
]

export default function ShopScreen({
  pets,
  selectedPetId,
  soundEnabled,
  onSelectPet,
  onBuyAccessory,
  onEquipAccessory,
  onUnequipAccessory,
  onBackToForest,
}: ShopScreenProps) {
  const currentPet = pets[selectedPetId]
  const coinsBalance = currentPet ? getPetCoinsBalance(currentPet) : 0
  const purchased = currentPet?.purchasedAccessories ?? []
  const equipped = currentPet?.equippedAccessories ?? {}

  const [activeCategory, setActiveCategory] = useState<AccessoryCategory>('head')
  // Accesorio en prueba interactiva (preview temporal sin descontar saldo)
  const [previewAccessories, setPreviewAccessories] = useState<EquippedAccessories>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Accesorios actualmente mostrados en el maniquí: mezcla de equipados reales + prueba temporal
  const effectiveEquipped: EquippedAccessories = {
    ...equipped,
    ...previewAccessories,
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    window.setTimeout(() => setToastMessage(null), 2500)
  }

  // Filtrar accesorios del catálogo por la categoría seleccionada
  const categoryItems = ACCESSORIES_CATALOG.filter((item) => item.category === activeCategory)

  // Probar accesorio (no cuesta puntos)
  const handleTryOn = (item: AccessoryItem) => {
    const compat = isAccessoryCompatible(item.id, selectedPetId, currentPet.stage)
    if (!compat.compatible) {
      showToast(compat.reason || `No disponible para ${currentPet.name}`)
      return
    }

    soundManager.playClick(soundEnabled)
    setPreviewAccessories((prev) => ({
      ...prev,
      [item.category]: item.id,
    }))
    showToast(`Probando: ${item.name}`)
  }

  // Limpiar prueba temporal
  const handleClearPreview = () => {
    soundManager.playClick(soundEnabled)
    setPreviewAccessories({})
    showToast('Probador restaurado a lo equipado')
  }

  // Comprar accesorio
  const handleBuy = (item: AccessoryItem) => {
    if (isProcessing) return
    const compat = isAccessoryCompatible(item.id, selectedPetId, currentPet.stage)
    if (!compat.compatible) {
      showToast(compat.reason || `No disponible para ${currentPet.name}`)
      return
    }
    if (purchased.includes(item.id)) return

    if (coinsBalance < item.price) {
      soundManager.playClick(soundEnabled)
      showToast(`¡Puntos insuficientes! Necesitas ${item.price} pts.`)
      return
    }

    setIsProcessing(true)
    const success = onBuyAccessory(selectedPetId, item.id)
    if (success) {
      soundManager.playSuccess(soundEnabled)
      // Limpiar prueba temporal de esta categoría para reflejar el estado real
      setPreviewAccessories((prev) => {
        const next = { ...prev }
        delete next[item.category]
        return next
      })
      showToast(`¡Compraste y equipaste ${item.name}!`)
    } else {
      showToast('No se pudo completar la compra.')
    }

    // Cooldown para prevenir doble clic
    window.setTimeout(() => setIsProcessing(false), 400)
  }

  // Equipar accesorio ya comprado
  const handleEquip = (item: AccessoryItem) => {
    if (!purchased.includes(item.id)) return
    const compat = isAccessoryCompatible(item.id, selectedPetId, currentPet.stage)
    if (!compat.compatible) {
      showToast(compat.reason || `No disponible para ${currentPet.name}`)
      return
    }
    soundManager.playClick(soundEnabled)
    // Limpiar prueba temporal
    setPreviewAccessories((prev) => {
      const next = { ...prev }
      delete next[item.category]
      return next
    })
    onEquipAccessory(selectedPetId, item.id)
    showToast(`Equipaste: ${item.name}`)
  }

  // Quitar accesorio
  const handleUnequip = (category: AccessoryCategory) => {
    soundManager.playClick(soundEnabled)
    setPreviewAccessories((prev) => {
      const next = { ...prev }
      delete next[category]
      return next
    })
    onUnequipAccessory(selectedPetId, category)
    showToast('Accesorio desequipado')
  }

  return (
    <main className="screen-container shop-screen">
      {/* 1. Barra de navegación superior */}
      <header className="top-nav-bar shop-nav-bar">
        <button
          type="button"
          className="btn-round-nav"
          onClick={onBackToForest}
          aria-label="Volver al bosque"
        >
          <BackIcon size={32} />
        </button>

        <div className="shop-header-title-box">
          <h2 className="screen-header-title">
            <ShopIcon size={32} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Tienda del Bosque
          </h2>
          <span className="shop-header-subtitle">Prueba y viste a tus amigos</span>
        </div>

        {/* Saldo canjeable de la mascota activa */}
        <div className="shop-balance-pill" aria-label={`Saldo canjeable: ${coinsBalance} puntos`}>
          <CoinIcon size={24} />
          <span className="shop-balance-number">{coinsBalance}</span>
          <span className="shop-balance-label">pts</span>
        </div>
      </header>

      {/* 2. Selector de mascota activa */}
      <div className="shop-pets-selector-row" role="tablist" aria-label="Seleccionar mascota a vestir">
        {PET_TABS.map((tab) => {
          const isActive = tab.id === selectedPetId
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`shop-pet-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                soundManager.playClick(soundEnabled)
                setPreviewAccessories({})
                onSelectPet(tab.id)
              }}
              aria-label={`Vestir a ${tab.name}`}
            >
              {tab.name}
            </button>
          )
        })}
      </div>

      {/* 3. Contenedor principal: Maniquí / Probador + Catálogo */}
      <div className="shop-stage-grid">
        {/* Panel Izquierdo: Vista previa grande de la mascota con accesorios */}
        <section className="shop-mannequin-card" aria-label="Probador de la mascota">
          <div className="shop-mannequin-header">
            <span className="shop-mannequin-pet-name">{currentPet?.name}</span>
            <span className="shop-mannequin-stage-tag">
              Etapa: {currentPet?.stage === 'baby' ? 'Bebé' : currentPet?.stage === 'sprout' ? 'Pequeño' : currentPet?.stage === 'young' ? 'Explorador' : 'Adulto'}
            </span>
          </div>

          <div className="shop-mannequin-visual-area">
            {currentPet && (
              <CompositePetRenderer
                id={currentPet.id}
                stage={currentPet.stage}
                reaction="happy"
                size={220}
                equippedAccessories={effectiveEquipped}
                className="shop-pet-interactive-svg"
              />
            )}
          </div>

          {/* Estado de accesorios equipados / en prueba */}
          <div className="shop-equipped-summary-row">
            {Object.keys(previewAccessories).length > 0 && (
              <button
                type="button"
                className="shop-clear-preview-btn"
                onClick={handleClearPreview}
                aria-label="Restaurar accesorios equipados reales"
              >
                Restablecer probador
              </button>
            )}
            <div className="shop-category-status-chips">
              {CATEGORY_TABS.map((cat) => {
                const isEquippedReal = equipped[cat.id]
                const isTesting = previewAccessories[cat.id]
                const accId = isTesting || isEquippedReal
                if (!accId) return null
                const item = ACCESSORIES_CATALOG.find((a) => a.id === accId)
                return (
                  <span
                    key={cat.id}
                    className={`shop-status-chip ${isTesting ? 'chip-testing' : 'chip-equipped'}`}
                    onClick={() => isEquippedReal && !isTesting && handleUnequip(cat.id)}
                    title={isEquippedReal && !isTesting ? 'Toca para quitar' : 'En prueba'}
                    role="button"
                    tabIndex={0}
                  >
                    {!isTesting && isEquippedReal && (
                      <CheckmarkIcon size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    )}
                    {cat.name}: {item?.name} {isTesting ? '(en prueba)' : '(quitar)'}
                  </span>
                )
              })}
            </div>
          </div>
        </section>

        {/* Panel Derecho: Catálogo visual por categorías */}
        <section className="shop-catalog-card" aria-label="Catálogo de accesorios">
          {/* Pestañas de categoría (Cabeza, Rostro, Cuello, Espalda) */}
          <div className="shop-category-tabs-bar" role="tablist" aria-label="Categorías de accesorios">
            {CATEGORY_TABS.map((tab) => {
              const isTabActive = tab.id === activeCategory
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isTabActive}
                  className={`shop-category-tab ${isTabActive ? 'active' : ''}`}
                  onClick={() => {
                    soundManager.playClick(soundEnabled)
                    setActiveCategory(tab.id)
                  }}
                  aria-label={`Ver accesorios de ${tab.name}`}
                >
                  {tab.name}
                </button>
              )
            })}
          </div>

          {/* Grid de accesorios disponibles en la categoría */}
          <div className="shop-items-grid" role="list" aria-label={`Accesorios de ${activeCategory}`}>
            {categoryItems.map((item) => {
              const compat = isAccessoryCompatible(item.id, selectedPetId, currentPet.stage)
              const isCompatible = compat.compatible
              const isOwned = purchased.includes(item.id)
              const isCurrentlyEquipped = equipped[item.category] === item.id
              const isBeingTested = previewAccessories[item.category] === item.id
              const canAfford = coinsBalance >= item.price

              return (
                <div
                  key={item.id}
                  className={`shop-item-card ${isCurrentlyEquipped ? 'item-equipped' : ''} ${isBeingTested ? 'item-testing' : ''} ${!isCompatible ? 'item-incompatible' : ''}`}
                  role="listitem"
                >
                  {/* Vista previa SVG del accesorio individual */}
                  <div className="shop-item-preview-box">
                    <svg
                      viewBox="-40 -25 80 70"
                      width={64}
                      height={64}
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <AccessoryGraphic accessoryId={item.id} petId={selectedPetId} />
                    </svg>
                  </div>

                  {/* Datos del accesorio */}
                  <div className="shop-item-info">
                    <span className="shop-item-name">{item.name}</span>
                    <span className="shop-item-desc">{item.description}</span>
                    {!isCompatible && (
                      <span className="shop-item-incompatible-badge" role="note">
                        {compat.reason || `No disponible para ${currentPet.name}`}
                      </span>
                    )}
                  </div>

                  {/* Estado de precio y acciones */}
                  <div className="shop-item-footer">
                    {!isOwned ? (
                      <div className="shop-item-price-pill" aria-label={`Precio: ${item.price} puntos`}>
                        <CoinIcon size={18} />
                        <span className="price-val">{item.price} pts</span>
                      </div>
                    ) : (
                      <span className="shop-item-owned-tag">Adquirido</span>
                    )}

                    <div className="shop-item-buttons-row">
                      {!isCompatible ? (
                        <button
                          type="button"
                          className="btn-shop-action btn-disabled"
                          disabled={true}
                          aria-label={compat.reason || 'Accesorio no compatible'}
                        >
                          No disponible
                        </button>
                      ) : (
                        <>
                          {/* Botón Probar (siempre disponible para ver cómo queda) */}
                          <button
                            type="button"
                            className="btn-shop-action btn-try"
                            onClick={() => handleTryOn(item)}
                            aria-label={`Probar ${item.name}`}
                          >
                            Probar
                          </button>

                          {/* Botón Comprar o Equipar / Quitar */}
                          {!isOwned ? (
                            <button
                              type="button"
                              className="btn-shop-action btn-buy"
                              disabled={!canAfford || isProcessing}
                              onClick={() => handleBuy(item)}
                              aria-label={`Comprar ${item.name} por ${item.price} puntos`}
                            >
                              Comprar
                            </button>
                          ) : isCurrentlyEquipped ? (
                            <button
                              type="button"
                              className="btn-shop-action btn-unequip"
                              onClick={() => handleUnequip(item.category)}
                              aria-label={`Quitar ${item.name}`}
                            >
                              Quitar
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-shop-action btn-equip"
                              onClick={() => handleEquip(item)}
                              aria-label={`Equipar ${item.name}`}
                            >
                              Poner
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* Notificación Toast accesible */}
      {toastMessage && (
        <div className="shop-toast-alert" role="status" aria-live="polite">
          <SparkleIcon size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Escenario de fondo */}
      <div className="scenery-layer hills-bottom">
        <TropicalHills />
      </div>
    </main>
  )
}

