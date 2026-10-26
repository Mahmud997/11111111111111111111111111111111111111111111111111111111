import { createRouter, createWebHistory } from 'vue-router';
import InvitationView from './views/InvitationView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/i/:slug',
      name: 'invitation',
      component: InvitationView,
      props: true,
    },
    {
      path: '/',
      redirect: '/i/adilet-madina', // demo
    },
  ],
});

export default router;
