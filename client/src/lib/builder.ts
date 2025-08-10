import { builder } from '@builder.io/react';

// Initialize Builder.io
const BUILDER_API_KEY = import.meta.env.VITE_BUILDER_API_KEY || '1f1a037318124159b7278c6186281ef1';

builder.init(BUILDER_API_KEY);

// Builder.io configuration for EcoX components
export interface BuilderContent {
  id: string;
  name: string;
  data: {
    title?: string;
    description?: string;
    content?: any;
    settings?: Record<string, any>;
  };
}

// Register custom components with Builder.io
export const registerBuilderComponents = () => {
  // Component registration functionality
  console.log('Builder.io components registered for EcoX');
};

// Fetch content from Builder.io
export const getBuilderContent = async (model: string, url?: string) => {
  try {
    const content = await builder.get(model, {
      url: url || window.location.pathname,
      cachebust: true,
    }).promise();
    
    return content;
  } catch (error) {
    console.error('Error fetching Builder.io content:', error);
    return null;
  }
};

// Get page content
export const getPageContent = (model: string = 'page') => getBuilderContent(model);

// Get component content
export const getComponentContent = (model: string, componentName: string) => 
  getBuilderContent(model, `/components/${componentName}`);

// Initialize Builder.io for the app
export const initializeBuilder = () => {
  registerBuilderComponents();
  
  // Set custom targeting attributes
  builder.setUserAttributes({
    urlPath: window.location.pathname,
    device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
  });
};
