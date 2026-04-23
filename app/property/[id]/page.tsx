'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopBar from '@/components/ui/TopBar';
import Icon from '@/components/ui/Icon';
import TrustBadge from '@/components/ui/TrustBadge';
import TrustScore from '@/components/ui/TrustScore';
import { useAuth } from '@/components/auth/AuthProvider';

type ChecklistItem = {
  id: string;
  category: string;
  status: 'PASS' | 'FAIL' | 'FLAG';
  notes?: string;
};

type Inspection = {
  id: string;
  completedAt: string;
  checklistItems: ChecklistItem[];
};

type Listing = {
  id: string;
  title: string;
  description?: string;
  city: string;
  locality: string;
  propertyType: string;
  rentAmount: number;
  rooms: number;
  bathrooms: number;
  areaMarla?: number;
  areaSqft?: number;
  furnishing: string;
  utilities: string[];
  ownerVerified: boolean;
  isBoosted: boolean;
  createdAt: string;
  photos: { id: string; url: string; isCover: boolean; order: number }[];
  landlord: { id: string; name?: string; verificationTier: string; photoUrl?: string; createdAt: string };
  inspections: Inspection[];
};

function computeTrust(l: Listing) {
  let s = 40;
  if (l.landlord.verificationTier === 'VERIFIED') s += 25;
  else if (l.landlord.verificationTier === 'STANDARD') s += 10;
  if (l.ownerVerified) s += 20;
  if (l.inspections.length > 0) s += 10;
  if (l.photos.length >= 3) s += 5;
  return Math.min(s, 95);
}

function areaStr(l: Listing) {
  if (l.areaMarla) return `${l.areaMarla} marla`;
  if (l.areaSqft) return `${l.areaSqft.toLocaleString()} sqft`;
  return '—';
}

function inspIcon(category: string) {
  if (category.toLowerCase().includes('gas')) return 'gas' as const;
  if (category.toLowerCase().includes('water')) return 'drop' as const;
  if (category.toLowerCase().includes('elect')) return 'bolt' as const;
  return 'home' as const;
}

