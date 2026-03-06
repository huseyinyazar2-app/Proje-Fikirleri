'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface LoginPageProps {
    onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            toast.error('Kullanıcı adı ve şifre gereklidir');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), password }),
            });

            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || 'Giriş başarısız');
                return;
            }

            toast.success(`Hoş geldiniz, ${data.displayName || data.username}! 🎉`);
            onLogin();
        } catch {
            toast.error('Bağlantı hatası');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 30%, #f5f0ff 60%, #faf5ff 100%)',
            padding: 20,
        }}>
            <div style={{
                width: '100%',
                maxWidth: 420,
                background: 'white',
                borderRadius: 24,
                padding: '48px 40px',
                boxShadow: '0 24px 80px rgba(99, 102, 241, 0.08), 0 8px 32px rgba(0,0,0,0.04)',
                border: '1px solid rgba(99, 102, 241, 0.08)',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 20,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 32, marginBottom: 20,
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                    }}>
                        💡
                    </div>
                    <h1 style={{
                        fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em',
                        color: '#1a1a2e', margin: '0 0 8px 0',
                    }}>
                        Proje Fikirleri
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: 15, margin: 0, fontWeight: 500 }}>
                        Fikir Yönetim Platformu
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <label style={{
                            display: 'block', fontSize: 13, fontWeight: 600,
                            color: '#374151', marginBottom: 8, letterSpacing: '0.02em',
                        }}>
                            Kullanıcı Adı
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="admin"
                            autoFocus
                            autoComplete="username"
                            style={{
                                width: '100%', padding: '14px 16px', fontSize: 15,
                                border: '2px solid #e5e7eb', borderRadius: 14,
                                outline: 'none', background: '#f9fafb',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                                boxSizing: 'border-box',
                            }}
                            onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.1)'; }}
                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block', fontSize: 13, fontWeight: 600,
                            color: '#374151', marginBottom: 8, letterSpacing: '0.02em',
                        }}>
                            Şifre
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            style={{
                                width: '100%', padding: '14px 16px', fontSize: 15,
                                border: '2px solid #e5e7eb', borderRadius: 14,
                                outline: 'none', background: '#f9fafb',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                                boxSizing: 'border-box',
                            }}
                            onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.1)'; }}
                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '14px', fontSize: 16, fontWeight: 700,
                            background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white', border: 'none', borderRadius: 14,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.25)',
                            marginTop: 8,
                            letterSpacing: '0.02em',
                        }}
                    >
                        {loading ? '⏳ Giriş yapılıyor...' : '🔐 Giriş Yap'}
                    </button>
                </form>

                <p style={{
                    textAlign: 'center', marginTop: 28,
                    fontSize: 12, color: '#9ca3af',
                }}>
                    Varsayılan: admin / 1234
                </p>
            </div>
        </div>
    );
}
