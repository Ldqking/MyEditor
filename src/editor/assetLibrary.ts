import type { Pen } from '@meta2d/core';
import type { AssetGroup, CanvasSettings } from '../types';
import chinaGeoJson from '../assets/map-json/china.json';
import shanxiGeoJson from '../assets/map-json/shanxi.json';

const chartColors = ['#13ddea', '#63f3a9', '#ffd166', '#f87171', '#a78bfa'];
const chartTooltipStyle = {
  confine: true,
  backgroundColor: 'rgba(8, 16, 24, 0.94)',
  borderColor: '#38dfff',
  borderWidth: 1,
  padding: [7, 10],
  textStyle: {
    color: '#e9fbff',
    fontSize: 12,
  },
};

function cleanRegionName(name: string) {
  return name.replace(/市$/, '');
}

const shanxiDisplayGeoJson = JSON.parse(JSON.stringify(shanxiGeoJson)) as typeof shanxiGeoJson;
shanxiDisplayGeoJson.features?.forEach((feature) => {
  if (feature.properties?.name) {
    feature.properties.name = cleanRegionName(feature.properties.name);
  }
});

const basePen = {
  color: '#9fb3bd',
  background: 'rgba(159, 179, 189, 0.08)',
  textColor: '#9fb3bd',
  activeColor: '#13ddea',
  activeBackground: 'rgba(19, 221, 234, 0.12)',
  fontSize: 12,
};

function pen(input: Pen): Pen {
  return JSON.parse(JSON.stringify({ ...basePen, ...input }));
}

function currentTimeText() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const defaultTableData = [
  ['设备', '状态', '数值'],
  ['冷却塔', '运行', '86%'],
  ['水泵', '待机', '42%'],
  ['阀门', '告警', '12%'],
];

const defaultTableStyles = [
  { row: 0, background: 'rgba(19, 221, 234, 0.24)', color: '#38dfff', textColor: '#f2feff', fontWeight: 700 },
  { col: 0, textAlign: 'center' },
  { col: 2, textAlign: 'center', color: '#ffd166', textColor: '#ffd166' },
];

function formTablePen(): Pen {
  return pen({
    name: 'table',
    text: '',
    width: 320,
    height: 156,
    color: '#9FB3BD',
    background: 'rgba(11, 40, 54, 0.78)',
    textColor: '#e9fbff',
    hoverColor: '#0d848dff',
    hoverBackground: 'rgba(19, 221, 234, 0.18)',
    activeColor: '#0c757cff',
    activeBackground: 'rgba(13, 106, 114, 0.22)',
    fontSize: 12,
    rowHeight: 36,
    colWidth: 106,
    hasHeader: true,
    stripe: true,
    stripeColor: 'rgba(56, 223, 255, 0.08)',
    data: defaultTableData,
    styles: defaultTableStyles,
  } as Pen);
}

function normalizeFormTableStyles(styles: unknown) {
  const sourceStyles = Array.isArray(styles) ? styles : defaultTableStyles;
  let changed = !Array.isArray(styles);
  const normalized = sourceStyles.map((style) => {
    if (!style || typeof style !== 'object' || Array.isArray(style)) return style;
    const next = { ...style } as Record<string, unknown>;
    const col = Number(next.col);
    if ((col === 0 || col === 2) && next.textAlign !== 'center') {
      next.textAlign = 'center';
      changed = true;
    }
    return next;
  });
  const hasFirstColStyle = normalized.some((style) => Boolean(style && typeof style === 'object' && !Array.isArray(style) && Number((style as Record<string, unknown>).col) === 0));
  const hasLastColStyle = normalized.some((style) => Boolean(style && typeof style === 'object' && !Array.isArray(style) && Number((style as Record<string, unknown>).col) === 2));

  if (!hasFirstColStyle) {
    normalized.push({ col: 0, textAlign: 'center' });
    changed = true;
  }

  if (!hasLastColStyle) {
    normalized.push({ col: 2, textAlign: 'center', color: '#ffd166', textColor: '#ffd166' });
    changed = true;
  }

  return { styles: normalized, changed };
}

