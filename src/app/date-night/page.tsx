'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Vibe = 'Harbour view' | 'Fine dining' | 'Intimate' | 'Steak/Seafood' | 'Italian' | 'Japanese/French';

type Option = {
  id: string;
  name: string;
  area: string;
  vibes: Vibe[];
  priceHint: string; // keep loose (prices change)
  why: string;
  bookUrl?: string;
  siteUrl?: string;
  mapUrl?: string;
  imageUrl: string;
  notes?: string;
};

const OPTIONS: Option[] = [
  {
    id: 'oborozuki',
    name: 'Oborozuki',
    area: 'Circular Quay (CBD)',
    vibes: ['Harbour view', 'Japanese/French', 'Fine dining'],
    priceHint: 'Approx. $200–$300+ pp (varies by menu & drinks)',
    why: '港景 + 氛围很适合生日约会；日法融合做得很精致。',
    siteUrl: 'https://www.oborozuki.com.au/',
    bookUrl: 'https://www.sevenrooms.com/experiences/oborozuki',
    mapUrl: 'https://maps.app.goo.gl/4Ng8NHWr7fxZKgDs9',
    imageUrl:
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1400&q=80',
    notes: '订位时备注：Birthday + window seat（如果想要景观位）。',
  },
  {
    id: 'aria',
    name: 'Aria Sydney',
    area: 'Circular Quay (CBD)',
    vibes: ['Harbour view', 'Fine dining'],
    priceHint: 'Often $200+ pp (can be higher)',
    why: '悉尼“仪式感”代表，特别适合纪念日/生日。',
    siteUrl: 'https://www.ariasydney.com.au/',
    mapUrl: 'https://maps.app.goo.gl/9Rj5QdS5bA5r1VQf8',
    imageUrl:
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1400&q=80',
    notes: '尽量提前订，备注：birthday / special occasion。',
  },
  {
    id: '6head',
    name: '6HEAD',
    area: 'The Rocks',
    vibes: ['Harbour view', 'Steak/Seafood'],
    priceHint: 'Around $200 pp with good steak/seafood + drinks',
    why: '景观位 + 牛排海鲜稳；不太“端着”，但很适合庆祝。',
    siteUrl: 'https://6head.com.au/',
    mapUrl: 'https://maps.app.goo.gl/ZqPTmB9oXyYhWg8F9',
    imageUrl:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'bentley',
    name: 'Bentley Restaurant + Bar',
    area: 'CBD',
    vibes: ['Fine dining'],
    priceHint: '$150–$250 pp (varies)',
    why: '现代澳餐/酒单强，适合想“吃得讲究”的生日晚餐。',
    siteUrl: 'https://bentleyrestaurant.com.au/',
    mapUrl: 'https://maps.app.goo.gl/Jm91d4p8aWSTa6bB9',
    imageUrl:
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'bluedoor',
    name: 'The Blue Door',
    area: 'Surry Hills',
    vibes: ['Intimate', 'Fine dining'],
    priceHint: '$150–$250 pp (varies)',
    why: '小而精、很私密，非常适合两个人过生日（但位子少）。',
    siteUrl: 'https://thebluedoor.com.au/',
    mapUrl: 'https://maps.app.goo.gl/oq7v9K1y2bWZc4jN7',
    imageUrl:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80',
    notes: '建议尽早订位；备注 birthday。',
  },
  {
    id: 'lana',
    name: 'Lana',
    area: 'CBD',
    vibes: ['Italian'],
    priceHint: '$150–$250 pp (varies)',
    why: '意餐氛围更轻松但高级，约会不紧绷。',
    siteUrl: 'https://lanarestaurant.com.au/',
    mapUrl: 'https://maps.app.goo.gl/wJQFPEfVQmQZ9Yc28',
    imageUrl:
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1400&q=80',
  },
];

const VIBE_FILTERS: Vibe[] = ['Harbour view', 'Fine dining', 'Intimate', 'Steak/Seafood', 'Italian', 'Japanese/French'];

function cx(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}

