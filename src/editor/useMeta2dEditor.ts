import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Meta2d, Options, Pen } from '@meta2d/core';
import type { CanvasSettings, CommunicationConfig, EditorFile } from '../types';
import { createEditorFile, downloadEditorFile, loadEditorFile, readEditorFile, saveEditorFile } from './fileActions';
import { enhanceEchartsTooltipPen, enhanceGaugePen, fillMapData, inferEchartsMapScope, initialSettings, suppressPenHoverTitle, upgradeEchartsMapPen } from './assetLibrary';

declare global {
  interface Window {
    meta2d?: Meta2d;
  }
}

const defaultOptions: Options = {
  color: '#9fb3bd',
  activeColor: '#13ddea',
  activeBackground: 'rgba(19, 221, 234, 0.14)',
  hoverColor: '#13ddea',
  gridColor: '#243139',
  gridSize: 20,
  textColor: '#d8e1e7',
  rule: false,
  autoAlignGrid: true,
};

function clonePen(pen: Pen, x = 420, y = 260): Pen {
  const cloned = JSON.parse(JSON.stringify(pen)) as Pen;
  return {
    ...cloned,
    id: undefined,
    x,
    y,
    title: '',
  };
}

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function syncEchartsExternalElements(meta2d: Meta2d) {
  const locked = Boolean((meta2d.store.data as typeof meta2d.store.data & { locked?: number }).locked);
  meta2d.store.data.pens.forEach((pen) => {
    if (pen.name !== 'echarts') return;
    pen.externElement = true;
    const div = (pen.calculative as Pen['calculative'] & { singleton?: { div?: HTMLDivElement } })?.singleton?.div;
    const chart = (pen.calculative as Pen['calculative'] & { singleton?: { echart?: { resize?: () => void } } })?.singleton?.echart;
    if (div) {
      div.style.pointerEvents = locked ? 'initial' : 'none';
      div.style.userSelect = locked ? 'initial' : 'none';
    }
    chart?.resize?.();
  });
}

function installChartHoverTooltip(container: HTMLElement | null, meta2d: Meta2d) {
  if (!container) return () => { };
  const tooltip = document.createElement('div');
  tooltip.className = 'chart-hover-tooltip';
  tooltip.hidden = true;
  container.appendChild(tooltip);

  const hide = () => {
    tooltip.hidden = true;
  };

  const moveTooltip = (event: MouseEvent) => {
    const hover = meta2d.store.hover;
    const isActive = Boolean(hover?.id && meta2d.store.active?.some((pen) => pen.id === hover.id));
    if (!hover || hover.name !== 'gauge' || isActive) {
      hide();
      return;
    }

    const text = formatGaugeHoverValue(hover);
    if (!text) {
      hide();
      return;
    }

    tooltip.textContent = text;
    tooltip.hidden = false;
    const rect = container.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const left = Math.min(rect.width - tooltipRect.width - 8, Math.max(8, event.clientX - rect.left + 14));
    const top = Math.min(rect.height - tooltipRect.height - 8, Math.max(8, event.clientY - rect.top + 14));
    tooltip.style.transform = `translate(${left}px, ${top}px)`;
  };

  container.addEventListener('mousemove', moveTooltip);
  container.addEventListener('mouseleave', hide);
  return () => {
    container.removeEventListener('mousemove', moveTooltip);
    container.removeEventListener('mouseleave', hide);
    tooltip.remove();
  };
}

function formatGaugeHoverValue(pen: Pen) {
  const value = toNumber((pen as Pen & { value?: unknown }).value);
  if (value === null) return '';
  const unit = (pen as Pen & { unit?: unknown }).unit;
  return `仪表盘: ${value}${unit ? ` ${String(unit)}` : ''}`;
}

function upgradeEchartsMapPens(meta2d: Meta2d) {
  let upgraded = false;
  meta2d.store.data.pens.forEach((pen) => {
    upgraded = suppressPenHoverTitle(pen) || upgraded;
    upgraded = enhanceGaugePen(pen) || upgraded;
    upgraded = upgradeEchartsMapPen(pen) || upgraded;
    upgraded = enhanceEchartsTooltipPen(pen) || upgraded;
  });

  if (!upgraded) return;
  meta2d.store.data.pens.forEach((pen) => {
    if (pen.name !== 'echarts') return;
    const chart = (pen.calculative as Pen['calculative'] & { singleton?: { echart?: { setOption?: (option: unknown, notMerge?: boolean) => void; resize?: () => void } } })?.singleton?.echart;
    chart?.setOption?.((pen as Pen & { echarts?: { option?: unknown } }).echarts?.option, true);
    chart?.resize?.();
  });
  meta2d.render();
}

