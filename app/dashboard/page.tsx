'use client';

import Link from 'next/link';
import TopBar from '@/components/ui/TopBar';
import Icon from '@/components/ui/Icon';
import TrustBadge from '@/components/ui/TrustBadge';
import TrustScore from '@/components/ui/TrustScore';
import { PROPERTIES } from '@/lib/data';

const NAV_ITEMS = [
  { k: 'Overview',    ico: 'home' as const,     on: true  },
  { k: 'Listings',    ico: 'file' as const,     badge: '3' },
  { k: 'Messages',   ico: 'chat' as const,     badge: '7' },
  { k: 'Viewings',   ico: 'calendar' as const  },
  { k: 'Inspections', ico: 'stamp' as const    },
  { k: 'Leases',     ico: 'pdf' as const       },
  { k: 'Payouts',    ico: 'bolt' as const      },
  { k: 'Settings',   ico: 'user' as const      },
];

const STATS = [
  { k: 'Active listings',   v: '3',       d: '2 verified · 1 draft' },
  { k: 'This month views',  v: '1,284',   d: '↑ 22% vs March' },
  { k: 'Pending viewings',  v: '4',       d: 'Earliest · Fri 4 pm' },
  { k: 'Projected rent',    v: '₨ 162k',  d: 'From 2 signed leases' },
];

const TODOS = [
  { k: 'Sign lease with Mehwish A.',  d: 'For Cantt · 3-bed',      ico: 'pdf' as const,      accent: true  },
  { k: 'Confirm viewing · Fri 4pm',   d: 'Tenant · Hamza R.',      ico: 'calendar' as const, accent: false },
  { k: 'Upload kitchen photo',        d: 'Listing · Model Town',   ico: 'camera' as const,   accent: false },
];

const CALENDAR_DAYS = ['Thu 24','Fri 25','Sat 26','Sun 27','Mon 28','Tue 29','Wed 30'];
const BUSY_DAYS = [
  { i: 1, label: 'Move-in',  time: '10:00', area: 'Cantt' },
  { i: 3, label: 'General',  time: '14:30', area: 'Model Town' },
  { i: 5, label: 'Move-out', time: '16:00', area: 'Cantt' },
];

const SPARKLINE_VALUES = [22, 18, 30, 24, 38, 34, 46, 42, 52, 48, 60, 58, 66, 74];

function Sparkline() {
  const pts = SPARKLINE_VALUES.map((v, i) => [i * (300 / 13), 80 - v] as [number, number]);
  const d = 'M' + pts.map(p => p.join(',')).join(' L');
  const area = d + ' L300,80 L0,80 Z';
  return (
    <svg viewBox="0 0 300 80" style={{ width: '100%', height: 80 }}>
      <defs>
        <linearGradient id="sp" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--n-accent)" stopOpacity=".35" />
          <stop offset="100%" stopColor="var(--n-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sp)" />
      <path d={d} stroke="var(--n-accent)" strokeWidth="2" fill="none" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 3.5 : 0} fill="var(--n-accent)" />
      ))}
    </svg>
  );
}

