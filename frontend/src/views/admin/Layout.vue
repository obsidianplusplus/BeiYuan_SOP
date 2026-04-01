<template>
  <div class="layout">
    <aside class="sidebar">
      <h3>后台管理</h3>
      <router-link to="/admin/stations">工站管理</router-link>
      <router-link to="/admin/terminals">终端管理</router-link>
      <router-link to="/admin/sops">SOP 管理</router-link>
      <router-link to="/admin/feedbacks">反馈记录</router-link>
      <router-link to="/admin/mail-logs">邮件记录</router-link>
      <router-link to="/admin/users">用户管理</router-link>
      <router-link to="/admin/roles">角色权限</router-link>
      <router-link to="/admin/logs">日志查询</router-link>
      <router-link to="/admin/system-config">系统配置</router-link>
    </aside>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>
