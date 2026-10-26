import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export interface CanvasObject {
  id: string;
  type: 'text' | 'image' | 'svg_ornament' | 'video_bg' | 'widget';
  widgetType?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation?: number;
  opacity?: number;
  content?: string;
  src?: string;
  style?: Record<string, any>;
  animation?: {
    type: string;
    duration: number;
    delay: number;
    ease: string;
  };
}

export const useTemplateStore = defineStore('template', () => {
  const id = ref<string | null>(null);
  const title = ref('Untitled Template');
  const category = ref('wedding');
  const isFree = ref(true);

  const introConfig = ref({
    enabled: true,
    type: 'envelope' as const,
    sealText: '{{groom_initial}} & {{bride_initial}}',
    buttonText: 'Open Invitation',
    coverImageUrl: '',
  });

  const audioConfig = ref({
    enabled: false,
    url: '',
    autoPlayOnOpen: true,
    loop: true,
  });

  const autoScrollConfig = ref({
    enabled: false,
    speed: 2,
    stopOnTouch: true,
  });

  const canvasConfig = ref({
    width: 390,
    height: 844,
    backgroundColor: '#fdf8f5',
    backgroundImageUrl: '',
  });

  const objects = ref<CanvasObject[]>([]);
  const selectedId = ref<string | null>(null);

  const selectedObject = computed(() =>
    objects.value.find((o) => o.id === selectedId.value) || null
  );

  function addObject(type: CanvasObject['type'], partial: Partial<CanvasObject> = {}) {
    const obj: CanvasObject = {
      id: uuidv4(),
      type,
      x: 50,
      y: 100 + objects.value.length * 40,
      width: type === 'text' ? 290 : 120,
      height: type === 'text' ? 40 : 80,
      zIndex: objects.value.length + 1,
      opacity: 1,
      content: type === 'text' ? 'New Text {{groom}}' : undefined,
      style:
        type === 'text'
          ? {
              fontSize: 20,
              fontFamily: 'Playfair Display',
              color: '#3d2b1f',
              textAlign: 'center',
            }
          : undefined,
      animation: {
        type: 'fade-up',
        duration: 0.8,
        delay: 0,
        ease: 'power2.out',
      },
      ...partial,
    };
    objects.value.push(obj);
    selectedId.value = obj.id;
  }

  function removeSelected() {
    if (!selectedId.value) return;
    objects.value = objects.value.filter((o) => o.id !== selectedId.value);
    selectedId.value = null;
  }

  function updateSelected(patch: Partial<CanvasObject>) {
    const obj = objects.value.find((o) => o.id === selectedId.value);
    if (obj) Object.assign(obj, patch);
  }

  function bringForward() {
    const obj = selectedObject.value;
    if (!obj) return;
    obj.zIndex += 1;
  }

  function sendBackward() {
    const obj = selectedObject.value;
    if (!obj || obj.zIndex <= 1) return;
    obj.zIndex -= 1;
  }

  async function save() {
    const payload = {
      title: title.value,
      category: category.value,
      isFree: isFree.value,
      introConfig: introConfig.value,
      audioConfig: audioConfig.value,
      autoScrollConfig: autoScrollConfig.value,
      canvasConfig: canvasConfig.value,
      objects: objects.value,
    };

    if (id.value) {
      const res = await axios.put(`/api/admin/templates/${id.value}`, payload);
      return res.data;
    } else {
      const res = await axios.post('/api/admin/templates', payload);
      id.value = res.data._id;
      return res.data;
    }
  }

  async function load(templateId: string) {
    const res = await axios.get(`/api/admin/templates/${templateId}`);
    const t = res.data;
    id.value = t._id;
    title.value = t.title;
    category.value = t.category;
    isFree.value = t.isFree;
    introConfig.value = t.introConfig;
    audioConfig.value = t.audioConfig;
    autoScrollConfig.value = t.autoScrollConfig;
    canvasConfig.value = t.canvasConfig;
    objects.value = t.objects || [];
  }

  function exportJSON() {
    return {
      title: title.value,
      category: category.value,
      isFree: isFree.value,
      introConfig: introConfig.value,
      audioConfig: audioConfig.value,
      autoScrollConfig: autoScrollConfig.value,
      canvasConfig: canvasConfig.value,
      objects: objects.value,
    };
  }

  return {
    id,
    title,
    category,
    isFree,
    introConfig,
    audioConfig,
    autoScrollConfig,
    canvasConfig,
    objects,
    selectedId,
    selectedObject,
    addObject,
    removeSelected,
    updateSelected,
    bringForward,
    sendBackward,
    save,
    load,
    exportJSON,
  };
});
