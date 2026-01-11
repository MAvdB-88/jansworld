/**
 * Projectile class for player bullets
 */
export class Projectile {
  constructor(scene, x, y, direction) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.direction = direction; // 1 = right, -1 = left
    this.speed = 800; // Fast projectiles
    this.sprite = null;
    this.isActive = true;
  }

  /**
   * Create the projectile sprite
   */
  create() {
    this.sprite = this.scene.physics.add.sprite(this.x, this.y, 'projectile');
    this.sprite.setScale(0.5);
    this.sprite.body.setAllowGravity(false); // Projectiles fly straight
    this.sprite.body.setVelocityX(this.direction * this.speed);
    
    // Rotate based on direction
    if (this.direction === -1) {
      this.sprite.setFlipX(true);
    }
  }

  /**
   * Update projectile - check for out of bounds or platform collision
   */
  update(platforms) {
    if (!this.sprite || !this.isActive) return;

    // Check if hit a platform
    if (this.scene.physics.overlap(this.sprite, platforms)) {
      this.destroy();
      return;
    }

    // Check if out of world bounds
    const worldBounds = this.scene.physics.world.bounds;
    if (this.sprite.x < 0 || this.sprite.x > worldBounds.width ||
        this.sprite.y < 0 || this.sprite.y > worldBounds.height) {
      this.destroy();
    }
  }

  /**
   * Check collision with monsters
   * @param {Array} monsters - Array of Monster instances
   * @returns {Monster|null} - Monster that was hit, or null
   */
  checkMonsterCollision(monsters) {
    if (!this.sprite || !this.isActive) return null;

    for (const monster of monsters) {
      if (!monster.isAlive || !monster.sprite) continue;

      if (this.scene.physics.overlap(this.sprite, monster.sprite)) {
        const wasKilled = monster.takeDamage();
        this.destroy();
        return monster;
      }
    }
    return null;
  }

  /**
   * Destroy the projectile
   */
  destroy() {
    this.isActive = false;
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}
