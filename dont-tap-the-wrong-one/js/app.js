/**
 * DON'T TAP THE WRONG ONE - Application Bootloader & PWA Registration
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI and game components
  if (window.gameUI) {
    window.gameUI.init();
  }

  // Audio warmup on first user interaction
  const warmUpAudio = () => {
    if (window.gameSound) {
      window.gameSound.resume();
    }
    window.removeEventListener('click', warmUpAudio);
    window.removeEventListener('touchstart', warmUpAudio);
    window.removeEventListener('keydown', warmUpAudio);
  };
  window.addEventListener('click', warmUpAudio, { passive: true });
  window.addEventListener('touchstart', warmUpAudio, { passive: true });
  window.addEventListener('keydown', warmUpAudio, { passive: true });

  // Desktop keyboard bindings for super-fast accessibility (keys 1-6 or Q/W/A/S)
  window.addEventListener('keydown', (e) => {
    if (window.gameEngine && window.gameEngine.state === 'PLAYING') {
      const keyMap = {
        '1': 0, 'Digit1': 0, 'KeyQ': 0,
        '2': 1, 'Digit2': 1, 'KeyW': 1,
        '3': 2, 'Digit3': 2, 'KeyA': 2,
        '4': 3, 'Digit4': 3, 'KeyS': 3,
        '5': 4, 'Digit5': 4, 'KeyE': 4,
        '6': 5, 'Digit6': 5, 'KeyD': 5,
      };

      if (keyMap[e.code] !== undefined || keyMap[e.key] !== undefined) {
        const btnIndex = keyMap[e.code] !== undefined ? keyMap[e.code] : keyMap[e.key];
        const buttons = document.querySelectorAll('.game-color-btn');
        if (buttons[btnIndex]) {
          buttons[btnIndex].classList.add('tapped');
          window.gameEngine.handleTap(btnIndex);
        }
      }
    }
  });

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        console.log('Service Worker registered successfully:', reg.scope);
      })
      .catch(err => {
        console.warn('Service Worker registration skipped or failed:', err);
      });
  }

  // Prevent double-tap zoom on iOS safari
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
});
