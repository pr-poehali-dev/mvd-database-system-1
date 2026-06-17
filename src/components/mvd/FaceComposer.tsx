import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import * as api from '@/lib/api';

interface FaceState {
  skin: string;
  face: number;
  eyes: number;
  brows: number;
  nose: number;
  mouth: number;
  hair: number;
  hairColor: string;
  beard: number;
}

const SKINS = ['#f1d2b6', '#e8b48f', '#c68642', '#8d5524', '#ffe0bd'];
const HAIR_COLORS = ['#2b2118', '#5a3a22', '#a8742a', '#d9b36b', '#bcbcbc', '#111111'];

const def: FaceState = {
  skin: SKINS[0], face: 0, eyes: 0, brows: 0, nose: 0, mouth: 0, hair: 0, hairColor: HAIR_COLORS[0], beard: 0,
};

const FacePreview = ({ s }: { s: FaceState }) => {
  const faceShapes = [
    <ellipse key="f" cx="100" cy="110" rx="58" ry="70" fill={s.skin} stroke="#00000022" />,
    <path key="f2" d="M42 90 Q42 40 100 40 Q158 40 158 90 L158 130 Q158 185 100 185 Q42 185 42 130 Z" fill={s.skin} stroke="#00000022" />,
    <ellipse key="f3" cx="100" cy="115" rx="50" ry="72" fill={s.skin} stroke="#00000022" />,
  ];
  const hairs = [
    null,
    <path key="h1" d="M40 95 Q35 30 100 28 Q165 30 160 95 Q150 55 100 52 Q50 55 40 95 Z" fill={s.hairColor} />,
    <path key="h2" d="M38 110 Q30 25 100 25 Q170 25 162 110 L150 90 Q150 50 100 48 Q50 50 50 90 Z" fill={s.hairColor} />,
    <path key="h3" d="M45 70 Q60 30 100 32 Q140 30 155 70 Q130 50 100 50 Q70 50 45 70 Z" fill={s.hairColor} />,
  ];
  const browShapes = [
    <g key="b0"><rect x="62" y="86" width="26" height="5" rx="2" fill="#3a2a1a" /><rect x="112" y="86" width="26" height="5" rx="2" fill="#3a2a1a" /></g>,
    <g key="b1"><path d="M62 90 Q75 82 88 88" stroke="#3a2a1a" strokeWidth="5" fill="none" strokeLinecap="round" /><path d="M112 88 Q125 82 138 90" stroke="#3a2a1a" strokeWidth="5" fill="none" strokeLinecap="round" /></g>,
    <g key="b2"><path d="M62 86 Q75 92 88 86" stroke="#3a2a1a" strokeWidth="5" fill="none" strokeLinecap="round" /><path d="M112 86 Q125 92 138 86" stroke="#3a2a1a" strokeWidth="5" fill="none" strokeLinecap="round" /></g>,
  ];
  const eyeShapes = [
    <g key="e0"><ellipse cx="75" cy="100" rx="10" ry="7" fill="#fff" stroke="#00000044" /><circle cx="75" cy="100" r="4" fill="#3a2a1a" /><ellipse cx="125" cy="100" rx="10" ry="7" fill="#fff" stroke="#00000044" /><circle cx="125" cy="100" r="4" fill="#3a2a1a" /></g>,
    <g key="e1"><ellipse cx="75" cy="100" rx="11" ry="5" fill="#fff" stroke="#00000044" /><circle cx="75" cy="100" r="3.5" fill="#1a3a5a" /><ellipse cx="125" cy="100" rx="11" ry="5" fill="#fff" stroke="#00000044" /><circle cx="125" cy="100" r="3.5" fill="#1a3a5a" /></g>,
    <g key="e2"><circle cx="75" cy="100" r="8" fill="#fff" stroke="#00000044" /><circle cx="75" cy="100" r="4.5" fill="#0a5a2a" /><circle cx="125" cy="100" r="8" fill="#fff" stroke="#00000044" /><circle cx="125" cy="100" r="4.5" fill="#0a5a2a" /></g>,
  ];
  const noses = [
    <path key="n0" d="M100 105 L94 130 Q100 135 106 130 Z" fill="#00000018" stroke="#00000033" />,
    <path key="n1" d="M100 108 L92 132 Q100 138 108 132 Z" fill="#00000018" stroke="#00000033" />,
    <path key="n2" d="M100 105 Q96 128 100 132 Q104 128 100 105" fill="none" stroke="#00000055" strokeWidth="2" />,
  ];
  const mouths = [
    <path key="m0" d="M82 150 Q100 162 118 150" stroke="#a04040" strokeWidth="4" fill="none" strokeLinecap="round" />,
    <path key="m1" d="M84 152 Q100 148 116 152" stroke="#a04040" strokeWidth="4" fill="none" strokeLinecap="round" />,
    <ellipse key="m2" cx="100" cy="152" rx="16" ry="7" fill="#a04040" />,
  ];
  const beards = [
    null,
    <path key="bd1" d="M55 135 Q60 185 100 188 Q140 185 145 135 Q140 170 100 172 Q60 170 55 135 Z" fill={s.hairColor} opacity="0.85" />,
    <path key="bd2" d="M80 165 Q100 178 120 165 Q115 182 100 183 Q85 182 80 165 Z" fill={s.hairColor} opacity="0.85" />,
  ];

  return (
    <svg viewBox="0 0 200 210" className="h-full w-full" id="facecomposite-svg">
      <rect width="200" height="210" fill="#eef1f5" />
      {faceShapes[s.face]}
      {beards[s.beard]}
      {browShapes[s.brows]}
      {eyeShapes[s.eyes]}
      {noses[s.nose]}
      {mouths[s.mouth]}
      {hairs[s.hair]}
    </svg>
  );
};

