import React, { useMemo } from 'react';
import { Box, Html, Edges } from '@react-three/drei';
import { HouseLayout, Room, Wall } from '../../types';
import { Furniture } from './Furniture';

const WALL_HEIGHT = 2.5;
const WALL_THICKNESS = 0.15;

const getFloorColor = (type: Room['type'], style: 'modern' | 'classic' | 'brutalist' = 'modern') => {
  if (style === 'brutalist') return '#555555';
  if (style === 'classic') {
    switch (type) {
      case 'living': return '#4e342e';
      case 'bedroom': return '#6d4c41';
      default: return '#efebe9';
    }
  }
  
  switch (type) {
    case 'living':
    case 'dining':
      return '#5d4037'; // dark wood
    case 'bedroom':
      return '#faf9f6'; // off white
    case 'bathroom':
      return '#e0f2f1'; // light teal tiles
    case 'kitchen':
      return '#eceff1'; // marble-ish
    case 'garage':
      return '#455a64'; // dark concrete
    case 'stairs':
      return '#263238'; // charcoal
    case 'elevator':
      return '#1a1a1a'; // black
    default:
      return '#ffffff';
  }
};

const HipRoof: React.FC<{ 
  bounds: { x: number; z: number; width: number; depth: number }; 
  maxFloor: number;
  isNightMode: boolean;
}> = ({ bounds, maxFloor, isNightMode }) => {
  const roofHeight = 2.2;
  const yPos = (maxFloor + 1) * WALL_HEIGHT;
  const overhang = 0.8;
  const width = bounds.width + overhang * 2;
  const depth = bounds.depth + overhang * 2;

  return (
    <group position={[0, yPos, 0]}>
      {/* High-quality Pyramid Roof - oriented correctly */}
      <mesh 
        rotation={[0, Math.PI / 4, 0]} 
        position={[0, roofHeight / 2, 0]}
        castShadow
      >
        <coneGeometry args={[Math.sqrt(width**2 + depth**2) / 2, roofHeight, 4]} />
        <meshPhysicalMaterial 
          color={isNightMode ? "#1a202c" : "#334155"} 
          roughness={0.4} 
          metalness={0.2}
          reflectivity={0.5}
          clearcoat={0.3}
        />
        <Edges color="#000000" opacity={0.3} transparent />
      </mesh>

      {/* Attic Floor / Ceiling Slab */}
      <Box args={[width, 0.15, depth]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color={isNightMode ? "#0f172a" : "#cbd5e0"} />
      </Box>
    </group>
  );
};

const WallComponent: React.FC<{ 
  wall: Wall; 
  offset: { x: number; z: number }; 
  isNightMode: boolean;
  style?: 'modern' | 'classic' | 'brutalist';
}> = ({ wall, offset, isNightMode, style = 'modern' }) => {
  const dx = wall.x2 - wall.x1;
  const dz = wall.z2 - wall.z1;
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);
  const centerX = (wall.x1 + wall.x2) / 2 - offset.x;
  const centerZ = (wall.z1 + wall.z2) / 2 - offset.z;
  const floorOffset = (wall.floor ?? 0) * WALL_HEIGHT;

  const getWallColor = () => {
    if (isNightMode) return "#cbd5e0";
    if (style === 'brutalist') return "#718096";
    if (style === 'classic') return "#fdf2f2";
    return "#ffffff";
  };

  const wallMaterial = (
    <meshPhysicalMaterial 
      color={getWallColor()} 
      roughness={style === 'brutalist' ? 0.8 : 0.3} 
      metalness={style === 'brutalist' ? 0.2 : 0.1}
      clearcoat={style === 'modern' ? 0.2 : 0}
      clearcoatRoughness={0.1}
      reflectivity={0.5}
    />
  );
  const baseboardMaterial = (
    <meshPhysicalMaterial 
      color={style === 'classic' ? "#3e2723" : "#f1f5f9"} 
      roughness={0.2} 
      metalness={0.2}
    />
  );

  if (wall.hasDoor) {
    const doorWidth = 1.0;
    const partLength = (length - doorWidth) / 2;
    
    return (
      <group position={[centerX, floorOffset + WALL_HEIGHT / 2, centerZ]} rotation={[0, -angle, 0]}>
        {/* Left Wall Part */}
        <Box args={[partLength, WALL_HEIGHT, WALL_THICKNESS]} position={[-(doorWidth + partLength) / 2, 0, 0]}>
          {wallMaterial}
          <Edges color="#cbd5e0" />
        </Box>
        {/* Right Wall Part */}
        <Box args={[partLength, WALL_HEIGHT, WALL_THICKNESS]} position={[(doorWidth + partLength) / 2, 0, 0]}>
          {wallMaterial}
          <Edges color="#cbd5e0" />
        </Box>
        {/* Door Frame */}
        <Box args={[doorWidth + 0.1, 2.1, WALL_THICKNESS + 0.05]} position={[0, -0.2, 0]}>
          <meshStandardMaterial color="#4a5568" />
          <Edges color="#2d3748" />
        </Box>
        {/* Door Handle */}
        <Box args={[0.05, 0.1, 0.1]} position={[doorWidth / 2 - 0.1, -0.2, WALL_THICKNESS / 2 + 0.03]}>
          <meshStandardMaterial color="#ecc94b" metalness={0.8} roughness={0.2} />
        </Box>
        {/* Baseboards */}
        <Box args={[partLength, 0.1, WALL_THICKNESS + 0.02]} position={[-(doorWidth + partLength) / 2, -WALL_HEIGHT/2 + 0.05, 0]}>
          {baseboardMaterial}
        </Box>
        <Box args={[partLength, 0.1, WALL_THICKNESS + 0.02]} position={[(doorWidth + partLength) / 2, -WALL_HEIGHT/2 + 0.05, 0]}>
          {baseboardMaterial}
        </Box>
      </group>
    );
  }

  if (wall.hasWindow) {
    const windowWidth = 1.5;
    const windowHeight = 1.2;
    const partLength = (length - windowWidth) / 2;

    return (
      <group position={[centerX, floorOffset + WALL_HEIGHT / 2, centerZ]} rotation={[0, -angle, 0]}>
        <Box args={[length, 0.6, WALL_THICKNESS]} position={[0, -0.95, 0]}>
          {wallMaterial}
          <Edges color="#cbd5e0" />
        </Box>
        <Box args={[length, 0.7, WALL_THICKNESS]} position={[0, 0.9, 0]}>
          {wallMaterial}
          <Edges color="#cbd5e0" />
        </Box>
        <Box args={[partLength, 1.2, WALL_THICKNESS]} position={[-(windowWidth + partLength) / 2, 0, 0]}>
          {wallMaterial}
          <Edges color="#cbd5e0" />
        </Box>
        <Box args={[partLength, 1.2, WALL_THICKNESS]} position={[(windowWidth + partLength) / 2, 0, 0]}>
          {wallMaterial}
          <Edges color="#cbd5e0" />
        </Box>
        {/* Window Glass */}
        <Box args={[windowWidth, windowHeight, 0.05]} position={[0, 0, 0]}>
          <meshPhysicalMaterial 
            color="#add8e6" 
            transparent 
            opacity={0.3} 
            metalness={0.2} 
            roughness={0.05}
            transmission={0.95}
            thickness={0.1}
            ior={1.5}
          />
          <Edges color="#4a5568" />
        </Box>
        {/* Window Frame */}
        <Box args={[windowWidth + 0.1, windowHeight + 0.1, WALL_THICKNESS + 0.02]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#2d3748" />
          <Edges color="#000000" />
        </Box>
        {/* Baseboard */}
        <Box args={[length, 0.1, WALL_THICKNESS + 0.02]} position={[0, -WALL_HEIGHT/2 + 0.05, 0]}>
          {baseboardMaterial}
        </Box>
      </group>
    );
  }

  return (
    <group position={[centerX, floorOffset + WALL_HEIGHT / 2, centerZ]} rotation={[0, -angle, 0]}>
      <Box args={[length, WALL_HEIGHT, WALL_THICKNESS]}>
        {wallMaterial}
        <Edges color="#cbd5e0" />
      </Box>
      {/* Baseboard */}
      <Box args={[length, 0.1, WALL_THICKNESS + 0.02]} position={[0, -WALL_HEIGHT/2 + 0.05, 0]}>
        {baseboardMaterial}
      </Box>
    </group>
  );
};

const Tree: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <Box args={[0.3, 2, 0.3]} position={[0, 1, 0]}>
      <meshStandardMaterial color="#5d4037" />
    </Box>
    <Box args={[1.5, 1.5, 1.5]} position={[0, 2.5, 0]}>
      <meshStandardMaterial color="#2e7d32" />
    </Box>
    <Box args={[1, 1, 1]} position={[0, 3.2, 0]}>
      <meshStandardMaterial color="#388e3c" />
    </Box>
  </group>
);

