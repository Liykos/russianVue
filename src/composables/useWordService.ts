import { ref } from 'vue'

import { apiClient } from '@/composables/apiClient'

export interface BookLite {
  id: number
  slug: string
  title: string
}

export interface Word {
  id: number
  russian: string
  chinese: string
  pronunciation: string | null
  exampleSentence: string | null
  derivatives: string[]
  note: string | null
  reviewType: 'new' | 'forgotten' | 'review'
  bookId: number | null
  bookTitle: string | null
  reviewCount: number
  forgottenCount: number
  easeFactor: number
  interval: number
  lastReviewDate: string | null
  nextReviewDate: string
  state: string
}

export interface WordSearchItem {
  id: number
  russian: string
  chinese: string
  state: string
  isForgotten: boolean
  bookTitle: string | null
  pronunciation: string | null
  exampleSentence: string | null
}

export interface StudyPlan {
  dailyTarget: number
  newTarget: number
  forgottenTarget: number
  activeBook: BookLite | null
  words: Word[]
  newCount: number
  forgottenCount: number
  reviewCount: number
}

export interface StudySettings {
  dailyTarget: number
  currentBook: BookLite | null
}

export interface WordBook {
  id: number
  slug: string
  title: string
  description: string | null
  language: string
  level: string | null
  source: string | null
  totalWords: number
  isCurrent: boolean
}

export interface WordBookDetail extends WordBook {
  sampleEntries: Array<{
    id: number
    russian: string
    chinese: string
    pronunciation: string | null
    exampleSentence: string | null
    derivatives: string[]
    note: string | null
    orderIndex: number
  }>
}

interface WordImportResponse {
  message: string
  imported: number
  updated: number
}

interface WordBookImportResponse {
  message: string
  imported: number
  updated: number
  currentBook: BookLite
}

interface WordBookRestartResponse {
  message: string
  resetCount: number
  currentBook: BookLite
}

interface WordReviewResponse {
  message: string
  state: string
  nextReviewDate: string
  forgottenCount: number
}

export function useWordService() {
  const wordError = ref<string | null>(null)
  const isWordLoading = ref(false)

  const importWords = async (rawText: string) => {
    isWordLoading.value = true
    wordError.value = null
    try {
      const response = await apiClient.post<WordImportResponse>('/words/import', {
        raw_text: rawText
      })
      return response.data.message
    } catch (e: any) {
      wordError.value = e.response?.data?.detail || '单词导入失败，请检查输入格式或后端服务。'
      return null
    } finally {
      isWordLoading.value = false
    }
  }

  const fetchTodayPlan = async (): Promise<StudyPlan | null> => {
    isWordLoading.value = true
    wordError.value = null
    try {
      const response = await apiClient.get<StudyPlan>('/words/review/today-plan')
      return response.data
    } catch (e: any) {
      wordError.value = e.response?.data?.detail || '加载今日计划失败。'
      return null
    } finally {
      isWordLoading.value = false
    }
  }

  const fetchWordDetail = async (wordId: number): Promise<Word | null> => {
    isWordLoading.value = true
    wordError.value = null
    try {
      const response = await apiClient.get<Word>(`/words/${wordId}`)
      return response.data
    } catch (e: any) {
      wordError.value = e.response?.data?.detail || '获取单词详情失败。'
      return null
    } finally {
      isWordLoading.value = false
    }
  }

  const submitReview = async (wordId: number, quality: number): Promise<WordReviewResponse | null> => {
    isWordLoading.value = true
    wordError.value = null
    try {
      const response = await apiClient.post<WordReviewResponse>('/words/review', {
        word_id: wordId,
        quality
      })
      return response.data
    } catch (e: any) {
      wordError.value = e.response?.data?.detail || '提交复习结果失败。'
      return null
    } finally {
      isWordLoading.value = false
    }
  }

  const fetchStudySettings = async (): Promise<StudySettings | null> => {
    try {
      const response = await apiClient.get<StudySettings>('/auth/settings')
      return response.data
    } catch (e: any) {
      wordError.value = e.response?.data?.detail || '加载学习设置失败。'
      return null
    }
  }

  const updateStudySettings = async (dailyTarget: number): Promise<StudySettings | null> => {
    try {
      const response = await apiClient.put<StudySettings>('/auth/settings', { dailyTarget })
      return response.data
    } catch (e: any) {
      wordError.value = e.response?.data?.detail || '保存学习设置失败。'
      return null
    }
  }

  const listWordBooks = async (): Promise<WordBook[] | null> => {
    try {
      const response = await apiClient.get<WordBook[]>('/books')
      return response.data
    } catch (e: any) {
      wordError.value = e.response?.data?.detail || '加载词书列表失败。'
      return null
    }
  }

  const getWordBook = async (bookId: number): Promise<WordBookDetail | null> => {
    try {
      const response = await apiClient.get<WordBookDetail>(`/books/${bookId}`)
      return response.data
    } catch (e: any) {
      wordError.value = e.response?.data?.detail || '加载词书详情失败。'
      return null
    }
  }

  const importWordBook = async (bookId: number): Promise<WordBookImportResponse | null> => {
    try {
      const response = await apiClient.post<WordBookImportResponse>(`/books/${bookId}/import`)
      return response.data
    } catch (e: any) {
      wordError.value = e.response?.data?.detail || '导入词书失败。'
      return null
    }
  }

  const restartWordBook = async (bookId: number): Promise<WordBookRestartResponse | null> => {
    try {
      const response = await apiClient.post<WordBookRestartResponse>(`/books/${bookId}/restart`)
      return response.data
    } catch (e: any) {
      wordError.value = e.response?.data?.detail || '重新学习失败。'
      return null
    }
  }

  const searchWords = async (q: string): Promise<WordSearchItem[] | null> => {
    if (!q.trim()) return []
    try {
      const response = await apiClient.get<WordSearchItem[]>('/words/search', {
        params: { q: q.trim(), limit: 30 }
      })
      return response.data
    } catch (e: any) {
      wordError.value = e.response?.data?.detail || '搜索单词失败。'
      return null
    }
  }

  const markForgotten = async (wordId: number): Promise<WordReviewResponse | null> => {
    try {
      const response = await apiClient.post<WordReviewResponse>(`/words/${wordId}/mark-forgotten`)
      return response.data
    } catch (e: any) {
      wordError.value = e.response?.data?.detail || '加入遗忘词失败。'
      return null
    }
  }

  const fetchForgottenWords = async (): Promise<Word[] | null> => {
    isWordLoading.value = true
    wordError.value = null
    try {
      const response = await apiClient.get<Word[]>('/words/forgotten')
      return response.data
    } catch (e: any) {
      wordError.value = e.response?.data?.detail || '加载遗忘词失败。'
      return null
    } finally {
      isWordLoading.value = false
    }
  }

  return {
    wordError,
    isWordLoading,
    importWords,
    fetchTodayPlan,
    fetchWordDetail,
    submitReview,
    fetchStudySettings,
    updateStudySettings,
    listWordBooks,
    getWordBook,
    importWordBook,
    restartWordBook,
    searchWords,
    markForgotten,
    fetchForgottenWords
  }
}