const Ctrl = ({ label, count, value, onChange }: { label: string; count: number; value: number; onChange: (v: number) => void }) => (
  <div className="flex items-center justify-between gap-2 border-b border-border py-2">
    <span className="text-sm text-foreground">{label}</span>
    <div className="flex items-center gap-1">
      <button onClick={() => onChange((value - 1 + count) % count)} className="flex h-7 w-7 items-center justify-center border border-border bg-secondary hover:bg-muted"><Icon name="ChevronLeft" size={14} /></button>
      <span className="w-8 text-center text-sm font-500">{value + 1}/{count}</span>
      <button onClick={() => onChange((value + 1) % count)} className="flex h-7 w-7 items-center justify-center border border-border bg-secondary hover:bg-muted"><Icon name="ChevronRight" size={14} /></button>
    </div>
  </div>
);

const Swatches = ({ label, colors, value, onChange }: { label: string; colors: string[]; value: string; onChange: (c: string) => void }) => (
  <div className="flex items-center justify-between gap-2 border-b border-border py-2">
    <span className="text-sm text-foreground">{label}</span>
    <div className="flex gap-1">
      {colors.map((c) => (
        <button key={c} onClick={() => onChange(c)} className={`h-6 w-6 rounded-full border-2 ${value === c ? 'border-primary' : 'border-transparent'}`} style={{ background: c }} />
      ))}
    </div>
  </div>
);

const FaceComposer = ({ onSaved }: { onSaved?: () => void }) => {
  const [s, setS] = useState<FaceState>(def);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof FaceState>(k: K, v: FaceState[K]) => setS((p) => ({ ...p, [k]: v }));

  const toPng = (): Promise<string> => new Promise((resolve) => {
    const svg = document.getElementById('facecomposite-svg');
    if (!svg) return resolve('');
    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400; canvas.height = 420;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve('');
      ctx.fillStyle = '#eef1f5';
      ctx.fillRect(0, 0, 400, 420);
      ctx.drawImage(img, 0, 0, 400, 420);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)));
  });

  const save = async () => {
    setSaving(true);
    const photo = await toPng();
    await api.create('wanted', {
      full_name: name || 'Неизвестный (фоторобот)',
      description: notes,
      danger_level: 'Средний',
      photo_url: photo,
      facecomposite: JSON.stringify(s),
    });
    setSaving(false);
    setS(def); setName(''); setNotes('');
    onSaved?.();
  };

  return (
    <div className="animate-fade-in">
      <h2 className="mb-5 font-display text-2xl text-primary">Фоторобот</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col items-center">
          <div className="aspect-square w-full max-w-xs overflow-hidden border border-border bg-card shadow-sm">
            <FacePreview s={s} />
          </div>
          <Button variant="outline" className="mt-3" onClick={() => setS(def)}><Icon name="RotateCcw" size={16} className="mr-2" />Сбросить</Button>
        </div>

        <div className="border border-border bg-card p-5">
          <Ctrl label="Форма лица" count={3} value={s.face} onChange={(v) => set('face', v)} />
          <Swatches label="Цвет кожи" colors={SKINS} value={s.skin} onChange={(c) => set('skin', c)} />
          <Ctrl label="Глаза" count={3} value={s.eyes} onChange={(v) => set('eyes', v)} />
          <Ctrl label="Брови" count={3} value={s.brows} onChange={(v) => set('brows', v)} />
          <Ctrl label="Нос" count={3} value={s.nose} onChange={(v) => set('nose', v)} />
          <Ctrl label="Рот" count={3} value={s.mouth} onChange={(v) => set('mouth', v)} />
          <Ctrl label="Причёска" count={4} value={s.hair} onChange={(v) => set('hair', v)} />
          <Ctrl label="Борода" count={3} value={s.beard} onChange={(v) => set('beard', v)} />
          <Swatches label="Цвет волос" colors={HAIR_COLORS} value={s.hairColor} onChange={(c) => set('hairColor', c)} />

          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Имя / приметы</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Неизвестный мужчина, ~30 лет" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Описание</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <Button className="w-full" onClick={save} disabled={saving}>
              <Icon name={saving ? 'Loader' : 'UserSearch'} size={16} className={`mr-2 ${saving ? 'animate-spin' : ''}`} />
              {saving ? 'Сохранение...' : 'Сохранить в розыск'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceComposer;
