/**
 * ==========================================
 * DATABASE MANAGER SERVICE (MOCK)
 * ==========================================
 * 
 * Mock service for database operations
 * Replace with actual database integration
 */

class DatabaseManagerService {
  constructor() {
    this.mockData = {
      organizations: []
    };
  }

  // Organizations
  async getOrganizations(filters = {}) {
    // Simulate API delay
    await this.delay(500);
    
    let orgs = [...this.mockData.organizations];
    
    // Apply filters
    if (filters.search) {
      const search = filters.search.toLowerCase();
      orgs = orgs.filter(org => 
        org.name.toLowerCase().includes(search) ||
        org.type?.toLowerCase().includes(search)
      );
    }
    
    if (filters.type) {
      orgs = orgs.filter(org => org.type === filters.type);
    }
    
    if (filters.status) {
      orgs = orgs.filter(org => org.status === filters.status);
    }
    
    return orgs;
  }

  async getOrganization(id) {
    await this.delay(300);
    return this.mockData.organizations.find(org => org.id === id);
  }

  async createOrganization(data) {
    await this.delay(500);
    
    const newOrg = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.mockData.organizations.push(newOrg);
    return newOrg;
  }

  async updateOrganization(id, data) {
    await this.delay(500);
    
    const index = this.mockData.organizations.findIndex(org => org.id === id);
    if (index === -1) {
      throw new Error('Organization not found');
    }
    
    this.mockData.organizations[index] = {
      ...this.mockData.organizations[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return this.mockData.organizations[index];
  }

  async deleteOrganization(id) {
    await this.delay(300);
    
    const index = this.mockData.organizations.findIndex(org => org.id === id);
    if (index === -1) {
      throw new Error('Organization not found');
    }
    
    this.mockData.organizations.splice(index, 1);
    return { success: true };
  }

  // Utility
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Initialize with sample data
  initSampleData() {
    this.mockData.organizations = [
      {
        id: '1',
        name: 'Acme Corporation',
        type: 'Enterprise',
        status: 'Active',
        industry: 'Technology',
        employees: 5000,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'TechStart Inc',
        type: 'Startup',
        status: 'Active',
        industry: 'Software',
        employees: 50,
        createdAt: '2024-02-20T14:30:00Z',
        updatedAt: '2024-02-20T14:30:00Z'
      },
      {
        id: '3',
        name: 'Global Industries',
        type: 'Enterprise',
        status: 'Pending',
        industry: 'Manufacturing',
        employees: 10000,
        createdAt: '2024-03-10T09:15:00Z',
        updatedAt: '2024-03-10T09:15:00Z'
      }
    ];
  }
}

// Create singleton instance with sample data
const databaseManagerService = new DatabaseManagerService();
databaseManagerService.initSampleData();

export default databaseManagerService;
