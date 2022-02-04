/**
 * Creates a hash code for a string with optional seed.
 * @param {string} string
 * @param {number | undefined} seed
 * @return {string}
 */
export function hash(string: string, seed?: number): string {
  const hasUserDefiendSeed = seed === undefined || seed === null;
  // Hash code
  let c = hasUserDefiendSeed ? 0x85ba : seed;

  for (let i = 0; i < string.length; i++) {
    c ^= string.charCodeAt(i);
    c += (c << 1) + (c << 4) + (c << 7) + (c << 8) + (c << 24);
  }

  return ('000' + c.toString(16)).substring(-4);
}
