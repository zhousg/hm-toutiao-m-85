import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// 使用rem插件
import 'amfe-flexible'
// 使用vant组件库
import Vant, { Lazyload } from 'vant'
import 'vant/lib/index.less'
// 覆盖vant的样式
import '@/styles/index.less'

import myPlugin from '@/utils/plugin'
Vue.use(myPlugin)

Vue.use(Vant)
Vue.use(Lazyload)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
