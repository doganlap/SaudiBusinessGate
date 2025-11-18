import React, { useState } from 'react';
import { 
  Palette, 
  Sun, 
  Moon, 
  Check, 
  Star,
  TrendingUp,
  Users,
  FileText,
  Settings,
  Bell,
  ChevronRight,
  Activity,
  BarChart3,
  Zap
} from 'lucide-react';
import { useAdvancedTheme } from '../contexts/AdvancedThemeContext';
import ThemeSelector from './ThemeSelector';

/**
 * ==========================================
 * THEME SHOWCASE COMPONENT
 * ==========================================
 * 
 * Demonstrates all theme features:
 * - Multiple color schemes
 * - Dark/Light mode
 * - Component variations
 * - Interactive elements
 */

function ThemeShowcase() {
  const { currentTheme, isDark, themeInfo } = useAdvancedTheme();
  const [activeTab, setActiveTab] = useState('components');

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ 
        backgroundColor: currentTheme.background,
        color: currentTheme.text 
      }}
    >
      {/* Hero Section */}
      <div 
        className="p-8 rounded-b-3xl shadow-lg"
        style={{ 
          backgroundColor: currentTheme.primary,
          color: '#fff'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Advanced Theme System</h1>
              <p className="text-lg opacity-90">
                Explore 8+ beautiful themes with dark mode support
              </p>
            </div>
            <ThemeSelector compact />
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Themes', value: '8+', icon: Palette },
              { label: 'Color Modes', value: '2', icon: isDark ? Moon : Sun },
              { label: 'Components', value: '50+', icon: Star },
              { label: 'CSS Variables', value: '15+', icon: Settings }
            ].map((stat, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-lg bg-white bg-opacity-10 backdrop-blur"
              >
                <stat.icon className="mb-2" size={24} />
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm opacity-80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Current Theme Info */}
        <div 
          className="p-6 rounded-xl mb-8 shadow-md"
          style={{ 
            backgroundColor: currentTheme.surface,
            border: `2px solid ${currentTheme.border}`
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: currentTheme.primary }}>
                {themeInfo.name}
              </h2>
              <p className="opacity-70">{themeInfo.description}</p>
              <p className="text-sm mt-2 opacity-60">
                Mode: <span className="font-medium">{isDark ? 'Dark' : 'Light'}</span>
              </p>
            </div>
            <div className="flex gap-2">
              {['primary', 'secondary', 'accent'].map((colorKey) => (
                <div key={colorKey} className="text-center">
                  <div
                    className="w-16 h-16 rounded-lg shadow-md mb-2"
                    style={{ backgroundColor: currentTheme[colorKey] }}
                  />
                  <span className="text-xs opacity-60 capitalize">{colorKey}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'components', label: 'Components', icon: Star },
            { id: 'colors', label: 'Colors', icon: Palette },
            { id: 'examples', label: 'Examples', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all"
              style={{
                backgroundColor: activeTab === tab.id ? currentTheme.primary : currentTheme.surface,
                color: activeTab === tab.id ? '#fff' : currentTheme.text,
                border: `1px solid ${currentTheme.border}`
              }}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'components' && <ComponentsTab />}
        {activeTab === 'colors' && <ColorsTab />}
        {activeTab === 'examples' && <ExamplesTab />}
      </div>
    </div>
  );
}

function ComponentsTab() {
  const { currentTheme } = useAdvancedTheme();

  return (
    <div className="space-y-8">
      {/* Buttons */}
      <Section title="Buttons" icon={Star}>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="success">Success Button</Button>
          <Button variant="warning">Warning Button</Button>
          <Button variant="error">Error Button</Button>
          <Button variant="outline">Outline Button</Button>
        </div>
      </Section>

      {/* Cards */}
      <Section title="Cards" icon={FileText}>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              style={{
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <Star size={24} color="#fff" />
                </div>
                <div>
                  <h3 className="font-semibold">Card Title {i}</h3>
                  <p className="text-sm opacity-70">Subtitle</p>
                </div>
              </div>
              <p className="text-sm opacity-80 mb-4">
                This is a sample card component demonstrating the theme colors and styles.
              </p>
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: currentTheme.primary,
                  color: '#fff'
                }}
              >
                Learn More
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Inputs */}
      <Section title="Form Controls" icon={Settings}>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Text Input</label>
            <input
              type="text"
              placeholder="Enter text..."
              className="w-full px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: currentTheme.background,
                border: `1px solid ${currentTheme.border}`,
                color: currentTheme.text
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Select</label>
            <select
              className="w-full px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: currentTheme.background,
                border: `1px solid ${currentTheme.border}`,
                color: currentTheme.text
              }}
            >
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
        </div>
      </Section>

      {/* Alerts */}
      <Section title="Alerts" icon={Bell}>
        <div className="space-y-3">
          {[
            { type: 'success', message: 'Operation completed successfully!' },
            { type: 'warning', message: 'Please review your settings.' },
            { type: 'error', message: 'An error occurred. Please try again.' },
            { type: 'info', message: 'New updates are available.' }
          ].map((alert, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg flex items-center gap-3"
              style={{
                backgroundColor: currentTheme[alert.type],
                color: '#fff'
              }}
            >
              <Bell size={20} />
              <span className="font-medium">{alert.message}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function ColorsTab() {
  const { currentTheme } = useAdvancedTheme();

  const colorGroups = [
    {
      title: 'Primary Colors',
      colors: ['primary', 'primaryHover', 'secondary', 'accent']
    },
    {
      title: 'Background Colors',
      colors: ['background', 'surface', 'surfaceHover']
    },
    {
      title: 'Text Colors',
      colors: ['text', 'textSecondary']
    },
    {
      title: 'Status Colors',
      colors: ['success', 'warning', 'error', 'info']
    },
    {
      title: 'Layout Colors',
      colors: ['sidebar', 'sidebarText', 'header', 'border']
    }
  ];

  return (
    <div className="space-y-8">
      {colorGroups.map((group, idx) => (
        <Section key={idx} title={group.title} icon={Palette}>
          <div className="grid grid-cols-4 gap-4">
            {group.colors.map((colorKey) => (
              <div
                key={colorKey}
                className="p-4 rounded-lg shadow-md"
                style={{ backgroundColor: currentTheme.surface }}
              >
                <div
                  className="w-full h-24 rounded-lg mb-3 shadow-inner"
                  style={{ backgroundColor: currentTheme[colorKey] }}
                />
                <p className="font-medium text-sm mb-1 capitalize">
                  {colorKey.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-xs opacity-60 font-mono">
                  {currentTheme[colorKey]}
                </p>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}

function ExamplesTab() {
  const { currentTheme } = useAdvancedTheme();

  return (
    <div className="space-y-8">
      {/* Dashboard Example */}
      <Section title="Dashboard Layout" icon={BarChart3}>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: '12,345', change: '+12%', icon: Users, color: 'primary' },
            { label: 'Revenue', value: '$45.2K', change: '+8%', icon: TrendingUp, color: 'success' },
            { label: 'Active Projects', value: '23', change: '-2%', icon: Activity, color: 'warning' },
            { label: 'Completed', value: '156', change: '+15%', icon: Check, color: 'info' }
          ].map((stat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-lg shadow-md"
              style={{
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon size={24} style={{ color: currentTheme[stat.color] }} />
                <span
                  className="text-sm font-medium px-2 py-1 rounded"
                  style={{
                    backgroundColor: currentTheme[stat.color],
                    color: '#fff'
                  }}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm opacity-70">{stat.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* List Example */}
      <Section title="Interactive List" icon={FileText}>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="p-4 rounded-lg flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <Zap size={20} color="#fff" />
                </div>
                <div>
                  <p className="font-medium">List Item {item}</p>
                  <p className="text-sm opacity-70">Description text goes here</p>
                </div>
              </div>
              <ChevronRight size={20} style={{ color: currentTheme.textSecondary }} />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// Helper Components
function Section({ title, icon: Icon, children }) {
  const { currentTheme } = useAdvancedTheme();
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Icon size={20} style={{ color: currentTheme.primary }} />
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Button({ variant = 'primary', children, ...props }) {
  const { currentTheme } = useAdvancedTheme();
  
  const styles = {
    primary: {
      backgroundColor: currentTheme.primary,
      color: '#fff'
    },
    secondary: {
      backgroundColor: currentTheme.secondary,
      color: '#fff'
    },
    success: {
      backgroundColor: currentTheme.success,
      color: '#fff'
    },
    warning: {
      backgroundColor: currentTheme.warning,
      color: '#fff'
    },
    error: {
      backgroundColor: currentTheme.error,
      color: '#fff'
    },
    outline: {
      backgroundColor: 'transparent',
      color: currentTheme.primary,
      border: `2px solid ${currentTheme.primary}`
    }
  };
  
  return (
    <button
      className="px-6 py-2 rounded-lg font-medium transition-all hover:opacity-90 hover:scale-105"
      style={styles[variant]}
      {...props}
    >
      {children}
    </button>
  );
}

export default ThemeShowcase;
