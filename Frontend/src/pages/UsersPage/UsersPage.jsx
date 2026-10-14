import { useState, useMemo, useEffect } from 'react'
import AssignCourseModal from '../../components/AssignCourseModal/AssignCourseModal'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import { getUsers, deleteUser } from '../../services/userService'
import './UsersPage.css'
import { useNavigate } from 'react-router-dom'
import EditUserModal from '../../components/EditUserModal/EditUserModal'

const ROLE_LABELS = {
  1: 'Admin',
  2: 'Lecturer',
  3: 'Student',
}

export default function UsersPage() {
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch]         = useState('')
  const [assignUser, setAssignUser] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)  
  const [editUser, setEditUser] = useState(null)
  const navigate = useNavigate()


  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers(showLoading = true) {  
    if (showLoading) setLoading(true)
    setError(null)
    try {
      const data = await getUsers()
      setUsers(data)
    } catch {
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  const visibleUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === 'all' || String(u.roleId) === roleFilter
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      return matchesRole && matchesSearch
    })
  }, [users, roleFilter, search])

  function handleDelete(user) {  
    setUserToDelete(user)
  }

  async function confirmDeleteUser() {  
    setError(null)
    try {
      await deleteUser(userToDelete.id)
      setUserToDelete(null)
      await loadUsers(false)
    } catch {
      setError('Failed to delete user.')
      setUserToDelete(null)
    }
  }

  const statusContent = (colspan) => {
    if (loading) return <tr><td colSpan={colspan} className="users-table__empty">Loading...</td></tr>
    if (error)   return <tr><td colSpan={colspan} className="users-table__empty users-table__error">{error}</td></tr>
    if (visibleUsers.length === 0) return <tr><td colSpan={colspan} className="users-table__empty">No users match the current filters.</td></tr>
    return null
  }

  return (
    <main className="users-page">
      <div className="users-page__header">
        <h1 className="users-page__title">Manage Users</h1>
        <button type="button" className="app-button-primary" onClick={() => navigate('/register')}>+ New user</button>
      </div>

      <div className="users-page__filters">
        <select
          className="users-page__select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">Role: All</option>
          <option value="1">Admin</option>
          <option value="2">Lecturer</option>
          <option value="3">Student</option>
        </select>

        <input
          className="users-page__search"
          type="search"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="app-page-content app-fade-in">
      {/* ── Desktop table ────────────────────────────── */}
      <div className="users-page__table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>First name</th>
              <th>Last name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {statusContent(6) ?? visibleUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td className="users-table__email">{user.email}</td>
                <td>
                  <span className={`role-badge role-badge--${user.roleId}`}>
                    {ROLE_LABELS[user.roleId] ?? `Role ${user.roleId}`}
                  </span>
                </td>
                <td className="users-table__actions">
                  <button type="button" className="app-button-secondary" onClick={() => setEditUser(user)}>Edit</button>
                  <button type="button" className="app-button-danger" onClick={() => handleDelete(user)}>Delete</button>  
                  {user.roleId === 3 && (
                    <button type="button" className="app-button-primary" onClick={() => setAssignUser(user)}>Assign course</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Tablet & Mobile cards ────────────────────── */}
      <div className="users-card-list">
        {loading && <p className="users-table__empty">Loading...</p>}
        {error   && <p className="users-table__empty users-table__error">{error}</p>}
        {!loading && !error && visibleUsers.length === 0 && (
          <p className="users-table__empty">No users match the current filters.</p>
        )}
        {!loading && !error && visibleUsers.map((user) => (
          <div key={user.id} className="users-card">
            <div className="users-card__info">
              <span className='users-card__name'>
                {user.firstName} {user.lastName}
              </span>
              <span className='users-card__sub'>{user.email}</span>
              <span className="users-card__sub">{ROLE_LABELS[user.roleId] ?? `Role ${user.roleId}`}</span>
            </div>
            <div className="users-card__actions">
              <button type="button" className="app-button-secondary" onClick={() => setEditUser(user)}>Edit</button>
              <button type="button" className="app-button-danger users-card__delete" onClick={() => handleDelete(user)}>Delete</button>  
            </div>
          </div>
        ))}
      </div>
      </div>

      {assignUser && (
        <AssignCourseModal
          user={assignUser}
          onClose={() => setAssignUser(null)}
        />
      )}

      {userToDelete && (  
        <ConfirmModal
          show={Boolean(userToDelete)}
          title="Delete user"
          message={`Would you like to delete ${userToDelete.firstName} ${userToDelete.lastName}?`}
          confirmText="Delete"
          onCancel={() => setUserToDelete(null)}
          onConfirm={confirmDeleteUser}
        />
      )}

      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={() => loadUsers(false)}
        />
      )}
    </main>
  )
}