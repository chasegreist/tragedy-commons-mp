import { Schema, MapSchema, ArraySchema } from '@colyseus/schema';
export declare const TILE_SIZE = 32;
export declare const WORLD_WIDTH_TILES = 40;
export declare const WORLD_HEIGHT_TILES = 30;
export declare const WORLD_WIDTH_PX: number;
export declare const WORLD_HEIGHT_PX: number;
export declare const TICK_RATE = 20;
export declare const ROUND_DURATION_MS = 60000;
export type InputMessage = {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    chop: boolean;
};
export declare class Player extends Schema {
    id: string;
    name: string;
    x: number;
    y: number;
    facingX: number;
    facingY: number;
    score: number;
}
export declare class GameState extends Schema {
    players: MapSchema<Player, string>;
    roundEndsAt: number;
    trees: ArraySchema<number>;
}
export declare function idx(x: number, y: number): number;
export declare function inBounds(x: number, y: number): boolean;
