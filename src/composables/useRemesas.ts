import { ref } from 'vue';
import { supabase } from 'boot/supabase';
import { getBusinessId } from 'src/config/business';
import type { RemesaRate } from 'src/stores/types';

const TTL = 30_000;
const cache = new Map<string, { data: RemesaRate | null; at: number }>();

export function useRemesas() {
  const remesa = ref<RemesaRate | null>(null);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);

  function clearCache(negocioId?: string) {
    if (negocioId) cache.delete(negocioId);
    else cache.clear();
  }

  async function fetchRates(negocioId = getBusinessId()): Promise<RemesaRate | null> {
    if (!negocioId) {
      error.value = 'No hay negocio configurado';
      return null;
    }

    const cached = cache.get(negocioId);
    if (cached && Date.now() - cached.at < TTL) {
      remesa.value = cached.data;
      return cached.data;
    }

    loading.value = true;
    error.value = null;
    try {
      const { data, error: fetchError } = await supabase
        .from('remesasServices')
        .select('*')
        .eq('negocio_id', negocioId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      remesa.value = data as RemesaRate | null;
      cache.set(negocioId, { data: remesa.value, at: Date.now() });
      return remesa.value;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error cargando tasas de cambio';
      console.error('Error fetchRates:', e);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function saveRates(payload: Omit<RemesaRate, 'id' | 'created_at' | 'negocio_id'>): Promise<boolean> {
    const negocioId = getBusinessId();
    if (!negocioId) {
      error.value = 'No hay negocio configurado';
      return false;
    }

    saving.value = true;
    error.value = null;
    try {
      const exists = remesa.value?.id;
      if (exists) {
        const { error: updateError } = await supabase
          .from('remesasServices')
          .update(payload)
          .eq('id', exists)
          .eq('negocio_id', negocioId);
        if (updateError) throw updateError;
        remesa.value = { ...remesa.value, ...payload } as RemesaRate;
      } else {
        const { data, error: insertError } = await supabase
          .from('remesasServices')
          .insert({ ...payload, negocio_id: negocioId })
          .select()
          .single();
        if (insertError) throw insertError;
        remesa.value = data as RemesaRate;
      }
      clearCache(negocioId);
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error guardando tasas de cambio';
      console.error('Error saveRates:', e);
      return false;
    } finally {
      saving.value = false;
    }
  }

  return {
    remesa,
    loading,
    saving,
    error,
    fetchRates,
    saveRates,
    clearCache,
  };
}