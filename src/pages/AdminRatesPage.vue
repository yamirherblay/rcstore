<template>
  <q-page padding class="admin-page">
    <div class="section-eyebrow">Panel de control</div>
    <div class="section-title">CAMBIO MONEDA</div>
    <div class="section-rule"></div>

    <RemesasForm class="q-mt-md" />
  </q-page>
</template>

<script setup lang="ts">
import { useMeta } from 'quasar';
import { branding } from 'src/config/branding';
import RemesasForm from 'components/remesas/RemesasForm.vue';

useMeta({
  title: `Cambio Moneda | ${branding.name}`,
  meta: {
    robots: { name: 'robots', content: 'noindex, nofollow' },
  },
});
</script>

<style scoped>
.admin-page {
  background: #131313;
  color: #e5e2e1;
  min-height: 100vh;
}

.section-eyebrow {
  font-family: 'Manrope', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #d4af37;
}

.section-title {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(1.2rem, 3vw, 1.6rem);
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #f5f5f3;
  margin-top: 4px;
}

.section-rule {
  width: 64px;
  height: 2px;
  background: linear-gradient(90deg, #d4af37, transparent);
  margin-top: 10px;
}
</style>