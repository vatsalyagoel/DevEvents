import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { toString as mdastToString } from 'mdast-util-to-string';
import type { Root, Table, TableRow, Heading } from 'mdast';
import type { Meetup, StateCode } from './types.js';
import { normalizeState } from './normalize-state.js';

import { resolve } from 'path';
const DATA_ROOT = resolve(process.cwd(), '..');

const STATE_FILE_MAP: Record<string, StateCode> = {
  ACT: 'ACT', NSW: 'NSW', NT: 'NT', QLD: 'QLD',
  SA: 'SA', TAS: 'TAS', VIC: 'VIC', WA: 'WA',
};

function extractLink(cell: TableRow['children'][number]): { text: string; url: string | null } {
  const text = mdastToString(cell).trim();
  const link = cell.children.find((n) => n.type === 'link') as { type: 'link'; url: string } | undefined;
  return { text, url: link?.url ?? null };
}

function isRowEmpty(row: TableRow): boolean {
  return row.children.every((cell) => mdastToString(cell).trim() === '');
}

function parseMeetupsFromFile(stateCode: StateCode, content: string): Meetup[] {
  const ast = unified().use(remarkParse).use(remarkGfm).parse(content) as Root;
  const meetups: Meetup[] = [];
  let stale = false;

  for (const node of ast.children) {
    if (node.type === 'heading') {
      const headingText = mdastToString(node as Heading).toLowerCase();
      if (headingText.includes('stale')) {
        stale = true;
      }
      continue;
    }

    if (node.type !== 'table') continue;

    const table = node as Table;
    const headerRow = table.children[0];
    if (!headerRow) continue;
    const colCount = headerRow.children.length;

    for (let i = 1; i < table.children.length; i++) {
      const row = table.children[i];
      if (!row || isRowEmpty(row)) continue;

      const { text: name, url } = extractLink(row.children[0]);
      if (!name) continue;

      if (stale || colCount === 1) {
        // Stale meetups table — only name column
        meetups.push({
          name,
          url,
          location: '',
          host: '',
          frequency: '',
          tags: [],
          state: stateCode,
          stale: true,
        });
      } else {
        // Active meetups: Name | Location | Host | Frequency | Tags
        const location = colCount > 1 ? mdastToString(row.children[1]).trim() : '';
        const host = colCount > 2 ? mdastToString(row.children[2]).trim() : '';
        const frequency = colCount > 3 ? mdastToString(row.children[3]).trim() : '';
        const tagsRaw = colCount > 4 ? mdastToString(row.children[4]).trim() : '';
        const tags = tagsRaw
          .split(/[,|&]/)
          .map((t) => t.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);

        meetups.push({
          name,
          url,
          location,
          host,
          frequency,
          tags,
          state: stateCode,
          stale: false,
        });
      }
    }
  }

  return meetups;
}

export function parseMeetupsByState(state: string): Meetup[] {
  const stateCode = STATE_FILE_MAP[state.toUpperCase()];
  if (!stateCode) return [];

  const filePath = join(DATA_ROOT, 'Meetups', `${state.toUpperCase()}.md`);
  try {
    const content = readFileSync(filePath, 'utf-8');
    return parseMeetupsFromFile(stateCode, content);
  } catch {
    return [];
  }
}

export function getAllMeetups(): Meetup[] {
  const dir = join(DATA_ROOT, 'Meetups');
  try {
    const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
    return files.flatMap((f) => {
      const stateCode = f.replace('.md', '') as StateCode;
      const content = readFileSync(join(dir, f), 'utf-8');
      return parseMeetupsFromFile(stateCode, content);
    });
  } catch {
    return [];
  }
}

export function getAvailableStates(): StateCode[] {
  return Object.keys(STATE_FILE_MAP) as StateCode[];
}
