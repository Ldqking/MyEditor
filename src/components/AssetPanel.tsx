import { ChevronDown, ChevronRight, HelpCircle, Settings } from 'lucide-react';
import { useMemo, useState } from 'react';
import { assetGroups } from '../editor/assetLibrary';
import { clonePen } from '../editor/useMeta2dEditor';
import type { useMeta2dEditor } from '../editor/useMeta2dEditor';
import { PaletteIcon } from './PaletteIcon';

type EditorActions = ReturnType<typeof useMeta2dEditor>['actions'];

export function AssetPanel({ actions }: { actions: EditorActions }) {
  const initialCollapsed = useMemo(
    () => Object.fromEntries(assetGroups.map((group) => [group.id, group.defaultCollapsed])),
    [],
  );
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(initialCollapsed);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  return (
    <>
      <aside className="asset-panel">
        <div className="panel-title">
          <span>资产库</span>
          <small>Meta2d 图元库</small>
        </div>
        <div className="asset-scroll">
          {assetGroups.map((group) => {
            const isCollapsed = collapsed[group.id];
            return (
              <section className="asset-group" key={group.id}>
                <button
                  className="asset-group-title asset-group-button"
                  onClick={() => setCollapsed((current) => ({ ...current, [group.id]: !current[group.id] }))}
                >
                  <span>
                    {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                    {group.title}
                  </span>
                  <small>{group.items.length}</small>
                </button>
                {!isCollapsed && (
                  <div className="asset-grid">
                    {group.items.map((item) => {
                      const draft = item.createPen();
                      return (
                        <button
                          className="asset-tile"
                          draggable
                          key={item.id}
                          title={item.label}
                          onClick={() => actions.addPen(item.createPen())}
                          onDragStart={(event) => {
                            event.dataTransfer.setData('Meta2d', JSON.stringify(clonePen(draft, 0, 0)));
                            event.dataTransfer.effectAllowed = 'copy';
                          }}
                        >
                          <PaletteIcon icon={item.icon} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
        <div className="side-footer">
          {/* <button>
            <Settings size={16} />
            设置
          </button> */}
          <button onClick={() => setHelpModalOpen(true)}>
            <HelpCircle size={16} />
            帮助
          </button>
        </div>
      </aside>

      {helpModalOpen && (
        <div className="help-modal-overlay" onClick={() => setHelpModalOpen(false)}>
          <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="help-modal-header">
              <h3>编辑器操作手册</h3>
              <button className="help-modal-close" onClick={() => setHelpModalOpen(false)}>×</button>
            </div>
            <div className="help-modal-body">
              <div className="help-section">
                <div className="help-section-title">
                  <i className="help-title-dot" />
                  图元与绘制
                </div>
                <div className="help-card-list">
                  <div className="help-card-item">
                    <span className="help-card-key">载入图元</span>
                    <span className="help-card-val">点击左侧资产，或将其拖拽入画布</span>
                  </div>
                  <div className="help-card-item">
                    <span className="help-card-key">钢笔/铅笔</span>
                    <span className="help-card-val">点击顶栏工具绘制，再次点击或右键可取消</span>
                  </div>
                </div>
              </div>

              <div className="help-section">
                <div className="help-section-title">
                  <i className="help-title-dot" />
                  画布操作
                </div>
                <div className="help-card-list">
                  <div className="help-card-item">
                    <span className="help-card-key">拖拽画布</span>
                    <span className="help-card-val">按住 <strong>空格键</strong>（或鼠标右键）并拖拽</span>
                  </div>
                  <div className="help-card-item">
                    <span className="help-card-key">画布缩放</span>
                    <span className="help-card-val">滑动鼠标滚轮，或点击悬浮面板的 <strong>+</strong> / <strong>-</strong></span>
                  </div>
                </div>
              </div>

              <div className="help-section">
                <div className="help-section-title">
                  <i className="help-title-dot" />
                  编辑与图层
                </div>
                <div className="help-card-list">
                  <div className="help-card-item">
                    <span className="help-card-key">属性修改</span>
                    <span className="help-card-val">选中图元，在右侧“设计”面板直接修改宽高与坐标</span>
                  </div>
                  <div className="help-card-item">
                    <span className="help-card-key">图元删除</span>
                    <span className="help-card-val">选中图元后按 <strong>Delete</strong>，或在“结构”中删除</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
