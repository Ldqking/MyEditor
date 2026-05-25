import { ChangeEvent, useState, useRef } from 'react';
import type React from 'react';
import type { Pen } from '@meta2d/core';
import { FileDown, Eye, EyeOff, Lock, LockOpen, Trash2, ArrowUp, ArrowDown, FileText, FolderOpen } from 'lucide-react';
import type { CanvasSettings, CommunicationConfig } from '../types';
import type { useMeta2dEditor } from '../editor/useMeta2dEditor';

type EditorActions = ReturnType<typeof useMeta2dEditor>['actions'];

export function PropertyPanel({
  actions,
  pens,
  selectedPen,
  settings,
}: {
  actions: EditorActions;
  pens: Pen[];
  selectedPen: Pen | null;
  settings: CanvasSettings;
}) {
  const [activeTab, setActiveTab] = useState<'design' | 'comm' | 'structure'>('design');

  return (
    <aside className="props-panel">
      <div className="tabs">
        <button className={activeTab === 'design' ? 'active' : ''} onClick={() => setActiveTab('design')}>
          设计
        </button>
        <button className={activeTab === 'comm' ? 'active' : ''} onClick={() => setActiveTab('comm')}>
          通信
        </button>
        <button className={activeTab === 'structure' ? 'active' : ''} onClick={() => setActiveTab('structure')}>
          结构
        </button>
      </div>

      {activeTab === 'design' && (
        <div className="props-scroll">
          {selectedPen ? (
            <PenInspector pen={selectedPen} onChange={actions.updateSelectedPen} onDelete={actions.deleteSelectedPen} />
          ) : (
            <CanvasInspector actions={actions} settings={settings} />
          )}
        </div>
      )}

      {activeTab === 'comm' && (
        <div className="props-scroll">
          <CommunicationInspector actions={actions} selectedPen={selectedPen} />
        </div>
      )}

      {activeTab === 'structure' && (
        <div className="props-scroll">
          <LayerInspector actions={actions} pens={pens} selectedPen={selectedPen} />
        </div>
      )}
    </aside>
  );
}

function ColorPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="custom-color-picker">
      <span>{label}</span>
      <div className="color-picker-trigger" onClick={() => ref.current?.click()}>
        <div className="color-preview" style={{ backgroundColor: value }} />
        <span className="color-hex">{value.toUpperCase()}</span>
        <input
          ref={ref}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
}

function CanvasInspector({ actions, settings }: { actions: EditorActions; settings: CanvasSettings }) {
  return (
    <>
      <Section title="文件属性">
        <Label text="文件名">
          <div className="input-with-icon">
            <input
              value={settings.fileName}
              onChange={(event) => actions.setCanvasSettings((current) => ({ ...current, fileName: event.target.value }))}
            />
            <FileText size={14} className="input-icon" />
          </div>
        </Label>
        <Label text="分类">
          <div className="input-with-icon">
            <select
              value={settings.category}
              onChange={(event) => actions.setCanvasSettings((current) => ({ ...current, category: event.target.value }))}
            >
              <option>项目A</option>
              <option>项目B</option>
              <option>智慧园区</option>
            </select>
            <FolderOpen size={14} className="input-icon" />
          </div>
        </Label>
      </Section>
      <Section title="画布设置">
        <ColorPicker
          label="背景颜色"
          value={settings.background}
          onChange={(val) => actions.setCanvasSettings((current) => ({ ...current, background: val }))}
        />
        <Switch
          checked={settings.showGrid}
          label="背景网格"
          onChange={(showGrid) => actions.setCanvasSettings((current) => ({ ...current, showGrid }))}
        />
        {settings.showGrid && (
          <ColorPicker
            label="网格颜色"
            value={settings.gridColor || '#243139'}
            onChange={(val) => actions.setCanvasSettings((current) => ({ ...current, gridColor: val }))}
          />
        )}
        <Switch
          checked={settings.snapToGrid}
          label="网格吸附"
          onChange={(snapToGrid) => actions.setCanvasSettings((current) => ({ ...current, snapToGrid }))}
        />
      </Section>
    </>
  );
}

