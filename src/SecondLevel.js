import { LevelBuilder } from './LevelBuilder.js';

/**
 * Second level - placeholder geometry.
 * TODO: Replace platforms, challenge questions and monster positions with real level design.
 */
export class SecondLevel extends LevelBuilder {
  generateGeometry(levelGeometry) {
    // Floor tiles spanning the whole world
    levelGeometry.floorTiles = [];
    for (let x = 0; x < levelGeometry.worldWidth; x += levelGeometry.tileWidth) {
      levelGeometry.floorTiles.push({
        x: x + levelGeometry.tileWidth / 2,
        y: levelGeometry.floorY
      });
    }

    // TODO: Replace with real level 2 platform layout
    levelGeometry.platforms = [
      // Starting area
      { x: 300, y: 2100, width: 280 },
      { x: 600, y: 1900, width: 210 },
      { x: 900, y: 1700, width: 210 },

      // Middle section
      { x: 1200, y: 1500, width: 280 },
      { x: 1500, y: 1300, width: 210 },
      { x: 1800, y: 1100, width: 280 },

      // Upper section
      { x: 2100, y: 900, width: 280 },
      { x: 2400, y: 700, width: 210 },
      { x: 2650, y: 500, width: 280 },

      // Final approach to door
      { x: 2800, y: 300, width: 280 },
      { x: 2800, y: 100, width: 280 },
    ];

    // Player starts at bottom-left
    levelGeometry.startX = 50;
    levelGeometry.startY = 2200;

    // Exit door at top-right
    levelGeometry.doorX = 2800;
    levelGeometry.doorY = 25;
    levelGeometry.doorPlatformY = 100;

    // No teleporters in placeholder
    levelGeometry.teleporters = [];

    // TODO: Replace with real level 2 challenge questions
    levelGeometry.challengeDoors = [
      {
        x: 300,
        y: 2000, // On platform at y: 2100
        challengeType: 'quiz',
        challengeData: {
          questions: [
            // TODO: Replace placeholder questions with real level 2 questions
            {
              type: 'multipleChoice',
              question: '[PLACEHOLDER] Wat is 1 + 1?',
              options: ['1', '2', '3', '4'],
              correctIndex: 1
            },
            {
              type: 'calculation',
              question: '[PLACEHOLDER] Hoeveel is 5 × 5?',
              answer: 25
            },
            {
              type: 'multipleChoice',
              question: '[PLACEHOLDER] Welke kleur heeft de lucht overdag?',
              options: ['Rood', 'Groen', 'Blauw', 'Geel'],
              correctIndex: 2
            }
          ]
        }
      },
      {
        x: 1800,
        y: 1000, // On platform at y: 1100
        challengeType: 'quiz',
        challengeData: {
          questions: [
            // TODO: Replace placeholder questions with real level 2 questions
            {
              type: 'multipleChoice',
              question: '[PLACEHOLDER] Hoeveel dagen heeft een week?',
              options: ['5', '6', '7', '8'],
              correctIndex: 2
            },
            {
              type: 'calculation',
              question: '[PLACEHOLDER] Hoeveel is 10 - 3?',
              answer: 7
            },
            {
              type: 'multipleChoice',
              question: '[PLACEHOLDER] Wat is de grootste planeet in ons zonnestelsel?',
              options: ['Aarde', 'Mars', 'Jupiter', 'Saturnus'],
              correctIndex: 2
            }
          ]
        }
      }
    ];

    // TODO: Replace with real level 2 monster placement
    levelGeometry.monsters = [
      { type: 'slime', x: 600, y: 1840, platformWidth: 210 },
      { type: 'slime', x: 1200, y: 1440, platformWidth: 280 },
      { type: 'spider', x: 2100, y: 840, platformWidth: 280 }
    ];
  }
}
