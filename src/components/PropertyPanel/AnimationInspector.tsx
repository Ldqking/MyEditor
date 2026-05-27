import { useEffect, useState } from 'react';
import type { Pen } from '@meta2d/core';
import type { useMeta2dEditor } from '../../editor/useMeta2dEditor';
import { AlphaColorPicker, Label, Section, Switch } from './SharedComponents';
import { normalizeColor } from './utils';

type EditorActions = ReturnType<typeof useMeta2dEditor>['actions'];
type BasicAnimationType =
  | 'none'
  | 'bounceY'
  | 'bounceX'
  | 'heartbeat'
  | 'success'
  | 'warning'
  | 'error'
  | 'shine'
  | 'rotate'
  | 'rotateReverse';

type OfficialBasicAnimationType = '' | 'upDown' | 'leftRight' | 'heart' | 'success' | 'warning' | 'error' | 'show' | 'rotate' | 'rerotate';

type BasicAnimationState = {
  type: BasicAnimationType;
  cycle: string;
  autoPlay: boolean;
};

type LineAnimationState = {
  type: 0 | 1 | 2;
  lineWidth: number;
  color: string;
  speed: number;
  reverse: boolean;
  cycle: string;
  autoPlay: boolean;
};

type AnimationPen = Pen & {
  animationType?: BasicAnimationType | string;
  animateType?: OfficialBasicAnimationType | string;
  animateLineWidth?: number;
  showDuration?: number;
};

const basicOptions: Array<{ value: BasicAnimationType; label: string }> = [
  { value: 'none', label: '无' },
  { value: 'bounceY', label: '上下跳动' },
  { value: 'bounceX', label: '左右跳动' },
  { value: 'heartbeat', label: '心跳' },
  { value: 'success', label: '成功' },
  { value: 'warning', label: '警告' },
  { value: 'error', label: '错误' },
  { value: 'shine', label: '炫耀' },
  { value: 'rotate', label: '旋转' },
  { value: 'rotateReverse', label: '逆向旋转' },
];

const lineOptions: Array<{ value: 0 | 1 | 2; label: string }> = [
  { value: 0, label: '水流' },
  { value: 1, label: '水珠流动' },
  { value: 2, label: '圆点' },
];

export function AnimationInspector({ actions, selectedPen }: { actions: EditorActions; selectedPen: Pen | null }) {
  const [basic, setBasic] = useState<BasicAnimationState>({ type: 'none', cycle: '', autoPlay: false });
  const [line, setLine] = useState<LineAnimationState>({
    type: 0,
    lineWidth: 6,
    color: '#30EEDC',
    speed: 1,
    reverse: false,
    cycle: '',
    autoPlay: false,
  });

  useEffect(() => {
    if (!selectedPen) return;
    const pen = selectedPen as AnimationPen;
    setBasic({
      type: normalizeBasicAnimationType(pen.animationType || pen.animateType, pen.frames),
      cycle: formatCycle(pen.animateCycle),
      autoPlay: Boolean(pen.autoPlay),
    });
    setLine({
      type: normalizeLineAnimationType(pen.lineAnimateType),
      lineWidth: Number(pen.animateLineWidth || 6),
      color: normalizeColor(pen.animateColor, '#30EEDC'),
      speed: Number(pen.animateSpan || 1),
      reverse: Boolean(pen.animateReverse),
      cycle: formatCycle(pen.animateCycle),
      autoPlay: Boolean(pen.autoPlay),
    });
  }, [selectedPen?.id]);

  if (!selectedPen) {
    return (
      <Section title="动画配置">
        <p className="muted">请选择一个图元配置动画。</p>
      </Section>
    );
  }

  const isLine = selectedPen.type === 1;

  const changeBasic = (patch: Partial<BasicAnimationState>) => {
    const next = { ...basic, ...patch };
    setBasic(next);
    actions.applyAnimation(buildBasicAnimationPatch(selectedPen, next), { restart: next.autoPlay && next.type !== 'none' });
  };

  const changeLine = (patch: Partial<LineAnimationState>) => {
    const next = { ...line, ...patch };
    setLine(next);
    actions.applyAnimation(buildLineAnimationPatch(next), { restart: next.autoPlay });
  };

  const play = () => {
    if (isLine) {
      actions.applyAnimation(buildLineAnimationPatch(line), { restart: true });
      return;
    }
    actions.applyAnimation(buildBasicAnimationPatch(selectedPen, basic), { restart: basic.type !== 'none' });
  };

  return isLine ? (
    <LineAnimationPanel config={line} onChange={changeLine} onPause={actions.pauseSelectedAnimation} onPlay={play} onStop={actions.stopSelectedAnimation} selectedPen={selectedPen} />
  ) : (
    <BasicAnimationPanel config={basic} onChange={changeBasic} onPause={actions.pauseSelectedAnimation} onPlay={play} onStop={actions.stopSelectedAnimation} selectedPen={selectedPen} />
  );
}

