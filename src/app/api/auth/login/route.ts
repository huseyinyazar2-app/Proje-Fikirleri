import { NextResponse } from 'next/server';
import turso from '@/lib/turso';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

// POST /api/auth/login
export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();
        if (!username || !password) {
            return NextResponse.json({ error: 'Kullanıcı adı ve şifre gereklidir' }, { status: 400 });
        }

        const result = await turso.execute({
            sql: 'SELECT * FROM Yeni_users WHERE username = ? AND password = ?',
            args: [username, password],
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı' }, { status: 401 });
        }

        const user = result.rows[0];
        const sessionToken = uuidv4();

        // Save session token
        await turso.execute({
            sql: 'UPDATE Yeni_users SET session_token = ? WHERE id = ?',
            args: [sessionToken, user.id],
        });

        const cookieStore = await cookies();
        cookieStore.set('session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });

        return NextResponse.json({
            id: user.id,
            username: user.username,
            displayName: user.display_name,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
