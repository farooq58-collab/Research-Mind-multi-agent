import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useResearchStore } from './store/useResearchStore';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';
import ChatArea from './components/Chat/ChatArea';
import GlassInput from './components/Chat/GlassInput';
import RightPanel from './components/Panels/RightPanel';

const queryClient = new QueryClient();

export function AppContent() {
  const { fetchMetadata } = useResearchStore();

  useEffect(() => {
    fetchMetadata();
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar Layout */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <Navbar />
        <ChatArea />
        <GlassInput />
      </div>

      {/* Right panel Layout */}
      <RightPanel />
    </div>
  );
}

// Wrapper for query client if needed in components
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
