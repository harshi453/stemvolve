export type PlanType = 'standard' | 'professional' | 'premium';

export type Region = 'US' | 'EU' | 'UK' | 'IN' | 'OTHER';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  plan: PlanType;
  aiDesignsUsed: number;
  visualizationsUsed: number;
  projectsUsed: number;
  region: Region | null;
}

export interface FurnitureItem {
  type: 'sofa' | 'bed' | 'table' | 'chair' | 'bathtub' | 'kitchen_counter' | 'toilet' | 'desk' | 'wardrobe' | 'stairs_unit' | 'elevator_car';
  x: number;
  z: number;
  rotation: number; // in degrees
}

export interface Room {
  id: string;
  name: string;
  type: 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'dining' | 'hallway' | 'garage' | 'stairs' | 'elevator';
  x: number;
  z: number;
  width: number;
  depth: number;
  floor: number;
  furniture: FurnitureItem[];
}

export interface Wall {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  floor: number;
  hasWindow?: boolean;
  hasDoor?: boolean;
}

export interface HouseLayout {
  id: string;
  rooms: Room[];
  walls: Wall[];
  overallWidth: number;
  overallDepth: number;
  description: string;
}

export interface ShoppingItem {
  name: string;
  price: string;
  description: string;
  image: string;
  url: string;
}

export interface InteriorDesignOption {
  id: string;
  title: string;
  description: string;
  palette: string[];
  furnitureLayout: string;
  lighting: string;
  textures: string;
  shoppingList: ShoppingItem[];
}
