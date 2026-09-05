<template>
  <q-card class="remesas-form-card">
    <q-card-section class="row items-center q-gutter-sm q-pt-lg">
      <div class="rates-icon" style="background: rgba(212, 175, 55, 0.15);">
        <q-icon name="currency_exchange" size="20px" color="#E5C378" />
      </div>
      <div>
        <div class="rates-eyebrow">{{ remesasConfig.eyebrow }}</div>
        <div class="rates-title">{{ remesasConfig.title }}</div>
      </div>
      <q-space />
      <div class="rate-updated text-caption text-muted">
        <template v-if="loadedAt">Actualizado {{ loadedAt }}</template>
        <template v-else-if="!hasRates && !loading">Sin tasas registradas</template>
      </div>
    </q-card-section>

    <q-card-section class="q-pt-sm q-pb-sm">
      <div class="text-muted text-caption">{{ remesasConfig.description }}</div>
    </q-card-section>

    <q-card-section>
      <q-form ref="formRef" greedy @submit.prevent="handleSave">
        <div class="row q-col-gutter-md">
          <div
            v-for="rate in remesasConfig.rates"
            :key="rate.key"
            class="col-12 col-sm-6"
          >
            <q-input
              v-model.number="form[rate.key]"
              :label="rate.label"
              type="number"
              step="0.01"
              min="0"
              dense
              outlined
              dark
              suffix="CUP"
              :loading="loading"
              :disabled="saving"
              :rules="[requiredRule]"
            />
          </div>
        </div>

        <div v-if="error" class="row items-center q-mt-sm q-gutter-xs text-caption" style="color: #e57373;">
          <q-icon name="error_outline" size="16px" />
          <span>{{ error }}</span>
        </div>

        <div class="row q-mt-md q-gutter-sm items-center">
          <q-btn
            unelevated
            no-caps
            class="gold-btn"
            type="submit"
            :label="saving ? 'Guardando...' : 'Guardar tasas'"
            :disable="saving || loading"
            icon="save"
            style="min-height: 44px; padding: 0 28px;"
          />
          <q-btn
            flat
            no-caps
            :label="saving ? '...' : 'Restablecer'"
            :disable="saving"
            @click="resetForm"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRemesas } from 'src/composables/useRemesas';
import { remesasConfig } from 'src/config/remesas';
import type { RemesaRate } from 'src/stores/types';

interface RateFormModel {
  rate_cup: number | null;
  rate_usd: number | null;
  rate_zelle: number | null;
  rate_euro: number | null;
}

const $q = useQuasar();
const { remesa, fetchRates, saveRates, loading, saving, error } = useRemesas();

const form = ref<RateFormModel>({
  rate_cup: null,
  rate_usd: null,
  rate_zelle: null,
  rate_euro: null,
});

const loadedAt = ref<string | null>(null);
const hasRates = ref(false);
const formRef = ref<{ resetValidation: () => void } | null>(null);

function requiredRule(v: number | null | undefined | string): boolean | string {
  if (v === null || v === undefined || v === '') return 'Ingresa una tasa válida';
  return (typeof v === 'number' ? Number.isFinite(v) && v >= 0 : Number(v) >= 0) || 'Ingresa una tasa válida';
}

function serializeRow(): Omit<RemesaRate, 'id' | 'created_at' | 'negocio_id'> {
  const num = (v: number | null | undefined | ''): number => {
    if (v === null || v === undefined || v === '') return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  return {
    rate_cup: 1,
    rate_usd: num(form.value.rate_usd),
    rate_zelle: num(form.value.rate_zelle),
    rate_euro: num(form.value.rate_euro),
  };
}

function fillForm(data: RemesaRate) {
  form.value.rate_cup = data.rate_cup ?? null;
  form.value.rate_usd = data.rate_usd ?? null;
  form.value.rate_zelle = data.rate_zelle ?? null;
  form.value.rate_euro = data.rate_euro ?? null;
}

function resetForm() {
  if (loading.value) return;
  if (remesa.value) {
    fillForm(remesa.value);
  } else {
    form.value = { rate_cup: null, rate_usd: null, rate_zelle: null, rate_euro: null };
  }
  formRef.value?.resetValidation();
  loadedAt.value = null;
}

async function handleSave() {
  if (loading.value) return;
  try {
    const ok = await saveRates(serializeRow());
    if (ok) {
      loadedAt.value = new Date().toLocaleTimeString('es-CU', { hour: '2-digit', minute: '2-digit' });
      hasRates.value = true;
      $q.notify({
        message: 'Tasas de cambio guardadas',
        color: 'positive',
        textColor: 'dark',
        icon: 'check_circle',
        timeout: 2000,
      });
    } else {
      throw new Error(error.value || 'No se pudo guardar');
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error guardando tasas';
    $q.notify({ type: 'negative', message });
    console.error('Error guardando tasas:', e);
  }
}

onMounted(async () => {
  const data = await fetchRates();
  if (data) {
    hasRates.value = true;
    loadedAt.value = data.created_at
      ? new Date(data.created_at).toLocaleDateString('es-CU')
      : new Date().toLocaleTimeString('es-CU', { hour: '2-digit', minute: '2-digit' });
    fillForm(data);
  }
});
</script>

<style scoped>
.remesas-form-card {
  background: #222;
  color: #e5e2e1;
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 4px;
}

.rates-icon {
  width: 44px;
  height: 44px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #f5f5f3;
  line-height: 1.15;
}

.rate-updated {
  font-family: 'Manrope', sans-serif;
}
</style>