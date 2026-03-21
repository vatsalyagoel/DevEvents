# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A community-maintained list of Australian developer events and meetups. The dataset lives in Markdown files. A static website at `devevents.io` is built from these files using Astro (source in `website/`).

## Website Development

```bash
cd website
npm install
npm run dev      # dev server at localhost:4321
npm run build    # build to website/dist/
npm run preview  # preview the build
```

The website is an Astro 4.x static site with Preact islands for filtering. Data is parsed at build time from the Markdown files. The build runs automatically via GitHub Actions on push to `main` when data files or `website/**` change, deploying to Cloudflare Pages.

## Structure

- `README.md` — upcoming events table (the primary file for new event additions)
- `Past Events/<year>.md` — events archived by year
- `Meetups/<state>.md` — recurring meetups by Australian state (ACT, NSW, NT, QLD, SA, TAS, VIC, WA)
- `CONTRIBUTING.md` — contribution rules
- `FAQ.md` — project FAQ

## Data Format Rules

When editing the events table, follow these conventions exactly (required for future parsing):

- Dates: `dd-Mmm-yyyy` format (e.g., `01-Jan-2026`). Use `TBC` if unknown.
- States: `VIC`, `NSW`, `ACT`, `WA`, `SA`, `NT`, `QLD`, `ALL`, `TAS`, `OTH`
- Events go in **chronological order** within a section
- No extra spaces or formatting characters in table cells
- Only Australian-based events of interest to the software development community
- Links must be verified before adding

## Upcoming vs Past Events

- New events belong in the `README.md` upcoming table
- When a year ends, its events move to `Past Events/<year>.md` (see the archive commit `fb51c7e` for the pattern)
- Only active meetup pages are listed; add a link to `README.md` when adding a new state meetup file
