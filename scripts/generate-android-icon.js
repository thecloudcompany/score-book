#!/usr/bin/env node

/**
 * Android Adaptive Icon Generator
 * 
 * Takes your app icon and creates a properly sized adaptive icon
 * with the logo centered in the safe zone (61% of canvas).
 * 
 * Android adaptive icons:
 * - Canvas: 108dp (324px at 3x density)
 * - Safe zone: center 66dp (198px at 3x density) = 61% of canvas
 * - Outer 39% can be masked by device manufacturers
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const INPUT_ICON = './assets/images/icon.png';
const OUTPUT_ICON = './assets/images/android-adaptive-icon.png';
const CANVAS_SIZE = 324; // 108dp at 3x
const SAFE_ZONE = 198;   // 66dp at 3x (61% of canvas)
const BACKGROUND_COLOR = '#FFFFFF';

async function generateAdaptiveIcon() {
  console.log('🎨 Generating Android adaptive icon...');
  
  // Check if input exists
  if (!fs.existsSync(INPUT_ICON)) {
    console.error(`❌ Input icon not found: ${INPUT_ICON}`);
    process.exit(1);
  }

  // Resize the icon to fit within the safe zone
  const resizedIcon = await sharp(INPUT_ICON)
    .resize(SAFE_ZONE, SAFE_ZONE, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toBuffer();

  // Create canvas with background color
  const canvas = await sharp({
    create: {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      channels: 4,
      background: BACKGROUND_COLOR,
    },
  });

  // Composite the resized icon onto the canvas (centered)
  await canvas
    .composite([
      {
        input: resizedIcon,
        gravity: 'center',
      },
    ])
    .png()
    .toFile(OUTPUT_ICON);

  console.log(`✅ Adaptive icon generated: ${OUTPUT_ICON}`);
  console.log(`   Canvas: ${CANVAS_SIZE}x${CANVAS_SIZE}px`);
  console.log(`   Icon: ${SAFE_ZONE}x${SAFE_ZONE}px (centered in safe zone)`);
}

generateAdaptiveIcon().catch((err) => {
  console.error('❌ Error generating adaptive icon:', err);
  process.exit(1);
});