export function upgradeFormPen(input: Pen) {
  const formPen = input as Pen & Record<string, unknown>;
  let upgraded = false;

  if (input.name === 'time') {
    const defaults = {
      text: currentTimeText(),
      width: 210,
      height: 46,
      background: 'rgba(11, 40, 54, 0.78)',
      color: '#38dfff',
      textColor: '#e9fbff',
      fontSize: 15,
      timeFormat: '`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`',
      fillZero: true,
      timeout: 1000,
    };

    Object.entries(defaults).forEach(([key, value]) => {
      if (formPen[key] !== undefined && formPen[key] !== '') return;
      formPen[key] = value;
      upgraded = true;
    });
  }

  if (input.name === 'table' || input.name === 'table2') {
    const defaults = formTablePen() as Pen & Record<string, unknown>;
    const needsData = !Array.isArray(formPen.data) || !Array.isArray((formPen.data as unknown[])[0]);
    const keys = ['width', 'height', 'color', 'background', 'textColor', 'fontSize', 'rowHeight', 'colWidth', 'hasHeader', 'stripe', 'stripeColor', 'styles'];

    if (needsData) {
      formPen.data = defaults.data;
      formPen.rowPos = undefined;
      formPen.colPos = undefined;
      formPen.tableWidth = undefined;
      formPen.tableHeight = undefined;
      formPen.initWorldRect = undefined;
      upgraded = true;
    }

    keys.forEach((key) => {
      if (formPen[key] !== undefined && formPen[key] !== '') return;
      formPen[key] = defaults[key];
      upgraded = true;
    });

    const normalizedStyles = normalizeFormTableStyles(formPen.styles);
    if (normalizedStyles.changed) {
      formPen.styles = normalizedStyles.styles;
      upgraded = true;
    }

    if (upgraded && formPen.calculative && typeof formPen.calculative === 'object') {
      const calculative = formPen.calculative as Record<string, unknown>;
      calculative.texts = undefined;
      calculative.isUpdateData = true;
    }
  }

  return upgraded;
}

function axisOption(data: number[]) {
  return {
    xAxisData: ['A', 'B', 'C', 'D', 'E'],
    data: [data],
    chartsColor: chartColors,
    min: 0,
    max: Math.max(...data) + 10,
    splitNumber: 5,
    xAxis: { axisLabel: { fontColor: '#9fb3bd', fontSize: 11 } },
    yAxis: { axisLabel: { fontColor: '#9fb3bd', fontSize: 11 } },
  };
}