function normalizeEditorFile(file: EditorFile): EditorFile {
  const mockSources = mergeMockSources(initialSettings.mockSources, file.settings?.mockSources);
  return {
    version: 1,
    settings: {
      projectId: file.settings?.projectId || generateUUID(),
      ...initialSettings,
      ...file.settings,
      mockSources,
    },
    meta2d: file.meta2d,
  };
}

function mergeMockSources(defaultSources: CanvasSettings['mockSources'] = [], savedSources: CanvasSettings['mockSources'] = []) {
  const defaultById = new Map(defaultSources.map((source) => [source.id, source]));
  const mergedSavedSources = savedSources.map((source) => {
    const defaultSource = defaultById.get(source.id);
    if (!defaultSource) return source;
    return {
      ...defaultSource,
      ...source,
      payload: mergeMissingPayload(defaultSource.payload, source.payload),
    };
  });
  const savedIds = new Set(savedSources.map((source) => source.id));
  return [...mergedSavedSources, ...defaultSources.filter((source) => !savedIds.has(source.id))];
}

function mergeMissingPayload(defaultValue: unknown, savedValue: unknown): unknown {
  if (isRecord(defaultValue) && isRecord(savedValue)) {
    return Object.entries(defaultValue).reduce<Record<string, unknown>>(
      (merged, [key, value]) => ({
        ...merged,
        [key]: key in merged ? mergeMissingPayload(value, merged[key]) : value,
      }),
      { ...savedValue },
    );
  }
  return savedValue === undefined ? defaultValue : savedValue;
}

