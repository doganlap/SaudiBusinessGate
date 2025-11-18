/**
 * ==========================================
 * DATABASE MANAGER SERVICE
 * ==========================================
 * 
 * Service for managing database operations
 * Currently uses in-memory storage - replace with actual API calls
 */

class DatabaseManagerService {
  constructor() {
    this.mockData = {
      organizations: []
    };
    this.initSampleData();
  }

  // Organizations
  async getOrganizations(filters = {}) {
    await this.delay(300);
    
    let orgs = [...this.mockData.organizations];
    
    // Apply filters
    if (filters.search) {
      const search = filters.search.toLowerCase();
      orgs = orgs.filter(org => 
        org.name?.toLowerCase().includes(search) ||
        org.industry?.toLowerCase().includes(search) ||
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
    await this.delay(200);
    const org = this.mockData.organizations.find(org => org.id === id);
    if (!org) {
      throw new Error('Organization not found');
    }
    return org;
  }

  async createOrganization(data) {
    await this.delay(400);
    
    const newOrg = {
      id: Date.now().toString(),
      ...data,
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.mockData.organizations.push(newOrg);
    return newOrg;
  }

  async updateOrganization(id, data) {
    await this.delay(400);
    
    const index = this.mockData.organizations.findIndex(org => org.id === id);
    if (index === -1) {
      throw new Error('Organization not found');
    }
    
    this.mockData.organizations[index] = {
      ...this.mockData.organizations[index],
      ...data,
      id, // Preserve ID
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
    return { success: true, message: 'Organization deleted successfully' };
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
        name: 'Saudi Business Gate Holding',
        type: 'Holding Company',
        industry: 'Technology & Business Services',
        status: 'active',
        employees: 150,
        revenue: 25000000,
        country: 'Saudi Arabia',
        city: 'Riyadh',
        website: 'https://sbgate.com',
        contact: {
          email: 'info@sbgate.com',
          phone: '+966-11-xxx-xxxx'
        },
        createdAt: '2023-01-15T10:00:00Z',
        updatedAt: '2024-11-15T14:30:00Z'
      },
      {
        id: '2',
        name: 'Tech Solutions International',
        type: 'Corporation',
        industry: 'Information Technology',
        status: 'active',
        employees: 500,
        revenue: 75000000,
        country: 'United States',
        city: 'New York',
        website: 'https://techsolutions.com',
        contact: {
          email: 'contact@techsolutions.com',
          phone: '+1-212-xxx-xxxx'
        },
        createdAt: '2022-06-20T09:00:00Z',
        updatedAt: '2024-10-01T11:15:00Z'
      },
      {
        id: '3',
        name: 'Global Financial Services',
        type: 'Financial Institution',
        industry: 'Banking & Finance',
        status: 'active',
        employees: 1200,
        revenue: 250000000,
        country: 'United Kingdom',
        city: 'London',
        website: 'https://gfs.co.uk',
        contact: {
          email: 'info@gfs.co.uk',
          phone: '+44-20-xxxx-xxxx'
        },
        createdAt: '2020-03-10T08:00:00Z',
        updatedAt: '2024-11-10T16:45:00Z'
      },
      {
        id: '4',
        name: 'Healthcare Plus',
        type: 'Healthcare Provider',
        industry: 'Healthcare',
        status: 'active',
        employees: 350,
        revenue: 45000000,
        country: 'Canada',
        city: 'Toronto',
        website: 'https://healthcareplus.ca',
        contact: {
          email: 'admin@healthcareplus.ca',
          phone: '+1-416-xxx-xxxx'
        },
        createdAt: '2021-09-05T07:30:00Z',
        updatedAt: '2024-11-05T10:20:00Z'
      },
      {
        id: '5',
        name: 'Manufacturing Corp',
        type: 'Manufacturing',
        industry: 'Industrial Manufacturing',
        status: 'pending',
        employees: 800,
        revenue: 120000000,
        country: 'Germany',
        city: 'Munich',
        website: 'https://mfgcorp.de',
        contact: {
          email: 'contact@mfgcorp.de',
          phone: '+49-89-xxxx-xxxx'
        },
        createdAt: '2023-07-12T12:00:00Z',
        updatedAt: '2024-11-12T09:30:00Z'
      }
    ];
  }
}

// Create and export singleton instance
const databaseManagerService = new DatabaseManagerService();
export default databaseManagerService;
