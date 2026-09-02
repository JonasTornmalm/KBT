import 'fake-indexeddb/auto'
import '@testing-library/jest-dom/vitest'
import { webcrypto } from 'node:crypto'

// jsdom saknar Web Crypto. Vi lanar Nodes implementation, som ar samma API.
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true })
}
if (!globalThis.crypto.randomUUID) {
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    value: () => webcrypto.randomUUID(),
    configurable: true,
  })
}
