import NDK, { NDKNip07Signer } from '@nostr-dev-kit/ndk'
import { RELAYS } from './constants'

// Initialize NIP-07 signer for browser extension
const signer = new NDKNip07Signer()

// Create NDK instance with public relays
const ndk = new NDK({
  signer,
  explicitRelayUrls: RELAYS as unknown as string[],
  debug: false
})

// Connect to relays
await ndk.connect()

// Expose for debugging in browser console
// @ts-ignore
window.ndk = ndk

export { ndk, signer } 