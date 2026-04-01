<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiGet, apiPost } from '../../api'

const router = useRouter()
const stationId = Number(localStorage.getItem('station_id') || 0)
const stationName = ref('')
const mainTitle = ref('')
const promptText = ref('')
const versionNo = ref('')
const errorText = ref('')

async function loadData() {
  if (!stationId) {
    router.push('/station-select')
    return
  }

  try {
    const cover = await apiGet<{ data: { stationName: string; mainTitle: string; promptText: string } }>(`/station/${stationId}/cover`)
    stationName.value = cover.data.stationName
    mainTitle.value = cover.data.mainTitle
    promptText.value = cover.data.promptText

    const sop = await apiGet<{ data: { versionNo: string } }>(`/station/${stationId}/active-sop`)
    versionNo.value = sop.data.versionNo
  } catch (error) {
    errorText.value = (error as Error).message
  }
}

async function switchStation() {
  const terminalId = localStorage.getItem('terminal_id')
  if (!terminalId) {
    router.push('/station-select')
    return
  }

  const target = window.prompt('请输入要切换的工站ID（例如 1）')
  if (!target) return
  await apiPost('/terminal/switch', { terminalId, newStationId: Number(target) })
  localStorage.setItem('station_id', target)
  window.location.reload()
}

onMounted(loadData)
</script>

<template>
  <div class="page-shell">
    <div class="card">
      <h1 class="page-title">{{ mainTitle || 'SOP 下发系统' }}</h1>
      <p>当前工站：{{ stationName }}</p>
      <p>当前版本：{{ versionNo || '--' }}</p>
      <p>{{ promptText }}</p>
      <p v-if="errorText" style="color: #dc2626">{{ errorText }}</p>
      <div class="link-row">
        <router-link class="btn" to="/sop-view">进入 SOP</router-link>
        <button class="btn secondary" @click="switchStation">切换工站</button>
        <router-link class="btn secondary" to="/feedback">反馈问题</router-link>
      </div>
    </div>
  </div>
</template>
