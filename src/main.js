import Phaser from 'phaser';
import { LevelGeometry } from './LevelGeometry.js';
import { FirstLevel } from './FirstLevel.js';
import { RandomLevelBuilder } from './RandomLevelBuilder.js';
import { ChallengeDoor } from './entities/ChallengeDoor.js';
import { QuizChallenge } from './challenges/QuizChallenge.js';
import { MultipleChoiceQuestion } from './challenges/questions/MultipleChoiceQuestion.js';
import { CalculationQuestion } from './challenges/questions/CalculationQuestion.js';
import { ClockQuestion } from './challenges/questions/ClockQuestion.js';
import { SpellingQuestion } from './challenges/questions/SpellingQuestion.js';
import { SlimeMonster, SpiderMonster } from './entities/Monster.js';
import { Projectile } from './entities/Projectile.js';
import { LeaderboardManager } from './LeaderboardManager.js';

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.currentLevel = 1;
  }

  preload() {
    // Load alien character sprites
    this.load.image('alienStand', 'sprites/Extra animations and enemies/Alien sprites/alienBeige_stand.png');
    this.load.image('alienWalk1', 'sprites/Extra animations and enemies/Alien sprites/alienBeige_walk1.png');
    this.load.image('alienWalk2', 'sprites/Extra animations and enemies/Alien sprites/alienBeige_walk2.png');
    this.load.image('alienJump', 'sprites/Extra animations and enemies/Alien sprites/alienBeige_jump.png');
    
    // Load platform and door tiles
    this.load.image('platform', 'sprites/Base pack/Tiles/grassMid.png');
    this.load.image('floor', 'sprites/Base pack/Tiles/grassMid.png');
    this.load.image('doorClosed', 'sprites/Base pack/Tiles/door_closedMid.png');
    this.load.image('doorTop', 'sprites/Base pack/Tiles/door_closedTop.png');
    
    // Load teleporter sprites
    this.load.image('teleporter', 'sprites/Base pack/Items/switchMid.png');
    
    // Load key sprite
    this.load.image('keyYellow', 'sprites/Base pack/Items/keyYellow.png');
    
    // Load monster sprites
    this.load.image('slimeWalk1', 'sprites/Extra animations and enemies/Enemy sprites/slimeGreen.png');
    this.load.image('slimeWalk2', 'sprites/Extra animations and enemies/Enemy sprites/slimeGreen_walk.png');
    this.load.image('spiderWalk1', 'sprites/Extra animations and enemies/Enemy sprites/spider.png');
    this.load.image('spiderWalk2', 'sprites/Extra animations and enemies/Enemy sprites/spider_walk.png');
    
    // Load projectile sprite
    this.load.image('projectile', 'sprites/Base pack/Items/fireball.png');
  }

  create() {
    // Detect if mobile device
    this.isMobile = this.sys.game.device.os.android || 
                    this.sys.game.device.os.iOS || 
                    this.sys.game.device.os.iPad || 
                    this.sys.game.device.os.iPhone ||
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Generate level
    this.levelGeometry = new LevelGeometry();
    
    // Use FirstLevel for level 1, RandomLevelBuilder for subsequent levels
    if (this.currentLevel === 1) {
      this.levelBuilder = new FirstLevel(this);
    } else {
      this.levelBuilder = new RandomLevelBuilder(this);
    }
    
    this.levelBuilder.generateGeometry(this.levelGeometry);
    const levelObjects = this.levelBuilder.build(this.levelGeometry);
    this.platforms = levelObjects.platforms;
    this.door = levelObjects.door;
    this.teleporters = levelObjects.teleporters || [];

    // Challenge state
    this.challengeActive = false;
    this.challengeDoors = [];
    this.hasKey = false;
    this.completedChallenges = 0;
    this.totalChallenges = 0;
    this.keySprite = null;  // Physical key sprite in the level
    
    // Player lives system
    this.playerLives = 3;
    this.playerMaxLives = 3;
    this.invulnerable = false;
    this.lastHitMonster = null;
    
    // Monsters and projectiles
    this.monsters = [];
    this.projectiles = [];

    // Create challenge doors
    this.createChallengeDoors();

    // Create progress UI (after challenge doors are created so we know total)
    this.createProgressUI();

    // Create player character (alien sprite)
    const startPos = this.levelGeometry.getPlayerStartPosition();
    this.player = this.physics.add.sprite(startPos.x, startPos.y, 'alienStand');
    this.player.body.setGravityY(800);
    this.player.setScale(0.8); // Adjust size if needed

    // Create animations for the player (only if they don't exist yet)
    if (!this.anims.exists('walk')) {
      this.anims.create({
        key: 'walk',
        frames: [
          { key: 'alienWalk1' },
          { key: 'alienWalk2' }
        ],
        frameRate: 10,
        repeat: -1
      });
    }

    if (!this.anims.exists('idle')) {
      this.anims.create({
        key: 'idle',
        frames: [{ key: 'alienStand' }],
        frameRate: 10
      });
    }

    if (!this.anims.exists('jump')) {
      this.anims.create({
        key: 'jump',
        frames: [{ key: 'alienJump' }],
        frameRate: 10
      });
    }

    // Add collision between player and platforms
    this.physics.add.collider(this.player, this.platforms);

    // Expand world bounds to allow camera scrolling
    const worldWidth = 3200;
    const worldHeight = 2400;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    
    // Setup camera to follow player smoothly
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 100);

    // Add level counter and instructional text
    if (this.isMobile) {
      this.text = this.add.text(10, 10, `Level ${this.currentLevel}\nGebruik de knoppen om te spelen`, {
        fontSize: '24px',
        fill: '#ffffff'
      });
      this.text.setScrollFactor(0); // Keep text fixed to camera
    } else {
      this.text = this.add.text(10, 10, `Level ${this.currentLevel}\nPijltjestoetsen = bewegen, Spatie = springen, X = schieten`, {
        fontSize: '24px',
        fill: '#ffffff'
      });
      this.text.setScrollFactor(0); // Keep text fixed to camera
    }

    // Setup keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    this.moveSpeed = 200;
    this.jumpVelocity = -600;

    // Mobile touch controls
    this.mobileControls = {
      left: false,
      right: false,
      jump: false,
      jumpRequested: false,  // Persists until jump is executed
      shoot: false
    };

    // Track active pointers for each button to handle multi-touch properly
    this.activePointers = {
      left: new Set(),
      right: new Set(),
      jump: new Set(),
      shoot: new Set()
    };

    // Track if space was pressed (for edge-triggered jump)
    this.spaceWasPressed = false;

    if (this.isMobile) {
      this.createMobileButtons();
    }
    
    // Create monsters
    this.createMonsters();
    
    // Create health UI
    this.createHealthUI();
    
    // Initialize leaderboard manager and start timer
    this.leaderboardManager = new LeaderboardManager(this);
    if (this.currentLevel === 1) {
      this.leaderboardManager.startTimer();
    }
  }

  nextLevel() {
    // Stop timer and show leaderboard for level 1
    if (this.currentLevel === 1 && this.leaderboardManager) {
      this.leaderboardManager.stopTimer();
      this.leaderboardManager.showCompletionUI();
    } else {
      // For future levels, show finished animation
      this.showFinishedAnimation();
    }
    return;
    
    /* Original nextLevel code - temporarily disabled
    this.currentLevel++;
    
    // Clean up old objects
    if (this.platforms) {
      this.platforms.clear(true, true);
    }
    if (this.door) {
      this.door.destroy();
    }
    if (this.teleporters) {
      this.teleporters.forEach(t => t.destroy());
      this.teleporters = [];
    }
    if (this.challengeDoors) {
      this.challengeDoors.forEach(cd => cd.destroy());
      this.challengeDoors = [];
    }
    if (this.keySprite) {
      this.keySprite.destroy();
      this.keySprite = null;
    }
    
    // Regenerate level - use RandomLevelBuilder for level 2+
    this.levelGeometry = new LevelGeometry();
    this.levelBuilder = new RandomLevelBuilder(this);
    this.levelBuilder.generateGeometry(this.levelGeometry);
    const levelObjects = this.levelBuilder.build(this.levelGeometry);
    this.platforms = levelObjects.platforms;
    this.door = levelObjects.door;
    this.teleporters = levelObjects.teleporters || [];

    // Create challenge doors for new level (this resets key state)
    this.createChallengeDoors();
    
    // Update progress UI for new level
    this.updateProgressUI();
    
    // Reset player position
    const startPos = this.levelGeometry.getPlayerStartPosition();
    this.player.x = startPos.x;
    this.player.y = startPos.y;
    this.player.body.setVelocity(0, 0);
    
    // Update text
    this.text.setText(this.isMobile ? 
      `Level ${this.currentLevel}\nGebruik de knoppen om te spelen` : 
      `Level ${this.currentLevel}\nPijltjestoetsen om te bewegen, Spatiebalk om te springen`);
    
    // Re-add collision
    this.physics.add.collider(this.player, this.platforms);
    */
  }
  
  /**
   * Show a finished/victory animation
   */
  showFinishedAnimation() {
    // Prevent multiple triggers
    if (this.finishedShowing) return;
    this.finishedShowing = true;
    
    // Freeze player
    this.player.body.setVelocity(0, 0);
    this.challengeActive = true;  // Disable controls
    
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    
    // Dark overlay
    const overlay = this.add.rectangle(
      centerX, centerY,
      this.cameras.main.width, this.cameras.main.height,
      0x000000, 0
    ).setScrollFactor(0).setDepth(700);
    
    // Fade in overlay
    this.tweens.add({
      targets: overlay,
      alpha: 0.8,
      duration: 500
    });
    
    // Victory elements (start invisible)
    const trophy = this.add.text(centerX, centerY - 80, '🏆', {
      fontSize: '120px'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(701).setAlpha(0).setScale(0);
    
    const title = this.add.text(centerX, centerY + 50, 'Gefeliciteerd!', {
      fontSize: '64px',
      fill: '#ffdd00',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(701).setAlpha(0);
    
    const subtitle = this.add.text(centerX, centerY + 130, 'Je hebt het level voltooid!', {
      fontSize: '32px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(701).setAlpha(0);
    
    // Animate trophy pop-in
    this.time.delayedCall(300, () => {
      this.tweens.add({
        targets: trophy,
        alpha: 1,
        scale: 1,
        duration: 500,
        ease: 'Back.easeOut'
      });
    });
    
    // Animate title
    this.time.delayedCall(600, () => {
      this.tweens.add({
        targets: title,
        alpha: 1,
        duration: 400
      });
    });
    
    // Animate subtitle
    this.time.delayedCall(900, () => {
      this.tweens.add({
        targets: subtitle,
        alpha: 1,
        duration: 400
      });
    });
    
    // Add confetti-like particles
    this.time.delayedCall(400, () => {
      this.createConfetti();
    });
  }
  
  /**
   * Create confetti particle effect
   */
  createConfetti() {
    const colors = ['🎉', '🎊', '⭐', '✨', '🌟'];
    const centerX = this.cameras.main.centerX;
    
    for (let i = 0; i < 20; i++) {
      const emoji = colors[Math.floor(Math.random() * colors.length)];
      const x = centerX + (Math.random() - 0.5) * 600;
      const startY = -50;
      
      const particle = this.add.text(x, startY, emoji, {
        fontSize: `${24 + Math.random() * 24}px`
      }).setScrollFactor(0).setDepth(702);
      
      this.tweens.add({
        targets: particle,
        y: this.cameras.main.height + 50,
        x: x + (Math.random() - 0.5) * 200,
        rotation: Math.random() * 6,
        duration: 2000 + Math.random() * 2000,
        delay: Math.random() * 1000,
        ease: 'Quad.easeIn',
        onComplete: () => particle.destroy()
      });
    }
  }

  update() {
    // Update monsters (always, even during challenges)
    for (const monster of this.monsters) {
      monster.update();
      
      // Check monster collision with player (only if not in challenge and not invulnerable)
      if (!this.challengeActive && !this.invulnerable && monster.checkPlayerCollision(this.player)) {
        // Only damage if this is a different monster than last time
        if (this.lastHitMonster !== monster) {
          this.lastHitMonster = monster;
          this.damagePlayer();
        }
      } else if (this.lastHitMonster === monster && !monster.checkPlayerCollision(this.player)) {
        // Reset tracking when no longer touching this monster
        this.lastHitMonster = null;
      }
    }
    
    // Update projectiles (always, even during challenges)
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(this.platforms);
      
      // Check collision with monsters
      projectile.checkMonsterCollision(this.monsters);
      
      // Remove inactive projectiles
      if (!projectile.isActive) {
        this.projectiles.splice(i, 1);
      }
    }
    
    // Skip player control when challenge is active
    if (this.challengeActive) {
      return;
    }

    // Horizontal movement - keyboard or mobile
    if (this.cursors.left.isDown || this.mobileControls.left) {
      this.player.body.setVelocityX(-this.moveSpeed);
      this.player.setFlipX(true); // Face left
      if (this.player.body.touching.down) {
        this.player.anims.play('walk', true);
      }
    } else if (this.cursors.right.isDown || this.mobileControls.right) {
      this.player.body.setVelocityX(this.moveSpeed);
      this.player.setFlipX(false); // Face right
      if (this.player.body.touching.down) {
        this.player.anims.play('walk', true);
      }
    } else {
      this.player.body.setVelocityX(0);
      if (this.player.body.touching.down) {
        this.player.anims.play('idle', true);
      }
    }

    // Handle keyboard jump - track edge trigger manually for reliability
    const spaceIsDown = this.spaceKey.isDown;
    const spaceJustPressed = spaceIsDown && !this.spaceWasPressed;
    this.spaceWasPressed = spaceIsDown;

    // Request jump on button press (will be consumed when grounded)
    if (spaceJustPressed || this.mobileControls.jumpRequested) {
      if (this.player.body.touching.down) {
        // Execute jump
        this.player.body.setVelocityY(this.jumpVelocity);
        this.player.anims.play('jump', true);
        this.mobileControls.jumpRequested = false;  // Consume the request
      }
      // If not grounded, jumpRequested stays true until we land and jump
    }

    // Clear jump request if button/key released while still in air
    if (!spaceIsDown && !this.mobileControls.jump) {
      this.mobileControls.jumpRequested = false;
    }

    // Play jump animation when in air
    if (!this.player.body.touching.down && this.player.anims.currentAnim?.key !== 'jump') {
      this.player.anims.play('jump', true);
    }
    
    // Handle shooting - keyboard or mobile
    if (Phaser.Input.Keyboard.JustDown(this.shootKey) || this.mobileControls.shoot) {
      this.shootProjectile();
      this.mobileControls.shoot = false; // Reset to prevent continuous fire
    }

    // Check for door collision - only proceed if player has key
    if (this.door && this.physics.overlap(this.player, this.door)) {
      if (this.hasKey) {
        this.nextLevel();
      } else {
        // Show hint that key is needed
        this.showDoorLockedHint();
      }
    }

    // Check for key pickup
    if (this.keySprite && this.physics.overlap(this.player, this.keySprite)) {
      this.collectKey();
    }

    // Check for challenge door collision
    for (const challengeDoor of this.challengeDoors) {
      if (challengeDoor.checkOverlap(this.player)) {
        break;  // Only one challenge at a time
      }
    }

    // Check for teleporter collision - one-way only from 'from' to 'to'
    if (this.teleporters && this.teleporters.length >= 2) {
      const fromTeleporter = this.teleporters.find(t => t.teleporterType === 'from');
      const toTeleporter = this.teleporters.find(t => t.teleporterType === 'to');
      
      if (fromTeleporter && toTeleporter && this.physics.overlap(this.player, fromTeleporter)) {
        if (!this.teleportCooldown) {
          this.player.x = toTeleporter.x;
          this.player.y = toTeleporter.y - 50;
          this.player.body.setVelocity(0, 0);
          this.teleportCooldown = true;
          this.time.delayedCall(1000, () => { this.teleportCooldown = false; });
        }
      }
    }

    // Keep player within horizontal world bounds
    const worldWidth = 3200;
    if (this.player.x < 0) {
      this.player.x = 0;
      this.player.body.setVelocityX(0);
    } else if (this.player.x > worldWidth) {
      this.player.x = worldWidth;
      this.player.body.setVelocityX(0);
    }
  }

  /**
   * Maakt challenge deuren aan op basis van level geometry
   */
  createChallengeDoors() {
    const challengeDoorData = this.levelGeometry.getChallengeDoors();
    this.totalChallenges = challengeDoorData.length;
    this.completedChallenges = 0;
    this.hasKey = false;
    
    for (const doorData of challengeDoorData) {
      let challenge;
      
      if (doorData.challengeType === 'quiz') {
        // Maak Question objecten van de data
        const questions = doorData.challengeData.questions.map(qData => {
          switch (qData.type) {
            case 'multipleChoice':
              return new MultipleChoiceQuestion({
                question: qData.question,
                options: qData.options,
                correctIndex: qData.correctIndex
              });
            case 'calculation':
              return new CalculationQuestion({
                question: qData.question,
                answer: qData.answer
              });
            case 'clock':
              return new ClockQuestion({
                hours: qData.hours,
                minutes: qData.minutes
              });
            case 'spelling':
              return new SpellingQuestion({
                image: qData.image,
                answer: qData.answer,
                hint: qData.hint
              });
            default:
              console.warn(`Onbekend vraagtype: ${qData.type}`);
              return null;
          }
        }).filter(q => q !== null);

        challenge = new QuizChallenge(this, questions);
      }
      
      if (challenge) {
        const challengeDoor = new ChallengeDoor(this, doorData.x, doorData.y, challenge);
        
        // Add callback for when challenge is completed
        const originalCallback = challenge.onCompleteCallback;
        challenge.onCompleteCallback = () => {
          if (originalCallback) originalCallback();
          this.onChallengeCompleted();
        };
        
        challengeDoor.create();
        this.challengeDoors.push(challengeDoor);
      }
    }
    
    // If no challenges, player starts with key
    if (this.totalChallenges === 0) {
      this.hasKey = true;
    }
  }

  /**
   * Create the progress UI showing challenges completed and key status
   */
  createProgressUI() {
    const padding = 15;
    const x = this.cameras.main.width - padding;
    const y = padding + 10;  // Moved down a bit
    
    // Challenge progress text (right-aligned)
    this.progressText = this.add.text(x, y, '', {
      fontSize: '20px',
      fill: '#ffffff',
      align: 'right',
      stroke: '#000000',
      strokeThickness: 3
    }).setScrollFactor(0).setDepth(101).setOrigin(1, 0);
    
    // Key status text (right-aligned, below progress)
    this.keyStatusText = this.add.text(x, y + 28, '', {
      fontSize: '22px',
      fill: '#ffdd00',
      align: 'right',
      stroke: '#000000',
      strokeThickness: 3
    }).setScrollFactor(0).setDepth(101).setOrigin(1, 0);
    
    this.updateProgressUI();
  }
  
  /**
   * Update the progress UI display
   */
  updateProgressUI() {
    if (this.progressText) {
      if (this.totalChallenges > 0) {
        this.progressText.setText(`⭐ ${this.completedChallenges} / ${this.totalChallenges}`);
      } else {
        this.progressText.setText('Geen uitdagingen');
      }
    }
    
    if (this.keyStatusText) {
      if (this.hasKey) {
        this.keyStatusText.setText('🔑 Sleutel!');
        this.keyStatusText.setFill('#44ff44');
      } else if (this.keySprite) {
        // Key has spawned but not collected yet
        this.keyStatusText.setText('🔑 Zoek de sleutel!');
        this.keyStatusText.setFill('#ffdd00');
      } else {
        this.keyStatusText.setText('🔒 Nodig: sleutel');
        this.keyStatusText.setFill('#ff6666');
      }
    }
  }
  
  /**
   * Called when a challenge is completed
   */
  onChallengeCompleted() {
    this.completedChallenges++;
    
    // Check if all challenges are done - spawn key in level
    if (this.completedChallenges >= this.totalChallenges && !this.keySprite && !this.hasKey) {
      this.spawnKey();
    }
    
    this.updateProgressUI();
  }
  
  /**
   * Spawn the key sprite in the level
   */
  spawnKey() {
    const keyX = 1600;
    const keyY = 2200; 
    
    // Create key sprite
    this.keySprite = this.physics.add.sprite(keyX, keyY, 'keyYellow');
    this.keySprite.body.setAllowGravity(false);
    this.keySprite.setDepth(50);
    
    // Add floating animation
    this.tweens.add({
      targets: this.keySprite,
      y: keyY - 15,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Add glow/scale pulse
    this.tweens.add({
      targets: this.keySprite,
      scale: 1.2,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Show message that key appeared
    this.showKeySpawned();
  }
  
  /**
   * Collect the key when player touches it
   */
  collectKey() {
    if (!this.keySprite) return;
    
    // Destroy key sprite
    this.keySprite.destroy();
    this.keySprite = null;
    
    // Give player the key
    this.hasKey = true;
    this.updateProgressUI();
    
    // Show obtained message
    this.showKeyObtained();
  }
  
  /**
   * Show message that key has appeared in the level
   */
  showKeySpawned() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY - 100;
    
    const text = this.add.text(centerX, centerY, '🔑 Een sleutel is verschenen!\nZoek en pak de sleutel!', {
      fontSize: '26px',
      fill: '#ffdd00',
      backgroundColor: '#000000aa',
      padding: { x: 20, y: 15 },
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(600);
    
    // Fade out after 2.5 seconds
    this.tweens.add({
      targets: text,
      alpha: 0,
      duration: 500,
      delay: 2000,
      onComplete: () => text.destroy()
    });
  }
  
  /**
   * Show key obtained animation/message
   */
  showKeyObtained() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    
    // Key obtained popup
    const popup = this.add.rectangle(centerX, centerY, 350, 150, 0x225522, 0.95)
      .setScrollFactor(0)
      .setDepth(600);
    
    const border = this.add.rectangle(centerX, centerY, 354, 154, 0x44ff44, 1)
      .setScrollFactor(0)
      .setDepth(599);
    
    const keyIcon = this.add.text(centerX, centerY - 25, '🔑', {
      fontSize: '48px'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(601);
    
    const text = this.add.text(centerX, centerY + 30, 'Sleutel verkregen!\nGa naar de deur!', {
      fontSize: '24px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(601);
    
    // Auto-dismiss after 2 seconds
    this.time.delayedCall(2000, () => {
      popup.destroy();
      border.destroy();
      keyIcon.destroy();
      text.destroy();
    });
  }
  
  /**
   * Show hint that door is locked
   */
  showDoorLockedHint() {
    // Only show if not already showing
    if (this.doorHintActive) return;
    this.doorHintActive = true;
    
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY - 100;
    
    const hint = this.add.text(centerX, centerY, '🔒 Voltooi alle uitdagingen voor de sleutel!', {
      fontSize: '24px',
      fill: '#ff6666',
      backgroundColor: '#000000aa',
      padding: { x: 15, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(600);
    
    // Fade out and remove after 1.5 seconds
    this.tweens.add({
      targets: hint,
      alpha: 0,
      duration: 500,
      delay: 1000,
      onComplete: () => {
        hint.destroy();
        this.doorHintActive = false;
      }
    });
  }

  createMobileButtons() {
    const buttonSize = 120;
    const buttonMargin = 30;
    const gameHeight = this.scale.height;
    const gameWidth = this.scale.width;
    const buttonY = gameHeight - buttonMargin - buttonSize / 2;
    
    // Left button (lower left corner)
    const leftButtonX = buttonMargin + buttonSize / 2;
    this.leftButton = this.add.rectangle(leftButtonX, buttonY, buttonSize, buttonSize, 0x444444, 0.7);
    this.leftButton.setScrollFactor(0);
    this.leftButton.setInteractive();
    this.leftButton.setDepth(100);
    
    const leftText = this.add.text(leftButtonX, buttonY, '←', {
      fontSize: '64px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    leftText.setScrollFactor(0);
    leftText.setDepth(101);

    this.leftButton.on('pointerdown', (pointer) => {
      this.activePointers.left.add(pointer.id);
      this.mobileControls.left = true;
      this.leftButton.setFillStyle(0x666666, 0.9);
    });
    this.leftButton.on('pointerup', (pointer) => {
      this.activePointers.left.delete(pointer.id);
      if (this.activePointers.left.size === 0) {
        this.mobileControls.left = false;
        this.leftButton.setFillStyle(0x444444, 0.7);
      }
    });
    this.leftButton.on('pointerout', (pointer) => {
      this.activePointers.left.delete(pointer.id);
      if (this.activePointers.left.size === 0) {
        this.mobileControls.left = false;
        this.leftButton.setFillStyle(0x444444, 0.7);
      }
    });
    this.leftButton.on('pointerupoutside', (pointer) => {
      this.activePointers.left.delete(pointer.id);
      if (this.activePointers.left.size === 0) {
        this.mobileControls.left = false;
        this.leftButton.setFillStyle(0x444444, 0.7);
      }
    });

    // Right button (lower left corner, next to left button)
    const rightButtonX = leftButtonX + buttonSize + 20;
    this.rightButton = this.add.rectangle(rightButtonX, buttonY, buttonSize, buttonSize, 0x444444, 0.7);
    this.rightButton.setScrollFactor(0);
    this.rightButton.setInteractive();
    this.rightButton.setDepth(100);
    
    const rightText = this.add.text(rightButtonX, buttonY, '→', {
      fontSize: '64px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    rightText.setScrollFactor(0);
    rightText.setDepth(101);

    this.rightButton.on('pointerdown', (pointer) => {
      this.activePointers.right.add(pointer.id);
      this.mobileControls.right = true;
      this.rightButton.setFillStyle(0x666666, 0.9);
    });
    this.rightButton.on('pointerup', (pointer) => {
      this.activePointers.right.delete(pointer.id);
      if (this.activePointers.right.size === 0) {
        this.mobileControls.right = false;
        this.rightButton.setFillStyle(0x444444, 0.7);
      }
    });
    this.rightButton.on('pointerout', (pointer) => {
      this.activePointers.right.delete(pointer.id);
      if (this.activePointers.right.size === 0) {
        this.mobileControls.right = false;
        this.rightButton.setFillStyle(0x444444, 0.7);
      }
    });
    this.rightButton.on('pointerupoutside', (pointer) => {
      this.activePointers.right.delete(pointer.id);
      if (this.activePointers.right.size === 0) {
        this.mobileControls.right = false;
        this.rightButton.setFillStyle(0x444444, 0.7);
      }
    });

    // Shoot button (lower left corner, next to right button)
    const shootButtonX = rightButtonX + buttonSize + 20;
    this.shootButton = this.add.rectangle(shootButtonX, buttonY, buttonSize, buttonSize, 0xff4444, 0.7);
    this.shootButton.setScrollFactor(0);
    this.shootButton.setInteractive();
    this.shootButton.setDepth(100);
    
    const shootText = this.add.text(shootButtonX, buttonY, '🔫', {
      fontSize: '48px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    shootText.setScrollFactor(0);
    shootText.setDepth(101);

    this.shootButton.on('pointerdown', (pointer) => {
      this.activePointers.shoot.add(pointer.id);
      this.mobileControls.shoot = true;
      this.shootButton.setFillStyle(0xff6666, 0.9);
    });
    this.shootButton.on('pointerup', (pointer) => {
      this.activePointers.shoot.delete(pointer.id);
      if (this.activePointers.shoot.size === 0) {
        this.shootButton.setFillStyle(0xff4444, 0.7);
      }
    });
    this.shootButton.on('pointerout', (pointer) => {
      this.activePointers.shoot.delete(pointer.id);
      if (this.activePointers.shoot.size === 0) {
        this.shootButton.setFillStyle(0xff4444, 0.7);
      }
    });
    this.shootButton.on('pointerupoutside', (pointer) => {
      this.activePointers.shoot.delete(pointer.id);
      if (this.activePointers.shoot.size === 0) {
        this.shootButton.setFillStyle(0xff4444, 0.7);
      }
    });

    // Jump button (lower right corner)
    const jumpButtonX = gameWidth - buttonMargin - buttonSize / 2;
    this.jumpButton = this.add.rectangle(jumpButtonX, buttonY, buttonSize, buttonSize, 0x444444, 0.7);
    this.jumpButton.setScrollFactor(0);
    this.jumpButton.setInteractive();
    this.jumpButton.setDepth(100);
    
    const jumpText = this.add.text(jumpButtonX, buttonY, '↑', {
      fontSize: '64px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    jumpText.setScrollFactor(0);
    jumpText.setDepth(101);

    this.jumpButton.on('pointerdown', (pointer) => {
      this.activePointers.jump.add(pointer.id);
      this.mobileControls.jump = true;
      this.mobileControls.jumpRequested = true;  // Request jump (persists until executed)
      this.jumpButton.setFillStyle(0x666666, 0.9);
    });
    this.jumpButton.on('pointerup', (pointer) => {
      this.activePointers.jump.delete(pointer.id);
      if (this.activePointers.jump.size === 0) {
        this.mobileControls.jump = false;
        this.jumpButton.setFillStyle(0x444444, 0.7);
      }
    });
    this.jumpButton.on('pointerout', (pointer) => {
      this.activePointers.jump.delete(pointer.id);
      if (this.activePointers.jump.size === 0) {
        this.mobileControls.jump = false;
        this.jumpButton.setFillStyle(0x444444, 0.7);
      }
    });
    this.jumpButton.on('pointerupoutside', (pointer) => {
      this.activePointers.jump.delete(pointer.id);
      if (this.activePointers.jump.size === 0) {
        this.mobileControls.jump = false;
        this.jumpButton.setFillStyle(0x444444, 0.7);
      }
    });
  }
  
  /**
   * Create monsters from level geometry
   */
  createMonsters() {
    const monsterData = this.levelGeometry.getMonsters();
    this.monsters = [];
    
    for (const data of monsterData) {
      let monster;
      if (data.type === 'slime') {
        monster = new SlimeMonster(this, data.x, data.y, data.platformWidth);
      } else if (data.type === 'spider') {
        monster = new SpiderMonster(this, data.x, data.y, data.platformWidth);
      }
      
      if (monster) {
        monster.create();
        this.monsters.push(monster);
        
        // Add collision with platforms
        this.physics.add.collider(monster.sprite, this.platforms);
      }
    }
  }
  
  /**
   * Create health UI showing player lives
   */
  createHealthUI() {
    this.heartIcons = [];
    const heartSize = 40;
    const spacing = 45;
    const startX = this.cameras.main.width - (this.playerMaxLives * spacing) - 10;
    const startY = 100;
    
    for (let i = 0; i < this.playerMaxLives; i++) {
      const heart = this.add.text(startX + (i * spacing), startY, '❤️', {
        fontSize: '32px'
      });
      heart.setScrollFactor(0);
      heart.setDepth(200);
      this.heartIcons.push(heart);
    }
    
    this.updateHealthUI();
  }
  
  /**
   * Update health UI to reflect current lives
   */
  updateHealthUI() {
    for (let i = 0; i < this.heartIcons.length; i++) {
      if (i < this.playerLives) {
        this.heartIcons[i].setAlpha(1);
      } else {
        this.heartIcons[i].setAlpha(0.2);
      }
    }
  }
  
  /**
   * Shoot a projectile from player position
   */
  shootProjectile() {
    const direction = this.player.flipX ? -1 : 1;
    const offsetX = direction * 30; // Spawn bullet in front of player
    
    const projectile = new Projectile(
      this,
      this.player.x + offsetX,
      this.player.y,
      direction
    );
    projectile.create();
    this.projectiles.push(projectile);
  }
  
  /**
   * Player takes damage
   */
  damagePlayer() {
    if (this.invulnerable) return;
    
    this.playerLives--;
    this.updateHealthUI();
    
    // Flash red
    this.player.setTint(0xff0000);
    
    if (this.playerLives <= 0) {
      // Game over - restart level
      this.time.delayedCall(500, () => {
        this.restartLevel();
      });
    } else {
      // Invulnerability frames
      this.invulnerable = true;
      
      // Flash effect
      this.time.addEvent({
        delay: 100,
        repeat: 15,
        callback: () => {
          this.player.alpha = this.player.alpha === 1 ? 0.5 : 1;
        }
      });
      
      this.time.delayedCall(1500, () => {
        this.invulnerable = false;
        this.player.clearTint();
        this.player.alpha = 1;
        // Don't reset lastHitMonster here - it will reset when player stops touching the monster
      });
    }
  }
  
  /**
   * Restart the current level - reset all progress
   */
  restartLevel() {
    // Freeze player during restart
    this.player.body.setVelocity(0, 0);
    this.challengeActive = true;
    
    // Clean up challenge doors
    if (this.challengeDoors) {
      this.challengeDoors.forEach(cd => cd.destroy());
      this.challengeDoors = [];
    }
    
    // Destroy key sprite if it exists
    if (this.keySprite) {
      this.keySprite.destroy();
      this.keySprite = null;
    }
    
    // Clean up monsters
    if (this.monsters) {
      this.monsters.forEach(m => m.destroy());
      this.monsters = [];
    }
    
    // Clean up projectiles
    if (this.projectiles) {
      this.projectiles.forEach(p => p.destroy());
      this.projectiles = [];
    }
    
    // Reset player state
    this.playerLives = this.playerMaxLives;
    this.invulnerable = false;
    this.lastHitMonster = null;
    this.player.clearTint();
    this.player.alpha = 1;
    
    // Recreate challenge doors (fresh Challenge instances)
    this.createChallengeDoors();
    
    // Recreate monsters
    this.createMonsters();
    
    // Reset player position
    const startPos = this.levelGeometry.getPlayerStartPosition();
    this.player.x = startPos.x;
    this.player.y = startPos.y;
    this.player.body.setVelocity(0, 0);
    this.player.anims.play('idle', true);
    
    // Re-enable controls
    this.challengeActive = false;
    
    // Update UI
    this.updateProgressUI();
    this.updateHealthUI();
  }
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#222222',
  scene: GameScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1600,
    height: 800,
    // Use window.innerHeight which accounts for mobile browser UI (nav bar)
    parent: document.body,
    expandParent: false
  },
  input: {
    activePointers: 3 // Enable up to 3 simultaneous touch points
  }
};

// Function to resize game to fit actual viewport (important for mobile browsers)
function resizeGame() {
  const canvas = document.querySelector('canvas');
  if (canvas) {
    // window.innerHeight accounts for mobile browser chrome/navigation bars
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    document.body.style.height = windowHeight + 'px';
  }
}

// Handle resize and orientation change
window.addEventListener('resize', resizeGame);
window.addEventListener('orientationchange', () => {
  // Delay to allow browser to finish orientation change
  setTimeout(resizeGame, 100);
});

// Initial resize
resizeGame();

const game = new Phaser.Game(config);
