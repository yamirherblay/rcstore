<template>
  <q-dialog
    v-model="innerVal"
    :position="$q.screen.lt.md ? 'bottom' : 'standard'"
    :full-width="$q.screen.lt.md"
    :maximized="$q.screen.lt.md"
    :persistent="$q.screen.lt.md"
  >
    <q-card :style="$q.screen.lt.md ? '' : 'min-width: 360px; max-width: 420px; width: 100%'" class="remesas-modal-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="row items-center">
          <q-icon name="currency_exchange" color="primary" size="md" class="q-mr-sm" />
          <div>
            <div class="rates-eyebrow">{{ remesasConfig.eyebrow }}</div>
            <div class="rates-title">{{ remesasConfig.title }}</div>
          </div>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator class="bg-white-10" />

      <q-card-section class="q-gutter-y-sm">
        <div v-if="loading" class="row justify-center q-pa-md">
          <q-spinner color="primary" size="28px" />
        </div>

        <template v-else-if="hasRates">
          <div
            v-for="rate in remesasConfig.rates"
            :key="rate.key"
            class="row items-center justify-between rate-row"
          >
            <div class="rate-label row items-center q-gutter-sm">
              <q-icon :name="rateIcon(rate.key)" size="16px" class="rate-icon" />
              <span>{{ rate.label }}</span>
            </div>
            <div class="rate-value">{{ formatRate(rate.key, rateNumber(rate.key)) }}</div>
          </div>
          <div class="text-muted text-caption q-pt-sm q-pl-xs" style="font-family: 'Manrope', sans-serif;">
            {{ remesasConfig.description }}
          </div>
        </template>

        <div v-else class="text-muted text-body2 q-pa-sm" style="font-family: 'Manrope', sans-serif;">
          Aún no se publican tasas de cambio para hoy.
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRemesas } from 'src/composables/useRemesas';
import { remesasConfig, formatRate } from 'src/config/remesas';
import type { RateRow } from 'src/config/remesas';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();

const $q = useQuasar();
const { remesa, fetchRates, loading } = useRemesas();

const innerVal = ref<boolean>(props.modelValue);
watch(() => props.modelValue, (v) => (innerVal.value = v));
watch(innerVal, (v) => emit('update:modelValue', v));

const hasRates = computed(() => {
  const r = remesa.value;
  return Boolean(r && (r.rate_cup != null || r.rate_usd != null || r.rate_zelle != null || r.rate_euro != null));
});

function rateNumber(key: RateRow['key']): number {
  const v = remesa.value?.[key];
  return v ?? 0;
}

function rateIcon(key: RateRow['key']): string {
  switch (key) {
    case 'rate_usd':
      return 'attach_money';
    case 'rate_zelle':
      return 'account_balance_wallet';
    case 'rate_euro':
      return 'euro';
    default:
      return 'payments';
  }
}

watch(innerVal, (v) => {
  if (v) {
    void fetchRates();
  }
});
</script>

<style scoped>
.remesas-modal-card {
  background: #222;
  color: #e5e2e1;
  border: 1px solid rgba(212, 175, 55, 0.15);
}

.rates-eyebrow {
  font-family: 'Manrope', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #d4af37;
}

.rates-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #f5f5f3;
  line-height: 1.15;
}

.rate-row {
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 4px;
  padding: 10px 12px;
  background: #1a1a1a;
}

.rate-label {
  font-family: 'Manrope', sans-serif;
  font-size: 0.9rem;
  color: #e5e2e1;
}

.rate-icon {
  color: #d4af37;
}

.rate-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.95rem;
  font-weight: 600;
  color: #e5c378;
}
</style>