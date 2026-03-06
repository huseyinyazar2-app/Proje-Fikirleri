import { NextResponse } from 'next/server';
import turso from '@/lib/turso';

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

// GET /api/ideas/[id]
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const row = await turso.execute({ sql: 'SELECT * FROM Yeni_ideas WHERE id = ?', args: [id] });
        if (row.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(mapIdeaRow(row.rows[0]));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/ideas/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const data = await req.json();
        const fields: string[] = [];
        const args: any[] = [];

        if (data.title !== undefined) { fields.push('title = ?'); args.push(data.title); }
        if (data.description !== undefined) { fields.push('description = ?'); args.push(data.description); }
        if (data.notes !== undefined) { fields.push('notes = ?'); args.push(data.notes); }
        if (data.finalSummary !== undefined) { fields.push('final_summary = ?'); args.push(data.finalSummary); }
        if (data.order !== undefined) { fields.push('"order" = ?'); args.push(data.order); }
        if (data.status !== undefined) { fields.push('status = ?'); args.push(data.status); }
        if (data.categoryId !== undefined) { fields.push('category_id = ?'); args.push(data.categoryId); }

        fields.push("updated_at = datetime('now')");

        if (fields.length <= 1) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        args.push(id);

        await turso.execute({ sql: `UPDATE Yeni_ideas SET ${fields.join(', ')} WHERE id = ?`, args });
        const row = await turso.execute({ sql: 'SELECT * FROM Yeni_ideas WHERE id = ?', args: [id] });
        if (row.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(mapIdeaRow(row.rows[0]));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/ideas/[id] — hard delete
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await turso.execute({ sql: 'DELETE FROM Yeni_project_progress WHERE idea_id = ?', args: [id] });
        await turso.execute({ sql: 'DELETE FROM Yeni_ideas WHERE id = ?', args: [id] });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
