import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { toString as mdastToString } from 'mdast-util-to-string';
import type { Root, Table, TableRow } from 'mdast';
import type { Event } from './types.js';
import { parseEventDate } from './parse-date.js';
import { normalizeState } from './normalize-state.js';

import { resolve } from 'path';
const DATA_ROOT = resolve(process.cwd(), '..');

function extractLink(cell: TableRow['children'][number]): { text: string; url: string | null } {
  const text = mdastToString(cell).trim();
  // Find first link node
  const link = cell.children.find((n) => n.type === 'link') as { type: 'link'; url: string } | undefined;
  return { text, url: link?.url ?? null };
}

function parseTags(raw: string): string[] {
  return raw
    .split(/[,|]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function parseTableRows(table: Table, year: number, upcoming: boolean): Event[] {
  const events: Event[] = [];
  // Skip header row (index 0)
  for (let i = 1; i < table.children.length; i++) {
    const row = table.children[i];
    if (!row || row.children.length < 7) continue;

    const cells = row.children;
    const { text: name, url } = extractLink(cells[0]);
    if (!name) continue;

    const stateRaw = mdastToString(cells[1]).trim();
    const dateFromRaw = mdastToString(cells[2]).trim();
    const dateToRaw = mdastToString(cells[3]).trim();
    const cfpOpenRaw = mdastToString(cells[4]).trim();
    const cfpCloseRaw = mdastToString(cells[5]).trim();
    const tagsRaw = mdastToString(cells[6]).trim();

    events.push({
      name,
      url,
      state: normalizeState(stateRaw),
      stateRaw,
      dateFrom: parseEventDate(dateFromRaw),
      dateTo: parseEventDate(dateToRaw),
      dateFromRaw,
      dateToRaw,
      cfpOpen: parseEventDate(cfpOpenRaw),
      cfpClose: parseEventDate(cfpCloseRaw),
      cfpOpenRaw,
      cfpCloseRaw,
      tags: parseTags(tagsRaw),
      year,
      upcoming,
    });
  }
  return events;
}

function parseMarkdown(content: string): Root {
  return unified().use(remarkParse).use(remarkGfm).parse(content) as Root;
}

function getTablesFromAst(ast: Root): Table[] {
  return ast.children.filter((n) => n.type === 'table') as Table[];
}

export function parseUpcomingEvents(): Event[] {
  const content = readFileSync(join(DATA_ROOT, 'README.md'), 'utf-8');
  const ast = parseMarkdown(content);
  const tables = getTablesFromAst(ast);
  if (tables.length === 0) return [];
  // README has one upcoming events table
  const currentYear = new Date().getFullYear();
  return parseTableRows(tables[0], currentYear, true);
}

export function parsePastEvents(year: number): Event[] {
  const filePath = join(DATA_ROOT, 'Past Events', `${year}.md`);
  try {
    const content = readFileSync(filePath, 'utf-8');
    const ast = parseMarkdown(content);
    const tables = getTablesFromAst(ast);
    if (tables.length === 0) return [];
    return parseTableRows(tables[0], year, false);
  } catch {
    // No archive file for this year — fall back to README for the current year
    if (year === new Date().getFullYear()) {
      return parseUpcomingEvents().map((e) => ({ ...e, upcoming: false }));
    }
    return [];
  }
}

export function getAvailableYears(): number[] {
  try {
    const dir = join(DATA_ROOT, 'Past Events');
    const archivedYears = readdirSync(dir)
      .filter((f) => /^\d{4}\.md$/.test(f))
      .map((f) => parseInt(f, 10));

    const currentYear = new Date().getFullYear();
    const years = archivedYears.includes(currentYear)
      ? archivedYears
      : [currentYear, ...archivedYears];

    return years.sort((a, b) => b - a); // newest first
  } catch {
    return [new Date().getFullYear()];
  }
}

export function getAllEvents(): Event[] {
  const upcoming = parseUpcomingEvents();
  const years = getAvailableYears();
  const past = years.flatMap((y) => parsePastEvents(y));
  return [...upcoming, ...past];
}
