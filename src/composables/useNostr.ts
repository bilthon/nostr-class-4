import { ref, onMounted } from 'vue'
import { ndk } from '../ndk'
import { NDKEvent, NDKRelay } from '@nostr-dev-kit/ndk'
import { DEMO_TAG } from '../constants'

export function useNostr() {
  const feed = ref<NDKEvent[]>([])
  const log = ref<string[]>([])
  const ready = ref(false)

  // Register event listeners after component is mounted
  onMounted(() => {
    // Log raw WebSocket frames for educational purposes
    ndk.pool?.on('relay:ready', (relay: NDKRelay) => {
      log.value.push(`Connected to ${relay.url}`)
    })
    ndk.pool?.on('relay:disconnect', (relay: NDKRelay) => {
      log.value.push(`Disconnected from ${relay.url}`)
    })
    ndk.pool?.on('relay:auth', (relay: NDKRelay, challenge: string) => {
      log.value.push(`Authenticated with ${relay.url}`)
    })
    ndk.pool?.on('relay:authed', (relay: NDKRelay) => {
      log.value.push(`Authenticated with ${relay.url}`)
    })
    ndk.pool?.on('notice', (relay: NDKRelay, message: string) => {
      log.value.push(`Notice from ${relay.url}: ${message}`)
    })

    // Also log raw frames for more detailed protocol view
    // ndk.pool?.on('raw:frame', (direction: 'in' | 'out', msg: string, relay: any) => {
    //   log.value.push(`${direction === 'out' ? '⬆' : '⬇'} ${relay.url}  ${msg}`)
    // })
  })

  // Subscribe to notes with specific tag
  async function subscribe(tag = DEMO_TAG) {
    console.log('Subscribing to notes with tag:', tag)
    const sub = ndk.subscribe({ kinds: [1], '#t': [tag] })
    
    sub.on('event', (ev) => {
      feed.value.unshift(ev)
    })
    
    sub.on('eose', () => {
      ready.value = true
    })
  }

  // Publish a new note
  async function publish(text: string, tag = DEMO_TAG) {
    console.log('Publishing note:', text, ', tag:', tag)
    const event = new NDKEvent(ndk)
    event.kind = 1
    event.content = text
    event.tags = [['t', tag]]
    
    await event.sign()
    await event.publish()
  }

  // React to a note with a like
  async function like(target: NDKEvent) {
    const event = new NDKEvent(ndk)
    event.kind = 7
    event.content = '+'
    event.tags = [
      ['e', target.id],
      ['p', target.pubkey]
    ]
    
    await event.sign()
    await event.publish()
  }

  return { feed, log, ready, subscribe, publish, like }
} 