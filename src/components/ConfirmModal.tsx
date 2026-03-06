'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Onayla',
    cancelText = 'İptal',
    isDestructive = true,
}: ConfirmModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onCancel} style={{ zIndex: 1000 }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, padding: 32 }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: isDestructive ? 'rgba(220,38,38,0.1)' : 'rgba(99,102,241,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, flexShrink: 0
                    }}>
                        {isDestructive ? '⚠️' : '❓'}
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        {title}
                    </h2>
                </div>

                <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                    {message}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button type="button" onClick={onCancel} className="btn-secondary" style={{ padding: '10px 18px' }}>
                        {cancelText}
                    </button>
                    <button type="button" onClick={onConfirm} className={isDestructive ? "btn-danger" : "btn-primary"} style={{ padding: '10px 18px' }}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
