<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import NavigationBar from '@/components/NavigationBar.vue'
import { type Word, useWordService } from '@/composables/useWordService'

const route = useRoute()
const router = useRouter()
const { fetchWordDetail, markForgotten, wordError, isWordLoading } = useWordService()

const word = ref<Word | null>(null)
const message = ref<string | null>(null)
const isMarking = ref(false)

const wordId = computed(() => Number(route.params.id))

const loadDetail = async () => {
  if (!Number.isFinite(wordId.value)) return
  word.value = await fetchWordDetail(wordId.value)
}

const speakRussian = (text: string) => {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ru-RU'
  window.speechSynthesis.speak(utterance)
}

const addToForgotten = async () => {
  if (!word.value || isMarking.value) return
  isMarking.value = true
  const result = await markForgotten(word.value.id)
  if (result) {
    message.value = '已加入遗忘词，将在今日学习计划中优先出现。'
    await loadDetail()
  }
  isMarking.value = false
}

onMounted(loadDetail)
watch(() => route.params.id, loadDetail)
</script>

<template>
  <NavigationBar />
  <div class="page-container">
    <div class="top-actions">
      <button class="back-btn" @click="router.back()">返回上页</button>
      <button class="home-btn" @click="router.push('/review')">复习中心</button>
    </div>

    <p v-if="wordError" class="error-message">{{ wordError }}</p>
    <p v-if="message" class="success-message">{{ message }}</p>

    <div v-if="isWordLoading && !word" class="card">加载中...</div>

    <div v-else-if="word" class="card">
      <div class="title-row">
        <h2>{{ word.russian }}</h2>
        <span class="tag" :class="word.reviewType">{{ word.reviewType === 'new' ? '新词' : word.reviewType === 'forgotten' ? '遗忘词' : '复习词' }}</span>
      </div>
      <p class="subtitle">{{ word.bookTitle || '未归属词书' }}</p>

      <div class="section">
        <div class="label">释义</div>
        <div class="value">{{ word.chinese }}</div>
      </div>

      <div class="section">
        <div class="label">发音</div>
        <div class="value">{{ word.pronunciation || '暂无发音标注' }}</div>
        <button class="mini-btn" @click="speakRussian(word.russian)">朗读</button>
      </div>

      <div class="section">
        <div class="label">例句</div>
        <div class="value">{{ word.exampleSentence || '暂无例句' }}</div>
      </div>

      <div class="section">
        <div class="label">衍生词</div>
        <div class="value">{{ word.derivatives.length ? word.derivatives.join('、') : '暂无衍生词' }}</div>
      </div>

      <div class="section">
        <div class="label">备注</div>
        <div class="value">{{ word.note || '暂无备注' }}</div>
      </div>

      <div class="action-row">
        <button class="forget-btn" :disabled="isMarking" @click="addToForgotten">
          {{ isMarking ? '处理中...' : '加入我的遗忘词' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 760px;
  margin: 0 auto;
  padding: 18px 18px 40px;
}
.top-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.back-btn {
  border: none;
  background: #e7eef7;
  color: #244a72;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
}
.home-btn {
  border: none;
  background: #1f7ae0;
  color: #fff;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
}
.card {
  margin-top: 14px;
  padding: 22px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 12px 30px rgba(16, 24, 40, 0.12);
}
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.title-row h2 {
  margin: 0;
  font-size: 2.2rem;
}
.tag {
  border-radius: 999px;
  padding: 5px 11px;
  font-size: 0.86rem;
}
.tag.new { background: #e2efff; color: #2a5f9c; }
.tag.forgotten { background: #ffe4e0; color: #ad3b31; }
.tag.review { background: #e4f6e8; color: #2c7a47; }
.subtitle { color: #697684; margin-top: 6px; }
.section { margin-top: 16px; }
.label { font-size: 0.85rem; color: #778392; margin-bottom: 6px; }
.value { font-size: 1rem; color: #24303b; }
.mini-btn {
  margin-top: 8px;
  border: none;
  background: #eef4fc;
  color: #295688;
  border-radius: 9px;
  padding: 6px 10px;
  cursor: pointer;
}
.action-row { margin-top: 22px; }
.forget-btn {
  border: none;
  background: #ffedea;
  color: #c74438;
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
}
.error-message { color: #c5372d; margin-top: 12px; }
.success-message { color: #2f8550; margin-top: 12px; }
</style>
