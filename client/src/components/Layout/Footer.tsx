import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const platformLinks = [
    { name: 'Dashboard', href: '#dashboard' },
    { name: 'Analytics', href: '#analytics' },
    { name: 'Community', href: '#community' },
    { name: 'Challenges', href: '#community' },
  ];

  const supportLinks = [
    { name: 'Documentation', href: '#' },
    { name: 'API Reference', href: '#' },
    { name: 'Support Center', href: '#' },
    { name: 'Privacy Policy', href: '#' },
  ];

  const companyLinks = [
    { name: 'About Us', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Press Kit', href: '#' },
    { name: 'Contact', href: '#' },
  ];

  const techStack = [
    { name: 'React', color: 'text-blue-400' },
    { name: 'Firebase', color: 'text-orange-400' },
    { name: 'Vercel AI', color: 'text-white' },
    { name: 'Three.js', color: 'text-green-400' }
  ];

  const handleLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      const elementId = href.substring(1);
      const element = document.getElementById(elementId);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-black border-t border-white/10 mt-20" role="contentinfo">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto max-w-7xl px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 glass-accent rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-black text-white tracking-tight">
                  Eco<span className="text-gradient-primary">X</span>
                </div>
                <div className="text-sm text-gray-400 font-medium">Intelligence Platform</div>
              </div>
            </div>
            
            <p className="text-gray-300 mb-8 max-w-md leading-relaxed">
              Empowering individuals and organizations to build a sustainable future through 
              AI-powered environmental intelligence and community-driven innovation.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a 
                href="https://github.com/yourusername"
                className="group w-12 h-12 glass-pro rounded-xl flex items-center justify-center hover:glass-pro-hover transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                aria-label="Visit our GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg 
                  className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-300" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>

              <a 
                href="https://linkedin.com/company/yourcompany"
                className="group w-12 h-12 glass-pro rounded-xl flex items-center justify-center hover:glass-pro-hover transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                aria-label="Visit our LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg 
                  className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>

              <a 
                href="https://twitter.com/yourcompany"
                className="group w-12 h-12 glass-pro rounded-xl flex items-center justify-center hover:glass-pro-hover transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                aria-label="Visit our Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg 
                  className="w-6 h-6 text-gray-400 group-hover:text-green-400 transition-colors duration-300" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>

              <a 
                href="https://discord.gg/yourserver"
                className="group w-12 h-12 glass-pro rounded-xl flex items-center justify-center hover:glass-pro-hover transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                aria-label="Join our Discord"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg 
                  className="w-6 h-6 text-gray-400 group-hover:text-purple-400 transition-colors duration-300" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Platform</h4>
            <nav aria-label="Platform navigation">
              <div className="space-y-4">
                {platformLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => handleLinkClick(link.href)}
                    className="block text-gray-400 hover:text-green-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-400/50 rounded px-1"
                  >
                    {link.name}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Resources</h4>
            <nav aria-label="Support navigation">
              <div className="space-y-4">
                {supportLinks.map((link) => (
                  <a 
                    key={link.name}
                    href={link.href} 
                    className="block text-gray-400 hover:text-green-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-400/50 rounded px-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </nav>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Company</h4>
            <nav aria-label="Company navigation">
              <div className="space-y-4">
                {companyLinks.map((link) => (
                  <a 
                    key={link.name}
                    href={link.href} 
                    className="block text-gray-400 hover:text-green-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-400/50 rounded px-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="glass-pro rounded-2xl p-8 mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
            <p className="text-gray-300 mb-6">Get the latest environmental insights and platform updates delivered to your inbox.</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 glass-pro rounded-xl text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-green-400/50"
              />
              <button className="btn-primary px-6 py-3">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-gray-400 text-sm">
            <div>© {currentYear} EcoX Intelligence Platform. All rights reserved.</div>
            <div className="flex items-center space-x-4">
              <a href="#" className="hover:text-green-400 transition-colors duration-300">Terms</a>
              <a href="#" className="hover:text-green-400 transition-colors duration-300">Privacy</a>
              <a href="#" className="hover:text-green-400 transition-colors duration-300">Cookies</a>
            </div>
          </div>
          
          {/* Tech Stack */}
          <div className="flex items-center space-x-6 mt-6 lg:mt-0">
            <span className="text-gray-400 text-sm font-medium">Built with</span>
            <div className="flex items-center space-x-3">
              {techStack.map((tech) => (
                <div
                  key={tech.name}
                  className="group relative"
                >
                  <span 
                    className={`text-xs ${tech.color} bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full font-medium transition-all duration-300 cursor-default border border-white/10 hover:border-white/20`}
                  >
                    {tech.name}
                  </span>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                    Powered by {tech.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Info Bar */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
              <div>API Status: Online</div>
              <div>CDN: Global</div>
            </div>
            <div className="flex items-center space-x-4">
              <div>v2.1.0</div>
              <div>Last updated: {new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 glass-pro rounded-full flex items-center justify-center hover:glass-pro-hover transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400/50 z-40 group"
        aria-label="Scroll to top"
      >
        <svg className="w-6 h-6 text-gray-400 group-hover:text-green-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  );
};