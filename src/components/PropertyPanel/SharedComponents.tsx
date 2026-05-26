import type React from 'react';
import { useRef } from 'react';
import { hexToRgba, parseColor } from './utils';

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="prop-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{text}</span>
      {children}
    </label>
  );
}

export function Switch({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="switch-row">
      <span>{label}</span>
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      <i />
    </label>
  );
}

export function ColorPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="custom-color-picker">
      <span>{label}</span>
      <div className="color-picker-trigger" onClick={() => ref.current?.click()}>
        <div className="color-preview" style={{ backgroundColor: value }} />
        <span className="color-hex">{value.toUpperCase()}</span>
        <input
          ref={ref}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
}

export function AlphaColorPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const parsed = parseColor(value);
  const ref = useRef<HTMLInputElement>(null);

  const handleHexChange = (hex: string) => {
    if (parsed.alpha === 1) {
      onChange(hex);
    } else {
      onChange(hexToRgba(hex, parsed.alpha));
    }
  };

  const handleAlphaChange = (alpha: number) => {
    onChange(hexToRgba(parsed.hex, alpha));
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: '#9fb3bd' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
          <div
            onClick={() => ref.current?.click()}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              backgroundColor: value,
              border: '1px solid #3c4a54',
              cursor: 'pointer',
              flexShrink: 0,
              backgroundImage:
                'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 4px 4px',
            }}
          >
            <div style={{ width: '100%', height: '100%', backgroundColor: value, borderRadius: '4px' }} />
          </div>
          <div className="color-preview-container" style={{ flex: 1, height: '32px', position: 'relative' }}>
            <input
              ref={ref}
              type="color"
              value={parsed.hex}
              onChange={(e) => handleHexChange(e.target.value)}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
            />
            <div
              onClick={() => ref.current?.click()}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                cursor: 'pointer',
                background: '#17252b',
                padding: '0 8px',
                borderRadius: '4px',
                border: '1px solid #243139',
              }}
            >
              <span className="color-hex" style={{ fontSize: '13px' }}>
                {parsed.hex.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#5c6d75', width: '16px', textAlign: 'center' }}>A</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={parsed.alpha}
            onChange={(e) => handleAlphaChange(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#13ddea' }}
          />
          <span style={{ fontSize: '12px', width: '36px', textAlign: 'right', color: '#9fb3bd' }}>
            {Math.round(parsed.alpha * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function SliderWithNumber({
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          let val = Number(e.target.value);
          if (val < min) val = min;
          if (val > max) val = max;
          onChange(val);
        }}
        style={{ flex: 1, minWidth: 0 }}
      />
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          let val = Number(e.target.value);
          if (val < min) val = min;
          if (val > max) val = max;
          onChange(val);
        }}
        style={{ width: '76px' }}
      />
    </div>
  );
}
