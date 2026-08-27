# RRM NPM Source 1.0.29

## RARE INSIGHTS title-page standardization

All RARE INSIGHTS series introduction/title pages now use the approved static title artwork in the GitHub `series/rare-insights/` folder. Archive/content pages remain unchanged.

Final printed title-page assignments:

- Page 98 — `series/rare-insights/a-day-in-a-life.png`
- Page 100 — `series/rare-insights/charity-and-advocacy.png`
- Page 102 — `series/rare-insights/industry-insights.png`
- Page 104 — `series/rare-insights/editors-letters.png`
- Page 106 — `series/rare-insights/medical.png`
- Page 108 — `series/rare-insights/news-and-press-releases.png`
- Page 114 — `series/rare-insights/patient-voice.png`
- Page 116 — `series/rare-insights/rare-caregiving.png`
- Page 118 — `series/rare-insights/rare-ramblings.png`
- Page 120 — `series/rare-insights/rare-rev-inar.png`
- Page 122 — `series/rare-insights/reviews.png`
- Page 124 — `series/rare-insights/science-and-tech.png`
- Page 126 — `series/rare-insights/sunday-sessions.png`
- Page 128 — `series/rare-insights/travel-series.png`
- Page 130 — `series/rare-insights/turning-the-tide.png`

No page numbers were added or removed in this release. Travel Series remains immediately after Sunday Sessions. No clickable SVGs are used.

## 2026-08-26 repository reconciliation checkpoint

The runnable source was reconciled against the current `Joliel21/RRM` `main` asset structure without changing page numbering or approved reader behavior.

Confirmed path updates include the current RARE INSIGHTS filenames, current section-divider locations under `series/`, current root ad locations under `images/ads/`, the Rare Siblings impact-report cover under `magazine-source/public/images/rare-pages/`, current cover URLs on `main`, and root-resolver handling for `images/brand/rare-revolution-trademark-logo.png` and `images/brand/rrm-intro-overlay.png`.

The obsolete legacy asset paths `magazine-source/public/images/tea.png` and `series-cover/resources.png` were intentionally retired on 2026-08-26. The repository asset resolvers now return no URL for those paths, preventing the reader from requesting nonexistent files. No replacement artwork was guessed or substituted.
