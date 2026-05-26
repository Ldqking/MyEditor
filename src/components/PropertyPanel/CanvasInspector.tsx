import type React from 'react';
import { FileText, FolderOpen } from 'lucide-react';
import type { CanvasSettings } from '../../types';
import type { useMeta2dEditor } from '../../editor/useMeta2dEditor';
import { Section, Label, Switch, ColorPicker } from './SharedComponents';

type EditorActions = ReturnType<typeof useMeta2dEditor>['actions'];

export function CanvasInspector({ actions, settings }: { actions: EditorActions; settings: CanvasSettings }) {
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
