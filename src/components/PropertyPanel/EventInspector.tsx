import { useEffect, useMemo, useState } from 'react';
import type { Pen } from '@meta2d/core';
import type { PenEventActionType, PenEventConfig, PenEventTrigger } from '../../types';
import type { useMeta2dEditor } from '../../editor/useMeta2dEditor';
import { Label, Section } from './SharedComponents';

type EditorActions = ReturnType<typeof useMeta2dEditor>['actions'];

const triggerOptions: Array<{ value: PenEventTrigger; label: string }> = [
  { value: 'enter', label: '悬浮 hover' },
  { value: 'click', label: '单击' },
  { value: 'dblclick', label: '双击' },
  { value: 'contextmenu', label: '右键点击' },
  { value: 'active', label: '选中' },
  { value: 'valueUpdate', label: '值变化' },
];

const actionOptions: Array<{ value: PenEventActionType; label: string }> = [
  { value: 'link', label: '打开链接' },
  { value: 'setProps', label: '更改属性' },
  { value: 'startAnimate', label: '执行动画' },
  { value: 'pauseAnimate', label: '暂停动画' },
  { value: 'stopAnimate', label: '停止动画' },
  { value: 'dialog', label: '打开弹窗' },
  { value: 'js', label: '执行 JavaScript' },
];

