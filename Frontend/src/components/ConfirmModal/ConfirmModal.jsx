import './ConfirmModal.css'

export default function ConfirmModal({
  show = true,
  title = 'Confirm action',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  if (!show) {
    return null
  }

  return (
    <div className="confirm-modal-backdrop">
      <section className="confirm-modal app-card" role="dialog" aria-modal="true">
        <div className="confirm-modal-header">
          <h2>{title}</h2>

          <button
            type="button"
            className="confirm-modal-close"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Close confirmation modal"
          >
            &times;
          </button>
        </div>

        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="app-button-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className="app-button-danger"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? `${confirmText}...` : confirmText}
          </button>
        </div>
      </section>
    </div>
  )
}
