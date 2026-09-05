<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-dark text-white rc-admin-header" elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="left = !left" class="q-mr-sm" />
        <q-toolbar-title class="row items-center">
          <span class="font-display" style="letter-spacing: 3px; font-size: 1.15rem;">RC</span>
          <span class="text-gold font-display" style="letter-spacing: 3px; font-size: 1.15rem;">STORE</span>
          <span class="text-muted q-ml-sm" style="font-family: 'Manrope', sans-serif; font-size: 0.8rem; font-weight: 400; letter-spacing: 0.5px;">Admin</span>
        </q-toolbar-title>
        <AdminChangeNotifications />
        <OrdersNotificationBell />
        <q-btn flat dense round>
          <q-icon name="person" />
          <q-menu class="rc-admin-menu">
            <q-item>
              <q-item-section class="text-caption text-muted">{{ auth.user?.email }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="logout">
              <q-item-section avatar><q-icon name="logout" /></q-item-section>
              <q-item-section class="text-muted">Cerrar sesión</q-item-section>
            </q-item>
          </q-menu>
        </q-btn>
        <q-btn flat dense round icon="store" @click="$router.push({ name: 'home' })" class="q-ml-xs" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="left"
      show-if-above
      bordered
      class="admin-drawer"
    >
      <q-list class="q-pt-md">
        <q-item
          clickable
          v-ripple
          :active="$route.name === 'admin'"
          active-class="text-primary rc-active"
          @click="$router.push({ name: 'admin' })"
        >
          <q-item-section avatar>
            <q-icon name="dashboard" class="text-grey-5" />
          </q-item-section>
          <q-item-section class="text-weight-medium">Productos</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :active="$route.name === 'admin-pedidos'"
          active-class="text-primary rc-active"
          @click="$router.push({ name: 'admin-pedidos' })"
        >
          <q-item-section avatar>
            <q-icon name="receipt_long" class="text-grey-5" />
          </q-item-section>
          <q-item-section class="text-weight-medium">Pedidos</q-item-section>
          <q-item-section side v-if="ordersStore.pendingCount > 0">
            <q-badge color="red-5" text-color="dark">{{ ordersStore.pendingCount }}</q-badge>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :active="$route.name === 'catalogo'"
          active-class="text-primary rc-active"
          @click="$router.push({ name: 'catalogo' })"
        >
          <q-item-section avatar>
            <q-icon name="store" class="text-grey-5" />
          </q-item-section>
          <q-item-section class="text-weight-medium">Catalogo</q-item-section>
        </q-item>
      </q-list>

      <div class="absolute-bottom q-pa-md text-center">
        <q-img
          :src="logo"
          alt="RCStore"
          style="width: 72px; height: auto;"
          class="q-mb-sm"
        />
        <div class="text-caption text-muted" style="font-family: 'Manrope', sans-serif;">TODO A TU ALCANCE</div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import AdminChangeNotifications from 'layouts/AdminChangeNotifications.vue';
import OrdersNotificationBell from 'components/OrdersNotificationBell.vue';
import { useAuthStore } from 'src/stores/auth';
import { useOrdersStore } from 'src/stores/orders';
import logo from 'src/assets/logo.png';

const left = ref(false);
const router = useRouter();
const auth = useAuthStore();
const ordersStore = useOrdersStore();

let pollingTimer: number | null = null;

function stopPolling() {
  if (pollingTimer !== null) {
    window.clearInterval(pollingTimer);
    pollingTimer = null;
  }
}

async function logout() {
  stopPolling();
  await auth.logout();
  void router.push({ name: 'home' });
}

onMounted(() => {
  void ordersStore.refreshStats();
  pollingTimer = window.setInterval(() => {
    void ordersStore.refreshStats();
  }, 60000);
});

onBeforeUnmount(() => {
  stopPolling();
});
</script>

<style lang="scss">
.rc-admin-header {
  background: #1a1a1a;
  border-bottom: 1px solid rgba(212, 175, 55, 0.25);
}

.rc-admin-menu {
  background: #222;
  border: 1px solid rgba(212, 175, 55, 0.15);
  color: #e5e2e1;
}

.admin-drawer {
  background: #1a1a1a;
  color: #e5e2e1;
  border-right: 1px solid rgba(255, 255, 255, 0.08);

  .q-item {
    border-radius: 0 8px 8px 0;
    margin: 2px 8px 2px 0;
    padding: 8px 16px;
    color: #d8d5d2;

    &.rc-active {
      background: rgba(212, 175, 55, 0.12);

      .q-icon {
        color: #e5c378 !important;
      }

      .q-item__label {
        color: #e5c378;
      }
    }
  }
}
</style>
