<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { apiGet, apiPost } from '../../api'

interface MailLog {
  id: number
  feedbackId: number
  receiverEmail: string
  status: number
  failReason?: string
}

const mailLogs = ref<MailLog[]>([])

async function load() {
  const res = await apiGet<{ data: MailLog[] }>('/admin/mail-logs')
  mailLogs.value = res.data
}

async function retry(id: number) {
  await apiPost(`/admin/mail-logs/${id}/retry`, {})
  await load()
}

onMounted(load)
</script>

<template>
  <div class="card">
    <h1 class="page-title">邮件发送记录</h1>
    <ul>
      <li v-for="log in mailLogs" :key="log.id">
        日志#{{ log.id }} / 反馈#{{ log.feedbackId }} / {{ log.receiverEmail }} / 状态: {{ log.status }}
        <span v-if="log.failReason" style="color: #dc2626">（{{ log.failReason }}）</span>
        <button v-if="log.status === 0" class="btn secondary" @click="retry(log.id)">重新补发</button>
      </li>
    </ul>
  </div>
</template>
