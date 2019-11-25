<template>
  <van-popup :value="value" @input="$emit('input',$event)" @open="isReport=false">
    <van-cell-group v-if="!isReport">
      <van-cell @click="disLikes">不感兴趣</van-cell>
      <van-cell is-link @click="isReport=true">反馈垃圾内容</van-cell>
      <van-cell>拉黑作者</van-cell>
    </van-cell-group>
    <van-cell-group v-else>
      <van-cell icon="arrow-left" @click="isReport=false">返回</van-cell>
      <van-cell @click="report(item.value)" v-for="item in reports" :key="item.value">{{item.label}}</van-cell>
    </van-cell-group>
  </van-popup>
</template>

<script>
import { disLikes, report } from '@/api/article'
import { reports } from '@/api/constants'
export default {
  // props 使用数组  数组中的字段名就是父组件传入的字段  简陋
  // props: ['value'],
  props: {
    // 传入的字段
    value: {
      type: Boolean,
      default: false
    },
    // 当前点击的文章ID
    articleId: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      // 默认状态是  没有点击举报
      isReport: false,
      // 举报类型
      reports
    }
  },
  methods: {
    // 举报
    async report (type) {
      try {
        // 1. 文章的Id 已经拥有
        // 2. 发请求进行举报
        await report(this.articleId, type)
        // 3. 提示
        this.$toast.success('举报成功')
        // 4. 通知父组件关闭对话框
        this.$emit('input', false)
        // 5. 通知父组件移除对应的文章
        // 不建议使用同一个事件通知父组件（将来可能不同逻辑要处理）
        this.$emit('on-report')
      } catch (e) {
        // e 就是错误对象  e.response.status 就是状态码
        if (e.response && e.response.status === 409) {
          return this.$toast.fail('已经举报')
        }
        return this.$toast.fail('举报失败')
      }
    },
    // 不感兴趣
    async disLikes () {
      try {
        // 1. 获取文章的Id
        // 2. 发请求进行  不感兴趣的操作
        await disLikes(this.articleId)
        // 3. 提示
        this.$toast.success('操作成功')
        // 4. 通知父组件 关闭对话框
        this.$emit('input', false)
        // 5. 通知父组件 当前文章列表 删除对应文章
        this.$emit('on-dislikes')
      } catch (e) {
        this.$toast.fail('操作失败')
      }
    }
  }
}
</script>

<style scoped lang='less'>
.van-popup {
  width: 80%;
  border-radius: 4px;
}
</style>
