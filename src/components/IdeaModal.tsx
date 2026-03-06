'use client';

import React, { useState } from 'react';
import { Idea, Category } from '@/lib/types';

interface IdeaModalProps {
    categories: Category[];
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Idea>) => void;
}

export default function IdeaModal({ categories, isOpen, onClose, onSave }: IdeaModalProps) {
    const [formData, setFormData] = useState<Partial<Idea>>({
        title: '', description: '', notes: '', categoryId: categories[0]?.id || null,
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title?.trim()) return;
        onSave(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Yeni Fikir Oluştur</h2>
                    <button onClick={onClose} className="btn-ghost" style={{ fontSize: 20, padding: 6 }}>✕</button>
                </div>

                <form id="idea-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Fikrin Adı</label>
                        <input
                            required
                            type="text"
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="input-field"
                            placeholder="Fikrinizin kısa adı..."
                            style={{ fontSize: 16, fontWeight: 500 }}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Kategori Seçin</label>
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
                            required
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="input-field"
                            placeholder="Fikrinizin tamamı..."
                            style={{ minHeight: 120 }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Notlar</label>
                        <textarea
                            value={formData.notes || ''}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            className="input-field"
                            placeholder="Ek notlar..."
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                        <button type="button" onClick={onClose} className="btn-secondary">İptal</button>
                        <button type="submit" className="btn-primary">💾 Ekle</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
