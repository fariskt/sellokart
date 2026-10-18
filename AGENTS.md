# AGENTS.md

## Stack

Next.js App Router, React, TypeScript.

## Core Rules

* **Always use existing design tokens** for colors, typography, spacing, borders, shadows, radii, and other visual values. Never hardcode values when a token exists.
* **Always reuse existing shared UI components** before creating new UI. Check the shared/component library first. eg  instead of <button> use <Button> from ui compoents.
* If a shared component is close to what is needed, extend it with props or variants instead of duplicating it.
* New reusable UI must be added to the appropriate shared UI directory.
* Preserve the existing design system, UI, behavior, responsiveness, and architecture.
* Change only what the user explicitly requests. Keep diffs minimal.
* Do not redesign, restyle, refactor, or modify unrelated code.
* Follow existing project structure, naming, styling, and component patterns.
* Prefer Server Components; use `"use client"` only when required.
* Use strict TypeScript and avoid `any`.
* Reuse existing utilities, hooks, types, and patterns before creating new ones.
* Do not add dependencies unless necessary.
* Never replace design tokens with arbitrary Tailwind values such as `text-[#...]`, `bg-[#...]`, or random spacing when an existing token can be used.

## Before Creating UI

1. Check existing shared UI components.
2. Check existing design tokens.
3. Reuse or extend them whenever possible.
4. Create something new only when no suitable reusable option exists.

## Priority

**Design tokens → Shared UI components → Existing patterns → New code**

**If the user did not ask for it, do not change it.**
