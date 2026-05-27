import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import type { Pen } from '@meta2d/core';
import type { CanvasSettings, CommunicationConfig, MockDataSource } from '../../types';
import type { useMeta2dEditor } from '../../editor/useMeta2dEditor';
import { inferEchartsMapScope } from '../../editor/assetLibrary';
import { Section, Label } from './SharedComponents';

type EditorActions = ReturnType<typeof useMeta2dEditor>['actions'];
type TreeNode = { path: string; value: unknown; depth: number; label: string; selectable: boolean };

const emptyPayload = {
  demo: {
    value: '在线',
    count: 12,
  },
};

export function CommunicationInspector({
  actions,
  selectedPen,
  settings,
}: {
  actions: EditorActions;
  selectedPen: Pen | null;
  settings: CanvasSettings;
}) {
  const sources = settings.mockSources?.length ? settings.mockSources : [];

  if (!selectedPen) {
    return <MockSourceManager actions={actions} sources={sources} />;
  }

  return <PenBindingPanel actions={actions} selectedPen={selectedPen} sources={sources} />;
}

function MockSourceManager({ actions, sources }: { actions: EditorActions; sources: MockDataSource[] }) {
  const [selectedId, setSelectedId] = useState(sources[0]?.id || '');
  const selectedSource = sources.find((source) => source.id === selectedId) || sources[0];
  const [name, setName] = useState(selectedSource?.name || '');
  const [description, setDescription] = useState(selectedSource?.description || '');
  const [jsonText, setJsonText] = useState(formatJson(selectedSource?.payload ?? emptyPayload));
  const [error, setError] = useState('');

  useEffect(() => {
    const source = sources.find((item) => item.id === selectedId) || sources[0];
    if (!source) return;
    setSelectedId(source.id);
    setName(source.name);
    setDescription(source.description || '');
    setJsonText(formatJson(source.payload));
    setError('');
  }, [selectedId, sources]);

  const saveSource = () => {
    const trimmedName = name.trim() || '未命名数据源';
    let payload: unknown;
    try {
      payload = JSON.parse(jsonText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JSON 格式不正确');
      return;
    }

    const id = selectedSource?.id || createSourceId();
    const nextSource: MockDataSource = {
      id,
      name: trimmedName,
      description: description.trim(),
      payload,
    };
    const exists = sources.some((source) => source.id === id);
    const nextSources = exists ? sources.map((source) => (source.id === id ? nextSource : source)) : [...sources, nextSource];
    actions.setCanvasSettings((current) => ({ ...current, mockSources: nextSources }));
    setSelectedId(id);
    setError('');
  };

  const addSource = () => {
    const id = createSourceId();
    const nextSource: MockDataSource = {
      id,
      name: '新建数据源',
      description: '本地 mock 数据',
      payload: emptyPayload,
    };
    actions.setCanvasSettings((current) => ({ ...current, mockSources: [...(current.mockSources || []), nextSource] }));
    setSelectedId(id);
  };

  const removeSource = () => {
    if (!selectedSource || sources.length <= 1) return;
    const nextSources = sources.filter((source) => source.id !== selectedSource.id);
    actions.setCanvasSettings((current) => ({ ...current, mockSources: nextSources }));
    setSelectedId(nextSources[0]?.id || '');
  };

  return (
    <>
      <Section title="数据源">
        {/* <p className="muted">画布未选中图元时，在这里维护本地 mock 数据；选中图元后可从这些数据源中选择字段绑定。</p> */}
        <Label text="数据请求方式">
          <select defaultValue="mock">
            <option value="http" disabled>http</option>
            <option value="websocket" disabled>websocket</option>
            <option value="mock">mock数据</option>
          </select>
        </Label>
        <Label text="数据">
          <select value={selectedSource?.id || ''} onChange={(event) => setSelectedId(event.target.value)}>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </Label>
        <Label text="名称">
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </Label>
        <Label text="说明">
          <input value={description} onChange={(event) => setDescription(event.target.value)} />
        </Label>
        <Label text="JSON">
          <textarea className="json-editor" spellCheck={false} value={jsonText} onChange={(event) => setJsonText(event.target.value)} />
        </Label>
        {error && <p className="panel-error">{error}</p>}
      </Section>
      <div className="button-row">
        <button onClick={addSource}>新增</button>
        <button disabled={sources.length <= 1} onClick={removeSource}>删除</button>
      </div>
      <button className="primary-panel-button panel-button-gap" onClick={saveSource}>
        保存数据源
      </button>
    </>
  );
}

function PenBindingPanel({
  actions,
  selectedPen,
  sources,
}: {
  actions: EditorActions;
  selectedPen: Pen;
  sources: MockDataSource[];
}) {
  const savedConfig = (selectedPen as Pen & { communication?: CommunicationConfig }).communication;
  const isEchartsPen = selectedPen.name === 'echarts';
  const isGaugePen = selectedPen.name === 'gauge';
  const isTablePen = selectedPen.name === 'table' || selectedPen.name === 'table2';
  const supportsChartData = isEchartsPen || isGaugePen;
  const supportsStructuredData = supportsChartData || isTablePen;
  const availableSources = useMemo(() => {
    if (isTablePen) return sources.filter((source) => !isChartMockSource(source));
    if (supportsChartData) return sources.filter((source) => !isTableMockSource(source));
    return sources.filter((source) => !isChartMockSource(source) && !isTableMockSource(source));
  }, [sources, supportsChartData, isTablePen]);
  const initialSourceId =
    savedConfig?.sourceId && availableSources.some((source) => source.id === savedConfig.sourceId)
      ? savedConfig.sourceId
      : getDefaultSourceId(availableSources, supportsChartData, isTablePen);
  const [sourceId, setSourceId] = useState(initialSourceId);
  const [targetProp, setTargetProp] = useState<CommunicationConfig['targetProp']>(getInitialTargetProp(savedConfig, supportsStructuredData));
  const [selectedPath, setSelectedPath] = useState(savedConfig?.valuePath || savedConfig?.variable || '');
  const [expandedPath, setExpandedPath] = useState('');
  const [label, setLabel] = useState(savedConfig?.label || '');

  useEffect(() => {
    const nextConfig = (selectedPen as Pen & { communication?: CommunicationConfig }).communication;
    const nextSourceId =
      nextConfig?.sourceId && availableSources.some((source) => source.id === nextConfig.sourceId)
        ? nextConfig.sourceId
        : getDefaultSourceId(availableSources, supportsChartData, isTablePen);
    setSourceId(nextSourceId);
    setTargetProp(getInitialTargetProp(nextConfig, supportsStructuredData));
    setSelectedPath(nextConfig?.valuePath || nextConfig?.variable || '');
    setExpandedPath('');
    setLabel(nextConfig?.label || '');
  }, [selectedPen.id, availableSources, supportsChartData, isTablePen, supportsStructuredData]);

  const source = availableSources.find((item) => item.id === sourceId) || availableSources[0];
  const treeNodes = useMemo(() => {
    if (targetProp === 'data' && isEchartsPen) return getEchartsDataNodes(source?.payload, selectedPen);
    if (targetProp === 'data' && isGaugePen) return getGaugeDataNodes(source?.payload);
    if (targetProp === 'data' && isTablePen) return getTableDataNodes(source?.payload);
    return flattenTreeNodes(source?.payload, '', 0, false);
  }, [source, selectedPen, targetProp, isEchartsPen, isGaugePen, isTablePen]);
  const selectedNode = treeNodes.find((node) => node.path === selectedPath);
  const selectedValue = selectedNode ? selectedNode.value : source ? getByPath(source.payload, selectedPath) : undefined;

  const apply = () => {
    if (!source || !selectedPath) return;
    const value = treeNodes.find((node) => node.path === selectedPath)?.value ?? getByPath(source.payload, selectedPath);
    const config: CommunicationConfig = {
      sourceType: 'mock',
      sourceId: source.id,
      variable: selectedPath,
      valuePath: selectedPath,
      targetProp,
      mockValue: serializeValue(value),
      ...(targetProp === 'value' ? { label } : {}),
    };
    actions.applyCommunication(config);
  };

  return (
    <>
      <Section title="数据绑定">
        <Label text="图元">
          <input readOnly value={selectedPen.text || selectedPen.name || ''} />
        </Label>
        <Label text="数据源">
          <select value={source?.id || ''} onChange={(event) => {
            setSourceId(event.target.value);
            setSelectedPath('');
            setExpandedPath('');
          }}>
            {availableSources.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Label>
        <Label text="绑定属性">
          <select value={targetProp} onChange={(event) => setTargetProp(event.target.value as CommunicationConfig['targetProp'])}>
            <option value="text">文本</option>
            <option value="value">值</option>
            <option value="background">填充色</option>
            <option value="color">描边色</option>
            {supportsStructuredData && <option value="data">{isTablePen ? '表格数据' : '图表数据'}</option>}
          </select>
        </Label>
        {targetProp === 'value' && (
          <Label text="label">
            <input value={label} onChange={(event) => setLabel(event.target.value)} />
          </Label>
        )}
      </Section>
      <Section title="数据树">
        {!source && <p className="muted">请先在画布通信面板中配置 mock 数据源。</p>}
        {source && (
          <>
            <div className="data-tree">
              {treeNodes.map((leaf) => {
                const expanded = expandedPath === leaf.path;
                const detail = formatTreeDetail(leaf.value);
                return (
                  <div className={`tree-item ${leaf.path === selectedPath ? 'active' : ''} ${leaf.selectable ? '' : 'branch'}`} key={leaf.path}>
                    <button
                      className="tree-leaf"
                      disabled={!leaf.selectable}
                      onClick={() => setSelectedPath(leaf.path)}
                      style={{ paddingLeft: 10 + leaf.depth * 14 }}
                      type="button"
                    >
                      <span>{leaf.label}</span>
                      <small>{serializeValue(leaf.value)}</small>
                    </button>
                    <button
                      aria-label={expanded ? '收起完整数据' : '展开完整数据'}
                      className="tree-expand"
                      onClick={() => setExpandedPath(expanded ? '' : leaf.path)}
                      type="button"
                    >
                      {expanded ? '收起' : '展开'}
                    </button>
                    {expanded && <pre className="tree-detail">{detail}</pre>}
                  </div>
                );
              })}
            </div>
            {selectedPath && (
              <div className="binding-preview">
                <span>{selectedPath}</span>
                <strong>{serializeValue(selectedValue)}</strong>
              </div>
            )}
          </>
        )}
      </Section>
      <button className="primary-panel-button" disabled={!source || !selectedPath} onClick={apply}>
        绑定到选中图元
      </button>
    </>
  );
}

function flattenTreeNodes(value: unknown, path = '', depth = 0, includeBranches = false): TreeNode[] {
  const label = path.split('.').slice(-1)[0] || 'root';
  const isBranch = Boolean(value && typeof value === 'object');
  const self: TreeNode[] = path
    ? [
      {
        path,
        value,
        depth,
        label,
        selectable: includeBranches || !isBranch,
      },
    ]
    : [];

  if (Array.isArray(value)) {
    return [
      ...self,
      ...value.flatMap((item, index) => flattenTreeNodes(item, path ? `${path}.${index}` : String(index), depth + 1, includeBranches)),
    ];
  }

  if (value && typeof value === 'object') {
    return [
      ...self,
      ...Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
        flattenTreeNodes(child, path ? `${path}.${key}` : key, depth + 1, includeBranches),
      ),
    ];
  }

  return [
    {
      path,
      value,
      depth,
      label,
      selectable: true,
    },
  ];
}

function isChartMockSource(source: MockDataSource) {
  return source.id === 'echarts-demo';
}

function isTableMockSource(source: MockDataSource) {
  return source.id === 'table-demo';
}

function getDefaultSourceId(sources: MockDataSource[], preferChartData: boolean, preferTableData: boolean) {
  if (preferTableData) {
    return sources.find(isTableMockSource)?.id || sources[0]?.id || '';
  }
  if (preferChartData) {
    return sources.find(isChartMockSource)?.id || sources[0]?.id || '';
  }
  return sources[0]?.id || '';
}

function getInitialTargetProp(config: CommunicationConfig | undefined, supportsStructuredData: boolean): CommunicationConfig['targetProp'] {
  if (supportsStructuredData) return config?.targetProp || 'data';
  return config?.targetProp === 'data' ? 'text' : config?.targetProp || 'text';
}

function getEchartsDataNodes(value: unknown, pen: Pen): TreeNode[] {
  const chartType = getEchartsChartType(pen);
  const candidates = getChartDataCandidates(chartType, inferEchartsMapScope(pen));
  return candidates
    .map((candidate) => ({
      path: candidate.path,
      label: candidate.label,
      value: getByPath(value, candidate.path),
      depth: 0,
      selectable: true,
    }))
    .filter((node) => node.value !== undefined);
}

function getGaugeDataNodes(value: unknown): TreeNode[] {
  const nodes = ['charts.gauge', 'charts.gauge.value', 'device.temperature', 'line.yieldRate']
    .map((path) => ({
      path,
      label: path,
      value: getByPath(value, path),
      depth: 0,
      selectable: true,
    }))
    .filter((node) => node.value !== undefined);
  if (nodes.length) return nodes;
  const fallback = { value: 76, min: 0, max: 100, unit: '%' };
  return [
    { path: 'charts.gauge', label: '仪表盘数据', value: fallback, depth: 0, selectable: true },
    { path: 'charts.gauge.value', label: '仪表盘数值', value: fallback.value, depth: 0, selectable: true },
  ];
}

function getTableDataNodes(value: unknown): TreeNode[] {
  const nodes = [
    { path: 'table', label: '表格数据' },
    { path: 'table.data', label: '表格行数据' },
    { path: 'data', label: '表格行数据' },
    { path: 'rows', label: '表格行数据' },
  ]
    .map((item) => ({
      path: item.path,
      label: item.label,
      value: getByPath(value, item.path),
      depth: 0,
      selectable: true,
    }))
    .filter((node) => node.value !== undefined);

  if (nodes.length) return dedupeTreeNodes(nodes);
  if (Array.isArray(value)) {
    return [{ path: 'data', label: '表格行数据', value, depth: 0, selectable: true }];
  }
  return [];
}

function dedupeTreeNodes(nodes: TreeNode[]) {
  const seen = new Set<string>();
  return nodes.filter((node) => {
    const key = `${node.path}:${serializeValue(node.value)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getEchartsChartType(pen: Pen) {
  const series = ((pen as Pen & { echarts?: { option?: { series?: Array<{ type?: string; coordinateSystem?: string }> } } }).echarts?.option?.series || []) as Array<{
    type?: string;
    coordinateSystem?: string;
  }>;
  if (series.some((item) => item.type === 'lines')) return 'mapPoints';
  if (series.some((item) => item.type === 'effectScatter' || item.coordinateSystem === 'geo')) return 'mapPoints';
  if (series.some((item) => item.type === 'map')) return 'mapRegion';
  if (series.some((item) => item.type === 'pie')) return 'pie';
  if (series.some((item) => item.type === 'line')) return 'line';
  if (series.some((item) => item.type === 'bar')) return 'bar';
  return 'all';
}

function getChartDataCandidates(chartType: string, scope: ReturnType<typeof inferEchartsMapScope> = null) {
  const candidates = [
    { type: 'bar', path: 'charts.bar', label: '柱图数据' },
    { type: 'line', path: 'charts.line', label: '折线数据' },
    { type: 'pie', path: 'charts.pie', label: '饼图数据' },
    { type: 'mapRegion', path: 'charts.mapRegion', label: '地图区域数据' },
    { type: 'mapPoints', path: 'charts.mapPoints', label: '地图点位/线路数据' },
  ];
  const scopedCandidates =
    scope === 'shanxi' && chartType === 'mapRegion'
      ? [{ type: 'shanxiMapRegion', path: 'charts.shanxiMapRegion', label: '山西地图区域数据' }]
      : scope === 'shanxi' && chartType === 'mapPoints'
        ? [{ type: 'shanxiMapPoints', path: 'charts.shanxiMapPoints', label: '山西地图点位/线路数据' }]
        : candidates;
  if (scope === 'shanxi' && (chartType === 'mapRegion' || chartType === 'mapPoints')) return scopedCandidates;
  return chartType === 'all' ? scopedCandidates : scopedCandidates.filter((item) => item.type === chartType);
}

function getByPath(value: unknown, path: string) {
  if (!path) return value;
  return path.split('.').reduce<unknown>((current, key) => {
    if (Array.isArray(current)) return current[Number(key)];
    if (current && typeof current === 'object') return (current as Record<string, unknown>)[key];
    return undefined;
  }, value);
}

function serializeValue(value: unknown) {
  if (value === undefined) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function formatTreeDetail(value: unknown) {
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function createSourceId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `mock-${Date.now()}`;
}
