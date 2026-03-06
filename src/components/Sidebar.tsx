'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { Category } from '@/lib/types';
import * as store from '@/lib/store';
import ConfirmModal from '@/components/ConfirmModal';

interface SidebarProps {
    categories: Category[];
    selectedCategoryId: string | null;
    activeView: 'ideas' | 'projects' | 'completed' | 'deleted' | 'settings';
    onSelectCategory: (id: string | null) => void;
    onViewChange: (view: 'ideas' | 'projects' | 'completed' | 'deleted' | 'settings') => void;
    onCategoriesChange: () => void;
    isOpen: boolean;
    onClose: () => void;
    onLogout?: () => void;
}

export default function Sidebar({
    categories,
    selectedCategoryId,
    activeView,
    onSelectCategory,
    onViewChange,
    onCategoriesChange,
    isOpen,
    onClose,
    onLogout,
}: SidebarProps) {
    const { theme, toggleTheme } = useTheme();
    const [showNewCat, setShowNewCat] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatColor, setNewCatColor] = useState('#6366f1');
    const [editingCat, setEditingCat] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [ideaCounts, setIdeaCounts] = useState<Record<string, number>>({});
    const [totalIdeas, setTotalIdeas] = useState(0);
    const [projectCount, setProjectCount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [deletedCount, setDeletedCount] = useState(0);
    const [catToDelete, setCatToDelete] = useState<Category | null>(null);
    const [isLogoutPromptOpen, setIsLogoutPromptOpen] = useState(false);

    useEffect(() => {
        const loadCounts = async () => {
            const ideas = await store.getIdeas();
            setTotalIdeas(ideas.filter(i => i.status === 'idea').length);
            setProjectCount(ideas.filter(i => i.status === 'in_progress').length);
            setCompletedCount(ideas.filter(i => i.status === 'completed').length);
            setDeletedCount(ideas.filter(i => i.status === 'deleted').length);
            const counts: Record<string, number> = {};
            ideas.forEach(i => {
                if (i.categoryId) {
                    counts[i.categoryId] = (counts[i.categoryId] || 0) + 1;
                }
            });
            setIdeaCounts(counts);
        };
        loadCounts();
    }, [categories]);

    const handleCreateCategory = async () => {
        if (!newCatName.trim()) return;
        await store.createCategory(newCatName.trim(), newCatColor);
        setNewCatName('');
        setNewCatColor('#6366f1');
        setShowNewCat(false);
        onCategoriesChange();
    };

    const handleUpdateCategory = async (id: string) => {
        if (!editName.trim()) return;
        await store.updateCategory(id, { name: editName.trim() });
        setEditingCat(null);
        onCategoriesChange();
    };

    const handleDeleteCategory = async (id: string) => {
        await store.deleteCategory(id);
        if (selectedCategoryId === id) onSelectCategory(null);
        onCategoriesChange();
    };

    const PRESET_COLORS = [
        '#ef4444', '#f97316', '#eab308', '#22c55e',
        '#14b8a6', '#0ea5e9', '#3b82f6', '#6366f1',
        '#8b5cf6', '#d946ef', '#ec4899', '#78716c',
    ];

    return (
        <aside className={`sidebar scrollbar-thin ${isOpen ? 'open' : ''}`}>
            {/* Logo */}
            <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: 'var(--accent-gradient)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 20,
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                        }}>
                            💡
                        </div>
                        <div>
                            <h1 style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em' }}>Proje Fikirleri</h1>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.02em' }}>Fikir Yönetim Platformu</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="btn-ghost"
                        style={{ padding: 8, fontSize: 18 }}
                        title={theme === 'light' ? 'Karanlık Mod' : 'Aydınlık Mod'}
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>

                {/* Mobile close button */}
                <button
                    onClick={onClose}
                    className="btn-ghost"
                    style={{
                        display: 'none',
                        position: 'absolute', top: 16, right: 16,
                        padding: 6, fontSize: 20,
                    }}
                >
                    ✕
                </button>
            </div>

            {/* Navigation */}
            <nav style={{ padding: '12px' }}>
                <button
                    onClick={() => { onViewChange('ideas'); onSelectCategory(null); onClose(); }}
                    className="btn-ghost"
                    style={{
                        width: '100%', justifyContent: 'flex-start', padding: '10px 12px',
                        borderRadius: 12,
                        background: activeView === 'ideas' && !selectedCategoryId ? 'var(--bg-hover)' : 'transparent',
                        color: activeView === 'ideas' && !selectedCategoryId ? 'var(--color-primary-600)' : 'var(--text-secondary)',
                        fontWeight: activeView === 'ideas' && !selectedCategoryId ? 600 : 500,
                    }}
                >
                    <span style={{ fontSize: 16 }}>📋</span>
                    Tüm Fikirler
                    <span style={{
                        marginLeft: 'auto', fontSize: 12,
                        background: 'var(--bg-input)', padding: '2px 8px', borderRadius: 6,
                        color: 'var(--text-muted)', fontWeight: 600,
                    }}>
                        {totalIdeas}
                    </span>
                </button>

                <button
                    onClick={() => { onViewChange('projects'); onClose(); }}
                    className="btn-ghost"
                    style={{
                        width: '100%', justifyContent: 'flex-start', padding: '10px 12px',
                        borderRadius: 12, marginTop: 2,
                        background: activeView === 'projects' ? 'var(--bg-hover)' : 'transparent',
                        color: activeView === 'projects' ? 'var(--color-primary-600)' : 'var(--text-secondary)',
                        fontWeight: activeView === 'projects' ? 600 : 500,
                    }}
                >
                    <span style={{ fontSize: 16 }}>🚀</span>
                    Devam Eden Projeler
                    {projectCount > 0 && (
                        <span style={{
                            marginLeft: 'auto', fontSize: 12,
                            background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))',
                            color: 'white',
                            padding: '2px 8px', borderRadius: 6, fontWeight: 600,
                        }}>
                            {projectCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => { onViewChange('completed'); onClose(); }}
                    className="btn-ghost"
                    style={{
                        width: '100%', justifyContent: 'flex-start', padding: '10px 12px',
                        borderRadius: 12, marginTop: 2,
                        background: activeView === 'completed' ? 'var(--bg-hover)' : 'transparent',
                        color: activeView === 'completed' ? 'var(--color-primary-600)' : 'var(--text-secondary)',
                        fontWeight: activeView === 'completed' ? 600 : 500,
                    }}
                >
                    <span style={{ fontSize: 16 }}>✅</span>
                    Tamamlananlar
                    {completedCount > 0 && (
                        <span style={{
                            marginLeft: 'auto', fontSize: 12,
                            background: '#10b981', color: 'white',
                            padding: '2px 8px', borderRadius: 6, fontWeight: 600,
                        }}>
                            {completedCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => { onViewChange('deleted'); onClose(); }}
                    className="btn-ghost"
                    style={{
                        width: '100%', justifyContent: 'flex-start', padding: '10px 12px',
                        borderRadius: 12, marginTop: 2,
                        background: activeView === 'deleted' ? 'var(--bg-hover)' : 'transparent',
                        color: activeView === 'deleted' ? 'var(--color-primary-600)' : 'var(--text-secondary)',
                        fontWeight: activeView === 'deleted' ? 600 : 500,
                    }}
                >
                    <span style={{ fontSize: 16 }}>🗑️</span>
                    Çöp Kutusu
                    {deletedCount > 0 && (
                        <span style={{
                            marginLeft: 'auto', fontSize: 12,
                            background: 'var(--bg-input)', color: 'var(--text-muted)',
                            padding: '2px 8px', borderRadius: 6, fontWeight: 600,
                        }}>
                            {deletedCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => { onViewChange('settings'); onClose(); }}
                    className="btn-ghost"
                    style={{
                        width: '100%', justifyContent: 'flex-start', padding: '10px 12px',
                        borderRadius: 12, marginTop: 2,
                        background: activeView === 'settings' ? 'var(--bg-hover)' : 'transparent',
                        color: activeView === 'settings' ? 'var(--color-primary-600)' : 'var(--text-secondary)',
                        fontWeight: activeView === 'settings' ? 600 : 500,
                    }}
                >
                    <span style={{ fontSize: 16 }}>⚙️</span>
                    Ayarlar
                </button>
            </nav>

            {/* Categories */}
            <div style={{ padding: '4px 12px', flex: 1 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 4px', marginBottom: 4
                }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                        Kategoriler
                    </span>
                    <button
                        onClick={() => setShowNewCat(!showNewCat)}
                        className="btn-ghost"
                        style={{ padding: '4px 8px', fontSize: 16 }}
                    >
                        {showNewCat ? '✕' : '+'}
                    </button>
                </div>

                {/* New category form */}
                {showNewCat && (
                    <div style={{
                        padding: 12, background: 'var(--bg-input)', borderRadius: 12,
                        marginBottom: 8
                    }}>
                        <input
                            type="text"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            placeholder="Kategori adı..."
                            className="input-field"
                            style={{ marginBottom: 8, fontSize: 13 }}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setNewCatColor(c)}
                                    style={{
                                        width: 24, height: 24, borderRadius: 8, background: c, border: 'none',
                                        cursor: 'pointer',
                                        outline: newCatColor === c ? '2px solid var(--text-primary)' : 'none',
                                        outlineOffset: 2,
                                    }}
                                />
                            ))}
                        </div>
                        <button onClick={handleCreateCategory} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: 13 }}>
                            Ekle
                        </button>
                    </div>
                )}

                {/* Category list */}
                {categories.map(cat => (
                    <div key={cat.id}>
                        {editingCat === cat.id ? (
                            <div style={{ display: 'flex', gap: 4, padding: '4px 0' }}>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="input-field"
                                    style={{ fontSize: 13, padding: '6px 10px' }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory(cat.id)}
                                    autoFocus
                                />
                                <button onClick={() => handleUpdateCategory(cat.id)} className="btn-ghost" style={{ padding: '4px 8px' }}>✓</button>
                                <button onClick={() => setEditingCat(null)} className="btn-ghost" style={{ padding: '4px 8px' }}>✕</button>
                            </div>
                        ) : (
                            <button
                                onClick={() => { onViewChange('ideas'); onSelectCategory(cat.id); onClose(); }}
                                className="btn-ghost group"
                                style={{
                                    width: '100%', justifyContent: 'flex-start', padding: '8px 12px',
                                    borderRadius: 10,
                                    background: selectedCategoryId === cat.id && activeView === 'ideas' ? 'var(--bg-hover)' : 'transparent',
                                    fontWeight: selectedCategoryId === cat.id ? 600 : 400,
                                    position: 'relative',
                                }}
                            >
                                <span style={{
                                    width: 10, height: 10, borderRadius: 4,
                                    background: cat.color, flexShrink: 0,
                                }} />
                                <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {cat.name}
                                </span>
                                <span style={{
                                    fontSize: 11, color: 'var(--text-muted)', fontWeight: 500,
                                }}>
                                    {ideaCounts[cat.id] || 0}
                                </span>
                                <span
                                    onClick={(e) => { e.stopPropagation(); setEditingCat(cat.id); setEditName(cat.name); }}
                                    style={{ fontSize: 12, opacity: 0.5, cursor: 'pointer', padding: '0 2px' }}
                                    title="Düzenle"
                                >
                                    ✏️
                                </span>
                                <span
                                    onClick={(e) => { e.stopPropagation(); setCatToDelete(cat); }}
                                    style={{ fontSize: 12, opacity: 0.5, cursor: 'pointer', padding: '0 2px' }}
                                    title="Sil"
                                >
                                    🗑️
                                </span>
                            </button>
                        )}
                    </div>
                ))}

                {categories.length === 0 && !showNewCat && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 12px', textAlign: 'center' }}>
                        Henüz kategori yok
                    </p>
                )}
            </div>

            {/* Logout */}
            {onLogout && (
                <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)' }}>
                    <button
                        onClick={() => setIsLogoutPromptOpen(true)}
                        className="btn-ghost"
                        style={{
                            width: '100%', justifyContent: 'flex-start', padding: '10px 12px',
                            borderRadius: 12, color: '#dc2626', fontSize: 14,
                        }}
                    >
                        <span style={{ fontSize: 16 }}>🚪</span>
                        Çıkış Yap
                    </button>
                </div>
            )}

            <ConfirmModal
                isOpen={!!catToDelete}
                title="Kategoriyi Sil"
                message={`"${catToDelete?.name}" kategorisini silmek istediğinize emin misiniz? İçindeki fikirler kategorisiz olarak kalacaktır.`}
                onConfirm={() => { if (catToDelete) handleDeleteCategory(catToDelete.id); setCatToDelete(null); }}
                onCancel={() => setCatToDelete(null)}
                confirmText="Sil"
            />

            <ConfirmModal
                isOpen={isLogoutPromptOpen}
                title="Çıkış Yap"
                message="Hesabınızdan çıkış yapmak istediğinize emin misiniz?"
                onConfirm={() => { setIsLogoutPromptOpen(false); if (onLogout) onLogout(); }}
                onCancel={() => setIsLogoutPromptOpen(false)}
                confirmText="Çıkış Yap"
            />
        </aside>
    );
}
