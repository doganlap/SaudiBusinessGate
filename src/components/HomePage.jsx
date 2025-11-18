import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  ClipboardCheck, 
  Layers, 
  Zap, 
  Shield, 
  Globe,
  ArrowRight,
  Star,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

/**
 * ==========================================
 * HOMEPAGE - DOGANHUB MAIN LANDING PAGE
 * ==========================================
 * 
 * Features:
 * - Hero section with platform introduction
 * - Feature highlights with navigation links
 * - Stats and metrics overview
 * - Quick access to main modules
 * - Modern design with animations
 */

const HomePage = () => {
  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Real-Time Dashboard",
      description: "Monitor your organization's performance with advanced analytics and real-time data visualization.",
      link: "/dashboard",
      color: "blue"
    },
    {
      icon: <ClipboardCheck className="w-8 h-8" />,
      title: "Assessment Wizards",
      description: "Comprehensive assessment tools for GRC compliance and organizational evaluation.",
      link: "/assessments",
      color: "green"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Organization Management",
      description: "Complete organizational structure management with advanced forms and data handling.",
      link: "/organizations",
      color: "purple"
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: "Demo Showcase",
      description: "Interactive demonstrations of ICT solutions and proof-of-concept presentations.",
      link: "/demo-showcase",
      color: "orange"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Smart Templates",
      description: "AI-powered template selection and customization for various business needs.",
      link: "/templates",
      color: "yellow"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "PMO Interactive Story",
      description: "Comprehensive project management office storytelling and presentation platform.",
      link: "/pmo-story",
      color: "red"
    }
  ];

  const stats = [
    { label: "Active Organizations", value: "1,200+", icon: <Users className="w-5 h-5" /> },
    { label: "Completed Assessments", value: "15,000+", icon: <CheckCircle className="w-5 h-5" /> },
    { label: "Demo Solutions", value: "50+", icon: <Star className="w-5 h-5" /> },
    { label: "Performance Increase", value: "85%", icon: <TrendingUp className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Globe className="w-16 h-16 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              DoganHub
              <span className="block text-3xl md:text-4xl font-normal text-blue-200 mt-2">
                Intelligent Unified Platform
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed">
              Enterprise-grade platform combining React-based UI components, n8n automation workflows, 
              and AI-powered solutions for comprehensive organizational management and digital transformation.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/demo-showcase"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Explore Demos
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <Link 
                to="/dashboard"
                className="inline-flex items-center px-8 py-4 bg-blue-500/20 text-white rounded-xl font-semibold text-lg hover:bg-blue-500/30 backdrop-blur-sm transition-all duration-300 border border-white/20"
              >
                View Dashboard
                <BarChart3 className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-blue-500">
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Platform Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive suite of tools and modules designed for enterprise-level 
            organizational management, compliance, and digital transformation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              <div className={`inline-flex p-3 rounded-xl mb-6 text-${feature.color}-600 bg-${feature.color}-50 group-hover:bg-${feature.color}-100 transition-colors duration-300`}>
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {feature.description}
              </p>
              
              <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                Learn More
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Technology Stack Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center text-white">
            <h3 className="text-3xl font-bold mb-8">Built with Modern Technology</h3>
            <div className="flex flex-wrap justify-center gap-8 text-gray-300">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span>React 18.2.0</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>Node.js 18+</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span>n8n Automation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                <span>MongoDB</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span>Docker & Kubernetes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;