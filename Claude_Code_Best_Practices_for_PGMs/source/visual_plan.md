# Visual Plan

The original DOCX included nine embedded PNG diagrams. They were extracted into `assets/images/` and should be treated as reusable assets. If a future run needs to regenerate visuals instead of reusing the extracted PNGs, use the specifications below.

## Extracted Asset Inventory

| Figure | Asset | Original size | Placement | Intent |
| --- | --- | --- | --- | --- |
| Figure 1 | `assets/images/image9.png` | 1600 x 650 | Opening model | Show the PgM build model: brainstorm, blueprint, build, review. |
| Figure 2 | `assets/images/image8.png` | 1600 x 650 | 5W Before You Build | Show Why, What, Who, Where, When around the build objective. |
| Figure 3 | `assets/images/image7.png` | 1600 x 650 | Recommended AI Harness | Show Claude chat/reasoning, deterministic sources, and Claude Code as a controlled pipeline. |
| Figure 4 | `assets/images/image6.png` | 1600 x 650 | Recommended Workflow | Show eight numbered build-loop steps from brainstorm to handoff. |
| Figure 5 | `assets/images/image5.png` | 1600 x 650 | Session Checklist | Show an operational checklist with check icons and short labels. |
| Figure 6 | `assets/images/image4.png` | 1600 x 650 | Deterministic Sources | Show Jira, Slack, Confluence, Files/Logs, and Evidence Layer as source flow. |
| Figure 7 | `assets/images/image3.png` | 1600 x 650 | Reusable Prompt Templates | Show five reusable prompt cards. |
| Figure 8 | `assets/images/image2.png` | 1600 x 650 | Decision Log Template | Show Decision Log feeding Next Session Handoff. |
| Figure 9 | `assets/images/image1.png` | 1600 x 650 | Common Failure Modes | Show avoid/do-instead pairs. |

## Shared Diagram Style

- Canvas: 1600 x 650 px.
- Background: white.
- Typography: bold dark navy title; small muted gray subtitle; compact dark navy body text.
- Layout: wide horizontal diagrams with generous white space and a thin gray horizontal rule under the title/subtitle.
- Palette: blue for planning/Claude chat, green for evidence and handoff, orange for architecture/build, red for avoid/failure warnings, dark slate for review/control.
- Shapes: rounded rectangles with light fills and colored outlines.
- Captions live in the DOCX body below each image, not baked into the image.

## Regeneration Specs

### Figure 1 - Claude Code PgM Build Model

- Title: `Claude Code PgM Build Model`.
- Subtitle: `Use AI as a reasoning partner first, then as an execution tool.`
- Main flow: four boxes connected left to right: Brainstorm, Blueprint, Build, Review.
- Each box has a small numbered circle in the upper-left corner.
- Box details:
  - Brainstorm: `Clarify intent`
  - Blueprint: `Review plan`
  - Build: `Execute in Claude Code`
  - Review: `Test and hand off`
- Footer principle: `Principle: the question and blueprint create leverage; code is the last mile.`

### Figure 2 - 5W Before You Build

- Title: `5W Before You Build`.
- Subtitle: `Answer these before opening Terminal or asking Claude Code to execute.`
- Center: dark circular `BUILD` node.
- Surrounding nodes:
  - WHY: pain, decision, or workflow solved
  - WHAT: output, scope, and non-scope
  - WHO: users, reviewers, maintainers
  - WHERE: data, code, access surface
  - WHEN: demo date and milestones
- Connect each node to the center with thin lines.

### Figure 3 - Recommended AI Harness

- Title: `Recommended AI Harness`.
- Subtitle: `Claude chat is the planning room. Claude Code is the job site.`
- Pipeline: `Claude Chat / Reasoning` -> `Deterministic Sources` -> `Claude Code`.
- Under each stage, include short example details:
  - Chat/reasoning: brainstorm, challenge assumptions, review plan, define architecture.
  - Sources: Jira, Slack, Confluence, files, requirements, screenshots, logs.
  - Code: execute surgical edits, build features, test, create files, document handoff.
- Footer guardrail: `Guardrail: do not ask Claude Code to guess. Bring it a reviewed blueprint and source evidence.`

### Figure 4 - Recommended Workflow

- Title: `Recommended Workflow`.
- Subtitle: `Run the work in small, source-grounded loops instead of one large request.`
- Eight connected boxes: Brainstorm, Blueprint, Design, Sources, Build, Modular, Review, Handoff.
- Numbered circles above each box, alternating blue/green/orange/dark slate.
- Footer rule: `Loop rule: complete, test, confirm, then move to the next feature.`

### Figure 5 - Claude Code Session Checklist

- Title: `Claude Code Session Checklist`.
- Subtitle: `Treat each Terminal session like a controlled work session.`
- Two-column checklist with green and blue check icons.
- Items:
  - Open correct folder
  - Paste handoff
  - Inspect files
  - Plan before change
  - Backup first
  - Surgical edits
  - Test after change
  - Update handoff
- Footer discipline: `Operating discipline: every session should start with orientation and end with a handoff.`

### Figure 6 - Deterministic Sources

- Title: `Deterministic Sources`.
- Subtitle: `Ground outputs in evidence before asking Claude to reason or write.`
- Pipeline: Jira -> Slack -> Confluence -> Files / Logs -> Evidence Layer.
- Use compact examples under each label.
- Footer rule: `Rule: memory is not a source. Use evidence links, files, tickets, and docs whenever possible.`

### Figure 7 - Reusable Prompt Templates

- Title: `Reusable Prompt Templates`.
- Subtitle: `Use repeatable prompts to get repeatable outcomes.`
- Five horizontal cards:
  - Requirements
  - Plan Review
  - Architecture
  - Surgical Edit
  - Handoff
- Footer pattern: `Pattern: ask Claude to think, check, structure, then execute.`

### Figure 8 - Decision Log + Handoff

- Title: `Decision Log + Handoff`.
- Subtitle: `Make the build understandable six weeks from now.`
- Left box: Decision Log with bullets for choices made, why made, evidence used, tradeoffs and risks.
- Right box: Next Session Handoff with bullets for current state, files touched, tests completed, known risks, next prompt.
- Arrow from Decision Log to Next Session Handoff.
- Footer goal: `Goal: preserve continuity so Claude does not waste tokens rediscovering the project.`

### Figure 9 - Common Failure Modes

- Title: `Common Failure Modes`.
- Subtitle: `Avoid patterns that create rework, memory issues, and brittle dashboards.`
- Two columns: Avoid and Do Instead.
- Avoid items: Terminal first, full rewrite, many features, no handoff.
- Do Instead items: Blueprint first, surgical edit, one-feature loop, handoff summary.
- Draw arrows between corresponding pairs.
