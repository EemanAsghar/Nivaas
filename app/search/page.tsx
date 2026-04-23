'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import TopBar from '@/components/ui/TopBar';
import Icon from '@/components/ui/Icon';
import TrustBadge from '@/components/ui/TrustBadge';
import TrustScore from '@/components/ui/TrustScore';
import type { BadgeKind } from '@/lib/data';

interface ApiListing {
  id: string;
  title: string;
  locality: string;
  city: string;
  rentAmount: number;
  rooms: number;
  bathrooms: number;
  areaMarla: number | null;
  areaSqft: number | null;
  propertyType: string;
  furnishing: string;
  utilities: string[];
  isBoosted: boolean;
  ownerVerified: boolean;
  createdAt: string;
  photos: { url: string; isCover: boolean }[];
  landlord: { id: string; name: string | null; verificationTier: string };
}

const FILTERS = [
  { l: 'Sialkot',        ico: 'pin' as const },
  { l: 'Rent up to ₨70k', ico: 'chevronDown' as const },
  { l: '3+ beds',        ico: 'chevronDown' as const },
  { l: 'House',          ico: 'chevronDown' as const },
  { l: 'NADRA verified', ico: 'shield' as const, on: true, param: 'verified' },
  { l: 'Inspected',      ico: 'stamp' as const,  on: true, param: 'inspected' },
  { l: 'Furnished',      ico: 'chevronDown' as const },
];

function trustScore(l: ApiListing) {
  let score = 60;
  if (l.landlord.verificationTier === 'VERIFIED') score += 20;
  else if (l.landlord.verificationTier === 'STANDARD') score += 10;
  if (l.ownerVerified) score += 10;
  if (l.photos.length >= 3) score += 5;
  if (l.isBoosted) score += 5;
  return Math.min(score, 99);
}

function badges(l: ApiListing): BadgeKind[] {
  const b: BadgeKind[] = [];
  if (l.landlord.verificationTier === 'VERIFIED') b.push('nadra');
  if (l.ownerVerified) b.push('owner');
  if (l.isBoosted) b.push('boost');
  return b;
}

function coverPhoto(l: ApiListing) {
  return l.photos.find(p => p.isCover)?.url ?? l.photos[0]?.url ?? 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&w=800&q=60';
}

