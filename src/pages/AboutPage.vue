<template>
  <q-page class="about-page q-pa-lg">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="about-title text-center q-mb-lg">{{ branding.name }}</div>

        <div class="linea-vip q-mx-auto q-mb-lg" style="width: 60px; height: 1px; background: rgba(212,175,55,.4);"></div>

        <div class="about-content">
          <p>{{ branding.about.content.split('\n\n')[0] }}</p>
          <p>{{ branding.about.content.split('\n\n')[1] }}</p>
          <p>{{ branding.about.content.split('\n\n')[2] }}</p>
        </div>

        <div class="linea-vip q-mx-auto q-my-lg" style="width: 60px; height: 1px; background: rgba(212,175,55,.4);"></div>

        <div class="text-center text-gold" style="letter-spacing: 8px; font-size: 1.2rem;">
          ★ ★ ★
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { branding } from 'src/config/branding';
import { useMeta } from 'quasar';

useMeta({
  title: `Acerca de | ${branding.name}`,
  meta: {
    description: { name: 'description', content: `Conoce ${branding.name}, tu tienda de productos variados con todo a tu alcance.` },
    'og:title': { property: 'og:title', content: `Acerca de | ${branding.name}` },
    'og:description': { property: 'og:description', content: `Conoce ${branding.name}, tu tienda de productos variados con todo a tu alcance.` },
    'og:image': { property: 'og:image', content: branding.siteUrl + branding.logo },
    'og:url': { property: 'og:url', content: branding.siteUrl + '/acerca' },
    'twitter:title': { name: 'twitter:title', content: `Acerca de | ${branding.name}` },
    'twitter:description': { name: 'twitter:description', content: `Conoce ${branding.name}, tu tienda de productos variados con todo a tu alcance.` },
  },
});
</script>

<style scoped>
.about-page {
  background: #131313;
  min-height: 60vh;
}

.about-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 300;
  font-size: 2rem;
  letter-spacing: 0.08em;
  color: #f5f5f3;
}

.about-content {
  font-family: 'Manrope', sans-serif;
  font-size: 1rem;
  line-height: 1.7;
  color: #e5e2e1;
}

.about-content p {
  margin-bottom: 1rem;
}

.text-gold {
  color: #d4af37;
}
</style>
