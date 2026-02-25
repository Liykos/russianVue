<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import NavigationBar from '@/components/NavigationBar.vue'
import { type StudyPlan, type WordSearchItem, useWordService } from '@/composables/useWordService'

const router = useRouter()
const { fetchTodayPlan, updateStudySettings, searchWords, wordError, isWordLoading } = useWordService()

const plan = ref<StudyPlan | null>(null)
const dailyTargetInput = ref(20)
const isSavingGoal = ref(false)

const searchKeyword = ref('')
const searchResults = ref<WordSearchItem[]>([])
const isSearching = ref(false)
const searchedOnce = ref(false)

const activeBookTitle = computed(() => plan.value?.activeBook?.title || '未设置在学词书')
const todayTotal = computed(() => plan.value?.words.length ?? 0)
const reviewTypeText = (value: string) => {
  if (value === 'new') return '新词'
  if (value === 'forgotten') return '遗忘词'
  return '复习词'
}

const loadTodayPlan = async () => {
  const result = await fetchTodayPlan()
  plan.value = result
  dailyTargetInput.value = result?.dailyTarget ?? 20
}

const saveDailyTarget = async () => {
  if (isSavingGoal.value) return
  const normalized = Math.max(1, Math.min(200, Number(dailyTargetInput.value) || 20))
  dailyTargetInput.value = normalized
  isSavingGoal.value = true
  const saved = await updateStudySettings(normalized)
  if (saved) await loadTodayPlan()
  isSavingGoal.value = false
}

const runSearch = async () => {
  searchedOnce.value = true
  isSearching.value = true
  const result = await searchWords(searchKeyword.value)
  searchResults.value = result ?? []
  isSearching.value = false
}

const openWordDetail = async (wordId: number) => {
  await router.push({ name: 'WordDetail', params: { id: String(wordId) } })
}

const goStudy = async () => {
  await router.push({ name: 'StudySession' })
}

const goMyWords = async () => {
  await router.push({ name: 'MyWords' })
}

onMounted(loadTodayPlan)
</script>

<template>
  <NavigationBar />
  <div class="page-container">
    <header class="page-header">
      <h1>复习中心</h1>
      <p>先查词，再进入学习流程。</p>
    </header>

    <section class="search-card">
      <div class="section-title">查单词</div>
      <form class="search-row" @submit.prevent="runSearch">
        <input v-model="searchKeyword" type="text" placeholder="输入俄语或中文，回车搜索">
        <button type="submit">{{ isSearching ? '搜索中...' : '搜索' }}</button>
      </form>
      <div v-if="searchResults.length" class="search-results">
        <button
          v-for="item in searchResults"
          :key="item.id"
          type="button"
          class="search-item"
          @click="openWordDetail(item.id)"
        >
          <strong>{{ item.russian }}</strong>
          <span class="search-meaning">{{ item.chinese }}</span>
          <span class="item-meta">{{ item.bookTitle || '未归属词书' }} · {{ item.isForgotten ? '遗忘记录' : '普通词' }}</span>
        </button>
      </div>
      <p v-else-if="searchedOnce && !isSearching" class="hint-text">未找到匹配单词。</p>
    </section>

    <section class="hero-card">
      <div class="hero-head">
        <div>
          <div class="hero-label">当前在学词书</div>
          <div class="hero-book">{{ activeBookTitle }}</div>
        </div>
        <button class="book-btn" @click="router.push('/books')">切换词书</button>
      </div>

      <div class="goal-row">
        <div class="goal-title">今日目标</div>
        <div class="goal-inputs">
          <input v-model.number="dailyTargetInput" type="number" min="1" max="200">
          <button :disabled="isSavingGoal" @click="saveDailyTarget">{{ isSavingGoal ? '保存中...' : '保存' }}</button>
        </div>
      </div>

      <div class="meta-row">
        <span>今日总词 {{ todayTotal }}</span>
        <span>新词 {{ plan?.newCount ?? 0 }}</span>
        <span>遗忘词 {{ plan?.forgottenCount ?? 0 }}</span>
        <span>复习词 {{ plan?.reviewCount ?? 0 }}</span>
      </div>
    </section>

    <section class="actions-card">
      <button class="action-main" @click="goStudy">去学习</button>
      <button class="action-sub" @click="goMyWords">我的词表</button>
    </section>

    <section class="preview-card">
      <div class="section-title">今日词表预览</div>
      <div class="preview-list">
        <button
          v-for="word in plan?.words || []"
          :key="word.id"
          type="button"
          class="preview-item"
          @click="openWordDetail(word.id)"
        >
          <span>{{ word.russian }}</span>
          <small>{{ reviewTypeText(word.reviewType) }}</small>
        </button>
      </div>
    </section>

    <p v-if="wordError" class="error-message">{{ wordError }}</p>
    <div v-if="isWordLoading" class="status">数据加载中...</div>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 980px;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
}

.page-header p {
  margin: 6px 0 0;
  color: #5d7088;
}

.search-card,
.hero-card,
.actions-card,
.preview-card {
  margin-top: 14px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 10px 24px rgba(16, 24, 40, 0.1);
}

.section-title {
  font-size: 1.04rem;
  font-weight: 800;
  color: #22374d;
  margin-bottom: 10px;
}

.search-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}

.search-row input,
.goal-inputs input {
  width: 100%;
  border: 1px solid #d4dce7;
  border-radius: 10px;
  padding: 10px 12px;
}

.search-row button,
.goal-inputs button,
.action-main,
.action-sub,
.book-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 700;
}

.search-row button,
.goal-inputs button,
.action-main {
  background: #1f7ae0;
  color: #fff;
}

.search-results {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}

.search-item {
  border: 1px solid #e2e8f2;
  border-radius: 12px;
  padding: 10px 12px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  display: grid;
  gap: 3px;
}

.search-meaning {
  color: #2d3f54;
}

.item-meta {
  font-size: 0.82rem;
  color: #6b7b8d;
}

.hint-text {
  margin-top: 8px;
  color: #697b90;
}

.hero-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.hero-label {
  font-size: 0.86rem;
  color: #64788e;
}

.hero-book {
  margin-top: 4px;
  font-size: 1.34rem;
  font-weight: 800;
  color: #1e3550;
}

.book-btn {
  background: #edf2fa;
  color: #2d557c;
}

.goal-row {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.goal-title {
  font-weight: 700;
}

.goal-inputs {
  display: flex;
  gap: 8px;
}

.goal-inputs input {
  width: 90px;
}

.meta-row {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-row span {
  background: #eef4fb;
  color: #43586e;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 0.82rem;
}

.actions-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.action-main {
  height: 54px;
  font-size: 1rem;
}

.action-sub {
  height: 54px;
  background: #edf2fa;
  color: #304f73;
}

.preview-list {
  display: flex;
  overflow-x: auto;
  gap: 8px;
  padding-bottom: 2px;
}

.preview-item {
  border: 1px solid #dce5f1;
  background: #fff;
  border-radius: 10px;
  padding: 8px 10px;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;
}

.preview-item small {
  margin-top: 4px;
  color: #6d7a87;
}

.status {
  margin-top: 10px;
  color: #556a82;
}

.error-message {
  margin-top: 10px;
  color: #c5372d;
}

@media (max-width: 760px) {
  .search-row {
    grid-template-columns: 1fr;
  }

  .actions-card {
    grid-template-columns: 1fr;
  }

  .hero-head,
  .goal-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
