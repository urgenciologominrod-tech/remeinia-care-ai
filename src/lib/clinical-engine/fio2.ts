export const normalizeFio2 = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  if (value >= 0.21 && value <= 1) return value;
  if (value >= 21 && value <= 100) return value / 100;
  return null;
};

export const formatFio2 = (value: unknown): string => {
  const normalized = normalizeFio2(value);
  if (normalized === null) return 'No especificada';
  return `${Math.round(normalized * 100)}%`;
};