function daysAgo(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

export default function SearchPage() {
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/search?city=Sialkot&limit=20');
      const data = await res.json();
      setListings(data.listings ?? []);
      setTotal(data.total ?? 0);
      if (data.listings?.length > 0) setSel(data.listings[0].id);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const selectedProp = listings.find(l => l.id === sel) ?? listings[0];

  return (
    <div className="n-root">
      <TopBar />

      {/* Filter bar */}
      <div style={{ padding: '18px 40px', borderBottom: '1px solid var(--n-line)', background: 'var(--n-bg-2)', position: 'sticky', top: 65, zIndex: 90 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div className="n-card" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10, minWidth: 320, borderRadius: 999 }}>
            <Icon name="search" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search city, locality or type…"
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14, background: 'transparent', color: 'var(--n-ink)', fontFamily: 'inherit' }}
            />
            <span className="n-kbd">⌘K</span>
          </div>
          {FILTERS.map(f => (
            <span key={f.l} className={`n-chip${f.on ? ' verified' : ''}`} style={{ height: 36, padding: '0 14px', fontSize: 13, cursor: 'pointer' }}>
              <Icon name={f.ico} /> {f.l}
            </span>
          ))}
          <button className="n-btn ghost sm" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="filter" /> All filters
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', minHeight: 'calc(100vh - 130px)' }}>
        {/* Left — listing cards */}
        <div style={{ padding: '24px 40px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em', display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span className="n-display" style={{ fontSize: 28 }}>{total}</span> homes
              </div>
              <div className="n-mono" style={{ color: 'var(--n-muted)', marginTop: 4 }}>
                {loading ? 'Loading…' : 'Sorted by Trust score, newest first'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="n-chip" style={{ cursor: 'pointer' }}>Sort · Trust score <Icon name="chevronDown" /></span>
            </div>
          </div>

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', color: 'var(--n-muted)' }}>
              <span className="n-mono">Loading listings…</span>
            </div>
          )}

          {!loading && listings.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--n-muted)' }}>
              <Icon name="home" className="n-ico xl" />
              <div style={{ marginTop: 12 }} className="n-mono">No listings yet. Be the first to list!</div>
            </div>
          )}

          {listings.map(p => (
            <div
              key={p.id}
              onClick={() => setSel(p.id)}
              className="n-card"
              style={{
                display: 'grid', gridTemplateColumns: '220px 1fr auto', gap: 18, padding: 14, marginBottom: 12, cursor: 'pointer',
                border: sel === p.id ? '1px solid var(--n-ink)' : '1px solid var(--n-line)',
                boxShadow: sel === p.id ? '0 0 0 3px var(--n-bg-2), 0 30px 60px -40px rgba(0,0,0,.3)' : 'var(--n-shadow)',
                transition: 'all .15s',
              }}
            >
              <div style={{ height: 160, borderRadius: 10, background: `url(${coverPhoto(p)}) center/cover`, position: 'relative', flexShrink: 0 }}>
                {p.isBoosted && (
                  <span className="n-chip dark" style={{ position: 'absolute', top: 8, left: 8, fontSize: 11 }}>
                    <Icon name="zap" /> Boosted
                  </span>
                )}
              </div>
              <div style={{ padding: '4px 0', minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {badges(p).map(b => <TrustBadge key={b} kind={b} size="sm" />)}
                </div>
                <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>{p.title}</div>
                <div style={{ fontSize: 13, color: 'var(--n-muted)', marginTop: 4 }}>{p.locality} · {p.propertyType} · {p.furnishing}</div>
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14, color: 'var(--n-muted)', fontSize: 13 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="bed" /> {p.rooms} bed</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="bath" /> {p.bathrooms} bath</span>
                  {p.areaMarla && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="square" /> {p.areaMarla} marla</span>}
                  {p.areaSqft && !p.areaMarla && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="square" /> {p.areaSqft} sqft</span>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', minWidth: 150, padding: '4px 8px 4px 0' }}>
                <TrustScore value={trustScore(p)} size={52} />
                <div style={{ textAlign: 'right' }}>
                  <div className="n-display" style={{ fontSize: 26 }}>₨ {p.rentAmount.toLocaleString()}</div>
                  <div className="n-mono" style={{ color: 'var(--n-muted)' }}>/month · {daysAgo(p.createdAt)}d ago</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right — stylised map */}
        <div style={{ position: 'sticky', top: 130, height: 'calc(100vh - 130px)', background: 'var(--n-bg-2)', borderLeft: '1px solid var(--n-line)', padding: 16 }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--n-line)', background: 'var(--n-surface-2)' }}>
            <svg viewBox="0 0 600 800" style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M40 0H0V40" fill="none" stroke="var(--n-line)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="600" height="800" fill="var(--n-surface-2)" />
              <rect width="600" height="800" fill="url(#grid)" />
              <path d="M-20 220 C 120 180 260 260 400 200 S 620 260 640 230" stroke="var(--n-line-2)" strokeWidth="18" fill="none" opacity=".6" />
              <path d="M80 -20 C 100 200 220 380 180 600 S 140 820 160 840" stroke="var(--n-line-2)" strokeWidth="14" fill="none" opacity=".5" />
              <path d="M-20 520 C 160 480 320 560 480 500 S 620 560 640 540" stroke="var(--n-line-2)" strokeWidth="14" fill="none" opacity=".5" />
              {([[60,260,120,100],[220,300,140,90],[430,260,120,110],[60,580,150,100],[250,600,130,110],[440,610,110,90]] as number[][]).map((b, i) => (
                <rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} fill="var(--n-line)" opacity=".35" rx="6" />
              ))}
            </svg>

            {/* Dynamic price pins */}
            {listings.slice(0, 6).map((p, i) => {
              const positions = [[42,36],[65,55],[28,62],[72,30],[48,75],[20,42]];
              const pos = positions[i] ?? [50, 50];
              return (
                <button
                  key={p.id}
                  onClick={() => setSel(p.id)}
                  style={{
                    position: 'absolute', left: `${pos[0]}%`, top: `${pos[1]}%`, transform: 'translate(-50%, -100%)',
                    border: `1px solid ${sel === p.id ? 'var(--n-ink)' : 'var(--n-line)'}`,
                    cursor: 'pointer', padding: '6px 12px', borderRadius: 999,
                    background: sel === p.id ? 'var(--n-ink)' : 'var(--n-surface)',
                    color: sel === p.id ? 'var(--n-bg)' : 'var(--n-ink)',
                    fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
                    boxShadow: sel === p.id ? '0 10px 30px rgba(0,0,0,.3)' : '0 4px 14px rgba(0,0,0,.12)',
                    transition: 'all .15s',
                  }}
                >
                  ₨{Math.round(p.rentAmount / 1000)}k
                </button>
              );
            })}

            <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button className="n-btn ghost sm" style={{ width: 36, height: 36, padding: 0, borderRadius: 10, justifyContent: 'center' }}><Icon name="plus" /></button>
              <button className="n-btn ghost sm" style={{ width: 36, height: 36, padding: 0, borderRadius: 10, justifyContent: 'center', fontWeight: 700 }}>−</button>
            </div>
            <div className="n-chip" style={{ position: 'absolute', top: 12, left: 12, background: 'var(--n-surface)' }}>
              <Icon name="map" /> {listings.length} listings
            </div>

            {/* Floating card */}
            {selectedProp && (
              <div className="n-card" style={{ position: 'absolute', bottom: 16, left: 16, right: 16, padding: 12, display: 'grid', gridTemplateColumns: '110px 1fr auto', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 110, height: 80, borderRadius: 10, background: `url(${coverPhoto(selectedProp)}) center/cover` }} />
                <div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    {badges(selectedProp).slice(0, 2).map(b => <TrustBadge key={b} kind={b} size="sm" />)}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{selectedProp.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--n-muted)', marginTop: 3 }}>{selectedProp.locality}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="n-display" style={{ fontSize: 22 }}>₨ {selectedProp.rentAmount.toLocaleString()}</div>
                  <Link href={`/property/${selectedProp.id}`} className="n-btn sm primary" style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    View <Icon name="arrow" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
