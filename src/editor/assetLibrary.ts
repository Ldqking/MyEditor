import type { Pen } from '@meta2d/core';
import type { AssetGroup, CanvasSettings } from '../types';

const chartColors = ['#13ddea', '#63f3a9', '#ffd166', '#f87171', '#a78bfa'];

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
      series: [
        {
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
    grid: { top: 24, right: 18, bottom: 28, left: 34 },
    xAxis: { type: 'category', data: ['A', 'B', 'C', 'D'], axisLabel: { color: '#9fb3bd' } },
    yAxis: { type: 'value', axisLabel: { color: '#9fb3bd' }, splitLine: { lineStyle: { color: '#25333a' } } },
    series: [
      {
        type,
        smooth: type === 'line',
        data: [23, 42, 31, 56],
        itemStyle: { color: '#13ddea' },
        lineStyle: { color: '#13ddea' },
      },
    ],
  };
}

export const assetGroups: AssetGroup[] = [
  {
    id: 'common',
    title: '常用图元',
    defaultCollapsed: false,
    items: [
      { id: 'rectangle', label: '矩形', icon: 'square', createPen: () => pen({ name: 'rectangle', text: 'RECT_01', width: 140, height: 90 }) },
      { id: 'circle', label: '圆形', icon: 'circle', createPen: () => pen({ name: 'circle', text: 'CIRCLE_01', width: 110, height: 110 }) },
      { id: 'diamond', label: '菱形', icon: 'diamond', createPen: () => pen({ name: 'diamond', text: 'DATA_CORE_01', width: 140, height: 90 }) },
    ],
  },
  {
    id: 'basic',
    title: '基础图形',
    defaultCollapsed: false,
    items: [
      { id: 'triangle', label: '三角形', icon: 'triangle', createPen: () => pen({ name: 'triangle', text: 'TRIANGLE', width: 130, height: 100 }) },
      { id: 'pentagon', label: '五边形', icon: 'pentagon', createPen: () => pen({ name: 'pentagon', text: 'PENTAGON', width: 130, height: 105 }) },
      { id: 'pentagram', label: '星形', icon: 'star', createPen: () => pen({ name: 'pentagram', text: 'STAR', width: 120, height: 115 }) },
      { id: 'leftArrow', label: '左箭头', icon: 'arrow-left', createPen: () => pen({ name: 'leftArrow', text: '', width: 150, height: 70 }) },
      { id: 'rightArrow', label: '右箭头', icon: 'arrow-right', createPen: () => pen({ name: 'rightArrow', text: '', width: 150, height: 70 }) },
      { id: 'twowayArrow', label: '双向箭头', icon: 'arrow-both', createPen: () => pen({ name: 'twowayArrow', text: '', width: 170, height: 70 }) },
      { id: 'hexagon', label: '六边形', icon: 'pentagon', createPen: () => pen({ name: 'hexagon', text: 'HEX', width: 130, height: 100 }) },
      { id: 'cloud', label: '云', icon: 'activity', createPen: () => pen({ name: 'cloud', text: 'CLOUD', width: 150, height: 95 }) },
      { id: 'message', label: '消息', icon: 'square', createPen: () => pen({ name: 'message', text: 'MESSAGE', width: 150, height: 90 }) },
    ],
  },
  {
    id: 'flow',
    title: '流程图',
    defaultCollapsed: true,
    items: [
      { id: 'flowData', label: '数据', icon: 'diamond', createPen: () => pen({ name: 'flowData', text: '数据', width: 140, height: 90 }) },
      { id: 'flowDocument', label: '文档', icon: 'square', createPen: () => pen({ name: 'flowDocument', text: '文档', width: 150, height: 100 }) },
      { id: 'flowQueue', label: '队列', icon: 'square', createPen: () => pen({ name: 'flowQueue', text: '队列', width: 150, height: 90 }) },
      { id: 'flowDb', label: '数据库', icon: 'warehouse', createPen: () => pen({ name: 'flowDb', text: 'DB', width: 140, height: 100 }) },
      { id: 'flowSubprocess', label: '子流程', icon: 'square', createPen: () => pen({ name: 'flowSubprocess', text: '子流程', width: 160, height: 90 }) },
      { id: 'flowParallel', label: '并行', icon: 'square', createPen: () => pen({ name: 'flowParallel', text: '并行', width: 150, height: 90 }) },
    ],
  },
  {
    id: 'uml',
    title: 'UML/活动图',
    defaultCollapsed: true,
    items: [
      { id: 'swimlaneH', label: '横向泳道', icon: 'activity', createPen: () => pen({ name: 'swimlaneH', text: '泳道', width: 260, height: 160 }) },
      { id: 'swimlaneV', label: '纵向泳道', icon: 'activity', createPen: () => pen({ name: 'swimlaneV', text: '泳道', width: 180, height: 240 }) },
      { id: 'simpleClass', label: '类', icon: 'square', createPen: () => pen({ name: 'simpleClass', text: 'User|+ name\\n+ role|- login()', width: 180, height: 140 }) },
      { id: 'interfaceClass', label: '接口', icon: 'square', createPen: () => pen({ name: 'interfaceClass', text: 'IService|+ run()', width: 180, height: 130 }) },
      { id: 'lifeline', label: '生命线', icon: 'activity', createPen: () => pen({ name: 'lifeline', text: 'Service', width: 120, height: 220 }) },
      { id: 'sequenceFocus', label: '激活条', icon: 'activity', createPen: () => pen({ name: 'sequenceFocus', text: '', width: 36, height: 170 }) },
    ],
  },
  // {
  //   id: 'form',
  //   title: '表单控件',
  //   defaultCollapsed: true,
  //   items: [
  //     { id: 'switch', label: '开关', icon: 'switch', createPen: () => pen({ name: 'switch', text: '', width: 78, height: 34, checked: true }) },
  //     { id: 'slider', label: '滑块', icon: 'slider', createPen: () => pen({ name: 'slider', text: '', width: 180, height: 34, value: 62 } as Pen) },
  //     { id: 'checkbox', label: '复选框', icon: 'checkbox', createPen: () => pen({ name: 'checkbox', text: '确认', width: 130, height: 42, checked: true }) },
  //     { id: 'radio', label: '单选框', icon: 'circle', createPen: () => pen({ name: 'radio', text: '选项', width: 130, height: 42, checked: true }) },
  //     { id: 'time', label: '时间', icon: 'square', createPen: () => pen({ name: 'time', text: '', width: 170, height: 48 }) },
  //     { id: 'table', label: '表格', icon: 'square', createPen: () => pen({ name: 'table', text: '', width: 260, height: 150 }) },
  //   ],
  // },
  {
    id: 'charts',
    title: 'ECharts图表',
    defaultCollapsed: false,
    items: [
      {
        id: 'echartsBar',
        label: 'ECharts柱图',
        icon: 'chart',
        createPen: () =>
          pen({
            name: 'echarts',
            text: '',
            width: 270,
            height: 190,
            echarts: { option: echartsOption('bar'), max: 100, replaceMode: 0, theme: '', timeFormat: '', autoGetTime: false },
          } as Pen),
      },
      {
        id: 'echartsLine',
        label: 'ECharts折线',
        icon: 'chart',
        createPen: () =>
          pen({
            name: 'echarts',
            text: '',
            width: 270,
            height: 190,
            echarts: { option: echartsOption('line'), max: 100, replaceMode: 0, theme: '', timeFormat: '', autoGetTime: false },
          } as Pen),
      },
      {
        id: 'echartsPie',
        label: 'ECharts饼图',
        icon: 'chart',
        createPen: () =>
          pen({
            name: 'echarts',
            text: '',
            width: 230,
            height: 200,
            echarts: { option: echartsOption('pie'), max: 100, replaceMode: 0, theme: '', timeFormat: '', autoGetTime: false },
          } as Pen),
      },
      { id: 'lineChart', label: '折线图', icon: 'chart', createPen: () => pen({ name: 'lineChart', text: '', width: 260, height: 180, smooth: true, ...axisOption([12, 32, 24, 46, 38]) } as Pen) },
      { id: 'histogram', label: '柱状图', icon: 'chart', createPen: () => pen({ name: 'histogram', text: '', width: 260, height: 180, ...axisOption([22, 42, 31, 56, 34]) } as Pen) },
      {
        id: 'pieChart',
        label: '饼图',
        icon: 'chart',
        createPen: () =>
          pen({
            name: 'pieChart',
            text: '',
            width: 220,
            height: 190,
            data: [[{ name: 'A', value: 28 }, { name: 'B', value: 42 }, { name: 'C', value: 30 }]],
            chartsColor: chartColors,
            chartsRadius: [['35%', '68%']],
            tickLabel: { show: true, color: '#d8e1e7', fontSize: 11 },
          } as Pen),
      },
      {
        id: 'gauge',
        label: '仪表盘',
        icon: 'chart',
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
          } as Pen),
      },
      {
        id: 'heatmap',
        label: '热力图',
        icon: 'chart',
        createPen: () =>
          pen({
            name: 'heatmap',
            text: '',
            width: 240,
            height: 170,
            min: 0,
            max: 100,
            chartsColor: ['#12343b', '#13ddea', '#ffd166'],
            data: [
              [8, 24, 46, 70, 92],
              [16, 38, 64, 80, 58],
              [28, 52, 75, 62, 34],
              [10, 44, 68, 88, 95],
            ],
          } as Pen),
      },
    ],
  },
];

export const initialSettings: CanvasSettings = {
  fileName: 'digital_city_scene',
  category: '项目A',
  background: '#101214',
  showGrid: false,
  snapToGrid: true,
  zoom: 1,
  previewMode: false,
  gridColor: '#243139',
};
