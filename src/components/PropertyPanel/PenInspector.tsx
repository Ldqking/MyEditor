import type { ChangeEvent } from 'react';
import type React from 'react';
import type { Pen } from '@meta2d/core';
import { Section, Label, Switch, AlphaColorPicker, SliderWithNumber } from './SharedComponents';
import { normalizeColor } from './utils';

export function PenInspector({
  pen,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onMoveTop,
  onMoveBottom,
  layerIndex,
  layerTotal,
}: {
  pen: Pen;
  onChange: (patch: Partial<Pen>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveTop: () => void;
  onMoveBottom: () => void;
  layerIndex: number;
  layerTotal: number;
}) {
  const numeric = (key: keyof Pen) => (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ [key]: Number(event.target.value) } as Partial<Pen>);
  };

  const isLine = pen.type === 1;
  const isBasicShape = pen.name !== 'echarts' && pen.name !== 'image' && !pen.image;

  return (
    <>
      <Section title="图元属性">
        <Label text="名称">
          <input value={pen.text || pen.name || ''} readOnly />
        </Label>
        <Label text="图元类型">
          <input value={pen.name || ''} readOnly />
        </Label>
        <div className="two-col">
          <Label text="X">
            <input type="number" value={Math.round(pen.x || 0)} onChange={numeric('x')} />
          </Label>
          <Label text="Y">
            <input type="number" value={Math.round(pen.y || 0)} onChange={numeric('y')} />
          </Label>
          <Label text="宽">
            <input
              type="number"
              value={Math.round(pen.width || 0)}
              onChange={(e) => {
                const w = Number(e.target.value);
                if (pen.ratio && pen.width && pen.height) {
                  const h = (w / pen.width) * pen.height;
                  onChange({ width: w, height: h });
                } else {
                  onChange({ width: w });
                }
              }}
            />
          </Label>
          <Label text="高">
            <input
              type="number"
              value={Math.round(pen.height || 0)}
              onChange={(e) => {
                const h = Number(e.target.value);
                if (pen.ratio && pen.width && pen.height) {
                  const w = (h / pen.height) * pen.width;
                  onChange({ width: w, height: h });
                } else {
                  onChange({ height: h });
                }
              }}
            />
          </Label>
        </div>
        <div style={{ marginBottom: '8px' }}>
          <Switch label="锁定宽高比" checked={!!pen.ratio} onChange={(ratio) => onChange({ ratio })} />
        </div>
        <Label text="旋转">
          <SliderWithNumber min={-180} max={180} value={pen.rotate || 0} onChange={(val) => onChange({ rotate: val })} />
        </Label>
        <Label text="透明度">
          <SliderWithNumber min={0.1} max={1} step={0.05} value={pen.globalAlpha ?? 1} onChange={(val) => onChange({ globalAlpha: val })} />
        </Label>
      </Section>
      {isBasicShape && !isLine && (
        <Section title="样式">
          <AlphaColorPicker
            label="填充"
            value={normalizeColor(pen.background, '#17252b')}
            onChange={(val) => onChange({ background: val })}
          />
          <AlphaColorPicker
            label="描边"
            value={normalizeColor(pen.color, '#9fb3bd')}
            onChange={(val) => onChange({ color: val })}
          />
        </Section>
      )}
      {isLine && (
        <Section title="线条样式">
          <AlphaColorPicker
            label="线条颜色"
            value={normalizeColor(pen.color, '#9fb3bd')}
            onChange={(val) => onChange({ color: val })}
          />
          <Label text="线宽">
            <input type="number" value={pen.lineWidth || 1} onChange={numeric('lineWidth')} />
          </Label>
          <Label text="线条样式">
            <select
              value={JSON.stringify(pen.lineDash || [])}
              onChange={(e) => onChange({ lineDash: JSON.parse(e.target.value) })}
            >
              <option value="[]">实线 (───)</option>
              <option value="[5,5]">虚线 (- - -)</option>
              <option value="[2,2]">点线 (· · ·)</option>
              <option value="[5,2,2,2]">点划线 (- · -)</option>
            </select>
          </Label>
          <Label text="连线类型">
            <select
              value={pen.lineName === 'polyline' && pen.lineSmooth ? 'smooth' : (pen.lineName || 'curve')}
              onChange={(e) => {
                if (e.target.value === 'smooth') {
                  onChange({ lineName: 'polyline', lineSmooth: 1 });
                } else {
                  onChange({ lineName: e.target.value, lineSmooth: 0 });
                }
              }}
            >
              <option value="curve">默认曲线 (Curve)</option>
              <option value="smooth">平滑曲线 (Smooth)</option>
              <option value="polyline">折线 (Polyline)</option>
              <option value="line">直线 (Line)</option>
              <option value="mind">脑图曲线 (Mind)</option>
            </select>
          </Label>
          <Label text="起点样式">
            <select
              value={pen.fromArrow || ''}
              onChange={(e) => onChange({ fromArrow: e.target.value })}
            >
              <option value="">无 (None)</option>
              <option value="triangleSolid">▶ 实心三角形</option>
              <option value="triangle">▷ 空心三角形</option>
              <option value="diamondSolid">◆ 实心菱形</option>
              <option value="diamond">◇ 空心菱形</option>
              <option value="circleSolid">● 实心圆</option>
              <option value="circle">○ 空心圆</option>
              <option value="line">↘ 单线箭头</option>
            </select>
          </Label>
          <Label text="末端样式">
            <select
              value={pen.toArrow || ''}
              onChange={(e) => onChange({ toArrow: e.target.value })}
            >
              <option value="">无 (None)</option>
              <option value="triangleSolid">▶ 实心三角形</option>
              <option value="triangle">▷ 空心三角形</option>
              <option value="diamondSolid">◆ 实心菱形</option>
              <option value="diamond">◇ 空心菱形</option>
              <option value="circleSolid">● 实心圆</option>
              <option value="circle">○ 空心圆</option>
              <option value="line">↘ 单线箭头</option>
            </select>
          </Label>
        </Section>
      )}
      <Section title="文本">
        <Label text="内容">
          <textarea
            value={pen.text || ''}
            onChange={(event) => onChange({ text: event.target.value })}
          />
        </Label>
        <div className="two-col">
          <Label text="X 偏移">
            <input type="number" value={Math.round(pen.textLeft || 0)} onChange={numeric('textLeft')} />
          </Label>
          <Label text="Y 偏移">
            <input type="number" value={Math.round(pen.textTop || 0)} onChange={numeric('textTop')} />
          </Label>
          <Label text="字号">
            <input type="number" value={pen.fontSize || 12} onChange={numeric('fontSize')} />
          </Label>
          <Label text="字体粗细">
            <select
              value={pen.fontWeight || 'normal'}
              onChange={(e) => onChange({ fontWeight: e.target.value })}
            >
              <option value="300">较细</option>
              <option value="normal">正常</option>
              <option value="bold">加粗</option>
            </select>
          </Label>
        </div>
        <div className="two-col">
          <Label text="换行">
            <select
              value={pen.whiteSpace || 'nowrap'}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e) => onChange({ whiteSpace: e.target.value as any })}
            >
              <option value="nowrap">不换行</option>
              <option value="pre-line">自动换行</option>
              <option value="break-all">强制换行</option>
            </select>
          </Label>
          <Label text="溢出省略">
            <select
              value={pen.ellipsis !== false ? 'true' : 'false'}
              onChange={(e) => onChange({ ellipsis: e.target.value === 'true' })}
            >
              <option value="true">开启</option>
              <option value="false">关闭</option>
            </select>
          </Label>
        </div>
        <AlphaColorPicker
          label="颜色"
          value={normalizeColor(pen.textColor, '#9fb3bd')}
          onChange={(val) => onChange({ textColor: val })}
        />
      </Section>
      <div className="field">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span>调整图元层级</span>
          <span style={{ color: '#13ddea', fontSize: '12px' }}>
            当前：{layerIndex}/{layerTotal}
          </span>
        </div>
        <div className="button-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '16px' }}>
          <button title="置于顶层" onClick={onMoveTop} style={{ padding: '6px 0' }}>顶层</button>
          <button title="上移一层" onClick={onMoveUp} style={{ padding: '6px 0' }}>上移</button>
          <button title="下移一层" onClick={onMoveDown} style={{ padding: '6px 0' }}>下移</button>
          <button title="置于底层" onClick={onMoveBottom} style={{ padding: '6px 0' }}>底层</button>
        </div>
      </div>
      <button className="danger-button" onClick={onDelete}>
        删除图元
      </button>
    </>
  );
}
