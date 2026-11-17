/**
 * Dual hash algorithms used across WeZZard Personal Works renderers:
 * - `hash2019`: Unmasked 32-bit JS bitwise shift sum used by `wezzard.com` since 2019.
 * - `hashWpw`: 16-bit masked (`& 0xffff`) accumulator introduced in `gatsby-source-wpw` (2022) and used by `wmp.wezzard.com`.
 */

export function hash2019(input: string, seed: number = 0x85ba): string {
  let comp = seed;
  for (let i = 0; i < input.length; i++) {
    comp ^= input.charCodeAt(i);
    comp +=
      (comp << 1) + (comp << 4) + (comp << 7) + (comp << 8) + (comp << 24);
  }
  return ('000' + comp.toString(16)).slice(-4);
}

export function hashWpw(input: string, seed?: number): string {
  const useDefaultSeed = !seed;
  let c = useDefaultSeed ? 0x85ba : seed;
  for (let i = 0; i < input.length; i++) {
    c ^= input.charCodeAt(i);
    c += c << 1;
    c &= 0xffff;
    c += c << 4;
    c &= 0xffff;
    c += c << 7;
    c &= 0xffff;
    c += c << 8;
    c &= 0xffff;
    c += c << 24;
    c &= 0xffff;
  }
  return c.toString(16).padStart(4, '0');
}

export const makeDisambiguateIdentifier = hash2019;
export const hash = hashWpw;
