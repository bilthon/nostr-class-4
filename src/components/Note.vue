<template>
  <article class="note">
    <header class="note-header">
      <span class="author">
        {{ shortPubkey }}
      </span>
      <time :datetime="timestamp">
        {{ formattedTime }}
      </time>
    </header>
    
    <p class="content">{{ event.content }}</p>
    
    <footer class="note-footer">
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
import { computed } from 'vue'
import { NDKEvent } from '@nostr-dev-kit/ndk'

const props = defineProps<{
  event: NDKEvent
}>()

defineEmits<{
  (e: 'like'): void
}>()

// Format the pubkey to show first 8 chars
const shortPubkey = computed(() => {
  return props.event.pubkey.slice(0, 8) + '...'
})

// Format the timestamp
const timestamp = computed(() => {
  return new Date(props.event.created_at! * 1000).toISOString()
})

const formattedTime = computed(() => {
  return new Date(props.event.created_at! * 1000).toLocaleString()
})

// Count likes (reactions) to this note
const likeCount = computed(() => {
  return props.event.getMatchingTags('e').length
})
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
  justify-content: flex-end;
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
</style> 