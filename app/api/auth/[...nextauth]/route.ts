// =================================================================
// NEXT-AUTH CONFIGURATION
// =================================================================
// This file configures NextAuth.js for authentication, using JWT
// sessions and a Credentials provider for email/password login.
// =================================================================

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'production',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
});

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials) {
                    return null;
                }

                const { email, password } = credentials;

                const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
                const user = result.rows[0];

                if (user && bcrypt.compareSync(password, user.password_hash)) {
                    // Return a user object for the session
                    return { id: user.id, name: user.full_name, email: user.email, organizationId: user.organization_id };
                } else {
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            // Add custom properties to the JWT token
            if (user) {
                token.id = user.id;
                token.organizationId = (user as any).organizationId;
            }
            return token;
        },
        async session({ session, token }) {
            // Add custom properties to the session object
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).organizationId = token.organizationId;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
    },
    secret: process.env.NEXTAUTH_SECRET || 'a-secure-default-secret-for-development',
});

export { handler as GET, handler as POST };
