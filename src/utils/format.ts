/** Formata segundos como mm:ss. Valores inválidos ou negativos viram 00:00. */
export function formatTime(totalSec: number): string {
  if (!Number.isFinite(totalSec) || totalSec < 0) return '00:00';
  const s = Math.floor(totalSec);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}
