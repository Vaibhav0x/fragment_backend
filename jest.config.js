module.exports = {
  testEnvironment: 'node',

  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.js",       // include ALL source files
    "!src/**/*.test.js", // exclude test files
  ],

  coverageDirectory: 'coverage',

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
