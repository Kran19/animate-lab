import React from 'react';
import { useApp } from '../../store/appStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandCenter } from './CommandCenter';
import { CaptureWizardModal } from './CaptureWizardModal';

// Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { WebsitesScreen } from '../screens/WebsitesScreen';
import { WebsiteDetailScreen } from '../screens/WebsiteDetailScreen';
import { PagesScreen } from '../screens/PagesScreen';
import { PageDetailScreen } from '../screens/PageDetailScreen';
import { SectionsScreen } from '../screens/SectionsScreen';
import { ComponentsScreen } from '../screens/ComponentsScreen';
import { ComponentDetailScreen } from '../screens/ComponentDetailScreen';
import { AnimationsScreen } from '../screens/AnimationsScreen';
import { ThreeDLibraryScreen } from '../screens/ThreeDLibraryScreen';
import { AssetsScreen } from '../screens/AssetsScreen';
import { TechnologiesScreen } from '../screens/TechnologiesScreen';
import { JobsScreen } from '../screens/JobsScreen';
import { SourceInspectorScreen } from '../screens/SourceInspectorScreen';
import { StorageScreen } from '../screens/StorageScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export const AppShell: React.FC = () => {
  const { route } = useApp();

  const renderScreen = () => {
    switch (route.screen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'websites':
        return <WebsitesScreen />;
      case 'website_detail':
        return <WebsiteDetailScreen />;
      case 'pages':
        return <PagesScreen />;
      case 'page_detail':
        return <PageDetailScreen />;
      case 'sections':
        return <SectionsScreen />;
      case 'components':
        return <ComponentsScreen />;
      case 'component_detail':
        return <ComponentDetailScreen />;
      case 'animations':
        return <AnimationsScreen />;
      case 'threed':
        return <ThreeDLibraryScreen />;
      case 'assets':
        return <AssetsScreen />;
      case 'technologies':
        return <TechnologiesScreen />;
      case 'jobs':
        return <JobsScreen />;
      case 'source_inspector':
        return <SourceInspectorScreen />;
      case 'storage':
        return <StorageScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-background text-text-primary overflow-hidden font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Workspace Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-background">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {renderScreen()}
        </main>
      </div>

      {/* Global Modals */}
      <CommandCenter />
      <CaptureWizardModal />
    </div>
  );
};
