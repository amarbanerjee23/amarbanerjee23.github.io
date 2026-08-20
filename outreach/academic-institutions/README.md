# Academic Institution Outreach Package

This folder contains the institution-facing brochure and pitch system for academic outreach.

## Structure

- `brochures/latex/` contains the editable LaTeX sources and the shared `brochure-template.tex` design system.
- `brochures/pdf/` contains generated PDFs created by GitHub Actions.
- `pitch/` contains the executive pitch source and generated PDF/PNG assets.

## Brochure set

- `academic-innovation-programs.pdf` - 12-page master booklet containing all four program briefs, facilitator story and collaboration pathway.
- `academic-innovation-partnership.pdf` - 4-page facilitator + institutional collaboration brief.
- `innovation-in-academia.pdf` - 2-page faculty/research transformation program.
- `modern-day-professional.pdf` - 2-page student/early-career future-readiness program.
- `technology-to-emotions.pdf` - 2-page human-centred technology and responsible-AI program.
- `storytelling-in-education.pdf` - 2-page narrative-thinking and academic storytelling program.

## Design principles

The brochure system uses a single reusable A4 template with Source Sans Pro, a deep-navy institutional base, program-specific accent colours, high-contrast typography, spacious cards and two-page program layouts. The extra page per program is intentional: it prevents overflow and keeps the learning journey, outcomes, methods and investment information readable instead of shrinking text into one crowded page.

The build workflow verifies page counts, rejects LaTeX overfull boxes/compiler errors and renders every brochure through Poppler before publishing generated PDFs.

## Recommended use

Start outreach with the one-slide executive pitch. If there is interest, share the 12-page master booklet or the 4-page Academic Innovation Partnership brief. Once the cohort or institutional priority is clear, share only the relevant 2-page program brochure.

Generated brochures are copied to `downloads/` so existing website links remain compatible.