export default function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [msgModal, setMsgModal] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const [msgError, setMsgError] = useState('');

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/listings/${id}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(d => { if (d) setListing(d.listing); })
      .finally(() => setLoading(false));
  }, [id]);

  async function sendMessage() {
    if (!user) { setMsgError('Please sign in to message the landlord.'); return; }
    if (!msgText.trim()) return;
    setSending(true);
    setMsgError('');
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: id, message: msgText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setMsgError(data.error ?? 'Failed to send'); return; }
      router.push(`/messages/${data.conversationId}`);
    } finally {
      setSending(false);
    }
  }

  async function toggleSave() {
    if (!user) return;
    const method = saved ? 'DELETE' : 'POST';
    await fetch(`/api/listings/${id}/save`, { method });
    setSaved(s => !s);
  }

  if (loading) {
    return (
      <div className="n-root">
        <TopBar />
        <div style={{ display: 'grid', placeItems: 'center', height: '60vh', color: 'var(--n-muted)' }}>
          <span className="n-mono">Loading…</span>
        </div>
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="n-root">
        <TopBar />
        <div style={{ display: 'grid', placeItems: 'center', height: '60vh', textAlign: 'center' }}>
          <div>
            <div className="n-display" style={{ fontSize: 48, color: 'var(--n-muted)' }}>404</div>
            <div style={{ color: 'var(--n-muted)', marginTop: 8, marginBottom: 24 }}>This listing doesn&apos;t exist or was removed.</div>
            <Link href="/search" className="n-btn primary sm">Browse listings</Link>
          </div>
        </div>
      </div>
    );
  }

  const p = listing;
  const trust = computeTrust(p);
  const inspection = p.inspections[0];
  const photos = p.photos.sort((a, b) => a.order - b.order);
  const postedDays = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / 86400000);
  const landlordSince = new Date(p.landlord.createdAt).getFullYear();
  const landlordName = p.landlord.name ?? 'Anonymous';

  return (
    <div className="n-root">
      <TopBar />

      {/* Breadcrumb */}
      <div style={{ padding: '16px 40px 0', color: 'var(--n-muted)', fontSize: 13 }}>
        <Link href="/search" style={{ color: 'var(--n-muted)' }}>Rent</Link>
        {' · '}{p.city}{' · '}{p.locality.split(',')[0]}
        {' · '}<span style={{ color: 'var(--n-ink)' }}>{p.title}</span>
      </div>

      {/* Gallery */}
      <div style={{ padding: '18px 40px 0', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '220px 220px', gap: 8, height: 448 }}>
        <div style={{ gridRow: '1 / span 2', borderRadius: 14, background: photos[0] ? `url(${photos[0].url}) center/cover` : 'var(--n-surface-2)', position: 'relative' }}>
          {!photos[0] && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--n-muted)' }}><Icon name="camera" className="n-ico xl" /></div>}
          <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6 }}>
            {p.landlord.verificationTier === 'VERIFIED' && <TrustBadge kind="nadra" />}
            {inspection && <TrustBadge kind="inspected" />}
            {p.isBoosted && <TrustBadge kind="boost" />}
          </div>
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ borderRadius: 14, background: photos[i] ? `url(${photos[i].url}) center/cover` : 'var(--n-surface-2)', position: 'relative' }}>
            {i === 4 && photos.length > 5 && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(21,18,14,0.55)', borderRadius: 14, display: 'grid', placeItems: 'center', color: '#f6f3ee', fontWeight: 500 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="camera" /> +{photos.length - 4} photos</span>
              </div>
            )}
            {!photos[i] && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--n-muted)' }}><Icon name="camera" /></div>}
          </div>
        ))}
      </div>

      {/* Main body */}
      <div style={{ padding: '32px 40px 56px', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 40 }}>
        {/* Left */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="n-mono" style={{ color: 'var(--n-muted)' }}>{p.propertyType} · {areaStr(p)} · Posted {postedDays} days ago</div>
              <h1 className="n-display" style={{ fontSize: 'clamp(36px, 4vw, 56px)', lineHeight: 1.0, letterSpacing: '-0.02em', margin: '8px 0 10px', maxWidth: 620 }}>{p.title}</h1>
              <div style={{ color: 'var(--n-muted)', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="pin" /> {p.locality}, {p.city}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={toggleSave} className="n-btn ghost sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="heart" style={{ color: saved ? 'var(--n-accent)' : undefined }} /> {saved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 22, marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--n-line)', borderBottom: '1px solid var(--n-line)', paddingBottom: 24 }}>
            {([
              { k: 'Bedrooms',   v: String(p.rooms),      ico: 'bed' as const },
              { k: 'Bathrooms',  v: String(p.bathrooms),  ico: 'bath' as const },
              { k: 'Area',       v: areaStr(p),           ico: 'square' as const },
              { k: 'Furnishing', v: p.furnishing,         ico: 'home' as const },
              { k: 'Utilities',  v: p.utilities.join(' · '), ico: 'bolt' as const },
            ]).map(s => (
              <div key={s.k} style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--n-muted)' }}>
                  <Icon name={s.ico} />
                  <span className="n-mono">{s.k}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 500, marginTop: 6 }}>{s.v || '—'}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          {p.description && (
            <div style={{ marginTop: 28 }}>
              <h3 className="n-display" style={{ fontSize: 26, margin: '0 0 10px' }}>About this home</h3>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--n-ink-2)', margin: 0, maxWidth: 680 }}>{p.description}</p>
            </div>
          )}

          {/* Inspection report */}
          {inspection && (
            <div className="n-card" style={{ marginTop: 32, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', background: 'var(--n-ink)', color: 'var(--n-bg)', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 18, alignItems: 'center' }}>
                <Icon name="stamp" className="n-ico xl" />
                <div>
                  <div className="n-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>Nivaas Inspection Report</div>
                  <div className="n-display" style={{ fontSize: 22, marginTop: 2 }}>
                    Utility check — {inspection.checklistItems.filter(i => i.status === 'PASS').length} of {inspection.checklistItems.length} categories pass
                  </div>
                </div>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ color: 'var(--n-muted)', fontSize: 13, marginBottom: 18 }}>
                  Completed {new Date(inspection.completedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                  {inspection.checklistItems.map((it, i) => {
                    const pass = it.status === 'PASS';
                    return (
                      <div key={it.id} style={{ padding: '16px 18px', borderTop: '1px solid var(--n-line)', borderLeft: i % 2 === 1 ? '1px solid var(--n-line)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Icon name={inspIcon(it.category)} className="n-ico lg" />
                            <span style={{ fontSize: 15, fontWeight: 500 }}>{it.category}</span>
                          </div>
                          <span
                            className="n-chip"
                            style={{
                              background: pass ? 'var(--n-accent-soft)' : 'color-mix(in oklab, var(--n-warn) 22%, transparent)',
                              color: pass ? 'var(--n-accent-ink)' : 'var(--n-warn)',
                              borderColor: 'transparent',
                            }}
                          >
                            {pass ? '✓ Pass' : it.status === 'FLAG' ? '◆ Flagged' : '✗ Fail'}
                          </span>
                        </div>
                        {it.notes && <div style={{ fontSize: 13, color: 'var(--n-muted)', marginTop: 8, paddingLeft: 26 }}>{it.notes}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Location map placeholder */}
          <div style={{ marginTop: 32 }}>
            <h3 className="n-display" style={{ fontSize: 26, margin: '0 0 12px' }}>In the neighbourhood</h3>
            <div className="n-card" style={{ height: 260, padding: 0, overflow: 'hidden', position: 'relative' }}>
              <svg viewBox="0 0 800 260" style={{ width: '100%', height: '100%' }}>
                <rect width="800" height="260" fill="var(--n-surface-2)" />
                <path d="M-20 140 C 180 100 380 180 580 120 S 820 160 820 140" stroke="var(--n-line-2)" strokeWidth="14" fill="none" opacity=".6" />
                <path d="M240 -20 C 260 80 320 160 280 260" stroke="var(--n-line-2)" strokeWidth="10" fill="none" opacity=".5" />
                <rect x="80" y="60" width="120" height="70" fill="var(--n-line)" opacity=".35" rx="6" />
                <rect x="420" y="40" width="140" height="80" fill="var(--n-line)" opacity=".35" rx="6" />
                <rect x="560" y="160" width="160" height="70" fill="var(--n-line)" opacity=".35" rx="6" />
              </svg>
              <div style={{ position: 'absolute', left: '46%', top: '44%', transform: 'translate(-50%, -100%)' }}>
                <div style={{ background: 'var(--n-ink)', color: 'var(--n-bg)', padding: '6px 12px', borderRadius: 999, fontWeight: 600, fontSize: 13 }}>
                  {p.locality}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div>
          <div className="n-card" style={{ padding: 24, position: 'sticky', top: 80 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="n-mono" style={{ color: 'var(--n-muted)' }}>Monthly rent</div>
                <div className="n-display" style={{ fontSize: 44, letterSpacing: '-0.02em', lineHeight: 1 }}>₨ {p.rentAmount.toLocaleString()}</div>
                <div style={{ fontSize: 13, color: 'var(--n-muted)', marginTop: 4 }}>Security deposit · ₨ {(p.rentAmount * 2).toLocaleString()} (2 months)</div>
              </div>
              <TrustScore value={trust} size={72} />
            </div>

            <div className="n-divider" style={{ margin: '20px 0' }} />

            {/* Trust breakdown */}
            <div className="n-mono" style={{ color: 'var(--n-muted)', marginBottom: 10 }}>Trust breakdown</div>
            {([
              { k: 'Identity · NADRA matched',  v: p.landlord.verificationTier === 'VERIFIED' ? 100 : p.landlord.verificationTier === 'STANDARD' ? 50 : 0 },
              { k: 'Ownership docs reviewed',   v: p.ownerVerified ? 100 : 0 },
              { k: 'Utility inspection',        v: inspection ? 88 : 0 },
              { k: 'Photos authenticated',      v: p.photos.length >= 3 ? 92 : p.photos.length > 0 ? 60 : 0 },
            ]).map(b => (
              <div key={b.k} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="check" /> {b.k}</span>
                  <span style={{ color: 'var(--n-muted)' }}>{b.v}</span>
                </div>
                <div style={{ height: 4, background: 'var(--n-line)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${b.v}%`, height: '100%', background: 'var(--n-accent)', transition: 'width .3s' }} />
                </div>
              </div>
            ))}

            <div className="n-divider" style={{ margin: '20px 0' }} />

            {/* Landlord */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 999, background: 'var(--n-bg-2)', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 18, flexShrink: 0 }}>
                {landlordName[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{landlordName}</span>
                  {p.landlord.verificationTier === 'VERIFIED' && <Icon name="shield" className="n-ico" style={{ color: 'var(--n-accent)' }} />}
                </div>
                <div className="n-mono" style={{ color: 'var(--n-muted)', marginTop: 2 }}>
                  Landlord · {p.landlord.verificationTier} · Since {landlordSince}
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'grid', gap: 8, marginTop: 20 }}>
              <button onClick={() => setMsgModal(true)} className="n-btn accent" style={{ height: 48, justifyContent: 'center', fontSize: 15 }}>
                <Icon name="chat" /> Message landlord
              </button>
              <button className="n-btn primary" style={{ height: 44, justifyContent: 'center' }}>
                <Icon name="calendar" /> Request viewing
              </button>
              <button className="n-btn ghost" style={{ height: 44, justifyContent: 'center' }}>
                <Icon name="stamp" /> Request inspection · ₨ 1,800
              </button>
            </div>

            <div className="n-mono" style={{ color: 'var(--n-muted-2)', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
              Inspections are optional · Paid via JazzCash / EasyPaisa
            </div>
          </div>
        </div>
      </div>

      {/* Message modal */}
      {msgModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setMsgModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
          <div className="n-card" style={{ position: 'relative', width: 480, padding: 32, zIndex: 1 }}>
            <button onClick={() => setMsgModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--n-muted)' }}>
              <Icon name="close" className="n-ico lg" />
            </button>
            <div className="n-mono" style={{ color: 'var(--n-muted)', marginBottom: 6 }}>Contact landlord</div>
            <h2 className="n-display" style={{ fontSize: 28, margin: '0 0 20px' }}>Send a message</h2>
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--n-surface-2)', marginBottom: 14, fontSize: 13, color: 'var(--n-muted)' }}>
              Re: {p.title}
            </div>
            {!user && (
              <div style={{ padding: 14, borderRadius: 10, background: 'color-mix(in oklab, var(--n-warn) 15%, transparent)', color: 'var(--n-warn)', fontSize: 13, marginBottom: 14 }}>
                You need to sign in before messaging a landlord.
              </div>
            )}
            <textarea
              value={msgText}
              onChange={e => setMsgText(e.target.value)}
              placeholder="Hi, I'm interested in this property. Is it still available?"
              rows={4}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--n-line)', background: 'var(--n-surface-2)', color: 'var(--n-ink)', fontFamily: 'inherit', fontSize: 15, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
            {msgError && <div style={{ color: 'var(--n-danger)', fontSize: 13, marginTop: 8 }}>{msgError}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={() => setMsgModal(false)} className="n-btn ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button
                onClick={sendMessage}
                disabled={!msgText.trim() || sending || !user}
                className="n-btn accent"
                style={{ flex: 2, justifyContent: 'center' }}
              >
                {sending ? 'Sending…' : <><Icon name="chat" /> Send message</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
