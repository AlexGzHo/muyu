import { BasketGameIcon, PlantGameIcon, ListenGameIcon } from '../components/svg/Icons'

export type ActivityPreviewType = 'counting' | 'plant' | 'listening' | null

interface GamePreviewModalProps {
  activity: ActivityPreviewType
  onClose: () => void
}

export default function GamePreviewModal({ activity, onClose }: GamePreviewModalProps) {
  if (!activity) return null

  const activityInfo = {
    counting: {
      title: 'Contemos frutas',
      subtitle: 'Pensamiento matemático temprano (1 a 5)',
      icon: <BasketGameIcon size={84} />,
      badge: 'Fase 2: Próxima actividad',
      accentColor: '#FF6B4A',
    },
    plant: {
      title: 'Ayudemos a crecer',
      subtitle: 'Ciencia y ambiente: agua, luz y tierra',
      icon: <PlantGameIcon size={84} />,
      badge: 'Fase 2: Próxima actividad',
      accentColor: '#489B6E',
    },
    listening: {
      title: 'Escucha y encuentra',
      subtitle: 'Comunicación: pistas auditivas y visuales',
      icon: <ListenGameIcon size={84} />,
      badge: 'Fase 2: Próxima actividad',
      accentColor: '#FF8C42',
    },
  }[activity]

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={activityInfo.title}>
      <div className="modal-card activity-preview-card">
        <div className="activity-icon-hero">
          {activityInfo.icon}
        </div>

        <h2 className="activity-modal-title">{activityInfo.title}</h2>
        <p className="activity-modal-subtitle">{activityInfo.subtitle}</p>

        <span className="activity-badge" style={{ backgroundColor: activityInfo.accentColor }}>
          {activityInfo.badge}
        </span>

        <button
          type="button"
          className="btn-primary-action btn-large-tap"
          onClick={onClose}
          style={{ marginTop: '24px' }}
        >
          Volver al hogar
        </button>
      </div>
    </div>
  )
}
