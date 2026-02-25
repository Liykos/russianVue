<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import NavigationBar from '@/components/NavigationBar.vue'
import { type Word, useWordService } from '@/composables/useWordService'

type FilterType = 'all' | 'today' | 'forgotten'

interface WordWithStatus extends Word {
  inToday: boolean
  inForgotten: boolean
}

const router = useRouter()
const { fetchTodayPlan, fetchForgottenWords, wordError, isWordLoading } = useWordService()

const words = ref<WordWithStatus[]>([])
const currentFilter = ref<FilterType>('all')

const filteredWords = computed(() => {
  if (currentFilter.value === 'today') return words.value.filter((item) => item.inToday)
  if (currentFilter.value === 'forgotten') return words.value.filter((item) => item.inForgotten)
  return words.value
})

const todayCount = computed(() => words.value.filter((item) => item.inToday).length)
const forgottenCount = computed(() => words.value.filter((item) => item.inForgotten).length)

const loadWords = async () => {
  const [todayPlan, forgotten] = await Promise.all([fetchTodayPlan(), fetchForgottenWords()])

  const map = new Map<number, WordWithStatus>()

  for (const word of todayPlan?.words ?? []) {
    map.set(word.id, {
      ...word,
      inToday: true,
      inForgotten: word.reviewType === 'forgotten' || word.forgottenCount > 0
    })
  }

  for (const word of forgotten ?? []) {
    const exists = map.get(word.id)
    if (exists) {
      exists.inForgotten = true
      map.set(word.id, exists)
      continue
    }
    map.set(word.id, {
      ...word,
      inToday: false,
      inForgotten: true
    })
  }

  words.value = Array.from(map.values()).sort((a, b) => a.id - b.id)
}

const openWordDetail = async (wordId: number) => {
  await router.push({ name: 'WordDetail', params: { id: String(wordId) } })
}

onMounted(loadWords)
</script>

<template>
  <NavigationBar />
  <div class="page-container">
    <header class="header-row">
      <div>
        <h1>我的词表</h1>
        <p>可查看单词状态：今日学习 / 遗忘词</p>
      </div>
      <button class="back-btn" @click="router.push('/review')">返回复习首页</button>
    </header>

    <section class="summary-card">
      <span>总计 {{ words.length }}</span>
      <span>今日学习 {{ todayCount }}</span>
      <span>遗忘词 {{ forgottenCount }}</span>
    </section>

    <section class="filter-card">
      <button :class="{ active: currentFilter === 'all' }" @click="currentFilter = 'all'">全部</button>
      <button :class="{ active: currentFilter === 'today' }" @click="currentFilter = 'today'">今日学习</button>
      <button :class="{ active: currentFilter === 'forgotten' }" @click="currentFilter = 'forgotten'">遗忘词</button>
    </section>

    <p v-if="wordError" class="error-message">{{ wordError }}</p>
    <div v-if="isWordLoading" class="status-card">加载中...</div>
    <div v-else-if="filteredWords.length === 0" class="status-card">当前筛选下没有单词。</div>

    <section v-else class="list-card">
      <button
        v-for="word in filteredWords"
        :key="word.id"
        class="word-row"
        @click="openWordDetail(word.id)"
      >
        <div class="row-top">
          <strong>{{ word.russian }}</strong>
          <div class="tags">
            <span v-if="word.inToday" class="tag today">今日学习</span>
            <span v-if="word.inForgotten" class="tag forgotten">遗忘词</span>
          </div>
        </div>
        <div class="row-bottom">{{ word.chinese }}</div>
      </button>
    </section>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 920px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.header-row h1 {
  margin: 0;
  font-size: 2rem;
}

.header-row p {
  margin: 6px 0 0;
  color: #5f7187;
}

.back-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 12px;
  background: #edf2fa;
  color: #314f72;
  cursor: pointer;
  font-weight: 700;
}

.summary-card,
.filter-card,
.list-card,
.status-card {
  margin-top: 14px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 10px 24px rgba(16, 24, 40, 0.1);
}

.summary-card {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.summary-card span {
  background: #eef4fb;
  color: #43586e;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 0.85rem;
}

.filter-card {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-card button {
  border: none;
  border-radius: 999px;
  padding: 7px 12px;
  background: #eef2f7;
  color: #41586e;
  cursor: pointer;
  font-weight: 700;
}

.filter-card button.active {
  background: #1f7ae0;
  color: #fff;
}

.list-card {
  display: grid;
  gap: 10px;
}

.word-row {
  border: 1px solid #e1e8f2;
  border-radius: 12px;
  padding: 12px;
  text-align: left;
  background: #fff;
  cursor: pointer;
}

.row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.tags {
  display: flex;
  gap: 6px;
}

.tag {
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 0.78rem;
}

.tag.today {
  background: #e5f1ff;
  color: #2a5f9a;
}

.tag.forgotten {
  background: #ffe9e5;
  color: #b64136;
}

.row-bottom {
  margin-top: 4px;
  color: #415262;
}

.status-card {
  text-align: center;
}

.error-message {
  margin-top: 10px;
  color: #c5372d;
}

@media (max-width: 760px) {
  .header-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
