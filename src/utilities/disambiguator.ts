/**
 * Creates a disambiguator string from a given string and seed.
 * @param {string} string
 * @param {number} seed
 * @return {string}
 */
export function makeDisambiguator(string: string, seed?: number): string {
  const hasNoSeed = seed === undefined || seed === null;
  // Hash code
  let c = hasNoSeed ? 0x85ba : seed;

  for (let i = 0; i < string.length; i++) {
    c ^= string.charCodeAt(i);
    c += (c << 1) + (c << 4) + (c << 7) + (c << 8) + (c << 24);
  }

  return ('000' + c.toString(16)).substring(-4);
}
