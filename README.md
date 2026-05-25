# Meta2d 2.5D 编辑器

基于 React + Vite + Meta2d 搭建的 2.5D 可视化编辑器。项目参考 le5le / Meta2d 文档和 2D 编辑器产品形态，实现左侧图元库、中间画布、右侧属性面板的编辑器工作台。
Meta2d参考https://doc.le5le.com/document/118756411


## 技术栈

- React 19
- Vite 6
- TypeScript
- Meta2d Core
- Meta2d 免费图元库：流程图、活动图、类图、时序图、表单控件
- ECharts
- `@meta2d/le5le-charts`
- lucide-react

## 快速开始

```bash
npm install
npm run dev
```

构建生产包：

```bash
npm run build
```

预览生产包：

```bash
npm run preview
```

## 功能概览

- 左侧资产库
  - 支持图元分组折叠/展开。
  - 支持点击图元添加到画布中心。
  - 支持按 Meta2d 文档方式拖拽图元到画布。
  - 已接入常用图元、基础图形、流程图、UML/活动图、表单控件、免费图表和 2.5D 城市图元。

- 中间画布
  - 使用 Meta2d 初始化和渲染。
  - 支持图元选中、拖拽、缩放、撤销、重做、画布锁定、预览模式。
  - 支持背景色、网格显示、网格吸附配置。
  - ECharts 和 le5le-charts 图表已补齐默认数据，避免拖入后只显示文字或不可见。

- 顶部工具栏
  - 文件菜单：新建、打开。
  - 保存：写入 localStorage。
  - 读取：从 localStorage 恢复。
  - 发布：导出可再次打开的编辑器 JSON。
  - 工具：钢笔、选择、放大镜、撤销、重做、锁定画布、全屏、网格、预览。

- 右侧面板
  - 设计 Tab：编辑选中图元文本、位置、宽高、旋转、透明度、填充、描边和文字颜色。
  - 通信 Tab：提供数据源配置壳、变量名、目标属性和 mock 值，可将 mock 值写回选中图元。
  - 结构 Tab：显示图层列表，支持选中、删除、锁定/解锁、隐藏/显示、上移/下移。
  - 未选中图元时显示文件属性和画布设置。

## 项目结构

```text
src/
  App.tsx
  main.tsx
  styles.css
  types.ts
  components/
    AssetPanel.tsx
    CanvasStage.tsx
    PaletteIcon.tsx
    PropertyPanel.tsx
    Topbar.tsx
  editor/
    assetLibrary.ts
    fileActions.ts
    useMeta2dEditor.ts
```

核心文件说明：

- `src/App.tsx`：只负责组合编辑器布局。
- `src/editor/useMeta2dEditor.ts`：Meta2d 初始化、图元注册、画布事件监听和编辑器 actions。
- `src/editor/assetLibrary.ts`：左侧图元库配置和每类图元的默认 Pen 工厂。
- `src/editor/fileActions.ts`：编辑器文件保存、读取、导出、打开逻辑。
- `src/components/PropertyPanel.tsx`：右侧属性、通信和结构面板。

## 编辑器文件格式

发布和打开使用同一种 JSON 格式：

```ts
interface EditorFile {
  version: 1;
  settings: CanvasSettings;
  meta2d: Meta2dData;
}
```

其中 `settings` 保存文件名、分类、背景色、网格、吸附、缩放和预览状态；`meta2d` 保存 Meta2d 画布数据。

## 图元库说明

项目中按图元渲染方式分别注册：

- Path2D 图元：`meta2d.register(...)`
- CanvasDraw 图元：`meta2d.registerCanvasDraw(...)`
- Anchor：`meta2d.registerAnchors(...)`
- ECharts：`@meta2d/chart-diagram/register(echarts)`

当前重点补齐了这些图表的默认数据：

- `echarts` 柱图、折线图、饼图
- `lineChart`
- `histogram`
- `pieChart`
- `gauge`
- `heatmap`

## 当前约定

- 通信功能本阶段只实现配置面板、绑定结构和 mock 更新，不连接真实 WebSocket、MQTT 或 HTTP 数据源。
- 发布当前定义为导出编辑器 JSON，不对接后端发布接口。
- 左侧资产库优先展示能稳定渲染并有有效默认数据的免费图元。

## 构建说明

`npm run build` 可能出现以下警告，当前属于预期范围：

- `@meta2d/chart-diagram` 内部使用 `eval` 的警告。
- ECharts / Meta2d 相关依赖导致的 chunk size 警告。

这些警告不影响当前功能运行。
