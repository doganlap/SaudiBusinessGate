/**
 * Mock Authorization Service for Next.js API routes
 * Simplified version for production build compatibility
 */

export class AuthorizationServiceMock {
  async hasPermission(
    userId: string | number,
    organizationId: string | number,
    permission: string
  ): Promise<boolean> {
    // Mock authorization - always return true for demo purposes
    console.log(`Mock auth check: user ${userId}, org ${organizationId}, permission ${permission}`);
    return true;
  }

  async hasRole(userId: string | number, role: string): Promise<boolean> {
    // Mock role check - return true for admin roles
    return role.includes('admin') || role.includes('manager');
  }
}

export const authorizationService = new AuthorizationServiceMock();