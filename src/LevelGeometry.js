export class LevelGeometry {
  constructor(worldWidth = 3200) {
    this.worldWidth = worldWidth;
    this.floorY = 2300;
    this.tileWidth = 70;
    this.doorX = 730;
    this.doorY = 50;
    this.doorPlatformY = 120;
    this.startX = 100;
    this.startY = 2200;
    this.keyX = 1600;
    this.keyY = 2200;
    this.platforms = [];
    this.floorTiles = [];
    this.teleporters = [];
    this.challengeDoors = [];  // Array van {x, y, challengeType, challengeData}
    this.monsters = [];  // Array van {x, y, type: 'spider'|'slime', platformWidth}
    this.tokens = []; // Array of tokens to collect
  }

  addToken(x, y) {
    this.tokens.push({ x, y });
  }

  getTokens() {
    return this.tokens;
  }

  getPlayerStartPosition() {
    return { x: this.startX, y: this.startY };
  }

  getKeyPosition() {
    return { x: this.keyX, y: this.keyY };
  }

  getDoorPosition() {
    return { x: this.doorX, y: this.doorY };
  }

  getFloorTiles() {
    return this.floorTiles;
  }

  getPlatforms() {
    return this.platforms;
  }

  getChallengeDoors() {
    return this.challengeDoors;
  }

  getMonsters() {
    return this.monsters;
  }
}
