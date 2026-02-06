module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|nativewind|react-native-reanimated|react-native-css-interop)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^expo$': '<rootDir>/__mocks__/expo.js',
    '^expo/(.*)$': '<rootDir>/__mocks__/expo.js',
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.setup.js',
    '!**/jest.config.js',
    '!**/.expo/**',
    '!**/__mocks__/**',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.expo/'],
  clearMocks: true,
  testEnvironment: 'node',
  globals: {
    __DEV__: true,
  },
  fakeTimers: {
    enableGlobally: false,
  },
};
