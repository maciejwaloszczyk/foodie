const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Podaj ścieżkę do swojej aplikacji Next.js, aby załadować pliki next.config.js i .env
  dir: './',
})

// Własna konfiguracja Jesta
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // lub setupTests.js jeśli taki masz
  testEnvironment: 'jest-environment-jsdom',
  
  // TO JEST KLUCZOWA CZĘŚĆ, KTÓREJ BRAKUJE:
  moduleNameMapper: {
    // Mapuje wszystkie importy zaczynające się od @/ na główny katalog (lub src)
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = createJestConfig(customJestConfig)