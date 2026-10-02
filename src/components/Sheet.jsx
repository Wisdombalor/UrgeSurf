export default function Sheet({ children, onClose, className = '' }) {
  return (
    <div
      className="sheet-backdrop"
      onClick={onClose}
      role="presentation"
      aria-label="Overlay backdrop. Click to close."
    >
      <section
        className={`sheet ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="sheet-handle" aria-hidden="true" />
        <div className="sheet-content">{children}</div>
      </section>
    </div>
  )
}

export function CloseButton({ onClose, label = 'Close' }) {
  return (
    <button
      className="ghost"
      onClick={onClose}
      style={{ textAlign: 'left', padding: '0 0 14px', width: 'auto', alignSelf: 'flex-start' }}
    >
      ← {label}
    </button>
  )
}

export function BackButton({ onBack, label = 'Back' }) {
  return (
    <button
      className="ghost"
      onClick={onBack}
      style={{ textAlign: 'left', padding: '0 0 12px', width: 'auto', alignSelf: 'flex-start' }}
    >
      ← {label}
    </button>
  )
}
