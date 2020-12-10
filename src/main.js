import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 引入阿里云图标库
import '@/assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
// 引入axios
import axios from 'axios'
// 引入树形表格插件
import TreeTable from 'vue-table-with-tree-grid'

// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = sessionStorage.getItem('token')
  // 最后必须返回config
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

// 注册树形表格插件
Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
