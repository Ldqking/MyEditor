import {
  Box,
  ChevronDown,
  Expand,
  FilePlus2,
  FolderOpen,
  Grid2X2,
  Lock,
  LockOpen,
  MapPinned,
  MousePointer2,
  PenTool,
  Pencil,
  Play,
  Redo2,
  RotateCcw,
  RotateCw,
  Save,
  Search,
  Shrink,
  Undo2,
  Upload,
} from 'lucide-react';
import { ChangeEvent, useRef, useState, useEffect } from 'react';
import type React from 'react';
import type { CanvasSettings } from '../types';
import type { useMeta2dEditor } from '../editor/useMeta2dEditor';

type EditorActions = ReturnType<typeof useMeta2dEditor>['actions'];

export function Topbar({ actions, settings }: { actions: EditorActions; settings: CanvasSettings }) {
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const openInputRef = useRef<HTMLInputElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleOpen = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await actions.openFile(file);
    }
    event.target.value = '';
  };

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">
          <Box size={19} />
        </div>
        <strong>2.5D 编辑器</strong>
      </div>
      <div className="topbar-menu">
        <div className="menu-wrapper">
          <button onClick={() => setFileMenuOpen((open) => !open)}>
            文件
            <ChevronDown size={14} />
          </button>
          {fileMenuOpen && (
            <div className="dropdown-menu">
              <button
                onClick={() => {
                  actions.newFile();
                  setFileMenuOpen(false);
                }}
              >
                <FilePlus2 size={15} />
                新建
              </button>
              <button
                onClick={() => {
                  openInputRef.current?.click();
                  setFileMenuOpen(false);
                }}
              >
                <FolderOpen size={15} />
                打开
              </button>
            </div>
          )}
        </div>
        <button onClick={actions.saveLocal}>
          <Save size={16} />
          保存
        </button>
        {/* <button onClick={actions.loadLocal}>
          <MapPinned size={16} />
          读取
        </button> */}
      </div>
      <div className="tool-strip">
        <IconButton active={settings.drawingMode === 'line'} label="钢笔" icon={<PenTool size={16} />} onClick={actions.drawingLine} showLabel />
        <IconButton active={settings.drawingMode === 'pencil'} label="铅笔" icon={<Pencil size={16} />} onClick={actions.drawingPencil} showLabel />
        <IconButton active={settings.drawingMode === 'magnifier'} label="放大镜" icon={<Search size={16} />} onClick={actions.toggleMagnifier} showLabel />
        <div className="divider" style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 8px' }} />
        <IconButton label="撤销" icon={<Undo2 size={16} />} onClick={actions.undo} />
        <IconButton label="重做" icon={<Redo2 size={16} />} onClick={actions.redo} />
      </div>
      <div className="topbar-actions">
        <IconButton
          active={settings.locked}
          label={settings.locked ? "解锁画布" : "锁定画布"}
          icon={settings.locked ? <Lock size={16} /> : <LockOpen size={16} />}
          onClick={actions.toggleCanvasLock}
        />
        <IconButton
          label={isFullscreen ? "退出全屏" : "全屏"}
          icon={isFullscreen ? <Shrink size={16} /> : <Expand size={16} />}
          onClick={actions.toggleFullscreen}
        />
        <IconButton
          active={settings.showGrid}
          label="网格"
          icon={<Grid2X2 size={16} />}
          onClick={() => actions.setCanvasSettings((current) => ({ ...current, showGrid: !current.showGrid }))}
        />
        <div className="divider" style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 8px' }} />
        <button className="ghost-button" onClick={actions.openPreviewTab}>
          <Play size={15} />
          预览
        </button>
        <button className="publish-button" onClick={actions.publishJson}>
          发布
        </button>
      </div>
      <input accept="application/json" hidden onChange={handleOpen} ref={openInputRef} type="file" />
    </header>
  );
}

function IconButton({
  icon,
  label,
  active,
  onClick,
  showLabel = false,
}: {
  icon: React.ReactElement<{ size?: number }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
  showLabel?: boolean;
}) {
  return (
    <button className={`icon-button ${active ? 'active' : ''} ${showLabel ? 'has-label' : ''}`} onClick={onClick} title={label}>
      {icon}
      {showLabel && <span className="button-text">{label}</span>}
    </button>
  );
}
