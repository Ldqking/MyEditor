import { useState } from 'react';
import type React from 'react';
import type { Pen } from '@meta2d/core';
import type { CanvasSettings } from '../../types';
import type { useMeta2dEditor } from '../../editor/useMeta2dEditor';
import { CanvasInspector } from './CanvasInspector';
import { PenInspector } from './PenInspector';
import { CommunicationInspector } from './CommunicationInspector';
import { LayerInspector } from './LayerInspector';

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
          <CommunicationInspector actions={actions} selectedPen={selectedPen} settings={settings} />
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
