/**
 * UI voor quiz uitdagingen
 */
export class ChallengeUI {
  constructor(scene, challenge) {
    this.scene = scene;
    this.challenge = challenge;
    this.elements = [];
    this.inputElement = null;
  }

  create() {
    // Donkere overlay
    this.overlay = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x000000,
      0.8
    ).setScrollFactor(0).setDepth(500);
    this.elements.push(this.overlay);

    // Quiz container achtergrond
    this.container = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      800,
      500,
      0x333366,
      1
    ).setScrollFactor(0).setDepth(501);
    this.elements.push(this.container);

    // Rand
    this.border = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      804,
      504,
      0x6666ff,
      1
    ).setScrollFactor(0).setDepth(500);
    this.elements.push(this.border);

    // X knop om te sluiten
    const closeButtonX = this.scene.cameras.main.centerX + 380;
    const closeButtonY = this.scene.cameras.main.centerY - 230;
    
    this.closeButton = this.scene.add.rectangle(
      closeButtonX, closeButtonY, 40, 40, 0xaa4444, 1
    ).setScrollFactor(0).setDepth(502).setInteractive({ useHandCursor: true });
    
    this.closeButton.on('pointerover', () => this.closeButton.setFillStyle(0xcc5555));
    this.closeButton.on('pointerout', () => this.closeButton.setFillStyle(0xaa4444));
    this.closeButton.on('pointerdown', () => {
      this.challenge.cancel();
    });
    this.elements.push(this.closeButton);

    this.closeButtonText = this.scene.add.text(closeButtonX, closeButtonY, '✕', {
      fontSize: '28px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(503);
    this.elements.push(this.closeButtonText);
  }

  showQuestion(question, questionNum, totalQuestions, prefix = '') {
    // Verwijder vorige vraag elementen
    this.clearQuestionElements();

    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;
    
    // Layout configuratie - alle posities relatief aan elkaar
    const layout = {
      topY: centerY - 210,           // Vraagnummer
      spacing: 20,                    // Ruimte tussen elementen
      inputHeight: 50,                // Hoogte van input element
      buttonHeight: 50,               // Hoogte van buttons
      submitButtonHeight: 45          // Hoogte van submit knop
    };

    // Vraagnummer (bovenaan)
    let currentY = layout.topY;
    const progressText = this.scene.add.text(
      centerX,
      currentY,
      `${prefix}Vraag ${questionNum} van ${totalQuestions}`,
      {
        fontSize: '24px',
        fill: prefix ? '#ffaa44' : '#aaaaff'  // Oranje voor herkansing
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(502);
    this.elements.push(progressText);
    currentY += 30 + layout.spacing;

    // Render extra data (klok of afbeelding)
    const renderData = question.getRenderData();
    if (renderData) {
      if (renderData.type === 'clock') {
        this.renderClock(centerX, currentY + 60, renderData.hours, renderData.minutes);
        currentY += 140 + layout.spacing;  // Klok is ~140px hoog
      } else if (renderData.type === 'image') {
        this.renderImage(centerX, currentY + 60, renderData.image);
        currentY += 140 + layout.spacing;  // Afbeelding is ~140px hoog
      }
    }

    // Vraag tekst
    const promptText = this.scene.add.text(
      centerX,
      currentY,
      question.getPrompt(),
      {
        fontSize: '28px',
        fill: '#ffffff',
        wordWrap: { width: 700 },
        align: 'center'
      }
    ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(502);
    this.elements.push(promptText);
    
    // Bereken hoogte van vraagtekst (geschatte hoogte op basis van tekst)
    const promptHeight = promptText.height;
    currentY += promptHeight + layout.spacing + 10;

    // Input type
    const inputType = question.getInputType();
    
    if (inputType === 'buttons') {
      this.renderButtons(question.getOptions(), centerX, currentY);
    } else {
      this.renderTextInput(centerX, currentY, question.getPlaceholder ? question.getPlaceholder() : '');
    }
  }

  renderButtons(options, centerX, startY) {
    const buttonWidth = 340;
    const buttonHeight = 50;
    const gap = 15;

    options.forEach((option, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = centerX + (col === 0 ? -buttonWidth/2 - gap/2 : buttonWidth/2 + gap/2);
      const y = startY + row * (buttonHeight + gap);

      // Button achtergrond
      const button = this.scene.add.rectangle(
        x, y, buttonWidth, buttonHeight, 0x4444aa, 1
      ).setScrollFactor(0).setDepth(502).setInteractive({ useHandCursor: true });
      
      button.on('pointerover', () => button.setFillStyle(0x5555cc));
      button.on('pointerout', () => button.setFillStyle(0x4444aa));
      button.on('pointerdown', () => {
        this.challenge.submitAnswer(index);
      });
      
      this.elements.push(button);

      // Button tekst
      const buttonText = this.scene.add.text(x, y, option, {
        fontSize: '20px',
        fill: '#ffffff',
        wordWrap: { width: buttonWidth - 20 }
      }).setOrigin(0.5).setScrollFactor(0).setDepth(503);
      this.elements.push(buttonText);
    });
  }

  renderTextInput(centerX, startY, placeholder) {
    // Maak HTML input element voor tekst invoer
    const inputWidth = 300;
    const inputHeight = 50;
    const gap = 20;  // Ruimte tussen input en button
    const submitButtonHeight = 45;
    
    // Store layout values for repositioning
    this.inputLayoutData = {
      centerX,
      startY,
      inputWidth,
      inputHeight
    };

    // Maak input element
    this.inputElement = document.createElement('input');
    this.inputElement.type = 'text';
    this.inputElement.placeholder = placeholder;
    this.inputElement.style.cssText = `
      position: fixed;
      font-size: 20px;
      padding: 5px 10px;
      border: 2px solid #6666ff;
      border-radius: 5px;
      background: #222244;
      color: #ffffff;
      text-align: center;
      z-index: 1000;
      box-sizing: border-box;
      -webkit-appearance: none;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
    `;
    document.body.appendChild(this.inputElement);
    
    // Position the input element with a small delay for Safari/iPad
    // Use requestAnimationFrame to ensure layout is settled
    const positionInput = () => {
      if (!this.inputElement) return;
      
      const canvas = this.scene.game.canvas;
      const canvasRect = canvas.getBoundingClientRect();
      const scaleX = canvasRect.width / this.scene.cameras.main.width;
      const scaleY = canvasRect.height / this.scene.cameras.main.height;
      
      const screenX = canvasRect.left + centerX * scaleX;
      const screenY = canvasRect.top + startY * scaleY;
      
      this.inputElement.style.left = `${screenX - (inputWidth * scaleX) / 2}px`;
      this.inputElement.style.top = `${screenY}px`;
      this.inputElement.style.width = `${inputWidth * scaleX}px`;
      this.inputElement.style.height = `${inputHeight * scaleY}px`;
      // Min 16px to prevent iOS zoom, max 24px to prevent huge text on PC
      this.inputElement.style.fontSize = `${Math.min(24, Math.max(16, 20 * scaleY))}px`;
    };
    
    // Initial positioning with double RAF for Safari reliability
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        positionInput();
        // Additional delayed repositioning for Safari layout settling
        setTimeout(positionInput, 50);
        setTimeout(positionInput, 150);
      });
    });
    
    // Store position function for resize handling
    this.repositionInput = positionInput;
    
    // Add resize listener to reposition on orientation change or resize
    this.resizeHandler = () => {
      // Multiple repositioning attempts for Android orientation change
      // Android needs more time for the viewport to fully settle
      requestAnimationFrame(positionInput);
      setTimeout(positionInput, 100);
      setTimeout(positionInput, 300);
      setTimeout(positionInput, 500);
    };
    
    // Orientation change handler with longer delays for Android
    this.orientationHandler = () => {
      // Android orientation change needs significant delay
      setTimeout(() => {
        requestAnimationFrame(() => {
          positionInput();
          setTimeout(positionInput, 100);
          setTimeout(positionInput, 300);
          setTimeout(positionInput, 600);
        });
      }, 100);
    };
    
    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('orientationchange', this.orientationHandler);
    
    // Also listen for visual viewport changes (modern browsers, especially Chrome on Android)
    if (window.visualViewport) {
      this.viewportHandler = () => {
        requestAnimationFrame(positionInput);
      };
      window.visualViewport.addEventListener('resize', this.viewportHandler);
      window.visualViewport.addEventListener('scroll', this.viewportHandler);
    }
    
    // Focus with delay for Safari
    setTimeout(() => {
      if (this.inputElement) {
        this.inputElement.focus();
      }
    }, 100);

    // Submit knop positie is relatief aan input: input hoogte + gap
    const submitButtonY = startY + inputHeight + gap + submitButtonHeight / 2;
    
    const submitButton = this.scene.add.rectangle(
      centerX,
      submitButtonY,
      150,
      submitButtonHeight,
      0x44aa44,
      1
    ).setScrollFactor(0).setDepth(502).setInteractive({ useHandCursor: true });

    submitButton.on('pointerover', () => submitButton.setFillStyle(0x55cc55));
    submitButton.on('pointerout', () => submitButton.setFillStyle(0x44aa44));
    submitButton.on('pointerdown', () => {
      if (this.inputElement) {
        this.challenge.submitAnswer(this.inputElement.value);
      }
    });
    this.elements.push(submitButton);

    const submitText = this.scene.add.text(centerX, submitButtonY, 'Bevestig', {
      fontSize: '22px',
      fill: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(503);
    this.elements.push(submitText);

    // Enter toets support
    this.inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.challenge.submitAnswer(this.inputElement.value);
      }
    });
  }

  renderClock(centerX, centerY, hours, minutes) {
    const radius = 70;
    
    // Klok achtergrond
    const clockBg = this.scene.add.circle(centerX, centerY, radius, 0xffffff, 1)
      .setScrollFactor(0).setDepth(502);
    this.elements.push(clockBg);

    // Klok rand
    const clockBorder = this.scene.add.circle(centerX, centerY, radius + 3, 0x333333, 1)
      .setScrollFactor(0).setDepth(501);
    this.elements.push(clockBorder);

    // Uur markeringen
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * Math.PI / 180;
      const innerR = i % 3 === 0 ? radius - 15 : radius - 10;
      const outerR = radius - 5;
      
      const line = this.scene.add.line(
        centerX, centerY,
        Math.cos(angle) * innerR,
        Math.sin(angle) * innerR,
        Math.cos(angle) * outerR,
        Math.sin(angle) * outerR,
        0x333333
      ).setLineWidth(i % 3 === 0 ? 3 : 1).setScrollFactor(0).setDepth(503);
      this.elements.push(line);
    }

    // Urenwijzer
    const hourAngle = ((hours % 12) * 30 + minutes * 0.5 - 90) * Math.PI / 180;
    const hourHandLength = radius * 0.5;
    const hourHand = this.scene.add.line(
      centerX, centerY,
      0, 0,
      Math.cos(hourAngle) * hourHandLength,
      Math.sin(hourAngle) * hourHandLength,
      0x333333
    ).setLineWidth(4).setScrollFactor(0).setDepth(504);
    this.elements.push(hourHand);
    
    // Bolletje aan het einde van de urenwijzer
    const hourTip = this.scene.add.circle(
      centerX + Math.cos(hourAngle) * hourHandLength,
      centerY + Math.sin(hourAngle) * hourHandLength,
      6, 0x333333, 1
    ).setScrollFactor(0).setDepth(504);
    this.elements.push(hourTip);

    // Minutenwijzer
    const minuteAngle = (minutes * 6 - 90) * Math.PI / 180;
    const minuteHandLength = radius * 0.75;
    const minuteHand = this.scene.add.line(
      centerX, centerY,
      0, 0,
      Math.cos(minuteAngle) * minuteHandLength,
      Math.sin(minuteAngle) * minuteHandLength,
      0x333333
    ).setLineWidth(2).setScrollFactor(0).setDepth(504);
    this.elements.push(minuteHand);
    
    // Bolletje aan het einde van de minutenwijzer
    const minuteTip = this.scene.add.circle(
      centerX + Math.cos(minuteAngle) * minuteHandLength,
      centerY + Math.sin(minuteAngle) * minuteHandLength,
      4, 0x333333, 1
    ).setScrollFactor(0).setDepth(504);
    this.elements.push(minuteTip);

    // Centrum punt
    const centerDot = this.scene.add.circle(centerX, centerY, 5, 0x333333, 1)
      .setScrollFactor(0).setDepth(505);
    this.elements.push(centerDot);
  }

  renderImage(centerX, centerY, imageKey) {
    // Placeholder voor afbeelding - gebruik een tekst als de afbeelding niet bestaat
    if (this.scene.textures.exists(imageKey)) {
      const image = this.scene.add.image(centerX, centerY, imageKey)
        .setScrollFactor(0).setDepth(502);
      // Schaal naar max 150x150
      const maxSize = 150;
      const scale = Math.min(maxSize / image.width, maxSize / image.height);
      image.setScale(scale);
      this.elements.push(image);
    } else {
      // Fallback: toon placeholder
      const placeholder = this.scene.add.rectangle(centerX, centerY, 150, 150, 0x666666, 1)
        .setScrollFactor(0).setDepth(502);
      this.elements.push(placeholder);
      
      const placeholderText = this.scene.add.text(centerX, centerY, '🖼️', {
        fontSize: '64px'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(503);
      this.elements.push(placeholderText);
    }
  }

  showFeedback(isCorrect, callback) {
    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;

    // Verwijder input element
    if (this.inputElement) {
      this.inputElement.remove();
      this.inputElement = null;
    }

    // Feedback overlay
    const feedbackBg = this.scene.add.rectangle(
      centerX, centerY, 300, 100,
      isCorrect ? 0x226622 : 0x662222, 1
    ).setScrollFactor(0).setDepth(510);
    this.elements.push(feedbackBg);

    const feedbackText = this.scene.add.text(
      centerX, centerY,
      isCorrect ? '✓ Goed!' : '✗ Fout!',
      {
        fontSize: '36px',
        fill: '#ffffff'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(511);
    this.elements.push(feedbackText);

    // Na korte delay, ga verder
    this.scene.time.delayedCall(1000, () => {
      feedbackBg.destroy();
      feedbackText.destroy();
      callback();
    });
  }

  showResults(correct, total, passed, callback) {
    this.clearQuestionElements();

    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;

    // Resultaat tekst
    const resultTitle = this.scene.add.text(
      centerX, centerY - 80,
      passed ? '🎉 Gefeliciteerd!' : '😢 Helaas...',
      {
        fontSize: '42px',
        fill: passed ? '#44ff44' : '#ff4444'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(502);
    this.elements.push(resultTitle);

    const scoreText = this.scene.add.text(
      centerX, centerY,
      `Je had ${correct} van de ${total} vragen goed.`,
      {
        fontSize: '28px',
        fill: '#ffffff'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(502);
    this.elements.push(scoreText);

    const statusText = this.scene.add.text(
      centerX, centerY + 50,
      passed ? 'Je hebt de uitdaging gehaald!' : 'Probeer het later nog eens.',
      {
        fontSize: '24px',
        fill: '#aaaaaa'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(502);
    this.elements.push(statusText);

    // Sluit knop
    const closeButton = this.scene.add.rectangle(
      centerX, centerY + 130, 150, 50, 0x4444aa, 1
    ).setScrollFactor(0).setDepth(502).setInteractive({ useHandCursor: true });

    closeButton.on('pointerover', () => closeButton.setFillStyle(0x5555cc));
    closeButton.on('pointerout', () => closeButton.setFillStyle(0x4444aa));
    closeButton.on('pointerdown', callback);
    this.elements.push(closeButton);

    const closeText = this.scene.add.text(centerX, centerY + 130, 'Sluiten', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(503);
    this.elements.push(closeText);
  }

  /**
   * Toon bericht dat er vragen opnieuw moeten worden geprobeerd
   */
  showRetryMessage(incorrectCount, callback) {
    this.clearQuestionElements();

    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;

    // Titel
    const title = this.scene.add.text(
      centerX, centerY - 60,
      '🔄 Herkansing',
      {
        fontSize: '36px',
        fill: '#ffaa44'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(502);
    this.elements.push(title);

    // Uitleg
    const explanation = this.scene.add.text(
      centerX, centerY + 10,
      `Je hebt ${incorrectCount} ${incorrectCount === 1 ? 'vraag' : 'vragen'} fout beantwoord.\nProbeer ${incorrectCount === 1 ? 'deze' : 'deze'} opnieuw!`,
      {
        fontSize: '24px',
        fill: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(502);
    this.elements.push(explanation);

    // Doorgaan knop
    const continueButton = this.scene.add.rectangle(
      centerX, centerY + 100, 180, 50, 0x44aa44, 1
    ).setScrollFactor(0).setDepth(502).setInteractive({ useHandCursor: true });

    continueButton.on('pointerover', () => continueButton.setFillStyle(0x55cc55));
    continueButton.on('pointerout', () => continueButton.setFillStyle(0x44aa44));
    continueButton.on('pointerdown', callback);
    this.elements.push(continueButton);

    const continueText = this.scene.add.text(centerX, centerY + 100, 'Doorgaan', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(503);
    this.elements.push(continueText);
  }

  clearQuestionElements() {
    // Verwijder alles behalve overlay, container en X knop
    if (this.inputElement) {
      this.inputElement.remove();
      this.inputElement = null;
    }
    
    // Clean up resize handlers
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
    if (this.orientationHandler) {
      window.removeEventListener('orientationchange', this.orientationHandler);
      this.orientationHandler = null;
    }
    if (this.viewportHandler && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.viewportHandler);
      window.visualViewport.removeEventListener('scroll', this.viewportHandler);
      this.viewportHandler = null;
    }
    this.repositionInput = null;
    this.inputLayoutData = null;
    
    // Bewaar alleen de eerste 5 elementen (overlay, container, border, closeButton, closeButtonText)
    while (this.elements.length > 5) {
      const element = this.elements.pop();
      if (element && element.destroy) {
        element.destroy();
      }
    }
  }

  destroy() {
    if (this.inputElement) {
      this.inputElement.remove();
      this.inputElement = null;
    }
    
    // Clean up resize handlers
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
    if (this.orientationHandler) {
      window.removeEventListener('orientationchange', this.orientationHandler);
      this.orientationHandler = null;
    }
    if (this.viewportHandler && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.viewportHandler);
      window.visualViewport.removeEventListener('scroll', this.viewportHandler);
      this.viewportHandler = null;
    }
    this.repositionInput = null;
    this.inputLayoutData = null;
    
    this.elements.forEach(element => {
      if (element && element.destroy) {
        element.destroy();
      }
    });
    this.elements = [];
  }
}
