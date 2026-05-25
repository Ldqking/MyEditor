import type { Meta2d } from '@meta2d/core';
import type { CanvasSettings, EditorFile } from '../types';

const STORAGE_KEY = 'my-2-5d-editor';

export function createEditorFile(meta2d: Meta2d, settings: CanvasSettings): EditorFile {
  return {
    version: 1,
    settings,
    meta2d: meta2d.data(),
  };
}

export function downloadEditorFile(file: EditorFile) {
  const payload = JSON.stringify(file, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${file.settings.fileName || 'scene'}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function saveEditorFile(file: EditorFile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(file));
}

export function loadEditorFile(): EditorFile | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as EditorFile;
}

export function readEditorFile(file: File): Promise<EditorFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as EditorFile;
        if (!data.meta2d || !data.settings) {
          reject(new Error('JSON 文件缺少 settings 或 meta2d 数据'));
          return;
        }
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
