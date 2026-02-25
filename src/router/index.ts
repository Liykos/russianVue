import { createRouter, createWebHistory } from 'vue-router'

import { useAuth } from '@/composables/useAuth'
import AuthView from '@/views/AuthView.vue'
import ReviewView from '@/views/ReviewView.vue'
import ForgottenWordsView from '@/views/ForgottenWordsView.vue'
import MyWordsView from '@/views/MyWordsView.vue'
import StudySessionView from '@/views/StudySessionView.vue'
import WordDetailView from '@/views/WordDetailView.vue'
import WordbooksView from '@/views/WordbooksView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      name: 'Auth',
      component: AuthView
    },
    {
      path: '/review',
      name: 'Review',
      component: ReviewView,
      meta: { requiresAuth: true }
    },
    {
      path: '/review/study',
      name: 'StudySession',
      component: StudySessionView,
      meta: { requiresAuth: true }
    },
    {
      path: '/review/words',
      name: 'MyWords',
      component: MyWordsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/books',
      name: 'Books',
      component: WordbooksView,
      meta: { requiresAuth: true }
    },
    {
      path: '/import',
      redirect: '/books'
    },
    {
      path: '/forgotten',
      name: 'Forgotten',
      component: ForgottenWordsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/word/:id',
      name: 'WordDetail',
      component: WordDetailView,
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      redirect: '/review'
    }
  ]
})

router.beforeEach(async (to) => {
  const auth = useAuth()
  await auth.ensureSession()

  if (to.meta.requiresAuth && !auth.isAuthenticated.value) {
    return '/auth'
  }

  if (to.path === '/auth' && auth.isAuthenticated.value) {
    return '/review'
  }

  return true
})

export default router
