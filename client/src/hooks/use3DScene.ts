import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export interface Scene3DState {
  isLoaded: boolean;
  isAnimating: boolean;
  environmentalData: {
    carbonLevel: number;
    temperature: number;
    humidity: number;
    airQuality: number;
  };
}

export const use3DScene = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [state, setState] = useState<Scene3DState>({
    isLoaded: false,
    isAnimating: true,
    environmentalData: {
      carbonLevel: 380, // ppm
      temperature: 22,  // °C
      humidity: 65,     // %
      airQuality: 85,   // AQI score
    },
  });

  // Animation frame hook
  useFrame((state, delta) => {
    if (!meshRef.current || !groupRef.current) return;

    // Rotate the main group
    groupRef.current.rotation.y += delta * 0.2;
    
    // Floating animation for environmental elements
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.3;
    
    // Pulse effect based on environmental data
    const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    meshRef.current.scale.setScalar(scale);
  });

  // Update environmental data
  const updateEnvironmentalData = (newData: Partial<Scene3DState['environmentalData']>) => {
    setState(prev => ({
      ...prev,
      environmentalData: { ...prev.environmentalData, ...newData }
    }));
  };

  // Toggle animation
  const toggleAnimation = () => {
    setState(prev => ({ ...prev, isAnimating: !prev.isAnimating }));
  };

  // Scene initialization
  useEffect(() => {
    setState(prev => ({ ...prev, isLoaded: true }));
  }, []);

  return {
    meshRef,
    groupRef,
    state,
    updateEnvironmentalData,
    toggleAnimation,
  };
};

// Hook for environmental particle system
export const useEnvironmentalParticles = (count: number = 100) => {
  const particlesRef = useRef<THREE.Points>(null);
  const [particles] = useState(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Random positions in sphere
      const radius = Math.random() * 10 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Eco-friendly colors (greens and blues)
      colors[i3] = Math.random() * 0.5; // Red
      colors[i3 + 1] = 0.8 + Math.random() * 0.2; // Green
      colors[i3 + 2] = 0.6 + Math.random() * 0.4; // Blue
    }
    
    return { positions, colors };
  });

  useFrame((state) => {
    if (!particlesRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Gentle floating motion
      positions[i3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.01;
      
      // Wrap around
      if (positions[i3 + 1] > 15) {
        positions[i3 + 1] = -15;
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return { particlesRef, particles };
};

// Hook for environmental data visualization
export const useDataVisualization = () => {
  const [visualizationMode, setVisualizationMode] = useState<'carbon' | 'temperature' | 'humidity' | 'air'>('carbon');
  
  const getVisualizationColor = (value: number, mode: typeof visualizationMode) => {
    switch (mode) {
      case 'carbon':
        // Higher carbon = more red
        return new THREE.Color().setHSL(0.3 - (value / 500) * 0.3, 0.8, 0.5);
      case 'temperature':
        // Blue to red gradient
        return new THREE.Color().setHSL((30 - value) / 30 * 0.6, 0.8, 0.5);
      case 'humidity':
        // Dry to wet (yellow to blue)
        return new THREE.Color().setHSL(0.6 - (value / 100) * 0.5, 0.8, 0.5);
      case 'air':
        // Good air = green, bad air = red
        return new THREE.Color().setHSL((value / 100) * 0.3, 0.8, 0.5);
      default:
        return new THREE.Color(0x00d4aa);
    }
  };

  const createDataSphere = (data: number, mode: typeof visualizationMode) => {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: getVisualizationColor(data, mode),
      transparent: true,
      opacity: 0.8,
    });
    
    return new THREE.Mesh(geometry, material);
  };

  return {
    visualizationMode,
    setVisualizationMode,
    getVisualizationColor,
    createDataSphere,
  };
};