function BasicAnimationPanel({
  config,
  onChange,
  onPause,
  onPlay,
  onStop,
  selectedPen,
}: {
  config: BasicAnimationState;
  onChange: (patch: Partial<BasicAnimationState>) => void;
  onPause: () => void;
  onPlay: () => void;
  onStop: () => void;
  selectedPen: Pen;
}) {
  return (
    <>
      <Section title="动画配置">
        <Label text="图元">
          <input readOnly value={selectedPen.text || selectedPen.name || ''} />
        </Label>
        <Label text="动画">
          <select value={config.type} onChange={(event) => onChange({ type: event.target.value as BasicAnimationType })}>
            {basicOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Label>
        <Label text="循环次数">
          <input min={1} placeholder="重复" type="number" value={config.cycle} onChange={(event) => onChange({ cycle: event.target.value })} />
        </Label>
        <Switch checked={config.autoPlay} label="自动播放" onChange={(autoPlay) => onChange({ autoPlay })} />
      </Section>
      <AnimationControls onPause={onPause} onPlay={onPlay} onStop={onStop} />
    </>
  );
}

function LineAnimationPanel({
  config,
  onChange,
  onPause,
  onPlay,
  onStop,
  selectedPen,
}: {
  config: LineAnimationState;
  onChange: (patch: Partial<LineAnimationState>) => void;
  onPause: () => void;
  onPlay: () => void;
  onStop: () => void;
  selectedPen: Pen;
}) {
  return (
    <>
      <Section title="线动画配置">
        <Label text="图元">
          <input readOnly value={selectedPen.text || selectedPen.name || ''} />
        </Label>
        <Label text="动画">
          <select value={config.type} onChange={(event) => onChange({ type: Number(event.target.value) as LineAnimationState['type'] })}>
            {lineOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Label>
        <Label text="动画线宽">
          <input min={1} type="number" value={config.lineWidth} onChange={(event) => onChange({ lineWidth: Number(event.target.value) })} />
        </Label>
        <AlphaColorPicker label="动画颜色" value={config.color} onChange={(color) => onChange({ color })} />
        <Label text="动画速度">
          <input min={0.2} step={0.2} type="number" value={config.speed} onChange={(event) => onChange({ speed: Number(event.target.value) })} />
        </Label>
        <Switch checked={config.reverse} label="反向流动" onChange={(reverse) => onChange({ reverse })} />
        <Label text="循环次数">
          <input min={1} placeholder="重复" type="number" value={config.cycle} onChange={(event) => onChange({ cycle: event.target.value })} />
        </Label>
        <Switch checked={config.autoPlay} label="自动播放" onChange={(autoPlay) => onChange({ autoPlay })} />
      </Section>
      <AnimationControls onPause={onPause} onPlay={onPlay} onStop={onStop} />
    </>
  );
}

function AnimationControls({ onPause, onPlay, onStop }: { onPause: () => void; onPlay: () => void; onStop: () => void }) {
  return (
    <div className="animation-actions">
      <button className="primary-panel-button" onClick={onPlay} type="button">
        播放
      </button>
      <button className="primary-panel-button" onClick={onPause} type="button">
        暂停
      </button>
      <button className="primary-panel-button" onClick={onStop} type="button">
        停止
      </button>
    </div>
  );
}

function buildBasicAnimationPatch(pen: Pen, config: BasicAnimationState): Partial<Pen> {
  if (config.type === 'none') {
    return {
      animationType: 'none',
      animateType: '',
      autoPlay: false,
      animateCycle: undefined,
      frames: null,
      showDuration: 0,
    } as unknown as Partial<Pen>;
  }

  const frames = createBasicFrames(config.type, pen);

  return {
    animationType: config.type,
    animateType: toOfficialBasicAnimationType(config.type),
    autoPlay: config.autoPlay,
    animateCycle: parseCycle(config.cycle),
    frames,
    linear: true,
    showDuration: getFramesDuration(frames),
  } as unknown as Partial<Pen>;
}

function buildLineAnimationPatch(config: LineAnimationState): Partial<Pen> {
  const width = Math.max(1, Number(config.lineWidth) || 1);
  const isDot = config.type === 2;

  const patch: Partial<Pen> & { animationType?: string; animateDotSize?: number } = {
    animationType: `line-${config.type}`,
    autoPlay: config.autoPlay,
    animateCycle: parseCycle(config.cycle),
    animateColor: config.color,
    animateLineWidth: isDot ? Math.max(6, width) : width,
    animateReverse: config.reverse,
    animateSpan: Math.max(0.2, Number(config.speed) || 1),
    animateShadow: isDot,
    animateShadowBlur: isDot ? Math.max(8, width * 1.4) : 0,
    curveAnimate: false,
    lineAnimateType: config.type,
  };

  if (isDot) {
    patch.animateDotSize = Math.max(6, width);
    patch.lineCap = 'round';
  }

  return patch;
}

function createBasicFrames(type: BasicAnimationType, _pen: Pen): Pen[] {
  switch (type) {
    case 'bounceY':
      return [
        { y: -10, duration: 100 },
        { y: 10, duration: 80 },
        { y: -10, duration: 50 },
        { y: 10, duration: 30 },
        { y: 0, duration: 300 },
      ] as Pen[];
    case 'bounceX':
      return [
        { x: -10, duration: 100 },
        { x: 10, duration: 80 },
        { x: -10, duration: 50 },
        { x: 10, duration: 30 },
        { x: 0, duration: 300 },
      ] as Pen[];
    case 'heartbeat':
      return [
        { scale: 1.1, duration: 100 },
        { scale: 1, duration: 400 },
      ] as Pen[];
    case 'success':
      return [
        { background: 'rgba(56, 158, 13, 0.22)', color: '#237804', globalAlpha: 0.78, duration: 520 },
        { background: 'rgba(56, 158, 13, 0.22)', color: '#237804', globalAlpha: 1, duration: 640 },
        { background: 'rgba(56, 158, 13, 0.22)', color: '#237804', globalAlpha: 0.84, duration: 640 },
        { background: 'rgba(56, 158, 13, 0.22)', color: '#237804', globalAlpha: 1, duration: 720 },
      ] as Pen[];
    case 'warning':
      return [
        { color: '#fa8c16', lineDash: [10, 10], duration: 300 },
        { color: '#fa8c16', lineDash: [], duration: 500 },
        { color: '#fa8c16', lineDash: [10, 10], duration: 300 },
      ] as Pen[];
    case 'error':
      return [
        { color: '#cf1322', background: '#cf132222', x: -8, scale: 1.04, duration: 70 },
        { color: '#cf1322', background: '#cf132222', x: 16, scale: 1.02, duration: 70 },
        { color: '#cf1322', background: '#cf132222', x: -16, scale: 1.02, duration: 70 },
        { color: '#cf1322', background: '#cf132222', x: 12, scale: 1.01, duration: 80 },
        { color: '#cf1322', background: '#cf132222', x: -4, scale: 1, duration: 90 },
        { color: '#cf1322', background: '#cf132222', x: 0, scale: 1, duration: 160 },
      ] as Pen[];
    case 'shine':
      return [
        { color: '#fa541c', rotate: -10, duration: 100 },
        { color: '#fa541c', rotate: 10, duration: 100 },
        { color: '#fa541c', rotate: 0, duration: 100 },
      ] as Pen[];
    case 'rotate':
      return [{ rotate: 360, duration: 1000 }] as Pen[];
    case 'rotateReverse':
      return [{ rotate: -360, duration: 1000 }] as Pen[];
    default:
      return [];
  }
}

function normalizeBasicAnimationType(type: unknown, frames: unknown): BasicAnimationType {
  if (basicOptions.some((option) => option.value === type)) return type as BasicAnimationType;
  const officialType = fromOfficialBasicAnimationType(type);
  if (officialType) return officialType;
  return Array.isArray(frames) && frames.length ? 'shine' : 'none';
}

function toOfficialBasicAnimationType(type: BasicAnimationType): OfficialBasicAnimationType {
  const map: Record<BasicAnimationType, OfficialBasicAnimationType> = {
    none: '',
    bounceY: 'upDown',
    bounceX: 'leftRight',
    heartbeat: 'heart',
    success: 'success',
    warning: 'warning',
    error: 'error',
    shine: 'show',
    rotate: 'rotate',
    rotateReverse: 'rerotate',
  };
  return map[type];
}

function fromOfficialBasicAnimationType(type: unknown): BasicAnimationType | null {
  const map: Record<string, BasicAnimationType> = {
    '': 'none',
    upDown: 'bounceY',
    leftRight: 'bounceX',
    heart: 'heartbeat',
    success: 'success',
    warning: 'warning',
    error: 'error',
    show: 'shine',
    rotate: 'rotate',
    rerotate: 'rotateReverse',
  };
  return typeof type === 'string' && type in map ? map[type] : null;
}

function getFramesDuration(frames: Pen[]) {
  return frames.reduce((total, frame) => total + Number(frame.duration || 0), 0);
}

function normalizeLineAnimationType(value: unknown): LineAnimationState['type'] {
  const current = Array.isArray(value) ? value[0] : value;
  return current === 1 || current === 2 ? current : 0;
}

function parseCycle(value: string) {
  const count = Number(value);
  return Number.isFinite(count) && count > 0 ? Math.round(count) : undefined;
}

function formatCycle(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? String(Math.round(value)) : '';
}
