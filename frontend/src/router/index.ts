import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', redirect: '/cover' },
    { path: '/station-select', name: 'station-select', component: () => import('../views/client/StationSelect.vue') },
    { path: '/cover', name: 'cover', component: () => import('../views/client/Cover.vue') },
    { path: '/sop-view', name: 'sop-view', component: () => import('../views/client/SopView.vue') },
    { path: '/feedback', name: 'feedback', component: () => import('../views/client/Feedback.vue') },
    { path: '/error', name: 'error', component: () => import('../views/client/ErrorPage.vue') },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/admin/Layout.vue'),
      children: [
        { path: '', redirect: '/admin/stations' },
        { path: 'stations', name: 'admin-stations', component: () => import('../views/admin/Stations.vue') },
        { path: 'terminals', name: 'admin-terminals', component: () => import('../views/admin/Terminals.vue') },
        { path: 'sops', name: 'admin-sops', component: () => import('../views/admin/Sops.vue') },
        { path: 'feedbacks', name: 'admin-feedbacks', component: () => import('../views/admin/Feedbacks.vue') },
        { path: 'mail-logs', name: 'admin-mail-logs', component: () => import('../views/admin/MailLogs.vue') },
        { path: 'users', name: 'admin-users', component: () => import('../views/admin/Users.vue') },
        { path: 'roles', name: 'admin-roles', component: () => import('../views/admin/Roles.vue') },
        { path: 'logs', name: 'admin-logs', component: () => import('../views/admin/Logs.vue') },
        { path: 'system-config', name: 'admin-system-config', component: () => import('../views/admin/SystemConfig.vue') }
      ]
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const isTerminalPath = ['/cover', '/sop-view', '/feedback'].includes(to.path)

  if (isTerminalPath) {
    const terminalId = localStorage.getItem('terminal_id')
    const stationId = localStorage.getItem('station_id')

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
