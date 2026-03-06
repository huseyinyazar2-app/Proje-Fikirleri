import { NextResponse } from 'next/server';
import turso from '@/lib/turso';

// GET /api/settings
export async function GET() {
    try {
        const result = await turso.execute("SELECT * FROM Yeni_settings WHERE id = 'default'");
        if (result.rows.length === 0) {
            return NextResponse.json({ theme: 'light' });
        }
        return NextResponse.json({ theme: result.rows[0].theme });
    } catch (error: any) {
        return NextResponse.json({ theme: 'light' });
    }
}

// PUT /api/settings
export async function PUT(req: Request) {
    try {
        const data = await req.json();
        await turso.execute({
            sql: "INSERT OR REPLACE INTO Yeni_settings (id, theme) VALUES ('default', ?)",
            args: [data.theme || 'light'],
        });
        return NextResponse.json({ theme: data.theme || 'light' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
