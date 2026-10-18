import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { PetRenderer } from '../../../src/components/svg/PetIllustrations'
import type { PetId, GrowthStage, PetReaction } from '../../../src/game/types'

interface SpeciesDef {
  id: PetId
  name: string
  label: string
  accentColor: string
}

const SPECIES: SpeciesDef[] = [
  { id: 'monkey', name: 'Mono', label: 'Machín', accentColor: '#9C6644' },
  { id: 'turtle', name: 'Tortuga', label: 'Taricaya', accentColor: '#2D6A4F' },
  { id: 'toucan', name: 'Tucán', label: 'Pico acanalado', accentColor: '#1F4E79' },
]

interface StageDef {
  id: GrowthStage
  label: string
  range: string
}

const STAGES: StageDef[] = [
  { id: 'baby', label: 'Bebé', range: '0–34 u' },
  { id: 'sprout', label: 'Brote', range: '35–79 u' },
  { id: 'young', label: 'Explorador', range: '80–144 u' },
  { id: 'adult', label: 'Adulto', range: '≥ 145 u' },
]

interface ReactionDef {
  id: PetReaction
  name: string
  code: string
  desc: string
}

const REACTIONS: ReactionDef[] = [
  { id: 'idle', name: 'Reposo', code: 'idle', desc: 'Postura serena y ojos atentos' },
  { id: 'happy', name: 'Alegría', code: 'happy', desc: 'Extremidades alzadas y sonrisa' },
  { id: 'eating', name: 'Alimentación', code: 'eating', desc: 'Fruta y masticación activa' },
  { id: 'petting', name: 'Caricia', code: 'petting', desc: 'Ojos cerrados en arco afectivo' },
]

export const PetComparisonApp = () => {
  const [globalReaction, setGlobalReaction] = useState<PetReaction>('idle')

  return (
    <div className="container">
      {/* Header Compacto */}
      <header className="header">
        <div className="header-title-box">
          <h1>Muyu 2.0 — Matriz Anatómica</h1>
          <span className="header-tag">12 Formas (3×4) + 4 Reacciones</span>
        </div>
        <div className="reaction-bar">
          <span className="reaction-bar-label">Reacción global:</span>
          {REACTIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`btn-reaction ${globalReaction === r.id ? 'active' : ''}`}
              onClick={() => setGlobalReaction(r.id)}
            >
              {r.name} ({r.code})
            </button>
          ))}
        </div>
      </header>

      {/* Matriz 3 filas x 4 columnas */}
      <main className="matrix-section">
        <div className="matrix-col-headers">
          <span />
          {STAGES.map((s) => (
            <div key={s.id} className="col-header">
              {s.label} ({s.range})
            </div>
          ))}
        </div>

        <div className="matrix-rows">
          {SPECIES.map((pet) => (
            <div key={pet.id} className="matrix-row">
              <div className="row-label-cell" style={{ borderLeftColor: pet.accentColor }}>
                <span className="species-name">{pet.name}</span>
                <span className="species-id">{pet.label}</span>
              </div>
              {STAGES.map((stage) => (
                <div key={stage.id} className="pet-cell">
                  <span className="cell-stage-tag">{stage.label}</span>
                  <PetRenderer
                    id={pet.id}
                    stage={stage.id}
                    reaction={globalReaction}
                    size={96}
                    className="pet-svg-item"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>

      {/* Sección Inferior: 4 Reacciones Conductuales */}
      <section className="reactions-section">
        <div className="reactions-header">
          <span className="reactions-title">4 Reacciones Conductuales en Vivo</span>
          <span style={{ fontSize: '10px', color: '#52675B' }}>
            Mono (Explorador) · Tortuga (Adulta) · Tucán (Brote)
          </span>
        </div>
        <div className="reactions-grid">
          {REACTIONS.map((r) => (
            <div key={r.id} className="reaction-card">
              <span className="reaction-name">{r.name} ({r.code})</span>
              <p className="reaction-desc">{r.desc}</p>
              <div className="reaction-previews">
                <PetRenderer id="monkey" stage="young" reaction={r.id} size={58} />
                <PetRenderer id="turtle" stage="adult" reaction={r.id} size={58} />
                <PetRenderer id="toucan" stage="sprout" reaction={r.id} size={58} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pie técnico */}
      <footer className="footer-bar">
        <span>Puerto Vite: 127.0.0.1:5176 | Componente: &lt;PetRenderer /&gt;</span>
        <span>0 emojis en visor | 12 formas anatómicas vectoriales originales</span>
      </footer>
    </div>
  )
}

const rootEl = document.getElementById('root')
if (rootEl) {
  createRoot(rootEl).render(<PetComparisonApp />)
}
