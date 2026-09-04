export const FIXED_DARK_OPDA = '#fec92b' as const;
export const DEFAULT_HEADER_PALETTE = 'petrol' as const;

export const HEADER_PALETTES = [
  { id: 'kiln', number: '01', name: 'Kiln', light: ['#8f4a10', '#c97a22', '#9e3a1e'], dark: ['#d98b45', '#ee9270'] },
  { id: 'tidewater', number: '02', name: 'Tidewater', light: ['#7c5c12', '#0b4b47', '#106e68'], dark: ['#1f8f87', '#5fc5ba'] },
  { id: 'mulberry', number: '03', name: 'Mulberry', light: ['#6e3c2a', '#5a1a3c', '#8e2a57'], dark: ['#b85a87', '#e58db5'] },
  { id: 'moss', number: '04', name: 'Moss', light: ['#2f4a14', '#7e9a3a', '#4f7a1e'], dark: ['#6b8a2f', '#a6c86b'] },
  { id: 'petrol', number: '05', name: 'Petrol', light: ['#6b6416', '#12313d', '#1f4a5c'], dark: ['#4e8aa3', '#8fbdd0'] },
  { id: 'aubergine', number: '06', name: 'Aubergine', light: ['#4e1f55', '#a45fb0', '#712f7c'], dark: ['#9e5baa', '#d69be0'] },
  { id: 'pine', number: '07', name: 'Pine', light: ['#573d1c', '#0f4633', '#1d6b4f'], dark: ['#3fa07e', '#7fd1b0'] },
  { id: 'ledger', number: '08', name: 'Ledger', light: ['#1f4f5e', '#4c1119', '#7b2530'], dark: ['#c0606a', '#f09a97'] },
  { id: 'cherry', number: '09', name: 'Cherry', light: ['#6b1f3e', '#a57a2c', '#6f4a10'], dark: ['#b8965a', '#e2c79a'] },
  { id: 'harbour', number: '10', name: 'Harbour', light: ['#0e4f4a', '#123e3a', '#b4531a'], dark: ['#4e9c8e', '#f6a55a'] },
  { id: 'clay-indigo', number: '11', name: 'Clay & Indigo', light: ['#24345a', '#a8512a', '#41498c'], dark: ['#ed9468', '#a9b8f0'] },
  { id: 'amber-violet', number: '12', name: 'Amber Violet', light: ['#4b2d73', '#8f5e08', '#5b3e8f'], dark: ['#e9b44c', '#c6a9f0'] },
  { id: 'rosewood', number: '13', name: 'Rosewood', light: ['#6e2639', '#a04a5c', '#3e4e66'], dark: ['#e896a6', '#b9c7dd'] },
  { id: 'copper-ink', number: '14', name: 'Copper Ink', light: ['#1c2b45', '#96491e', '#243b63'], dark: ['#c97b3f', '#9fb6e4'] },
  { id: 'paprika', number: '15', name: 'Paprika', light: ['#4a3226', '#a93226', '#5c4433'], dark: ['#f07b62', '#d9bfa8'] },
  { id: 'heather-walnut', number: '16', name: 'Heather Walnut', light: ['#503a28', '#6b5590', '#5c4130'], dark: ['#bfa8e8', '#d8b08a'] },
  { id: 'denim-chestnut', number: '17', name: 'Denim Chestnut', light: ['#5c3317', '#33518f', '#6b3e1e'], dark: ['#8fb0f0', '#e0a878'] },
  { id: 'sepia', number: '18', name: 'Sepia', light: ['#26334f', '#7a5230', '#4e3a22'], dark: ['#d9a868', '#e3cda8'] },
  { id: 'magenta-ink', number: '19', name: 'Magenta Ink', light: ['#263355', '#8f2260', '#303f6b'], dark: ['#ef7eb2', '#a5bbea'] },
  { id: 'midnight-sienna', number: '20', name: 'Midnight Sienna', light: ['#6e3a0c', '#3d4b8f', '#2a3562'], dark: ['#93a3ee', '#c9d2f8'] },
] as const;

export const HEADER_PALETTE_IDS = HEADER_PALETTES.map(({ id }) => id);
export type HeaderPaletteId = (typeof HEADER_PALETTES)[number]['id'];
