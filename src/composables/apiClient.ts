import axios, { AxiosHeaders } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const TOKEN_KEY = 'russian_app_token'

let accessToken: string | null = null

const readStoredToken = () => {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

accessToken = readStoredToken()

export const setAccessToken = (token: string | null) => {
  accessToken = token
  if (typeof window === 'undefined') return
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token)
  } else {
    window.localStorage.removeItem(TOKEN_KEY)
  }
}

export const getAccessToken = () => accessToken

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
})

apiClient.interceptors.request.use((config) => {
  if (!config.headers) config.headers = new AxiosHeaders()
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return config
})
