import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'
const api = axios.create({ baseURL: API_BASE, timeout: 10000 })

// Attach token from localStorage on each request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('vhp_token')
  if (token) cfg.headers = Object.assign(cfg.headers || {}, { Authorization: `Bearer ${token}` })
  return cfg
})

// Global response interceptor: on 401 clear auth and redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    const status = err?.response?.status
    if (status === 401){
      try{ localStorage.removeItem('vhp_token'); localStorage.removeItem('vhp_user') }catch(e){}
      // emit logout event for app to handle (so context can respond)
      window.dispatchEvent(new Event('vhp:logout'))
      // conservative redirect
      try{ window.location.href = (import.meta.env.BASE_URL || '/') + 'login' }catch(e){}
    }
    return Promise.reject(err)
  }
)

export default {
  // Auth
  async login(email){
    const res = await api.post('/auth/login', { email })
    return res.data
  },

  // Clients & interactions
  async getClients(){ const res = await api.get('/clients'); return res.data },
  async getClient(id){ const res = await api.get(`/clients/${id}`); return res.data },
  async postInteraction(payload){ const res = await api.post('/interactions', payload); return res.data },
  async markClientContact(id, payload={}){ const res = await api.post(`/clients/${id}/contact`, payload); return res.data },
  async getNavigatorPerformance(days=30){ const res = await api.get(`/dashboards/navigator-performance?days=${days}`); return res.data },
  async getLandlordPerformance(){ const res = await api.get('/dashboards/landlord-performance'); return res.data },

  // Templates (admin)
  async listTemplates(){ const res = await api.get('/admin/templates'); return res.data.templates },
  async getTemplate(id){ const res = await api.get(`/admin/templates/${id}`); return res.data.template },
  async createTemplate(payload){ const res = await api.post('/admin/templates', payload); return res.data.template },
  async updateTemplate(id, payload){ const res = await api.put(`/admin/templates/${id}`, payload); return res.data.template },
  async deleteTemplate(id){ const res = await api.delete(`/admin/templates/${id}`); return res.data },
  async previewTemplate({ templateHtml, templateName, clientName, clientId, htmlFallback, navigatorName }){
    const res = await api.post('/admin/preview-email', { templateHtml, templateName, clientName, clientId, htmlFallback, navigatorName })
    return res.data
  }
}
