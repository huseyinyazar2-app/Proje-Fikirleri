'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DndContext, closestCenter, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import IdeaCard from '@/components/IdeaCard';
import IdeaModal from '@/components/IdeaModal';
import Sidebar from '@/components/Sidebar';
import Settings from '@/app/settings/page';
import LoginPage from '@/components/LoginPage';
import * as store from '@/lib/store';
import { Category, Idea, ProjectProgress } from '@/lib/types';
import toast from 'react-hot-toast';

import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [view, setView] = useState<'ideas' | 'projects' | 'completed' | 'deleted' | 'settings'>('ideas');
  const [categories, setCategories] = useState<Category[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, ProjectProgress[]>>({});
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [cats, allIdeas] = await Promise.all([
        store.getCategories(),
        store.getIdeas(),
      ]);
      setCategories(cats);
      const sorted = allIdeas.sort((a, b) => a.order - b.order);
      setIdeas(sorted);

      // Load progress for in_progress ideas (shown on cards)
      const inProgressIds = sorted.filter(i => i.status === 'in_progress').map(i => i.id);
      const progressEntries = await Promise.all(
        inProgressIds.map(async (id) => {
          const prog = await store.getProgressByIdea(id);
          return [id, prog] as [string, ProjectProgress[]];
        })
      );
      const pMap: Record<string, ProjectProgress[]> = {};
      progressEntries.forEach(([id, prog]) => { pMap[id] = prog; });
      setProgressMap(pMap);
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

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setIdeas((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        store.reorderIdeas(newArray.map(i => i.id));
        return newArray;
      });
    }
  };

  const handleSaveIdea = async (data: Partial<Idea>) => {
    await store.createIdea({ ...data, categoryId: selectedCatId });
    await loadData();
    setIsModalOpen(false);
    toast.success('Yeni fikir eklendi!');
  };

  const handleDeleteIdea = async (id: string) => {
    const ideaToDel = ideas.find(i => i.id === id);
    if (ideaToDel?.status === 'deleted') {
      await store.hardDeleteIdea(id);
      toast.success('Fikir tamamen silindi');
    } else {
      await store.deleteIdea(id);
      toast.success('Çöp kutusuna taşındı');
    }
    await loadData();
    if (selectedIdea?.id === id) {
      setIsModalOpen(false);
      setSelectedIdea(null);
    }
  };

  const handleStatusChange = async (id: string, status: Idea['status']) => {
    if (status === 'completed') {
      router.push(`/idea/${id}`);
      return;
    }
    await store.updateIdea(id, { status });
    await loadData();
    toast.success(status === 'in_progress' ? 'Projeye başlandı! 🚀' : 'Durum güncellendi');
  };

  // Filter logic
  const filteredIdeas = ideas.filter(idea => {
    if (view === 'projects') return idea.status === 'in_progress';
    if (view === 'completed') return idea.status === 'completed';
    if (view === 'deleted') return idea.status === 'deleted';
    if (view === 'ideas') {
      if (idea.status === 'deleted') return false;
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
        categories={categories}
        selectedCategoryId={selectedCatId}
        activeView={view}
        onSelectCategory={setSelectedCatId}
        onViewChange={setView}
        onCategoriesChange={loadData}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1, height: '100%', overflowY: 'auto', position: 'relative', background: 'var(--bg-app)' }} className="scrollbar-thin">
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

          {view === 'ideas' && (
            <button
              onClick={() => { setSelectedIdea(null); setIsModalOpen(true); }}
              className="btn-primary"
              style={{ padding: '10px 24px' }}
            >
              ✨ Yeni Fikir
            </button>
          )}
        </div>

        {/* Content Area */}
        <div style={{ padding: '28px', maxWidth: 1200, margin: '0 auto' }}>
          {view === 'settings' && <Settings />}

          {view !== 'settings' && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              {view === 'ideas' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                  {filteredIdeas.length > 0 && ['idea', 'in_progress', 'completed'].map(statusGroup => {
                    const groupIdeas = filteredIdeas.filter(i => i.status === statusGroup);
                    if (groupIdeas.length === 0) return null;

                    const titles: any = { idea: '💡 Fikirler', in_progress: '🚀 Devam Eden Projeler', completed: '✅ Tamamlananlar' };
                    const colors: any = { idea: 'var(--color-primary-500)', in_progress: '#f59e0b', completed: '#10b981' };

                    return (
                      <div key={statusGroup} className="animate-slide-in">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingLeft: 16, position: 'relative' }}>
                          <div style={{ position: 'absolute', left: 0, top: 2, bottom: 2, width: 4, borderRadius: 2, background: colors[statusGroup] }} />
                          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            {titles[statusGroup]}
                          </h3>
                          <span style={{
                            fontSize: 12, color: 'white', fontWeight: 700,
                            background: colors[statusGroup], padding: '2px 10px',
                            borderRadius: 20,
                          }}>
                            {groupIdeas.length}
                          </span>
                        </div>
                        <div style={{
                          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20,
                        }}>
                          <SortableContext items={groupIdeas.map(i => i.id)} strategy={verticalListSortingStrategy}>
                            {groupIdeas.map((idea) => {
                              const category = categories.find(c => c.id === idea.categoryId);
                              return (
                                <IdeaCard
                                  key={idea.id} idea={idea} categoryColor={category?.color} progress={progressMap[idea.id] || []}
                                  onClick={() => router.push(`/idea/${idea.id}`)} onStatusChange={handleStatusChange} onDelete={handleDeleteIdea}
                                />
                              );
                            })}
                          </SortableContext>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20,
                }}>
                  <SortableContext items={filteredIdeas.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    {filteredIdeas.map((idea) => {
                      const category = categories.find(c => c.id === idea.categoryId);
                      return (
                        <IdeaCard
                          key={idea.id} idea={idea} categoryColor={category?.color} progress={progressMap[idea.id] || []}
                          onClick={() => router.push(`/idea/${idea.id}`)} onStatusChange={handleStatusChange} onDelete={handleDeleteIdea}
                        />
                      );
                    })}
                  </SortableContext>
                </div>
              )}

              {filteredIdeas.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                  <div style={{ fontSize: 56, marginBottom: 20 }} className="animate-float">
                    {view === 'projects' ? '🚀' : view === 'completed' ? '✅' : view === 'deleted' ? '🗑️' : '🌱'}
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Burada henüz bir şey yok</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 15, maxWidth: 400, margin: '0 auto 28px' }}>
                    {view === 'projects' ? 'Devam eden projeniz bulunmuyor.' :
                      view === 'completed' ? 'Henüz tamamlanmış bir proje yok.' :
                        view === 'deleted' ? 'Çöp kutusu boş, silinmiş fikir yok.' :
                          'Yeni bir fikir ekleyerek yolculuğunuza başlayın.'}
                  </p>
                  {view === 'ideas' && (
                    <button onClick={() => { setSelectedIdea(null); setIsModalOpen(true); }} className="btn-primary" style={{ padding: '12px 28px' }}>
                      ✨ Yeni Fikir Ekle
                    </button>
                  )}
                </div>
              )}
            </DndContext>
          )}
        </div>
      </main>

      {/* Idea Modal */}
      {isModalOpen && (
        <IdeaModal
          categories={categories}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveIdea}
        />
      )}
    </div>
  );
}
