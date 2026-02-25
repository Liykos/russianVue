<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { user, error, isLoading, signup, signin } = useAuth()

const email = ref('')
const password = ref('')
const name = ref('')
const mode = ref<'signin' | 'signup'>('signin')

const toggleMode = () => {
  mode.value = mode.value === 'signin' ? 'signup' : 'signin'
  error.value = null
}

const handleSubmit = async () => {
  let success = false

  if (mode.value === 'signup') {
    success = await signup(email.value, password.value, name.value)
  } else {
    success = await signin(email.value, password.value)
  }

  if (success) {
    await router.push('/review')
  }
}

watch(
  () => user.value,
  async (nextUser) => {
    if (nextUser) {
      await router.push('/review')
    }
  }
)
</script>

<template>
  <div class="auth-container">
    <div class="form-card">
      <h2>{{ mode === 'signin' ? '用户登录' : '用户注册' }}</h2>

      <form @submit.prevent="handleSubmit">
        <div v-if="mode === 'signup'">
          <label>姓名 (可选)</label>
          <input v-model="name" type="text" placeholder="请输入昵称" :disabled="isLoading">
        </div>

        <label>邮箱</label>
        <input v-model="email" type="email" required placeholder="请输入邮箱" :disabled="isLoading">

        <label>密码</label>
        <input v-model="password" type="password" required placeholder="请输入密码" :disabled="isLoading">

        <p v-if="error" class="error-message">{{ error }}</p>

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? '处理中...' : mode === 'signin' ? '登录' : '注册' }}
        </button>
      </form>

      <p class="toggle-link" @click="toggleMode">
        {{ mode === 'signin' ? '没有账号？去注册' : '已有账号？去登录' }}
      </p>
    </div>
  </div>
</template>
<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  color: var(--text-main);
}

.form-card {
  width: min(420px, 100%);
  padding: 35px;
  border-radius: 18px;
  background: var(--surface);
  border: 1px solid var(--surface-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 12px 28px rgba(18, 29, 44, 0.12);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.8em;
  font-weight: 700;
  color: var(--text-main);
}

label {
  display: block;
  margin-bottom: 5px;
  font-size: 0.9em;
  font-weight: 500;
  color: var(--text-main);
}

input {
  width: 100%;
  padding: 12px 15px;
  margin-bottom: 20px;
  border-radius: 10px;
  background-color: #fff;
  border: 1px solid #d3dbe5;
  box-sizing: border-box;
  color: var(--text-main);
  transition: all 0.3s ease;
}

input::placeholder {
  color: var(--text-muted);
}

input:focus {
  outline: none;
  border-color: rgba(31, 122, 224, 0.6);
  box-shadow: 0 0 0 4px rgba(31, 122, 224, 0.2);
  background-color: #fff;
}

button {
  width: 100%;
  padding: 14px;
  margin-top: 10px;
  margin-bottom: 10px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 1.1em;
  cursor: pointer;
  background-color: var(--brand);
  color: #fff;
  transition: background-color 0.3s, box-shadow 0.3s;
  box-shadow: 0 6px 14px rgba(31, 122, 224, 0.22);
}

button:hover:not([disabled]) {
  background-color: var(--brand-strong);
  box-shadow: 0 8px 16px rgba(31, 122, 224, 0.3);
}

button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}

.error-message {
  color: var(--danger);
  margin-top: -5px;
  margin-bottom: 15px;
  font-size: 0.9em;
  text-align: center;
}

.toggle-link {
  text-align: center;
  color: var(--brand);
  cursor: pointer;
  margin-top: 20px;
  opacity: 0.9;
  font-size: 0.95em;
  transition: opacity 0.3s;
}

.toggle-link:hover {
  opacity: 1;
  text-decoration: underline;
}

@media (max-width: 520px) {
  .form-card {
    padding: 24px 18px;
    border-radius: 14px;
  }

  h2 {
    margin-bottom: 22px;
    font-size: 1.5rem;
  }
}
</style>
