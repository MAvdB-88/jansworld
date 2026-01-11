import { LevelBuilder } from './LevelBuilder.js';

/**
 * First level with hard-coded geometry
 */
export class FirstLevel extends LevelBuilder {
  /**
   * Generates hard-coded geometry for the first level
   * @param {LevelGeometry} levelGeometry - The level geometry object to populate
   */
  generateGeometry(levelGeometry) {
    // Floor tiles
    levelGeometry.floorTiles = [];
    for (let x = 0; x < levelGeometry.worldWidth; x += levelGeometry.tileWidth) {
      levelGeometry.floorTiles.push({
        x: x + levelGeometry.tileWidth / 2,
        y: levelGeometry.floorY
      });
    }

    // Hard-coded platforms for first level
    // Create a simple, learnable path to the exit
    levelGeometry.platforms = [
      { x: 350, y: 2100, width: 500 },
      //Difficult jumps
      { x: 550, y: 1900, width: 70 },
      { x: 500, y: 1700, width: 70 },
      { x: 550, y: 1500, width: 70 },

      //Large jump to this platform
      { x: 100, y: 1500, width: 300 },

      //Stairway with gaps
      { x: 0, y: 1300, width: 100 },
      { x: 200, y: 1100, width: 100 },
      { x: 400, y: 990, width: 100 },
      { x: 600, y: 880, width: 100 },
      { x: 800, y: 770, width: 100 },
      { x: 1000, y: 660, width: 100 },
      { x: 1200, y: 550, width: 100 },
      { x: 1400, y: 440, width: 100 },

      //Fall into the unknown here.
      { x: 2000, y: 1400, width: 500 },
      { x: 2100, y: 1300, width: 200 },
      { x: 2240, y: 1200, width: 200 },
      { x: 2380, y: 1100, width: 200 },
      { x: 2520, y: 1000, width: 200 },
      { x: 2660, y: 900, width: 200 },
      { x: 2800, y: 800, width: 200 },
      { x: 2920, y: 700, width: 100 },

      { x: 2950, y: 1000, width: 100 },

      //Platform with teleporter
      { x: 2920, y: 1300, width: 100 },

      //Staiway to heaven
      { x: 1900, y: 400, width: 200 }, //Teleports to here
      { x: 2140, y: 350, width: 200 },
      { x: 2280, y: 300, width: 200 },
      { x: 2420, y: 250, width: 200 },
      { x: 2560, y: 200, width: 200 },
      { x: 2700, y: 150, width: 200 },
      { x: 2800, y: 100, width: 200 },
    ];

    // Set player start position (on the ground initially)
    levelGeometry.startX = 50;
    levelGeometry.startY = 2000;

    // Set door position
    levelGeometry.doorX = 2800;
    levelGeometry.doorY = 25;
    levelGeometry.doorPlatformY = 120;

    // Teleporter positions - one-way teleportation
    levelGeometry.teleporters = [
      { x: 2920, y: 1260, type: 'from' }, // From: On platform at y: 1300
      { x: 1900, y: 360, type: 'to' }     // To: On platform at y: 400
    ];

    // Challenge doors - quiz challenge op het eerste platform
    levelGeometry.challengeDoors = [
      {
        x: 500,
        y: 2000,  // Op platform op y: 2100
        challengeType: 'quiz',
        challengeData: {
          questions: [
            // Nog een multiple choice
            {
              type: 'multipleChoice',
              question: 'Hoe steek je een kaars aan zonder lucifer of aansteker?',
              options: ['Een draak als huisdier nemen', 'Een scheet in de brand steken', 'Een andere kaars gebruiken', 'De kaars in de magentron stoppen'],
              correctIndex: 0
            },
            // Rekenvraag
            {
              type: 'calculation',
              question: 'Hoeveel is 999 X 1000?',
              answer: 999000
            },
            // Spelling vraag
            {
              type: 'spelling',
              image: '',
              answer: 'Piet',
              hint: 'De vader van Piet heeft 4 kinderen: Jan, Gijs, Klaas. Hoe heet het vierde kind?'
            },
            {
              type: 'multipleChoice',
              question: 'Van welke band is Jan fan?',
              options: ['Kinderen voor kinderen', 'Iron Maiden', 'Snollebollekes', 'Metallica'],
              correctIndex: 3
            },
            // Multiple choice vraag
            {
              type: 'multipleChoice',
              question: 'Wat is de hoofdstad van Nederland?',
              options: ['Rotterdam', 'Amsterdam', 'Den Haag', 'Utrecht'],
              correctIndex: 1
            },
            // Rekenvraag
            {
              type: 'calculation',
              question: 'Hoeveel is 7 × 8?',
              answer: 56
            },
            // Spelling vraaggit add
            {
              type: 'spelling',
              image: 'alienStand',
              answer: 'alien',
              hint: 'Hoe noem je dit wezen uit de ruimte?'
            },
            // Nog een multiple choice
            {
              type: 'multipleChoice',
              question: 'Hoeveel poten heeft een spin?',
              options: ['4', '6', '8', '10'],
              correctIndex: 2
            }
          ]
        }
      },
      {
        x: 2700,
        y: 50,
        challengeType: 'quiz',
        challengeData: {
          questions: [
            // Multiple choice vraag
            {
              type: 'multipleChoice',
              question: 'Kan je vuur maken onder water?',
              options: ['Ja', 'Nee'],
              correctIndex: 0
            },
            // Rekenvraag
            {
              type: 'calculation',
              question: 'Hoeveel is 7 X 11 - 10?',
              answer: 67
            },
            // Rekenvraag
            {
              type: 'calculation',
              question: 'Hoeveel is 56079 X 87785 x 0?',
              answer: 0
            },
            // Nog een multiple choice
            {
              type: 'multipleChoice',
              question: 'Wat doet de spreuk Wingardium Leviosa?',
              options: ['Dood mensen', 'Laat dingen zweven', 'Maakt dingen onzichtbaar', 'Ontwapent mensen'],
              correctIndex: 1
            }
          ]
        }
      }
    ];

    // Monsters - spawn op verschillende platforms
    levelGeometry.monsters = [
      // Slijm monsters (mortal) - kunnen doodgeschoten worden
      { x: 350, y: 2050, type: 'slime', platformWidth: 500 },  // Op eerste grote platform
      { x: 2000, y: 1350, type: 'slime', platformWidth: 500 }, // Op platform na teleporter
      { x: 2800, y: 750, type: 'slime', platformWidth: 200 },  // Op platform voor eindconsole
      
      // Spin monsters (immortal) - kunnen niet dood
      { x: 100, y: 1450, type: 'spider', platformWidth: 300 }, // Op platform na moeilijke sprong
      { x: 2420, y: 200, type: 'spider', platformWidth: 200 }  // Op stairway to heaven
    ];
  }
}
