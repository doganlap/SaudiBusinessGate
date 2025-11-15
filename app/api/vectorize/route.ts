import { NextRequest, NextResponse } from 'next/server';
import { serviceRegistry } from '@/lib/services/registry';

interface VectorIndex {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  dimensions: number;
  metric: 'cosine' | 'euclidean' | 'dotproduct';
  vectorCount: number;
  maxVectors: number;
  status: 'active' | 'error' | 'creating' | 'maintenance';
  tenantId: string;
  metadata: {
    dataType: string;
    lastSync: string;
    syncStatus: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface VectorRecord {
  id: string;
  indexId: string;
  vectorId: string;
  values: number[];
  metadata?: Record<string, any>;
  createdAt: string;
}

// Mock data fallback
const mockIndexes: VectorIndex[] = [
  {
    id: 'idx-1',
    name: 'Customer Embeddings',
    nameAr: 'تضمينات العملاء',
    description: 'Customer behavior and preferences embeddings',
    descriptionAr: 'تضمينات سلوك وتفضيلات العملاء',
    dimensions: 1536,
    metric: 'cosine',
    vectorCount: 1250,
    maxVectors: 10000,
    status: 'active',
    tenantId: 'demo-tenant',
    metadata: {
      dataType: 'customer',
      lastSync: '2024-01-15T10:30:00Z',
      syncStatus: 'synced'
    },
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'idx-2',
    name: 'Product Similarity',
    nameAr: 'تشابه المنتجات',
    description: 'Product recommendation embeddings',
    descriptionAr: 'تضمينات توصيات المنتجات',
    dimensions: 768,
    metric: 'cosine',
    vectorCount: 850,
    maxVectors: 5000,
    status: 'active',
    tenantId: 'demo-tenant',
    metadata: {
      dataType: 'product',
      lastSync: '2024-01-14T16:45:00Z',
      syncStatus: 'synced'
    },
    createdAt: '2024-01-12T09:15:00Z',
    updatedAt: '2024-01-14T16:45:00Z'
  }
];

// Initialize services on first request
let servicesInitialized = false;
async function ensureServicesInitialized() {
  if (!servicesInitialized) {
    try {
      await serviceRegistry.initialize();
      servicesInitialized = true;
    } catch (error) {
      console.error('Failed to initialize vectorize services:', error);
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureServicesInitialized();

    const { searchParams } = new URL(request.url);
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';
    const action = searchParams.get('action');

    // Try to get real data from database
    try {
      if (action === 'stats') {
        const stats = await serviceRegistry.vectorize.getIndexStats(tenantId);
        return NextResponse.json({
          success: true,
          stats
        });
      } else {
        const indexes = await serviceRegistry.vectorize.findAll(tenantId);
        const stats = await serviceRegistry.vectorize.getIndexStats(tenantId);

        return NextResponse.json({
          success: true,
          data: indexes,
          stats
        });
      }
    } catch (dbError) {
      console.warn('Database unavailable for vectorize, using fallback data:', dbError);

      // Fallback to mock data
      const tenantIndexes = mockIndexes.filter(index => index.tenantId === tenantId);
      const stats = {
        total_indexes: tenantIndexes.length,
        total_vectors: tenantIndexes.reduce((sum, idx) => sum + idx.vectorCount, 0),
        total_capacity: tenantIndexes.reduce((sum, idx) => sum + idx.maxVectors, 0),
        avg_usage: tenantIndexes.length > 0
          ? tenantIndexes.reduce((sum, idx) => sum + (idx.vectorCount / idx.maxVectors), 0) / tenantIndexes.length
          : 0,
        active_indexes: tenantIndexes.filter(idx => idx.status === 'active').length,
        creating_indexes: tenantIndexes.filter(idx => idx.status === 'creating').length,
        error_indexes: tenantIndexes.filter(idx => idx.status === 'error').length
      };

      return NextResponse.json({
        success: false,
        error: 'Database unavailable, using demo data',
        data: tenantIndexes,
        stats
      });
    }

  } catch (error) {
    console.error('Vectorize GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch vector indexes'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureServicesInitialized();

    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';
    const body = await request.json();
    const action = body.action || 'create';

    try {
      if (action === 'create') {
        const indexData = {
          name: body.name,
          nameAr: body.nameAr,
          description: body.description,
          descriptionAr: body.descriptionAr,
          dimensions: body.dimensions || 1536,
          metric: body.metric || 'cosine',
          vectorCount: 0,
          maxVectors: body.maxVectors,
          status: 'creating' as const,
          tenantId,
          metadata: {
            dataType: body.dataType || 'general',
            lastSync: new Date().toISOString(),
            syncStatus: 'synced' as const
          }
        };

        const newIndex = await serviceRegistry.vectorize.createIndex(indexData);
        return NextResponse.json({
          success: true,
          data: newIndex
        });
      } else if (action === 'sync') {
        const { id } = body;
        if (!id) {
          return NextResponse.json(
            { success: false, error: 'Index ID is required' },
            { status: 400 }
          );
        }

        const updates = {
          metadata: {
            dataType: body.dataType || 'general',
            lastSync: new Date().toISOString(),
            syncStatus: 'synced' as const
          }
        };

        const updatedIndex = await serviceRegistry.vectorize.updateIndex(id, updates, tenantId);
        if (updatedIndex) {
          return NextResponse.json({
            success: true,
            data: updatedIndex
          });
        } else {
          return NextResponse.json(
            { success: false, error: 'Index not found' },
            { status: 404 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.warn('Database unavailable for vectorize operation, operation not persisted:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database unavailable, operation not completed'
      });
    }

  } catch (error) {
    console.error('Vectorize POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform vectorize operation'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await ensureServicesInitialized();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Index ID is required' },
        { status: 400 }
      );
    }

    try {
      const updatedIndex = await serviceRegistry.vectorize.updateIndex(id, body, tenantId);
      if (updatedIndex) {
        return NextResponse.json({
          success: true,
          data: updatedIndex
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Index not found' },
          { status: 404 }
        );
      }
    } catch (dbError) {
      console.warn('Database unavailable for update vectorize index, operation not persisted:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database unavailable, index not updated'
      });
    }

  } catch (error) {
    console.error('Vectorize PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update vector index'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await ensureServicesInitialized();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Index ID is required' },
        { status: 400 }
      );
    }

    try {
      const deleted = await serviceRegistry.vectorize.deleteIndex(id, tenantId);
      if (deleted) {
        return NextResponse.json({
          success: true,
          message: 'Vector index deleted successfully'
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Index not found' },
          { status: 404 }
        );
      }
    } catch (dbError) {
      console.warn('Database unavailable for delete vectorize index, operation not persisted:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database unavailable, index not deleted'
      });
    }

  } catch (error) {
    console.error('Vectorize DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete vector index'
      },
      { status: 500 }
    );
  }
}