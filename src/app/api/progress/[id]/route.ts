import { NextResponse } from 'next/server';
import turso from '@/lib/turso';

// DELETE /api/progress/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await turso.execute({ sql: 'DELETE FROM Yeni_project_progress WHERE id = ?', args: [id] });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
