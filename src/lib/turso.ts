import { createClient } from '@libsql/client';

const tursoUrl = process.env.TURSO_DATABASE_URL || 'libsql://dummy-for-build.turso.io';
const tursoToken = process.env.TURSO_AUTH_TOKEN || 'dummy-token';

const turso = createClient({
    url: tursoUrl,
    authToken: tursoToken,
});

export default turso;
