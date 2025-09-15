import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 1280,
  height: 720,
  backgroundColor: '#1a1a1a',
  physics: { default: 'arcade' },
  scene: [GameScene],
};

const game = new Phaser.Game(config);

// UI join button to forward name to scene
const joinBtn = document.getElementById('join') as HTMLButtonElement;
const nameInput = document.getElementById('name') as HTMLInputElement;
joinBtn.onclick = () => {
  const scene = game.scene.keys['GameScene'] as GameScene;
  scene?.join(nameInput.value || 'Player');
};
