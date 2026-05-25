import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Meta2d, Options, Pen } from '@meta2d/core';
import type { CanvasSettings, CommunicationConfig, EditorFile } from '../types';
import { createEditorFile, downloadEditorFile, loadEditorFile, readEditorFile, saveEditorFile } from './fileActions';
import { initialSettings } from './assetLibrary';

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
  return {
    ...JSON.parse(JSON.stringify(pen)),
    id: undefined,
    x,
    y,
    title: pen.text || pen.name,
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

function normalizeEditorFile(file: EditorFile): EditorFile {
  return {
    version: 1,
    settings: {
      projectId: file.settings?.projectId || generateUUID(),
      ...initialSettings,
      ...file.settings
    },
    meta2d: file.meta2d,
  };
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
      events.forEach((event) => meta2d?.on(event, refresh));
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
      meta2d.active([created]);
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
      refresh();
    },
    [refresh],
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
    refresh();
  }, [refresh, setCanvasSettings]);

  const openData = useCallback((data: any) => {
    const meta2d = meta2dRef.current;
    if (!meta2d || !data) return;
    const editorFile = normalizeEditorFile(data);
    setCanvasSettings(editorFile.settings);
    meta2d.open(editorFile.meta2d);
    meta2d.lock(1); // Force lock in preview
    setTimeout(() => {
      meta2d.fitView(true, 100);
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
    meta2dRef.current?.lock(nextPreview ? 1 : 0);
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
      const value = config.targetProp === 'data' ? tryParseJson(config.mockValue) : config.mockValue;
      meta2d.setValue(
        {
          id: selectedPen.id,
          [config.targetProp]: value,
          communication: config,
        },
        { render: true, doEvent: true, history: true },
      );
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

export { clonePen };
