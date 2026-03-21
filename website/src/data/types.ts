export type StateCode =
  | 'ACT' | 'NSW' | 'NT' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA'
  | 'ALL' | 'OTH' | 'VIRTUAL';

export interface Event {
  name: string;
  url: string | null;
  state: StateCode;
  stateRaw: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  dateFromRaw: string;
  dateToRaw: string;
  cfpOpen: Date | null;
  cfpClose: Date | null;
  cfpOpenRaw: string;
  cfpCloseRaw: string;
  tags: string[];
  year: number;
  upcoming: boolean;
}

export interface Meetup {
  name: string;
  url: string | null;
  location: string;
  host: string;
  frequency: string;
  tags: string[];
  state: StateCode;
  stale: boolean;
}