function PenInspector({
  pen,
  onChange,
  onDelete,
}: {
  pen: Pen;
  onChange: (patch: Partial<Pen>) => void;
  onDelete: () => void;
}) {
  const numeric = (key: keyof Pen) => (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ [key]: Number(event.target.value) } as Partial<Pen>);
  };

  return (
    <>
      <Section title="图元属性">
        <Label text="名称">
          <input value={pen.text || ''} onChange={(event) => onChange({ text: event.target.value })} />
        </Label>
        <Label text="图元类型">
          <input value={pen.name || ''} readOnly />
        </Label>
        <div className="two-col">
          <Label text="X">
            <input type="number" value={Math.round(pen.x || 0)} onChange={numeric('x')} />
          </Label>
          <Label text="Y">
            <input type="number" value={Math.round(pen.y || 0)} onChange={numeric('y')} />
          </Label>
          <Label text="宽">
            <input type="number" value={Math.round(pen.width || 0)} onChange={numeric('width')} />
          </Label>
          <Label text="高">
            <input type="number" value={Math.round(pen.height || 0)} onChange={numeric('height')} />
          </Label>
        </div>
        <Label text="旋转">
          <input type="range" min="-180" max="180" value={pen.rotate || 0} onChange={numeric('rotate')} />
        </Label>
        <Label text="透明度">
          <input type="range" min="0.1" max="1" step="0.05" value={pen.globalAlpha || 1} onChange={numeric('globalAlpha')} />
        </Label>
      </Section>
      <Section title="样式">
        <Label text="填充">
          <input type="color" value={normalizeColor(pen.background, '#17252b')} onChange={(event) => onChange({ background: event.target.value })} />
        </Label>
        <Label text="描边">
          <input type="color" value={normalizeColor(pen.color, '#9fb3bd')} onChange={(event) => onChange({ color: event.target.value })} />
        </Label>
        <Label text="文字">
          <input type="color" value={normalizeColor(pen.textColor, '#9fb3bd')} onChange={(event) => onChange({ textColor: event.target.value })} />
        </Label>
      </Section>
      <button className="danger-button" onClick={onDelete}>
        删除图元
      </button>
    </>
  );
}

function CommunicationInspector({ actions, selectedPen }: { actions: EditorActions; selectedPen: Pen | null }) {
  const [config, setConfig] = useState<CommunicationConfig>({
    sourceType: 'mock',
    variable: 'demo.value',
    targetProp: 'text',
    mockValue: '在线',
  });

  return (
    <>
      <Section title="数据绑定">
        {!selectedPen && <p className="muted">请选择一个图元后配置通信绑定。</p>}
        <Label text="数据源">
          <select
            value={config.sourceType}
            onChange={(event) => setConfig((current) => ({ ...current, sourceType: event.target.value as CommunicationConfig['sourceType'] }))}
          >
            <option value="mock">Mock</option>
            <option value="http">HTTP</option>
            <option value="websocket">WebSocket</option>
            <option value="mqtt">MQTT</option>
          </select>
        </Label>
        <Label text="变量名">
          <input value={config.variable} onChange={(event) => setConfig((current) => ({ ...current, variable: event.target.value }))} />
        </Label>
        <Label text="绑定属性">
          <select
            value={config.targetProp}
            onChange={(event) => setConfig((current) => ({ ...current, targetProp: event.target.value as CommunicationConfig['targetProp'] }))}
          >
            <option value="text">文本</option>
            <option value="value">值</option>
            <option value="background">填充色</option>
            <option value="color">描边色</option>
            <option value="data">数据(JSON)</option>
          </select>
        </Label>
        <Label text="Mock 值">
          <input value={config.mockValue} onChange={(event) => setConfig((current) => ({ ...current, mockValue: event.target.value }))} />
        </Label>
      </Section>
      <button className="primary-panel-button" disabled={!selectedPen} onClick={() => actions.applyCommunication(config)}>
        应用到选中图元
      </button>
    </>
  );
}

function LayerInspector({ actions, pens, selectedPen }: { actions: EditorActions; pens: Pen[]; selectedPen: Pen | null }) {
  return (
    <Section title="图层结构">
      {pens.length === 0 ? (
        <p className="muted">暂无图元</p>
      ) : (
        <div className="layer-list">
          {pens
            .slice()
            .reverse()
            .map((pen) => {
              const visible = pen.visible !== false;
              const locked = !!pen.locked;
              return (
                <div className={`layer-item ${pen.id === selectedPen?.id ? 'active' : ''}`} key={pen.id}>
                  <button className="layer-name" onClick={() => actions.activePen(pen)}>
                    <span>{pen.text || pen.name}</span>
                    <small>{pen.name}</small>
                  </button>
                  <div className="layer-actions">
                    <button title="上移" onClick={() => actions.moveLayer(pen, 1)}>
                      <ArrowUp size={14} />
                    </button>
                    <button title="下移" onClick={() => actions.moveLayer(pen, -1)}>
                      <ArrowDown size={14} />
                    </button>
                    <button title={visible ? '隐藏' : '显示'} onClick={() => actions.setPenVisible(pen, !visible)}>
                      {visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button title={locked ? '解锁' : '锁定'} onClick={() => actions.setPenLocked(pen, !locked)}>
                      {locked ? <Lock size={14} /> : <LockOpen size={14} />}
                    </button>
                    <button title="删除" onClick={() => actions.deletePens([pen])}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="prop-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{text}</span>
      {children}
    </label>
  );
}

function Switch({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="switch-row">
      <span>{label}</span>
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      <i />
    </label>
  );
}

function normalizeColor(value: string | undefined, fallback: string) {
  return value && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}
