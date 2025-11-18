import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MasterLayout from './components/MasterLayout';
import HomePage from './components/HomePage';
import DemoShowcasePlatform from './components/DemoShowcasePlatform';
import PMOInteractiveStory from './components/PMOInteractiveStory';
import ThemeShowcase from './components/ThemeShowcase';
import AssessmentWizard from './components/AssessmentWizard';
import EnhancedAssessmentPage from './components/EnhancedAssessmentPage';
import OrganizationsPage from './components/OrganizationsPage';
import RealDataDashboard from './components/RealDataDashboard';
import SmartTemplateSelector from './components/SmartTemplateSelector';
import EntityBadgeKitExamples from './components/EntityBadgeKitExamples';
import UniversalTableViewer from './components/UniversalTableViewer';
import EnhancedOrganizationForm from './components/EnhancedOrganizationForm';
import AdminDashboard from './components/AdminDashboard';
import NotFoundPage from './components/NotFoundPage';

/**
 * ==========================================
 * MAIN APPLICATION ROUTER
 * ==========================================
 * 
 * This is an example App.jsx showing how to integrate
 * the Demo Showcase Platform with routing.
 */

function App() {
  return (
    <Router>
      <Routes>
        {/* PMO Interactive Story - Full page layout (no MasterLayout) */}
        <Route path="/pmo-story" element={<PMOInteractiveStory />} />
        
        {/* Theme Showcase - Full page to demonstrate theming */}
        <Route path="/theme-showcase" element={<ThemeShowcase />} />
        
        {/* Routes with MasterLayout */}
        <Route path="/" element={
          <MasterLayout>
            <HomePage />
          </MasterLayout>
        } />
        
        <Route path="/demo-showcase" element={
          <MasterLayout>
            <DemoShowcasePlatform />
          </MasterLayout>
        } />
        
        {/* Dashboard & Analytics */}
        <Route path="/dashboard" element={
          <MasterLayout>
            <RealDataDashboard />
          </MasterLayout>
        } />
        
        <Route path="/admin" element={
          <MasterLayout>
            <AdminDashboard />
          </MasterLayout>
        } />
        
        {/* Assessment Routes */}
        <Route path="/assessments" element={
          <MasterLayout>
            <EnhancedAssessmentPage />
          </MasterLayout>
        } />
        
        <Route path="/assessment-wizard" element={
          <MasterLayout>
            <AssessmentWizard />
          </MasterLayout>
        } />
        
        {/* Organization Management */}
        <Route path="/organizations" element={
          <MasterLayout>
            <OrganizationsPage />
          </MasterLayout>
        } />
        
        <Route path="/organization-form" element={
          <MasterLayout>
            <EnhancedOrganizationForm />
          </MasterLayout>
        } />
        
        {/* Templates & Tools */}
        <Route path="/templates" element={
          <MasterLayout>
            <SmartTemplateSelector />
          </MasterLayout>
        } />
        
        <Route path="/table-viewer" element={
          <MasterLayout>
            <UniversalTableViewer />
          </MasterLayout>
        } />
        
        {/* UI Components & Examples */}
        <Route path="/ui-components" element={
          <MasterLayout>
            <EntityBadgeKitExamples />
          </MasterLayout>
        } />
        
        {/* 404 Not Found - Catch all unmatched routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;

