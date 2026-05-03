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

    levelGeometry.addToken(300, 2150); 
    levelGeometry.addToken(500, 2150);
    levelGeometry.addToken(700, 2150);
    levelGeometry.addToken(900, 2150);
    levelGeometry.addToken(1100, 2150);

    levelGeometry.addToken(50, 1850); 
    levelGeometry.addToken(100, 1850); 
    levelGeometry.addToken(150, 1850); 
    levelGeometry.addToken(200, 1850); 
    levelGeometry.addToken(250, 1850); 
    levelGeometry.addToken(300, 1850); 
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

      { x: 0, y: 1900, width: 670 },
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

    ];

    // Player starts at bottom-left
    levelGeometry.startX = 50;
    levelGeometry.startY = 2200;

    levelGeometry.doorX = 50;
    levelGeometry.doorY = 2000;
    levelGeometry.doorPlatformY = 100;

    // Custom key spawn position for second level
    levelGeometry.keyX = 1000;
    levelGeometry.keyY = 1400; // Near upper platforms

    // No teleporters in placeholder
    levelGeometry.teleporters = [];

    levelGeometry.challengeDoors = [
      {
        x: 300,
        y: 1500,
        challengeType: 'quiz',
        challengeData: {
          questions: [
            {
              type: 'multipleChoice',
              question: 'Wat is het wereldrecord meeste wasknijpers in een baard?',
              options: ['67', '195', '359', '423'],
              correctIndex: 2
            },
            {
              type: 'multipleChoice',
              question: 'Wie heeft het wereldrecord voor de langste nagels?',
              options: ['Ayanna Williams', 'Christine Walton', 'Shirley Hughes', 'Annette Edwards'],
              correctIndex: 0
            },
            {
              type: 'multipleChoice',
              question: 'Hoe lang waren de langste nagels ooit gemeten (bij elkaar)?',
              options: ['469,23 cm', '733,55 cm', '1293,2 cm', '1500,5 cm'],
              correctIndex: 1
            }
          ]
        }
      },
      {
        x: 1450,
        y: 1400, // On platform at y: 1100
        challengeType: 'quiz',
        challengeData: {
          questions: [
            {
              type: 'multipleChoice',
              question: 'Hoe lang is het langste mens ter wereld?',
              options: ['251 cm', '272 cm', '235 cm', '290 cm'],
              correctIndex: 0
            },
            {
              type: 'multipleChoice',
              question: 'Hoe lang was het kortste mens ter wereld ooit gemeten?',
              options: ['62,93 cm', '63,93 cm', '58,93 cm', '59,93 cm'],
              correctIndex: 3
            },
            {
              type: 'multipleChoice',
              question: 'Wat is de grootste planeet in ons zonnestelsel?',
              options: ['Aarde', 'Mars', 'Jupiter', 'Saturnus'],
              correctIndex: 2
            }
          ]
        }
      }
    ];

  }
}
