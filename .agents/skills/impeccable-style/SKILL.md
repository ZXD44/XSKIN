---
name: impeccable-style
description: Impeccable Design & Frontend Excellence system for AI agents, inspired by impeccable.style. Enforces high-craft, anti-AI-slop frontend standards, tactile UI/UX, distinctive typography, purposeful micro-interactions, and visual precision.
---

# 💎 Impeccable Style: Frontend Design & Craft Philosophy

> Based on [impeccable.style](https://impeccable.style) by Paul Bakaus. Eliminates "AI Slop" and elevates web tooling to studio-grade craftsmanship.

---

## 🚫 The Anti-AI-Slop Manifesto (What We Never Do)

1. **No Purple/Indigo Gradient Soup**: Stop pasting generic `linear-gradient(135deg, #6366f1, #a855f7)` everywhere. Every color choice must have intentional semantic purpose.
2. **No Default Font Inertia**: Never default blindly to Inter, Roboto, or generic system fonts without purposeful pairing.
3. **No Nested Card Hell**: Avoid endlessly wrapping cards inside cards with identical `border-radius: 8px` and faint gray borders. Use tonal shifts, spatial separation, hairline dividers, or physical depth.
4. **No Lifeless Static Elements**: Controls must feel physical, responsive, and tactile (pressed states, micro-transitions, crisp focus rings, haptic/audio feedback).
5. **No Low-Contrast Whispering**: Gray text on dark gray backgrounds (`#6b7280` on `#111827`) that hurts readability is banned. Maintain WCAG AA/AAA contrast ratios.

---

## 🎯 The 6 Core Tenets of Impeccable Craft

### 1. Distinctive Personality & Contextual Materiality
- A Minecraft Bedrock tool should feel like an elite Minecraft Engineering Suite (Obsidian, Redstone, Emerald, Netherite), not an enterprise HR dashboard.
- Tactile physical bevels, deep obsidian surfaces, subtle glassmorphic backlight, and pixelated hairline accents.

### 2. High-Impact Typography System
- **Display/Hero**: High-personality pixel/retro or geometric display font (e.g. *Minecraft Ten*, *Press Start 2P*, or punchy bold geometric headers).
- **Body & Controls**: Clean, legible, high x-height humanistic sans (*Space Grotesk*, *Plus Jakarta Sans*, or *Inter Display* with tighter tracking).
- **Technical & Coordinates**: Monospace with tabular numbers (*JetBrains Mono*, *Fira Code*) for UV bounds, resolutions, and UUIDs.

### 3. Purposeful Hierarchy & Spacing (Precision Scale)
- Strict 4px/8px modular grid.
- Density with breathing room: compact controls for power users, expansive preview viewports.
- Clear typographic hierarchy: `h1` (2.2rem bold), `h2` (1.4rem), `label` (0.75rem uppercase tracking-wider), `mono-code` (0.8rem).

### 4. Tactile Micro-Interactions & 60fps Motion
- Physical button press feel: active transform `translateY(2px)` with shadow compression.
- Spring-physics transitions (`cubic-bezier(0.16, 1, 0.3, 1)`) instead of linear fades.
- Sound-reactive feedback using Web Audio API (Click, Snap, Pop, LevelUp) synchronized to the exact frame.

### 5. Unified 3D Workbench Architecture (Zero-Scroll Studio)
- Replace endless vertical stacking with a fluid two-pane workbench:
  - **Left Pane (Sticky Viewport)**: Permanent 3D canvas (360° orbit, real-time animation, interactive part highlighting, slot preview).
  - **Right Pane (Control Studio)**: Multi-step accordion/tabs with instant feedback, zero clutter.

### 6. Relentless Accessibility & Ergonomics
- Visible focus rings with brand emerald glow (`box-shadow: 0 0 0 2px var(--accent-emerald)`).
- Full keyboard navigability (Escape to close modals, Enter/Space for toggles, Ctrl+V for paste).
- Responsive mobile dock with thumb-friendly touch targets (min 44x44px).

---

## 🛠️ Design Vocabulary & Sub-Commands

When refining or reviewing UI code, use these operational directives:

- **/impeccable audit**: Scan UI code for AI-slop anti-patterns (generic fonts, weak contrast, nested cards, gradient soup).
- **/impeccable polish**: Tighten padding, alignment, micro-interactions, border radiuses, and hover/active states.
- **/impeccable bolder**: Amplify personality, deepen shadows, increase font weights, sharpen accent contrasts.
- **/impeccable quieter**: Reduce noise, soften unnecessary borders, replace colorful backgrounds with tonal depths.
- **/impeccable animate**: Add snappy 60fps transitions, entrance spring curves, and hover lifts.
- **/impeccable typeset**: Refine font pairings, letter-spacing, line-heights, and tabular numeral alignments.
