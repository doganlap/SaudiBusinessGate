import { AuthenticationResult, PublicClientApplication, Configuration } from '@azure/msal-browser';

// Microsoft Authentication Configuration
const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID || 'common'}`,
    redirectUri: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Login request scopes
const loginRequest = {
  scopes: ['User.Read', 'profile', 'email', 'openid'],
};

// Microsoft User Interface
export interface MicrosoftUser {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
  companyName?: string;
  country?: string;
  preferredLanguage?: string;
}

// Database User Interface
export interface DatabaseUser {
  id: string;
  microsoftId: string;
  email: string;
  name: string;
  nameAr?: string;
  role: 'super_admin' | 'tenant_admin' | 'manager' | 'user' | 'viewer';
  tenantId: string;
  department?: string;
  jobTitle?: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
}

class MicrosoftAuthService {
  private msalInstance: PublicClientApplication;

  constructor() {
    this.msalInstance = msalInstance;
  }

  // Initialize MSAL
  async initialize(): Promise<void> {
    try {
      await this.msalInstance.initialize();
      console.log('✅ Microsoft Authentication initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Microsoft Authentication:', error);
      throw error;
    }
  }

  // Login with Microsoft
  async login(): Promise<AuthenticationResult> {
    try {
      const response = await this.msalInstance.loginPopup(loginRequest);
      console.log('✅ Microsoft login successful:', response.account?.username);
      return response;
    } catch (error) {
      console.error('❌ Microsoft login failed:', error);
      throw error;
    }
  }

  // Silent token acquisition
  async getToken(): Promise<string> {
    try {
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const silentRequest = {
        ...loginRequest,
        account: accounts[0],
      };

      const response = await this.msalInstance.acquireTokenSilent(silentRequest);
      return response.accessToken;
    } catch (error) {
      console.error('❌ Silent token acquisition failed:', error);
      // Fallback to interactive login
      const response = await this.login();
      return response.accessToken;
    }
  }

  // Get Microsoft user profile
  async getUserProfile(): Promise<MicrosoftUser> {
    try {
      const token = await this.getToken();
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profile = await response.json();
      return {
        id: profile.id,
        displayName: profile.displayName,
        mail: profile.mail || profile.userPrincipalName,
        userPrincipalName: profile.userPrincipalName,
        jobTitle: profile.jobTitle,
        department: profile.department,
        companyName: profile.companyName,
        country: profile.country,
        preferredLanguage: profile.preferredLanguage,
      };
    } catch (error) {
      console.error('❌ Failed to get user profile:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const accounts = this.msalInstance.getAllAccounts();
    return accounts.length > 0;
  }

  // Get current account
  getCurrentAccount() {
    const accounts = this.msalInstance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await this.msalInstance.logoutPopup();
      console.log('✅ Microsoft logout successful');
    } catch (error) {
      console.error('❌ Microsoft logout failed:', error);
      throw error;
    }
  }

  // Sync user with database
  async syncUserWithDatabase(microsoftUser: MicrosoftUser): Promise<DatabaseUser> {
    try {
      const response = await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          microsoftId: microsoftUser.id,
          email: microsoftUser.mail,
          name: microsoftUser.displayName,
          jobTitle: microsoftUser.jobTitle,
          department: microsoftUser.department,
          preferredLanguage: microsoftUser.preferredLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync user with database');
      }

      const databaseUser = await response.json();
      console.log('✅ User synced with database:', databaseUser.email);
      return databaseUser;
    } catch (error) {
      console.error('❌ Failed to sync user with database:', error);
      throw error;
    }
  }

  // Complete authentication flow
  async authenticateUser(): Promise<DatabaseUser> {
    try {
      // 1. Login with Microsoft
      await this.login();

      // 2. Get Microsoft user profile
      const microsoftUser = await this.getUserProfile();

      // 3. Sync with database and get user role/permissions
      const databaseUser = await this.syncUserWithDatabase(microsoftUser);

      // 4. Store user session
      localStorage.setItem('currentUser', JSON.stringify(databaseUser));
      localStorage.setItem('lastLogin', new Date().toISOString());

      return databaseUser;
    } catch (error) {
      console.error('❌ Authentication flow failed:', error);
      throw error;
    }
  }

  // Get current user from storage
  getCurrentUser(): DatabaseUser | null {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('❌ Failed to get current user:', error);
      return null;
    }
  }

  // Check user permissions
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user?.permissions.includes(permission) || false;
  }

  // Check user role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
}

// Export singleton instance
export const microsoftAuth = new MicrosoftAuthService();

// Initialize on import
microsoftAuth.initialize().catch(console.error);
