---
name: Design User Flow
description: Design a ShiftProof user flow — screens, states, transitions, edge cases, and implementation notes
---

## Design User Flow

Use this skill when Amol asks to design, spec, or wireframe any flow from the inventory.

### Steps

1. **Identify the flow** — match it to `memory/user_flows.md`. If not listed, flag and ask to add it first.
2. **Define actors** — who initiates, who receives, what roles are involved.
3. **Map happy path** — numbered steps from trigger to success state.
4. **Map edge cases** — empty states, errors, permission failures, network issues.
5. **Define screens/states** — list every distinct screen or UI state the flow touches.
6. **Transitions** — what triggers each step (tap, API response, timer, etc.).
7. **Data requirements** — what fields are read/written at each step.
8. **Implementation notes** — which existing components can be reused, what needs to be built.

### Output Format

```
## Flow: <Name>
**Actor:** <role>
**Trigger:** <what starts this>
**Success state:** <what done looks like>

### Happy Path
1. ...

### Edge Cases
- ...

### Screens / States
| Screen | Description | Components needed |
|---|---|---|

### Data Requirements
| Step | Reads | Writes |
|---|---|---|

### Implementation Notes
- Reuse: ...
- Build: ...
```

### Context to always apply
- India PG/rental context: UPI payments, Aadhaar KYC, WhatsApp-first communication
- Android only — no iOS references
- Design tokens: violet-600 primary, orange-500 CTA, slate-50 bg
- Existing dashboard is dark (`slate-950`) — new flows inside dashboard inherit this
- Always flag if a flow has a dependency on another unbuilt flow

## Token Efficiency Rules
- ALWAYS start with `get_minimal_context(task="<flow name>")` to check existing relevant code.
- Only read full files if the graph confirms they're directly relevant.
