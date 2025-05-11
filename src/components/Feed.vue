<template>
  <div class="feed">
    <h2>Recent Notes</h2>
    
    <div v-if="events.length === 0" class="empty-state">
      No notes yet. Be the first to post!
    </div>
    
    <div v-else class="notes-list">
      <Note
        v-for="event in events"
        :key="event.id"
        :event="event"
        :reactions="reactions"
        @like="$emit('like', event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NDKEvent } from '@nostr-dev-kit/ndk'
import Note from './Note.vue'

defineProps<{
  events: NDKEvent[]
  reactions: Record<string, NDKEvent[]>
}>()

defineEmits<{
  (e: 'like', event: NDKEvent): void
}>()
</script>

<style scoped>
.feed {
  margin: 2rem 0;
}

.empty-state {
  text-align: center;
  color: #666;
  padding: 2rem;
  background: #f5f5f5;
  border-radius: 4px;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style> 