export default function DateNightPage() {
  const [query, setQuery] = useState('');
  const [area, setArea] = useState<'All' | 'CBD' | 'Circular Quay (CBD)' | 'The Rocks' | 'Surry Hills'>('All');
  const handleAreaChange = (value: string) => {
    const allowed = ['All', 'CBD', 'Circular Quay (CBD)', 'The Rocks', 'Surry Hills'] as const;
    if ((allowed as readonly string[]).includes(value)) setArea(value as (typeof allowed)[number]);
  };
  const [vibes, setVibes] = useState<Record<Vibe, boolean>>(() =>
    Object.fromEntries(VIBE_FILTERS.map((v) => [v, false])) as Record<Vibe, boolean>
  );

  const selectedVibes = useMemo(() => VIBE_FILTERS.filter((v) => vibes[v]), [vibes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return OPTIONS.filter((o) => {
      const areaOk =
        area === 'All'
          ? true
          : area === 'CBD'
            ? o.area.includes('CBD')
            : o.area === area;
      const vibeOk = selectedVibes.length === 0 ? true : selectedVibes.every((v) => o.vibes.includes(v));
      const qOk =
        !q ||
        [o.name, o.area, o.why, o.vibes.join(' ')].some((t) => t.toLowerCase().includes(q));
      return areaOk && vibeOk && qOk;
    });
  }, [query, area, selectedVibes]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold">Sydney Birthday Dinner Shortlist</h1>
          <p className="text-neutral-600">
            21号 · 2人 · 人均约 $200（价格以餐厅当日菜单为准）。
          </p>
        </div>

        <div className="mt-6 grid gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-neutral-200">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1">
              <span className="text-sm font-medium text-neutral-700">关键词</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="例如：harbour / intimate / CBD"
                className="rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-neutral-700">区域</span>
              <select
                value={area}
                onChange={(e) => handleAreaChange(e.target.value)}
                className="rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
              >
                <option value="All">All</option>
                <option value="CBD">CBD (any)</option>
                <option value="Circular Quay (CBD)">Circular Quay</option>
                <option value="The Rocks">The Rocks</option>
                <option value="Surry Hills">Surry Hills</option>
              </select>
            </label>

            <div className="grid gap-1">
              <span className="text-sm font-medium text-neutral-700">氛围筛选（可多选）</span>
              <div className="flex flex-wrap gap-2">
                {VIBE_FILTERS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVibes((prev) => ({ ...prev, [v]: !prev[v] }))}
                    className={cx(
                      'rounded-full border px-3 py-1 text-sm',
                      vibes[v]
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-300 bg-white text-neutral-700'
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-sm text-neutral-600">
            显示 {filtered.length} / {OPTIONS.length} 家
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {filtered.map((o) => (
            <div key={o.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200">
              <div className="relative h-48 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.imageUrl} alt={o.name} className="h-48 w-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">{o.name}</h2>
                    <div className="mt-1 text-sm text-neutral-600">{o.area}</div>
                  </div>
                  <div className="text-right text-sm text-neutral-600">{o.priceHint}</div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {o.vibes.map((v) => (
                    <span key={v} className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
                      {v}
                    </span>
                  ))}
                </div>

                <p className="mt-3 text-neutral-800">{o.why}</p>
                {o.notes && <p className="mt-2 text-sm text-neutral-600">Tips: {o.notes}</p>}

                <div className="mt-4 flex flex-wrap gap-2">
                  {o.bookUrl && (
                    <a
                      className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
                      href={o.bookUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Book
                    </a>
                  )}
                  {o.siteUrl && (
                    <a
                      className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-800"
                      href={o.siteUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Website
                    </a>
                  )}
                  {o.mapUrl && (
                    <a
                      className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-800"
                      href={o.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Map
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-xs text-neutral-500">
          图片为示意图（来自 Unsplash），具体菜品/价格/订位以餐厅官方为准。
        </div>

        <div className="mt-4 text-sm text-neutral-600">
          <Link href="/" className="underline">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