export function useMeta2dEditor() {
  const [settings, setSettingsState] = useState<CanvasSettings>(() => ({
    ...initialSettings,
    projectId: generateUUID(),
  }));
  const [selectedPen, setSelectedPen] = useState<Pen | null>(null);
  const [pens, setPens] = useState<Pen[]>([]);
  const [engineReady, setEngineReady] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const meta2dRef = useRef<Meta2d | null>(null);
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const refresh = useCallback(() => {
    const meta2d = meta2dRef.current;
    if (!meta2d) return;
    const active = meta2d.store.active?.[0] ? { ...meta2d.store.active[0] } : null;
    setSelectedPen(active);
    setPens([...meta2d.store.data.pens]);
  }, []);

  useEffect(() => {
    let disposed = false;
    let meta2d: Meta2d | null = null;
    let cleanupChartTooltip: (() => void) | undefined;

    async function setup() {
      const [core, diagrams, flow, activity, classDiagram, sequence, form, chart, le5leCharts, echartsModule] =
        await Promise.all([
          import('@meta2d/core'),
          import('@meta2d/core/src/diagrams'),
          import('@meta2d/flow-diagram'),
          import('@meta2d/activity-diagram'),
          import('@meta2d/class-diagram'),
          import('@meta2d/sequence-diagram'),
          import('@meta2d/form-diagram'),
          import('@meta2d/chart-diagram'),
          import('@meta2d/le5le-charts'),
          import('echarts'),
        ]);

      if (disposed) return;

      const container = document.getElementById('meta2d');
      for (let i = 0; i < 20; i += 1) {
        const rect = container?.getBoundingClientRect();
        if (rect && rect.width > 0 && rect.height > 0) break;
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }

      chart.register((echartsModule as { default?: unknown }).default ?? echartsModule);
      meta2d = new core.Meta2d('meta2d', { ...defaultOptions, grid: settingsRef.current.showGrid });
      window.meta2d = meta2d;
      meta2dRef.current = meta2d;
      cleanupChartTooltip = installChartHoverTooltip(container, meta2d);
      const penNetwork = meta2d.penNetwork.bind(meta2d);
      meta2d.penNetwork = (pen: Pen) => {
        if (!pen.apiUrl && !pen.apiEnable) return;
        meta2d!.store.data.networks = meta2d!.store.data.networks || [];
        penNetwork(pen);
      };

      meta2d.register(diagrams.commonPens() as unknown as Record<string, (pen: Pen, ctx?: CanvasRenderingContext2D) => Path2D>);
      meta2d.register(flow.flowPens());
      meta2d.register(activity.activityDiagram());
      meta2d.register(classDiagram.classPens());
      meta2d.register(sequence.sequencePens());
      meta2d.register(form.formPath2DPens());
      meta2d.registerCanvasDraw(activity.activityDiagramByCtx());
      meta2d.registerCanvasDraw(sequence.sequencePensbyCtx());
      meta2d.registerCanvasDraw(form.formPens());
      meta2d.registerCanvasDraw({ cube: diagrams.cube });
      meta2d.registerCanvasDraw(le5leCharts.chartsPens());
      meta2d.registerAnchors(diagrams.commonAnchors());
      meta2d.registerAnchors(flow.flowAnchors());
      meta2d.setBackgroundColor(settingsRef.current.background);
      meta2d.setGrid({ grid: settingsRef.current.showGrid, gridColor: settingsRef.current.gridColor || '#243139', gridSize: 20 });
      meta2d.setOptions({ autoAlignGrid: settingsRef.current.snapToGrid });

      const events = ['active', 'inactive', 'mouseup', 'change', 'valueUpdate', 'drop'];
      events.forEach((event) => {
        meta2d?.on(event, () => {
          if (event === 'active') {
            if (settingsRef.current.drawingMode === 'line' || settingsRef.current.drawingMode === 'pencil') {
              meta2d?.stopPencil();
              meta2d?.drawLine('');
              setCanvasSettings((s) => ({ ...s, drawingMode: null }));
            }
          }
          refresh();
        });
      });
      meta2d?.on('scale', (zoom?: number) => {
        if (zoom === undefined) return;
        setSettingsState((current) => {
          if (current.zoom !== zoom) {
            return { ...current, zoom };
          }
          return current;
        });
      });
      setEngineReady(true);
      refresh();
    }

    setup().catch((error) => {
      console.error(error);
      setEngineError(error instanceof Error ? error.stack || error.message : String(error));
    });

    return () => {
      disposed = true;
      cleanupChartTooltip?.();
      meta2d?.destroy();
      meta2dRef.current = null;
      window.meta2d = undefined;
    };
  }, [refresh]);

  const setCanvasSettings = useCallback(
    (next: CanvasSettings | ((current: CanvasSettings) => CanvasSettings)) => {
      setSettingsState((current) => {
        const resolved = typeof next === 'function' ? next(current) : next;
        const meta2d = meta2dRef.current;
        if (meta2d) {
          meta2d.setBackgroundColor(resolved.background);
          meta2d.setGrid({ grid: resolved.showGrid, gridColor: resolved.gridColor || '#243139', gridSize: 20 });
          meta2d.setOptions({ autoAlignGrid: resolved.snapToGrid });
          meta2d.render();
        }
        return resolved;
      });
    },
    [],
  );

  // 引擎就绪后自动读取上一次持久化在本地的数据进行热启动
  useEffect(() => {
    if (engineReady) {
      const meta2d = meta2dRef.current;
      const file = loadEditorFile();
      if (meta2d && file) {
        try {
          const editorFile = normalizeEditorFile(file);
          setCanvasSettings(editorFile.settings);
          meta2d.open(editorFile.meta2d);
          upgradeEchartsMapPens(meta2d);
          syncEchartsExternalElements(meta2d);
          refresh();
        } catch (e) {
          console.error('Failed to load auto-saved local data', e);
        }
      }
    }
  }, [engineReady, refresh, setCanvasSettings]);

  // 监听画布和配置的任何改变，自动防抖 500ms 持久化暂存到本地
  useEffect(() => {
    if (!engineReady) return;
    const meta2d = meta2dRef.current;
    if (!meta2d) return;

    const timer = setTimeout(() => {
      try {
        const fileData = createEditorFile(meta2d, settingsRef.current);
        saveEditorFile(fileData);
      } catch (e) {
        console.error('Auto saving failed', e);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [engineReady, pens, settings]);


  const addPen = useCallback(
    async (pen: Pen) => {
      const meta2d = meta2dRef.current;
      if (!meta2d) return;
      const rect = document.getElementById('meta2d')?.getBoundingClientRect();
      const width = pen.width || 140;
      const height = pen.height || 90;
      const x = rect ? Math.max(40, rect.width / 2 - width / 2) : 420;
      const y = rect ? Math.max(40, rect.height / 2 - height / 2) : 260;
      const created = await meta2d.addPen(clonePen(pen, x, y), true);
      upgradeEchartsMapPen(created);
      meta2d.active([created]);
      upgradeEchartsMapPens(meta2d);
      syncEchartsExternalElements(meta2d);
      refresh();
    },
    [refresh],
  );

  const updateSelectedPen = useCallback(
    (patch: Partial<Pen>) => {
      const meta2d = meta2dRef.current;
      if (!meta2d || !selectedPen?.id) return;
      const current = meta2d.findOne(selectedPen.id);
      if (!current) return;

      const rectKeys: Array<keyof Pen> = ['x', 'y', 'width', 'height'];
      if (rectKeys.some((key) => patch[key] !== undefined)) {
        meta2d.setPenRect(
          current,
          {
            x: Number(patch.x ?? current.x ?? 0),
            y: Number(patch.y ?? current.y ?? 0),
            width: Number(patch.width ?? current.width ?? 10),
            height: Number(patch.height ?? current.height ?? 10),
          },
          true,
        );
      }

      if (patch.lineName !== undefined) {
        meta2d.updateLineType(current, patch.lineName as string);
      }

      meta2d.setValue({ id: selectedPen.id, ...patch }, { render: true, doEvent: true, history: true });
      refresh();
    },
    [refresh, selectedPen?.id],
  );

  const deletePens = useCallback(
    (targetPens?: Pen[]) => {
      const meta2d = meta2dRef.current;
      if (!meta2d) return;
      const targets = targetPens?.length ? targetPens : meta2d.store.active;
      meta2d.delete(targets, true, true);
      refresh();
    },
    [refresh],
  );

  const deleteSelectedPen = useCallback(() => {
    if (!selectedPen?.id) return;
    const pen = meta2dRef.current?.findOne(selectedPen.id);
    if (pen) deletePens([pen]);
  }, [deletePens, selectedPen?.id]);

  const setPenVisible = useCallback(
    (pen: Pen, visible: boolean) => {
      const meta2d = meta2dRef.current;
      if (!meta2d || !pen.id) return;
      meta2d.setValue({ id: pen.id, visible }, { render: true, history: true });
      refresh();
    },
    [refresh],
  );

  const setPenLocked = useCallback(
    (pen: Pen, locked: boolean) => {
      const meta2d = meta2dRef.current;
      if (!meta2d || !pen.id) return;
      meta2d.setValue({ id: pen.id, locked: locked ? 1 : 0 }, { render: true, history: true });
      refresh();
    },
    [refresh],
  );

  const moveLayer = useCallback(
    (pen: Pen, direction: -1 | 1) => {
      const meta2d = meta2dRef.current;
      if (!meta2d || !pen.id) return;
      const list = meta2d.store.data.pens;
      const index = list.findIndex((item) => item.id === pen.id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= list.length) return;
      const [item] = list.splice(index, 1);
      list.splice(nextIndex, 0, item);
      meta2d.render();
      refresh();
    },
    [refresh],
  );

  const activePen = useCallback(
    (pen: Pen) => {
      const target = pen.id ? meta2dRef.current?.findOne(pen.id) : undefined;
      if (!target) return;
      meta2dRef.current?.active([target]);
      meta2dRef.current?.gotoView(target);
    },
    [],
  );

  const newFile = useCallback(() => {
    const meta2d = meta2dRef.current;
    if (!meta2d) return;
    if (meta2d.store.data.pens.length && !window.confirm('当前画布已有图元，确定新建并清空画布吗？')) return;
    meta2d.clear(true);
    setCanvasSettings({
      ...initialSettings,
      projectId: generateUUID(),
    });
    refresh();
  }, [refresh, setCanvasSettings]);

  const openFile = useCallback(
    async (file: File) => {
      const meta2d = meta2dRef.current;
      if (!meta2d) return;

      // 覆盖提示防御
      if (meta2d.store.data.pens.length && !window.confirm('当前画布已有图元，打开新文件将覆盖当前内容，是否继续？')) {
        return;
      }

      try {
        // 读取并转换导出的 JSON 数据结构
        const parsedData = await readEditorFile(file);
        const editorFile = normalizeEditorFile(parsedData);

        // 设置画布配置并载入图元
        setCanvasSettings(editorFile.settings);
        meta2d.open(editorFile.meta2d);
        upgradeEchartsMapPens(meta2d);
        syncEchartsExternalElements(meta2d);

        // 显式将选中的图元清空，防止旧面板在加载新文件后状态不匹配
        setSelectedPen(null);
        refresh();
      } catch (err) {
        console.error(err);
        alert(err instanceof Error ? `打开文件失败，格式不正确: ${err.message}` : '打开文件失败，格式不正确');
      }
    },
    [refresh, setCanvasSettings],
  );

  const saveLocal = useCallback(() => {
    const meta2d = meta2dRef.current;
    if (!meta2d) return;
    saveEditorFile(createEditorFile(meta2d, settingsRef.current));
  }, []);

  const loadLocal = useCallback(() => {
    const meta2d = meta2dRef.current;
    const file = loadEditorFile();
    if (!meta2d || !file) return;
    const editorFile = normalizeEditorFile(file);
    setCanvasSettings(editorFile.settings);
    meta2d.open(editorFile.meta2d);
    upgradeEchartsMapPens(meta2d);
    syncEchartsExternalElements(meta2d);
    refresh();
  }, [refresh, setCanvasSettings]);

  const openData = useCallback((data: any) => {
    const meta2d = meta2dRef.current;
    if (!meta2d || !data) return;
    const editorFile = normalizeEditorFile(data);
    setCanvasSettings(editorFile.settings);
    meta2d.open(editorFile.meta2d);
    upgradeEchartsMapPens(meta2d);
    meta2d.lock(1); // Force lock in preview
    syncEchartsExternalElements(meta2d);
    setTimeout(() => {
      meta2d.fitView(true, 100);
      syncEchartsExternalElements(meta2d);
      meta2d.render();
    }, 100);
    refresh();
  }, [refresh, setCanvasSettings]);

  const publishJson = useCallback(() => {
    const meta2d = meta2dRef.current;
    if (!meta2d) return;
    downloadEditorFile(createEditorFile(meta2d, settingsRef.current));
  }, []);

  const changeZoom = useCallback(
    (delta: number) => {
      const current = settingsRef.current.zoom;
      const next = Math.min(1.8, Math.max(0.4, Number((current + delta).toFixed(2))));
      const container = document.getElementById('meta2d');
      let center: { x: number; y: number } | undefined = undefined;
      if (container) {
        const rect = container.getBoundingClientRect();
        center = {
          x: rect.width / 2,
          y: rect.height / 2,
        };
      }
      meta2dRef.current?.scale(next, center);
      setCanvasSettings((settings) => ({ ...settings, zoom: next }));
    },
    [setCanvasSettings],
  );

  const togglePreview = useCallback(() => {
    const nextPreview = !settingsRef.current.previewMode;
    const meta2d = meta2dRef.current;
    meta2d?.lock(nextPreview ? 1 : 0);
    if (meta2d) {
      syncEchartsExternalElements(meta2d);
      meta2d.render();
    }
    setCanvasSettings((settings) => ({ ...settings, previewMode: nextPreview }));
  }, [setCanvasSettings]);

  const openPreviewTab = useCallback(() => {
    const meta2d = meta2dRef.current;
    if (!meta2d) return;
    const fileData = createEditorFile(meta2d, settingsRef.current);
    const projectId = settingsRef.current.projectId || generateUUID();
    sessionStorage.setItem(`meta2d-preview-data-${projectId}`, JSON.stringify(fileData));
    window.open(`/?preview=${projectId}`, '_blank');
  }, []);

  const toggleCanvasLock = useCallback(() => {
    const meta2d = meta2dRef.current;
    if (!meta2d) return;
    const data = meta2d.store.data as typeof meta2d.store.data & { locked?: number };
    const nextLock = data.locked ? 0 : 1;
    meta2d.lock(nextLock);
    syncEchartsExternalElements(meta2d);
    meta2d.render();
    setCanvasSettings((settings) => ({ ...settings, locked: nextLock === 1 }));
    refresh();
  }, [refresh, setCanvasSettings]);

  const toggleFullscreen = useCallback(() => {
    const root = document.querySelector<HTMLElement>('.editor-shell');
    if (!document.fullscreenElement) {
      void root?.requestFullscreen?.();
      return;
    }
    void document.exitFullscreen?.();
  }, []);

  const applyCommunication = useCallback(
    (config: CommunicationConfig) => {
      const meta2d = meta2dRef.current;
      if (!meta2d || !selectedPen?.id) return;
      const currentPen = meta2d.findOne(selectedPen.id);
      if (!currentPen) return;
      const value = config.targetProp === 'data' || config.targetProp === 'value' ? tryParseJson(config.mockValue) : config.mockValue;
      const patch: any = {
        id: selectedPen.id,
        [config.targetProp]: value,
        communication: config,
      };

      if (currentPen.name === 'echarts' && config.targetProp === 'data') {
        const echarts = buildUpdatedEchartsConfig(currentPen, value);
        if (echarts) {
          patch.echarts = echarts;
          delete patch.data;
        }
      }

      if (currentPen.name === 'gauge' && config.targetProp === 'data') {
        Object.assign(patch, buildUpdatedGaugePatch(value));
        delete patch.data;
      }

      if (config.targetProp === 'value' && config.label) {
        const hasColon = config.label.trim().endsWith(':') || config.label.trim().endsWith('：');
        patch.text = `${config.label}${hasColon ? '' : '：'}${value}`;
      }

      meta2d.setValue(patch, { render: true, doEvent: true, history: true });
      if (patch.echarts) {
        const pen = meta2d.findOne(selectedPen.id);
        const chart = (pen?.calculative as Pen['calculative'] & { singleton?: { echart?: { setOption?: (option: unknown, notMerge?: boolean) => void; resize?: () => void } } })?.singleton?.echart;
        chart?.setOption?.(patch.echarts.option, true);
        chart?.resize?.();
      }
      refresh();
    },
    [refresh, selectedPen?.id],
  );

  const stopPencil = useCallback(() => {
    meta2dRef.current?.stopPencil();
    meta2dRef.current?.drawLine(''); // Also stop drawing line
    setCanvasSettings((s) => ({ ...s, drawingMode: null }));
  }, [setCanvasSettings]);

  const drawingLine = useCallback(() => {
    if (settingsRef.current.drawingMode === 'line') {
      stopPencil();
    } else {
      meta2dRef.current?.drawLine('curve');
      setCanvasSettings((s) => ({ ...s, drawingMode: 'line' }));
    }
  }, [setCanvasSettings, stopPencil]);

  const drawingPencil = useCallback(() => {
    if (settingsRef.current.drawingMode === 'pencil') {
      stopPencil();
    } else {
      meta2dRef.current?.drawingPencil();
      setCanvasSettings((s) => ({ ...s, drawingMode: 'pencil' }));
    }
  }, [setCanvasSettings, stopPencil]);

  const toggleMagnifier = useCallback(() => {
    meta2dRef.current?.toggleMagnifier();
    setCanvasSettings((s) => ({ ...s, drawingMode: s.drawingMode === 'magnifier' ? null : 'magnifier' }));
  }, [setCanvasSettings]);

  useEffect(() => {
    if (!engineReady) return;
    const handleContextMenu = (e: MouseEvent) => {
      if (settingsRef.current.drawingMode === 'magnifier') {
        e.preventDefault();
        toggleMagnifier();
      }
    };
    const container = document.getElementById('meta2d');
    if (container) {
      container.addEventListener('contextmenu', handleContextMenu);
    }
    return () => {
      if (container) {
        container.removeEventListener('contextmenu', handleContextMenu);
      }
    };
  }, [engineReady, toggleMagnifier]);


  const actions = useMemo(
    () => ({
      addPen,
      applyCommunication,
      changeZoom,
      deletePens,
      deleteSelectedPen,
      loadLocal,
      moveLayer,
      newFile,
      openFile,
      openData,
      publishJson,
      redo: () => meta2dRef.current?.redo(),
      saveLocal,
      setCanvasSettings,
      setPenLocked,
      setPenVisible,
      activePen,
      drawingLine,
      drawingPencil,
      stopPencil,
      toggleMagnifier,
      toggleCanvasLock,
      toggleFullscreen,
      togglePreview,
      openPreviewTab,
      undo: () => meta2dRef.current?.undo(),
      updateSelectedPen,
    }),
    [
      activePen,
      addPen,
      applyCommunication,
      changeZoom,
      deletePens,
      deleteSelectedPen,
      loadLocal,
      moveLayer,
      newFile,
      openFile,
      openData,
      publishJson,
      saveLocal,
      setCanvasSettings,
      setPenLocked,
      setPenVisible,
      drawingLine,
      drawingPencil,
      stopPencil,
      toggleMagnifier,
      toggleCanvasLock,
      toggleFullscreen,
      togglePreview,
      openPreviewTab,
      updateSelectedPen,
    ],
  );

  return {
    actions,
    engineError,
    engineReady,
    meta2dRef,
    pens,
    selectedPen,
    settings,
  };
}

function tryParseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function buildUpdatedEchartsConfig(pen: Pen, input: unknown) {
  const echartsConfig = (pen as Pen & { echarts?: Record<string, unknown> }).echarts;
  const option = deepClone((echartsConfig?.option || {}) as Record<string, unknown>);
  const series = normalizeSeries(option.series);
  if (!series.length) return null;

  const type = String(series[0]?.type || '');
  const scope = inferEchartsMapScope(pen);
  const payload = pickEchartsPayload(input, type, scope);

  if (type === 'pie') {
    const data = normalizeNameValueData(payload);
    if (!data.length) return null;
    series[0].data = data;
  } else if (type === 'map') {
    let data = normalizeNameValueData(payload);
    if (!data.length) return null;
    if (scope) {
      data = fillMapData(data, scope);
    }
    series.forEach((item) => {
      if (item.type === 'map' && item.name !== '地图底色') {
        item.data = data;
      }
    });
  } else if (type === 'lines') {
    const data = normalizePointData(payload);
    if (!data.length) return null;
    const origin = data[0].value.slice(0, 2);
    series.forEach((item) => {
      if (item.type === 'lines') {
        item.data = data.slice(1).map((point) => ({ fromName: data[0].name, toName: point.name, coords: [origin, point.value.slice(0, 2)] }));
      }
      if (item.coordinateSystem === 'geo' && item.type !== 'lines') {
        item.data = data;
      }
    });
  } else if (type === 'effectScatter' || type === 'scatter' || series.some((item) => item.coordinateSystem === 'geo')) {
    const data = normalizePointData(payload);
    if (!data.length) return null;
    series.forEach((item) => {
      if (item.coordinateSystem === 'geo' && item.type !== 'lines') {
        item.data = data;
      }
    });
  } else {
    const data = normalizeAxisData(payload);
    if (!data.values.length) return null;
    setCategoryAxisData(option.xAxis, data.categories);
    series[0].data = data.values;
    if (typeof Math.max(...data.values) === 'number') {
      option.yAxis = updateYAxisMax(option.yAxis, Math.max(...data.values) + 10);
    }
  }

  option.series = Array.isArray(option.series) ? series : series[0];
  return {
    ...echartsConfig,
    option,
  };
}

function buildUpdatedGaugePatch(input: unknown) {
  if (isRecord(input)) {
    const patch: Record<string, unknown> = {};
    const value = toNumber(input.value);
    const min = toNumber(input.min);
    const max = toNumber(input.max);
    if (value !== null) patch.value = value;
    if (min !== null) patch.min = min;
    if (max !== null) patch.max = max;
    if (input.unit !== undefined) patch.unit = String(input.unit);
    return patch;
  }

  const value = toNumber(input);
  return value === null ? {} : { value };
}

function pickEchartsPayload(input: unknown, chartType: string, scope: ReturnType<typeof inferEchartsMapScope> = null) {
  if (!isRecord(input)) return input;
  const charts = isRecord(input.charts) ? input.charts : input;
  if ((chartType === 'bar' || chartType === 'line') && charts[chartType] !== undefined) return charts[chartType];
  if (chartType === 'pie' && charts.pie !== undefined) return charts.pie;
  if (scope === 'shanxi' && chartType === 'map' && charts.shanxiMapRegion !== undefined) return charts.shanxiMapRegion;
  if (scope === 'shanxi' && (chartType === 'effectScatter' || chartType === 'scatter' || chartType === 'lines') && charts.shanxiMapPoints !== undefined) {
    return charts.shanxiMapPoints;
  }
  if (chartType === 'map' && charts.mapRegion !== undefined) return charts.mapRegion;
  if ((chartType === 'effectScatter' || chartType === 'scatter') && charts.mapPoints !== undefined) return charts.mapPoints;
  if (chartType === 'lines' && charts.mapPoints !== undefined) return charts.mapPoints;
  return input;
}

function normalizeSeries(series: unknown): Array<Record<string, any>> {
  if (Array.isArray(series)) return deepClone(series);
  if (isRecord(series)) return [deepClone(series)];
  return [];
}

function normalizeAxisData(input: unknown): { categories: string[]; values: number[] } {
  if (isRecord(input)) {
    const categories = Array.isArray(input.categories) ? input.categories.map(String) : Array.isArray(input.labels) ? input.labels.map(String) : [];
    const rawValues = Array.isArray(input.values) ? input.values : Array.isArray(input.data) ? input.data : [];
    const values = rawValues.map(toNumber).filter((value): value is number => value !== null);
    if (values.length) return { categories: categories.length ? categories : values.map((_, index) => String(index + 1)), values };
  }

  if (Array.isArray(input)) {
    if (input.every((item) => typeof item === 'number' || typeof item === 'string')) {
      const values = input.map(toNumber).filter((value): value is number => value !== null);
      return { categories: values.map((_, index) => String(index + 1)), values };
    }
    const items = normalizeNameValueData(input);
    return { categories: items.map((item) => item.name), values: items.map((item) => Number(item.value || 0)) };
  }

  const value = toNumber(input);
  return value === null ? { categories: [], values: [] } : { categories: ['Value'], values: [value] };
}

function normalizeNameValueData(input: unknown): Array<{ name: string; value: number }> {
  if (Array.isArray(input)) {
    return input
      .map((item, index) => {
        if (isRecord(item)) {
          const value = toNumber(item.value);
          if (value === null) return null;
          return { name: String(item.name ?? index + 1), value };
        }
        const value = toNumber(item);
        return value === null ? null : { name: String(index + 1), value };
      })
      .filter((item): item is { name: string; value: number } => Boolean(item));
  }

  if (isRecord(input)) {
    return Object.entries(input)
      .map(([name, value]) => {
        const numericValue = toNumber(value);
        return numericValue === null ? null : { name, value: numericValue };
      })
      .filter((item): item is { name: string; value: number } => Boolean(item));
  }

  return [];
}

function normalizePointData(input: unknown): Array<{ name: string; value: number[] }> {
  if (!Array.isArray(input)) return [];
  return input
    .map((item, index) => {
      if (!isRecord(item) || !Array.isArray(item.value)) return null;
      const value = item.value.map(toNumber).filter((point): point is number => point !== null);
      return value.length >= 2 ? { name: String(item.name ?? index + 1), value } : null;
    })
    .filter((item): item is { name: string; value: number[] } => Boolean(item));
}

function setCategoryAxisData(axis: unknown, categories: string[]) {
  if (!categories.length) return;
  if (Array.isArray(axis)) {
    const categoryAxis = axis.find((item) => isRecord(item) && item.type === 'category') || axis[0];
    if (isRecord(categoryAxis)) categoryAxis.data = categories;
    return;
  }
  if (isRecord(axis)) axis.data = categories;
}

function updateYAxisMax(axis: unknown, max: number) {
  if (Array.isArray(axis)) {
    axis.forEach((item) => {
      if (isRecord(item)) item.max = max;
    });
    return axis;
  }
  if (isRecord(axis)) {
    return { ...axis, max };
  }
  return axis;
}

function toNumber(value: unknown) {
  const numberValue = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(numberValue) ? numberValue : null;
}

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export { clonePen };
