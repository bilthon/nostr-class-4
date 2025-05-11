<template>
  <div class="publisher">
    <textarea
      v-model="content"
      placeholder="Write your note with #class4 tag..."
      :disabled="publishing"
      rows="3"
    ></textarea>
    
    <button 
      @click="handlePublish"
      :disabled="!content.trim() || publishing"
      class="publish-btn"
    >
      {{ publishing ? 'Publishing...' : 'Publish Note' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'publish', text: string): void
}>()

const content = ref('')
const publishing = ref(false)

async function handlePublish() {
  if (!content.value.trim()) return
  
  publishing.value = true
  try {
    await emit('publish', content.value)
    content.value = '' // Clear after successful publish
  } finally {
    publishing.value = false
  }
}
</script>

<style scoped>
.publisher {
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
}

textarea:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.publish-btn {
  align-self: flex-end;
  padding: 0.5rem 1rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.publish-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style> 