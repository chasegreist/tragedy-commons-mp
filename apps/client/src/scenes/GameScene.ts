import Phaser from 'phaser';
import * as Colyseus from 'colyseus.js';
import { GameState, Player, TILE_SIZE, WORLD_WIDTH_TILES, WORLD_HEIGHT_TILES, WORLD_WIDTH_PX, WORLD_HEIGHT_PX, InputMessage } from '@game/shared';

export class GameScene extends Phaser.Scene {
  private client!: Colyseus.Client;
  private room?: Colyseus.Room<GameState>;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private myId: string | null = null;
  private treesGfx!: Phaser.GameObjects.Graphics;
  private playersGfx!: Phaser.GameObjects.Graphics;

  constructor() { super('GameScene'); }

  preload() {}

  create() {
    // Compute server URL
    const explicitUrl = (import.meta as any).env?.VITE_SERVER_URL as string | undefined;
    if (explicitUrl) {
      this.client = new Colyseus.Client(explicitUrl);
    } else {
      const secure = location.protocol === 'https:';
      const proto = secure ? 'wss' : 'ws';
      const host = (import.meta as any).env?.VITE_SERVER_HOST || location.hostname;
      const port = (import.meta as any).env?.VITE_SERVER_PORT || (secure ? '' : ':2567');
      this.client = new Colyseus.Client(`${proto}://${host}${port}`);
    }
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keySpace = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH_PX, WORLD_HEIGHT_PX);

    this.treesGfx = this.add.graphics();
    this.playersGfx = this.add.graphics();

    this.time.addEvent({ loop: true, delay: 50, callback: () => this.sendInput() });
  }

  async join(name: string) {
    if (this.room) return;
    this.room = await this.client.joinOrCreate<GameState>('game', { name });
    this.myId = this.room.sessionId;

    this.room.onStateChange(() => {
      this.renderState();
      this.updateHUD();
    });
  }

  private sendInput() {
    if (!this.room) return;
    const input: InputMessage = {
      up: !!this.cursors.up?.isDown,
      down: !!this.cursors.down?.isDown,
      left: !!this.cursors.left?.isDown,
      right: !!this.cursors.right?.isDown,
      chop: this.keySpace.isDown,
    };
    this.room.send('input', input);
  }

  private renderState() {
    if (!this.room) return;
    const state = this.room.state;

    // Trees
    this.treesGfx.clear();
    this.treesGfx.fillStyle(0x2e7d32, 1);
    let i = 0;
    for (let y = 0; y < WORLD_HEIGHT_TILES; y++) {
      for (let x = 0; x < WORLD_WIDTH_TILES; x++, i++) {
        if (state.trees[i] === 1) {
          this.treesGfx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // Players
    this.playersGfx.clear();
    let me: Player | undefined;
    for (const [id, p] of state.players) {
      if (id === this.myId) me = p as Player;
      const color = id === this.myId ? 0xffc107 : 0x90caf9;
      this.playersGfx.fillStyle(color, 1);
      const R = TILE_SIZE * 0.35;
      this.playersGfx.fillCircle(p.x, p.y, R);

      // Facing indicator: two small dots on the circle near the edge (top-down face)
      let fx = (p as any).facingX ?? 0;
      let fy = (p as any).facingY ?? 1;
      const fl = Math.hypot(fx, fy) || 1;
      const nx = fx / fl;
      const ny = fy / fl;
      // Place eyes just inside the circle edge
      const d1 = Math.max(0, R - 6);
      const d2 = Math.max(0, R - 12);
      const dotR = Math.max(2, Math.floor(TILE_SIZE * 0.08));

      this.playersGfx.fillStyle(0xffffff, 0.9);
      this.playersGfx.fillCircle(p.x + nx * d1, p.y + ny * d1, dotR);
      this.playersGfx.fillCircle(p.x + nx * d2, p.y + ny * d2, dotR);
    }

    // Center camera on me (bounded by world)
    if (me) {
      this.cameras.main.centerOn(me.x, me.y);
    }
  }

  private updateHUD() {
    const timer = document.getElementById('timer');
    const score = document.getElementById('score');
    if (!this.room || !timer || !score) return;
    const now = Date.now();
    const ms = Math.max(0, this.room.state.roundEndsAt - now);
    const sec = Math.ceil(ms / 1000);

    const me = this.room.state.players.get(this.myId || '') as Player | undefined;
    timer.textContent = ` | Round: ${sec}s`;
    score.textContent = me ? ` | Score: ${me.score}` : '';
  }
}
