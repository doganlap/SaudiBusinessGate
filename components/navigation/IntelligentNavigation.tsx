'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles,
  Search,
  TrendingUp,
  Bot,
  BookOpen,
  Lightbulb,
  Navigation,
  X,
  ChevronRight,
  Star,
  Clock,
  Zap
} from 'lucide-react';

interface AISuggestion {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
  confidence: number;
  category: 'productivity' | 'learning' | 'automation' | 'analytics';
}

interface NavigationGuide {
  id: string;
  title: string;
  description: string;
  steps: NavigationStep[];
  currentStep: number;
  completed: boolean;
}

interface NavigationStep {
  id: string;
  title: string;
  description: string;
  target: string;
  completed: boolean;
}

interface IntelligentNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  userPreferences?: any;
}

export default function IntelligentNavigation({ 
  isOpen, 
  onClose, 
  userRole = 'user',
  userPreferences = {}
}: IntelligentNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [activeGuides, setActiveGuides] = useState<NavigationGuide[]>([]);
  const [isLearning, setIsLearning] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Mock AI suggestions based on current page and user behavior
  const generateAISuggestions = () => {
    const suggestions: AISuggestion[] = [];
    
    // Context-based suggestions
    if (pathname.includes('/dashboard')) {
      suggestions.push({
        id: '1',
        title: 'View Financial Analytics',
        description: 'Analyze your financial performance with detailed charts',
        href: '/finance/analytics',
        icon: TrendingUp,
        confidence: 0.9,
        category: 'analytics'
      });
      suggestions.push({
        id: '2',
        title: 'Check Sales Pipeline',
        description: 'Review current sales opportunities and forecasts',
        href: '/sales/opportunities',
        icon: TrendingUp,
        confidence: 0.85,
        category: 'analytics'
      });
    }
    
    if (pathname.includes('/finance')) {
      suggestions.push({
        id: '3',
        title: 'Automate Invoice Processing',
        description: 'Set up AI-powered invoice automation',
        href: '/ai/automation/invoices',
        icon: Bot,
        confidence: 0.95,
        category: 'automation'
      });
      suggestions.push({
        id: '4',
        title: 'Generate Financial Report',
        description: 'Create comprehensive financial reports',
        href: '/finance/reports',
        icon: BookOpen,
        confidence: 0.88,
        category: 'productivity'
      });
    }
    
    // User role-based suggestions
    if (userRole === 'admin') {
      suggestions.push({
        id: '5',
        title: 'System Health Check',
        description: 'Monitor system performance and health',
        href: '/admin/monitoring',
        icon: Zap,
        confidence: 0.92,
        category: 'analytics'
      });
    }
    
    // Learning suggestions
    suggestions.push({
      id: '6',
      title: 'Learn Advanced Features',
      description: 'Discover powerful features you might have missed',
      href: '/help/advanced-features',
      icon: Lightbulb,
      confidence: 0.75,
      category: 'learning'
    });
    
    return suggestions;
  };

  // Generate navigation guides
  const generateNavigationGuides = () => {
    const guides: NavigationGuide[] = [];
    
    if (pathname === '/dashboard' && userRole === 'new_user') {
      guides.push({
        id: 'getting-started',
        title: 'Getting Started Guide',
        description: 'Learn the basics of DoganHub Platform',
        steps: [
          {
            id: 'step1',
            title: 'Explore Dashboard',
            description: 'Familiarize yourself with the main dashboard',
            target: '/dashboard',
            completed: true
          },
          {
            id: 'step2',
            title: 'Check Finance Module',
            description: 'Review your financial overview',
            target: '/finance',
            completed: false
          },
          {
            id: 'step3',
            title: 'Set Up Profile',
            description: 'Complete your profile settings',
            target: '/settings/profile',
            completed: false
          }
        ],
        currentStep: 1,
        completed: false
      });
    }
    
    return guides;
  };

  useEffect(() => {
    if (isOpen) {
      setAiSuggestions(generateAISuggestions());
      setActiveGuides(generateNavigationGuides());
    }
  }, [isOpen, pathname, userRole]);

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    router.push(suggestion.href);
    onClose();
  };

  const handleGuideStep = (step: NavigationStep, guide: NavigationGuide) => {
    router.push(step.target);
    
    // Update guide progress
    const updatedGuides = activeGuides.map(g => {
      if (g.id === guide.id) {
        const updatedSteps = g.steps.map(s => 
          s.id === step.id ? { ...s, completed: true } : s
        );
        const allCompleted = updatedSteps.every(s => s.completed);
        return {
          ...g,
          steps: updatedSteps,
          currentStep: g.currentStep + 1,
          completed: allCompleted
        };
      }
      return g;
    });
    
    setActiveGuides(updatedGuides);
    onClose();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity': return Zap;
      case 'learning': return BookOpen;
      case 'automation': return Bot;
      case 'analytics': return TrendingUp;
      default: return Sparkles;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'productivity': return 'bg-blue-100 text-blue-800';
      case 'learning': return 'bg-green-100 text-green-800';
      case 'automation': return 'bg-purple-100 text-purple-800';
      case 'analytics': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">AI Navigation Assistant</h2>
                <p className="text-sm text-gray-500">Smart suggestions & guidance</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search features, modules, or ask anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* AI Suggestions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">AI Suggestions</h3>
                <button
                  onClick={() => setIsLearning(!isLearning)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    isLearning 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isLearning ? '🧠 Learning' : '💡 Learn'}
                </button>
              </div>
              
              <div className="space-y-3">
                {aiSuggestions.map((suggestion) => {
                  const IconComponent = suggestion.icon;
                  const CategoryIcon = getCategoryIcon(suggestion.category);
                  
                  return (
                    <div
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                              {suggestion.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(suggestion.category)}`}>
                                <CategoryIcon className="h-3 w-3 inline mr-1" />
                                {suggestion.category}
                              </span>
                              <div className="flex items-center">
                                <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
                                    style={{ width: `${suggestion.confidence * 100}%` }}
                                  />
                                </div>
                                <span className="ml-2 text-xs text-gray-500">
                                  {Math.round(suggestion.confidence * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {suggestion.description}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Guides */}
            {activeGuides.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Guided Tours</h3>
                  <button
                    onClick={() => setShowGuide(!showGuide)}
                    className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {showGuide ? 'Hide Guide' : 'Show Guide'}
                  </button>
                </div>
                
                {showGuide && (
                  <div className="space-y-4">
                    {activeGuides.map((guide) => (
                      <div key={guide.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-blue-900">{guide.title}</h4>
                          <span className="text-xs text-blue-600">
                            Step {guide.currentStep} of {guide.steps.length}
                          </span>
                        </div>
                        <p className="text-sm text-blue-700 mb-3">{guide.description}</p>
                        
                        <div className="space-y-2">
                          {guide.steps.map((step, index) => (
                            <div
                              key={step.id}
                              className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                step.completed 
                                  ? 'bg-green-100 text-green-800' 
                                  : index === guide.currentStep - 1
                                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                              onClick={() => !step.completed && index === guide.currentStep - 1 && handleGuideStep(step, guide)}
                            >
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                step.completed 
                                  ? 'bg-green-500 text-white' 
                                  : index === guide.currentStep - 1
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-300 text-gray-600'
                              }`}>
                                {step.completed ? '✓' : index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{step.title}</p>
                                <p className="text-xs opacity-75">{step.description}</p>
                              </div>
                              {index === guide.currentStep - 1 && !step.completed && (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    router.push('/settings');
                    onClose();
                  }}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-center transition-colors"
                >
                  <Navigation className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                  <span className="text-xs text-gray-700">Settings</span>
                </button>
                <button
                  onClick={() => {
                    router.push('/help');
                    onClose();
                  }}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-center transition-colors"
                >
                  <BookOpen className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                  <span className="text-xs text-gray-700">Help</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}