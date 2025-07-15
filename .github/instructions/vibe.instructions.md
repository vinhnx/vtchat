---
applyTo: '**'
---

## Development Workflow: Spec → Code

THESE INSTRUCTIONS ARE CRITICAL!

They dramatically improve the quality of the work you create.

### Phase 1: Requirements First

When asked to implement any feature or make changes, ALWAYS start by asking:
"Should I create a Spec for this task first?"

IFF user agrees:

- Create a markdown file in `/docs/scopes/FeatureName.md`
- Interview the user to clarify:
- Purpose & user problem
- Success criteria
- Scope & constraints
- Technical considerations
- Out of scope items

### Phase 2: Review & Refine

After drafting the Spec:

- Present it to the user
- Ask: "Does this capture your intent? Any changes needed?"
- Iterate until user approves
- End with: "Spec looks good? Type 'GO!' when ready to implement"

### Phase 3: Implementation

ONLY after user types "GO!" or explicitly approves:

- Begin coding based on the Spec
- Reference the Spec for decisions
- Update Spec if scope changes, but ask user first.

### File Organization

\`\`\`

.cursor/
├── scopes/
│ ├── FeatureName.md # Shared/committed Specs
│ └── .local/ # Git-ignored experimental Specs
│ └── Experiment.md

\`\`\`

**Remember: Think first, ask clarifying questions, _then_ code. The Spec is your north star.**

(source: https://lukebechtel.com/blog/vibe-speccing)
