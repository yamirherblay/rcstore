<template>
  <q-page class="index-page">
    <!-- Hero -->
    <section class="hero-section text-white noise-bg">
      <div class="hero-glow"></div>
      <HeroSnow />
      <div class="hero-content column items-center text-center q-pa-md">
        <div class="eyebrow hero-eyebrow hero-enter-eyebrow">{{ branding.brandName }}</div>

        <h1 class="hero-title hero-enter-title">{{ branding.hero.title }}</h1>

        <p class="hero-subtitle hero-enter-sub">{{ branding.slogan }}</p>

        <q-btn
          no-caps
          unelevated
          class="gold-btn hero-enter-cta hero-cta q-px-xl"
          :label="branding.hero.ctaText"
          :to="branding.hero.ctaLink"
        />

        
      </div>
    </section>

    <section class="feature-strip section-reveal" role="list" aria-label="Servicios de RCStore">
      <div class="feature-item" role="listitem">
        <q-icon name="local_shipping" size="26px" class="feature-icon" />
        <div class="feature-text">
          <div class="feature-title">Envíos a domicilio</div>
          <div class="feature-sub">Entregamos donde estés</div>
        </div>
      </div>
      <div class="feature-sep" aria-hidden="true"></div>
      <div class="feature-item" role="listitem">
        <q-icon name="payments" size="26px" class="feature-icon" />
        <div class="feature-text">
          <div class="feature-title">Pagos en varias monedas</div>
          <div class="feature-sub">Elige cómo quieres pagar</div>
        </div>
      </div>
      <div class="feature-sep" aria-hidden="true"></div>
      <div class="feature-item" role="listitem">
        <q-icon name="workspace_premium" size="26px" class="feature-icon" />
        <div class="feature-text">
          <div class="feature-title">Calidad garantizada</div>
          <div class="feature-sub">Productos seleccionados para ti</div>
        </div>
      </div>
    </section>

    <hr class="brass-rule" />

    <!-- Featured products -->
    <section class="shelf-section q-pa-lg section-reveal">
      <div class="text-center q-mb-lg">
        <div class="eyebrow">Productos destacados</div>
        <div class="shelf-title">LO MÁS VENDIDO</div>
        <div class="text-muted text-caption">Incluye ofertas</div>
      </div>

      <div v-if="loading" class="row q-col-gutter-md">
        <div v-for="n in 4" :key="n" class="col-6 col-sm-4 col-md-3">
          <div class="skeleton-card" style="border-radius: 4px; overflow: hidden">
            <q-skeleton square style="width: 100%; aspect-ratio: 1" animation="wave" />
            <div class="q-pa-sm">
              <q-skeleton type="text" width="80%" height="14px" animation="wave" />
              <q-skeleton type="text" width="50%" height="16px" class="q-mt-xs" animation="wave" />
              <q-skeleton type="text" width="30%" height="12px" class="q-mt-xs" animation="wave" />
            </div>
          </div>
        </div>
      </div>

      <div v-else class="row q-col-gutter-md">
        <div
          v-for="product in featuredProducts"
          :key="product.id"
          class="col-6 col-sm-4 col-md-3 cursor-pointer"
          @click="$router.push('/catalogo')"
        >
          <div class="shelf-card">
            <div class="shelf-img-wrap">
              <q-img
                :src="product.image || '/images/placeholder.svg'"
                ratio="1"
                class="shelf-img cursor-pointer"
                @click.stop="preview.open(product)"
              />
              <div v-if="product.oferta" class="offer-ribbon">OFERTA</div>
            </div>
            <div class="shelf-info q-pa-sm">
              <div class="shelf-name">{{ product.name }}</div>
              <div class="shelf-price" :class="{ 'shelf-stacked': product.oferta }">
                <template v-if="product.oferta">
                  <span class="old-price">{{ formatPrice(product.price, product.currency) }}</span>
                  <span class="sale-price">{{ formatPrice(product.descuento, product.currency) }}</span>
                </template>
                <template v-else>
                  <span class="sale-price">{{ formatPrice(product.price, product.currency) }}</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center q-mt-md">
        <q-btn flat no-caps label="Ver catálogo completo →" to="/catalogo" class="shelf-link" />
      </div>
    </section>

    <hr class="brass-rule" />

    <!-- WhatsApp CTA -->
    <section class="cta-section section-reveal">
      <div class="cta-panel column items-center text-center">
        <div class="cta-eyebrow eyebrow">Consultas</div>
        <div class="cta-title">¿Tienes dudas o buscas algo en especial?</div>
        <div class="cta-sub text-muted">Escríbenos y te respondemos al momento</div>
        <button type="button" class="cta-btn" @click="openWhatsApp">
          <q-icon name="fa-brands fa-whatsapp" size="20px" />
          Escríbenos por WhatsApp
        </button>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { branding } from 'src/config/branding';
