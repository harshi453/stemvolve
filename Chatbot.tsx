import { HouseLayout, InteriorDesignOption } from "../types";
import { Type } from "@google/genai";

const LAYOUT_PROMPT = `You are a professional architect. Create a detailed 3D house layout based on the user prompt.
Return ONLY valid JSON matching this schema:
{
  "id": "string",
  "rooms": [{
    "id": "string",
    "name": "string",
    "type": "living|bedroom|kitchen|bathroom|dining|hallway|garage|stairs|elevator",
    "x": "number (center x)",
    "z": "number (center z)",
    "width": "number",
    "depth": "number",
    "floor": "number (0-indexed)",
    "furniture": [{
      "type": "sofa|bed|table|chair|bathtub|kitchen_counter|toilet|desk|wardrobe|stairs_unit|elevator_car",
      "x": "number (LOCAL offset from room center)",
      "z": "number (LOCAL offset from room center)",
      "rotation": "number (degrees)"
    }]
  }],
  "walls": [{
    "x1": "number", "z1": "number", "x2": "number", "z2": "number",
    "floor": "number", "hasWindow": "boolean", "hasDoor": "boolean"
  }],
  "overallWidth": "number",
  "overallDepth": "number",
  "description": "string"
}

ARCHITECTURAL RULES:
1. Floors are 2.5m tall.
2. Walls must be aligned with room boundaries.
3. STAIRS: If multiple floors, MUST include a 'stairs' room with a 'stairs_unit'. 
   - The stairs_unit MUST be centered inside the stairs room.
   - For a 2.5m floor height, stairs must be exactly 4m long (z-axis) and 1.5m wide (x-axis).
   - Ensure vertically stacked stairs align perfectly between floors.
4. VERTICAL STACKING: Rooms on upper floors should generally align with rooms on the ground floor for structural integrity.
5. FURNITURE: Use local offsets. (0,0) is the center of the room.
6. STYLE: Apply a {style} aesthetic.
7. ENTRANCE: Designate one room on floor 0 as the 'hallway' or 'entry' at the front (+Z or -Z edge).`;

export async function generateHouseLayout(prompt: string, style: string = 'Modern'): Promise<HouseLayout> {
  try {
    const finalPrompt = `${LAYOUT_PROMPT.replace('{style}', style)}\n\nUser Request: ${prompt}`;
    
    const response = await fetch('/api/ai/layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: finalPrompt,
        style,
        schema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            rooms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['living', 'bedroom', 'kitchen', 'bathroom', 'dining', 'hallway', 'garage', 'stairs', 'elevator'] },
                  x: { type: Type.NUMBER },
                  z: { type: Type.NUMBER },
                  width: { type: Type.NUMBER },
                  depth: { type: Type.NUMBER },
                  floor: { type: Type.NUMBER },
                  furniture: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        type: { type: Type.STRING, enum: ['sofa', 'bed', 'table', 'chair', 'bathtub', 'kitchen_counter', 'toilet', 'desk', 'wardrobe', 'stairs_unit', 'elevator_car'] },
                        x: { type: Type.NUMBER },
                        z: { type: Type.NUMBER },
                        rotation: { type: Type.NUMBER }
                      },
                      required: ['type', 'x', 'z', 'rotation']
                    }
                  }
                },
                required: ['id', 'name', 'type', 'x', 'z', 'width', 'depth', 'floor', 'furniture']
              }
            },
            walls: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  x1: { type: Type.NUMBER },
                  z1: { type: Type.NUMBER },
                  x2: { type: Type.NUMBER },
                  z2: { type: Type.NUMBER },
                  floor: { type: Type.NUMBER },
                  hasWindow: { type: Type.BOOLEAN },
                  hasDoor: { type: Type.BOOLEAN }
                },
                required: ['x1', 'z1', 'x2', 'z2', 'floor']
              }
            },
            overallWidth: { type: Type.NUMBER },
            overallDepth: { type: Type.NUMBER },
            description: { type: Type.STRING }
          },
          required: ['id', 'rooms', 'walls', 'overallWidth', 'overallDepth', 'description']
        }
      })
    });

    if (!response.ok) throw new Error("AI Layout Request Failed");
    return await response.json();
  } catch (error) {
    console.error("AI Layout Error:", error);
    throw error;
  }
}

export async function generateHouseRenders(prompt: string, style: string = 'Modern') {
  const views = [
    { label: 'Exterior Front', keyword: `${style} house exterior front view, architecture` },
    { label: 'Living Room', keyword: `${style} living room interior design, luxury` },
    { label: 'Master Bedroom', keyword: `${style} master bedroom interior, cozy` }
  ];

  return views.map(view => ({
    label: view.label,
    image: `https://picsum.photos/seed/${view.label.replace(/\s+/g, '')}/800/600`
  }));
}

export async function generateInteriorDesigns(image: string, style: string = 'Modern'): Promise<InteriorDesignOption[]> {
  try {
    const promptText = `Analyze this room photo and provide 3 professional interior design reimaginations in ${style} style.
For the "shoppingList", identify 4-5 specific, high-impact furniture or decor pieces that appear in your reimagination (e.g. "Velvet Mid-Century Sofa", "Modern Brass Floor Lamp").
Return ONLY valid JSON matching this schema:
[{
  "id": "string",
  "title": "string (e.g. Scandi Minimalism, Industrial Chic)",
  "description": "string",
  "palette": ["hex codes"],
  "furnitureLayout": "string description",
  "lighting": "string description",
  "textures": "string description",
  "shoppingList": [{ 
    "name": "string", 
    "price": "string (estimated)", 
    "description": "string (1 sentence on why this piece fits the design)",
    "searchKeyword": "string (2-3 word descriptive keyword for image search, e.g. 'velvet sofa modern')"
  }]
}]`;

    const response = await fetch('/api/ai/interior', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: image.split(',')[1] || image,
        prompt: promptText,
        schema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              palette: { type: Type.ARRAY, items: { type: Type.STRING } },
              furnitureLayout: { type: Type.STRING },
              lighting: { type: Type.STRING },
              textures: { type: Type.STRING },
              shoppingList: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    price: { type: Type.STRING },
                    description: { type: Type.STRING },
                    searchKeyword: { type: Type.STRING }
                  },
                  required: ['name', 'price', 'description', 'searchKeyword']
                }
              }
            },
            required: ['id', 'title', 'description', 'palette', 'furnitureLayout', 'lighting', 'textures', 'shoppingList']
          }
        }
      })
    });

    if (!response.ok) throw new Error("AI Interior Request Failed");
    const rawResults = await response.json();

    return rawResults.map((opt: any) => ({
      ...opt,
      shoppingList: opt.shoppingList.map((item: any) => {
        const query = encodeURIComponent(item.name + ' ' + (item.searchKeyword || ''));
        return {
          ...item,
          // Use loremflickr with descriptive furniture tags for visual relevance
          image: `https://loremflickr.com/400/400/furniture,${encodeURIComponent(item.searchKeyword.replace(/\s+/g, ','))}/all`,
          // Generate a REAL search link for Google Shopping
          url: `https://www.google.com/search?tbm=shop&q=${query}`
        };
      })
    }));
  } catch (error) {
    console.error("AI Interior Error:", error);
    throw error;
  }
}
