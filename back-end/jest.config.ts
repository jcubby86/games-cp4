import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  // collectCoverageFrom: ['./src/**'],
  coveragePathIgnorePatterns: ['.generated', 'node_modules'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  resetMocks: true,
  setupFiles: ['<rootDir>/test/setup.ts']
};

export default jestConfig;
