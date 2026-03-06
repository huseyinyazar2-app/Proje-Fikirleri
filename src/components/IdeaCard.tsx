'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Idea, ProjectProgress, PROGRESS_TYPE_LABELS } from '@/lib/types';
import ConfirmModal from '@/components/ConfirmModal';

interface IdeaCardProps {
    idea: Idea;
    categoryColor?: string;
    progress?: ProjectProgress[];
    onClick: () => void;
    onStatusChange?: (id: string, status: Idea['status']) => void;
    onDelete?: (id: string) => void;
}

export default function IdeaCard({ idea, categoryColor = '#6366f1', progress, onClick, onStatusChange, onDelete }: IdeaCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: idea.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        border: `2px solid ${categoryColor}`,
    };

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const statusLabels: Record<string, string> = {
        idea: '💡 Fikir',
        in_progress: '🚀 Devam Ediyor',
        completed: '✅ Tamamlandı',
        deleted: '🗑️ Çöp Kutusu',
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // Only navigate if clicking the card itself, not action buttons
        const target = e.target as HTMLElement;
        if (target.closest('[data-action-zone]')) return;
        onClick();
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsConfirmOpen(true);
    };

    const confirmDelete = () => {
        setIsConfirmOpen(false);
        onDelete?.(idea.id);
    };

    const handleStatusClick = (e: React.MouseEvent, status: Idea['status']) => {
        e.preventDefault();
        e.stopPropagation();
        onStatusChange?.(idea.id, status);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`card ${isDragging ? 'dragging' : ''}`}
            onClick={handleCardClick}
            {...attributes}
            {...listeners}
        >
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, lineHeight: 1.4, letterSpacing: '-0.01em' }}>
                        {idea.title}
                    </h3>
                    <span className="badge" style={{
                        background: idea.status === 'in_progress' ? 'rgba(245,158,11,0.1)' :
                            idea.status === 'completed' ? 'rgba(16,185,129,0.1)' :
                                idea.status === 'deleted' ? 'rgba(220,38,38,0.1)' : 'var(--bg-input)',
                        color: idea.status === 'in_progress' ? '#d97706' :
                            idea.status === 'completed' ? '#059669' :
                                idea.status === 'deleted' ? '#dc2626' : 'var(--text-secondary)',
                        whiteSpace: 'nowrap', fontSize: 11,
                        border: idea.status === 'in_progress' ? '1px solid rgba(245,158,11,0.2)' :
                            idea.status === 'completed' ? '1px solid rgba(16,185,129,0.2)' :
                                idea.status === 'deleted' ? '1px solid rgba(220,38,38,0.2)' : '1px solid var(--border-color)',
                    }}>
                        {statusLabels[idea.status]}
                    </span>
                </div>
                {/* Show finalSummary for completed, description for others */}
                {idea.status === 'completed' && idea.finalSummary ? (
                    <div style={{ marginTop: 4, padding: 14, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-color)', borderLeft: '3px solid #10b981', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontSize: 11, color: '#10b981', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 14 }}>🎯</span> Nihai Durum
                        </div>
                        <p style={{
                            fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6,
                            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }}>
                            {idea.finalSummary}
                        </p>
                    </div>
                ) : idea.description ? (
                    <p style={{
                        fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                        {idea.description}
                    </p>
                ) : null}

                {/* Son İlerleme */}
                {idea.status === 'in_progress' && progress && progress.length > 0 && (
                    <div style={{ marginTop: 8, padding: 12, background: 'var(--bg-input)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>Son İlerleme:</div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span className={`badge progress-${progress[0].type}`} style={{ fontSize: 11, padding: '2px 6px' }}>
                                {PROGRESS_TYPE_LABELS[progress[0].type]}
                            </span>
                            <span style={{ fontSize: 13, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {progress[0].content}
                            </span>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                        {new Date(idea.updatedAt).toLocaleDateString('tr-TR')}
                    </span>

                    <div data-action-zone="true" style={{ display: 'flex', gap: 4 }}>
                        {onStatusChange && idea.status === 'idea' && (
                            <button
                                onClick={(e) => handleStatusClick(e, 'in_progress')}
                                className="btn-ghost"
                                style={{ padding: '4px 8px', fontSize: 12 }}
                                title="Başla"
                            >
                                🚀 Başla
                            </button>
                        )}
                        {onStatusChange && idea.status === 'in_progress' && (
                            <>
                                <button
                                    onClick={(e) => handleStatusClick(e, 'completed')}
                                    className="btn-ghost"
                                    style={{ padding: '4px 8px', fontSize: 12, color: '#10b981' }}
                                    title="Tamamla"
                                >
                                    ✅
                                </button>
                                <button
                                    onClick={(e) => handleStatusClick(e, 'idea')}
                                    className="btn-ghost"
                                    style={{ padding: '4px 8px', fontSize: 12, color: '#f59e0b' }}
                                    title="Fikre Geri Dön"
                                >
                                    ⏪
                                </button>
                            </>
                        )}
                        {onStatusChange && idea.status === 'completed' && (
                            <button
                                onClick={(e) => handleStatusClick(e, 'in_progress')}
                                className="btn-ghost"
                                style={{ padding: '4px 8px', fontSize: 12, color: '#f59e0b' }}
                                title="Projeye Geri Al"
                            >
                                ⏪ Geri Al
                            </button>
                        )}
                        {onStatusChange && idea.status === 'deleted' && (
                            <button
                                onClick={(e) => handleStatusClick(e, 'idea')}
                                className="btn-ghost"
                                style={{ padding: '4px 8px', fontSize: 12, color: '#10b981' }}
                                title="Geri Yükle"
                            >
                                ♻️ Geri Yükle
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={handleDeleteClick}
                                className="btn-ghost"
                                style={{ padding: '4px 8px', fontSize: 12, color: '#dc2626' }}
                                title="Sil"
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isConfirmOpen && (
                <div data-action-zone="true">
                    <ConfirmModal
                        isOpen={isConfirmOpen}
                        title={idea.status === 'deleted' ? 'Kalıcı Olarak Sil' : 'Çöp Kutusuna Taşı'}
                        message={idea.status === 'deleted'
                            ? 'Bu fikri kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!'
                            : 'Bu fikri çöp kutusuna taşımak istediğinize emin misiniz?'}
                        onConfirm={confirmDelete}
                        onCancel={() => setIsConfirmOpen(false)}
                        confirmText="Sil"
                    />
                </div>
            )}
        </div>
    );
}
