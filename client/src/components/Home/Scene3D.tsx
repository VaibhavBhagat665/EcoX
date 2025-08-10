import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { use3DScene, useEnvironmentalParticles, useDataVisualization } from '@/hooks/use3DScene';

// Environmental Globe Component
const EnvironmentalGlobe: React.FC = () => {
  const { meshRef, groupRef, state } = use3DScene();
  const { particlesRef, particles } = useEnvironmentalParticles(150);
  const { getVisualizationColor } = useDataVisualization();

  // Create earth-like sphere with environmental overlay
  const earthGeometry = useMemo(() => new THREE.SphereGeometry(2, 64, 64), []);
  const earthMaterial = useMemo(() => new THREE.MeshPhongMaterial({
    color: getVisualizationColor(state.environmentalData.carbonLevel, 'carbon'),
    transparent: true,
    opacity: 0.7,
    wireframe: false,
  }), [state.environmentalData.carbonLevel, getVisualizationColor]);

  // Particles geometry
  const particleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(particles.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(particles.colors, 3));
    return geometry;
  }, [particles]);

  const particleMaterial = useMemo(() => new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  }), []);

  return (
    <group ref={groupRef}>
      {/* Main Environmental Globe */}
      <mesh ref={meshRef} geometry={earthGeometry} material={earthMaterial}>
        {/* Inner glow effect */}
        <mesh scale={1.05}>
          <sphereGeometry args={[2, 32, 32]} />
          <meshBasicMaterial 
            color={0x00d4aa} 
            transparent 
            opacity={0.2} 
            side={THREE.BackSide}
          />
        </mesh>
      </mesh>

      {/* Environmental Particles */}
      <points ref={particlesRef} geometry={particleGeometry} material={particleMaterial} />

      {/* Floating Environmental Icons */}
      <FloatingIcons />

      {/* Ambient Lighting */}
      <ambientLight intensity={0.6} color={0x404040} />
      <pointLight position={[10, 10, 10]} intensity={1} color={0x00d4aa} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={0x0084ff} />
    </group>
  );
};

// Floating Environmental Icons
const FloatingIcons: React.FC = () => {
  const iconPositions = useMemo(() => [
    { pos: [3, 2, 1], icon: '🌱' },
    { pos: [-3, 1, 2], icon: '🌍' },
    { pos: [2, -2, -3], icon: '💨' },
    { pos: [-1, 3, -2], icon: '🔋' },
    { pos: [0, -3, 3], icon: '♻️' },
  ], []);

  return (
    <>
      {iconPositions.map((item, index) => (
        <FloatingIcon 
          key={index} 
          position={item.pos as [number, number, number]} 
          icon={item.icon}
          delay={index * 0.5}
        />
      ))}
    </>
  );
};

// Individual Floating Icon
const FloatingIcon: React.FC<{ 
  position: [number, number, number]; 
  icon: string; 
  delay: number; 
}> = ({ position, icon, delay }) => {
  const meshRef = React.useRef<THREE.Mesh>(null);

  React.useEffect(() => {
    if (!meshRef.current) return;

    const animate = () => {
      if (meshRef.current) {
        meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.001 + delay) * 0.5;
        meshRef.current.rotation.y += 0.01;
      }
      requestAnimationFrame(animate);
    };
    animate();
  }, [position, delay]);

  // Create a simple plane for the icon (in a real app, you'd use a proper 3D model or sprite)
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshPhongMaterial 
        color={0x00d4aa} 
        transparent 
        opacity={0.8}
        emissive={0x002211}
      />
    </mesh>
  );
};

// Loading fallback
const Loader: React.FC = () => (
  <div className="w-64 h-64 glass-morphism-eco rounded-full animate-float flex items-center justify-center">
    <div className="w-full h-full flex items-center justify-center">
      <i className="fas fa-globe-americas text-6xl text-eco-primary opacity-70 animate-spin" aria-hidden="true"></i>
    </div>
  </div>
);

// Error boundary fallback
const ErrorFallback: React.FC = () => (
  <div className="w-64 h-64 glass-morphism-eco rounded-full animate-float flex items-center justify-center">
    <div className="text-center">
      <i className="fas fa-globe-americas text-6xl text-eco-primary opacity-70 mb-4" aria-hidden="true"></i>
      <p className="text-white/70 text-sm">3D visualization unavailable</p>
    </div>
  </div>
);

// Main Scene3D Component
export const Scene3D: React.FC = () => {
  return (
    <div className="w-64 h-64 md:w-80 md:h-80">
      <Suspense fallback={<Loader />}>
        <Canvas
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
          }}
          style={{ background: 'transparent' }}
          dpr={[1, 2]}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
          
          <OrbitControls 
            enablePan={false}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={0.5}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={2 * Math.PI / 3}
          />
          
          <Environment preset="night" />
          
          <EnvironmentalGlobe />
        </Canvas>
      </Suspense>
    </div>
  );
};
