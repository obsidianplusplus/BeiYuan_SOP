<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiGet, apiPost } from '../../api'

interface Station {
  id: number
  code: string
  name: string
}

const router = useRouter()
const stations = ref<Station[]>([])
const stationId = ref<number>()
const loading = ref(false)
const message = ref('')

const terminalId = localStorage.getItem('terminal_id') || crypto.randomUUID()
localStorage.setItem('terminal_id', terminalId)

onMounted(async () => {
  const result = await apiGet<{ code: number; data: Station[]; message: string }>('/stations')
  stations.value = result.data
  stationId.value = stations.value[0]?.id
})

async function bindStation() {
  if (!stationId.value) return
  loading.value = true
  message.value = ''
  try {
    await apiPost('/terminal/binding', { terminalId, stationId: stationId.value })
    localStorage.setItem('station_id', String(stationId.value))
    router.push('/cover')
  } catch (error) {
    message.value = (error as Error).message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-shell">
    <div class="card">
      <h1 class="page-title">工站选择</h1>
      <p>终端编号：{{ terminalId }}</p>
      <p v-if="message" style="color: #dc2626">{{ message }}</p>
      <select v-model="stationId">
        <option v-for="station in stations" :key="station.id" :value="station.id">
          {{ station.code }} - {{ station.name }}
        </option>
      </select>
      <div class="link-row">
        <button class="btn" :disabled="loading" @click="bindStation">确认绑定</button>
      </div>
    </div>
  </div>
</template>
