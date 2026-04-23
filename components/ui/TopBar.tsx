'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import Icon from './Icon';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/components/auth/AuthProvider';

interface TopBarProps {
  role?: 'tenant' | 'landlord';
}

export default function TopBar({ role = 'tenant' }: TopBarProps) {
  const { user, loading, refresh, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isLandlord = user?.role === 'LANDLORD';

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', borderBottom: '1px solid var(--n-line)', background: 'var(--n-bg)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <Link href="/"><Logo /></Link>
          <nav style={{ display: 'flex', gap: 22, fontSize: 14, color: 'var(--n-muted)' }}>
            <Link href="/search" style={{ color: 'var(--n-ink)', fontWeight: 500 }}>Rent</Link>
            <span style={{ cursor: 'pointer' }}>Verify</span>
            <span style={{ cursor: 'pointer' }}>Inspections</span>
            <span style={{ cursor: 'pointer' }}>How it works</span>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="n-chip" style={{ cursor: 'pointer' }}>
            <Icon name="pin" /> Sialkot
          </span>

          {loading ? (
            <div style={{ width: 80, height: 32, borderRadius: 999, background: 'var(--n-line)', opacity: 0.5 }} />
          ) : user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, border: '1px solid var(--n-line)', background: 'var(--n-surface)', cursor: 'pointer', color: 'var(--n-ink)' }}
              >
                <div style={{ width: 26, height: 26, borderRadius: 999, background: 'var(--n-accent-soft)', color: 'var(--n-accent-ink)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12 }}>
                  {(user.name ?? user.phone)[0].toUpperCase()}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{user.name ?? user.phone}</span>
                <Icon name="chevronDown" className="n-ico" />
              </button>

              {showUserMenu && (
                <div className="n-card" style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, minWidth: 200, padding: 8, zIndex: 200 }}>
                  {isLandlord && (
                    <Link href="/dashboard" onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, color: 'var(--n-ink)', fontSize: 14, fontWeight: 500 }}>
                      <Icon name="home" /> Dashboard
                    </Link>
                  )}
                  <Link href="/list-property" onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, color: 'var(--n-ink)', fontSize: 14 }}>
                    <Icon name="plus" /> List a property
                  </Link>
                  <div className="n-divider" style={{ margin: '6px 0' }} />
                  <button
                    onClick={async () => { await logout(); setShowUserMenu(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, color: 'var(--n-danger)', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}
                  >
                    <Icon name="close" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="n-btn ghost sm" onClick={() => setShowAuth(true)}>Sign in</button>
              {role === 'landlord' || isLandlord ? (
                <Link href="/dashboard" className="n-btn primary sm">Dashboard</Link>
              ) : (
                <Link href="/list-property" className="n-btn primary sm" onClick={(e) => { if (!user) { e.preventDefault(); setShowAuth(true); } }}>
                  List a property
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => { refresh(); setShowAuth(false); }}
        />
      )}
    </>
  );
}
