// 配置axios  使用配置好的axios发请求
// 处理js最大安全数值   在每次请求携带token  响应后获取有效数据   响应失败token失效（TODO）
// 导出一个发请求的工具函数

import axios from 'axios'
import JSONBIGINT from 'json-bigint'
import store from '@/store'
import router from '@/router'

// 创建一个新的axios实例
const instance = axios.create({
  // 基准地址
  baseURL: 'http://ttapi.research.itcast.cn/',
  // 转换原始数据格式
  transformResponse: [(data) => {
    // data 原始数据（json格式字符串）
    try {
      return JSONBIGINT.parse(data)
    } catch (e) {
      return data
    }
  }]
})

// 请求拦截 在每次请求头中携带token
instance.interceptors.request.use(config => {
  // 成功拦截
  // 修改请求配置  修改的是headers  获取token  配置token
  if (store.state.user.token) {
    config.headers.Authorization = `Bearer ${store.state.user.token}`
  }
  return config
}, err => Promise.reject(err))

// 响应拦截 响应后获取有效数据
instance.interceptors.response.use(res => {
  // 处理响应
  // 调用接口的时候  then() 的传参就是现在的return
  // res.data 响应内容  res.data.data 才是有效数据
  try {
    return res.data.data
  } catch (e) {
    return res
  }
}, async err => {
  // 实现token失效处理
  // 1. 判断是否是401状态
  // 2. 如果未登录（拦截到登录页面，预留回跳功能）
  // 3. token失效，发请求给后台刷新token
  // 3.1 刷新成功  更新vuex中token和本地存储的token
  // 3.2 刷新成功  把原本失败的请求继续发送出去
  // 3.3 刷新失败  删除vuex中token和本地存储的token （拦截到登录页面，预留回跳功能）
  if (err.response && err.response.status === 401) {
    // 拦截登录的跳转地址配置 （vue组件：this.$route.path）=== (router.currentRoute)
    const loginConfig = { path: '/login', query: { redirectUrl: router.currentRoute.path } }
    // 取出用户信息
    const { user } = store.state
    // 如果没登录
    if (!user || !user.token || !user.refresh_token) {
      // 拦截到登录

      // 响应拦截的error函数，必须返回一个错误的Promise对象，才认为是一个异常，阻止程序运行。
      router.push(loginConfig)
      return Promise.reject(err)
    }
    try {
      // token失效
      // 此时使用instance将会有一些配置已经生效了。头部需要携带的是refresh_token
      const { data: { data } } = await axios({
        url: 'http://ttapi.research.itcast.cn/app/v1_0/authorizations',
        method: 'put',
        headers: {
          Authorization: `Bearer ${user.refresh_token}`
        }
      })
      // 刷新成功
      // 1. 更新vuex中token和本地存储的token
      store.commit('setUser', {
        token: data.token,
        refresh_token: user.refresh_token
      })
      // 2. 把原本失败的请求继续发送出去
      // 2.1 发请求  使用instance发送
      // 2.2 传入 原本失败的请求的配置
      // 2.3 最终代码：instance(原本失败的请求的配置) err.config
      // 2.4 instance(err.config) 给当前的错误拦截函数
      return instance(err.config)
    } catch (e) {
      // 刷新失败
      // 1. 删除token
      store.commit('delUser')
      // 2. 拦截登录
      // 响应拦截的error函数，必须返回一个错误的Promise对象，才认为是一个异常，阻止程序运行。
      router.push(loginConfig)
      return Promise.reject(err)
    }
  }
  return Promise.reject(err)
})

// 导出一个使用配置好的axios来发请求的函数
// 请求地址 url 请求方式 methdo  传参 data
export default (url, method, data) => {
  return instance({
    url,
    method,
    // 当请求方式是get 是params来传参
    // 其他请求方式   是data来传参
    // 动态插入 属性 params|data
    // [] 写任意表达式  返回结果一定要是字符串类型
    // 不够严谨：用户传入请求方式 get Get GET
    [method.toLowerCase() === 'get' ? 'params' : 'data']: data
  })
}
