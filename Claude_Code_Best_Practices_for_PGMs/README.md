# Claude Code Best Practices for PgMs

This folder is a reproducible document-generation project rebuilt from the attached Word document. The original DOCX was used as a golden sample for structure, visuals, tables, and style. Future edits should happen in the source files here, then the DOCX should be regenerated.

## Folder Layout

```text
Claude_Code_Best_Practices_for_PGMs/
  AGENTS.md
  README.md
  source/
    guide_content.md
    visual_plan.md
    style_guide.md
  assets/
    images/
  scripts/
    build_docx.py
  output/
```

## Build

From this folder:

```bash
python3 -m pip install python-docx
python scripts/build_docx.py
```

The script writes:

```text
output/Claude_Code_Best_Practices_for_PGMs_Visual_Guide.docx
```

If `python-docx` is already available in the active Python environment, the install command can be skipped.

## Edit Workflow

1. Update `source/guide_content.md` for guide copy, prompts, tables, and sequence.
2. Update `source/visual_plan.md` if a figure needs to be replaced or regenerated.
3. Update `source/style_guide.md` if page, table, callout, or footer styling changes.
4. Run `python scripts/build_docx.py`.
5. Open the generated DOCX and review layout before publishing or using it operationally.

## Golden Sample Notes

The source DOCX contained nine embedded PNG figures. They were extracted into `assets/images/` and are referenced by `guide_content.md`. The visual plan also includes diagram specifications so Claude Code, Codex, or another AI coding agent can regenerate similar visuals later if needed.
