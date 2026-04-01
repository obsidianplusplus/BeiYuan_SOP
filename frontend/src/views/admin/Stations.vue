<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { apiGet } from '../../api'

const stations = ref<Array<{ id: number; code: string; name: string }>>([])

onMounted(async () => {
  const res = await apiGet<{ data: Array<{ id: number; code: string; name: string }> }>('/stations')
  stations.value = res.data
})
</script>

<template>
  <div class="card">
    <h1 class="page-title">工站管理</h1>
    <ul>
      <li v-for="station in stations" :key="station.id">{{ station.id }} - {{ station.code }} - {{ station.name }}</li>
    </ul>
  </div>
</template>
