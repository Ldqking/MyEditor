import type React from 'react';
import type { Pen } from '@meta2d/core';
import { Eye, EyeOff, Lock, LockOpen, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import type { useMeta2dEditor } from '../../editor/useMeta2dEditor';
import { Section } from './SharedComponents';

type EditorActions = ReturnType<typeof useMeta2dEditor>['actions'];

export function LayerInspector({ actions, pens, selectedPen }: { actions: EditorActions; pens: Pen[]; selectedPen: Pen | null }) {
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
