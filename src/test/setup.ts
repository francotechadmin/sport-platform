import '@testing-library/jest-dom'
import { webcrypto } from 'crypto'

// Use Node.js webcrypto for testing
Object.defineProperty(global, 'crypto', {
  value: webcrypto,
});

// Mock btoa and atob for Node.js environment
global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');