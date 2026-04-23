'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TopBar from '@/components/ui/TopBar';
import Logo from '@/components/ui/Logo';
import Icon from '@/components/ui/Icon';
import TrustBadge from '@/components/ui/TrustBadge';
import TrustScore from '@/components/ui/TrustScore';
import { CITIES } from '@/lib/data';

type ApiListing = {
  id: string;
  title: string;
  locality: string;
  city: string;
  rentAmount: number;
  rooms: number;
  bathrooms: number;
  areaMarla?: number;
  areaSqft?: number;
  ownerVerified: boolean;
  isBoosted: boolean;
  createdAt: string;
  photos: { url: string; isCover: boolean }[];
  landlord: { name: string; verificationTier: string };
};

function trustScore(l: ApiListing) {
  let s = 40;
  if (l.landlord.verificationTier === 'VERIFIED') s += 25;
  else if (l.landlord.verificationTier === 'STANDARD') s += 10;
  if (l.ownerVerified) s += 20;
  if (l.photos.length > 0) s += 10;
  return Math.min(s, 95);
}

function badgesFor(l: ApiListing): string[] {
  const b: string[] = [];
  if (l.landlord.verificationTier === 'VERIFIED') b.push('nadra');
  if (l.ownerVerified) b.push('owner');
  if (l.isBoosted) b.push('boost');
  return b;
}

