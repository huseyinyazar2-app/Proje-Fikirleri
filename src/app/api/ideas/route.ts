import { NextResponse } from 'next/server';
import turso from '@/lib/turso';
import { v4 as uuidv4 } from 'uuid';

function mapIdeaRow(r: any) {
    return {
        id: r.id,
        title: r.title,
        description: r.description || '',
        notes: r.notes || '',
        finalSummary: r.final_summary || '',
        order: r.order,
        status: r.status,
        categoryId: r.category_id,
        progress: [],
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    };
}

// GET /api/ideas — list all
export async function GET() {
    try {
        const result = await turso.execute('SELECT * FROM Yeni_ideas ORDER BY "order" ASC');
        const ideas = result.rows.map(mapIdeaRow);
        return NextResponse.json(ideas);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/ideas — create
export async function POST(req: Request) {
    try {
        const data = await req.json();
        const id = uuidv4();
        const countResult = await turso.execute('SELECT COUNT(*) as cnt FROM Yeni_ideas');
        const order = Number(countResult.rows[0].cnt);
        const now = new Date().toISOString();

        await turso.execute({
            sql: `INSERT INTO Yeni_ideas (id, title, description, notes, final_summary, "order", status, category_id, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                id,
                data.title || 'Yeni Fikir',
                data.description || '',
                data.notes || '',
                data.finalSummary || '',
                order,
                data.status || 'idea',
                data.categoryId || null,
                now, now,
            ],
        });

        const row = await turso.execute({ sql: 'SELECT * FROM Yeni_ideas WHERE id = ?', args: [id] });
        return NextResponse.json(mapIdeaRow(row.rows[0]));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
