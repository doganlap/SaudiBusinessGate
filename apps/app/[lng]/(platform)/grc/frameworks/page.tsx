'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, 
  ExternalLink,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface Framework {
  id: string;
  code: string;
  name_en: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  version?: string;
  effective_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function FrameworksPage() {
  const params = useParams() as any;
  const lng = (params?.lng as string) || 'en';
  
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFrameworks();
  }, []);

  const fetchFrameworks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/grc/frameworks', {
        headers: {
          'x-tenant-id': 'default-tenant',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFrameworks(data.data || []);
      } else {
        setError('Failed to load frameworks');
      }
    } catch (err) {
      console.error('Error fetching frameworks:', err);
      setError('Failed to load frameworks');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'deprecated': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'draft': return <Info className="h-4 w-4 text-gray-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Regulatory Frameworks</h1>
          <p className="text-gray-600">
            Manage regulatory frameworks and compliance requirements
          </p>
        </div>

        {/* Frameworks Grid */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
            <button
              onClick={fetchFrameworks}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        ) : frameworks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Frameworks Found</h3>
            <p className="text-gray-600">
              No regulatory frameworks are currently configured for your organization.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {frameworks.map((framework) => (
              <div key={framework.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {framework.code}
                        </h3>
                        {framework.version && (
                          <span className="text-sm text-gray-500">v{framework.version}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(framework.status)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(framework.status)}`}>
                        {framework.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {framework.name_en}
                    </h4>
                    {framework.name_ar && (
                      <h4 className="font-medium text-gray-700 mb-2 text-right" dir="rtl">
                        {framework.name_ar}
                      </h4>
                    )}
                    {framework.description_en && (
                      <p className="text-sm text-gray-600 mb-2">
                        {framework.description_en}
                      </p>
                    )}
                    {framework.description_ar && (
                      <p className="text-sm text-gray-600 text-right" dir="rtl">
                        {framework.description_ar}
                      </p>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 mb-4">
                    {framework.effective_date && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Effective: {new Date(framework.effective_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Link
                      href={`/${lng}/grc/frameworks/${framework.id}/sections`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                    >
                      View Sections
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                    <Link
                      href={`/${lng}/grc/controls?framework_id=${framework.id}`}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      View Controls
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Framework Information */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">About Regulatory Frameworks</h3>
          <p className="text-blue-800 mb-4">
            Regulatory frameworks define the compliance requirements and standards that your organization must adhere to. 
            Each framework contains sections and requirements that are mapped to specific controls.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">NCA Framework</h4>
              <p className="text-gray-600">
                National Cybersecurity Authority regulations for cybersecurity compliance in Saudi Arabia.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">SAMA Framework</h4>
              <p className="text-gray-600">
                Saudi Arabian Monetary Authority regulations for financial institutions.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">PDPL Framework</h4>
              <p className="text-gray-600">
                Personal Data Protection Law requirements for data privacy and protection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