function daysSince(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

function areaStr(l: ApiListing) {
  if (l.areaMarla) return `${l.areaMarla} marla`;
  if (l.areaSqft) return `${l.areaSqft.toLocaleString()} sqft`;
  return '—';
}

export default function Home() {
  const [activeCity, setActiveCity] = useState('Sialkot');
  const [featured, setFeatured] = useState<ApiListing[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    setFeaturedLoading(true);
    fetch(`/api/listings?city=${encodeURIComponent(activeCity)}&limit=3`)
      .then(r => r.json())
      .then(d => setFeatured(d.listings ?? []))
      .catch(() => setFeatured([]))
      .finally(() => setFeaturedLoading(false));
  }, [activeCity]);

  return (
    <div className="n-root">
      <TopBar />

      {/* Hero */}
      <div style={{ padding: '56px 40px 32px', display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 48, alignItems: 'end' }}>
        <div>
          <span className="n-mono" style={{ color: 'var(--n-muted)' }}>A rental marketplace for Punjab · Est. 2026</span>
          <h1 className="n-display" style={{ fontSize: 'clamp(52px, 6.5vw, 92px)', lineHeight: 0.95, letterSpacing: '-0.025em', margin: '18px 0 20px' }}>
            Rentals you can{' '}
            <em style={{ color: 'var(--n-accent)' }}>actually trust</em>,<br />
            in the cities you <em>actually live in</em>.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.5, color: 'var(--n-muted)', maxWidth: 620, margin: 0 }}>
            Every listing comes NADRA-verified, owner-confirmed, and — if you want — professionally inspected.
            Built first for Sialkot, Gujranwala, Sargodha, Narowal, Nankana Sahib and Hafizabad.
          </p>
        </div>

        <div className="n-card" style={{ padding: 24, display: 'grid', gridTemplateColumns: '64px 1fr', gap: 20, alignItems: 'center' }}>
          <TrustScore value={92} />
          <div>
            <div className="n-mono" style={{ color: 'var(--n-muted)', marginBottom: 6 }}>The Nivaas Trust Score</div>
            <div style={{ fontSize: 15, lineHeight: 1.45 }}>
              Every listing is scored across identity, ownership, photos, and utility inspection — so you know what you&apos;re walking into before the viewing.
            </div>
          </div>
        </div>
      </div>

      {/* Mega search bar */}
      <div style={{ padding: '0 40px 28px' }}>
        <div className="n-card" style={{ padding: 10, display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr auto', gap: 2, alignItems: 'stretch', borderRadius: 20 }}>
          {([
            { label: 'City',     value: activeCity,          hint: 'Punjab · Tier 2/3' },
            { label: 'Locality', value: 'Any area',          hint: 'Neighbourhood' },
            { label: 'Rent',     value: 'Up to PKR 80,000',  hint: 'Monthly' },
            { label: 'Bedrooms', value: '2+',                hint: 'Rooms' },
          ] as const).map((f, i) => (
            <div key={i} style={{ padding: '12px 18px', borderRight: i < 3 ? '1px solid var(--n-line)' : 'none', cursor: 'pointer' }}>
              <div className="n-mono" style={{ color: 'var(--n-muted)', fontSize: 9.5 }}>{f.label}</div>
              <div style={{ fontSize: 15, fontWeight: 500, marginTop: 4 }}>{f.value}</div>
              <div style={{ fontSize: 11, color: 'var(--n-muted-2)', marginTop: 2 }}>{f.hint}</div>
            </div>
          ))}
          <Link href={`/search?city=${encodeURIComponent(activeCity)}`} className="n-btn accent" style={{ height: 'auto', padding: '0 28px', borderRadius: 14, margin: 2, justifyContent: 'center' }}>
            <Icon name="search" /> Find homes
          </Link>
        </div>

        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className="n-mono" style={{ color: 'var(--n-muted)', marginRight: 4 }}>Quick filters</span>
          {[
            { label: 'NADRA-verified only', q: '?verifiedOnly=true' },
            { label: 'Furnished', q: '?furnishing=Furnished' },
            { label: 'Under ₨30,000', q: '?maxRent=30000' },
            { label: 'Family homes', q: '?type=House' },
            { label: 'Studios', q: '?type=Studio' },
          ].map(t => (
            <Link key={t.label} href={`/search${t.q}`} className="n-chip" style={{ cursor: 'pointer' }}>{t.label}</Link>
          ))}
        </div>
      </div>

      {/* City picker */}
      <div style={{ padding: '40px 40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div className="n-mono" style={{ color: 'var(--n-muted)' }}>01 · Live in</div>
            <h2 className="n-display" style={{ fontSize: 40, margin: '4px 0 0', letterSpacing: '-0.02em' }}>Six cities, fully covered.</h2>
          </div>
          <Link href="/search" style={{ fontSize: 14, color: 'var(--n-muted)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            All cities <Icon name="arrow" />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {CITIES.map(c => {
            const active = activeCity === c.name;
            return (
              <div
                key={c.name}
                onClick={() => setActiveCity(c.name)}
                className="n-card"
                style={{
                  padding: 0, cursor: 'pointer', overflow: 'hidden',
                  border: active ? '1px solid var(--n-ink)' : '1px solid var(--n-line)',
                  boxShadow: active ? '0 0 0 3px var(--n-bg-2), 0 20px 50px -30px rgba(0,0,0,.3)' : 'var(--n-shadow)',
                  transition: 'all .2s',
                }}
              >
                <div style={{ height: 112, background: `url(${c.hero}) center/cover`, position: 'relative' }}>
                  <span className="n-chip" style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(21,18,14,0.7)', color: '#f6f3ee', border: 'none', backdropFilter: 'blur(6px)' }}>
                    Tier {c.tier}
                  </span>
                </div>
                <div style={{ padding: '12px 14px 14px' }}>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{c.name}</div>
                  <div className="n-mono" style={{ color: 'var(--n-muted)', marginTop: 4 }}>{c.listings.toLocaleString()} listings</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Three pillars */}
      <div style={{ padding: '32px 40px 48px' }}>
        <div style={{ marginBottom: 18 }}>
          <div className="n-mono" style={{ color: 'var(--n-muted)' }}>02 · What makes it different</div>
          <h2 className="n-display" style={{ fontSize: 40, margin: '4px 0 0', letterSpacing: '-0.02em' }}>Three checks before you move in.</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {([
            { n: '01', icon: 'shield' as const, title: 'Identity, verified by NADRA',
              body: 'Every landlord and tenant is matched against the national registry. Standard and Verified tiers are shown on every profile.',
              stat: '3-tier', statLabel: 'verification ladder' },
            { n: '02', icon: 'stamp' as const, title: 'Ownership, confirmed',
              body: 'Admin-reviewed ownership docs — Fard, registry, allotment letter — before any listing goes live. Approved within 48h.',
              stat: '< 48h', statLabel: 'review window' },
            { n: '03', icon: 'check' as const, title: 'Utilities, inspected in person',
              body: 'A local Nivaas inspector visits, tests gas, electrical, plumbing, structural. You get a timestamped PDF report you can save offline.',
              stat: '4', statLabel: 'utility categories' },
          ]).map(p => (
            <div key={p.n} className="n-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16, minHeight: 280 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="n-mono" style={{ color: 'var(--n-muted)' }}>{p.n}</span>
                <Icon name={p.icon} className="n-ico xl" />
              </div>
              <h3 className="n-display" style={{ fontSize: 28, lineHeight: 1.1, margin: 0, letterSpacing: '-0.01em' }}>{p.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--n-muted)', margin: 0 }}>{p.body}</p>
              <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--n-line)', display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span className="n-display" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>{p.stat}</span>
                <span className="n-mono" style={{ color: 'var(--n-muted)' }}>{p.statLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured strip */}
      <div style={{ padding: '24px 40px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div className="n-mono" style={{ color: 'var(--n-muted)' }}>03 · Freshly verified in {activeCity}</div>
            <h2 className="n-display" style={{ fontSize: 40, margin: '4px 0 0', letterSpacing: '-0.02em' }}>New this week.</h2>
          </div>
          <Link href={`/search?city=${encodeURIComponent(activeCity)}`} className="n-btn ghost sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            View all <Icon name="arrow" />
          </Link>
        </div>

        {featuredLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[0, 1, 2].map(i => (
              <div key={i} className="n-card" style={{ height: 360, opacity: 0.4 }} />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="n-card" style={{ padding: 48, textAlign: 'center' }}>
            <Icon name="home" className="n-ico xl" style={{ color: 'var(--n-muted)', margin: '0 auto 12px' }} />
            <div style={{ color: 'var(--n-muted)', marginBottom: 16 }}>No listings in {activeCity} yet — be the first.</div>
            <Link href="/list-property" className="n-btn primary sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="plus" /> List a property
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {featured.map(p => (
              <Link key={p.id} href={`/property/${p.id}`} className="n-card" style={{ overflow: 'hidden', padding: 0, display: 'block', textDecoration: 'none' }}>
                <div style={{ position: 'relative', height: 220, background: p.photos[0] ? `url(${p.photos[0].url}) center/cover` : 'var(--n-surface-2)' }}>
                  {!p.photos[0] && (
                    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                      <Icon name="camera" className="n-ico xl" style={{ color: 'var(--n-muted)' }} />
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
                    {badgesFor(p).includes('nadra') && <TrustBadge kind="nadra" size="sm" />}
                  </div>
                  <button
                    onClick={e => e.preventDefault()}
                    style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
                  >
                    <Icon name="heart" />
                  </button>
                </div>
                <div style={{ padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em' }}>{p.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--n-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="pin" style={{ width: 12, height: 12 }} className="n-ico" />{p.locality}
                      </div>
                    </div>
                    <TrustScore value={trustScore(p)} size={44} />
                  </div>
                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14, color: 'var(--n-muted)', fontSize: 13 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="bed" /> {p.rooms}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="bath" /> {p.bathrooms}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="square" /> {areaStr(p)}</span>
                  </div>
                  <div className="n-divider" style={{ margin: '14px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span className="n-display" style={{ fontSize: 26 }}>₨ {p.rentAmount.toLocaleString()}</span>
                      <span style={{ color: 'var(--n-muted)', fontSize: 13, marginLeft: 4 }}>/mo</span>
                    </div>
                    <span className="n-mono" style={{ color: 'var(--n-muted)' }}>{daysSince(p.createdAt)}d ago</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '32px 40px', borderTop: '1px solid var(--n-line)', color: 'var(--n-muted)', fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Logo size={16} />
          <span>© 2026 Nivaas · An Abstrak Digital product</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <span style={{ cursor: 'pointer' }}>Terms</span>
          <span style={{ cursor: 'pointer' }}>Privacy</span>
          <span style={{ cursor: 'pointer' }}>Help</span>
        </div>
      </div>
    </div>
  );
}