const Bush: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <Box args={[0.8, 0.6, 0.8]} position={[0, 0.3, 0]}>
      <meshStandardMaterial color="#1b5e20" />
    </Box>
  </group>
);

export const HouseModel: React.FC<{ 
  layout: HouseLayout; 
  isNightMode?: boolean;
  visibleFloor?: number | null;
  showRoof?: boolean;
  style?: 'modern' | 'classic' | 'brutalist';
  selectedRoomId?: string | null;
  onRoomSelect?: (id: string | null) => void;
}> = ({ 
  layout, 
  isNightMode = false, 
  visibleFloor = null, 
  showRoof = false, 
  style = 'modern',
  selectedRoomId = null,
  onRoomSelect
}) => {
  // Calculate actual bounds to center the model perfectly
  const bounds = useMemo(() => {
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    
    layout.rooms.forEach(r => {
      minX = Math.min(minX, r.x - r.width/2);
      maxX = Math.max(maxX, r.x + r.width/2);
      minZ = Math.min(minZ, r.z - r.depth/2);
      maxZ = Math.max(maxZ, r.z + r.depth/2);
    });

    layout.walls.forEach(w => {
      minX = Math.min(minX, w.x1, w.x2);
      maxX = Math.max(maxX, w.x1, w.x2);
      minZ = Math.min(minZ, w.z1, w.z2);
      maxZ = Math.max(maxZ, w.z1, w.z2);
    });

    if (minX === Infinity) return { x: 0, z: 0, width: 0, depth: 0 };
    return {
      x: (minX + maxX) / 2,
      z: (minZ + maxZ) / 2,
      width: maxX - minX,
      depth: maxZ - minZ
    };
  }, [layout]);

  const maxFloor = useMemo(() => {
    return Math.max(...layout.rooms.map(r => r.floor ?? 0), 0);
  }, [layout.rooms]);

  const filteredRooms = useMemo(() => {
    if (visibleFloor === null) return layout.rooms;
    return layout.rooms.filter(r => r.floor === visibleFloor);
  }, [layout.rooms, visibleFloor]);

  const finalWalls = useMemo(() => {
    // Collect all room boundaries as auto-generated walls to ensure none are missing
    const auto: Wall[] = [];
    const roomsForVisibleFloor = visibleFloor === null ? layout.rooms : layout.rooms.filter(r => r.floor === visibleFloor);
    
    roomsForVisibleFloor.forEach(room => {
      const hw = room.width / 2;
      const hd = room.depth / 2;
      const f = room.floor ?? 0;
      // We add all 4 walls for each room. 
      // If the AI provides redundant walls, we'll merge them later or just render both (safe).
      auto.push({ x1: room.x - hw, z1: room.z - hd, x2: room.x + hw, z2: room.z - hd, floor: f, hasWindow: true });
      auto.push({ x1: room.x - hw, z1: room.z + hd, x2: room.x + hw, z2: room.z + hd, floor: f, hasWindow: true });
      auto.push({ x1: room.x - hw, z1: room.z - hd, x2: room.x - hw, z2: room.z + hd, floor: f, hasWindow: false });
      auto.push({ x1: room.x + hw, z1: room.z - hd, x2: room.x + hw, z2: room.z + hd, floor: f, hasWindow: false });
    });

    // Merge with existing walls from layout if they have special properties like doors
    const existing = visibleFloor === null ? layout.walls : layout.walls.filter(w => w.floor === visibleFloor);
    
    // For now, let's just return the auto-generated ones if AI walls are missing or sparse,
    // otherwise if AI ones exist, we prioritize ones with doors/windows.
    // To be safest (per user request of "missing walls"), we'll just include EVERYTHING.
    // Duplicate walls at same position will just z-fight or overlap invisibly.
    return [...auto, ...existing.filter(w => w.hasDoor || w.hasWindow)];
  }, [layout.walls, layout.rooms, visibleFloor]);

  return (
    <group>
      {/* Rooms and Floors */}
      {filteredRooms.map((room, i) => {
        const floorOffset = (room.floor ?? 0) * WALL_HEIGHT;
        const rx = room.x - bounds.x;
        const rz = room.z - bounds.z;
        
        return (
          <group 
            key={i} 
            position={[0, floorOffset, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onRoomSelect?.(room.id);
            }}
          >
            <Box args={[room.width, 0.1, room.depth]} position={[rx, 0.05, rz]} receiveShadow>
              <meshPhysicalMaterial 
                color={getFloorColor(room.type, style)} 
                roughness={style === 'modern' ? 0.1 : 0.4}
                metalness={0.2}
                clearcoat={style === 'modern' ? 0.5 : 0.1}
                clearcoatRoughness={0.05}
                reflectivity={0.8}
                emissive={selectedRoomId === room.id ? "#3b82f6" : "#000000"}
                emissiveIntensity={selectedRoomId === room.id ? 0.5 : 0}
              />
              <Edges 
                color={selectedRoomId === room.id ? "#3b82f6" : "#000000"} 
                opacity={selectedRoomId === room.id ? 1 : 0.05} 
                transparent 
              />
            </Box>
            
            <Html
              position={[rx, 0.2, rz]}
              center
              distanceFactor={10}
              style={{
                pointerEvents: 'none',
                userSelect: 'none'
              }}
            >
              <div className="px-3 py-1.5 bg-white/95 backdrop-blur-md border border-black/5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] whitespace-nowrap flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                <p className="text-[10px] font-black text-black uppercase tracking-widest">{room.name}</p>
              </div>
            </Html>

            {room.furniture.map((item, j) => (
              <Furniture key={j} item={{ ...item, x: rx + item.x, z: rz + item.z }} />
            ))}
          </group>
        );
      })}

      {/* Walls */}
      {finalWalls.map((wall, i) => (
        <WallComponent key={i} wall={wall} offset={bounds} isNightMode={isNightMode} style={style} />
      ))}

      {/* Roof */}
      {showRoof && visibleFloor === null && (
        <HipRoof bounds={bounds} maxFloor={maxFloor} isNightMode={isNightMode} />
      )}

    {/* Base/Foundation */}
    <group position={[0, -0.25, 0]}>
      {/* Dynamic Foundation based on house size */}
      <Box 
        args={[Math.max(40, bounds.width + 20), 0.5, Math.max(40, bounds.depth + 20)]} 
        position={[0, -0.05, 0]} 
        receiveShadow
      >
        <meshPhysicalMaterial color="#1a202c" roughness={0.9} metalness={0.1} />
      </Box>
      
      {/* Grass/Garden around the house */}
      <Box 
        args={[Math.max(38, bounds.width + 18), 0.1, Math.max(38, bounds.depth + 18)]} 
        position={[0, 0.25, 0]} 
        receiveShadow
      >
        <meshPhysicalMaterial color="#2d4a22" roughness={1} metalness={0} />
      </Box>
      
      {/* Dynamic Entrance Path to the front-most hallway or living room */}
      {(() => {
        // Find the room that is likely the entrance (closest to +Z, type living/hallway/foyer)
        const frontRooms = layout.rooms
          .filter(r => r.floor === 0)
          .sort((a, b) => (b.z + b.depth/2) - (a.z + a.depth/2));
        
        const entranceRoom = frontRooms.find(r => ['hallway', 'living', 'entry', 'foyer'].includes(r.type)) || frontRooms[0];
        
        if (entranceRoom) {
          const pathX = entranceRoom.x - bounds.x;
          const pathZStart = entranceRoom.z + entranceRoom.depth/2 - bounds.z;
          const pathLength = 10;
          
          return (
            <Box 
              args={[3, 0.06, pathLength]} 
              position={[pathX, 0.23, pathZStart + pathLength/2]} 
              receiveShadow
            >
              <meshPhysicalMaterial color="#4a5568" roughness={0.8} metalness={0.1} />
            </Box>
          );
        }
        return null;
      })()}

      {/* Decorative Flowers and Plants positioned relative to bounds */}
      <group position={[0, 0.25, 0]}>
        {[
          [-(bounds.width/2 + 2), bounds.depth/2 + 2], 
          [bounds.width/2 + 2, bounds.depth/2 + 2], 
          [-(bounds.width/2 + 2), -(bounds.depth/2 + 2)], 
          [bounds.width/2 + 2, -(bounds.depth/2 + 2)],
        ].map(([px, pz], idx) => (
          <group key={idx} position={[px, 0, pz]}>
            <Bush position={[0, 0, 0]} />
            <group position={[0.1, 0.4, 0.1]}>
              <Box args={[0.1, 0.1, 0.1]}>
                <meshPhysicalMaterial 
                  color={idx % 2 === 0 ? "#ff1744" : "#ffea00"} 
                  emissive={idx % 2 === 0 ? "#ff1744" : "#ffea00"}
                  emissiveIntensity={isNightMode ? 0.5 : 0}
                />
              </Box>
            </group>
          </group>
        ))}
      </group>
    </group>

    {/* Nature */}
      <group>
        <Tree position={[-(bounds.width / 2 + 5), 0, -(bounds.depth / 2 + 5)]} />
        <Tree position={[bounds.width / 2 + 6, 0, -(bounds.depth / 2 + 4)]} />
        <Tree position={[-(bounds.width / 2 + 4), 0, bounds.depth / 2 + 6]} />
        <Tree position={[bounds.width / 2 + 5, 0, bounds.depth / 2 + 5]} />
      </group>
    </group>
  );
};
