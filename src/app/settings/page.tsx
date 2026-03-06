'use client';

import React, { useState, useEffect } from 'react';
import * as store from '@/lib/store';
import { AppSettings } from '@/lib/types';
import toast from 'react-hot-toast';

export default function Settings() {
    const [settings, setSettings] = useState<AppSettings>({ theme: 'light' });
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        const load = async () => {
            const s = await store.getSettings();
            setSettings(s);
        };
        load();
    }, []);

    const handlePasswordChange = async () => {
        if (!currentPassword || !newPassword) {
            toast.error('Tüm alanları doldurun');
            return;
        }
        if (newPassword.length < 4) {
            toast.error('Yeni şifre en az 4 karakter olmalıdır');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Yeni şifreler eşleşmiyor');
            return;
        }

        setChangingPassword(true);
        try {
            const res = await fetch('/api/auth/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || 'Şifre değiştirilemedi');
                return;
            }
            toast.success('Şifre başarıyla değiştirildi! 🔐');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch {
            toast.error('Bağlantı hatası');
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>⚙️ Ayarlar</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>
                Uygulama tercihlerinizi yapılandırın.
            </p>

            {/* Theme Settings */}
            <div className="card" style={{ padding: 32, marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
                    🎨 Görünüm
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Tema</label>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Aydınlık veya karanlık mod.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={async () => {
                                const updated = await store.updateSettings({ theme: 'light' });
                                setSettings(updated);
                                document.documentElement.classList.remove('dark');
                                toast.success('Aydınlık mod aktif ☀️');
                            }}
                            className={settings.theme === 'light' ? 'btn-primary' : 'btn-secondary'}
                            style={{ padding: '8px 20px' }}
                        >
                            ☀️ Aydınlık
                        </button>
                        <button
                            onClick={async () => {
                                const updated = await store.updateSettings({ theme: 'dark' });
                                setSettings(updated);
                                document.documentElement.classList.add('dark');
                                toast.success('Karanlık mod aktif 🌙');
                            }}
                            className={settings.theme === 'dark' ? 'btn-primary' : 'btn-secondary'}
                            style={{ padding: '8px 20px' }}
                        >
                            🌙 Karanlık
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Change */}
            <div className="card" style={{ padding: 32, marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
                    🔐 Şifre Değiştir
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Mevcut Şifre</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Yeni Şifre</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="input-field"
                            placeholder="En az 4 karakter"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Yeni Şifre (Tekrar)</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="input-field"
                            placeholder="Yeni şifreyi tekrar yazın"
                        />
                    </div>
                    <button
                        onClick={handlePasswordChange}
                        disabled={changingPassword}
                        className="btn-primary"
                        style={{ padding: '10px 20px', marginTop: 8, alignSelf: 'flex-start' }}
                    >
                        {changingPassword ? '⏳ Değiştiriliyor...' : '🔐 Şifreyi Değiştir'}
                    </button>
                </div>
            </div>

            {/* About */}
            <div className="card" style={{ padding: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
                    ℹ️ Hakkında
                </h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8 }}>
                    <p><strong>Proje Fikirleri</strong> — Fikir Yönetim Platformu</p>
                    <p>Fikirlerinizi kaydedin, organize edin ve projeye dönüştürün.</p>
                    <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                        Versiyon 1.0 — Veriler Turso bulut veritabanında saklanmaktadır.
                    </p>
                </div>
            </div>
        </div>
    );
}
