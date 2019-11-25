import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
dayjs.extend(relativeTime)

// 扩展vue实例
const sleep = () => {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      resolve()
    }, 1000)
  })
}

// 相对时间过滤器函数
// value 是使用过滤器的时候，管道符前js表达式的值
const relTime = (value) => {
  // 获取相对时间的逻辑
  // value 就是字符串格式的日期
  // dayjs() 是当前日期
  // dayjs().from(日期) 相对当前的相对日期
  return dayjs().locale('zh-cn').from(value)
}

export default {
  install (Vue) {
    // 注册组件  挂载函数  注册过滤器  注册自定义指令
    Vue.prototype.$sleep = sleep
    // 过滤器
    Vue.filter('relTime', relTime)
  }
}