export function EventInspector({ actions, selectedPen }: { actions: EditorActions; selectedPen: Pen | null }) {
  const [configs, setConfigs] = useState<PenEventConfig[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = ((selectedPen as Pen & { eventConfigs?: PenEventConfig[] } | null)?.eventConfigs || []).map(normalizeConfig);
    setConfigs(saved);
    setAppliedIds(new Set(saved.map((item) => item.id)));
    setError('');
  }, [selectedPen?.id]);

  const penLabel = useMemo(() => selectedPen?.text || selectedPen?.name || '', [selectedPen]);

  if (!selectedPen) {
    return (
      <Section title="事件绑定">
        <p className="muted">请选择一个图元配置事件。</p>
      </Section>
    );
  }

  const updateConfig = (id: string, patch: Partial<PenEventConfig>) => {
    setConfigs((items) => items.map((item) => (item.id === id ? normalizeConfig({ ...item, ...patch }) : item)));
    setAppliedIds((items) => {
      const next = new Set(items);
      next.delete(id);
      return next;
    });
  };

  const addEvent = () => {
    setConfigs((items) => [...items, createDefaultConfig()]);
    setError('');
  };

  const removeEvent = (id: string) => {
    const nextConfigs = configs.filter((item) => item.id !== id);
    setConfigs(nextConfigs);
    actions.applyPenEvents(nextConfigs);
    setAppliedIds(new Set(nextConfigs.map((item) => item.id)));
    setError('');
  };

  const apply = () => {
    for (const config of configs) {
      if (config.actionType === 'setProps') {
        try {
          const parsed = JSON.parse(config.propsJson || '{}');
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            setError('更改属性需要填写对象格式 JSON。');
            return;
          }
        } catch (err) {
          setError(err instanceof Error ? `属性 JSON 格式错误：${err.message}` : '属性 JSON 格式错误。');
          return;
        }
      }
    }
    actions.applyPenEvents(configs);
    setAppliedIds(new Set(configs.map((item) => item.id)));
    setError('');
  };

  return (
    <>
      <Section title="事件绑定">
        <Label text="图元">
          <input readOnly value={penLabel} />
        </Label>

        <div className="event-list">
          {configs.map((config, index) => (
            <div className="event-card" key={config.id}>
              <div className="event-card-header">
                <strong>
                  事件 {index + 1}
                  {appliedIds.has(config.id) && <span className="event-applied-check">✓</span>}
                </strong>
                <button className="ghost-panel-button danger" onClick={() => removeEvent(config.id)} type="button">
                  删除
                </button>
              </div>

              <Label text="事件">
                <select value={config.trigger} onChange={(event) => updateConfig(config.id, { trigger: event.target.value as PenEventTrigger })}>
                  {triggerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Label>

              <Label text="行为">
                <select value={config.actionType} onChange={(event) => updateConfig(config.id, { actionType: event.target.value as PenEventActionType })}>
                  {actionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Label>

              <ActionFields config={config} onChange={(patch) => updateConfig(config.id, patch)} />
            </div>
          ))}
        </div>

        {error && <p className="panel-error">{error}</p>}
      </Section>

      <button className="primary-panel-button" onClick={addEvent} type="button">
        新增事件
      </button>
      <button className="primary-panel-button panel-button-gap" onClick={apply} type="button">
        应用到选中图元
      </button>
    </>
  );
}

function ActionFields({ config, onChange }: { config: PenEventConfig; onChange: (patch: Partial<PenEventConfig>) => void }) {
  if (config.actionType === 'link') {
    return (
      <>
        <Label text="URL">
          <input value={config.url || ''} onChange={(event) => onChange({ url: event.target.value })} placeholder="https://example.com" />
        </Label>
        <Label text="打开方式">
          <select value={config.openMode || '_blank'} onChange={(event) => onChange({ openMode: event.target.value as PenEventConfig['openMode'] })}>
            <option value="_self">覆盖当前窗口</option>
            <option value="_blank">新开窗口</option>
          </select>
        </Label>
      </>
    );
  }

  if (config.actionType === 'setProps') {
    return (
      <>
        <Label text="目标图元 ID">
          <input value={config.targetId || ''} onChange={(event) => onChange({ targetId: event.target.value })} placeholder="默认当前图元" />
        </Label>
        <Label text="属性 JSON">
          <textarea className="json-editor event-json-editor" spellCheck={false} value={config.propsJson || '{}'} onChange={(event) => onChange({ propsJson: event.target.value })} />
        </Label>
      </>
    );
  }

  if (config.actionType === 'startAnimate') {
    return (
      <>
        <Label text="目标图元 ID">
          <input value={config.targetId || ''} onChange={(event) => onChange({ targetId: event.target.value })} placeholder="默认当前图元" />
        </Label>
        <Label text="动画名称">
          <input value={config.animateName || ''} onChange={(event) => onChange({ animateName: event.target.value })} />
        </Label>
      </>
    );
  }

  if (config.actionType === 'pauseAnimate' || config.actionType === 'stopAnimate') {
    return (
      <Label text="目标图元 ID">
        <input value={config.targetId || ''} onChange={(event) => onChange({ targetId: event.target.value })} placeholder="默认当前图元" />
      </Label>
    );
  }

  if (config.actionType === 'dialog') {
    return (
      <>
        <Label text="弹窗标题">
          <input value={config.dialogTitle || ''} onChange={(event) => onChange({ dialogTitle: event.target.value })} />
        </Label>
        <Label text="弹窗 URL">
          <input value={config.dialogUrl || ''} onChange={(event) => onChange({ dialogUrl: event.target.value })} placeholder="https://example.com" />
        </Label>
        <div className="two-col">
          <Label text="宽">
            <input min={120} type="number" value={config.dialogWidth || 720} onChange={(event) => onChange({ dialogWidth: Number(event.target.value) })} />
          </Label>
          <Label text="高">
            <input min={120} type="number" value={config.dialogHeight || 480} onChange={(event) => onChange({ dialogHeight: Number(event.target.value) })} />
          </Label>
        </div>
      </>
    );
  }

  return (
    <Label text="JavaScript">
      <textarea
        className="json-editor event-json-editor"
        spellCheck={false}
        value={config.jsCode || ''}
        onChange={(event) => onChange({ jsCode: event.target.value })}
        placeholder="console.log(pen, params, context);"
      />
    </Label>
  );
}

function createDefaultConfig(): PenEventConfig {
  return {
    id: createEventId(),
    trigger: 'click',
    actionType: 'link',
    openMode: '_blank',
    propsJson: '{\n  "text": "已触发"\n}',
    dialogTitle: '弹窗',
    dialogWidth: 720,
    dialogHeight: 480,
    jsCode: 'console.log(pen, params, context);',
  };
}

function normalizeConfig(config: Partial<PenEventConfig>): PenEventConfig {
  return {
    ...createDefaultConfig(),
    ...config,
    id: config.id || createEventId(),
    trigger: config.trigger || 'click',
    actionType: config.actionType || 'link',
  };
}

function createEventId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `event-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
