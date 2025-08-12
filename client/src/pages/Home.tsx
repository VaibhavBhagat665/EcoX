import React from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { HeroSection } from '@/components/Home/HeroSection';
import { DashboardSection } from '@/components/Dashboard/DashboardSection';
import { AIFeaturesSection } from '@/components/AI/AIFeaturesSection';
import { CommunitySection } from '@/components/Community/CommunitySection';
import { ChatWidget } from '@/components/AI/ChatWidget';
import { TokenTradingPanel } from '@/components/Wallet/TokenTradingPanel';

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

        {/* Token Trading & Wallet Section */}
        <section className="section-padding bg-gradient-to-br from-black via-gray-900 to-black" id="tokens">
          <div className="container mx-auto max-w-7xl container-padding">
            <div className="text-center mb-12">
              <h2 className="heading-lg mb-6 text-white">
                Your <span className="text-gradient-primary">ECO Tokens</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Earn, trade, and manage your environmental impact tokens. Get rewarded for making the world more sustainable.
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-500 mx-auto mt-6 rounded-full"></div>
            </div>
            <TokenTradingPanel />
          </div>
        </section>

        <AIFeaturesSection />
        <CommunitySection />
      </main>
      
      <Footer />
      <ChatWidget />
    </div>
  );
};