function echartsOption(type: 'bar' | 'line' | 'pie') {
  if (type === 'pie') {
    return {
      backgroundColor: 'transparent',
      color: chartColors,
      tooltip: {
        ...chartTooltipStyle,
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      series: [
        {
          name: '占比',
          type: 'pie',
          radius: ['38%', '68%'],
          data: [
            { name: 'A', value: 28 },
            { name: 'B', value: 42 },
            { name: 'C', value: 30 },
          ],
          label: { color: '#d8e1e7' },
        },
      ],
    };
  }

  return {
    backgroundColor: 'transparent',
    color: chartColors,
    tooltip: {
      ...chartTooltipStyle,
      trigger: 'axis',
      formatter: '{b}<br />{a0}: {c0}',
      axisPointer:
        type === 'bar'
          ? { type: 'shadow', shadowStyle: { color: 'rgba(19, 221, 234, 0.12)' } }
          : { type: 'line', lineStyle: { color: '#75d7ff', width: 1 } },
    },
    grid: { top: 24, right: 18, bottom: 28, left: 34 },
    xAxis: { type: 'category', data: ['A', 'B', 'C', 'D'], axisLabel: { color: '#9fb3bd' } },
    yAxis: { type: 'value', axisLabel: { color: '#9fb3bd' }, splitLine: { lineStyle: { color: '#25333a' } } },
    series: [
      {
        name: type === 'bar' ? '数值' : '趋势',
        type,
        smooth: type === 'line',
        data: [23, 42, 31, 56],
        itemStyle: { color: '#13ddea' },
        lineStyle: { color: '#13ddea' },
      },
    ],
  };
}

const mapConfigs = {
  china: { mapName: 'meta2d-china', geoJson: chinaGeoJson },
  shanxi: { mapName: 'meta2d-shanxi', geoJson: shanxiDisplayGeoJson },
} as const;

type MapScope = keyof typeof mapConfigs;
type MapChartType = 'region' | 'scatter' | 'flow';
type MapDatum = { name: string; value: number };
const mapBaseStyle = {
  areaColor: '#082b4d',
  borderColor: '#2f8fe5',
  borderWidth: 1.6,
  shadowBlur: 8,
  shadowColor: 'rgba(75, 183, 255, 0.62)',
};
const mapRegionStyle = {
  areaColor: '#124b7c',
  borderColor: '#65c2ff',
  borderWidth: 0.75,
  shadowBlur: 3,
  shadowColor: 'rgba(75, 183, 255, 0.58)',
};
const mapRegionEmphasisStyle = {
  areaColor: '#1f75b6',
  borderColor: '#9ad9ff',
  borderWidth: 1.2,
  shadowBlur: 8,
  shadowColor: 'rgba(89, 190, 255, 0.85)',
};
const mapPointStyle = {
  color: '#ff4d6d',
  borderColor: '#fff3b0',
  borderWidth: 1,
  shadowBlur: 18,
  shadowColor: '#ff4d6d',
};
const mapPointEmphasisStyle = { color: '#fff3b0', borderColor: '#ff4d6d', borderWidth: 2, shadowBlur: 24, shadowColor: '#ff4d6d' };
const mapLineStyle = { color: '#ff8a1f', width: 2.2, opacity: 0.96, curveness: 0.22 };
const mapLineEmphasisStyle = { color: '#fff3b0', width: 3, opacity: 1 };
const gaugeBaseStyle = {
  width: 260,
  height: 210,
  min: 0,
  max: 100,
  value: 76,
  splitNumber: 10,
  startAngle: 220,
  endAngle: -40,
  color: '#75d7ff',
  textColor: '#f8fdff',
  background: 'rgba(50, 104, 135, 0.34)',
  chartsColor: ['#33d7ff', '#60f0b1', '#ffd166'],
  axisLine: [
    [0.35, '#2bd6ff'],
    [0.75, '#63f3a9'],
    [1, '#ffd166'],
  ],
  tickLabel: {
    color: '#d8f6ff',
    fontSize: 13,
    fontWeight: '600',
  },
  titleLabel: {
    color: '#f8fdff',
    fontSize: 18,
    fontWeight: '700',
  },
  unit: '%',
};

const chinaRegionData = [
  { name: '台湾', value: 32 },
  { name: '河北', value: 76 },
  { name: '山西', value: 58 },
  { name: '内蒙古', value: 46 },
  { name: '辽宁', value: 72 },
  { name: '吉林', value: 45 },
  { name: '黑龙江', value: 52 },
  { name: '江苏', value: 105 },
  { name: '浙江', value: 98 },
  { name: '安徽', value: 69 },
  { name: '福建', value: 81 },
  { name: '江西', value: 62 },
  { name: '山东', value: 112 },
  { name: '河南', value: 86 },
  { name: '湖北', value: 78 },
  { name: '湖南', value: 73 },
  { name: '广东', value: 118 },
  { name: '广西', value: 54 },
  { name: '海南', value: 38 },
  { name: '四川', value: 83 },
  { name: '贵州', value: 49 },
  { name: '云南', value: 57 },
  { name: '西藏', value: 28 },
  { name: '陕西', value: 66 },
  { name: '甘肃', value: 42 },
  { name: '青海', value: 31 },
  { name: '宁夏', value: 36 },
  { name: '新疆', value: 44 },
  { name: '北京', value: 92 },
  { name: '天津', value: 64 },
  { name: '上海', value: 108 },
  { name: '重庆', value: 71 },
  { name: '香港', value: 61 },
  { name: '澳门', value: 40 },
];

const shanxiRegionData = [
  { name: '太原', value: 96 },
  { name: '大同', value: 72 },
  { name: '阳泉', value: 52 },
  { name: '长治', value: 68 },
  { name: '晋城', value: 63 },
  { name: '朔州', value: 48 },
  { name: '晋中', value: 78 },
  { name: '运城', value: 84 },
  { name: '忻州', value: 56 },
  { name: '临汾', value: 75 },
  { name: '吕梁', value: 61 },
];

const chinaPointData = [
  { name: '北京', value: [116.4, 39.9, 95] },
  { name: '上海', value: [121.5, 31.2, 108] },
  { name: '广州', value: [113.3, 23.1, 86] },
  { name: '成都', value: [104.1, 30.7, 72] },
  { name: '西安', value: [108.9, 34.3, 58] },
  { name: '沈阳', value: [123.4, 41.8, 64] },
];

const shanxiPointData = [
  { name: '太原', value: [112.55, 37.87, 96] },
  { name: '大同', value: [113.3, 40.08, 72] },
  { name: '忻州', value: [112.73, 38.42, 56] },
  { name: '吕梁', value: [111.13, 37.52, 61] },
  { name: '晋中', value: [112.75, 37.69, 78] },
  { name: '临汾', value: [111.52, 36.08, 75] },
  { name: '运城', value: [111.0, 35.02, 84] },
  { name: '长治', value: [113.12, 36.2, 68] },
  { name: '晋城', value: [112.85, 35.5, 63] },
];

function getMapData(scope: MapScope) {
  return scope === 'china'
    ? { regions: chinaRegionData, points: chinaPointData, center: chinaPointData[0] }
    : { regions: shanxiRegionData, points: shanxiPointData, center: shanxiPointData[0] };
}

function mapLabel(scope: MapScope) {
  return {
    show: true,
    color: '#d9f3ff',
    fontSize: scope === 'china' ? 9 : 11,
    textBorderColor: '#072342',
    textBorderWidth: 2,
    textShadowBlur: 6,
    textShadowColor: 'rgba(75, 183, 255, 0.8)',
  };
}

function mapRegionDataWithLabel(scope: MapScope, regions: MapDatum[]) {
  const label = mapLabel(scope);
  return regions.map((item) => ({
    ...item,
    label,
    emphasis: {
      label: { ...label, color: '#fff3b0' },
      itemStyle: mapRegionEmphasisStyle,
    },
  }));
}

function mapLayerBase(mapName: string, regions: MapDatum[]) {
  return {
    name: '地图底色',
    type: 'map',
    map: mapName,
    silent: true,
    roam: false,
    layoutCenter: ['50%', '50%'],
    layoutSize: '92%',
    z: 0,
    label: { show: false },
    itemStyle: mapBaseStyle,
    emphasis: { disabled: true },
  };
}

function echartsMapOption(scope: MapScope, type: MapChartType) {
  const { mapName } = mapConfigs[scope];
  const { regions, points, center } = getMapData(scope);
  const label = mapLabel(scope);
  const geo = {
    map: mapName,
    roam: true,
    layoutCenter: ['50%', '50%'],
    layoutSize: '92%',
    tooltip: { show: true },
    itemStyle: mapRegionStyle,
    emphasis: {
      label: { color: '#fff3b0' },
      itemStyle: mapRegionEmphasisStyle,
    },
    label,
  };

  if (type === 'scatter') {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{b}',
      },
      geo,
      series: [
        {
          name: '城市点位',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          rippleEffect: { brushType: 'stroke', scale: 4.2 },
          symbolSize: 13,
          data: points,
          label: { show: false, formatter: '{b}' },
          itemStyle: mapPointStyle,
          emphasis: {
            scale: true,
            itemStyle: mapPointEmphasisStyle,
            label: { show: true, color: '#fff6c7', formatter: '{b}' },
          },
          encode: { value: 2 },
        },
      ],
    };
  }

  if (type === 'flow') {
    const origin = center.value.slice(0, 2);
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{b}',
      },
      geo,
      series: [
        {
          name: '线路',
          type: 'lines',
          coordinateSystem: 'geo',
          zlevel: 2,
          effect: { show: true, period: 4, trailLength: 0.18, symbolSize: 6, color: '#fff3b0' },
          lineStyle: mapLineStyle,
          label: { show: false },
          emphasis: {
            lineStyle: mapLineEmphasisStyle,
          },
          data: points
            .filter((item) => item.name !== center.name)
            .map((item) => ({ fromName: center.name, toName: item.name, coords: [origin, item.value.slice(0, 2)] })),
        },
        {
          name: '节点',
          type: 'scatter',
          coordinateSystem: 'geo',
          symbolSize: 8,
          data: points,
          label: { show: false, formatter: '{b}' },
          itemStyle: mapPointStyle,
          emphasis: {
            scale: true,
            itemStyle: mapPointEmphasisStyle,
            label: { show: true, color: '#fff6c7', formatter: '{b}' },
          },
        },
      ],
    };
  }

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}',
    },
    series: [
      {
        name: '区域指标',
        type: 'map',
        map: mapName,
        roam: true,
        layoutCenter: ['50%', '50%'],
        layoutSize: '92%',
        z: 2,
        selectedMode: false,
        label,
        labelLayout: { hideOverlap: false },
        itemStyle: mapRegionStyle,
        emphasis: {
          label: { color: '#fff3b0' },
          itemStyle: mapRegionEmphasisStyle,
        },
        data: mapRegionDataWithLabel(scope, regions),
      },
      mapLayerBase(mapName, regions),
    ],
  };
}

