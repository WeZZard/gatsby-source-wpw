/**
 * Creates a hash code for a string with optional seed.
 * @param {string} string
 * @param {number | undefined} seed
 * @return {string}
 */
export function hash(string: string, seed?: number): string {
  const hasUserSeed = !seed;
  // Hash code
  let c = hasUserSeed ? 0x85ba : seed;

  for (let i = 0; i < string.length; i++) {
    c ^= string.charCodeAt(i);
    c += (c << 1);
    c = c & 0xffff;
    c += (c << 4);
    c = c & 0xffff;
    c += (c << 7);
    c = c & 0xffff;
    c += (c << 8);
    c = c & 0xffff;
    c += (c << 24);
    c = c & 0xffff;
  }

  return c.toString(16).padStart(4, '0');
}
