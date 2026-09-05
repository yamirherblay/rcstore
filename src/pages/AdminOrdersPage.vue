<template>
  <q-page padding class="admin-page">
    <div class="section-eyebrow">Panel de control</div>
    <div class="section-title">PEDIDOS</div>
    <div class="section-rule"></div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-4">
        <q-card class="stat-gauge" style="border-left: 4px solid #D4AF37;">
          <q-card-section class="row items-center no-wrap q-py-md">
            <div class="gauge-icon" style="background: rgba(212, 175, 55, 0.15);">
              <q-icon name="receipt_long" size="22px" color="#E5C378" />
            </div>
            <div class="q-ml-md">
              <div class="gauge-label">TOTAL PEDIDOS</div>
              <div class="gauge-value" style="color: #E5C378;">{{ ordersStore.stats.total }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card class="stat-gauge" style="border-left: 4px solid #C5A059;">
          <q-card-section class="row items-center no-wrap q-py-md">
            <div class="gauge-icon" style="background: rgba(197, 160, 89, 0.15);">
              <q-icon name="schedule" size="22px" color="#E5C378" />
            </div>
            <div class="q-ml-md">
              <div class="gauge-label">PENDIENTES</div>
              <div class="gauge-value" style="color: #E5C378;">{{ ordersStore.stats.pendientes }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card class="stat-gauge" style="border-left: 4px solid #1A936F;">
          <q-card-section class="row items-center no-wrap q-py-md">
            <div class="gauge-icon" style="background: rgba(26, 147, 111, 0.18);">
              <q-icon name="check_circle" size="22px" color="#1A936F" />
            </div>
            <div class="q-ml-md">
              <div class="gauge-label">ENTREGADOS</div>
              <div class="gauge-value" style="color: #4BD9AC;">{{ ordersStore.stats.entregados }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row items-center q-col-gutter-sm q-mb-md">
      <div class="col-auto">
        <q-btn
          color="primary"
          text-color="dark"
          icon="refresh"
          label="Refrescar"
          no-caps
          :loading="ordersStore.loading"
          @click="refresh"
          style="font-family: 'Manrope', sans-serif;"
        />
      </div>
      <div class="col-12 col-sm-4 q-ml-auto">
        <q-input dense outlined dark v-model="filter" placeholder="Buscar por token o cliente..." clearable>
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <div v-if="ordersStore.loading && !ordersStore.orders.length" class="text-muted text-center q-py-xl">
      Cargando pedidos...
    </div>

    <div v-else-if="!filteredOrders.length" class="text-muted text-center q-py-xl">
      No hay pedidos todavía.
    </div>

    <q-card
      v-for="order in filteredOrders"
      :key="order.id"
      class="order-card q-mb-sm"
      clickable
      @click="openDetail(order)"
    >
      <q-card-section class="row items-center q-py-sm">
        <div class="col">
          <div class="row items-center q-gutter-sm">
            <span class="order-token">#{{ order.token.slice(0, 6) }}</span>
            <q-badge :label="order.status" :color="statusColor(order.status)" :text-color="statusTextColor()" dense />
          </div>
          <div class="text-caption text-muted q-mt-xs">{{ formatDate(order.created_at) }}</div>
        </div>
        <q-icon name="chevron_right" class="text-grey-5" />
      </q-card-section>

      <q-separator dark />

      <q-card-section class="q-py-sm">
        <div class="row items-center q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <div class="row items-center no-wrap q-gutter-sm">
              <q-icon name="local_shipping" size="16px" class="text-grey-5" />
              <span class="text-body2">{{ deliveryLabel(order.type_delivery) }}</span>
            </div>
            <div class="row items-center no-wrap q-gutter-sm q-mt-xs">
              <q-icon name="person" size="16px" class="text-blue-8" />
              <span class="text-body2 text-muted">{{ order.client_name || 'Cliente sin identificar' }}</span>
            </div>
          </div>
          <div class="col-12 col-sm-6 text-right">
            <div class="text-subtitle1 text-weight-bold font-mono" style="color: #E5C378;">
              {{ formatPrice(order.total_cup, 'CUP') }}
            </div>
            <div v-if="order.total_usd" class="text-subtitle1 text-weight-bold font-mono"  style="color: #E5C378;">
              {{ formatPrice(order.total_usd, 'USD') }}
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-dialog
      v-model="detailOpen"
      :position="$q.screen.lt.md ? 'bottom' : 'standard'"
      :full-width="$q.screen.lt.md"
      :maximized="$q.screen.lt.md"
    >
      <q-card :style="$q.screen.lt.md ? '' : 'max-width: 560px; width: 100%'" class="order-detail-card">
        <q-card-section class="row items-center q-py-sm" style="border-bottom: 1px solid rgba(212,175,55,.35);">
          <div class="text-subtitle1 text-weight-bold font-display" style="color: #f5f5f3;">
            Pedido #{{ detailOrder?.token.slice(0,6) ?? '' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="detailOrder" class="q-pt-md">
          <div class="q-mb-sm">
            <span class="text-caption text-muted">Token (para match exacto)</span>
            <div class="row items-center no-wrap q-gutter-xs">
              <div class="order-token-mono">{{ detailOrder.token }}</div>
              <q-btn flat dense round size="sm" icon="content_copy" color="primary" @click="copyToken(detailOrder.token)">
                <q-tooltip>Copiar token</q-tooltip>
              </q-btn>
            </div>
          </div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <span class="text-caption text-muted">Fecha</span>
              <div class="text-body2">{{ formatDate(detailOrder.created_at) }}</div>
            </div>
            <div class="col-6">
              <span class="text-caption text-muted">Estado</span>
              <div>
                <q-badge :label="detailOrder.status" :color="statusColor(detailOrder.status)" :text-color="statusTextColor()" dense />
              </div>
            </div>
            <div class="col-6">
              <span class="text-caption text-muted">Tipo de envío</span>
              <div class="text-body2">{{ deliveryLabel(detailOrder.type_delivery) }}</div>
            </div>
            <div class="col-6">
              <span class="text-caption text-muted">Cliente</span>
              <div class="text-body2">{{ detailOrder.client_name || '—' }}</div>
            </div>
            <div v-if="detailOrder.type_delivery === 'domicilio'" class="col-12">
              <span class="text-caption text-muted">Dirección</span>
              <div class="text-body2">{{ detailOrder.address_client || '—' }}</div>
            </div>
          </div>

          <div class="text-caption text-muted q-mb-xs">Productos</div>
          <q-list bordered separator dark class="rounded-borders q-mb-md">
            <q-item v-for="item in detailItems" :key="item.id">
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ item.products?.name || item.id_product }}</q-item-label>
                <q-item-label caption class="text-muted">
                  {{ item.qty }} × {{ formatPrice(item.price_at_order, item.products?.currency) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="text-weight-bold">
                  {{ formatPrice(subtotal(item), item.products?.currency) }}
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="row items-center justify-end q-gutter-sm q-mb-md">
            <div v-if="detailOrder.total_usd" class="text-body1 text-weight-bold font-mono">
              Total USD: {{ formatPrice(detailOrder.total_usd, 'USD') }}
            </div>
            <div class="text-subtitle1 text-weight-bold font-mono" style="color: #E5C378;">
              Total CUP: {{ formatPrice(detailOrder.total_cup, 'CUP') }}
            </div>
          </div>

          <q-separator dark class="q-mb-md" />

          <div class="row items-center q-col-gutter-sm">
            <div class="col-12 col-sm-7">
              <q-select
                v-model="statusDraft"
                :options="statusOptions"
                outlined
                dense
                dark
                label="Cambiar estado"
                :loading="savingStatus"
              />
            </div>
            <div class="col-12 col-sm-5">
              <q-btn
                color="primary"
                text-color="dark"
                label="Guardar estado"
                no-caps
                class="full-width"
                :disable="!statusDraft || statusDraft === detailOrder.status || savingStatus || detailOrder.status === 'Entregado' || detailOrder.status === 'Cancelado'"
                @click="saveStatus"
                style="font-family: 'Manrope', sans-serif;"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useMeta, useQuasar, copyToClipboard } from 'quasar';
import { useOrdersStore } from 'src/stores/orders';
import { branding } from 'src/config/branding';
import type { Order, OrderProductRow, OrderStatus } from 'src/stores/types';
import { formatPrice as formatPriceUtil } from 'src/utils/format';

useMeta({
  title: `Pedidos | Admin ${branding.name}`,
  meta: {
    robots: { name: 'robots', content: 'noindex, nofollow' },
  },
});

const ordersStore = useOrdersStore();
const $q = useQuasar();
const filter = ref('');

const detailOpen = ref(false);
const detailOrder = ref<Order | null>(null);
const statusDraft = ref<OrderStatus | null>(null);
const savingStatus = ref(false);

const statusOptions: OrderStatus[] = ['Pendiente', 'Confirmado', 'Entregado', 'Cancelado'];

const filteredOrders = computed(() => {
  const f = filter.value.trim().toLowerCase();
  if (!f) return ordersStore.orders;
  return ordersStore.orders.filter(
    (o) =>
      o.token.toLowerCase().includes(f) ||
      String(o.id).includes(f) ||
      (o.client_name || '').toLowerCase().includes(f),
  );
});

const detailItems = computed<OrderProductRow[]>(() =>
  detailOrder.value ? ordersStore.productsByOrder(detailOrder.value.id) : [],
);

async function copyToken(token: string) {
  try {
    await copyToClipboard(token);
    $q.notify({
      message: 'Token copiado',
      color: 'positive',
      icon: 'check_circle',
      timeout: 1500,
    });
  } catch {
    $q.notify({
      message: 'No se pudo copiar el token',
      color: 'negative',
      icon: 'error',
    });
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function deliveryLabel(method: Order['type_delivery']): string {
  return method === 'domicilio' ? 'A domicilio' : 'Retiro en tienda';
}

function statusColor(status: OrderStatus): string {
  if (status === 'Pendiente') return 'orange-8';
  if (status === 'Confirmado') return 'primary';
  if (status === 'Entregado') return 'green-7';
  return 'grey-6';
}

function statusTextColor(): string {
  return 'dark';
}

function formatPrice(val?: number | null, currency?: string | null): string {
  if (val == null) return '-';
  return formatPriceUtil(val, currency);
}

function subtotal(item: OrderProductRow): number {
  return (item.price_at_order ?? 0) * item.qty;
}

function openDetail(order: Order) {
  detailOrder.value = order;
  statusDraft.value = order.status;
  detailOpen.value = true;
}

async function saveStatus() {
  if (!detailOrder.value || !statusDraft.value) return;
  savingStatus.value = true;
  try {
    const ok = await ordersStore.updateOrderStatus(detailOrder.value.id, statusDraft.value);
    if (ok) {
      if (detailOrder.value) detailOrder.value.status = statusDraft.value;
      $q.notify({
        message: 'Estado actualizado',
        color: 'positive',
        icon: 'check_circle',
        timeout: 2000,
      });
    } else {
      $q.notify({
        message: 'Error al actualizar el estado',
        color: 'negative',
        icon: 'error',
      });
    }
  } finally {
    savingStatus.value = false;
  }
}

function refresh() {
  void ordersStore.fetchOrders().then(() => ordersStore.refreshStats());
}

onMounted(() => {
  void ordersStore.fetchOrders().then(() => ordersStore.refreshStats());
});
</script>

<style lang="scss">
.admin-page {
  background: #131313;
  min-height: 100vh;
}

.section-eyebrow {
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c5a059;
  margin-bottom: 2px;
}

.section-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #f5f5f3;
  line-height: 1.1;
}

.section-rule {
  height: 1px;
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.6) 60px, rgba(212, 175, 55, 0.15) 60px);
  margin: 12px 0 24px 0;
  width: 100%;
}

.stat-gauge {
  border-radius: 4px;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: rgba(212, 175, 55, 0.35);
    box-shadow: 0 12px 36px -8px rgba(212, 175, 55, 0.12);
  }

  .gauge-icon {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .gauge-label {
    font-family: 'Outfit', sans-serif;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #a3a39e;
  }

  .gauge-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.2;
  }
}

.order-card {
  border-radius: 4px;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #e5e2e1;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: rgba(212, 175, 55, 0.35);
    transform: translateY(-1px);
  }
}

.order-token {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  font-weight: 600;
  color: #e5c378;
}

.order-token-mono {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: #a3a39e;
  word-break: break-all;
}

.order-detail-card {
  background: #222;
  color: #e5e2e1;
  border: 1px solid rgba(212, 175, 55, 0.15);
}
</style>
