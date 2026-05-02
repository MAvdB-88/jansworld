const MAX_LEVELS = 2;

/**
 * LeaderboardManager handles timer, score submission, and leaderboard display
 */
export class LeaderboardManager {
  constructor(scene) {
    this.scene = scene;
    this.startTime = null;
    this.endTime = null;
    this.completionTime = null;
  }

  /**
   * Start the timer when level begins
   */
  startTimer() {
    this.startTime = Date.now();
    this.endTime = null;
    this.completionTime = null;
  }

  /**
   * Stop the timer when level is completed
   * @returns {number} Completion time in milliseconds
   */
  stopTimer() {
    if (!this.startTime) return 0;
    
    this.endTime = Date.now();
    this.completionTime = this.endTime - this.startTime;
    return this.completionTime;
  }

  /**
   * Format time as MM:SS.mmm
   * @param {number} milliseconds - Time in milliseconds
   * @returns {string} Formatted time string
   */
  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = milliseconds % 1000;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${Math.floor(ms / 10).toString().padStart(2, '0')}`;
  }

  /**
   * Save score to leaderboard via backend API
   * @param {string} playerName
   * @param {number} completionTime - milliseconds
   * @param {number} level
   */
  async saveScore(playerName, completionTime, level = 1) {
    try {
      const response = await fetch('/api/saveScore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName || 'Anonymous',
          completionTime: completionTime,
          level: level
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save score');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving score:', error);
      throw error;
    }
  }

  /**
   * Fetch leaderboard from backend API
   * @param {number} limit
   * @param {number|null} level - filter by level, or null for all
   */
  async getLeaderboard(limit = 10, level = null) {
    try {
      const params = new URLSearchParams({ limit: String(limit) });
      if (level !== null) params.set('level', String(level));
      const response = await fetch(`/api/getLeaderboard?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      return data.leaderboard;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  /**
   * Show completion UI: auto-saves score using logged-in player name, then shows leaderboard.
   * @param {number} level - The level that was just completed
   */
  async showCompletionUI(level = 1) {
    const completionTime = this.completionTime;
    const formattedTime = this.formatTime(completionTime);

    // Get player name from ProgressManager (always logged in at this point)
    const progressManager = this.scene.progressManager;
    const playerName = progressManager ? progressManager.getPlayerName() : 'Anonymous';

    // Pause the scene
    this.scene.scene.pause();
    this.scene.input.keyboard.enabled = false;

    const canvas = document.querySelector('canvas');
    if (canvas) canvas.style.pointerEvents = 'none';

    // Overlay
    const overlay = this.scene.add.rectangle(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x000000, 0.8
    ).setScrollFactor(0).setDepth(1000);

    const container = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(1001);

    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    const title = this.scene.add.text(centerX, centerY - 200, `Level ${level} voltooid!`, {
      fontSize: '48px', fill: '#00ff00', fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    const timeText = this.scene.add.text(centerX, centerY - 140, `Tijd: ${formattedTime}`, {
      fontSize: '32px', fill: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    const savingText = this.scene.add.text(centerX, centerY - 80, 'Score opslaan...', {
      fontSize: '22px', fill: '#aaaaaa'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    container.add([overlay, title, timeText, savingText]);

    // Auto-save score then show leaderboard
    try {
      await this.saveScore(playerName, completionTime, level);
    } catch (e) {
      // Non-fatal: continue to show leaderboard even if save failed
      console.error('Score save failed:', e);
    }

    title.destroy();
    timeText.destroy();
    savingText.destroy();

    this.scene.input.keyboard.enabled = true;
    this.showLeaderboard(container, centerX, centerY, level);

    return container;
  }

  /**
   * Display the leaderboard for the given level, with navigation buttons.
   * @param {Phaser.GameObjects.Container} container
   * @param {number} centerX
   * @param {number} centerY
   * @param {number} level
   */
  async showLeaderboard(container, centerX, centerY, level = 1) {
    const _cleanup = () => {
      const canvas = document.querySelector('canvas');
      if (canvas) canvas.style.pointerEvents = 'auto';
      this.scene.input.keyboard.enabled = true;
      this.scene.scene.resume();
      container.destroy();
    };

    try {
      const leaderboard = await this.getLeaderboard(10, level);

      const leaderboardTitle = this.scene.add.text(
        centerX, centerY - 200,
        `Top 10 — Level ${level}`,
        { fontSize: '36px', fill: '#ffff00', fontStyle: 'bold' }
      ).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

      const entriesText = leaderboard.length > 0
        ? leaderboard.map((entry, i) =>
            `${i + 1}. ${entry.player_name || 'Anonymous'} — ${this.formatTime(entry.completion_time)}`
          ).join('\n')
        : '(nog geen scores)';

      const leaderboardText = this.scene.add.text(centerX, centerY - 50, entriesText, {
        fontSize: '20px', fill: '#ffffff', align: 'center', lineSpacing: 10
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

      container.add([leaderboardTitle, leaderboardText]);

      // --- Navigation buttons ---
      const buttonStyle = {
        padding: '12px 28px',
        fontSize: '22px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        zIndex: '999999',
        pointerEvents: 'auto',
        userSelect: 'none',
        position: 'fixed',
        transform: 'translateX(-50%)',
      };
      const applyStyle = (el, overrides) => Object.assign(el.style, buttonStyle, overrides);

      const hasNextLevel = level < MAX_LEVELS;

      // "Volgend Level" button (only if there is a next level)
      if (hasNextLevel) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = `Level ${level + 1} spelen ▶`;
        applyStyle(nextBtn, {
          left: '50%',
          top: 'calc(50% + 200px)',
          backgroundColor: '#00aa00',
          color: '#ffffff',
        });
        document.body.appendChild(nextBtn);

        nextBtn.onclick = () => {
          if (document.body.contains(nextBtn)) document.body.removeChild(nextBtn);
          if (document.body.contains(levelSelectBtn)) document.body.removeChild(levelSelectBtn);
          _cleanup();
          this.scene.scene.start('GameScene', { level: level + 1 });
        };

        // "Level Kiezen" button — offset to leave room for next-level button
        const levelSelectBtn = document.createElement('button');
        levelSelectBtn.textContent = 'Level kiezen';
        applyStyle(levelSelectBtn, {
          left: '50%',
          top: 'calc(50% + 260px)',
          backgroundColor: '#335588',
          color: '#ffffff',
        });
        document.body.appendChild(levelSelectBtn);

        levelSelectBtn.onclick = () => {
          if (document.body.contains(nextBtn)) document.body.removeChild(nextBtn);
          if (document.body.contains(levelSelectBtn)) document.body.removeChild(levelSelectBtn);
          _cleanup();
          this.scene.scene.start('LevelSelectScene');
        };
      } else {
        // No next level — only level select
        const levelSelectBtn = document.createElement('button');
        levelSelectBtn.textContent = 'Level kiezen';
        applyStyle(levelSelectBtn, {
          left: '50%',
          top: 'calc(50% + 200px)',
          backgroundColor: '#335588',
          color: '#ffffff',
        });
        document.body.appendChild(levelSelectBtn);

        levelSelectBtn.onclick = () => {
          if (document.body.contains(levelSelectBtn)) document.body.removeChild(levelSelectBtn);
          _cleanup();
          this.scene.scene.start('LevelSelectScene');
        };
      }
    } catch (error) {
      const errorText = this.scene.add.text(centerX, centerY, 'Fout bij laden leaderboard', {
        fontSize: '24px', fill: '#ff0000'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
      container.add([errorText]);

      const levelSelectBtn = document.createElement('button');
      levelSelectBtn.textContent = 'Level kiezen';
      levelSelectBtn.style.cssText = `position:fixed;left:50%;top:calc(50% + 60px);transform:translateX(-50%);padding:12px 28px;font-size:22px;background:#335588;color:#fff;border:none;border-radius:6px;cursor:pointer;z-index:999999;pointer-events:auto;`;
      document.body.appendChild(levelSelectBtn);
      levelSelectBtn.onclick = () => {
        if (document.body.contains(levelSelectBtn)) document.body.removeChild(levelSelectBtn);
        _cleanup();
        this.scene.scene.start('LevelSelectScene');
      };
    }
  }
}