export function echartsMapConfig(scope: MapScope, type: MapChartType) {
  const { mapName, geoJson } = mapConfigs[scope];
  return {
    option: echartsMapOption(scope, type),
    max: 120,
    replaceMode: 0,
    theme: '',
    timeFormat: '',
    autoGetTime: false,
    geoName: mapName,
    geoJson,
  };
}

export function inferEchartsMapScope(pen: Pen): MapScope | null {
  const echartsConfig = (pen as Pen & { echarts?: { geoName?: string; geoJson?: { features?: unknown[] } } }).echarts;
  const geoName = echartsConfig?.geoName;
  const series = (pen as Pen & { echarts?: { option?: { series?: Array<{ map?: string }> } } }).echarts?.option?.series || [];
  const mapName = geoName || series.find((item) => item.map)?.map;
  if (mapName === mapConfigs.china.mapName || mapName === 'china' || mapName === 'meta2d-china-regions') return 'china';
  if (mapName === mapConfigs.shanxi.mapName || mapName === 'shanxi') return 'shanxi';
  if (echartsConfig?.geoJson?.features?.length === 34) return 'china';
  if (echartsConfig?.geoJson?.features?.length === 11) return 'shanxi';
  return null;
}

export function inferEchartsMapType(pen: Pen): MapChartType {
  const series = (pen as Pen & { echarts?: { option?: { series?: Array<{ type?: string }> } } }).echarts?.option?.series || [];
  if (series.some((item) => item.type === 'lines')) return 'flow';
  if (series.some((item) => item.type === 'effectScatter')) return 'scatter';
  return 'region';
}

export function fillMapData(value: unknown, scope: MapScope): any[] {
  if (!Array.isArray(value)) return [];
  const regions = scope === 'china' ? chinaRegionData : shanxiRegionData;
  return regions.map((r) => {
    const userItem = value.find((item: any) =>
      item && typeof item === 'object' && typeof item.name === 'string' &&
      (item.name === r.name || item.name.includes(r.name) || r.name.includes(item.name))
    );
    return {
      name: r.name,
      value: userItem ? Number(userItem.value) || 0 : 0,
    };
  });
}

