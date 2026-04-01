<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { apiGet } from '../../api'

const feedbacks = ref<Array<{ id: number; submitter: string; type: string; content: string; mailStatus: number }>>([])

onMounted(async () => {
  const res = await apiGet<{ data: Array<{ id: number; submitter: string; type: string; content: string; mailStatus: number }> }>('/admin/feedbacks')
  feedbacks.value = res.data
})
</script>

<template>
  <div class="card">
    <h1 class="page-title">反馈记录</h1>
    <ul>
      <li v-for="item in feedbacks" :key="item.id">
        #{{ item.id }} {{ item.submitter }} / {{ item.type }} / 邮件状态: {{ item.mailStatus }} / {{ item.content }}
      </li>
    </ul>
  </div>
</template>
