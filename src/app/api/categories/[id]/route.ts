import { NextResponse } from 'next/server';
import turso from '@/lib/turso';

// PUT /api/categories/[id] — update
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const data = await req.json();
        const fields: string[] = [];
        const args: any[] = [];

        if (data.name !== undefined) { fields.push('name = ?'); args.push(data.name); }
        if (data.color !== undefined) { fields.push('color = ?'); args.push(data.color); }
        if (data.order !== undefined) { fields.push('"order" = ?'); args.push(data.order); }

        if (fields.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        args.push(id);

        await turso.execute({ sql: `UPDATE Yeni_categories SET ${fields.join(', ')} WHERE id = ?`, args });
        const row = await turso.execute({ sql: 'SELECT * FROM Yeni_categories WHERE id = ?', args: [id] });
        if (row.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const cat = row.rows[0];
        return NextResponse.json({
            id: cat.id, name: cat.name, color: cat.color,
            order: cat.order, createdAt: cat.created_at,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/categories/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        // Unlink ideas from this category
        await turso.execute({ sql: 'UPDATE Yeni_ideas SET category_id = NULL WHERE category_id = ?', args: [id] });
        await turso.execute({ sql: 'DELETE FROM Yeni_categories WHERE id = ?', args: [id] });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
