import { onMounted, onUnmounted, type Ref } from 'vue';

export interface HeroSnowOptions {
  /** Nº de copos. 'medium' escala con el ancho de pantalla. */
  density?: 'low' | 'medium' | 'high';
  /** Porcentaje (0-1) de copos dorados; el resto blanco. */
  goldRatio?: number;
}

interface SnowFlake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  gold: boolean;
  phase: number;
  swayAmp: number;
}

const SPEED_BASE = 0.42; // px/frame a 60fps

export function useHeroSnow(canvasRef: Ref<HTMLCanvasElement | null>, options: HeroSnowOptions = {}) {
  const { density = 'medium', goldRatio = 0.15 } = options;

  let ctx: CanvasRenderingContext2D | null = null;
  let flakes: SnowFlake[] = [];
  let raf = 0;
  let lastTime = 0;
  let running = false;
  let width = 0;
  let height = 0;
  let dpr = 1;

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  function countFor(w: number): number {
    if (density === 'low') return Math.min(60, Math.floor(w / 34));
    if (density === 'high') return Math.min(200, Math.floor(w / 14));
    return Math.min(120, Math.floor(w / 26));
  }

  function buildFlakes(list: SnowFlake[], w: number, h: number): SnowFlake[] {
    const n = countFor(w);
    const seed = list.length ? list : [];
    const next: SnowFlake[] = [];

    for (let i = 0; i < n; i++) {
      const existing = seed[i];
      next.push({
        x: existing ? existing.x : Math.random() * w,
        y: existing ? existing.y : Math.random() * h,
        radius: 0.6 + Math.random() * 1.6,
        speed: SPEED_BASE * (0.6 + Math.random() * 0.9),
        opacity: 0.25 + Math.random() * 0.3,
        gold: Math.random() < goldRatio,
        phase: Math.random() * Math.PI * 2,
        swayAmp: 0.15 + Math.random() * 0.3,
      });
    }
    return next;
  }

  function resize() {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    width = parent.clientWidth;
    height = parent.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const n = countFor(width);
    if (flakes.length !== n) flakes = buildFlakes(flakes, width, height);
    if (reduceMotion) {
      drawFrame();
    } else if (!running) {
      start();
    }
  }

  function drawFrame() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    for (const f of flakes) {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
      ctx.fillStyle = f.gold ? `rgba(212, 175, 55, ${f.opacity})` : `rgba(255, 255, 255, ${f.opacity})`;
      ctx.fill();
    }
  }

  function step(now: number) {
    if (!running) return;
    const dt = lastTime ? Math.min(now - lastTime, 50) : 16.67;
    lastTime = now;
    const factor = dt / 16.67;

    for (const f of flakes) {
      f.y += f.speed * factor;
      f.x += Math.sin(now * 0.0008 + f.phase) * f.swayAmp * factor;
      if (f.y - f.radius > height) {
        f.y = -f.radius - Math.random() * 40;
        f.x = Math.random() * width;
        f.phase = Math.random() * Math.PI * 2;
      }
      if (f.x > width + 2) f.x = -2;
      if (f.x < -2) f.x = width + 2;
    }

    drawFrame();
    raf = requestAnimationFrame(step);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    lastTime = 0;
    raf = requestAnimationFrame(step);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  let ro: ResizeObserver | null = null;
  let io: IntersectionObserver | null = null;

  function onVisibility() {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  }

  function mount() {
    const canvas = canvasRef.value;
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    resize();

    if (reduceMotion) return;

    if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
      ro = new ResizeObserver(resize);
      ro.observe(canvas.parentElement);
    } else {
      window.addEventListener('resize', resize);
    }

    document.addEventListener('visibilitychange', onVisibility);
    if (typeof IntersectionObserver !== 'undefined' && canvas.parentElement) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting ? start() : stop()));
      });
      io.observe(canvas.parentElement);
    }
  }

  function destroy() {
    stop();
    ro?.disconnect();
    io?.disconnect();
    ro = null;
    io = null;
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('resize', resize);
  }

  onMounted(mount);
  onUnmounted(destroy);

  return { mount, destroy, start, stop };
}