/* eslint-disable @typescript-eslint/no-explicit-any -- Bun's types are not fully compatible with node:test yet */
declare module 'bun:test' {
  export const describe: typeof import('node:test').describe;
  export const test: typeof import('node:test').it;
  // TODO: Replace with proper Bun matcher types when available
  export const expect: any;
  export const mock: any;
  export const beforeAll: typeof import('node:test').beforeAll;
}
