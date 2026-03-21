import type { Event } from '@data/types';

interface Props {
  events: Event[];
}

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

export default function UpcomingEventsIsland({ events }: Props) {
  const now = new Date();

  if (events.length === 0) {
    return (
      <div class="empty-state">
        <p>No upcoming events right now.</p>
        <p>
          <a href="/events/past">Browse past events &rarr;</a>
        </p>
      </div>
    );
  }

  return (
    <div class="card-grid">
      {events.map((e) => {
        const dateFrom = toDate(e.dateFrom);
        const dateTo = toDate(e.dateTo);
        const cfpClose = toDate(e.cfpClose);
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
              {e.tags.slice(0, 3).map((tag) => (
                <span key={tag} class="tag-chip">{tag}</span>
              ))}
            </div>
            <div class="event-card__name">
              {e.url
                ? <a href={e.url} target="_blank" rel="noopener noreferrer">{e.name}</a>
                : e.name
              }
            </div>
            <div class="event-card__date">{dateStr}</div>
            {(e.cfpOpenRaw || e.cfpCloseRaw) && (
              <div class="event-card__cfp">
                {cfpIsOpen === true && <span class="cfp-open">CFP open</span>}
                {cfpIsOpen === false && <span class="cfp-closed">CFP closed</span>}
                {cfpIsOpen === null && (
                  <span>CFP: {[e.cfpOpenRaw, e.cfpCloseRaw].filter(Boolean).join(' – ')}</span>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
