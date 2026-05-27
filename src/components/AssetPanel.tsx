import { ChevronDown, ChevronRight, HelpCircle, Settings, ArrowUp, ArrowDown, Lock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { assetGroups } from '../editor/assetLibrary';
import { clonePen } from '../editor/useMeta2dEditor';
import type { useMeta2dEditor } from '../editor/useMeta2dEditor';
import { PaletteIcon } from './PaletteIcon';

type EditorActions = ReturnType<typeof useMeta2dEditor>['actions'];

export function AssetPanel({ actions }: { actions: EditorActions }) {
  // 构建所有非常用图元的大 Map，用于根据 id 还原完整的 AssetItem (带 createPen 函数属性)
  const allAssetsMap = useMemo(() => {
    const map = new Map<string, any>();
    assetGroups.forEach((group) => {
      if (group.id === 'common') return;
      group.items.forEach((item) => {
        map.set(item.id, item);
      });
    });
    return map;
  }, []);

  // 使用 ID 数组进行本地存储与状态初始化
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('meta2d_recent_assets');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // 动态生成最近使用的图元列表
  const recentItems = useMemo(() => {
    return recentIds
      .map((id) => allAssetsMap.get(id))
      .filter((item): item is any => !!item);
  }, [recentIds, allAssetsMap]);

  // 当用户使用图元时，记录到常用图元并排在最前面，最多 6 条
  const handleUseItem = (item: { id: string }) => {
    setRecentIds((prev) => {
      const filtered = prev.filter((id) => id !== item.id);
      const next = [item.id, ...filtered].slice(0, 6);
      try {
        localStorage.setItem('meta2d_recent_assets', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save recent assets:', e);
      }
      return next;
    });
  };

  // 分组自定义显示隐藏和排序配置接口
  interface GroupConfig {
    visible: Record<string, boolean>;
    order: string[];
  }

  const [groupConfig, setGroupConfig] = useState<GroupConfig>(() => {
    try {
      const saved = localStorage.getItem('meta2d_asset_groups_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.visible === 'object' && Array.isArray(parsed.order)) {
          return parsed;
        }
      }
    } catch (e) { }
    return {
      visible: Object.fromEntries(assetGroups.map((g) => [g.id, true])),
      order: assetGroups.map((g) => g.id),
    };
  });

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // 切换分组可视性
  const toggleGroupVisibility = (id: string) => {
    setGroupConfig((prev) => {
      const next = {
        ...prev,
        visible: {
          ...prev.visible,
          [id]: !prev.visible[id],
        },
      };
      localStorage.setItem('meta2d_asset_groups_config', JSON.stringify(next));
      return next;
    });
  };

  // 移除非 common 分组顺序
  const moveGroup = (id: string, direction: 'up' | 'down') => {
    setGroupConfig((prev) => {
      const orderList = prev.order.filter((x) => x !== 'common');
      const index = orderList.indexOf(id);
      if (index === -1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= orderList.length) return prev;

      const newOrderList = [...orderList];
      const temp = newOrderList[index];
      newOrderList[index] = newOrderList[targetIndex];
      newOrderList[targetIndex] = temp;

      const next = {
        ...prev,
        order: ['common', ...newOrderList],
      };
      localStorage.setItem('meta2d_asset_groups_config', JSON.stringify(next));
      return next;
    });
  };

  // 分组洗牌与过滤算法（常用图元强锁最前）
  const sortedVisibleGroups = useMemo(() => {
    const nonCommonGroups = assetGroups.filter((g) => g.id !== 'common');
    const orderedNonCommon = [...nonCommonGroups].sort((a, b) => {
      const indexA = groupConfig.order.indexOf(a.id);
      const indexB = groupConfig.order.indexOf(b.id);
      const finalA = indexA === -1 ? 999 : indexA;
      const finalB = indexB === -1 ? 999 : indexB;
      return finalA - finalB;
    });

    const visibleNonCommon = orderedNonCommon.filter((g) => groupConfig.visible[g.id] !== false);

    const commonGroup = assetGroups.find((g) => g.id === 'common');
    if (commonGroup && groupConfig.visible['common'] !== false) {
      return [commonGroup, ...visibleNonCommon];
    }
    return visibleNonCommon;
  }, [groupConfig]);

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
          {sortedVisibleGroups.map((group) => {
            const isCollapsed = collapsed[group.id];
            const itemsToShow = group.id === 'common' ? recentItems : group.items;

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
                  <small>{itemsToShow.length}</small>
                </button>
                {!isCollapsed && (
                  <div className="asset-grid">
                    {itemsToShow.map((item) => {
                      const draft = item.createPen();
                      return (
                        <button
                          className="asset-tile"
                          draggable
                          key={item.id}
                          title={item.label}
                          style={{
                            gridColumn: item.span ? `span ${item.span}` : undefined,
                            padding: item.image ? 0 : undefined,
                            overflow: 'hidden'
                          }}
                          onClick={() => {
                            handleUseItem(item);
                            actions.addPen(item.createPen());
                          }}
                          onDragStart={(event) => {
                            event.dataTransfer.setData('Meta2d', JSON.stringify(clonePen(draft, 0, 0)));
                            event.dataTransfer.effectAllowed = 'copy';
                          }}
                          onDragEnd={(event) => {
                            if (event.dataTransfer.dropEffect !== 'none') {
                              handleUseItem(item);
                            }
                          }}
                        >
                          {item.image ? (
                            <img src={item.image} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable={false} />
                          ) : (
                            <PaletteIcon icon={item.icon!} />
                          )}
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
          <button onClick={() => setSettingsModalOpen(true)}>
            <Settings size={16} />
            设置
          </button>
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

      {settingsModalOpen && (
        <div className="help-modal-overlay" onClick={() => setSettingsModalOpen(false)}>
          <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="help-modal-header">
              <h3>图元库显示与排序设置</h3>
              <button className="help-modal-close" onClick={() => setSettingsModalOpen(false)}>×</button>
            </div>
            <div className="settings-modal-body">
              {(() => {
                const getGroupTitle = (id: string) => {
                  return assetGroups.find((g) => g.id === id)?.title || id;
                };
                const orderList = groupConfig.order.filter((x) => x !== 'common');
                const displayOrder = ['common', ...orderList];

                return displayOrder.map((id) => {
                  const title = getGroupTitle(id);
                  const isVisible = groupConfig.visible[id] !== false;
                  const isCommon = id === 'common';

                  const nonCommonIndex = orderList.indexOf(id);
                  const canMoveUp = !isCommon && nonCommonIndex > 0;
                  const canMoveDown = !isCommon && nonCommonIndex < orderList.length - 1;

                  return (
                    <div className="settings-item-row" key={id}>
                      <div className="settings-item-info">
                        <span className="settings-item-name">{title}</span>
                        {isCommon && (
                          <span className="settings-item-badge">
                            <Lock size={10} />
                            固定首位
                          </span>
                        )}
                      </div>
                      <div className="settings-item-actions">
                        {!isCommon && (
                          <div className="settings-sort-btn-group">
                            <button
                              className="settings-sort-btn"
                              disabled={!canMoveUp}
                              onClick={() => moveGroup(id, 'up')}
                              title="上移"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              className="settings-sort-btn"
                              disabled={!canMoveDown}
                              onClick={() => moveGroup(id, 'down')}
                              title="下移"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        )}
                        <label className="tech-switch">
                          <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={() => toggleGroupVisibility(id)}
                          />
                          <span className="tech-switch-slider"></span>
                        </label>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
