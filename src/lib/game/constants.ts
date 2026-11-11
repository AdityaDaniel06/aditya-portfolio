// Bug Dash tuning. Units are canvas pixels and 60fps frames.

export const W = 320;
export const H = 160;
export const GROUND = H - 20; // y of the ground surface
export const HERO_X = 40;

export const GRAVITY = 0.42;
export const JUMP_V = -7.2;
export const DOUBLE_JUMP_V = -6.2;
export const STOMP_BOUNCE = -4.5;

export const START_SPEED = 2.2;
export const MAX_SPEED = 5.5;

export const STAR_TIME = 300; // ~5s
export const MAGNET_TIME = 360; // ~6s
export const HURT_INVULN = 90; // ~1.5s
export const MAX_LIVES = 2; // extra lives on top of the one you play with
export const DOUBLE_JUMP_AT = 10; // coins needed to unlock double jump
export const COMBO_WINDOW = 70; // frames between coins to keep a combo going

export const BLOCK = 12; // block size
export const PLATFORM_Y = GROUND - 36; // top of a standard floating platform
