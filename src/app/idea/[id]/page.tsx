'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Idea, Category, ProjectProgress, PROGRESS_TYPE_LABELS } from '@/lib/types';
import * as store from '@/lib/store';
import toast from 'react-hot-toast';

export default function IdeaDetailPage() {
    const router = useRouter();
    const params = useParams();
    const ideaId = params.id as string;

    const [idea, setIdea] = useState<Idea | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeTab, setActiveTab] = useState<'finalSummary' | 'details' | 'progress'>('details');

    const [progress, setProgress] = useState<ProjectProgress[]>([]);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Idea>>({});

    const [newProgressContent, setNewProgressContent] = useState('');
    const [newProgressType, setNewProgressType] = useState<ProjectProgress['type']>('done');

    const [showFinalModal, setShowFinalModal] = useState(false);
    const [finalSummaryDraft, setFinalSummaryDraft] = useState('');

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDetail = async () => {
            try {
                const [cats, found] = await Promise.all([
                    store.getCategories(),
                    store.getIdeaById(ideaId),
                ]);
                setCategories(cats);
                if (!found) {
                    router.push('/');
                    return;
                }
                setIdea(found);
                setFormData(found);

                const prog = await store.getProgressByIdea(found.id);
                setProgress(prog);

                if (found.status === 'completed') {
                    setActiveTab('finalSummary');
                }
            } catch (err) {
                console.error('Error loading idea:', err);
                toast.error('Fikir yüklenirken hata oluştu');
            } finally {
                setLoading(false);
            }
        };
        loadDetail();
    }, [ideaId, router]);

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }} className="animate-float">📝</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!idea) return null;

    const handleSaveDetails = async () => {
        const updated = await store.updateIdea(idea.id, formData);
        if (updated) setIdea(updated);
        setIsEditing(false);
        toast.success('Değişiklikler kaydedildi');
    };

    const handleStatusChange = async (status: Idea['status']) => {
        const updated = await store.updateIdea(idea.id, { status });
        if (updated) setIdea(updated);
        const msgs: any = { in_progress: 'Projeye çevrildi! 🚀', completed: 'Proje tamamlandı! ✅', idea: 'Fikir aşamasına alındı' };
        toast.success(msgs[status] || 'Durum güncellendi');
    };

    const handleDelete = async () => {
        if (confirm('Bu fikri silmek istediğinize emin misiniz?')) {
            await store.deleteIdea(idea.id);
            toast.success('Çöp kutusuna taşındı');
            router.push('/');
        }
    };

    const handleAddProgress = async () => {
        if (!newProgressContent.trim()) {
            toast.error('Lütfen ilerleme detayını yazın.');
            return;
        }
        const p = await store.createProgress(idea.id, newProgressType, newProgressContent);
        setProgress([p, ...progress]);
        setNewProgressContent('');
        toast.success('İlerleme kaydedildi');

        if (idea.status === 'idea') {
            const updated = await store.updateIdea(idea.id, { status: 'in_progress' });
            if (updated) setIdea(updated);
            toast.success('Fikir otomatik olarak projeye çevrildi! 🚀');
        }
    };

    const handleCompleteClick = () => {
        setFinalSummaryDraft(idea.finalSummary || '');
        setShowFinalModal(true);
    };

    const handleSaveFinalSummary = async () => {
        if (!finalSummaryDraft.trim()) {
            toast.error('Lütfen nihai durumu yazın.');
            return;
        }
        const updated = await store.updateIdea(idea.id, {
            finalSummary: finalSummaryDraft,
            status: 'completed',
        });
        if (updated) setIdea(updated);
        setShowFinalModal(false);
        setActiveTab('finalSummary');
        toast.success('Proje tamamlandı! ✅');
    };

    const handleUpdateFinalSummary = async () => {
        if (!finalSummaryDraft.trim()) {
            toast.error('Lütfen nihai durumu yazın.');
            return;
        }
        const updated = await store.updateIdea(idea.id, { finalSummary: finalSummaryDraft });
        if (updated) setIdea(updated);
        setShowFinalModal(false);
        toast.success('Nihai durum güncellendi');
    };

    const completedDate = idea.status === 'completed' ? new Date(idea.updatedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', height: '100vh' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <button onClick={() => router.push('/')} className="btn-ghost" style={{ fontSize: 20, padding: '8px 14px', borderRadius: 12, border: '1px solid var(--border-color)' }}>←</button>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{idea.title}</h1>
                        <select
                            value={idea.categoryId || ''}
                            onChange={async (e) => {
                                const newCatId = e.target.value || null;
                                const updated = await store.updateIdea(idea.id, { categoryId: newCatId });
                                if (updated) setIdea(updated);
                                toast.success(newCatId ? `Kategori: ${categories.find(c => c.id === newCatId)?.name}` : 'Kategori kaldırıldı');
                            }}
                            className="badge"
                            style={{
                                background: 'var(--bg-input)', border: '1px solid var(--border-color)', fontSize: 12,
                                cursor: 'pointer', appearance: 'none', paddingRight: 24,
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center',
                                outline: 'none', fontWeight: 600,
                            }}
                        >
                            <option value="">📁 Kategorisiz</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <span className="badge" style={{
                            background: idea.status === 'in_progress' ? 'rgba(245,158,11,0.1)' :
                                idea.status === 'completed' ? 'rgba(16,185,129,0.1)' :
                                    idea.status === 'deleted' ? 'rgba(220,38,38,0.1)' : 'var(--color-primary-50)',
                            color: idea.status === 'in_progress' ? '#d97706' :
                                idea.status === 'completed' ? '#059669' :
                                    idea.status === 'deleted' ? '#dc2626' : 'var(--color-primary-700)',
                            border: idea.status === 'in_progress' ? '1px solid rgba(245,158,11,0.2)' :
                                idea.status === 'completed' ? '1px solid rgba(16,185,129,0.2)' :
                                    idea.status === 'deleted' ? '1px solid rgba(220,38,38,0.2)' : '1px solid var(--color-primary-200)',
                            fontSize: 12,
                        }}>
                            {idea.status === 'idea' ? '💡 Fikir' : idea.status === 'in_progress' ? '🚀 Devam Ediyor' : idea.status === 'completed' ? '✅ Tamamlandı' : '🗑️ Silindi'}
                        </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6, fontWeight: 500 }}>
                        Oluşturulma: {new Date(idea.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {completedDate && <span> · Tamamlanma: {completedDate}</span>}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    {idea.status === 'idea' && (
                        <button onClick={() => handleStatusChange('in_progress')} className="btn-primary" style={{ padding: '10px 20px' }}>
                            🚀 Projeye Çevir
                        </button>
                    )}
                    {idea.status === 'in_progress' && (
                        <button onClick={handleCompleteClick} className="btn-primary" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                            ✅ Tamamla
                        </button>
                    )}
                    <button onClick={handleDelete} className="btn-ghost" style={{ color: '#dc2626', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 12 }}>
                        🗑️ Sil
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                {idea.status === 'completed' && (
                    <button
                        onClick={() => setActiveTab('finalSummary')}
                        className={activeTab === 'finalSummary' ? 'btn-secondary' : 'btn-ghost'}
                        style={activeTab === 'finalSummary' ? { background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', color: '#059669' } : {}}
                    >
                        🏁 Nihai Durum
                    </button>
                )}
                <button
                    onClick={() => setActiveTab('details')}
                    className={activeTab === 'details' ? 'btn-secondary' : 'btn-ghost'}
                >
                    📝 Fikir Detayları
                </button>
                <button
                    onClick={() => setActiveTab('progress')}
                    className={activeTab === 'progress' ? 'btn-secondary' : 'btn-ghost'}
                >
                    📊 Proje Aşamaları
                </button>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, overflowY: 'auto' }} className="scrollbar-thin">

                {/* FINAL SUMMARY TAB */}
                {activeTab === 'finalSummary' && idea.status === 'completed' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                            color: 'white', padding: 32, borderRadius: 16,
                            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.2)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>🏁 Nihai Durum</h2>
                                <button
                                    onClick={() => { setFinalSummaryDraft(idea.finalSummary || ''); setShowFinalModal(true); }}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none',
                                        borderRadius: 10, padding: '6px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                                    }}
                                >
                                    ✏️ Düzenle
                                </button>
                            </div>
                            <div style={{
                                background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 24,
                                whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: 15,
                            }}>
                                {idea.finalSummary || 'Nihai durum eklenmemiş.'}
                            </div>
                        </div>
                        {completedDate && (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                                Bu proje {completedDate} tarihinde tamamlandı.
                            </p>
                        )}
                    </div>
                )}

                {/* DETAILS TAB */}
                {activeTab === 'details' && (
                    <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Fikir Bilgileri</h2>
                            {isEditing ? (
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => { setIsEditing(false); setFormData(idea); }} className="btn-ghost">İptal</button>
                                    <button onClick={handleSaveDetails} className="btn-primary" style={{ padding: '6px 16px' }}>Kaydet</button>
                                </div>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="btn-secondary">Düzenle</button>
                            )}
                        </div>

                        {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Fikrin Adı</label>
                                    <input
                                        value={formData.title || ''}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="input-field"
                                        style={{ fontSize: 16, fontWeight: 500 }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Kategori</label>
                                    <select
                                        value={formData.categoryId || ''}
                                        onChange={e => setFormData({ ...formData, categoryId: e.target.value || null })}
                                        className="input-field"
                                        style={{ appearance: 'none' }}
                                    >
                                        <option value="">Kategori Seçin</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Fikirle İlgili Detaylar</label>
                                    <textarea
                                        value={formData.description || ''}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="input-field"
                                        style={{ minHeight: 160 }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Notlar</label>
                                    <textarea
                                        value={formData.notes || ''}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        className="input-field"
                                        style={{ minHeight: 120 }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                <div>
                                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Fikir Detayları</h3>
                                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: 16 }}>
                                        {idea.description || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Detay eklenmemiş.</span>}
                                    </div>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Notlar</h3>
                                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: 15, background: 'var(--bg-input)', padding: 16, borderRadius: 12 }}>
                                        {idea.notes || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not eklenmemiş.</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* PROGRESS TAB */}
                {activeTab === 'progress' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40 }}>
                        {idea.status !== 'completed' && (
                            <div className="card" style={{ padding: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
                                <select
                                    value={newProgressType}
                                    onChange={e => setNewProgressType(e.target.value as any)}
                                    className="input-field"
                                    style={{ width: 160, appearance: 'none', background: 'var(--bg-input)' }}
                                >
                                    {Object.entries(PROGRESS_TYPE_LABELS).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={newProgressContent}
                                    onChange={e => setNewProgressContent(e.target.value)}
                                    className="input-field"
                                    placeholder="İlerleme detayını yazın..."
                                    onKeyDown={e => e.key === 'Enter' && handleAddProgress()}
                                />
                                <button onClick={handleAddProgress} className="btn-primary" style={{ padding: '10px 24px' }}>Ekle</button>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {progress.map(p => (
                                <div key={p.id} style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                                    <div style={{ width: 160, flexShrink: 0 }}>
                                        <span className={`badge progress-${p.type}`} style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', fontSize: 14 }}>
                                            {PROGRESS_TYPE_LABELS[p.type]}
                                        </span>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                                            {new Date(p.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div className="card" style={{ flex: 1, padding: '20px 24px', fontSize: 15, boxShadow: 'var(--shadow-card)' }}>
                                        {p.content}
                                    </div>
                                    {idea.status !== 'completed' && (
                                        <button
                                            onClick={async () => { if (confirm('Silmek istediğinize emin misiniz?')) { await store.deleteProgress(p.id); setProgress(progress.filter(x => x.id !== p.id)); } }}
                                            className="btn-ghost" style={{ padding: 10, color: '#dc2626', opacity: 0.5 }}
                                        >✕</button>
                                    )}
                                </div>
                            ))}
                            {progress.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                    <div style={{ fontSize: 48, marginBottom: 16 }} className="animate-float">📊</div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Henüz proje ilerleme kaydı yok.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>

            {/* Final Summary Modal */}
            {showFinalModal && (
                <div className="modal-overlay" onClick={() => setShowFinalModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
                        <div style={{ marginBottom: 24 }}>
                            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                                🏁 Nihai Durum
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
                                {idea.status === 'completed'
                                    ? 'Nihai durumu düzenleyin.'
                                    : 'Projenin son durumunu, çıktılarını ve öğrenilen dersleri yazın.'}
                            </p>
                        </div>
                        <textarea
                            value={finalSummaryDraft}
                            onChange={e => setFinalSummaryDraft(e.target.value)}
                            className="input-field"
                            placeholder="Örn: Uygulama başarıyla tamamlandı. 500+ kullanıcıya ulaştı..."
                            style={{ minHeight: 200, marginBottom: 24, lineHeight: 1.8 }}
                            autoFocus
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button onClick={() => setShowFinalModal(false)} className="btn-ghost">İptal</button>
                            {idea.status === 'completed' ? (
                                <button onClick={handleUpdateFinalSummary} className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                                    💾 Kaydet
                                </button>
                            ) : (
                                <button onClick={handleSaveFinalSummary} className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                                    ✅ Tamamla ve Kaydet
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
