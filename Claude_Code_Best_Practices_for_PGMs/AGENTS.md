# Project Agent Instructions

This project rebuilds the Word guide "Claude Code Best Practices for PgMs - Visual Guide" from editable source files. The original DOCX is a golden sample only. Do not make future content edits directly in the generated DOCX unless the user explicitly asks for a one-off patch.

## Source of Truth

- Edit guide text in `source/guide_content.md`.
- Edit visual intent, regeneration notes, and asset mapping in `source/visual_plan.md`.
- Edit document styling rules in `source/style_guide.md`.
- Keep extracted images in `assets/images/`.
- Regenerate the DOCX with `python scripts/build_docx.py`.

## Build Expectations

- The generated file must be written to `output/Claude_Code_Best_Practices_for_PGMs_Visual_Guide.docx`.
- Use `python-docx` for DOCX generation.
- Preserve the practical PgM teaching flow: brainstorm first, define the 5W, ground work in deterministic sources, review assumptions and gaps, ask for architecture before code, build modularly, avoid broad rewrites, back up, log decisions, and end with a handoff summary.
- Keep edits modular. Do not rewrite the full guide for a small content update.

## Review Expectations

- Before publishing or acting on the document, run the build and visually inspect the output.
- Check that figures remain near their captions and the footer is present.
- Verify tables are readable and do not clip text.
- Treat AI-generated wording, recommendations, and examples as draft material until a human owner reviews them.
