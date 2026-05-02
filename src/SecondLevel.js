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

    levelGeometry.addToken(300, 2150); // Add token on the first platform
    levelGeometry.addToken(500, 2150);
    levelGeometry.addToken(700, 2150);
    levelGeometry.addToken(900, 2150);
    levelGeometry.addToken(1100, 2150);

    levelGeometry.addToken(300, 1850); // Add token on the first platform
    levelGeometry.addToken(500, 1850);
    levelGeometry.addToken(700, 1850);
    levelGeometry.addToken(900, 1850);
    levelGeometry.addToken(1100, 1850);

    levelGeometry.addToken(600, 1700);
    levelGeometry.addToken(1000, 1700);

    levelGeometry.addToken(500, 1550);
    levelGeometry.addToken(900, 1550);

    levelGeometry.addToken(600, 1400);
    levelGeometry.addToken(1000, 1400);

    // TODO: Replace with real level 2 monster placement
    levelGeometry.monsters = [
      { type: 'slime', x: 400, y: 2000, platformWidth: 70 },
      { type: 'slime', x: 600, y: 2000, platformWidth: 70 },
      { type: 'slime', x: 800, y: 2000, platformWidth: 70 },
      { type: 'slime', x: 1000, y: 2000, platformWidth: 70 },
      { type: 'slime', x: 400, y: 1700, platformWidth: 70 },
      { type: 'slime', x: 800, y: 1700, platformWidth: 70 },
      { type: 'slime', x: 700, y: 1550, platformWidth: 70 },
      { type: 'slime', x: 1100, y: 1550, platformWidth: 70 },
      { type: 'slime', x: 400, y: 1400, platformWidth: 70 },
      { type: 'slime', x: 800, y: 1400, platformWidth: 70 },
    ];



    levelGeometry.platforms = [
      // Starting area
      { x: 300, y: 2200, width: 70 },
      { x: 500, y: 2200, width: 70 },
      { x: 700, y: 2200, width: 70 },
      { x: 900, y: 2200, width: 70 },
      { x: 1100, y: 2200, width: 70 },

      { x: 400, y: 2050, width: 70 },
      { x: 600, y: 2050, width: 70 },
      { x: 800, y: 2050, width: 70 },
      { x: 1000, y: 2050, width: 70 },

      { x: 300, y: 1900, width: 70 },
      { x: 500, y: 1900, width: 70 },
      { x: 700, y: 1900, width: 70 },
      { x: 900, y: 1900, width: 70 },
      { x: 1100, y: 1900, width: 70 },

      { x: 400, y: 1750, width: 70 },
      { x: 600, y: 1750, width: 70 },
      { x: 800, y: 1750, width: 70 },
      { x: 1000, y: 1750, width: 70 },

      { x: 300, y: 1600, width: 70 },
      { x: 500, y: 1600, width: 70 },
      { x: 700, y: 1600, width: 70 },
      { x: 900, y: 1600, width: 70 },
      { x: 1100, y: 1600, width: 70 },

      { x: 400, y: 1450, width: 70 },
      { x: 600, y: 1450, width: 70 },
      { x: 800, y: 1450, width: 70 },
      { x: 1000, y: 1450, width: 70 },

      // // Middle section
      // { x: 1200, y: 1500, width: 280 },
      // { x: 1500, y: 1300, width: 210 },
      // { x: 1800, y: 1100, width: 280 },

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
        y: 1500, // On platform at y: 2100
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

  }
}
