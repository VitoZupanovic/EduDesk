import { apiRequest } from './api'

export async function getNotifications() {
  return apiRequest('/api/Notification', { method: 'GET' })
}

export async function getNotificationById(id) {
  return apiRequest(`/api/Notification/${id}`, { method: 'GET' })
}

export async function createNotification(notificationData) {
  return apiRequest('/api/Notification', {
    method: 'POST',
    body: notificationData,
  })
}

export async function updateNotification(id, notificationData) {
  return apiRequest(`/api/Notification/${id}`, {
    method: 'PUT',
    body: notificationData,
  })
}

export async function deleteNotification(id) {
  return apiRequest(`/api/Notification/${id}`, { method: 'DELETE' })
}
