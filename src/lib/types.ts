export interface Category {
  id: string;
  name: string;
  color: string;
  order: number;
  createdAt: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  notes: string;
  finalSummary: string;
  order: number;
  status: 'idea' | 'in_progress' | 'completed' | 'deleted';
  categoryId: string | null;
  progress: ProjectProgress[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectProgress {
  id: string;
  ideaId: string;
  type: 'done' | 'missing' | 'result' | 'revision';
  content: string;
  createdAt: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
}

export const PROGRESS_TYPE_LABELS: Record<ProjectProgress['type'], string> = {
  done: 'Yapıldı',
  missing: 'Eksik',
  result: 'Sonuç',
  revision: 'Revizyon',
};

export const PROGRESS_TYPE_COLORS: Record<ProjectProgress['type'], string> = {
  done: '#22c55e',
  missing: '#f59e0b',
  result: '#3b82f6',
  revision: '#ef4444',
};
