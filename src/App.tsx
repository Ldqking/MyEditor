import { AssetPanel } from './components/AssetPanel';
import { CanvasStage } from './components/CanvasStage';
import { PropertyPanel } from './components/PropertyPanel';
import { Topbar } from './components/Topbar';
import { useMeta2dEditor } from './editor/useMeta2dEditor';
import { useEffect } from 'react';

export function App() {
  const { actions, engineError, engineReady, pens, selectedPen, settings } = useMeta2dEditor();
  const previewId = new URLSearchParams(window.location.search).get('preview');
  const isPreview = !!previewId;

  useEffect(() => {
    if (isPreview && engineReady && previewId) {
      const dataStr = sessionStorage.getItem(`meta2d-preview-data-${previewId}`);
      if (dataStr) {
        try {
          const fileData = JSON.parse(dataStr);
          actions.openData(fileData);
        } catch (e) {
          console.error('Failed to parse preview data', e);
        }
      }
    }
  }, [isPreview, previewId, engineReady, actions]);

  if (isPreview) {
    return (
      <div className="preview-stage">
        <CanvasStage actions={actions} engineError={engineError} engineReady={engineReady} settings={settings} />
      </div>
    );
  }

  return (
    <div className="editor-shell">
      <Topbar actions={actions} settings={settings} />
      <main className="workspace">
        <AssetPanel actions={actions} />
        <CanvasStage actions={actions} engineError={engineError} engineReady={engineReady} settings={settings} />
        <PropertyPanel actions={actions} pens={pens} selectedPen={selectedPen} settings={settings} />
      </main>
    </div>
  );
}
