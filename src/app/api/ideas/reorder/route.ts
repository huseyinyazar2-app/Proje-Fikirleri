import { NextResponse } from 'next/server';
import turso from '@/lib/turso';

// PUT /api/ideas/reorder — bulk reorder
export async function PUT(req: Request) {
    try {
        const { orderedIds } = await req.json();
        if (!Array.isArray(orderedIds)) return NextResponse.json({ error: 'orderedIds must be an array' }, { status: 400 });

        const statements = orderedIds.map((id: string, index: number) => ({
            sql: 'UPDATE Yeni_ideas SET "order" = ? WHERE id = ?',
            args: [index, id],
        }));

        await turso.batch(statements);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
