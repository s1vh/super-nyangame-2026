// Values from legacy/src. Derivative gameplay remains under the legacy license.
export const WIDTH = 1280;
export const HEIGHT = 800;
export const STEP_SECONDS = 1 / 60;
export const STEP_MS = 1000 / 60;
export const ACCELERATION = Math.log(1.02) * 0.25;
export const CAT = { width: 167, height: 106, offsetX: -83, offsetY: -53 } as const;
export const OBSTACLE_SIZE = {
  1: { width: 165, height: 147, spawnWidth: 200, spawnHeight: 200 },
  2: { width: 154, height: 151, spawnWidth: 200, spawnHeight: 200 },
  3: { width: 60, height: 83, spawnWidth: 150, spawnHeight: 150 },
} as const;
export type ObstacleType = keyof typeof OBSTACLE_SIZE;
