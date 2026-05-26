export function normalizeColor(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  if (/^#[0-9a-f]{6,8}$/i.test(value)) return value;
  if (/^rgba?\(/i.test(value)) return value;
  return fallback;
}

export function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function parseColor(color: string): { hex: string; alpha: number } {
  if (!color) return { hex: '#000000', alpha: 1 };
  if (color.startsWith('#')) {
    if (color.length === 9) {
      return {
        hex: color.substring(0, 7),
        alpha: Math.round((parseInt(color.substring(7, 9), 16) / 255) * 100) / 100,
      };
    }
    return { hex: color, alpha: 1 };
  }
  if (color.startsWith('rgba')) {
    const parts = color.match(/[\d.]+/g);
    if (parts && parts.length >= 4) {
      const r = parseInt(parts[0], 10);
      const g = parseInt(parts[1], 10);
      const b = parseInt(parts[2], 10);
      const a = parseFloat(parts[3]);
      return { hex: `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`, alpha: a };
    }
  }
  if (color.startsWith('rgb')) {
    const parts = color.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      const r = parseInt(parts[0], 10);
      const g = parseInt(parts[1], 10);
      const b = parseInt(parts[2], 10);
      return { hex: `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`, alpha: 1 };
    }
  }
  return { hex: color, alpha: 1 };
}
