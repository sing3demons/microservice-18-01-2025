/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
  preset: 'ts-jest',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', './src/index.ts', './src/logStructure.ts'],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  collectCoverageFrom: ['src/**/*.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', './src/index.ts', './src/logStructure.ts'],
}