export function suppressPenHoverTitle(pen: Pen) {
  const hoverTitlePen = pen as Pen & { titleFn?: unknown; titleFnJs?: string };
  const changed = Boolean(hoverTitlePen.title || hoverTitlePen.titleFn || hoverTitlePen.titleFnJs);
  hoverTitlePen.title = '';
  hoverTitlePen.titleFnJs = '';
  hoverTitlePen.titleFn = undefined;
  return changed;
}

export function suppressEchartsHoverTitle(pen: Pen) {
  if (pen.name !== 'echarts') return false;
  return suppressPenHoverTitle(pen);
}

export function enhanceGaugePen(pen: Pen) {
  if (pen.name !== 'gauge') return false;
  const current = pen as Pen & { min?: unknown; max?: unknown; value?: unknown; unit?: unknown };
  Object.assign(pen, {
    ...gaugeBaseStyle,
    value: typeof current.value === 'number' ? current.value : gaugeBaseStyle.value,
    min: typeof current.min === 'number' ? current.min : gaugeBaseStyle.min,
    max: typeof current.max === 'number' ? current.max : gaugeBaseStyle.max,
    unit: current.unit !== undefined ? String(current.unit) : gaugeBaseStyle.unit,
  });
  return true;
}

export function enhanceEchartsTooltipPen(pen: Pen) {
  if (pen.name !== 'echarts') return false;
  const echarts = (pen as Pen & { echarts?: { option?: Record<string, unknown> } }).echarts;
  const option = echarts?.option;
  if (!option) return false;
  const chartType = inferBasicEchartsType(option);
  if (!chartType) return false;

  option.tooltip = getBasicEchartsTooltip(chartType);
  normalizeEchartsSeries(option.series).forEach((series) => {
    if (chartType === 'bar' && !series.name) series.name = '数值';
    if (chartType === 'line' && !series.name) series.name = '趋势';
    if (chartType === 'pie' && !series.name) series.name = '占比';
  });
  return true;
}

export function upgradeEchartsMapPen(pen: Pen) {
  if (pen.name !== 'echarts') return false;
  const titleChanged = suppressEchartsHoverTitle(pen);
  const scope = inferEchartsMapScope(pen);
  if (!scope) return titleChanged;
  const type = inferEchartsMapType(pen);
  pen.externElement = true;

  const existingEcharts = (pen as Pen & { echarts?: Record<string, unknown> }).echarts || {};
  const newConfig = echartsMapConfig(scope, type);

  (pen as Pen & { echarts?: unknown }).echarts = {
    ...newConfig,
    ...existingEcharts,
    option: existingEcharts.option || newConfig.option,
    geoName: newConfig.geoName,
    geoJson: newConfig.geoJson,
  };
  return true;
}

function inferBasicEchartsType(option: Record<string, unknown>): 'bar' | 'line' | 'pie' | null {
  const series = normalizeEchartsSeries(option.series);
  if (!series.length) return null;
  if (series.some((item) => item.type === 'map' || item.type === 'effectScatter' || item.type === 'lines' || item.coordinateSystem === 'geo')) return null;
  if (series.some((item) => item.type === 'pie')) return 'pie';
  if (series.some((item) => item.type === 'line')) return 'line';
  if (series.some((item) => item.type === 'bar')) return 'bar';
  return null;
}

function normalizeEchartsSeries(series: unknown): Array<Record<string, any>> {
  if (Array.isArray(series)) return series.filter((item): item is Record<string, any> => Boolean(item && typeof item === 'object'));
  if (series && typeof series === 'object') return [series as Record<string, any>];
  return [];
}

function getBasicEchartsTooltip(type: 'bar' | 'line' | 'pie') {
  if (type === 'pie') {
    return {
      ...chartTooltipStyle,
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    };
  }

  return {
    ...chartTooltipStyle,
    trigger: 'axis',
    formatter: '{b}<br />{a0}: {c0}',
    axisPointer:
      type === 'bar'
        ? { type: 'shadow', shadowStyle: { color: 'rgba(19, 221, 234, 0.12)' } }
        : { type: 'line', lineStyle: { color: '#75d7ff', width: 1 } },
  };
}

