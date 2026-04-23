export type BadgeKind = 'nadra' | 'inspected' | 'exclusive' | 'boost' | 'owner';

export interface City {
  name: string;
  tier: number;
  listings: number;
  hero: string;
}

export interface InspectionItem {
  k: string;
  v: string;
  note: string;
}

export interface Property {
  id: string;
  title: string;
  locality: string;
  city: string;
  rent: number;
  rooms: number;
  baths: number;
  area: string;
  type: string;
  furnishing: string;
  utilities: string[];
  badges: BadgeKind[];
  trust: number;
  postedDays: number;
  photos: string[];
  landlord: { name: string; verified: boolean; since: number; listings: number; rating: number };
  inspection?: { date: string; inspector: string; items: InspectionItem[] };
}

export const CITIES: City[] = [
  { name: 'Sialkot',       tier: 2, listings: 1248, hero: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&w=800&q=60' },
  { name: 'Gujranwala',    tier: 2, listings: 984,  hero: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&w=800&q=60' },
  { name: 'Sargodha',      tier: 2, listings: 612,  hero: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&w=800&q=60' },
  { name: 'Narowal',       tier: 3, listings: 214,  hero: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&w=800&q=60' },
  { name: 'Nankana Sahib', tier: 3, listings: 186,  hero: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&w=800&q=60' },
  { name: 'Hafizabad',     tier: 3, listings: 147,  hero: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&w=800&q=60' },
];

export const PROPERTIES: Property[] = [
  {
    id: 'p1',
    title: 'Cantonment 3-bed with courtyard',
    locality: 'Cantt, Sialkot',
    city: 'Sialkot',
    rent: 65000,
    rooms: 3, baths: 2, area: '10 marla',
    type: 'House', furnishing: 'Semi-furnished',
    utilities: ['Gas', 'Electricity', 'Water'],
    badges: ['nadra', 'inspected', 'exclusive'],
    trust: 94, postedDays: 2,
    photos: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&w=1600&q=70',
      'https://images.unsplash.com/photo-1505692433770-36f19f51681d?auto=format&w=800&q=60',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&w=800&q=60',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&w=800&q=60',
    ],
    landlord: { name: 'Adeel R.', verified: true, since: 2024, listings: 3, rating: 4.8 },
    inspection: {
      date: 'Apr 18, 2026', inspector: 'Hassan Tariq · INS-214',
      items: [
        { k: 'Electrical wiring', v: 'Pass', note: 'All sockets grounded · 3 RCBOs functional' },
        { k: 'Gas lines',         v: 'Pass', note: 'No leak detected · valve pressure nominal' },
        { k: 'Water supply',      v: 'Flag', note: 'Kitchen tap low pressure · repairable' },
        { k: 'Structural',        v: 'Pass', note: 'Roof, walls, fixtures intact' },
      ],
    },
  },
  {
    id: 'p2',
    title: 'Model Town 2-bed apartment',
    locality: 'Model Town, Gujranwala',
    city: 'Gujranwala',
    rent: 42000,
    rooms: 2, baths: 1, area: '1100 sq ft',
    type: 'Apartment', furnishing: 'Unfurnished',
    utilities: ['Electricity', 'Water'],
    badges: ['nadra', 'inspected'],
    trust: 88, postedDays: 5,
    photos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&w=1200&q=70',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&w=800&q=60',
    ],
    landlord: { name: 'Sana M.', verified: true, since: 2025, listings: 1, rating: 5.0 },
  },
  {
    id: 'p3',
    title: 'Satellite Town family home',
    locality: 'Satellite Town, Sargodha',
    city: 'Sargodha',
    rent: 55000,
    rooms: 4, baths: 3, area: '14 marla',
    type: 'House', furnishing: 'Furnished',
    utilities: ['Gas', 'Electricity', 'Water'],
    badges: ['nadra'],
    trust: 76, postedDays: 1,
    photos: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&w=1200&q=70'],
    landlord: { name: 'Usman K.', verified: true, since: 2024, listings: 6, rating: 4.6 },
  },
  {
    id: 'p4',
    title: 'Quiet 1-bed studio near GT Road',
    locality: 'GT Road, Gujranwala',
    city: 'Gujranwala',
    rent: 28000,
    rooms: 1, baths: 1, area: '600 sq ft',
    type: 'Studio', furnishing: 'Furnished',
    utilities: ['Electricity', 'Water'],
    badges: ['nadra', 'inspected', 'boost'],
    trust: 91, postedDays: 3,
    photos: ['https://images.unsplash.com/photo-1630699144867-37acbd70f6c5?auto=format&w=1200&q=70'],
    landlord: { name: 'Farah A.', verified: true, since: 2025, listings: 2, rating: 4.9 },
  },
  {
    id: 'p5',
    title: 'Newly built 5-marla house',
    locality: 'Muridke Road, Narowal',
    city: 'Narowal',
    rent: 32000,
    rooms: 3, baths: 2, area: '5 marla',
    type: 'House', furnishing: 'Unfurnished',
    utilities: ['Gas', 'Electricity', 'Water'],
    badges: ['nadra', 'inspected'],
    trust: 85, postedDays: 7,
    photos: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&w=1200&q=70'],
    landlord: { name: 'Bilal S.', verified: true, since: 2024, listings: 1, rating: 4.7 },
  },
  {
    id: 'p6',
    title: 'Mall Road corner apartment',
    locality: 'Mall Rd, Hafizabad',
    city: 'Hafizabad',
    rent: 24000,
    rooms: 2, baths: 1, area: '900 sq ft',
    type: 'Apartment', furnishing: 'Semi-furnished',
    utilities: ['Electricity', 'Water'],
    badges: ['nadra'],
    trust: 72, postedDays: 11,
    photos: ['https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&w=1200&q=70'],
    landlord: { name: 'Rabia N.', verified: true, since: 2025, listings: 1, rating: 4.4 },
  },
];
