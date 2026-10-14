import { useState } from 'react'
import { createPortal } from 'react-dom'
import { updateUser } from '../../services/userService'
import './EditUserModal.css'

const ROLES = [
  { id: 1, label: 'Admin' },
  { id: 2, label: 'Lecturer' },
  { id: 3, label: 'Student' },
]

export default function EditUserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName:  user.lastName,
    email:     user.email,
    roleId:    user.roleId,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'roleId' ? Number(value) : value,
    }))
    setError(null)
  }

  async function handleSave() {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError('First name, last name and email are required.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await updateUser(user.id, form)
      onSaved()
      onClose()
    } catch (err) {
      setError(err?.message ?? 'Failed to update user.')
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div className="eum-overlay" onClick={onClose}>
      <div className="eum" onClick={(e) => e.stopPropagation()}>

        <div className="eum__header">
          <h2 className="eum__title">Edit user</h2>
          <button className="eum__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="eum__fields">
          <div className="eum__row">
            <div className="eum__field">
              <label className="eum__label">First name</label>
              <input
                className="eum__input"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            </div>
            <div className="eum__field">
              <label className="eum__label">Last name</label>
              <input
                className="eum__input"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            </div>
          </div>

          <div className="eum__field">
            <label className="eum__label">Email</label>
            <input
              className="eum__input"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={submitting}
              required
            />
          </div>

<div className="eum__field">
  <label className="eum__label">Role</label>
  <div className="eum__role-group">
    {ROLES.map((r) => (
      <button
        key={r.id}
        type="button"
        className={`eum__role-btn${form.roleId === r.id ? ' eum__role-btn--active' : ''}`}
        onClick={() => { setForm((prev) => ({ ...prev, roleId: r.id })); setError(null) }}
        disabled={submitting}
      >
        {r.label}
      </button>
    ))}
  </div>
</div>
        </div>

          <p className="eum__error">{error ?? '\u00A0'}</p>

        <div className="eum__actions">
          <button type="button" className="app-button-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="app-button-primary" onClick={handleSave} disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  )
}