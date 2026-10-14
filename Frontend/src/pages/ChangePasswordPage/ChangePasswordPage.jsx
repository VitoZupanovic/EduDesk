import { useState } from 'react'
import { changePassword } from '../../services/authService'
import './ChangePasswordPage.css'

export default function ChangePasswordPage() {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    })

    const [message, setMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    function handleChange(event) {
        const { name, value } = event.target

        setFormData({
            ...formData,
            [name]: value,
        })
    }

    async function handleSubmit(event) {
        event.preventDefault()

        setMessage('')
        setErrorMessage('')

        if (formData.newPassword !== formData.confirmNewPassword) {
            setErrorMessage('New password and confirm password do not match.')
            return
        }

        setIsLoading(true)

        try {
            await changePassword(
                formData.currentPassword,
                formData.newPassword,
                formData.confirmNewPassword
            )

            setMessage('Password changed successfully.')

            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            })
        } catch (error) {
            setErrorMessage(error.message || 'Password change failed.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="page-container change-password-page">
            <section className="change-password-card app-card">
                <div className="change-password-header">
                    <h1 className="change-password-title">Change Password</h1>
                </div>

                <form onSubmit={handleSubmit} className="change-password-form">
                    <div>
                        <label htmlFor="currentPassword">Current password</label>
                        <input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            className="app-form-control"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="newPassword">New password</label>
                        <input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            className="app-form-control"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmNewPassword">Confirm new password</label>
                        <input
                            id="confirmNewPassword"
                            name="confirmNewPassword"
                            type="password"
                            className="app-form-control"
                            value={formData.confirmNewPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {message && (
                        <div className="app-message app-message-loading">
                            {message}
                        </div>
                    )}

                    {errorMessage && (
                        <div className="app-message app-message-error">
                            {errorMessage}
                        </div>
                    )}

                    <div className="change-password-actions">
                        <button
                            type="submit"
                            className="app-button-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    )
}