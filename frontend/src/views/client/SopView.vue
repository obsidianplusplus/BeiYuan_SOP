<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { apiGet } from '../../api'

const stationId = Number(localStorage.getItem('station_id') || 0)
const totalPages = ref(0)
const sopName = ref('')
const versionNo = ref('')
const currentPage = ref(0)

onMounted(async () => {
  const res = await apiGet<{ data: { displayTotalPages: number; sopName: string; versionNo: string } }>(`/station/${stationId}/active-sop`)
  totalPages.value = res.data.displayTotalPages
  sopName.value = res.data.sopName
  versionNo.value = res.data.versionNo
})

const pageText = computed(() =>
  currentPage.value === 0 ? `封面页 / 共 ${totalPages.value} 页` : `第 ${currentPage.value} 页 / 共 ${totalPages.value} 页`
)
</script>

<template>
  <div class="page-shell">
    <div class="card">
      <h1 class="page-title">{{ sopName }}（{{ versionNo }}）</h1>
      <p>{{ pageText }}</p>
      <div class="link-row">
        <button class="btn secondary" :disabled="currentPage <= 0" @click="currentPage--">上一页</button>
        <button class="btn" :disabled="currentPage >= totalPages" @click="currentPage++">下一页</button>
        <router-link class="btn secondary" to="/cover">返回封面</router-link>
      </div>
    </div>
  </div>
</template>
