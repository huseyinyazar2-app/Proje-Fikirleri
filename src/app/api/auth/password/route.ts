import { NextResponse } from 'next/server';
import turso from '@/lib/turso';
import { cookies } from 'next/headers';

// PUT /api/auth/password — change password
export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('session');
        if (!session?.value) {
            return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
        }

        const userResult = await turso.execute({
            sql: 'SELECT id, password FROM Yeni_users WHERE session_token = ?',
            args: [session.value],
        });

        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: 'Oturum geçersiz' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Mevcut ve yeni şifre gereklidir' }, { status: 400 });
        }

        if (newPassword.length < 4) {
            return NextResponse.json({ error: 'Şifre en az 4 karakter olmalıdır' }, { status: 400 });
        }

        const user = userResult.rows[0];
        if (user.password !== currentPassword) {
            return NextResponse.json({ error: 'Mevcut şifre hatalı' }, { status: 400 });
        }

        await turso.execute({
            sql: 'UPDATE Yeni_users SET password = ? WHERE id = ?',
            args: [newPassword, user.id],
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
