import type { Meta2dData, Pen } from '@meta2d/core';

export type AssetIcon =
  | 'activity'
  | 'arrow-both'
  | 'arrow-left'
  | 'arrow-right'
  | 'building'
  | 'chart'
  | 'checkbox'
  | 'circle'
  | 'diamond'
  | 'factory'
  | 'pentagon'
  | 'slider'
  | 'square'
  | 'star'
  | 'switch'
  | 'triangle'
  | 'warehouse';

export interface CanvasSettings {
  fileName: string;
  category: string;
  background: string;
  showGrid: boolean;
  snapToGrid: boolean;
  zoom: number;
  previewMode: boolean;
  drawingMode?: string | null;
  locked?: boolean;
  projectId?: string;
  gridColor?: string;
}

export interface AssetItem {
  id: string;
  label: string;
  icon: AssetIcon;
  createPen: () => Pen;
}

export interface AssetGroup {
  id: string;
  title: string;
  defaultCollapsed: boolean;
  items: AssetItem[];
}

export interface EditorFile {
  version: 1;
  settings: CanvasSettings;
  meta2d: Meta2dData;
}

export interface CommunicationConfig {
  sourceType: 'mock' | 'http' | 'websocket' | 'mqtt';
  variable: string;
  targetProp: 'text' | 'value' | 'background' | 'color' | 'data';
  mockValue: string;
}
