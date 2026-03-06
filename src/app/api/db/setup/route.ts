import { NextResponse } from 'next/server';
import turso from '@/lib/turso';
import { v4 as uuidv4 } from 'uuid';

export async function POST() {
    try {
        await turso.batch([
            `CREATE TABLE IF NOT EXISTS Yeni_categories (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                color TEXT DEFAULT '#6366f1',
                "order" INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now'))
            )`,
            `CREATE TABLE IF NOT EXISTS Yeni_ideas (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT DEFAULT '',
                notes TEXT DEFAULT '',
                final_summary TEXT DEFAULT '',
                "order" INTEGER DEFAULT 0,
                status TEXT DEFAULT 'idea' CHECK(status IN ('idea','in_progress','completed','deleted')),
                category_id TEXT REFERENCES Yeni_categories(id) ON DELETE SET NULL,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )`,
            `CREATE TABLE IF NOT EXISTS Yeni_project_progress (
                id TEXT PRIMARY KEY,
                idea_id TEXT NOT NULL REFERENCES Yeni_ideas(id) ON DELETE CASCADE,
                type TEXT NOT NULL CHECK(type IN ('done','missing','result','revision')),
                content TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now'))
            )`,
            `CREATE TABLE IF NOT EXISTS Yeni_settings (
                id TEXT PRIMARY KEY DEFAULT 'default',
                theme TEXT DEFAULT 'light'
            )`,
            `CREATE TABLE IF NOT EXISTS Yeni_users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                display_name TEXT DEFAULT '',
                session_token TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            )`,
            `INSERT OR IGNORE INTO Yeni_settings (id, theme) VALUES ('default', 'light')`,
        ]);

        // Create default admin user if no users exist
        const userCount = await turso.execute('SELECT COUNT(*) as cnt FROM Yeni_users');
        if (Number(userCount.rows[0].cnt) === 0) {
            const adminId = uuidv4();
            await turso.execute({
                sql: `INSERT INTO Yeni_users (id, username, password, display_name) VALUES (?, ?, ?, ?)`,
                args: [adminId, 'admin', '1234', 'Yönetici'],
            });
        }

        return NextResponse.json({ success: true, message: 'Tüm tablolar başarıyla oluşturuldu!' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
