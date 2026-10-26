import { createRouter, createWebHistory } from 'vue-router';
import EditorView from './views/EditorView.vue';
import TemplatesList from './views/TemplatesList.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'templates', component: TemplatesList },
    { path: '/editor/:id?', name: 'editor', component: EditorView, props: true },
  ],
});

export default router;