export const assetGroups: AssetGroup[] = [
  {
    id: 'common',
    title: '常用图元',
    defaultCollapsed: false,
    items: [],
  },
  {
    id: 'basic',
    title: '基础图形',
    defaultCollapsed: false,
    items: [
      { id: 'rectangle', label: '矩形', image: './img/basis/rectangle.png', createPen: () => pen({ name: 'rectangle', text: 'RECT_01', width: 140, height: 90 }) },
      { id: 'circle', label: '圆形', image: './img/basis/circle.png', createPen: () => pen({ name: 'circle', text: 'CIRCLE_01', width: 110, height: 110 }) },
      { id: 'diamond', label: '菱形', image: './img/basis/diamond.png', createPen: () => pen({ name: 'diamond', text: 'DATA_CORE_01', width: 140, height: 90 }) },
      { id: 'triangle', label: '三角形', image: './img/basis/triangle.png', createPen: () => pen({ name: 'triangle', text: 'TRIANGLE', width: 130, height: 100 }) },
      { id: 'pentagon', label: '五边形', image: './img/basis/pentagon.png', createPen: () => pen({ name: 'pentagon', text: 'PENTAGON', width: 130, height: 105 }) },
      { id: 'pentagram', label: '星形', image: './img/basis/pentagram.png', createPen: () => pen({ name: 'pentagram', text: 'STAR', width: 120, height: 115 }) },
      { id: 'leftArrow', label: '左箭头', image: './img/basis/leftArrow.png', createPen: () => pen({ name: 'leftArrow', text: '', width: 150, height: 70 }) },
      { id: 'rightArrow', label: '右箭头', image: './img/basis/rightArrow.png', createPen: () => pen({ name: 'rightArrow', text: '', width: 150, height: 70 }) },
      { id: 'twowayArrow', label: '双向箭头', image: './img/basis/twowayArrow.png', createPen: () => pen({ name: 'twowayArrow', text: '', width: 170, height: 70 }) },
      { id: 'hexagon', label: '六边形', image: './img/basis/hexagon.png', createPen: () => pen({ name: 'hexagon', text: 'HEX', width: 130, height: 100 }) },
      { id: 'cloud', label: '云', image: './img/basis/cloud.png', createPen: () => pen({ name: 'cloud', text: 'CLOUD', width: 150, height: 95 }) },
      { id: 'message', label: '消息', image: './img/basis/message.png', createPen: () => pen({ name: 'message', text: 'MESSAGE', width: 150, height: 90 }) },
    ],
  },
  {
    id: 'flow',
    title: '流程图',
    defaultCollapsed: true,
    items: [
      { id: 'flowData', label: '数据', image: './img/flow/flowData.png', createPen: () => pen({ name: 'flowData', text: '数据', width: 140, height: 90 }) },
      { id: 'flowDocument', label: '文档', image: './img/flow/flowDocument.png', createPen: () => pen({ name: 'flowDocument', text: '文档', width: 150, height: 100 }) },
      { id: 'flowQueue', label: '队列', image: './img/flow/flowQueue.png', createPen: () => pen({ name: 'flowQueue', text: '队列', width: 150, height: 90 }) },
      { id: 'flowDb', label: '数据库', image: './img/flow/flowDb.png', createPen: () => pen({ name: 'flowDb', text: 'DB', width: 140, height: 100 }) },
      { id: 'flowSubprocess', label: '子流程', image: './img/flow/flowSubprocess.png', createPen: () => pen({ name: 'flowSubprocess', text: '子流程', width: 160, height: 90 }) },
      { id: 'flowParallel', label: '并行', image: './img/flow/flowParallel.png', createPen: () => pen({ name: 'flowParallel', text: '并行', width: 150, height: 90 }) },
    ],
  },
  {
    id: 'uml',
    title: 'UML/活动图',
    defaultCollapsed: true,
    items: [
      { id: 'swimlaneH', label: '横向泳道', image: './img/uml/swimlaneH.png', createPen: () => pen({ name: 'swimlaneH', text: '泳道', width: 260, height: 160 }) },
      { id: 'swimlaneV', label: '纵向泳道', image: './img/uml/swimlaneV.png', createPen: () => pen({ name: 'swimlaneV', text: '泳道', width: 180, height: 240 }) },
      { id: 'simpleClass', label: '类', image: './img/uml/simpleClass.png', createPen: () => pen({ name: 'simpleClass', text: 'User|+ name\\n+ role|- login()', width: 180, height: 140 }) },
      { id: 'interfaceClass', label: '接口', image: './img/uml/interfaceClass.png', createPen: () => pen({ name: 'interfaceClass', text: 'IService|+ run()', width: 180, height: 130 }) },
      { id: 'lifeline', label: '生命线', image: './img/uml/lifeline.png', createPen: () => pen({ name: 'lifeline', text: 'Service', width: 120, height: 220 }) },
      { id: 'sequenceFocus', label: '激活条', image: './img/uml/sequenceFocus.png', createPen: () => pen({ name: 'sequenceFocus', text: '', width: 36, height: 170 }) },
    ],
  },
  {
    id: 'form',
    title: '表单控件',
    defaultCollapsed: true,
    items: [
      {
        id: 'time',
        label: '时间',
        image: './img/form/time.png',
        createPen: () =>
          pen({
            name: 'time',
            text: currentTimeText(),
            width: 210,
            height: 46,
            background: 'rgba(11, 40, 54, 0.78)',
            color: '#38dfff',
            textColor: '#e9fbff',
            fontSize: 15,
            timeFormat: '`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`',
            fillZero: true,
            timeout: 1000,
          } as Pen),
      },
      { id: 'table', label: '表格', image: './img/form/table.png', createPen: formTablePen },
    ],
  },
  {
    id: 'charts',
    title: 'ECharts图表',
    defaultCollapsed: false,
    items: [
      {
        id: 'echartsBar',
        label: 'ECharts柱图',
        image: './img/echarts/echartsBar.png',
        createPen: () =>
          pen({
            name: 'echarts',
            externElement: true,
            text: '',
            width: 270,
            height: 190,
            echarts: { option: echartsOption('bar'), max: 100, replaceMode: 0, theme: '', timeFormat: '', autoGetTime: false },
          } as Pen),
      },
      {
        id: 'echartsLine',
        label: 'ECharts折线',
        image: './img/echarts/echartsLine.png',
        createPen: () =>
          pen({
            name: 'echarts',
            externElement: true,
            text: '',
            width: 270,
            height: 190,
            echarts: { option: echartsOption('line'), max: 100, replaceMode: 0, theme: '', timeFormat: '', autoGetTime: false },
          } as Pen),
      },
      {
        id: 'echartsPie',
        label: 'ECharts饼图',
        image: './img/echarts/echartsPie.png',
        createPen: () =>
          pen({
            name: 'echarts',
            externElement: true,
            text: '',
            width: 230,
            height: 200,
            echarts: { option: echartsOption('pie'), max: 100, replaceMode: 0, theme: '', timeFormat: '', autoGetTime: false },
          } as Pen),
      },
      {
        id: 'gauge',
        label: '仪表盘',
        image: './img/echarts/gauge.png',
        createPen: () =>
          pen({
            name: 'gauge',
            text: '',
            width: 220,
            height: 180,
            min: 0,
            max: 100,
            value: 68,
            splitNumber: 5,
            color: '#13ddea', // 高亮指针及关键刻度
            textColor: '#cbd5da', // 文本数字以明亮白灰色展示
            background: 'rgba(19, 221, 234, 0.02)', // 精致内敛的微光底色
            chartsColor: ['#13ddea'],
            unit: '%',
            ...(gaugeBaseStyle as Record<string, unknown>),
          } as Pen),
      },
      {
        id: 'echartsMapRegion',
        label: 'ECharts地图',
        image: './img/echarts/echartsMapRegion.png',
        createPen: () =>
          pen({
            name: 'echarts',
            externElement: true,
            text: '',
            width: 320,
            height: 240,
            echarts: echartsMapConfig('china', 'region'),
          } as Pen),
      },
      {
        id: 'echartsMapScatter',
        label: '地图点位',
        image: './img/echarts/echartsMapScatter.png',
        createPen: () =>
          pen({
            name: 'echarts',
            externElement: true,
            text: '',
            width: 320,
            height: 240,
            echarts: echartsMapConfig('china', 'scatter'),
          } as Pen),
      },
      {
        id: 'echartsMapFlow',
        label: '地图线路',
        image: './img/echarts/echartsMapFlow.png',
        createPen: () =>
          pen({
            name: 'echarts',
            externElement: true,
            text: '',
            width: 320,
            height: 240,
            echarts: echartsMapConfig('china', 'flow'),
          } as Pen),
      },
      {
        id: 'echartsShanxiMap',
        label: '山西地图',
        image: './img/echarts/echartsShanxiMap.png',
        createPen: () =>
          pen({
            name: 'echarts',
            externElement: true,
            text: '',
            width: 320,
            height: 240,
            echarts: echartsMapConfig('shanxi', 'region'),
          } as Pen),
      },
      {
        id: 'echartsShanxiScatter',
        label: '山西点位',
        image: './img/echarts/echartsShanxiScatter.png',
        createPen: () =>
          pen({
            name: 'echarts',
            externElement: true,
            text: '',
            width: 320,
            height: 240,
            echarts: echartsMapConfig('shanxi', 'scatter'),
          } as Pen),
      },
    ],
  },
  {
    id: 'device',
    title: '设备图元',
    defaultCollapsed: true,
    items: Array.from({ length: 12 }).map((_, i) => ({
      id: `device${i + 1}`,
      label: `设备${i + 1}`,
      image: `./img/device/device${i + 1}.png`,
      createPen: () => pen({ name: 'image', image: `./img/device/device${i + 1}.png`, width: 100, height: 100 }),
    })),
  },
  {
    id: 'bigscreen',
    title: '大屏图元',
    defaultCollapsed: true,
    items: [
      {
        id: 'title',
        label: '标题',
        image: './img/bigscreen/title.png',
        span: 3,
        createPen: () => pen({ name: 'image', image: './img/bigscreen/title.png', width: 1000, height: 100 }),
      },
      {
        id: 'card1',
        label: '卡片1',
        image: './img/bigscreen/card1.png',
        createPen: () => pen({ name: 'image', image: './img/bigscreen/card1.png', width: 400, height: 300 }),
      },
      {
        id: 'card2',
        label: '卡片2',
        image: './img/bigscreen/card2.png',
        createPen: () => pen({ name: 'image', image: './img/bigscreen/card2.png', width: 400, height: 300 }),
      },
    ],
  },
];

