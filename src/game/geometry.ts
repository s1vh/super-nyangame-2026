// Starling-compatible logical bounds, deliberately independent of Pixi trim bounds.
export interface Bounds { x: number; y: number; width: number; height: number }

export function quadBounds(x: number, y: number, width: number, height: number, rotation = 0): Bounds {
  const left = Math.ceil(-width / 2);
  const top = Math.ceil(-height / 2);
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);
  const x0 = cosine * left - sine * top;
  const y0 = sine * left + cosine * top;
  const dx = cosine * width;
  const dy = sine * width;
  const hx = -sine * height;
  const hy = cosine * height;
  return {
    x: x + Math.min(x0, x0 + dx, x0 + hx, x0 + dx + hx),
    y: y + Math.min(y0, y0 + dy, y0 + hy, y0 + dy + hy),
    width: Math.abs(dx) + Math.abs(hx),
    height: Math.abs(dy) + Math.abs(hy),
  };
}

export function intersects(a: Bounds, b: Bounds): boolean {
  return a.width > 0 && a.height > 0 && b.width > 0 && b.height > 0
    && a.x < b.x + b.width && a.x + a.width > b.x
    && a.y < b.y + b.height && a.y + a.height > b.y;
}
