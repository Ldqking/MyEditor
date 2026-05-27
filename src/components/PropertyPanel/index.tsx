import { useState } from 'react';
import type React from 'react';
import type { Pen } from '@meta2d/core';
import type { CanvasSettings } from '../../types';
import type { useMeta2dEditor } from '../../editor/useMeta2dEditor';
import { CanvasInspector } from './CanvasInspector';
import { AnimationInspector } from './AnimationInspector';
import { CommunicationInspector } from './CommunicationInspector';
import { EventInspector } from './EventInspector';
import { LayerInspector } from './LayerInspector';
import { PenInspector } from './PenInspector';

type EditorActions = ReturnType<typeof useMeta2dEditor>['actions'];
type PropertyTab = 'design' | 'comm' | 'event' | 'animation' | 'structure';

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
  const [activeTab, setActiveTab] = useState<PropertyTab>('design');
  const selectedLayerIndex = selectedPen?.id ? pens.findIndex((pen) => pen.id === selectedPen.id) + 1 : 0;

  return (
    <aside className="props-panel">
      <div className="tabs">
        <button className={activeTab === 'design' ? 'active' : ''} onClick={() => setActiveTab('design')}>
          设计
        </button>
        <button className={activeTab === 'comm' ? 'active' : ''} onClick={() => setActiveTab('comm')}>
          通信
        </button>
        <button className={activeTab === 'event' ? 'active' : ''} onClick={() => setActiveTab('event')}>
          事件
        </button>
        <button className={activeTab === 'animation' ? 'active' : ''} onClick={() => setActiveTab('animation')}>
          动画
        </button>
        <button className={activeTab === 'structure' ? 'active' : ''} onClick={() => setActiveTab('structure')}>
          结构
        </button>
      </div>

      {activeTab === 'design' && (
        <div className="props-scroll">
          {selectedPen ? (
            <PenInspector
              pen={selectedPen}
              onChange={actions.updateSelectedPen}
              onDelete={actions.deleteSelectedPen}
              onMoveUp={() => actions.moveLayer(selectedPen, 1)}
              onMoveDown={() => actions.moveLayer(selectedPen, -1)}
              onMoveTop={() => actions.topLayer(selectedPen)}
              onMoveBottom={() => actions.bottomLayer(selectedPen)}
              layerIndex={selectedLayerIndex}
              layerTotal={pens.length}
            />
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

      {activeTab === 'event' && (
        <div className="props-scroll">
          <EventInspector actions={actions} selectedPen={selectedPen} />
        </div>
      )}

      {activeTab === 'animation' && (
        <div className="props-scroll">
          <AnimationInspector actions={actions} selectedPen={selectedPen} />
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
