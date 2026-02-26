<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import NavigationBar from '@/components/NavigationBar.vue'
import { type WordBook, type WordBookDetail, useWordService } from '@/composables/useWordService'

const router = useRouter()
const { listWordBooks, getWordBook, importWordBook, restartWordBook, fetchStudySettings, wordError } = useWordService()

const books = ref<WordBook[]>([])
const selectedBook = ref<WordBookDetail | null>(null)
const currentBookTitle = ref<string | null>(null)
const isLoading = ref(false)
const isImporting = ref(false)
const isRestarting = ref(false)
const message = ref<string | null>(null)

const loadBooks = async () => {
  isLoading.value = true
  const [bookList, settings] = await Promise.all([listWordBooks(), fetchStudySettings()])
  books.value = bookList ?? []
  currentBookTitle.value = settings?.currentBook?.title ?? null

  const currentBook = books.value.find((item) => item.isCurrent)
  const target = currentBook ?? books.value[0]
  if (target) {
    selectedBook.value = await getWordBook(target.id)
  }

  isLoading.value = false
}

const openBook = async (bookId: number) => {
  message.value = null
  selectedBook.value = await getWordBook(bookId)
}

const startStudy = async () => {
  if (!selectedBook.value || isImporting.value) return
  isImporting.value = true
  message.value = null

  const result = await importWordBook(selectedBook.value.id)
  if (result) {
    message.value = `${result.message} 新增 ${result.imported}，更新 ${result.updated}。`
    currentBookTitle.value = result.currentBook.title
    await loadBooks()
  }

  isImporting.value = false
}

const restartStudy = async () => {
  if (!selectedBook.value || isRestarting.value) return
  const confirmed = window.confirm(`确认把《${selectedBook.value.title}》重置为重新学习吗？`)
  if (!confirmed) return

  isRestarting.value = true
  message.value = null

  const result = await restartWordBook(selectedBook.value.id)
  if (result) {
    message.value = `${result.message} 共重置 ${result.resetCount} 个单词。`
    currentBookTitle.value = result.currentBook.title
    await loadBooks()
  }

  isRestarting.value = false
}

onMounted(loadBooks)
</script>

<template>
  <NavigationBar />
  <div class="page-container">
    <div class="top-row">
      <div>
        <h2>我在学的单词书</h2>
        <p class="subtitle">当前在学：{{ currentBookTitle || '未设置' }}</p>
      </div>
      <button class="back-btn" @click="router.push('/review')">返回复习中心</button>
    </div>

    <p v-if="wordError" class="error-message">{{ wordError }}</p>
    <p v-if="message" class="success-message">{{ message }}</p>

    <div class="layout">
      <div class="book-list">
        <div v-if="isLoading" class="placeholder">加载中...</div>
        <button
          v-for="book in books"
          :key="book.id"
          class="book-item"
          :class="{ active: selectedBook?.id === book.id }"
          @click="openBook(book.id)"
        >
          <div class="row-title">
            <span class="book-title">{{ book.title }}</span>
            <span v-if="book.isCurrent" class="current-tag">在学中</span>
          </div>
          <div class="book-meta">{{ book.level || '通用' }} · {{ book.totalWords }} 词</div>
        </button>
      </div>

      <div class="book-detail" v-if="selectedBook">
        <h3>{{ selectedBook.title }}</h3>
        <p>{{ selectedBook.description || '暂无描述' }}</p>
        <p class="meta">{{ selectedBook.level || '通用' }} · {{ selectedBook.totalWords }} 词 · 来源 {{ selectedBook.source || '未知' }}</p>

        <div class="book-actions">
          <button class="import-btn" :disabled="isImporting" @click="startStudy">
            {{ isImporting ? '处理中...' : '一键导入并设为在学词书' }}
          </button>
          <button class="restart-btn" :disabled="isRestarting" @click="restartStudy">
            {{ isRestarting ? '重置中...' : '重新学习本词书' }}
          </button>
          <button class="review-btn" @click="router.push('/review')">返回复习中心</button>
        </div>

        <h4>示例词条</h4>
        <ul>
          <li v-for="entry in selectedBook.sampleEntries" :key="entry.id">
            <strong>{{ entry.russian }}</strong> - {{ entry.chinese }}
            <span v-if="entry.exampleSentence">（{{ entry.exampleSentence }}）</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 18px 20px 50px;
}
.top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}
.top-row h2 {
  margin: 0;
  font-size: var(--fs-display);
}

.subtitle {
  color: #5f6975;
  margin-top: 6px;
  font-size: var(--fs-body);
}

.layout { display: grid; grid-template-columns: 320px 1fr; gap: 18px; }
.book-list, .book-detail {
  background: rgba(255, 255, 255, 0.84);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 10px 24px rgba(16, 24, 40, 0.08);
}
.book-item {
  width: 100%;
  border: 1px solid #dce4ef;
  border-radius: 12px;
  padding: 10px;
  text-align: left;
  background: #fff;
  margin-bottom: 10px;
  cursor: pointer;
}
.book-item.active { border-color: #1f7ae0; background: #eef6ff; }
.row-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}
.book-title {
  font-weight: 700;
  font-size: var(--fs-body);
}
.current-tag {
  background: #ddf5e4;
  color: #2d7d47;
  border-radius: 999px;
  padding: 3px 8px;
  font-size: var(--fs-caption);
}
.book-meta {
  color: #6a7480;
  font-size: var(--fs-caption);
  margin-top: 4px;
}

.book-detail h3 {
  margin: 0;
  font-size: var(--fs-title);
}

.book-detail p {
  font-size: var(--fs-body);
}

.book-detail h4 {
  margin-top: 18px;
  margin-bottom: 8px;
  font-size: var(--fs-section);
}

.book-detail ul {
  margin: 0;
  padding-left: 18px;
}

.book-detail li {
  margin-top: 6px;
  font-size: var(--fs-body);
}

.meta {
  color: #6a7480;
  font-size: var(--fs-caption);
}
.import-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  background: #1f7ae0;
  color: #fff;
  cursor: pointer;
  font-weight: 700;
}
.restart-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  background: #ffe9e5;
  color: #b64136;
  cursor: pointer;
  font-weight: 700;
}
.review-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  background: #edf2fa;
  color: #2c4f75;
  cursor: pointer;
}
.book-actions {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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
.error-message { color: #c5372d; }
.success-message { color: #2f8850; }
@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  .top-row { flex-direction: column; align-items: flex-start; }
  .back-btn {
    width: 100%;
  }
  .book-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .book-actions button {
    width: 100%;
  }
}
</style>
