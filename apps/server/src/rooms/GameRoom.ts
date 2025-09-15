import { Room, Client } from 'colyseus';
import { GameState, Player, WORLD_WIDTH_TILES, WORLD_HEIGHT_TILES, WORLD_WIDTH_PX, WORLD_HEIGHT_PX, TILE_SIZE, TICK_RATE, ROUND_DURATION_MS, idx, inBounds, InputMessage } from '@game/shared';

const MS_PER_TICK = 1000 / TICK_RATE;
const PLAYER_SPEED = 120; // px/s
const CHOP_COOLDOWN_MS = 300;

export class GameRoom extends Room<GameState> {
  private lastTick = 0;
  private inputs: Map<string, InputMessage> = new Map();
  private lastChopAt: Map<string, number> = new Map();

  onCreate(options: any) {
    this.setState(new GameState());

    // Initialize tree grid with some trees (random fill)
    const total = WORLD_WIDTH_TILES * WORLD_HEIGHT_TILES;
    this.state.trees = new (this.state.trees.constructor as any)();
    for (let i = 0; i < total; i++) {
      this.state.trees[i] = Math.random() < 0.15 ? 1 : 0;
    }

    this.setPatchRate(1000 / 15); // 15 Hz state patches

    this.onMessage('input', (client, input: InputMessage) => {
      this.inputs.set(client.sessionId, input);
    });

    this.clock.setInterval(() => this.fixedUpdate(), MS_PER_TICK);
    this.resetRoundTimer();
  }

  onJoin(client: Client, options: any) {
    const p = new Player();
    p.id = client.sessionId;
    p.name = options?.name?.slice(0, 16) || 'Player';
    // Spawn at random empty tile
    for (let tries = 0; tries < 100; tries++) {
      const tx = Math.floor(Math.random() * WORLD_WIDTH_TILES);
      const ty = Math.floor(Math.random() * WORLD_HEIGHT_TILES);
      if (this.state.trees[idx(tx, ty)] === 0) {
        p.x = tx * TILE_SIZE + TILE_SIZE / 2;
        p.y = ty * TILE_SIZE + TILE_SIZE / 2;
        break;
      }
    }
    this.state.players.set(client.sessionId, p);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
    this.inputs.delete(client.sessionId);
    this.lastChopAt.delete(client.sessionId);
  }

  private resetRoundTimer() {
    this.state.roundEndsAt = Date.now() + ROUND_DURATION_MS;
  }

  private fixedUpdate() {
    const now = Date.now();

    // Tick players
    for (const [id, player] of this.state.players) {
      const input = this.inputs.get(id);
      const dt = MS_PER_TICK / 1000;
      if (input) {
        const vx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
        const vy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
        const len = Math.hypot(vx, vy) || 1;
        const nx = vx / len;
        const ny = vy / len;

        player.x += nx * PLAYER_SPEED * dt;
        player.y += ny * PLAYER_SPEED * dt;

        if (vx !== 0 || vy !== 0) {
          player.facingX = Math.sign(vx);
          player.facingY = Math.sign(vy);
        }

        // Clamp to world using player visual radius (to prevent slipping past bottom edge)
        const R = TILE_SIZE * 0.35;
        player.x = Math.max(R, Math.min(player.x, WORLD_WIDTH_PX - R));
        player.y = Math.max(R, Math.min(player.y, WORLD_HEIGHT_PX - R));
        // Extra hard clamp (defensive against floating error)
        if (player.y > WORLD_HEIGHT_PX - R) player.y = WORLD_HEIGHT_PX - R;

        if (input.chop) this.tryChop(player, now);
      }
    }

    // Round timing
    if (now >= this.state.roundEndsAt) {
      this.regenerateTrees();
      this.resetRoundTimer();
    }
  }

  private tryChop(player: Player, now: number) {
    const last = this.lastChopAt.get(player.id) || 0;
    if (now - last < CHOP_COOLDOWN_MS) return;

    const px = Math.floor(player.x / TILE_SIZE);
    const py = Math.floor(player.y / TILE_SIZE);

    // Build candidate tiles: current tile first, then 4-neighbors.
    const candidates: Array<[number, number]> = [
      [px, py],
      [px + 1, py],
      [px - 1, py],
      [px, py + 1],
      [px, py - 1],
    ];

    // If facing is cardinal, prioritize the faced tile among neighbors
    if ((player.facingX === 0) !== (player.facingY === 0)) {
      const fx = px + player.facingX;
      const fy = py + player.facingY;
      // Move faced tile just after the current tile, if it's in the list
      for (let k = 1; k < candidates.length; k++) {
        const [cx, cy] = candidates[k];
        if (cx === fx && cy === fy) {
          candidates.splice(k, 1);
          candidates.splice(1, 0, [fx, fy]);
          break;
        }
      }
    }

    for (const [tx, ty] of candidates) {
      if (!inBounds(tx, ty)) continue;
      const ii = idx(tx, ty);
      if (this.state.trees[ii] === 1) {
        this.state.trees[ii] = 0;
        player.score += 1;
        this.lastChopAt.set(player.id, now);
        return;
      }
    }
  }

  private regenerateTrees() {
    // New trees spawn in spaces next to where existing trees still are
    // Create a copy so we base growth on pre-existing trees
    const width = WORLD_WIDTH_TILES;
    const height = WORLD_HEIGHT_TILES;
    const old = Array.from(this.state.trees);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = idx(x, y);
        if (old[i] === 0) {
          // Check 4-neighborhood for existing tree
          const neighbors = [
            [x + 1, y],
            [x - 1, y],
            [x, y + 1],
            [x, y - 1],
          ];
          let hasTreeNeighbor = false;
          for (const [nx, ny] of neighbors) {
            if (inBounds(nx, ny) && old[idx(nx, ny)] === 1) {
              hasTreeNeighbor = true;
              break;
            }
          }
          if (hasTreeNeighbor && Math.random() < 0.5) {
            this.state.trees[i] = 1; // grow new tree
          }
        }
      }
    }
  }
}
