/**
 * Base Monster class for enemies that patrol platforms
 */
export class Monster {
  constructor(scene, x, y, platformWidth, config = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.platformWidth = platformWidth;
    this.sprite = null;
    
    this.speed = config.speed || 100; // pixels per second
    this.direction = 1; // 1 = right, -1 = left
    this.platformStartX = x - (platformWidth / 2);
    this.platformEndX = x + (platformWidth / 2);
    
    this.isAlive = true;
  }

  /**
   * Create the sprite and setup physics
   */
  create() {
    // Override in subclass
  }

  /**
   * Update movement AI
   */
  update() {
    if (!this.sprite || !this.isAlive) return;

    // Move in current direction
    this.sprite.body.setVelocityX(this.direction * this.speed);

    // Check platform edges - turn around before falling off
    const edgeMargin = 20;
    if (this.direction === 1 && this.sprite.x > this.platformEndX - edgeMargin) {
      this.reverseDirection();
    } else if (this.direction === -1 && this.sprite.x < this.platformStartX + edgeMargin) {
      this.reverseDirection();
    }

    // Flip sprite based on direction
    this.sprite.flipX = this.direction === -1;
  }

  /**
   * Reverse movement direction
   */
  reverseDirection() {
    this.direction *= -1;
  }

  /**
   * Check collision with player
   * @returns {boolean} true if player should take damage
   */
  checkPlayerCollision(player) {
    if (!this.sprite || !this.isAlive) return false;
    
    return this.scene.physics.overlap(this.sprite, player);
  }

  /**
   * Called when hit by projectile
   * @returns {boolean} true if monster was killed
   */
  takeDamage() {
    // Override in subclass
    return false;
  }

  /**
   * Death sequence
   */
  die() {
    if (!this.isAlive) return;
    
    this.isAlive = false;
    this.sprite.body.setVelocity(0, 0);
    this.sprite.setTint(0xff0000);
    
    // Fade out and destroy
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        if (this.sprite) {
          this.sprite.destroy();
          this.sprite = null;
        }
      }
    });
  }

  /**
   * Clean up sprite
   */
  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}

/**
 * SlimeMonster - Can be killed by projectiles
 */
export class SlimeMonster extends Monster {
  create() {
    this.speed = 150; // Faster than default
    this.sprite = this.scene.physics.add.sprite(this.x, this.y, 'slimeWalk1');
    this.sprite.setScale(0.8);
    this.sprite.body.setGravityY(800);
    
    // Create walk animation
    if (!this.scene.anims.exists('slime-walk')) {
      this.scene.anims.create({
        key: 'slime-walk',
        frames: [
          { key: 'slimeWalk1' },
          { key: 'slimeWalk2' }
        ],
        frameRate: 8,
        repeat: -1
      });
    }
    
    this.sprite.play('slime-walk');
  }

  takeDamage() {
    this.die();
    return true; // Was killed
  }
}

/**
 * SpiderMonster - Cannot be killed (immortal)
 */
export class SpiderMonster extends Monster {
  create() {
    this.sprite = this.scene.physics.add.sprite(this.x, this.y, 'spiderWalk1');
    this.sprite.setScale(0.8);
    this.sprite.body.setGravityY(800);
    this.sprite.setTint(0x8800ff); // Purple tint to distinguish from slimes
    
    // Adjust body size to match actual sprite
    this.sprite.body.setSize(this.sprite.width * 0.7, this.sprite.height * 0.8);
    this.sprite.body.setOffset(this.sprite.width * 0.15, this.sprite.height * 0.2);
    
    // Create walk animation
    if (!this.scene.anims.exists('spider-walk')) {
      this.scene.anims.create({
        key: 'spider-walk',
        frames: [
          { key: 'spiderWalk1' },
          { key: 'spiderWalk2' }
        ],
        frameRate: 8,
        repeat: -1
      });
    }
    
    this.sprite.play('spider-walk');
  }

  /**
   * Override update to use larger edge margin for spiders
   */
  update() {
    if (!this.sprite || !this.isAlive) return;

    // Move in current direction
    this.sprite.body.setVelocityX(this.direction * this.speed);

    // Check platform edges - larger margin for spiders due to body offset
    const edgeMargin = 50;
    if (this.direction === 1 && this.sprite.x > this.platformEndX - edgeMargin) {
      this.reverseDirection();
    } else if (this.direction === -1 && this.sprite.x < this.platformStartX + edgeMargin) {
      this.reverseDirection();
    }

    // Flip sprite based on direction
    this.sprite.flipX = this.direction === -1;
  }

  takeDamage() {
    // Spiders are immortal - show hit effect but don't die
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (this.sprite) {
        this.sprite.setTint(0x8800ff); // Back to purple
      }
    });
    return false; // Not killed
  }
}
