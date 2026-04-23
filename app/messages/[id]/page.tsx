'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopBar from '@/components/ui/TopBar';
import Icon from '@/components/ui/Icon';
import { useAuth } from '@/components/auth/AuthProvider';

type Message = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  sender: { id: string; name?: string; phone: string };
};

type ConvDetail = {
  id: string;
  listing: { id: string; title: string; city: string; rentAmount: number };
  participants: { user: { id: string; name?: string; phone: string } }[];
};

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: string) {
  const d = new Date(date);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
}

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [conv, setConv] = useState<ConvDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgInput, setMsgInput] = useState('');
  const [sending, setSending] = useState(false);

  async function fetchMessages() {
    const res = await fetch(`/api/conversations/${id}/messages`);
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data.messages ?? []);
    if (!conv) setConv(data.conversation ?? null);
  }

  useEffect(() => {
    if (!user && !authLoading) { router.push('/'); return; }
    if (!user) return;
    setLoading(true);
    fetchMessages().finally(() => setLoading(false));
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, authLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!msgInput.trim() || sending) return;
    setSending(true);
    const body = msgInput.trim();
    setMsgInput('');
    try {
      await fetch(`/api/conversations/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      await fetchMessages();
    } finally {
      setSending(false);
    }
  }

  if (authLoading || (!user && !authLoading)) return null;

  const other = conv?.participants.find(p => p.user.id !== user?.id);
  const otherName = other?.user.name ?? other?.user.phone ?? 'Landlord';

  // Group messages by date
  const grouped: { date: string; msgs: Message[] }[] = [];
  messages.forEach(m => {
    const date = formatDate(m.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.date === date) last.msgs.push(m);
    else grouped.push({ date, msgs: [m] });
  });

  return (
    <div className="n-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar />

      {/* Chat header */}
      <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--n-line)', display: 'flex', alignItems: 'center', gap: 14, background: 'var(--n-bg)' }}>
        <Link href="/messages" className="n-btn ghost sm" style={{ padding: '8px', display: 'grid', placeItems: 'center' }}>
          <Icon name="arrow" style={{ transform: 'rotate(180deg)' }} />
        </Link>
        <div style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--n-accent-soft)', color: 'var(--n-accent-ink)', display: 'grid', placeItems: 'center', fontWeight: 700, flexShrink: 0 }}>
          {otherName[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{otherName}</div>
          {conv && (
            <Link href={`/property/${conv.listing.id}`} style={{ fontSize: 12, color: 'var(--n-accent)', textDecoration: 'none' }}>
              {conv.listing.title} · ₨ {conv.listing.rentAmount.toLocaleString()}/mo
            </Link>
          )}
        </div>
        {conv && (
          <Link href={`/property/${conv.listing.id}`} className="n-btn ghost sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="home" /> View listing
          </Link>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {loading ? (
          <div style={{ display: 'grid', placeItems: 'center', flex: 1, color: 'var(--n-muted)' }}>
            <span className="n-mono">Loading…</span>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'grid', placeItems: 'center', flex: 1, textAlign: 'center', color: 'var(--n-muted)' }}>
            <div>
              <Icon name="chat" className="n-ico xl" style={{ margin: '0 auto 12px' }} />
              <div>No messages yet. Say hello!</div>
            </div>
          </div>
        ) : (
          grouped.map(group => (
            <div key={group.date}>
              <div style={{ textAlign: 'center', marginBottom: 12, marginTop: 8 }}>
                <span className="n-chip" style={{ fontSize: 11 }}>{group.date}</span>
              </div>
              {group.msgs.map(m => {
                const isMe = m.senderId === user?.id;
                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '72%', padding: '10px 14px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isMe ? 'var(--n-accent)' : 'var(--n-surface-2)',
                        color: isMe ? 'var(--n-accent-ink)' : 'var(--n-ink)',
                        fontSize: 14, lineHeight: 1.5,
                      }}
                    >
                      {m.body}
                    </div>
                    <div className="n-mono" style={{ fontSize: 10, color: 'var(--n-muted)', marginTop: 3 }}>
                      {formatTime(m.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '14px 24px', borderTop: '1px solid var(--n-line)', display: 'flex', gap: 10, background: 'var(--n-bg)' }}>
        <input
          value={msgInput}
          onChange={e => setMsgInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Type a message…"
          style={{ flex: 1, padding: '10px 16px', borderRadius: 999, border: '1px solid var(--n-line)', background: 'var(--n-surface-2)', color: 'var(--n-ink)', fontFamily: 'inherit', fontSize: 14, outline: 'none' }}
        />
        <button
          onClick={send}
          disabled={!msgInput.trim() || sending}
          className="n-btn accent"
          style={{ height: 42, width: 42, padding: 0, justifyContent: 'center', borderRadius: 999 }}
        >
          <Icon name="arrow" />
        </button>
      </div>
    </div>
  );
}
