<template>
  <article class="note">
    <header class="note-header">
      <span
        class="note-id"
        @click="copyNoteId"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false"
        :class="{ 'has-tooltip': showTooltip }"
      >
        {{ shortNoteId }}
        <span v-if="showTooltip" class="tooltip">
          {{ event.id }}
        </span>
      </span>
      <time :datetime="timestamp">
        {{ formattedTime }}
      </time>
    </header>
    
    <p class="content">{{ event.content }}</p>
    
    <footer class="note-footer">
      <span class="author">
        {{ shortNpub }}
      </span>
      <button 
        @click="$emit('like')"
        class="like-btn"
        :title="`${likeCount} likes`"
      >
        👍 {{ likeCount }}
      </button>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk'

const props = defineProps<{
  event: NDKEvent
  reactions: Record<string, NDKEvent[]>
}>()

defineEmits<{
  (e: 'like'): void
}>()

const showTooltip = ref(false)

// Add a watcher to debug reactivity
watch(() => props.reactions[props.event.id], (newReactions) => {
  console.log(`Reactions changed for note ${props.event.id}:`, newReactions)
}, { deep: true })

// Format the pubkey to show as shortened npub
const shortNpub = computed(() => {
  const user = new NDKUser({ pubkey: props.event.pubkey })
  const npub = user.npub
  return npub.slice(0, 8) + '...' + npub.slice(-4)
})

const shortNoteId = computed(() => {
  return props.event.id.slice(0, 8) + '...' + props.event.id.slice(-4)
})

// Format the timestamp
const timestamp = computed(() => {
  return new Date(props.event.created_at! * 1000).toISOString()
})

const formattedTime = computed(() => {
  return new Date(props.event.created_at! * 1000).toLocaleString()
})

// Get like count from our reactions object
const likeCount = computed(() => {
  const reactions = props.reactions[props.event.id] || []
  // Create a Set of unique pubkeys that liked this note
  const uniqueLikers = new Set(reactions.map(reaction => reaction.pubkey))
  return uniqueLikers.size
})

async function copyNoteId() {
  try {
    await navigator.clipboard.writeText(props.event.id)
    // Optional: show a "copied!" message
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<style scoped>
.note {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.note-header {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.note-id {
  font-family: monospace;
  background: #f0f0f0;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  cursor: pointer;
  position: relative;
}

.author {
  font-family: monospace;
  background: #f0f0f0;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
}

.content {
  margin: 0.5rem 0;
  white-space: pre-wrap;
}

.note-footer {
  margin-top: 0.5rem;
  display: flex;
  justify-content: space-between;
}

.like-btn {
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.like-btn:hover {
  background: #f5f5f5;
}

.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  opacity: 80%;
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  white-space: nowrap;
  z-index: 1000;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tooltip::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 0.5rem solid transparent;
  border-top-color: #333;
}

.copy-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.2rem;
  font-size: 1rem;
}

.copy-btn:hover {
  opacity: 0.8;
}
</style> 