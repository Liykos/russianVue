<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import NavigationBar from '@/components/NavigationBar.vue'
import { useWordService } from '@/composables/useWordService'

const router = useRouter()
const { importWords, wordError, isWordLoading } = useWordService()

const rawText = ref('')
const message = ref<string | null>(null)

const handleImport = async () => {
  message.value = null
  wordError.value = null

  if (!rawText.value.trim()) {
    wordError.value = '导入内容不能为空。'
    return
  }

  const result = await importWords(rawText.value)

  if (result) {
    message.value = result
    rawText.value = ''
  }
}

const goToReview = () => {
  router.push('/review')
}
</script>

<template>
  <NavigationBar />
  <div class="page-container">
    <h2>📥 导入新单词</h2>
    
    <div v-if="message" class="import-result-card">
        <p class="success-message">{{ message }}</p>
        <button @click="goToReview" class="back-btn">返回复习中心</button>
    </div>
    
    <div v-else class="import-form-card">
      <p class="subtitle">每行一个单词。基础格式：`俄语 - 中文`。扩展格式：`俄语 - 中文 | 例句 | 衍生词(逗号分隔) | 发音标注`</p>
      
      <form @submit.prevent="handleImport">
        <textarea 
          v-model="rawText"
          rows="10" 
          placeholder="стол - 桌子 | Я вижу стол | столик,настольный | stol&#10;дом - 房子 | Это дом"
          :disabled="isWordLoading"
        ></textarea>
        
        <p v-if="wordError" class="error-message">{{ wordError }}</p>

        <button type="submit" :disabled="isWordLoading">
          {{ isWordLoading ? '导入中...' : '开始导入' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* 继承自 AuthView.vue 的 Light Glassmorphism 风格 */
.page-container {
    padding-top: 80px;
    max-width: 800px;
    /* 调整宽度以适应内容 */
    margin: 0 auto;
}

.subtitle {
    color: var(--text-color-muted, #6c757d);
    margin-bottom: 20px;
}

.import-form-card {
    /* 使用与 AuthView.vue 中 form-card 类似的玻璃拟态效果 */
    background: var(--card-bg-opacity, rgba(255, 255, 255, 0.75));
    backdrop-filter: blur(15px);
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

textarea {
    width: 100%;
    padding: 15px;
    margin-bottom: 20px;
    border-radius: 10px;
    background-color: white;
    border: 1px solid #ddd;
    box-sizing: border-box;
    color: var(--text-color-dark, #333);
    font-family: monospace;
    /* 导入文本使用等宽字体 */
    resize: vertical;
    transition: border-color 0.3s;
}

textarea:focus {
    outline: none;
    border-color: var(--accent-color, #007aff);
}

button {
    /* 使用之前定义的按钮样式 */
    background-color: var(--accent-color, #007aff);
    color: white;
    padding: 14px;
    font-size: 1.1em;
}

.error-message {
    color: #ff453a;
    margin-bottom: 15px;
    text-align: center;
}

.success-message {
    color: #38c172;
    /* 绿色 */
    margin-bottom: 15px;
    text-align: center;
}

/* 新增：导入结果卡片样式 */
.import-result-card {
    background: var(--card-bg-opacity, rgba(255, 255, 255, 0.75)); 
    backdrop-filter: blur(15px);
    border-radius: 12px;
    padding: 50px 30px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    max-width: 500px;
    margin: 40px auto;
}

.import-form-card, .import-result-card {
    /* 统一卡片背景 */
    background: var(--card-bg-opacity, rgba(255, 255, 255, 0.75)); 
    backdrop-filter: blur(15px);
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.success-message {
  color: #38c172; 
  font-size: 1.2em;
  font-weight: 600;
  margin-bottom: 30px;
}

.back-btn {
    /* 确保按钮宽度不占满整个卡片 */
    width: auto; 
    padding: 12px 30px;
}
</style>
