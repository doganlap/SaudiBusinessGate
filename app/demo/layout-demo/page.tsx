'use client';

import { ReactNode } from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { ContentArea, ContentHeader, ContentSection, ContentGrid } from '@/components/layout/ContentArea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DemoPageProps {
  title?: string;
  description?: string;
}

export default function DemoPage({ 
  title = "App Shell Framework Demo",
  description = "Demonstrating the new app shell layout system"
}: DemoPageProps) {
  return (
    <StandardLayout
      title={title}
      subtitle={description}
      layout="dashboard"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Demo", href: "/demo" },
        { label: "App Shell" }
      ]}
    >
      <ContentArea>
        <ContentHeader
          title="Layout Components Overview"
          subtitle="Comprehensive app shell framework with flexible layout options"
        />

        <ContentSection
          title="Available Layouts"
          subtitle="Choose from multiple pre-configured layouts"
        >
          <ContentGrid cols={2} gap={6}>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Standard Layout</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Full-featured layout with sidebar navigation, header, and content area.
              </p>
              <Badge variant="default">Default</Badge>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Dashboard Layout</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Optimized for dashboard interfaces with enhanced styling and spacing.
              </p>
              <Badge variant="secondary">Dashboard</Badge>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Minimal Layout</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Clean, minimal layout perfect for focused content and simple interfaces.
              </p>
              <Badge variant="outline">Minimal</Badge>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Custom Layout</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Fully customizable layout using the base AppShell component.
              </p>
              <Badge variant="outline">Custom</Badge>
            </Card>
          </ContentGrid>
        </ContentSection>

        <ContentSection
          title="Component Features"
          subtitle="Built-in features and capabilities"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Responsive Design</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Fully responsive layouts that adapt to different screen sizes and orientations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Theme Support</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Built-in dark mode and theme switching capabilities with smooth transitions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">RTL Support</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Full right-to-left language support with automatic layout adjustments.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">TypeScript</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Full TypeScript support with comprehensive type definitions and interfaces.
                </p>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          title="Quick Actions"
          subtitle="Try different layout configurations"
        >
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">
              Standard Layout
            </Button>
            <Button variant="secondary">
              Dashboard Layout
            </Button>
            <Button variant="outline">
              Minimal Layout
            </Button>
            <Button variant="ghost">
              Custom Configuration
            </Button>
          </div>
        </ContentSection>
      </ContentArea>
    </StandardLayout>
  );
}