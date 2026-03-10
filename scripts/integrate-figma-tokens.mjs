#!/usr/bin/env node

// HelloFresh Design System - Resolved Figma Variables
// Extracted from Figma using variable definitions API

const figmaVariables = {
  // Foreground Colors
  "Foreground/Positive/Positive dark": "#067a46",
  "Foreground/Negative/Negative dark": "#b30000",
  "Foreground/Dark Neutral/Neutral disabled": "#67676780",
  "Foreground/Dark Neutral/Neutral dark": "#242424",
  "Foreground/Light Neutral/Neutral light": "#ffffff",

  // Background Colors - Dark
  "Background/Dark Positive/Positive mid": "#067a46",
  "Background/Dark Positive/Positive dark": "#056835",
  "Background/Dark Positive/Positive darker": "#035624",
  "Background/Dark Negative/Negative mid": "#970000",
  "Background/Dark Negative/Negative dark": "#7c0000",
  "Background/Dark Neutral/Neutral dark": "#4b4b4b",
  "Background/Dark Neutral/Neutral mid": "#676767",
  "Background/Dark Neutral/Neutral darker": "#242424",

  // Background Colors - Light
  "Background/Light Positive/Positive mid": "#e4fabf",
  "Background/Light Positive/Positive dark": "#d2f895",
  "Background/Light Negative/Negative mid": "#ffccca",
  "Background/Light Negative/Negative dark": "#fcad9a",
  "Background/Light Neutral/Neutral dark": "#eeeeee",
  "Background/Light Neutral/Neutral darker": "#e4e4e4",

  // Stroke Colors
  "Stroke/Positive/Positive lighter": "#d2f895",
  "Stroke/Negative/Negative light": "#db1d1d",
  "Stroke/Neutral/Neutral darker": "#4b4b4b",
  "Stroke/Neutral/Neutral disabled": "#67676780",

  // Neutral
  "HF/Neutral/Neutral-100": "#FFFFFF",

  // Corner Radius
  "Radius": "4",

  // Typography
  "Body/Medium/Semi": "Font(family: \"Source Sans Pro\", style: SemiBold, size: 16, weight: 600, lineHeight: 24, letterSpacing: 0)",
  "HF/Desktop/Large Body Text": "Font(family: \"Source Sans Pro\", style: Regular, size: 20, weight: 400, lineHeight: 32, letterSpacing: 0)"
};

// Convert Figma variable name to CSS variable name
function toKebabCase(str) {
  return str
    .replace(/\//g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Generate CSS variables
const cssVariables = [];

for (const [name, value] of Object.entries(figmaVariables)) {
  if (name.startsWith('Body/') || name.startsWith('HF/Desktop')) {
    // Skip typography for now
    continue;
  }

  const cssVarName = toKebabCase(name);
  let cssValue = value;

  // Convert radius to px
  if (name === 'Radius') {
    cssValue = `${value}px`;
  }

  cssVariables.push(`  --hf-${cssVarName}: ${cssValue};`);
}

const css = `
/* ===================================
   HelloFresh Enterprise Design System
   Resolved Figma Variables
   =================================== */

:root {
${cssVariables.join('\n')}
}
`;

console.log(css);
