<script setup lang="ts">
import { useNostr } from './composables/useNostr'
import Publisher from './components/Publisher.vue'
import Feed from './components/Feed.vue'
import RawLog from './components/RawLog.vue'
import { DEMO_TAG } from './constants'
// Destructure all the functions and refs we need from useNostr
const { feed, log, ready, subscribe, publish, like } = useNostr()
</script>

<template>
  <div class="demo">
    <h1>Nostr Class Demo</h1>
    
    <Publisher @publish="publish" />
    
    <button 
      @click="() => subscribe(DEMO_TAG)" 
      :disabled="ready"
      class="subscribe-btn"
    >
      {{ ready ? 'Subscribed' : 'Subscribe to #class4' }}
    </button>
    
    <Feed 
      :events="feed" 
      @like="like"
      v-if="ready"
    />
    
    <details class="log-container">
      <summary>Raw WebSocket Log ({{ log.length }})</summary>
      <RawLog :lines="log" />
    </details>
  </div>
</template>

<style scoped>
.demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.subscribe-btn {
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.subscribe-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.log-container {
  margin-top: 2rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem;
}
</style>
