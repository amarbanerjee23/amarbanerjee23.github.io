# LaTeX brochure system

This directory contains a reusable A4, four-page brochure system aligned with the website's modern flat visual language.

## Brochures

- `academic-innovation-partnership.tex`
- `innovation-in-academia.tex`
- `modern-day-professional.tex`
- `technology-to-emotions.tex`

All four entry files use the shared `brochure-style.tex` template. The template uses the repository root image `headshot.png` for the cover and facilitator profile.

## Compile locally

From this directory:

```bash
latexmk -pdf -interaction=nonstopmode -halt-on-error academic-innovation-partnership.tex
latexmk -pdf -interaction=nonstopmode -halt-on-error innovation-in-academia.tex
latexmk -pdf -interaction=nonstopmode -halt-on-error modern-day-professional.tex
latexmk -pdf -interaction=nonstopmode -halt-on-error technology-to-emotions.tex
```

The GitHub Actions workflow automatically compiles the brochures, copies the resulting PDFs to `downloads/`, creates `.pdf.b64` browser-download versions and commits the generated assets when the LaTeX source or headshot changes.
