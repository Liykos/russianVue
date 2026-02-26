<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { logout } = useAuth()

const navigate = (path: string) => {
  if (router.currentRoute.value.path !== path) {
    router.push(path)
  }
}

const handleLogout = async () => {
  await logout()
  await router.push('/auth')
}
</script>

<template>
  <nav class="navigation-bar">
    <div class="logo" @click="navigate('/review')">SRS 俄语单词 for Kaya 💖</div>
    <div class="nav-links">
      <button 
        @click="navigate('/review')" 
        :class="{ 'active': router.currentRoute.value.path.startsWith('/review') }"
      >
        复习中心
      </button>
      <button
        @click="navigate('/books')"
        :class="{ 'active': router.currentRoute.value.path === '/books' }"
      >
        单词书
      </button>
      <button
        @click="navigate('/forgotten')"
        :class="{ 'active': router.currentRoute.value.path === '/forgotten' }"
      >
        我的遗忘词
      </button>
      
      <button @click="handleLogout">登出</button>
    </div>
  </nav>
</template>

<style scoped>
/* 遵循我们之前定义的简约、透明风格 */
.navigation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  
  /* 玻璃拟态导航栏 */
  background-color: rgba(255, 255, 255, 0.2); 
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
}
.logo {
  font-size: clamp(1.16rem, 4.3vw, 1.38rem);
  font-weight: 700;
  color: #007aff;
  cursor: pointer; /* 增加点击效果，点击 logo 回主页 */
}
.nav-links button {
  background: none;
  border: none;
  color: #333;
  font-size: clamp(0.9rem, 2.8vw, 0.97rem);
  padding: 8px 11px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s, color 0.2s;
}
.nav-links button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
.nav-links button.active {
    background-color: rgba(0, 122, 255, 0.1); /* 蓝色背景表示当前页 */
    color: #007aff;
    font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

@media (max-width: 760px) {
  .navigation-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .logo {
    text-align: center;
  }

  .nav-links {
    justify-content: center;
  }
}
</style>
