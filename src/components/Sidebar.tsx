'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { Category, Idea } from '@/lib/types';
import * as store from '@/lib/store';
import ConfirmModal from '@/components/ConfirmModal';

interface SidebarProps {
    categories: Category[];
    ideas?: Idea[];
    selectedCategoryId: string | null;
    selectedIdeaId?: string | null;
    activeView: 'ideas' | 'projects' | 'completed' | 'deleted' | 'settings';
    onSelectCategory: (id: string | null) => void;
    onSelectIdea?: (id: string | null) => void;
    onViewChange: (view: 'ideas' | 'projects' | 'completed' | 'deleted' | 'settings') => void;
    onCategoriesChange: () => void;
    isOpen: boolean;
    onClose: () => void;
    onLogout?: () => void;
}

export default function Sidebar({
    categories,
    ideas = [],
    selectedCategoryId,
    selectedIdeaId,
    activeView,
    onSelectCategory,
    onSelectIdea,
    onViewChange,
    onCategoriesChange,
    isOpen,
    onClose,
    onLogout,
}: SidebarProps) {
    const { theme, toggleTheme } = useTheme();
    const [ideaCounts, setIdeaCounts] = useState<Record<string, number>>({});
    const [totalIdeas, setTotalIdeas] = useState(0);
    const [projectCount, setProjectCount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [deletedCount, setDeletedCount] = useState(0);
    const [isLogoutPromptOpen, setIsLogoutPromptOpen] = useState(false);

    useEffect(() => {
        const loadCounts = async () => {
            const allIdeas = ideas.length > 0 ? ideas : await store.getIdeas();
            setTotalIdeas(allIdeas.filter(i => i.status === 'idea').length);
            setProjectCount(allIdeas.filter(i => i.status === 'in_progress').length);
            setCompletedCount(allIdeas.filter(i => i.status === 'completed').length);
            setDeletedCount(allIdeas.filter(i => i.status === 'deleted').length);
            const counts: Record<string, number> = {};
            allIdeas.forEach(i => {
                if (i.categoryId) {
                    counts[i.categoryId] = (counts[i.categoryId] || 0) + 1;
                }
            });
            setIdeaCounts(counts);
        };
        loadCounts();
    }, [categories, ideas]);

    // Derived Ideas for Chat List
    const filteredIdeasForSidebar = ideas.filter(idea => {
        if (activeView === 'projects') return idea.status === 'in_progress';
        if (activeView === 'completed') return idea.status === 'completed';
        if (activeView === 'deleted') return idea.status === 'deleted';
        if (activeView === 'ideas') {
            if (idea.status === 'deleted' || idea.status === 'completed') return false;
            if (selectedCategoryId && idea.categoryId !== selectedCategoryId) return false;
            return true;
        }
        return false;
    });



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

            {/* Categories Filter */}
            <div style={{ padding: '4px 12px', flexShrink: 0 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 4px', marginBottom: 4
                }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                        Kategori Filtresi
                    </span>
                </div>
                <select
                    value={selectedCategoryId || ""}
                    onChange={(e) => {
                        if (e.target.value) {
                            onSelectCategory(e.target.value);
                            onViewChange('ideas');
                        } else {
                            onSelectCategory(null);
                        }
                        onClose();
                    }}
                    className="input-field"
                    style={{ padding: '10px 12px', background: 'var(--bg-input)', border: 'none', borderRadius: 10, color: selectedCategoryId ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                >
                    <option value="">💡 Tüm Kategoriler</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Idea List (Chat History Style) */}
            {activeView !== 'settings' && (
                <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '4px' }}>
                        Geçmiş Fikirler
                    </div>
                    {filteredIdeasForSidebar.map(idea => (
                        <button
                            key={idea.id}
                            onClick={() => { if (onSelectIdea) onSelectIdea(idea.id); onClose(); }}
                            style={{
                                width: '100%', textAlign: 'left', padding: '10px 12px',
                                borderRadius: '10px', border: 'none', cursor: 'pointer',
                                background: selectedIdeaId === idea.id ? 'var(--bg-hover)' : 'transparent',
                                color: selectedIdeaId === idea.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                                fontWeight: selectedIdeaId === idea.id ? 600 : 500,
                                fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                            }}
                        >
                            {idea.title || 'İsimsiz Fikir'}
                        </button>
                    ))}
                    {filteredIdeasForSidebar.length === 0 && (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 20 }}>
                            Bu alanda fikir bulunamadı.
                        </p>
                    )}
                </div>
            )}

            {/* Logout */}
            {onLogout && (
                <div style={{ padding: '12px', marginTop: 'auto', borderTop: '1px solid var(--border-color)' }}>
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
