import { computed, ref } from 'vue'

import { apiClient, getAccessToken, setAccessToken } from '@/composables/apiClient'

interface User {
  id: number
  email: string
  name: string | null
}

interface AuthResponse {
  message: string
  user: User
  access_token: string
  token_type: string
}

const user = ref<User | null>(null)
const error = ref<string | null>(null)
const isLoading = ref(false)
const isReady = ref(false)
let bootstrapPromise: Promise<void> | null = null

const applyAuthResponse = (payload: AuthResponse) => {
  setAccessToken(payload.access_token)
  user.value = payload.user
}

const clearSession = () => {
  setAccessToken(null)
  user.value = null
}

const ensureSession = async () => {
  if (isReady.value) return
  if (bootstrapPromise) {
    await bootstrapPromise
    return
  }

  bootstrapPromise = (async () => {
    const token = getAccessToken()
    if (!token) {
      isReady.value = true
      return
    }

    try {
      const response = await apiClient.get<User>('/auth/me')
      user.value = response.data
    } catch {
      clearSession()
    } finally {
      isReady.value = true
    }
  })()

  await bootstrapPromise
}

export function useAuth() {
  const signup = async (email: string, password: string, name: string = '') => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiClient.post<AuthResponse>('/auth/signup', {
        email,
        password,
        name
      })
      applyAuthResponse(response.data)
      isReady.value = true
      return true
    } catch (e: any) {
      error.value = e.response?.data?.detail || '注册失败，请检查网络或邮箱是否已被注册。'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const signin = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiClient.post<AuthResponse>('/auth/signin', {
        email,
        password
      })
      applyAuthResponse(response.data)
      isReady.value = true
      return true
    } catch (e: any) {
      error.value = e.response?.data?.detail || '登录失败，请检查邮箱和密码。'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // 会话过期时退出仍然按成功处理
    } finally {
      clearSession()
    }
  }

  const isAuthenticated = computed(() => Boolean(user.value && getAccessToken()))

  return {
    user,
    error,
    isLoading,
    isReady,
    isAuthenticated,
    ensureSession,
    signup,
    signin,
    logout
  }
}
