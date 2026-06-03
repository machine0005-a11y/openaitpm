# Style Guide

## Design Preset

Base preset: `compact_reference_guide`.

Named override: `golden_sample_visual_guide`.

The override preserves the golden sample's compact Word layout, Aptos typography, footer, extracted diagrams, and color-coded callouts.

## Page Setup

- Page size: US Letter portrait, 8.5 x 11 in.
- Margins: top 0.55 in, bottom 0.55 in, left 0.65 in, right 0.65 in.
- Header: no visible header text.
- Footer: right-aligned `Claude Code Best Practices for PgMs | Draft v1`.
- Footer styling: Aptos, 8 pt, gray `#7F7F7F`.
- Main content width: 7.2 in.
- Figure display width: 6.9 in.

## Typography

- Body font: Aptos, 10 pt, dark slate/automatic text color.
- Title: Aptos Display or Aptos, 26 pt, dark blue `#17365D`.
- Subtitle: Aptos, 12 pt, italic, blue `#4F81BD`.
- Heading 1: Aptos, 16 pt, bold, blue `#1F4E79`, with extra spacing before.
- Caption: Aptos, 8.5 pt, italic, gray `#595959`.
- Prompt quote: Aptos, 10 pt, bold italic, blue `#4F81BD`, left indented.

## Colors

- Dark navy text: `#0B1F33`.
- Heading blue: `#1F4E79`.
- Secondary blue: `#2F5496`.
- Prompt blue: `#4F81BD`.
- Footer gray: `#7F7F7F`.
- Table header blue: `#1F4E79`.
- Source table header blue: `#5B9BD5`.
- Decision log header charcoal: `#404040`.
- Golden callout fill: `#FFF2CC`.
- PgM mindset callout fill: `#E2F0D9`.
- Light table fill: `#F7F9FB`.
- Table border gray: `#D9E2EC`.

## Figures

- Use extracted PNGs from `assets/images/` when available.
- Insert figures centered at 6.9 in wide.
- Place figure captions immediately below figures.
- Keep captions as body text, not baked into the images.

## Tables

- Use real Word tables for tabular material.
- Use fixed widths and explicit cell padding.
- Header rows use white bold text on a colored fill.
- Body cells use readable padding and wrapping; no fixed row heights.
- Best-practices table: 3 columns, wide prompt/action column.
- Deterministic-sources table: 3 columns, wider use/guardrail columns.
- Decision-log table: 5 columns with three blank entry rows.
- One-cell callouts use a filled table cell with bold label and body text.

## Content Rules

- Preserve the teaching flow: reason first, source the work, build in controlled loops, then hand off.
- Keep prompt templates reusable and workplace-safe.
- Use deterministic sources wherever the guide discusses reporting, dashboards, status, or decisions.
- Ask for assumptions, missing dependencies, logic gaps, architecture options, and simpler alternatives before implementation.
- Treat Claude chat as the planning/reasoning surface and Claude Code/Codex as the controlled execution surface.
- Require human review before publishing, sending, or acting on generated outputs.
