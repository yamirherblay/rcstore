export interface RateRow {
  key: 'rate_cup' | 'rate_usd' | 'rate_zelle' | 'rate_euro';
  label: string;
  symbol: string;
  order: number;
}

export const remesasConfig = {
  title: 'Cambio del día',
  eyebrow: 'Remesas y cambio',
  description: 'Tasas de referencia para el día de hoy',
  rates: [
    { key: 'rate_usd', label: 'Dólar (USD)', symbol: 'USD', order: 1 },
    { key: 'rate_zelle', label: 'Zelle', symbol: 'Zelle', order: 2 },
    { key: 'rate_euro', label: 'Euro (EUR)', symbol: 'EUR', order: 3 },
  ] satisfies RateRow[],
};

export function formatRate(key: RateRow['key'], value: number): string {
  const row = remesasConfig.rates.find((r) => r.key === key);
  const symbol = row?.symbol ?? key.toUpperCase();
  if (key === 'rate_cup') {
    return `${formatRateNumber(value)} CUP`;
  }
  return `1 ${symbol} = ${formatRateNumber(value)} CUP`;
}

export function formatRateNumber(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('es-CU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(safe);
}