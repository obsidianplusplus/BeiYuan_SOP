import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/cover'
    },
    {
      path: '/station-select',
      name: 'station-select',
      component: () => import('../views/client/StationSelect.vue')
    },
    {
      path: '/cover',
      name: 'cover',
      component: () => import('../views/client/Cover.vue')
    },
    {
      path: '/sop-view',
      name: 'sop-view',
      component: () => import('../views/client/SopView.vue')
    },
    {
      path: '/feedback',
      name: 'feedback',
      component: () => import('../views/client/Feedback.vue')
    },
    {
      path: '/error',
      name: 'error',
      component: () => import('../views/client/ErrorPage.vue')
    },
    // Admin routes
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/admin/Layout.vue'),
      children: [
        {
          path: 'stations',
          name: 'admin-stations',
          component: () => import('../views/admin/Stations.vue')
        },
        // TODO: add other admin routes
      ]
    }
  ]
})

// 路由拦截：判断 UUID 与 工站绑定状态
router.beforeEach((to, from, next) => {
  const isTerminalPath = ['/cover', '/sop-view', '/feedback'].includes(to.path)
  
  if (isTerminalPath) {
    const terminalId = localStorage.getItem('terminal_id')
    const stationId = localStorage.getItem('station_id')
    
    // 如果没有绑定工站，强制去选择页
    if (!terminalId || !stationId) {
      if (to.path !== '/station-select') {
        next('/station-select')
        return
      }
    }
  }
  next()
})

export default router
