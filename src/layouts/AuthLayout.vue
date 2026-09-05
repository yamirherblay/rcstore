<template>
  <q-layout view="lHh Lpr lff">
    <q-header class="bg-dark text-white rc-auth-header" elevated>
      <q-toolbar>
        <q-toolbar-title>
          <span class="font-display" style="letter-spacing: 2px;">Acceso a </span>
          <span class="text-gold font-display" style="letter-spacing: 2px;">RCSTORE</span>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="scss">
.rc-auth-header {
  background: #1a1a1a;
  border-bottom: 1px solid rgba(212, 175, 55, 0.25);
}
</style>