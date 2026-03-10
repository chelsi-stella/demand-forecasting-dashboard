#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the design tokens file
const tokensPath = '/Users/chelsi.teo/Desktop/design-tokens.tokens.json';
const tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'));

// Helper function to resolve token references like {_semantic colours.positive.positive 600}
function resolveTokenValue(value, allTokens, depth = 0) {
  if (depth > 10) {
    console.warn('Max recursion depth reached for:', value);
    return value;
  }

  if (typeof value !== 'string') return value;

  // Check if it's a reference
  const refMatch = value.match(/^\{(.+)\}$/);
  if (!refMatch) return value;

  const path = refMatch[1].split('.');
  let current = allTokens;

  for (const key of path) {
    if (!current || typeof current !== 'object') return value;
    current = current[key];
  }

  if (current && typeof current === 'object' && 'value' in current) {
    return resolveTokenValue(current.value, allTokens, depth + 1);
  }

  return value;
}

// Helper to convert nested object to flat CSS variable name
function toKebabCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Parse and flatten tokens
function flattenTokens(obj, prefix = '', result = {}) {
  for (const [key, value] of Object.entries(obj)) {
    if (!value || typeof value !== 'object') continue;

    const newPrefix = prefix ? `${prefix}-${toKebabCase(key)}` : toKebabCase(key);

    if ('value' in value && 'type' in value) {
      // This is a token
      const resolvedValue = resolveTokenValue(value.value, tokens);
      result[newPrefix] = {
        type: value.type,
        value: resolvedValue,
        description: value.description || ''
      };
    } else {
      // Recurse into nested structure
      flattenTokens(value, newPrefix, result);
    }
  }

  return result;
}

// Convert color value to CSS format
function convertColorValue(value) {
  if (typeof value === 'string' && value.startsWith('#')) {
    // Handle hex colors with alpha
    if (value.length === 9) {
      const hex = value.slice(1, 7);
      const alpha = parseInt(value.slice(7, 9), 16) / 255;
      return `#${hex}${Math.round(alpha * 100) !== 100 ? ` / ${alpha.toFixed(2)}` : ''}`;
    }
    return value;
  }
  return value;
}

// Convert dimension value to CSS format
function convertDimensionValue(value) {
  if (typeof value === 'number') {
    return value === 0 ? '0' : `${value}px`;
  }
  return value;
}

// Generate CSS variables
function generateCSSVariables(flatTokens) {
  const cssVars = [];

  for (const [name, token] of Object.entries(flatTokens)) {
    let cssValue = token.value;

    switch (token.type) {
      case 'color':
        cssValue = convertColorValue(cssValue);
        break;
      case 'dimension':
        cssValue = convertDimensionValue(cssValue);
        break;
      case 'custom-fontStyle':
        // Skip font styles for now, handle them separately
        continue;
      case 'custom-grid':
        // Skip grid definitions
        continue;
      default:
        break;
    }

    if (token.description) {
      cssVars.push(`  /* ${token.description} */`);
    }
    cssVars.push(`  --${name}: ${cssValue};`);
  }

  return cssVars.join('\n');
}

// Main execution
const flatTokens = flattenTokens(tokens);

// Group tokens by category
const colorTokens = Object.fromEntries(
  Object.entries(flatTokens).filter(([key]) =>
    key.startsWith('core-colours-') || key.startsWith('background-') || key.startsWith('foreground-') || key.startsWith('stroke-')
  )
);

const radiusTokens = Object.fromEntries(
  Object.entries(flatTokens).filter(([key]) => key.startsWith('corner-radius-'))
);

const effectTokens = Object.fromEntries(
  Object.entries(flatTokens).filter(([key]) => key.startsWith('effect-'))
);

console.log('=== HelloFresh Design System Tokens ===\n');
console.log('Color tokens found:', Object.keys(colorTokens).length);
console.log('Radius tokens found:', Object.keys(radiusTokens).length);
console.log('Effect tokens found:', Object.keys(effectTokens).length);
console.log('\nGenerating CSS variables...\n');

// Generate CSS
const css = `
/* ===================================
   HelloFresh Enterprise Design System
   Auto-generated from design-tokens.tokens.json
   =================================== */

:root {
  /* Core Colours - Foreground */
${generateCSSVariables(Object.fromEntries(
  Object.entries(colorTokens).filter(([key]) => key.includes('foreground'))
))}

  /* Core Colours - Background */
${generateCSSVariables(Object.fromEntries(
  Object.entries(colorTokens).filter(([key]) => key.includes('background'))
))}

  /* Core Colours - Stroke */
${generateCSSVariables(Object.fromEntries(
  Object.entries(colorTokens).filter(([key]) => key.includes('stroke'))
))}

  /* Corner Radius */
${generateCSSVariables(radiusTokens)}

  /* Effects */
${generateCSSVariables(effectTokens)}
}
`;

// Write to a separate file
const outputPath = join(__dirname, '..', 'app', 'design-tokens.css');
writeFileSync(outputPath, css);

console.log(`✓ Design tokens written to: ${outputPath}`);
console.log('\nNext steps:');
console.log('1. Review the generated design-tokens.css file');
console.log('2. Import it in your globals.css: @import "./design-tokens.css";');
console.log('3. Map HelloFresh tokens to your existing CSS variables');
