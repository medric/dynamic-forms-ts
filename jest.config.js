const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

const esModules = ['lodash-es', 'nanoid'].join('|');

/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest', // For TypeScript with JSX
  },
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  moduleNameMapper: {
    '^nanoid(/(.*)|$)': 'nanoid$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',

    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json', // specify the correct tsconfig
      isolatedModules: true, // faster tests with isolated modules
    },
  },
};
