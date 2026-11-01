---
name: design-system-chumbi-valley
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# Chumbi Valley

## Mission
Deliver implementation-ready design-system guidance for Chumbi Valley that can be applied consistently across dashboard web app interfaces.

## Brand
- Product/brand: Chumbi Valley
- URL: https://www.awwwards.com/sites/chumbi-valley#color-typography
- Audience: authenticated users and operators
- Product surface: dashboard web app

## Style Foundations
- Visual style: structured, accessible, implementation-first
- Main font style: `font.family.primary=Inter Tight`, `font.family.stack=Inter Tight`, `font.size.base=14px`, `font.weight.base=300`, `font.lineHeight.base=28px`
- Typography scale: `font.size.xs=13px`, `font.size.sm=13.3px`, `font.size.md=14px`, `font.size.lg=18px`, `font.size.xl=19.46px`, `font.size.2xl=20px`, `font.size.3xl=20.92px`, `font.size.4xl=39.51px`
- Color palette: `color.text.primary=#222222`, `color.text.secondary=#dedede`, `color.text.tertiary=#ffffff`, `color.text.inverse=#fff083`, `color.surface.base=#000000`, `color.surface.muted=#f8f8f8`, `color.border.muted=#a7a7a7`
- Spacing scale: `space.1=6px`, `space.2=8px`, `space.3=10px`, `space.4=12px`, `space.5=14px`, `space.6=15.6px`, `space.7=16px`, `space.8=20px`
- Radius/shadow/motion tokens: `radius.xs=8px`, `radius.sm=72px` | `motion.duration.instant=300ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->
