# Typography Configuration

## Google Fonts Import

Add to your HTML `<head>` or CSS:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

## Font Usage

- **Headings:** DM Sans
  - Weights: 400, 500, 600, 700
  - Use for: Page titles, section headers, card titles

- **Body text:** Inter
  - Weights: 400, 500, 600
  - Use for: Paragraph text, labels, buttons, UI elements

- **Code/technical:** IBM Plex Mono
  - Weights: 400, 500
  - Use for: Word pronunciations, phonetics, technical content

## CSS Examples

```css
/* Headings */
h1, h2, h3, h4, h5, h6 {
  font-family: 'DM Sans', sans-serif;
}

/* Body text */
body, p, span, div {
  font-family: 'Inter', sans-serif;
}

/* Monospace/technical */
code, pre, .phonetic {
  font-family: 'IBM Plex Mono', monospace;
}
```

## Tailwind Configuration

When using Tailwind classes:

```jsx
{/* Heading */}
<h1 className="font-sans" style={{ fontFamily: 'DM Sans, sans-serif' }}>
  PhotoEnglish
</h1>

{/* Body */}
<p style={{ fontFamily: 'Inter, sans-serif' }}>
  Body text here
</p>

{/* Mono */}
<span className="font-mono">
  /həˈləʊ/
</span>
```
