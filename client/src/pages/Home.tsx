import React from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { HeroSection } from '@/components/Home/HeroSection';
import { DashboardSection } from '@/components/Dashboard/DashboardSection';
import { AIFeaturesSection } from '@/components/AI/AIFeaturesSection';
import { CommunitySection } from '@/components/Community/CommunitySection';
import { ChatWidget } from '@/components/AI/ChatWidget';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <Header />
      </div>
      
      {/* Main content with proper spacing to avoid header overlap */}
      <main className="pt-16 md:pt-20">
        <HeroSection />
        <DashboardSection />
        <AIFeaturesSection />
        <CommunitySection />
      </main>
      
      <Footer />
      <ChatWidget />
    </div>
  );
};