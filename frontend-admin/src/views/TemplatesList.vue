<template>
  <div class="list-page">
    <header>
      <h1>Templates</h1>
      <router-link to="/editor" class="new-btn">+ New Template</router-link>
    </header>

    <div class="grid">
      <div v-for="t in templates" :key="t._id" class="card" @click="$router.push(`/editor/${t._id}`)">
        <div class="preview" :style="{ backgroundImage: t.previewImageUrl ? `url(${t.previewImageUrl})` : undefined }">
          <span v-if="!t.previewImageUrl">{{ t.title.charAt(0) }}</span>
        </div>
        <div class="info">
          <h3>{{ t.title }}</h3>
          <p>{{ t.category }} · {{ t.isFree ? 'Free' : 'Premium' }}</p>
        </div>
      </div>
    </div>

    <p v-if="!templates.length && !loading" class="empty">No templates yet. Create your first one!</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const templates = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await axios.get('/api/admin/templates');
    templates.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.list-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

h1 {
  font-size: 28px;
  font-weight: 700;
}

.new-btn {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.card {
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  border: 1px solid #2a2a2a;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
}

.preview {
  height: 160px;
  background: #2a2a2a;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #555;
}

.info {
  padding: 14px;
}

.info h3 {
  font-size: 15px;
  margin-bottom: 4px;
}

.info p {
  font-size: 12px;
  color: #888;
}

.empty {
  text-align: center;
  color: #666;
  margin-top: 60px;
}
</style>
