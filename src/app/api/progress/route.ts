import { NextResponse } from 'next/server';
import turso from '@/lib/turso';
import { v4 as uuidv4 } from 'uuid';

function mapProgressRow(r: any) {
    return {
        id: r.id,
        ideaId: r.idea_id,
        type: r.type,
        content: r.content,
        createdAt: r.created_at,
    };
}

// GET /api/progress?ideaId=xxx — list by idea
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const ideaId = searchParams.get('ideaId');
        if (!ideaId) return NextResponse.json({ error: 'ideaId required' }, { status: 400 });

        const result = await turso.execute({
            sql: 'SELECT * FROM Yeni_project_progress WHERE idea_id = ? ORDER BY created_at DESC',
            args: [ideaId],
        });
        return NextResponse.json(result.rows.map(mapProgressRow));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/progress — create
export async function POST(req: Request) {
    try {
        const { ideaId, type, content } = await req.json();
        const id = uuidv4();

        await turso.execute({
            sql: 'INSERT INTO Yeni_project_progress (id, idea_id, type, content) VALUES (?, ?, ?, ?)',
            args: [id, ideaId, type, content],
        });

        const row = await turso.execute({ sql: 'SELECT * FROM Yeni_project_progress WHERE id = ?', args: [id] });
        return NextResponse.json(mapProgressRow(row.rows[0]));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
