'use client';

import React, { useState, useEffect } from 'react';
import * as store from '@/lib/store';
import { AppSettings, Category } from '@/lib/types';
import toast from 'react-hot-toast';

export default function Settings({ categories = [], onSettingsUpdated }: { categories?: Category[], onSettingsUpdated?: () => void }) {
    const [settings, setSettings] = useState<AppSettings>({ theme: 'light' });

    // Category Management
    const [newCatName, setNewCatName] = useState('');
    const [newCatColor, setNewCatColor] = useState('#6366f1');
    const [editingCat, setEditingCat] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const PRESET_COLORS = [
        '#ef4444', '#f97316', '#eab308', '#22c55e',
        '#14b8a6', '#0ea5e9', '#3b82f6', '#6366f1',
        '#8b5cf6', '#d946ef', '#ec4899', '#78716c',
    ];

    const handleCreateCategory = async () => {
        if (!newCatName.trim()) return;
        await store.createCategory(newCatName.trim(), newCatColor);
        setNewCatName('');
        setNewCatColor('#6366f1');
        if (onSettingsUpdated) onSettingsUpdated();
        toast.success("Kategori eklendi");
    };

    const handleUpdateCategory = async (id: string) => {
        if (!editName.trim()) return;
        await store.updateCategory(id, { name: editName.trim() });
        setEditingCat(null);
        if (onSettingsUpdated) onSettingsUpdated();
        toast.success("Kategori güncellendi");
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        if (!window.confirm(`"${name}" kategorisini silmek istediğinize emin misiniz? İçindeki fikirler kategorisiz olarak kalacaktır.`)) return;
        await store.deleteCategory(id);
        if (onSettingsUpdated) onSettingsUpdated();
        toast.success("Kategori silindi");
    };
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

            {/* Category Settings */}
            <div className="card" style={{ padding: 32, marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
                    📂 Kategori Yönetimi
                </h3>

                <div style={{ padding: 16, background: 'var(--bg-input)', borderRadius: 12, marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                        <input
                            type="text"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            placeholder="Yeni kategori adı..."
                            className="input-field"
                            style={{ flex: 1 }}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                        />
                        <button onClick={handleCreateCategory} className="btn-primary" style={{ padding: '8px 20px' }}>
                            Ekle
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {PRESET_COLORS.map(c => (
                            <button
                                key={c}
                                onClick={() => setNewCatColor(c)}
                                style={{
                                    width: 28, height: 28, borderRadius: 8, background: c, border: 'none',
                                    cursor: 'pointer',
                                    outline: newCatColor === c ? '2px solid var(--text-primary)' : 'none',
                                    outlineOffset: 2,
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {categories.map(cat => (
                        <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12 }}>
                            {editingCat === cat.id ? (
                                <>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="input-field"
                                        style={{ flex: 1, padding: '8px 12px' }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory(cat.id)}
                                        autoFocus
                                    />
                                    <button onClick={() => handleUpdateCategory(cat.id)} className="btn-secondary" style={{ padding: '6px 12px' }}>Kaydet</button>
                                    <button onClick={() => setEditingCat(null)} className="btn-ghost" style={{ padding: '6px 12px' }}>İptal</button>
                                </>
                            ) : (
                                <>
                                    <div style={{ width: 14, height: 14, borderRadius: 4, background: cat.color }} />
                                    <span style={{ flex: 1, fontWeight: 500 }}>{cat.name}</span>
                                    <button onClick={() => { setEditingCat(cat.id); setEditName(cat.name); }} className="btn-ghost" style={{ padding: '6px 10px' }}>Düzenle</button>
                                    <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="btn-ghost" style={{ padding: '6px 10px', color: '#ef4444' }}>Sil</button>
                                </>
                            )}
                        </div>
                    ))}
                    {categories.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Henüz kategori eklenmedi.</p>}
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
