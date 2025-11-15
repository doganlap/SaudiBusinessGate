'use client';

// =================================================================
// ENHANCED REPORT BUILDER FORM - ENTERPRISE EDITION
// =================================================================
// A modern, full-featured report builder with template selection,
// live preview, and advanced visualization options.
// =================================================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface QueryTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    parameters: Array<{
        name: string;
        type: string;
        required: boolean;
        default?: any;
    }>;
}

interface ReportConfig {
    name: string;
    description: string;
    templateId: string;
    parameters: Record<string, any>;
    visualizationType: 'table' | 'bar' | 'line' | 'pie';
    refreshInterval?: number;
}

export default function ReportBuilderForm() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Template, 2: Parameters, 3: Visualization, 4: Preview
    const [templates, setTemplates] = useState<QueryTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<QueryTemplate | null>(null);
    const [reportConfig, setReportConfig] = useState<ReportConfig>({
        name: '',
        description: '',
        templateId: '',
        parameters: {},
        visualizationType: 'table'
    });
    const [previewData, setPreviewData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch available templates
    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await fetch('/api/reports/templates');
            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            }
        } catch (err) {
            console.error('Failed to fetch templates:', err);
        }
    };

    const handleTemplateSelect = (template: QueryTemplate) => {
        setSelectedTemplate(template);
        setReportConfig(prev => ({
            ...prev,
            templateId: template.id,
            parameters: {}
        }));
        setStep(2);
    };

    const handleParameterChange = (paramName: string, value: any) => {
        setReportConfig(prev => ({
            ...prev,
            parameters: {
                ...prev.parameters,
                [paramName]: value
            }
        }));
    };

    const handlePreview = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/reports/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateId: reportConfig.templateId,
                    parameters: reportConfig.parameters
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate preview');
            }

            const data = await response.json();
            setPreviewData(data);
            setStep(4);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!reportConfig.name) {
            setError('Please enter a report name');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: reportConfig.name,
                    description: reportConfig.description,
                    query_definition: {
                        templateId: reportConfig.templateId,
                        parameters: reportConfig.parameters
                    },
                    visualization_config: {
                        type: reportConfig.visualizationType,
                        refreshInterval: reportConfig.refreshInterval
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save report');
            }

            const data = await response.json();
            router.push(`/reports/${data.id}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                        {s}
                    </div>
                    {s < 4 && (
                        <div className={`w-16 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    )}
                </div>
            ))}
        </div>
    );

    const renderTemplateSelection = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Select a Report Template</h2>
            <p className="text-gray-600">Choose from pre-built templates to get started quickly</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-all hover:shadow-lg"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                                <span className="inline-block mt-3 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                    {template.category}
                                </span>
                            </div>
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderParameterForm = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Configure Report Parameters</h2>
                    <p className="text-gray-600">Selected: {selectedTemplate?.name}</p>
                </div>
                <button
                    onClick={() => setStep(1)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                >
                    Change Template
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Report Name *
                    </label>
                    <input
                        type="text"
                        value={reportConfig.name}
                        onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="My Custom Report"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        value={reportConfig.description}
                        onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Brief description of what this report shows..."
                    />
                </div>

                {selectedTemplate?.parameters.map((param) => (
                    <div key={param.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {param.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            {param.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {param.type === 'date' ? (
                            <input
                                type="date"
                                value={reportConfig.parameters[param.name] || param.default || ''}
                                onChange={(e) => handleParameterChange(param.name, e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        ) : param.type === 'number' ? (
                            <input
                                type="number"
                                value={reportConfig.parameters[param.name] || param.default || ''}
                                onChange={(e) => handleParameterChange(param.name, parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        ) : (
                            <input
                                type="text"
                                value={reportConfig.parameters[param.name] || param.default || ''}
                                onChange={(e) => handleParameterChange(param.name, e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-between">
                <button
                    onClick={() => setStep(1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                    Back
                </button>
                <button
                    onClick={() => setStep(3)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Next: Visualization
                </button>
            </div>
        </div>
    );

    const renderVisualizationConfig = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Choose Visualization</h2>
            <p className="text-gray-600">Select how you want to display your data</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                    { type: 'table', icon: '??', label: 'Table' },
                    { type: 'bar', icon: '??', label: 'Bar Chart' },
                    { type: 'line', icon: '??', label: 'Line Chart' },
                    { type: 'pie', icon: '??', label: 'Pie Chart' }
                ].map((viz) => (
                    <div
                        key={viz.type}
                        onClick={() => setReportConfig(prev => ({ ...prev, visualizationType: viz.type as any }))}
                        className={`p-6 border-2 rounded-lg cursor-pointer transition-all text-center ${
                            reportConfig.visualizationType === viz.type
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                        }`}
                    >
                        <div className="text-4xl mb-2">{viz.icon}</div>
                        <div className="font-medium text-gray-900">{viz.label}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto-Refresh Interval (optional)
                </label>
                <select
                    value={reportConfig.refreshInterval || ''}
                    onChange={(e) => setReportConfig(prev => ({ 
                        ...prev, 
                        refreshInterval: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">No auto-refresh</option>
                    <option value="30">30 seconds</option>
                    <option value="60">1 minute</option>
                    <option value="300">5 minutes</option>
                    <option value="900">15 minutes</option>
                </select>
            </div>

            <div className="flex justify-between">
                <button
                    onClick={() => setStep(2)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                    Back
                </button>
                <button
                    onClick={handlePreview}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? 'Generating Preview...' : 'Preview Report'}
                </button>
            </div>
        </div>
    );

    const renderPreview = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Preview & Save</h2>
            <p className="text-gray-600">Review your report before saving</p>

            {previewData && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">{reportConfig.name}</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {previewData.columns?.map((col: string) => (
                                        <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {previewData.rows?.slice(0, 5).map((row: any, idx: number) => (
                                    <tr key={idx}>
                                        {previewData.columns?.map((col: string) => (
                                            <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {row[col]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        Showing {Math.min(5, previewData.rows?.length || 0)} of {previewData.rowCount} rows
                    </p>
                </div>
            )}

            <div className="flex justify-between">
                <button
                    onClick={() => setStep(3)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                    Back
                </button>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                    {loading ? 'Saving...' : 'Save Report'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            {renderStepIndicator()}
            
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {step === 1 && renderTemplateSelection()}
            {step === 2 && renderParameterForm()}
            {step === 3 && renderVisualizationConfig()}
            {step === 4 && renderPreview()}
        </div>
    );
}
