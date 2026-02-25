// src/main.ts

import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // 【关键 1: 导入路由配置】

const app = createApp(App);

app.use(router); // 【关键 2: 告诉 Vue 实例使用路由】

app.mount('#app');