import { NextResponse } from 'next/server';
import turso from '@/lib/turso';
import { v4 as uuidv4 } from 'uuid';

// GET /api/categories — list all
export async function GET() {
    try {
        const result = await turso.execute('SELECT * FROM Yeni_categories ORDER BY "order" ASC');
        const categories = result.rows.map(r => ({
            id: r.id,
            name: r.name,
            color: r.color,
            order: r.order,
            createdAt: r.created_at,
        }));
        return NextResponse.json(categories);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/categories — create
export async function POST(req: Request) {
    try {
        const { name, color } = await req.json();
        const id = uuidv4();
        const countResult = await turso.execute('SELECT COUNT(*) as cnt FROM Yeni_categories');
        const order = Number(countResult.rows[0].cnt);

        await turso.execute({
            sql: 'INSERT INTO Yeni_categories (id, name, color, "order") VALUES (?, ?, ?, ?)',
            args: [id, name, color || '#6366f1', order],
        });

        const row = await turso.execute({ sql: 'SELECT * FROM Yeni_categories WHERE id = ?', args: [id] });
        const cat = row.rows[0];
        return NextResponse.json({
            id: cat.id, name: cat.name, color: cat.color,
            order: cat.order, createdAt: cat.created_at,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