export default function DashboardPage() {
  return (
    <div className="n-root">
      <TopBar role="landlord" />

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 65px)' }}>
        {/* Sidebar */}
        <div style={{ padding: '24px 18px', borderRight: '1px solid var(--n-line)', background: 'var(--n-bg-2)' }}>
          <div className="n-mono" style={{ color: 'var(--n-muted)', padding: '0 10px 10px' }}>Landlord</div>
          {NAV_ITEMS.map(it => (
            <div
              key={it.k}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, marginBottom: 2, cursor: 'pointer',
                background: it.on ? 'var(--n-surface)' : 'transparent',
                border: `1px solid ${it.on ? 'var(--n-line)' : 'transparent'}`,
                fontSize: 14,
              }}
            >
              <Icon name={it.ico} />
              <span style={{ flex: 1, fontWeight: it.on ? 500 : 400 }}>{it.k}</span>
              {it.badge && (
                <span className="n-chip" style={{ height: 20, fontSize: 10.5, padding: '0 7px' }}>{it.badge}</span>
              )}
            </div>
          ))}

          <div className="n-card" style={{ marginTop: 24, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <TrustScore value={86} size={44} />
              <div>
                <div className="n-mono" style={{ color: 'var(--n-muted)' }}>Your trust</div>
                <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>Verified landlord</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--n-muted)', marginTop: 10, lineHeight: 1.4 }}>
              Add one more property photo to reach 90+.
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ padding: '28px 32px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div className="n-mono" style={{ color: 'var(--n-muted)' }}>Good afternoon</div>
              <h2 className="n-display" style={{ fontSize: 40, margin: '6px 0 0', letterSpacing: '-0.02em' }}>
                Adeel — three homes, two active leases.
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="n-btn ghost sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="calendar" /> This month
              </button>
              <Link href="/list-property" className="n-btn accent sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="plus" /> New listing
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 24 }}>
            {STATS.map(s => (
              <div key={s.k} className="n-card" style={{ padding: 20 }}>
                <div className="n-mono" style={{ color: 'var(--n-muted)' }}>{s.k}</div>
                <div className="n-display" style={{ fontSize: 40, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 10 }}>{s.v}</div>
                <div style={{ fontSize: 12, color: 'var(--n-muted)', marginTop: 8 }}>{s.d}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginTop: 20 }}>
            {/* Listings table */}
            <div className="n-card" style={{ padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
                <div style={{ fontWeight: 500 }}>Your listings</div>
                <div style={{ display: 'flex', gap: 6, fontSize: 13, color: 'var(--n-muted)' }}>
                  <span className="n-chip">All · 3</span>
                  <span className="n-chip">Active · 2</span>
                  <span className="n-chip">Drafts · 1</span>
                </div>
              </div>
              <div className="n-divider" />
              {PROPERTIES.slice(0, 3).map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderTop: i === 0 ? 'none' : '1px solid var(--n-line)' }}>
                  <div style={{ width: 70, height: 52, borderRadius: 8, background: `url(${p.photos[0]}) center/cover`, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      {p.badges.slice(0, 2).map(b => <TrustBadge key={b} kind={b} size="sm" />)}
                      <span className="n-mono" style={{ color: 'var(--n-muted)' }}>Posted {p.postedDays}d ago</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14 }}><b>{(p.trust * 14).toLocaleString()}</b> <span style={{ color: 'var(--n-muted)', fontSize: 12 }}>views</span></div>
                    <div className="n-mono" style={{ color: 'var(--n-muted)', marginTop: 2 }}>{Math.round(p.trust / 12)} enquiries</div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 90, flexShrink: 0 }}>
                    <div className="n-display" style={{ fontSize: 20 }}>₨ {(p.rent / 1000).toFixed(0)}k</div>
                  </div>
                  <button className="n-btn ghost sm">Manage</button>
                </div>
              ))}
            </div>

            {/* Activity panel */}
            <div style={{ display: 'grid', gap: 12 }}>
              {/* To-do list */}
              <div className="n-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontWeight: 500 }}>To do</div>
                  <span className="n-mono" style={{ color: 'var(--n-muted)' }}>3 items</span>
                </div>
                {TODOS.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--n-line)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: t.accent ? 'var(--n-accent-soft)' : 'var(--n-bg-2)', display: 'grid', placeItems: 'center', color: t.accent ? 'var(--n-accent-ink)' : 'var(--n-ink)', flexShrink: 0 }}>
                      <Icon name={t.ico} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{t.k}</div>
                      <div className="n-mono" style={{ color: 'var(--n-muted)', marginTop: 2 }}>{t.d}</div>
                    </div>
                    <Icon name="chevronRight" />
                  </div>
                ))}
              </div>

              {/* Enquiry sparkline */}
              <div className="n-card" style={{ padding: 20 }}>
                <div style={{ fontWeight: 500, marginBottom: 12 }}>Enquiry pulse · 14 days</div>
                <Sparkline />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <div>
                    <span className="n-display" style={{ fontSize: 24 }}>74</span>
                    {' '}
                    <span className="n-mono" style={{ color: 'var(--n-muted)' }}>enquiries</span>
                  </div>
                  <span className="n-chip verified">↑ 38%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Inspection calendar */}
          <div className="n-card" style={{ marginTop: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 500 }}>Inspection schedule</div>
                <div className="n-mono" style={{ color: 'var(--n-muted)', marginTop: 4 }}>Next 7 days</div>
              </div>
              <button className="n-btn ghost sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="plus" /> Request inspection
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {CALENDAR_DAYS.map((day, i) => {
                const event = BUSY_DAYS.find(b => b.i === i);
                return (
                  <div key={day} style={{ padding: 12, borderRadius: 10, border: '1px solid var(--n-line)', background: event ? 'var(--n-surface-2)' : 'var(--n-surface)', minHeight: 110 }}>
                    <div className="n-mono" style={{ color: 'var(--n-muted)' }}>{day}</div>
                    {event && (
                      <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--n-ink)', color: 'var(--n-bg)', borderRadius: 8, fontSize: 12 }}>
                        <div style={{ fontWeight: 500 }}>{event.label}</div>
                        <div style={{ opacity: .7, marginTop: 3 }}>{event.time} · {event.area}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