import { whatsappConfig, formatWhatsAppUrl } from 'src/config/whatsapp';
import { useProducts } from 'src/composables/useProducts';
import { useProductPreview } from 'src/composables/useProductPreview';
import { useMeta } from 'quasar';
import { formatPrice } from 'src/utils/format';
import HeroSnow from 'src/components/HeroSnow.vue';

const preview = useProductPreview();

const { products, fetchProducts, loading } = useProducts();

const featuredProducts = computed(() => {
  const available = products.value.filter((p) => p.estado !== 'Agotado');
  const offers = available.filter((p) => p.oferta);
  const nonOffers = available.filter((p) => !p.oferta);

  const selectedOffers = offers.slice(0, 2);
  const remaining = 4 - selectedOffers.length;
  const shuffled = [...nonOffers].sort(() => Math.random() - 0.5);
  const selectedNonOffers = shuffled.slice(0, remaining);

  return [...selectedOffers, ...selectedNonOffers];
});

let observer: IntersectionObserver | null = null;

onMounted(async () => {
  await fetchProducts();
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer?.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  const els = document.querySelectorAll('.section-reveal');
  if (els.length) {
    els.forEach((el) => observer?.observe(el));
  }
});

onUnmounted(() => {
  observer?.disconnect();
});

function openWhatsApp() {
  const url = formatWhatsAppUrl(whatsappConfig.messageTemplates.contact());
  window.open(url, '_blank');
}

useMeta({
  title: `${branding.name} | Inicio`,
  meta: {
    description: { name: 'description', content: branding.slogan },
    'og:title': { property: 'og:title', content: `${branding.name} | Inicio` },
    'og:description': { property: 'og:description', content: branding.slogan },
    'og:image': { property: 'og:image', content: branding.siteUrl + branding.logo },
    'og:url': { property: 'og:url', content: branding.siteUrl + '/' },
    'twitter:title': { name: 'twitter:title', content: `${branding.name} | Inicio` },
    'twitter:description': { name: 'twitter:description', content: branding.slogan },
  },
});
</script>

<style scoped>
.index-page {
  overflow-x: hidden;
  background: #131313;
}

/* Hero */
.hero-section {
  background:
    radial-gradient(
      ellipse 80% 60% at 50% 45%,
      rgba(212, 175, 55, 0.12) 0%,
      transparent 60%
    ),
    linear-gradient(180deg, #121212 0%, #17130a 60%, #131313 100%);
  min-height: 65vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 500px;
  height: 500px;
  transform: translate(-50%, -50%);
  background: radial-gradient(ellipse at center, rgba(212, 175, 55, 0.18) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 1;
  gap: 12px;
  padding-top: 24px;
  padding-bottom: 24px;
}

.hero-eyebrow {
  letter-spacing: 0.08em;
  animation: hero-fade-in 0.6s ease both;
  animation-delay: 0.1s;
}

.hero-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 300;
  font-size: clamp(2.6rem, 10vw, 4.8rem);
  line-height: 1.02;
  letter-spacing: -0.01em;
  color: #f5f5f3;
  margin: 0;
  animation: hero-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: 0.2s;
}

.hero-subtitle {
  font-family: 'Manrope', sans-serif;
  font-size: 0.95rem;
  font-weight: 400;
  color: #a3a39e;
  max-width: 420px;
  line-height: 1.55;
  margin: 0;
}

.hero-cta {
  margin-top: 16px;
  font-size: 1rem;
}

.trust-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(212, 175, 55, 0.25);
}

.trust-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Manrope', sans-serif;
  font-size: 0.8rem;
  color: #e5e2e1;
}

.trust-item .q-icon {
  color: #d4af37;
}

.trust-dot {
  color: rgba(165, 134, 47, 0.6);
  font-size: 0.75rem;
  user-select: none;
}

