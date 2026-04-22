import React from 'react';
import { Box, Cylinder } from '@react-three/drei';
import { FurnitureItem } from '../../types';

export const Furniture: React.FC<{ item: FurnitureItem }> = ({ item }) => {
  const rotationRad = (item.rotation * Math.PI) / 180;

  switch (item.type) {
    case 'sofa':
      return (
        <group position={[item.x, 0.25, item.z]} rotation={[0, rotationRad, 0]}>
          {/* Base */}
          <Box args={[2, 0.4, 0.8]} position={[0, -0.05, 0]}>
            <meshPhysicalMaterial color="#2d3748" roughness={0.6} metalness={0.1} />
          </Box>
          {/* Cushions */}
          <Box args={[1.8, 0.3, 0.7]} position={[0, 0.15, 0.05]}>
            <meshPhysicalMaterial color="#4a5568" roughness={0.9} sheen={0.5} sheenRoughness={0.2} />
          </Box>
          {/* Backrest */}
          <Box args={[2, 0.6, 0.2]} position={[0, 0.3, -0.3]}>
            <meshPhysicalMaterial color="#4a5568" roughness={0.9} sheen={0.5} sheenRoughness={0.2} />
          </Box>
          {/* Arms */}
          <Box args={[0.2, 0.5, 0.8]} position={[-0.9, 0.25, 0]}>
            <meshPhysicalMaterial color="#2d3748" roughness={0.8} metalness={0.1} />
          </Box>
          <Box args={[0.2, 0.5, 0.8]} position={[0.9, 0.25, 0]}>
            <meshPhysicalMaterial color="#2d3748" roughness={0.8} metalness={0.1} />
          </Box>
        </group>
      );
    case 'bed':
      return (
        <group position={[item.x, 0.2, item.z]} rotation={[0, rotationRad, 0]}>
          {/* Frame */}
          <Box args={[1.7, 0.3, 2.1]} position={[0, -0.05, 0]}>
            <meshPhysicalMaterial color="#2d3748" roughness={0.8} />
          </Box>
          {/* Mattress */}
          <Box args={[1.6, 0.3, 2]} position={[0, 0.15, 0]}>
            <meshPhysicalMaterial color="#ffffff" roughness={0.9} sheen={0.3} />
          </Box>
          {/* Headboard */}
          <Box args={[1.7, 1, 0.1]} position={[0, 0.4, -1]}>
            <meshPhysicalMaterial color="#4a5568" roughness={0.8} />
          </Box>
          {/* Pillows */}
          <Box args={[0.6, 0.1, 0.4]} position={[-0.4, 0.35, -0.7]}>
            <meshStandardMaterial color="#f7fafc" />
          </Box>
          <Box args={[0.6, 0.1, 0.4]} position={[0.4, 0.35, -0.7]}>
            <meshStandardMaterial color="#f7fafc" />
          </Box>
        </group>
      );
    case 'table':
      return (
        <group position={[item.x, 0.4, item.z]} rotation={[0, rotationRad, 0]}>
          <Box args={[1.2, 0.05, 0.8]} position={[0, 0, 0]}>
            <meshPhysicalMaterial color="#718096" roughness={0.3} metalness={0.2} clearcoat={0.5} />
          </Box>
          {[[-0.5, -0.3], [0.5, -0.3], [-0.5, 0.3], [0.5, 0.3]].map(([lx, lz], i) => (
            <Box key={i} args={[0.05, 0.8, 0.05]} position={[lx, -0.4, lz]}>
              <meshPhysicalMaterial color="#2d3748" metalness={0.5} roughness={0.2} />
            </Box>
          ))}
        </group>
      );
    case 'chair':
      return (
        <group position={[item.x, 0.25, item.z]} rotation={[0, rotationRad, 0]}>
          <Box args={[0.4, 0.05, 0.4]} position={[0, 0, 0]}>
            <meshPhysicalMaterial color="#4a5568" roughness={0.8} />
          </Box>
          <Box args={[0.4, 0.5, 0.05]} position={[0, 0.25, -0.175]}>
            <meshPhysicalMaterial color="#4a5568" roughness={0.8} />
          </Box>
          {[[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].map(([lx, lz], i) => (
            <Box key={i} args={[0.05, 0.5, 0.05]} position={[lx, -0.25, lz]}>
              <meshPhysicalMaterial color="#2d3748" metalness={0.4} roughness={0.2} />
            </Box>
          ))}
        </group>
      );
    case 'bathtub':
      return (
        <group position={[item.x, 0.25, item.z]} rotation={[0, rotationRad, 0]}>
          <Box args={[1.6, 0.5, 0.8]} position={[0, 0, 0]}>
            <meshPhysicalMaterial color="#f7fafc" metalness={0.1} roughness={0.05} clearcoat={1} />
          </Box>
          <Box args={[1.4, 0.4, 0.6]} position={[0, 0.1, 0]}>
            <meshPhysicalMaterial color="#e2e8f0" transmission={0.1} thickness={0.5} />
          </Box>
        </group>
      );
    case 'kitchen_counter':
      return (
        <group position={[item.x, 0.45, item.z]} rotation={[0, rotationRad, 0]}>
          <Box args={[2, 0.9, 0.6]} position={[0, 0, 0]}>
            <meshPhysicalMaterial color="#f8fafc" roughness={0.1} metalness={0.1} clearcoat={0.5} />
          </Box>
          <Box args={[2.05, 0.05, 0.65]} position={[0, 0.475, 0]}>
            <meshPhysicalMaterial color="#1a202c" roughness={0.2} metalness={0.3} clearcoat={1} />
          </Box>
        </group>
      );
    case 'toilet':
      return (
        <group position={[item.x, 0.2, item.z]} rotation={[0, rotationRad, 0]}>
          {/* Bowl */}
          <Cylinder args={[0.25, 0.2, 0.4, 16]} position={[0, 0, 0.1]}>
            <meshPhysicalMaterial color="#ffffff" metalness={0.2} roughness={0.05} clearcoat={1} />
          </Cylinder>
          {/* Seat */}
          <Box args={[0.45, 0.05, 0.5]} position={[0, 0.2, 0.1]}>
            <meshPhysicalMaterial color="#ffffff" roughness={0.1} />
          </Box>
          {/* Tank */}
          <Box args={[0.5, 0.6, 0.2]} position={[0, 0.3, -0.25]}>
            <meshPhysicalMaterial color="#ffffff" metalness={0.2} roughness={0.05} clearcoat={1} />
          </Box>
        </group>
      );
    case 'desk':
      return (
        <group position={[item.x, 0.375, item.z]} rotation={[0, rotationRad, 0]}>
          <Box args={[1.4, 0.05, 0.7]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#a0aec0" />
          </Box>
          <Box args={[0.05, 0.75, 0.7]} position={[-0.65, -0.375, 0]}>
            <meshStandardMaterial color="#4a5568" />
          </Box>
          <Box args={[0.05, 0.75, 0.7]} position={[0.65, -0.375, 0]}>
            <meshStandardMaterial color="#4a5568" />
          </Box>
        </group>
      );
    case 'wardrobe':
      return (
        <group position={[item.x, 1, item.z]} rotation={[0, rotationRad, 0]}>
          <Box args={[1.2, 2, 0.6]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#4a5568" />
          </Box>
          <Box args={[0.02, 0.2, 0.02]} position={[-0.1, 0, 0.31]}>
            <meshStandardMaterial color="#cbd5e0" />
          </Box>
          <Box args={[0.02, 0.2, 0.02]} position={[0.1, 0, 0.31]}>
            <meshStandardMaterial color="#cbd5e0" />
          </Box>
        </group>
      );
    case 'stairs_unit':
      return (
        <group position={[item.x, 1.25, item.z]} rotation={[0, rotationRad, 0]}>
          <group position={[0, -1.25, 0]}>
            {/* Steps - Exactly 12 steps, total height 2.5m, total depth 3.0m */}
            {[...Array(12)].map((_, i) => (
              <Box 
                key={i} 
                args={[1.4, 0.15, 0.25]} 
                position={[0, (i + 0.5) * (2.5 / 12), i * 0.25 - 1.875]} // Start at -1.875, end at 1.125
                castShadow
                receiveShadow
              >
                <meshPhysicalMaterial color="#4a5568" roughness={0.7} metalness={0.1} />
              </Box>
            ))}
            {/* Top Landing - 1.0m depth, perfectly aligned with floor 2.5m */}
            <Box 
              args={[1.4, 0.15, 1.0]} 
              position={[0, 2.5 - 0.075, 1.5]} // Center at 1.5 spans from 1.0 to 2.0
              castShadow
            >
              <meshPhysicalMaterial color="#4a5568" roughness={0.7} metalness={0.1} />
            </Box>
            {/* Support structure */}
            <Box args={[1.4, 2.5, 3.8]} position={[0, 1.25, -0.1]}>
              <meshStandardMaterial color="#2d3748" wireframe transparent opacity={0.1} />
            </Box>
          </group>
        </group>
      );
    case 'elevator_car':
      return (
        <group position={[item.x, 1.25, item.z]} rotation={[0, rotationRad, 0]}>
          <Box args={[1.5, 2.5, 1.5]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#718096" transparent opacity={0.4} />
          </Box>
          <Box args={[1.4, 2.4, 1.4]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#2d3748" wireframe />
          </Box>
        </group>
      );
    default:
      return null;
  }
};
