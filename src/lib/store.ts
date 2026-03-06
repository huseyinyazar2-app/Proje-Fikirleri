import { Category, Idea, ProjectProgress, AppSettings } from './types';

const API = '';

// ─── Categories ──────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
    const res = await fetch(`${API}/api/categories`);
    return res.json();
}

export async function createCategory(name: string, color: string = '#6366f1'): Promise<Category> {
    const res = await fetch(`${API}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color }),
    });
    return res.json();
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
    const res = await fetch(`${API}/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
}

export async function deleteCategory(id: string): Promise<void> {
    await fetch(`${API}/api/categories/${id}`, { method: 'DELETE' });
}

// ─── Ideas ──────────────────────────────────────────────
export async function getIdeas(): Promise<Idea[]> {
    const res = await fetch(`${API}/api/ideas`);
    return res.json();
}

export async function getIdeaById(id: string): Promise<Idea | undefined> {
    const res = await fetch(`${API}/api/ideas/${id}`);
    if (!res.ok) return undefined;
    return res.json();
}

export async function createIdea(data: Partial<Idea>): Promise<Idea> {
    const res = await fetch(`${API}/api/ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function updateIdea(id: string, data: Partial<Idea>): Promise<Idea | null> {
    const res = await fetch(`${API}/api/ideas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
}

export async function deleteIdea(id: string): Promise<void> {
    await fetch(`${API}/api/ideas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'deleted' }),
    });
}

export async function hardDeleteIdea(id: string): Promise<void> {
    await fetch(`${API}/api/ideas/${id}`, { method: 'DELETE' });
}

export async function reorderIdeas(orderedIds: string[]): Promise<void> {
    await fetch(`${API}/api/ideas/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
    });
}

// ─── Progress ──────────────────────────────────────────
export async function getProgressByIdea(ideaId: string): Promise<ProjectProgress[]> {
    const res = await fetch(`${API}/api/progress?ideaId=${ideaId}`);
    return res.json();
}

export async function createProgress(ideaId: string, type: ProjectProgress['type'], content: string): Promise<ProjectProgress> {
    const res = await fetch(`${API}/api/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId, type, content }),
    });
    return res.json();
}

export async function deleteProgress(id: string): Promise<void> {
    await fetch(`${API}/api/progress/${id}`, { method: 'DELETE' });
}

// ─── Settings ──────────────────────────────────────────
export async function getSettings(): Promise<AppSettings> {
    try {
        const res = await fetch(`${API}/api/settings`);
        return res.json();
    } catch {
        return { theme: 'light' };
    }
}

export async function updateSettings(data: Partial<AppSettings>): Promise<AppSettings> {
    const res = await fetch(`${API}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

// ─── DB Setup ──────────────────────────────────────────
export async function setupDatabase(): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`${API}/api/db/setup`, { method: 'POST' });
    return res.json();
}