/* Entrance animations */
@keyframes hero-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes hero-fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-enter-eyebrow {
  animation: hero-fade-in 0.6s ease both;
  animation-delay: 0.1s;
}

.hero-enter-title {
  animation: hero-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: 0.2s;
}

.hero-enter-sub {
  animation: hero-fade-in 0.6s ease both;
  animation-delay: 0.35s;
}

.hero-enter-cta {
  animation: hero-fade-up 0.6s ease both;
  animation-delay: 0.5s;
}

.hero-enter-trust {
  animation: hero-fade-in 0.6s ease both;
  animation-delay: 0.65s;
}

/* Value proposition strip */
.feature-strip {
  background: #151515;
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
}

.feature-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 18px 16px;
}

.feature-icon {
  color: #d4af37;
  flex-shrink: 0;
}

.feature-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.feature-title {
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #f5f5f3;
}

.feature-sub {
  font-family: 'Manrope', sans-serif;
  font-size: 0.75rem;
  color: #a3a39e;
}

.feature-sep {
  width: 1px;
  background: rgba(212, 175, 55, 0.15);
}

@media (max-width: 767px) {
  .feature-strip {
    grid-template-columns: 1fr;
  }

  .feature-item {
    justify-content: flex-start;
    padding: 14px 20px;
  }

  .feature-sep {
    width: auto;
    height: 1px;
  }
}

/* Shelf (featured products) */
.shelf-section {
  background: #131313;
}

.shelf-title {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(1.4rem, 4vw, 1.9rem);
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #f5f5f3;
  margin-top: 6px;
}

.skeleton-card {
  background: #1a1a1a;
}

.shelf-card {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  overflow: hidden;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(212, 175, 55, 0.4);
    box-shadow: 0 12px 36px -8px rgba(212, 175, 55, 0.12);
  }
}

.shelf-img-wrap {
  position: relative;
  overflow: hidden;
  background: #161616;
}

.offer-ribbon {
  position: absolute;
  top: 14px;
  right: -30px;
  background: #e8543f;
  color: #121212;
  font-family: 'Manrope', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 3px 34px;
  transform: rotate(45deg);
  z-index: 2;
  text-transform: uppercase;
  line-height: 1.4;
  pointer-events: none;
}

.shelf-info {
  border-top: 1px solid rgba(212, 175, 55, 0.15);
}

.shelf-name {
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: #f5f5f3;
  line-height: 1.25;
}

.shelf-price {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  color: #e5c378;
  margin-top: 4px;

  .old-price {
    text-decoration: line-through;
    opacity: 0.55;
    margin-right: 6px;
    font-size: 0.85em;
    color: #e57373;
  }

  .sale-price {
    font-weight: 600;
  }
}

.shelf-stacked {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  gap: 2px;
}

.shelf-link {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #d4af37;
}

/* WhatsApp CTA */
.cta-section {
  background: radial-gradient(
      ellipse 70% 80% at 50% 100%,
      rgba(212, 175, 55, 0.08) 0%,
      transparent 60%
    ),
    #131313;
  padding: 3rem 1rem 4.5rem;
}

.cta-panel {
  background: #222222;
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 4px;
  box-shadow: 0 12px 36px -8px rgba(212, 175, 55, 0.12);
  max-width: 640px;
  margin: 0 auto;
  padding: clamp(1.5rem, 5vw, 2.5rem);
  gap: 10px;
}

.cta-eyebrow {
  letter-spacing: 0.16em;
}

.cta-title {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(1.3rem, 4vw, 1.7rem);
  font-weight: 500;
  letter-spacing: 0.01em;
  color: #f5f5f3;
  line-height: 1.2;
  max-width: 480px;
}

.cta-sub {
  font-family: 'Manrope', sans-serif;
  font-size: 0.9rem;
  margin-bottom: 6px;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #121212;
  background: linear-gradient(135deg, #e5c378 0%, #d4af37 50%, #c5a059 100%);
  border: none;
  border-radius: 4px;
  padding: 16px 36px;
  min-height: 54px;
  cursor: pointer;
  margin-top: 12px;
  box-shadow: 0 4px 14px rgba(212, 175, 55, 0.18);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(212, 175, 55, 0.28);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 5rem;
  }

  .trust-row {
    gap: 14px;
  }
}

@media (max-width: 767px) {
  .hero-section {
    min-height: 52vh;
  }
}

@media (max-width: 480px) {
  .hero-eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.06em;
  }
}
</style>