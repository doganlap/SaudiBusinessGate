// =================================================================
// AUTHORIZATION SERVICE - IMPLEMENTATION
// =================================================================
// This service checks if a user has the required permissions to
// perform an action based on their roles.
// =================================================================

import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'production',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
});

class AuthorizationService {
    /**
     * Checks if a user has a specific permission.
     * @param userId The ID of the user.
     * @param organizationId The ID of the user's organization.
     * @param requiredPermission The permission string to check for (e.g., 'reports.view').
     * @returns True if the user has the permission, false otherwise.
     */
    public async hasPermission(userId: number, organizationId: number, requiredPermission: string): Promise<boolean> {
        console.log(`?? AuthZ: Checking if user ${userId} has permission '${requiredPermission}' in org ${organizationId}...`);

        const query = `
            SELECT EXISTS (
                SELECT 1
                FROM user_roles ur
                JOIN role_permissions rp ON ur.role_id = rp.role_id
                JOIN permissions p ON rp.permission_id = p.id
                WHERE ur.user_id = $1
                  AND ur.organization_id = $2
                  AND p.name = $3
            );
        `;

        try {
            const { rows } = await pool.query(query, [userId, organizationId, requiredPermission]);
            const hasPermission = rows[0].exists;

            if (hasPermission) {
                console.log(`? AuthZ: User ${userId} has permission '${requiredPermission}'.`);
            } else {
                console.log(`? AuthZ: User ${userId} does NOT have permission '${requiredPermission}'.`);
            }

            return hasPermission;
        } catch (error) {
            console.error('Error during permission check:', error);
            return false; // Default to false in case of an error
        }
    }
}

export const authorizationService = new AuthorizationService();
