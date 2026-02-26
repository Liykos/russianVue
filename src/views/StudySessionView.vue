<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import NavigationBar from '@/components/NavigationBar.vue'
import { type StudyPlan, type Word, useWordService } from '@/composables/useWordService'

const router = useRouter()
const { fetchTodayPlan, submitReview, wordError, isWordLoading } = useWordService()

const plan = ref<StudyPlan | null>(null)
const wordsQueue = ref<Word[]>([])
const currentIndex = ref(0)
const isSubmitting = ref(false)

const currentWord = computed(() => wordsQueue.value[currentIndex.value] ?? null)
const totalCount = computed(() => wordsQueue.value.length)
const studiedCount = computed(() => Math.min(currentIndex.value, totalCount.value))
const progressPercent = computed(() => (totalCount.value ? Math.round((studiedCount.value / totalCount.value) * 100) : 0))
const activeBookTitle = computed(() => plan.value?.activeBook?.title || '未设置在学词书')
const isFinished = computed(() => totalCount.value > 0 && !currentWord.value)

const reviewTypeText = (value: string) => {
  if (value === 'new') return '新词'
  if (value === 'forgotten') return '遗忘词'
  return '复习词'
}

const markAsForgotten = (word: Word): Word => ({
  ...word,
  state: 'forgotten',
  reviewType: 'forgotten',
  forgottenCount: word.forgottenCount + 1
})

const loadTodayPlan = async () => {
  const result = await fetchTodayPlan()
  plan.value = result
  wordsQueue.value = result?.words ?? []
  currentIndex.value = 0
}

const answerCurrentWord = async (quality: number) => {
  if (!currentWord.value || isSubmitting.value) return
  isSubmitting.value = true

  const reviewedWord = currentWord.value
  const reviewResult = await submitReview(reviewedWord.id, quality)
  if (reviewResult) {
    if (quality < 3) {
      wordsQueue.value.push(markAsForgotten(reviewedWord))
    }
    currentIndex.value += 1
  }

  isSubmitting.value = false
}

const onKnow = async () => {
  await answerCurrentWord(5)
}

const onDontKnow = async () => {
  await answerCurrentWord(0)
}

const openWordDetail = async (wordId: number) => {
  await router.push({ name: 'WordDetail', params: { id: String(wordId) } })
}

const speakRussian = (word: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.lang = 'ru-RU'
  window.speechSynthesis.speak(utterance)
}

onMounted(loadTodayPlan)
</script>

<template>
  <NavigationBar />
  <div class="page-container">
    <header class="header-row">
      <div>
        <h1>学习页</h1>
        <p>{{ activeBookTitle }}</p>
      </div>
      <div class="header-actions">
        <button @click="router.push('/review/words')">我的词表</button>
        <button @click="router.push('/review')">返回首页</button>
      </div>
    </header>

    <section class="hero-card">
      <div class="progress-row">
        <span>学习进度 {{ studiedCount }} / {{ totalCount }}</span>
        <span>{{ progressPercent }}%</span>
      </div>
      <div class="meter-track">
        <div class="meter-fill" :style="{ width: `${progressPercent}%` }"></div>
      </div>
      <div class="meta-row">
        <span>新词 {{ plan?.newCount ?? 0 }}</span>
        <span>遗忘词 {{ plan?.forgottenCount ?? 0 }}</span>
        <span>复习词 {{ plan?.reviewCount ?? 0 }}</span>
      </div>
    </section>

    <p v-if="wordError" class="error-message">{{ wordError }}</p>

    <section v-if="isWordLoading && !currentWord" class="status-card">正在加载今日任务...</section>

    <section v-else-if="currentWord" class="study-card">
      <div class="card-top">
        <span class="type-chip">{{ reviewTypeText(currentWord.reviewType) }}</span>
        <span class="book-chip">{{ currentWord.bookTitle || activeBookTitle }}</span>
      </div>

      <div class="word-text" @click="openWordDetail(currentWord.id)">{{ currentWord.russian }}</div>

      <div class="pronounce-row">
        <span>{{ currentWord.pronunciation || '点击朗读播放发音' }}</span>
        <button class="audio-btn" @click="speakRussian(currentWord.russian)">朗读</button>
      </div>

      <div class="tip">点击单词直接跳详情页</div>

      <div class="action-buttons">
        <button class="again" :disabled="isSubmitting" @click="onDontKnow">不会</button>
        <button class="good" :disabled="isSubmitting" @click="onKnow">会</button>
      </div>
    </section>

    <section v-else-if="isFinished" class="status-card">
      <h3>今日计划完成</h3>
      <p>你已完成当前学习任务。</p>
      <button @click="loadTodayPlan">重新加载</button>
    </section>

    <section v-else class="status-card">暂无可学习单词，请先导入词书。</section>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 860px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
}

.header-row h1 {
  margin: 0;
  font-size: var(--fs-display);
}

.header-row p {
  margin: 6px 0 0;
  color: #5f7187;
  font-size: var(--fs-body);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.header-actions button,
.audio-btn,
.status-card button {
  border: none;
  border-radius: 10px;
  padding: 9px 12px;
  cursor: pointer;
  font-weight: 700;
}

.header-actions button:first-child {
  background: #edf2fa;
  color: #314f72;
}

.header-actions button:last-child,
.status-card button {
  background: #1f7ae0;
  color: #fff;
}

.hero-card,
.study-card,
.status-card {
  margin-top: 14px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 10px 24px rgba(16, 24, 40, 0.1);
}

.progress-row {
  display: flex;
  justify-content: space-between;
  color: #465a70;
  font-size: var(--fs-caption);
}

.meter-track {
  margin-top: 8px;
  width: 100%;
  height: 9px;
  border-radius: 999px;
  background: #e5eef9;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  background: linear-gradient(90deg, #1f7ae0 0%, #49a5f3 100%);
  transition: width 0.25s ease;
}

.meta-row {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-row span {
  background: #eef4fb;
  color: #43586e;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: var(--fs-caption);
}

.card-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.type-chip,
.book-chip {
  border-radius: 999px;
  padding: 4px 9px;
  font-size: var(--fs-caption);
}

.type-chip {
  background: #dff0ff;
  color: #23639f;
}

.book-chip {
  background: #edf2fa;
  color: #425a74;
}

.word-text {
  margin-top: 14px;
  font-size: clamp(2.1rem, 9vw, 3rem);
  font-weight: 900;
  text-align: center;
  cursor: pointer;
  line-height: 1.15;
}

.pronounce-row {
  margin-top: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: #4f6175;
  font-size: var(--fs-body);
}

.audio-btn {
  background: #dfeaf9;
  color: #1f4c7c;
}

.tip {
  margin-top: 10px;
  color: #5f6f81;
  text-align: center;
  font-size: var(--fs-caption);
}

.action-buttons {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.action-buttons button {
  border: none;
  border-radius: 12px;
  height: 50px;
  font-weight: 800;
  cursor: pointer;
  font-size: var(--fs-body);
}

.again {
  background: #ffe3df;
  color: #c43b30;
}

.good {
  background: #dff7e7;
  color: #2a7f45;
}

.status-card {
  text-align: center;
}

.status-card h3 {
  margin-top: 0;
  font-size: var(--fs-title);
}

.status-card p,
.status-card {
  font-size: var(--fs-body);
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

  .word-text {
    font-size: clamp(1.9rem, 10vw, 2.35rem);
  }

  .header-actions {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .header-actions button {
    width: 100%;
  }

  .pronounce-row {
    flex-direction: column;
    gap: 8px;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
