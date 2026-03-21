import { useState } from 'preact/hooks';
import type { Event, StateCode } from '@data/types';

interface Props {
  events: Event[];
}

const STATE_LABELS: Record<string, string> = {
  ACT: 'ACT', NSW: 'NSW', NT: 'NT', QLD: 'QLD',
  SA: 'SA', TAS: 'TAS', VIC: 'VIC', WA: 'WA',
  VIRTUAL: 'Virtual', ALL: 'All', OTH: 'Other',
};

// Astro serializes Date objects as ISO strings — coerce back to Date
function toDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const d = new Date(val as string);
  return isNaN(d.getTime()) ? null : d;
}

function fmt(val: unknown): string {
  const d = toDate(val);
  if (!d) return '';
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

export default function FilterIsland({ events }: Props) {
  const [search, setSearch] = useState('');
  const [selectedStates, setSelectedStates] = useState<StateCode[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [cfpOnly, setCfpOnly] = useState(false);

  const now = new Date();

  const allStates = [...new Set(events.map((e) => e.state))].sort() as StateCode[];
  const allTags = [...new Set(events.flatMap((e) => e.tags))].sort();
  const hasCfpData = events.some((e) => { const d = toDate(e.cfpClose); return d && d >= now; });

  const filtered = events.filter((e) => {
    if (search.trim()) {
      const q = search.trim();
      const searchable = [e.name, STATE_LABELS[e.state] ?? e.state, ...e.tags].join(' ');
      if (!fuzzyMatch(q, searchable)) return false;
    }
    if (selectedStates.length > 0 && !selectedStates.includes(e.state)) return false;
    if (selectedTags.length > 0 && !e.tags.some((t) => selectedTags.includes(t))) return false;
    if (cfpOnly) {
      const cfpClose = toDate(e.cfpClose);
      if (!cfpClose || now > cfpClose) return false;
    }
    return true;
  });

  function toggleState(s: StateCode) {
    setSelectedStates((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function toggleTag(t: string) {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function clearAll() {
    setSearch('');
    setSelectedStates([]);
    setSelectedTags([]);
    setCfpOnly(false);
  }

  const hasFilters = search.trim() !== '' || selectedStates.length > 0 || selectedTags.length > 0 || cfpOnly;

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="search"
          placeholder="Search events…"
          value={search}
          onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            fontSize: '0.95rem',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '1.5rem' }}>
        {allStates.length > 0 && (
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
              State
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }} role="group" aria-label="Filter by state">
              {allStates.map((s) => {
                const active = selectedStates.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleState(s)}
                    aria-pressed={active}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      border: `2px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      background: active ? 'var(--color-accent)' : 'var(--color-surface)',
                      color: active ? '#fff' : 'var(--color-text)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      minHeight: '32px',
                    }}
                  >
                    {active ? '✓ ' : ''}{STATE_LABELS[s] ?? s}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {allTags.length > 0 && (
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
              Topic
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }} role="group" aria-label="Filter by topic">
              {allTags.map((t) => {
                const active = selectedTags.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleTag(t)}
                    aria-pressed={active}
                    style={{
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      border: `2px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      background: active ? 'var(--color-accent)' : '#f9fafb',
                      color: active ? '#fff' : 'var(--color-text-muted)',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      minHeight: '28px',
                    }}
                  >
                    {active ? '✓ ' : ''}{t}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {hasCfpData && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={cfpOnly}
                onChange={(e) => setCfpOnly((e.target as HTMLInputElement).checked)}
              />
              CFP open now
            </label>
          )}
          {hasFilters && (
            <button
              onClick={clearAll}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-muted)', fontSize: '0.85rem',
                textDecoration: 'underline', padding: 0, fontFamily: 'inherit',
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
        {filtered.length} event{filtered.length !== 1 ? 's' : ''}
        {hasFilters ? ' matching filters' : ''}
      </div>

      {/* Event cards */}
      {filtered.length === 0 ? (
        <div class="empty-state">
          <p>{hasFilters ? 'No events match your filters.' : 'No upcoming events right now.'}</p>
          {hasFilters && (
            <button
              onClick={clearAll}
              style={{
                background: 'var(--color-accent)', color: '#fff',
                border: 'none', borderRadius: '8px',
                padding: '0.5rem 1.25rem', cursor: 'pointer',
                fontSize: '0.9rem', fontFamily: 'inherit',
                marginTop: '0.5rem',
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div class="card-grid">
          {filtered.map((e) => {
            const cfpClose = toDate(e.cfpClose);
            const dateFrom = toDate(e.dateFrom);
            const dateTo = toDate(e.dateTo);

            const cfpIsOpen = cfpClose ? now <= cfpClose : null;

            const dateStr = dateFrom
              ? dateTo && dateFrom.toDateString() !== dateTo.toDateString()
                ? `${fmt(dateFrom)} – ${fmt(dateTo)}`
                : fmt(dateFrom)
              : (e.dateFromRaw as string) || 'TBC';

            return (
              <article key={`${e.name}-${e.dateFromRaw}`} class="event-card">
                <div class="event-card__header">
                  <span class="state-pill" data-state={e.state}>
                    {e.state === 'VIRTUAL' ? 'Virtual' : e.state}
                  </span>
                  {(e.tags as string[]).slice(0, 3).map((tag) => (
                    <span key={tag} class="tag-chip">{tag}</span>
                  ))}
                </div>
                <div class="event-card__name">
                  {e.url
                    ? <a href={e.url as string} target="_blank" rel="noopener noreferrer">{e.name as string}</a>
                    : e.name as string
                  }
                </div>
                <div class="event-card__date">{dateStr}</div>
                {(e.cfpOpenRaw || e.cfpCloseRaw) && (
                  <div class="event-card__cfp">
                    {cfpIsOpen === true && <span class="cfp-open">CFP open</span>}
                    {cfpIsOpen === false && <span class="cfp-closed">CFP closed</span>}
                    {cfpIsOpen === null && (e.cfpOpenRaw || e.cfpCloseRaw) && (
                      <span>CFP: {[e.cfpOpenRaw, e.cfpCloseRaw].filter(Boolean).join(' – ')}</span>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
