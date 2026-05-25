import type { CanvasSettings } from '../types';
import type { useMeta2dEditor } from '../editor/useMeta2dEditor';

type EditorActions = ReturnType<typeof useMeta2dEditor>['actions'];

export function CanvasStage({
  actions,
  engineError,
  engineReady,
  settings,
}: {
  actions: EditorActions;
  engineError: string | null;
  engineReady: boolean;
  settings: CanvasSettings;
}) {
  return (
    <section className="canvas-stage meta2d-stage">
      <div className="zoom-control">
        <button onClick={() => actions.changeZoom(0.1)}>+</button>
        <span>{Math.round(settings.zoom * 100)}%</span>
        <button onClick={() => actions.changeZoom(-0.1)}>-</button>
      </div>
      <div className="meta2d-canvas" id="meta2d">
        {!engineReady && <div className="canvas-loading">{engineError || 'Meta2d 引擎加载中...'}</div>}
      </div>
    </section>
  );
}
