import type { StateCode } from './types.js';

const STATE_MAP: Record<string, StateCode> = {
  // Codes
  act: 'ACT', nsw: 'NSW', nt: 'NT', qld: 'QLD',
  sa: 'SA', tas: 'TAS', vic: 'VIC', wa: 'WA',
  all: 'ALL', oth: 'OTH', other: 'OTH',
  virtual: 'VIRTUAL', online: 'VIRTUAL',

  // City names
  canberra: 'ACT',
  sydney: 'NSW', wollongong: 'NSW', newcastle: 'NSW',
  darwin: 'NT',
  brisbane: 'QLD', 'gold coast': 'QLD',
  adelaide: 'SA',
  hobart: 'TAS',
  melbourne: 'VIC', geelong: 'VIC',
  perth: 'WA',

  // International / unknown
  auckland: 'OTH', 'new zealand': 'OTH', global: 'OTH',
};

export function normalizeState(raw: string): StateCode {
  const key = raw.trim().toLowerCase();
  return STATE_MAP[key] ?? 'OTH';
}
