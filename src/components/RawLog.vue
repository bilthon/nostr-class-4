<template>
  <div class="raw-log" ref="logContainer">
    <pre v-for="(line, i) in lines" :key="i" class="log-line">
      {{ line }}
    </pre>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  lines: string[]
}>()

const logContainer = ref<HTMLElement | null>(null)

// Auto-scroll to bottom when new lines arrive
// But only if user hasn't scrolled up to read history
watch(() => props.lines.length, () => {
  if (!logContainer.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = logContainer.value
  const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
  
  if (isNearBottom) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
})

// Initial scroll to bottom
onMounted(() => {
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
})
</script>

<style scoped>
.raw-log {
  max-height: 300px;
  overflow-y: auto;
  background: #1e1e1e;
  border-radius: 4px;
  padding: 0.5rem;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
}

.log-line {
  margin: 0;
  color: #d4d4d4;
  word-break: break-all;
  white-space: pre-wrap;
}

/* Style different types of messages */
.log-line:has(⬆) {
  color: #9cdcfe; /* Light blue for outgoing */
}

.log-line:has(⬇) {
  color: #ce9178; /* Orange for incoming */
}

/* Scrollbar styling */
.raw-log::-webkit-scrollbar {
  width: 8px;
}

.raw-log::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.raw-log::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 4px;
}

.raw-log::-webkit-scrollbar-thumb:hover {
  background: #888;
}
</style> 