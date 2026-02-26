<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import NavigationBar from '@/components/NavigationBar.vue'
import { type Word, useWordService } from '@/composables/useWordService'

const router = useRouter()
const { fetchForgottenWords, wordError, isWordLoading } = useWordService()

const words = ref<Word[]>([])
const keyword = ref('')

const filteredWords = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return words.value
  return words.value.filter((w) => `${w.russian} ${w.chinese}`.toLowerCase().includes(q))
})

const loadWords = async () => {
  const data = await fetchForgottenWords()
  words.value = data ?? []
}

const openWord = (wordId: number) => {
  router.push(`/word/${wordId}`)
}

onMounted(loadWords)
</script>

<template>
  <NavigationBar />
  <div class="page-container">
    <div class="top-row">
      <div>
        <h2>我的遗忘词</h2>
        <p class="subtitle">这里保存你历史上点过“不会”或手动加入遗忘的单词。</p>
      </div>
      <button class="back-btn" @click="router.push('/review')">返回复习中心</button>
    </div>

    <input v-model="keyword" class="search-input" type="text" placeholder="搜索遗忘词">

    <p v-if="wordError" class="error-message">{{ wordError }}</p>
    <div v-if="isWordLoading" class="card">加载中...</div>
    <div v-else-if="filteredWords.length === 0" class="card">暂无遗忘词记录。</div>

    <div v-else class="list">
      <button v-for="word in filteredWords" :key="word.id" class="list-item" @click="openWord(word.id)">
        <div class="row-top">
          <strong>{{ word.russian }}</strong>
          <span class="count">遗忘 {{ word.forgottenCount }} 次</span>
        </div>
        <div class="row-bottom">{{ word.chinese }}</div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 760px;
  margin: 0 auto;
  padding: 18px 18px 44px;
}
.top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}
.subtitle {
  color: #62707e;
  margin-bottom: 12px;
  font-size: var(--fs-body);
}
.back-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 12px;
  background: #edf2fa;
  color: #2c4f75;
  cursor: pointer;
  font-weight: 700;
}
.search-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #d6dfe9;
  box-sizing: border-box;
  font-size: var(--fs-body);
}
.list {
  margin-top: 14px;
  display: grid;
  gap: 10px;
}
.list-item {
  text-align: left;
  border: none;
  padding: 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 8px 20px rgba(16, 24, 40, 0.08);
  cursor: pointer;
}
.row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.count {
  color: #a23f35;
  background: #ffeae6;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: var(--fs-caption);
}
.row-bottom {
  margin-top: 6px;
  color: #42505f;
  font-size: var(--fs-body);
}
.card {
  margin-top: 14px;
  padding: 18px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.84);
  font-size: var(--fs-body);
}
.error-message { color: #c5372d; margin-top: 12px; }

.top-row h2 {
  margin: 0;
  font-size: var(--fs-display);
}

@media (max-width: 760px) {
  .top-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .back-btn {
    width: 100%;
  }
}
</style>
