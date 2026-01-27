declare module 'bun:test' {
  export const describe: typeof import('node:test').describe;
  export const test: typeof import('node:test').it;
  export const expect: any;
  export const mock: any;
  export const beforeAll: typeof import('node:test').beforeAll;
}
