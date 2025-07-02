import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, Environment, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Atom, RotateCcw, ZoomIn, ZoomOut, Play, Pause } from 'lucide-react';
import * as THREE from 'three';

interface Atom {
  element: string;
  position: [number, number, number];
  color: string;
  size: number;
}

interface Bond {
  from: number;
  to: number;
  type: 'single' | 'double' | 'triple';
}

interface MoleculeData {
  name: string;
  formula: string;
  atoms: Atom[];
  bonds: Bond[];
  description: string;
}

// Sample molecules for chemistry visualization
const molecules: { [key: string]: MoleculeData } = {
  water: {
    name: 'Water',
    formula: 'H₂O',
    atoms: [
      { element: 'O', position: [0, 0, 0], color: '#ff0000', size: 0.8 },
      { element: 'H', position: [1.2, 0.8, 0], color: '#ffffff', size: 0.4 },
      { element: 'H', position: [1.2, -0.8, 0], color: '#ffffff', size: 0.4 }
    ],
    bonds: [
      { from: 0, to: 1, type: 'single' },
      { from: 0, to: 2, type: 'single' }
    ],
    description: 'Water molecule showing bent geometry due to lone pairs on oxygen'
  },
  methane: {
    name: 'Methane',
    formula: 'CH₄',
    atoms: [
      { element: 'C', position: [0, 0, 0], color: '#404040', size: 0.7 },
      { element: 'H', position: [1.1, 1.1, 1.1], color: '#ffffff', size: 0.4 },
      { element: 'H', position: [-1.1, -1.1, 1.1], color: '#ffffff', size: 0.4 },
      { element: 'H', position: [-1.1, 1.1, -1.1], color: '#ffffff', size: 0.4 },
      { element: 'H', position: [1.1, -1.1, -1.1], color: '#ffffff', size: 0.4 }
    ],
    bonds: [
      { from: 0, to: 1, type: 'single' },
      { from: 0, to: 2, type: 'single' },
      { from: 0, to: 3, type: 'single' },
      { from: 0, to: 4, type: 'single' }
    ],
    description: 'Methane showing tetrahedral geometry with sp³ hybridization'
  },
  benzene: {
    name: 'Benzene',
    formula: 'C₆H₆',
    atoms: [
      { element: 'C', position: [2, 0, 0], color: '#404040', size: 0.7 },
      { element: 'C', position: [1, 1.73, 0], color: '#404040', size: 0.7 },
      { element: 'C', position: [-1, 1.73, 0], color: '#404040', size: 0.7 },
      { element: 'C', position: [-2, 0, 0], color: '#404040', size: 0.7 },
      { element: 'C', position: [-1, -1.73, 0], color: '#404040', size: 0.7 },
      { element: 'C', position: [1, -1.73, 0], color: '#404040', size: 0.7 },
      { element: 'H', position: [3.2, 0, 0], color: '#ffffff', size: 0.4 },
      { element: 'H', position: [1.6, 2.77, 0], color: '#ffffff', size: 0.4 },
      { element: 'H', position: [-1.6, 2.77, 0], color: '#ffffff', size: 0.4 },
      { element: 'H', position: [-3.2, 0, 0], color: '#ffffff', size: 0.4 },
      { element: 'H', position: [-1.6, -2.77, 0], color: '#ffffff', size: 0.4 },
      { element: 'H', position: [1.6, -2.77, 0], color: '#ffffff', size: 0.4 }
    ],
    bonds: [
      { from: 0, to: 1, type: 'single' },
      { from: 1, to: 2, type: 'double' },
      { from: 2, to: 3, type: 'single' },
      { from: 3, to: 4, type: 'double' },
      { from: 4, to: 5, type: 'single' },
      { from: 5, to: 0, type: 'double' },
      { from: 0, to: 6, type: 'single' },
      { from: 1, to: 7, type: 'single' },
      { from: 2, to: 8, type: 'single' },
      { from: 3, to: 9, type: 'single' },
      { from: 4, to: 10, type: 'single' },
      { from: 5, to: 11, type: 'single' }
    ],
    description: 'Benzene ring showing aromatic structure with delocalized π electrons'
  }
};

const AtomSphere: React.FC<{ atom: Atom; isAnimating: boolean }> = ({ atom, isAnimating }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && isAnimating) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={atom.position}>
      <sphereGeometry args={[atom.size, 32, 32]} />
      <meshStandardMaterial color={atom.color} metalness={0.1} roughness={0.2} />
      <Html distanceFactor={10}>
        <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-bold pointer-events-none">
          {atom.element}
        </div>
      </Html>
    </mesh>
  );
};

const Bond: React.FC<{ from: Atom; to: Atom; type: 'single' | 'double' | 'triple' }> = ({ from, to, type }) => {
  const start = new THREE.Vector3(...from.position);
  const end = new THREE.Vector3(...to.position);
  const direction = end.clone().sub(start);
  const length = direction.length();
  const center = start.clone().add(end).multiplyScalar(0.5);
  
  const bondCount = type === 'single' ? 1 : type === 'double' ? 2 : 3;
  const bonds = [];
  
  for (let i = 0; i < bondCount; i++) {
    const offset = (i - (bondCount - 1) / 2) * 0.2;
    const perpendicular = new THREE.Vector3(0, 1, 0).cross(direction).normalize().multiplyScalar(offset);
    const bondCenter = center.clone().add(perpendicular);
    
    bonds.push(
      <mesh key={i} position={bondCenter.toArray()}>
        <cylinderGeometry args={[0.05, 0.05, length, 8]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
    );
  }
  
  return <>{bonds}</>;
};

const Molecule: React.FC<{ molecule: MoleculeData; isAnimating: boolean }> = ({ molecule, isAnimating }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current && isAnimating) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {molecule.atoms.map((atom, index) => (
        <AtomSphere key={index} atom={atom} isAnimating={isAnimating} />
      ))}
      {molecule.bonds.map((bond, index) => (
        <Bond
          key={index}
          from={molecule.atoms[bond.from]}
          to={molecule.atoms[bond.to]}
          type={bond.type}
        />
      ))}
    </group>
  );
};

interface MolecularViewerProps {
  moleculeName?: string;
  className?: string;
}

const MolecularViewer: React.FC<MolecularViewerProps> = ({ 
  moleculeName = 'water',
  className = ''
}) => {
  const [selectedMolecule, setSelectedMolecule] = useState(moleculeName);
  const [isAnimating, setIsAnimating] = useState(true);
  const [zoom, setZoom] = useState(1);
  
  const molecule = molecules[selectedMolecule] || molecules.water;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <Atom className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{molecule.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{molecule.formula}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`p-2 rounded-lg transition-colors ${
                isAnimating 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            
            <button
              onClick={() => setZoom(zoom * 1.2)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setZoom(zoom * 0.8)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setZoom(1)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3D Viewer */}
      <div className="h-96 relative">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 50 }}
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[-10, -10, -5]} intensity={0.5} />
            
            <Molecule molecule={molecule} isAnimating={isAnimating} />
            
            <Environment preset="studio" />
            <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={20} blur={2} far={4} />
            
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={20}
            />
          </Suspense>
        </Canvas>
        
        {/* Loading overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 opacity-0 pointer-events-none">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading 3D Model...</p>
          </div>
        </div>
      </div>

      {/* Molecule Selector */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(molecules).map(([key, mol]) => (
            <button
              key={key}
              onClick={() => setSelectedMolecule(key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMolecule === key
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {mol.name}
            </button>
          ))}
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {molecule.description}
        </p>
      </div>
    </motion.div>
  );
};

export default MolecularViewer;