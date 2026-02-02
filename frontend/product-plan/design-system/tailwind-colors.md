# Tailwind Color Configuration

## Overview

PhotoEnglish uses Tailwind CSS built-in colors. No custom configuration needed.

## Color Palette

### Primary: Indigo
Used for buttons, links, key accents.

**Examples:**
- Button: `bg-indigo-600 hover:bg-indigo-700 text-white`
- Link: `text-indigo-600 hover:text-indigo-700 dark:text-indigo-400`
- Active state: `text-indigo-600 dark:text-indigo-400`

### Secondary: Lime
Used for tags, progress indicators, success states.

**Examples:**
- Success message: `text-lime-600 dark:text-lime-400`
- Badge: `bg-lime-100 text-lime-700 dark:bg-lime-900/30`
- Progress bar: `bg-lime-500`

### Neutral: Slate
Used for backgrounds, text, borders.

**Examples:**
- Background: `bg-slate-50 dark:bg-slate-900`
- Text: `text-slate-900 dark:text-slate-100`
- Border: `border-slate-200 dark:border-slate-800`

## Dark Mode

Always include dark mode variants:

```jsx
<div className="bg-white dark:bg-slate-950">
<p className="text-slate-900 dark:text-slate-100">
<button className="text-indigo-600 dark:text-indigo-400">
```

## Common Patterns

### Primary Button
```jsx
<button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2">
  Click Me
</button>
```

### Card
```jsx
<div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
  {/* Content */}
</div>
```

### Input
```jsx
<input className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" />
```
