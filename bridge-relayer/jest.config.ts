import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  globals: {
    'ts-jest': {
      // https://huafu.github.io/ts-jest/user/config/diagnostics
      diagnostics: true,
      // https://huafu.github.io/ts-jest/user/config/isolatedModules
      isolatedModules: true,
    },
  },
  clearMocks: true,
  verbose: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/', '<rootDir>/libs/'],
  testPathIgnorePatterns: ['<rootDir>/.*/(mock.*)', '<rootDir>/.*/(helper.*)'],
  moduleNameMapper: {
    '@nsfw/shared/(.*)': '<rootDir>/libs/shared/src/$1',
    '@nsfw/shared': '<rootDir>/libs/shared/src',
  },
};

export default config;
