# Aceon Design

Updated: 2026-05-21

## Design Direction

Theme: Chainsaw Man inspired academic mission-control.

Core characteristics:
- high contrast
- angular/square geometry
- blood red primary actions
- acid green accent signals
- dense but scannable data surfaces

## Tokens

- Primary: `#E62E2D`
- Accent: `#2BFF00`
- Background: `#000000`
- Surface: `#0A0A0A` / `#111111`
- Border: `#27272a`

## Typography

- Display: Anton (`--font-display`)
- Body: Inter (`--font-sans`)
- Mono/system labels: JetBrains Mono (`--font-mono`)
- Glitch accent: Rubik Glitch (`--font-glitch`, sparing use)

## Component Rules

- Keep square or clipped corners; avoid soft-rounded SaaS style.
- Maintain visible interaction states (hover/focus/active).
- Keep touch targets `>= 44px` on mobile.
- Preserve player control legibility over textured backgrounds.

## Text-on-Image Readability

Always combine:
- image opacity control (around `<= 60%`)
- strong black gradient overlay
- text shadow on foreground copy

## Layout Principles

- Desktop: dense dashboard scanability.
- Mobile: single-column clarity, route-driven navigation, persistent bottom tab bar. The desktop sheet/sidebar pattern is not used on mobile.
- Avoid horizontal overflow in all route surfaces.

## Motion Principles

- Use motion for orientation, not decoration.
- Keep transitions short and purposeful.
- Respect reduced-motion needs in future iterations.

## Design Source of Truth

- Canonical machine-readable design spec: `docs/DESIGN.yaml`
- This file (`DESIGN.md`) is the practical implementation guide for product/design reviews.