export const initialSettings: CanvasSettings = {
  fileName: 'Default Canvas',
  category: '项目A',
  background: '#101214',
  showGrid: false,
  snapToGrid: true,
  zoom: 1,
  previewMode: false,
  gridColor: '#243139',
  mockSources: [
    {
      id: 'equipment-status',
      name: '设备状态',
      description: '设备在线、温度、压力等实时态数据',
      payload: {
        device: {
          id: 'DEV-2108',
          name: '循环泵 A01',
          status: '在线',
          temperature: 68.4,
          pressure: 0.82,
          color: "red",
          bgcolor: "green",
          running: true,
        },
        metrics: {
          voltage: 220,
          current: 14.6,
          power: 3.2,
        },
      },
    },
    {
      id: 'production-line',
      name: '产线指标',
      description: '产量、良率、节拍和工单信息',
      payload: {
        line: {
          name: '一号产线',
          orderNo: 'MO-20260526-001',
          output: 1280,
          target: 1500,
          yieldRate: 98.6,
          beat: '42s',
        },
        shift: {
          leader: '张工',
          team: 'A 班',
        },
      },
    },
    {
      id: 'alarm-summary',
      name: '告警汇总',
      description: '告警数量、等级和最近告警',
      payload: {
        alarm: {
          total: 6,
          critical: 1,
          warning: 5,
          latest: '冷却水压力偏低',
          level: 'warning',
        },
        notify: {
          owner: '运维中心',
          phone: '400-800-1024',
        },
      },
    },
    {
      id: 'echarts-demo',
      name: 'ECharts 测试数据',
      description: '柱图、折线、饼图和地图图表测试数据',
      payload: {
        charts: {
          bar: {
            categories: ['A', 'B', 'C', 'D', 'E'],
            values: [28, 46, 32, 58, 41],
          },
          line: {
            categories: ['一月', '二月', '三月', '四月', '五月', '六月'],
            values: [12, 24, 18, 36, 42, 31],
          },
          pie: [
            { name: '运行', value: 52 },
            { name: '待机', value: 28 },
            { name: '告警', value: 12 },
            { name: '离线', value: 8 },
          ],
          mapRegion: [
            { name: '北京', value: 92 },
            { name: '上海', value: 108 },
            { name: '广东', value: 118 },
            { name: '四川', value: 83 },
            { name: '山西', value: 58 },
          ],
          mapPoints: [
            { name: '北京', value: [116.4, 39.9, 95] },
            { name: '上海', value: [121.5, 31.2, 108] },
            { name: '广州', value: [113.3, 23.1, 86] },
            { name: '成都', value: [104.1, 30.7, 72] },
            { name: '西安', value: [108.9, 34.3, 58] },
          ],
          shanxiMapRegion: [
            { name: '太原市', value: 96 },
            { name: '大同市', value: 72 },
            { name: '阳泉市', value: 52 },
            { name: '长治市', value: 68 },
            { name: '晋城市', value: 63 },
            { name: '朔州市', value: 48 },
            { name: '晋中市', value: 78 },
            { name: '运城市', value: 84 },
            { name: '忻州市', value: 56 },
            { name: '临汾市', value: 75 },
            { name: '吕梁市', value: 61 },
          ],
          shanxiMapPoints: [
            { name: '太原', value: [112.55, 37.87, 96] },
            { name: '大同', value: [113.3, 40.08, 72] },
            { name: '忻州', value: [112.73, 38.42, 56] },
            { name: '吕梁', value: [111.13, 37.52, 61] },
            { name: '晋中', value: [112.75, 37.69, 78] },
            { name: '临汾', value: [111.52, 36.08, 75] },
            { name: '运城', value: [111.0, 35.02, 84] },
            { name: '长治', value: [113.12, 36.2, 68] },
            { name: '晋城', value: [112.85, 35.5, 63] },
          ],
          gauge: {
            value: 76,
            min: 0,
            max: 100,
            unit: '%',
          },
        },
      },
    },
    {
      id: 'table-demo',
      name: '表格测试数据',
      description: '表格控件专用 mock 数据',
      payload: {
        table: {
          data: [
            ['设备', '状态', '数值', '其他'],
            ['冷却塔', '运行', '86%', '很好'],
            ['水泵', '待机', '42%', '良好'],
            ['阀门', '告警', '12%', '一般'],
            ['风机', '在线', '73%', ''],
            ['冷却塔', '运行', '86%', '很好'],
            ['水泵', '待机', '42%', '良好'],
            ['阀门', '告警', '12%', '一般'],
            ['风机', '在线', '73%', ''],
          ],
          rowHeight: 36,
          colWidth: 106,
          hasHeader: true,
          stripe: true,
          stripeColor: 'rgba(56, 223, 255, 0.08)',
          styles: defaultTableStyles,
        },
      },
    },
  ],
};
