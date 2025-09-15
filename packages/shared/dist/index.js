var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Schema, type, MapSchema, ArraySchema } from '@colyseus/schema';
export const TILE_SIZE = 32;
export const WORLD_WIDTH_TILES = 40;
export const WORLD_HEIGHT_TILES = 30;
export const WORLD_WIDTH_PX = WORLD_WIDTH_TILES * TILE_SIZE;
export const WORLD_HEIGHT_PX = WORLD_HEIGHT_TILES * TILE_SIZE;
export const TICK_RATE = 20; // Hz
export const ROUND_DURATION_MS = 60000; // 1 minute
export class Player extends Schema {
    constructor() {
        super(...arguments);
        this.id = '';
        this.name = '';
        this.x = 0; // pixels
        this.y = 0; // pixels
        this.facingX = 0; // -1,0,1
        this.facingY = 1; // -1,0,1
        this.score = 0;
    }
}
__decorate([
    type('string')
], Player.prototype, "id", void 0);
__decorate([
    type('string')
], Player.prototype, "name", void 0);
__decorate([
    type('number')
], Player.prototype, "x", void 0);
__decorate([
    type('number')
], Player.prototype, "y", void 0);
__decorate([
    type('number')
], Player.prototype, "facingX", void 0);
__decorate([
    type('number')
], Player.prototype, "facingY", void 0);
__decorate([
    type('number')
], Player.prototype, "score", void 0);
// Tree grid as a flat array: 0 empty, 1 tree
export class GameState extends Schema {
    constructor() {
        super(...arguments);
        this.players = new MapSchema();
        this.roundEndsAt = Date.now() + ROUND_DURATION_MS;
        this.trees = new ArraySchema();
    }
}
__decorate([
    type({ map: Player })
], GameState.prototype, "players", void 0);
__decorate([
    type('number')
], GameState.prototype, "roundEndsAt", void 0);
__decorate([
    type(['uint8'])
], GameState.prototype, "trees", void 0);
export function idx(x, y) {
    return y * WORLD_WIDTH_TILES + x;
}
export function inBounds(x, y) {
    return x >= 0 && y >= 0 && x < WORLD_WIDTH_TILES && y < WORLD_HEIGHT_TILES;
}
