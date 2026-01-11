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
   * @param {string} playerName - Player name (optional)
   * @param {number} completionTime - Time in milliseconds
   * @returns {Promise<Object>} Response from API
   */
  async saveScore(playerName, completionTime) {
    try {
      const response = await fetch('/api/saveScore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: playerName || 'Anonymous',
          completionTime: completionTime
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
   * @param {number} limit - Number of top scores to fetch
   * @returns {Promise<Array>} Leaderboard entries
   */
  async getLeaderboard(limit = 10) {
    try {
      const response = await fetch(`/api/getLeaderboard?limit=${limit}`);
      
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
   * Show completion UI with name entry and leaderboard
   */
  async showCompletionUI() {
    const completionTime = this.completionTime;
    const formattedTime = this.formatTime(completionTime);

    // Create semi-transparent overlay
    const overlay = this.scene.add.rectangle(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x000000,
      0.8
    );
    overlay.setScrollFactor(0);
    overlay.setDepth(1000);

    // Create container for UI elements
    const container = this.scene.add.container(0, 0);
    container.setScrollFactor(0);
    container.setDepth(1001);

    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    // Title
    const title = this.scene.add.text(centerX, centerY - 200, 'Level voltooid!', {
      fontSize: '48px',
      fill: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Time display
    const timeText = this.scene.add.text(centerX, centerY - 140, `Tijd: ${formattedTime}`, {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Name entry prompt
    const promptText = this.scene.add.text(centerX, centerY - 80, 'Voer je naam in voor de leaderboard:', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Create HTML input for name (DOM element)
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = 'Je naam (optioneel)';
    inputElement.maxLength = 20;
    inputElement.style.position = 'absolute';
    inputElement.style.left = '50%';
    inputElement.style.top = '50%';
    inputElement.style.transform = 'translate(-50%, -50%)';
    inputElement.style.padding = '10px';
    inputElement.style.fontSize = '20px';
    inputElement.style.width = '300px';
    inputElement.style.textAlign = 'center';
    inputElement.style.zIndex = '10000';
    document.body.appendChild(inputElement);
    inputElement.focus();

    // Submit button
    const submitButton = this.scene.add.text(centerX, centerY + 50, 'Opslaan', {
      fontSize: '28px',
      fill: '#ffffff',
      backgroundColor: '#00aa00',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    submitButton.on('pointerdown', async () => {
      const playerName = inputElement.value.trim();
      document.body.removeChild(inputElement);
      
      // Show loading
      submitButton.setText('Opslaan...');
      submitButton.disableInteractive();

      try {
        await this.saveScore(playerName, completionTime);
        
        // Show leaderboard
        this.showLeaderboard(container, centerX, centerY);
        
        // Remove submission UI
        title.destroy();
        timeText.destroy();
        promptText.destroy();
        submitButton.destroy();
      } catch (error) {
        alert('Fout bij opslaan score. Probeer opnieuw.');
        submitButton.setText('Opslaan');
        submitButton.setInteractive();
      }
    });

    // Skip button
    const skipButton = this.scene.add.text(centerX, centerY + 100, 'Overslaan', {
      fontSize: '24px',
      fill: '#cccccc',
      backgroundColor: '#444444',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    skipButton.on('pointerdown', async () => {
      document.body.removeChild(inputElement);
      
      // Show leaderboard without saving
      this.showLeaderboard(container, centerX, centerY);
      
      // Remove submission UI
      title.destroy();
      timeText.destroy();
      promptText.destroy();
      submitButton.destroy();
      skipButton.destroy();
    });

    container.add([overlay, title, timeText, promptText, submitButton, skipButton]);

    return container;
  }

  /**
   * Display the leaderboard
   */
  async showLeaderboard(container, centerX, centerY) {
    try {
      const leaderboard = await this.getLeaderboard(10);

      // Leaderboard title
      const leaderboardTitle = this.scene.add.text(centerX, centerY - 200, 'Top 10 Leaderboard', {
        fontSize: '36px',
        fill: '#ffff00',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // Leaderboard entries
      const entriesText = leaderboard.map((entry, index) => {
        const rank = index + 1;
        const name = entry.player_name || 'Anonymous';
        const time = this.formatTime(entry.completion_time);
        return `${rank}. ${name} - ${time}`;
      }).join('\n');

      const leaderboardText = this.scene.add.text(centerX, centerY - 50, entriesText, {
        fontSize: '20px',
        fill: '#ffffff',
        align: 'center',
        lineSpacing: 10
      }).setOrigin(0.5);

      // Close button
      const closeButton = this.scene.add.text(centerX, centerY + 180, 'Sluiten', {
        fontSize: '28px',
        fill: '#ffffff',
        backgroundColor: '#aa0000',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive();

      closeButton.on('pointerdown', () => {
        container.destroy();
      });

      container.add([leaderboardTitle, leaderboardText, closeButton]);
    } catch (error) {
      const errorText = this.scene.add.text(centerX, centerY, 'Fout bij laden leaderboard', {
        fontSize: '24px',
        fill: '#ff0000'
      }).setOrigin(0.5);

      container.add([errorText]);
    }
  }
}
