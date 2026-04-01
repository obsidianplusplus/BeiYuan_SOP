<script setup lang="ts">
import { ref } from 'vue'
import { apiPost } from '../../api'

const submitter = ref('')
const contact = ref('')
const type = ref('SOP内容问题')
const content = ref('')
const resultText = ref('')

async function submit() {
  const stationId = Number(localStorage.getItem('station_id') || 0)
  const stationName = `工站${stationId}`
  const terminalUuid = localStorage.getItem('terminal_id') || 'unknown'

  const res = await apiPost<{ message: string; data: { feedbackId: number; mailStatus: number } }>('/feedback', {
    stationName,
    terminalUuid,
    submitter: submitter.value,
    contact: contact.value,
    type: type.value,
    content: content.value,
    pageNo: 0
  })

  resultText.value = `${res.message}，反馈单号 #${res.data.feedbackId}`
}
</script>

<template>
  <div class="page-shell">
    <div class="card">
      <h1 class="page-title">反馈问题</h1>
      <input v-model="submitter" placeholder="反馈人" />
      <input v-model="contact" placeholder="联系方式（输入 fail 可模拟邮件失败）" />
      <input v-model="type" placeholder="反馈类型" />
      <textarea v-model="content" placeholder="问题描述" />
      <div class="link-row">
        <button class="btn" @click="submit">提交反馈</button>
        <router-link class="btn secondary" to="/cover">返回封面</router-link>
      </div>
      <p v-if="resultText" style="margin-top: 12px">{{ resultText }}</p>
    </div>
  </div>
</template>
