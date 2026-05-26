import {
  Activity,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  Building2,
  Circle,
  Pentagon,
  SlidersHorizontal,
  Square,
  Star,
  ToggleRight,
  Triangle,
  Warehouse,
  Zap,
  CheckSquare,
  Map,
} from 'lucide-react';
import type { AssetIcon } from '../types';

export function PaletteIcon({ icon }: { icon: AssetIcon }) {
  if (icon === 'square') return <Square size={30} />;
  if (icon === 'circle') return <Circle size={32} />;
  if (icon === 'triangle') return <Triangle size={32} />;
  if (icon === 'pentagon') return <Pentagon size={32} />;
  if (icon === 'arrow-left') return <ArrowLeft size={34} />;
  if (icon === 'arrow-right') return <ArrowRight size={34} />;
  if (icon === 'arrow-both') return <ArrowLeftRight size={34} />;
  if (icon === 'building') return <Building2 size={34} />;
  if (icon === 'factory') return <Zap size={34} />;
  if (icon === 'warehouse') return <Warehouse size={34} />;
  if (icon === 'map') return <Map size={34} />;
  if (icon === 'chart') return <BarChart3 size={34} />;
  if (icon === 'activity') return <Activity size={34} />;
  if (icon === 'switch') return <ToggleRight size={34} />;
  if (icon === 'slider') return <SlidersHorizontal size={34} />;
  if (icon === 'checkbox') return <CheckSquare size={32} />;
  return <Star size={32} />;
}
