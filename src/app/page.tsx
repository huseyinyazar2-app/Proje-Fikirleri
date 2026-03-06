'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import Settings from '@/app/settings/page';
import LoginPage from '@/components/LoginPage';
import * as store from '@/lib/store';
import { Category, Idea, ProjectProgress } from '@/lib/types';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';

export default function Dashboard() {
  const router = useRouter();
  const [view, setView] = useState<'ideas' | 'projects' | 'completed' | 'deleted' | 'settings'>('ideas');
  const [categories, setCategories] = useState<Category[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // New Idea Form State
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaDesc, setNewIdeaDesc] = useState('');
  const [newIdeaCat, setNewIdeaCat] = useState('');

  // Append Note State
  const [noteText, setNoteText] = useState('');

  // Print Ref
  const printRef = useRef<HTMLDivElement>(null);
  // Type assertion handles the ref type appropriately for react-to-print
  const handlePrint = useReactToPrint({ contentRef: printRef as unknown as React.RefObject<HTMLDivElement> });

  const loadData = useCallback(async () => {
    try {
      const [cats, allIdeas] = await Promise.all([
        store.getCategories(),
        store.getIdeas(),
      ]);
      setCategories(cats);
      const sorted = allIdeas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setIdeas(sorted);
    } catch (err) {
      console.error('Data loading failed:', err);
      toast.error('Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await store.setupDatabase();
      // Check auth
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setIsAuthenticated(true);
            await loadData();
          }
        }
      } catch { }
      setAuthChecked(true);
      setLoading(false);
    };
    init();
  }, [loadData]);

  const handleLogin = async () => {
    setIsAuthenticated(true);
    setLoading(true);
    await loadData();
    setLoading(false);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    toast.success('Çıkış yapıldı');
    window.location.reload();
  };

  const handleSaveIdea = async () => {
    if (!newIdeaTitle.trim()) { toast.error('Başlık zorunludur'); return; }

    await store.createIdea({
      title: newIdeaTitle,
      description: newIdeaDesc,
      categoryId: newIdeaCat || null
    });
    setNewIdeaTitle(''); setNewIdeaDesc(''); setNewIdeaCat('');
    toast.success('Fikir başarıyla oluşturuldu!');
    await loadData();
  };

  const handleAppendNote = async () => {
    if (!noteText.trim() || !selectedIdeaId) return;
    const idea = ideas.find(i => i.id === selectedIdeaId);
    if (!idea) return;

    const dateStr = new Date().toLocaleString('tr-TR', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Yazarın istediği tam format
    const appendedText = `\n\n----------------------------------------\nTarih: ${dateStr}\nNot: ${noteText.trim()}`;
    const newDesc = (idea.description || '') + appendedText;

    await store.updateIdea(idea.id, { description: newDesc });
    setNoteText('');
    toast.success('Not eklendi');
    await loadData();
  };

  const handleStatusChange = async (id: string, status: Idea['status']) => {
    await store.updateIdea(id, { status });
    await loadData();
    toast.success('Durum güncellendi');
  };

  const handleDeleteIdea = async (id: string, isHardDelete: boolean) => {
    if (isHardDelete) {
      if (window.confirm('Kalıcı olarak silmek istediğinize emin misiniz?')) {
        await store.hardDeleteIdea(id);
        toast.success('Kalıcı olarak silindi');
      } else return;
    } else {
      if (window.confirm('Çöp kutusuna taşınsın mı?')) {
        await store.updateIdea(id, { status: 'deleted' });
        toast.success('Çöpe taşındı');
      } else return;
    }

    setSelectedIdeaId(null);
    await loadData();
  };

  const selectedIdeaObj = ideas.find(i => i.id === selectedIdeaId);

  // Filter logic for counts in the header
  const filteredIdeas = ideas.filter(idea => {
    if (view === 'projects') return idea.status === 'in_progress';
    if (view === 'completed') return idea.status === 'completed';
    if (view === 'deleted') return idea.status === 'deleted';
    if (view === 'ideas') {
      if (idea.status === 'deleted' || idea.status === 'completed') return false;
      if (selectedCatId && idea.categoryId !== selectedCatId) return false;
      return true;
    }
    return false;
  });

  if (!authChecked) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }} className="animate-float">💡</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, fontWeight: 500 }}>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }} className="animate-float">💡</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, fontWeight: 500 }}>Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar
        ideas={ideas}
        categories={categories}
        selectedCategoryId={selectedCatId}
        selectedIdeaId={selectedIdeaId}
        activeView={view}
        onSelectCategory={(id) => { setSelectedCatId(id); setSelectedIdeaId(null); }}
        onSelectIdea={(id) => setSelectedIdeaId(id)}
        onViewChange={(v) => { setView(v); setSelectedIdeaId(null); }}
        onCategoriesChange={loadData}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', background: 'var(--bg-app)' }}>
        {/* Header Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', padding: '18px 28px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          position: 'sticky', top: 0, zIndex: 10,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>
          <button
            className="btn-ghost md:hidden"
            onClick={() => setSidebarOpen(true)}
            style={{ marginRight: 16, fontSize: 20 }}
          >
            ☰
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              {view === 'settings' ? '⚙️ Ayarlar' :
                view === 'projects' ? '🚀 Devam Eden Projeler' :
                  view === 'completed' ? '✅ Tamamlananlar' :
                    view === 'deleted' ? '🗑️ Çöp Kutusu' :
                      (selectedCatId ? categories.find(c => c.id === selectedCatId)?.name : '💡 Tüm Fikirler')
              }
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>
              {view === 'ideas' ? `${filteredIdeas.length} fikir` :
                view === 'projects' ? `${filteredIdeas.length} aktif proje` :
                  view === 'completed' ? `${filteredIdeas.length} tamamlanmış` :
                    view === 'deleted' ? `${filteredIdeas.length} silinmiş` : ''}
            </p>
          </div>
        </div>

        {view === 'settings' ? (
          <div style={{ padding: '28px', maxWidth: 1200, margin: '0 auto', overflowY: 'auto', flex: 1 }} className="scrollbar-thin">
            <Settings onSettingsUpdated={loadData} categories={categories} />
          </div>
        ) : selectedIdeaObj ? (
          // AI Chat-Style Idea Details View
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid var(--border-color)', gap: '12px' }}>
              <button onClick={handlePrint as () => void} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>📄 PDF İndir</button>
              {selectedIdeaObj.status === 'deleted' ? (
                <button onClick={() => handleDeleteIdea(selectedIdeaObj.id, true)} className="btn-danger" style={{ padding: '8px 16px', fontSize: 13 }}>Kalıcı Sil</button>
              ) : (
                <>
                  <button onClick={() => handleDeleteIdea(selectedIdeaObj.id, false)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13, color: '#ef4444' }}>Çöpe At</button>
                  {selectedIdeaObj.status !== 'completed' && <button onClick={() => handleStatusChange(selectedIdeaObj.id, 'completed')} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13, background: '#10b981' }}>Tamamlandı İşaretle</button>}
                  {selectedIdeaObj.status === 'idea' && <button onClick={() => handleStatusChange(selectedIdeaObj.id, 'in_progress')} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>Projeye Başla</button>}
                </>
              )}
            </div>

            {/* Print content ref */}
            <div ref={printRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 32px 100px', display: 'flex', flexDirection: 'column', gap: '24px' }} className="scrollbar-thin">
              <div style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '16px' }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{selectedIdeaObj.title}</h1>
                <div style={{ display: 'flex', gap: '16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>{new Date(selectedIdeaObj.createdAt).toLocaleDateString('tr-TR')}</span>
                  <span>•</span>
                  <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{selectedIdeaObj.status === 'completed' ? 'Tamamlandı' : selectedIdeaObj.status === 'in_progress' ? 'Devam Ediyor' : 'Fikir'}</span>
                  {selectedIdeaObj.categoryId && <span>• {categories.find(c => c.id === selectedIdeaObj.categoryId)?.name}</span>}
                </div>
              </div>

              <div style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                {selectedIdeaObj.description || 'Bu proje için henüz açıklama girilmemiş.'}
              </div>
            </div>

            {/* Message Input Area (Append Notes) */}
            <div style={{ padding: '20px 32px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', background: 'var(--bg-input)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Bu projeye yeni bir not veya güncelleme ekle..."
                  style={{ width: '100%', minHeight: '60px', maxHeight: '200px', background: 'transparent', border: 'none', padding: '16px', fontSize: 15, color: 'var(--text-primary)', outline: 'none', resize: 'none' }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAppendNote(); } }}
                />
                <button onClick={handleAppendNote} className="btn-primary" style={{ margin: '8px', padding: '10px 20px', borderRadius: '12px' }}>Ekle ⬆</button>
              </div>
            </div>
          </div>
        ) : (
          // AI Chat-Style "New Idea" Prompt
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 20px', maxWidth: '700px', margin: '0 auto', width: '100%', height: '100%' }}>
            <div style={{ width: 64, height: 64, background: 'var(--accent-gradient)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 24, boxShadow: '0 8px 24px rgba(99,102,241,0.2)' }}>💡</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Bugün aklında ne var?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 16 }}>Yeni bir proje, uygulama fikri veya tasarım ilhamı gir...</p>

            <div style={{ width: '100%', background: 'var(--bg-card)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                value={newIdeaTitle} onChange={e => setNewIdeaTitle(e.target.value)}
                className="input-field" placeholder="Projenizin Adı"
                style={{ fontSize: 18, fontWeight: 600, padding: '16px', background: 'transparent', border: '1px solid var(--border-color)' }}
              />
              <select
                value={newIdeaCat} onChange={e => setNewIdeaCat(e.target.value)}
                className="input-field"
                style={{ padding: '12px 16px', background: 'transparent', border: '1px solid var(--border-color)', color: newIdeaCat ? 'var(--text-primary)' : 'var(--text-muted)' }}
              >
                <option value="">Kategori Seçin (Opsiyonel)</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <textarea
                value={newIdeaDesc} onChange={e => setNewIdeaDesc(e.target.value)}
                className="input-field" placeholder="Fikrinizin detaylarını buraya yazın..."
                style={{ minHeight: '120px', padding: '16px', resize: 'vertical', background: 'transparent', border: '1px solid var(--border-color)' }}
              />
              <button onClick={handleSaveIdea} className="btn-primary" style={{ padding: '16px', fontSize: 16, justifyContent: 'center', borderRadius: '12px', marginTop: '8px' }}>
                Oluştur 🚀
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
