
# VOYAGER UI DESIGN BRIEF — Landing Page (Private View)

## 🎯 Overview
Design a minimalist, clean, focused chat landing page for **VOYAGER**. The layout prioritizes whitespace, elegance, and clarity. All interactive UI elements are intentional, sparse, and hidden by default to maintain user focus.

---

## 🎨 Style Guide

### 🖋 Typography
- **Main Heading:**
  - Font: Inter or Space Grotesk (fallback: sans-serif)
  - Weight: 700 (Bold)
  - Size: 32–40px, responsive
  - Letter spacing: 0.05em
  - Color: #1A1A1A (Black)
- **UI Labels (e.g., “Public”):**
  - Font: Inter Regular
  - Size: 14px
  - Color: #1A1A1A
- **Input Placeholder:**
  - Font: Inter, Medium
  - Size: 16px
  - Color: #B0B0B0

---

### 🎛 UI Components

#### Header Layout
- **Hamburger Icon (left):** 16x16px, top-left aligned
- **Public Toggle (right):**
  - Label: "Public"
  - 50% smaller than original
  - Default State: OFF
  - Background: #D3D3D3 (light grey)
  - Icon: White lock
- **Spacing:** ~16px horizontally

#### Main Interface
- **VOYAGER Heading:** Centered horizontally and vertically
- **Chat Input:**
  - Bottom center
  - Width: ~60% of viewport (responsive)
  - Height: 44px
  - Placeholder: “|”
  - Submit Icon: Triangle or arrow, right-aligned inside input

---

## 🧱 Implementation Guide for Developers

- **Framework:** React / Vue / Svelte
- **CSS:** Tailwind CSS (Recommended)
- **State Management:** Zustand or Redux
- **Animation:** Framer Motion or GSAP

---

## 🧩 Component Recommendations

| Component        | Recommended UI Library   | Notes                                           |
|------------------|--------------------------|--------------------------------------------------|
| Toggle Switch    | Radix UI / Headless UI   | Fully customizable + accessibility-ready         |
| Modal / Menu     | Radix UI / Floating UI   | For expanding nav in hamburger or future states  |
| Input Field      | Native / Tailwind Forms  | Easy styling and predictable behavior            |
| Icons            | Tabler / Phosphor / Heroicons | Lightweight and scalable                      |

---

## 🔄 Scalability Considerations

- Navigation hidden in hamburger: expandable for chat history, settings, tooltips
- Toggle governs privacy states: extendable to anonymous/public threads
- Central layout grid: responsive design
- Avoid large UI kits to maintain custom-minimalist identity
