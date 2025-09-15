import { Schema, type, MapSchema, ArraySchema } from '@colyseus/schema';

export const TILE_SIZE = 32;
export const WORLD_WIDTH_TILES = 40;
export const WORLD_HEIGHT_TILES = 30;
export const WORLD_WIDTH_PX = WORLD_WIDTH_TILES * TILE_SIZE;
export const WORLD_HEIGHT_PX = WORLD_HEIGHT_TILES * TILE_SIZE;
export const TICK_RATE = 20; // Hz
export const ROUND_DURATION_MS = 60_000; // 1 minute

export type InputMessage = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  chop: boolean;
};

export class Player extends Schema {
  @type('string') id: string = '';
  @type('string') name: string = '';
  @type('number') x: number = 0; // pixels
  @type('number') y: number = 0; // pixels
  @type('number') facingX: number = 0; // -1,0,1
  @type('number') facingY: number = 1; // -1,0,1
  @type('number') score: number = 0;
}

// Tree grid as a flat array: 0 empty, 1 tree
export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type('number') roundEndsAt: number = Date.now() + ROUND_DURATION_MS;
  @type(['uint8']) trees = new ArraySchema<number>();
}

export function idx(x: number, y: number): number {
  return y * WORLD_WIDTH_TILES + x;
}

export function inBounds(x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < WORLD_WIDTH_TILES && y < WORLD_HEIGHT_TILES;
}
