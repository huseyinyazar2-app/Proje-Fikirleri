import { NextResponse } from 'next/server';
import turso from '@/lib/turso';
import { cookies } from 'next/headers';

// GET /api/auth/me — check current session
export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('session');

        if (!session?.value) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        const result = await turso.execute({
            sql: 'SELECT id, username, display_name FROM Yeni_users WHERE session_token = ?',
            args: [session.value],
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        const user = result.rows[0];
        return NextResponse.json({
            user: {
                id: user.id,
                username: user.username,
                displayName: user.display_name,
            },
        });
    } catch {
        return NextResponse.json({ user: null }, { status: 401 });
    }
}
