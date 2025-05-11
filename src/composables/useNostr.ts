import { ref, onMounted, watch } from 'vue'
import { ndk } from '../ndk'
import { NDKEvent, NDKRelay, NDKSubscription } from '@nostr-dev-kit/ndk'
import { DEMO_TAG } from '../constants'

export function useNostr() {
  const feed = ref<NDKEvent[]>([])
  const log = ref<string[]>([])
  const ready = ref(false)
  let reactionsSub: NDKSubscription | null = null

  // Track reactions separately - use a reactive object instead of Map
  const reactions = ref<Record<string, NDKEvent[]>>({})

  // Helper to get reactions for a note
  function getReactionsForNote(noteId: string): NDKEvent[] {
    return reactions.value[noteId] || []
  }

  // Register event listeners after component is mounted
  onMounted(() => {
    // Log raw WebSocket frames for educational purposes
    ndk.pool?.on('relay:ready', (relay: NDKRelay) => {
      log.value.push(`Connected to ${relay.url}`)
    })
    ndk.pool?.on('relay:disconnect', (relay: NDKRelay) => {
      log.value.push(`Disconnected from ${relay.url}`)
    })
    // ndk.pool?.on('relay:auth', (relay: NDKRelay, challenge: string) => {
    //   log.value.push(`Authenticated with ${relay.url}`)
    // })
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

    // Subscribe to notes
    const notesSub = ndk.subscribe({ kinds: [1], '#t': [tag] })
    
    notesSub.on('event', (ev) => {
      feed.value.unshift(ev)
      // Initialize empty reactions array for new note
      reactions.value[ev.id] = []
    })
    
    notesSub.on('eose', () => {
      ready.value = true
    })

    // Initial subscription to reactions
    updateReactionsSubscription()
  }

  // Update reactions subscription when feed changes
  function updateReactionsSubscription() {
    // Close existing subscription if any
    reactionsSub?.stop()

    // Only subscribe if we have notes
    if (feed.value.length === 0) return

    // Create new subscription for reactions to our notes
    reactionsSub = ndk.subscribe({
      kinds: [7],
      '#e': feed.value.map(note => note.id)
    })

    reactionsSub.on('event', (reaction) => {
      console.log('Received reaction:', reaction)
      const targetId = reaction.getMatchingTags('e')[0]?.[1]
      if (!targetId) return
      addReaction(targetId, reaction)
    })
  }

  // Watch feed changes to update reactions subscription
  watch(() => feed.value.length, () => {
    updateReactionsSubscription()
  })

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

  // Add a method to update reactions that ensures reactivity
  function addReaction(noteId: string, reaction: NDKEvent) {
    const existingReactions = reactions.value[noteId] || []
    if (!existingReactions.some(r => r.id === reaction.id)) {
      // Force reactivity by creating a new array
      reactions.value = {
        ...reactions.value,
        [noteId]: [...existingReactions, reaction]
      }
      // Log the update
      console.log(`Added reaction to note ${noteId}. New count:`, reactions.value[noteId].length)
    }
  }

  return {
    feed,
    log,
    ready,
    subscribe,
    publish,
    like,
    getReactionsForNote,
    reactions
  }
} 