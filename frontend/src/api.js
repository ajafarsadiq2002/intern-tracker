import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

const api = axios.create({
  baseURL: API_BASE,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// Drops empty-string/null/undefined values so optional UUID/date query params
// (which the backend rejects as invalid if sent as "") are omitted entirely.
const cleanParams = (params) => {
  if (!params) return params
  const out = {}
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) out[key] = value
  })
  return out
}

// FastAPI validation errors return `detail` as an array of error objects, not a string.
// Rendering that array directly as JSX crashes the page, so always pass errors through this.
export const getErrorMessage = (err, fallback = 'Something went wrong') => {
  const detail = err?.response?.data?.detail
  if (!detail) return fallback
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join('; ')
  }
  return fallback
}

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => {
    const params = new URLSearchParams()
    params.append('username', data.email)
    params.append('password', data.password)
    return api.post('/auth/login', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
  me: () => api.get('/auth/me'),
  listUsers: () => api.get('/auth/users'),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
}

export const interns = {
  list: (params) => api.get('/interns', { params: cleanParams(params) }),
  get: (id) => api.get(`/interns/${id}`),
  create: (data) => api.post('/interns', data),
  update: (id, data) => api.put(`/interns/${id}`, data),
  delete: (id) => api.delete(`/interns/${id}`),
}

export const taskLibrary = {
  list: (params) => api.get('/task-library', { params: cleanParams(params) }),
  get: (id) => api.get(`/task-library/${id}`),
  create: (data) => api.post('/task-library', data),
  update: (id, data) => api.put(`/task-library/${id}`, data),
  delete: (id) => api.delete(`/task-library/${id}`),
}

export const tasks = {
  list: (params) => api.get('/tasks', { params: cleanParams(params) }),
  get: (id) => api.get(`/tasks/${id}`),
  assign: (data) => api.post('/tasks', { ...data, due_date: data.due_date || null }),
  update: (id, data) => api.put(`/tasks/${id}`, { ...data, due_date: data.due_date || null }),
  delete: (id) => api.delete(`/tasks/${id}`),
}

export const emailTemplates = {
  list: () => api.get('/email-templates'),
  get: (role) => api.get(`/email-templates/${encodeURIComponent(role)}`),
  update: (role, data) => api.put(`/email-templates/${encodeURIComponent(role)}`, data),
}

export const emails = {
  preview: (internId, data) => api.post(`/emails/preview/${internId}`, data || {}),
  send: (internId, data) => api.post(`/emails/send/${internId}`, data),
}

export const assistant = {
  listConversations: () => api.get('/assistant/conversations'),
  createConversation: () => api.post('/assistant/conversations'),
  getConversation: (id) => api.get(`/assistant/conversations/${id}`),
  deleteConversation: (id) => api.delete(`/assistant/conversations/${id}`),
  sendMessage: (id, message) => api.post(`/assistant/conversations/${id}/messages`, { message }),
}
