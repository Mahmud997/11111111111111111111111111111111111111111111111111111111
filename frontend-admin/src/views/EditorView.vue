<template>
  <div class="editor-layout">
    <!-- LEFT TOOLBAR -->
    <aside class="toolbar">
      <div class="brand-mark"><span class="brand-monogram">W</span><div><strong>WEDINGO</strong><small>STUDIO EDITOR</small></div></div>
      <h2>Добавить элемент</h2>
      <button class="tool-button" @click="store.addObject('text')"><span>Тт</span><div>Текст<small>Имена, дата, детали</small></div></button>
      <button class="tool-button" @click="imageInput?.click()"><span>▧</span><div>Фото / орнамент<small>Загрузить изображение</small></div></button>
      <input ref="imageInput" class="hidden-input" type="file" accept="image/*" @change="handleImageUpload" />
      <button class="tool-button" @click="addOrnament"><span>✧</span><div>Декоративный узор<small>Золотой SVG-орнамент</small></div></button>
      <button class="tool-button" @click="store.addObject('widget', { widgetType: 'countdown', width: 300, height: 100, content: 'COUNTDOWN' })"><span>◷</span><div>Обратный отсчёт</div></button>
      <button class="tool-button" @click="store.addObject('widget', { widgetType: 'rsvp', width: 300, height: 140, content: 'RSVP' })"><span>✓</span><div>Подтверждение гостей</div></button>
      <button class="tool-button" @click="store.addObject('widget', { widgetType: 'map', width: 300, height: 50, content: 'Открыть карту' })"><span>⌖</span><div>Кнопка карты</div></button>

      <hr />
      <h2>Layers</h2>
      <div
        v-for="obj in sortedObjects"
        :key="obj.id"
        class="layer-item"
        :class="{ active: store.selectedId === obj.id }"
        @click="store.selectedId = obj.id"
      >
        <span>{{ obj.type }} {{ obj.widgetType || '' }}</span>
        <small>z:{{ obj.zIndex }}</small>
      </div>
    </aside>

    <!-- CENTER CANVAS -->
    <main class="canvas-area">
      <div class="canvas-header">
        <div class="document-title"><small>ПРЕМИАЛЬНЫЙ РЕДАКТОР</small><input v-model="store.title" class="title-input" aria-label="Название шаблона" /></div>
        <div class="header-actions">
          <button class="export-btn" @click="exportJson">Экспорт JSON</button>
          <button class="save-btn" @click="handleSave" :disabled="saving">
            {{ saving ? 'Сохранение…' : 'Сохранить шаблон' }}
          </button>
        </div>
      </div>
      <div class="canvas-settings">
        <label>Фон <input type="color" v-model="store.canvasConfig.backgroundColor" /></label>
        <label>Ширина <input type="number" min="280" max="1200" v-model.number="store.canvasConfig.width" /></label>
        <label>Высота <input type="number" min="400" max="3000" v-model.number="store.canvasConfig.height" /></label>
        <label class="bg-url">Фоновое изображение <input v-model="store.canvasConfig.backgroundImageUrl" placeholder="https://… (необязательно)" /></label>
        <label class="switch-label"><input type="checkbox" v-model="store.introConfig.enabled" /> Конверт включён</label>
      </div>

      <div class="canvas-wrapper">
        <div
          class="canvas"
          :style="{
            width: store.canvasConfig.width + 'px',
            height: store.canvasConfig.height + 'px',
            backgroundColor: store.canvasConfig.backgroundColor,
            backgroundImage: store.canvasConfig.backgroundImageUrl ? `url("${store.canvasConfig.backgroundImageUrl}")` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }"
          @mousedown="deselect"
        >
          <div
            v-for="obj in store.objects"
            :key="obj.id"
            class="canvas-item"
            :class="{ selected: store.selectedId === obj.id }"
            :style="itemStyle(obj)"
            @mousedown.stop="startDrag($event, obj)"
            @click.stop="store.selectedId = obj.id"
          >
            <template v-if="obj.type === 'text'">
              <div class="text-preview" :style="textStyle(obj)">{{ obj.content }}</div>
            </template>
            <template v-else-if="obj.type === 'image' || obj.type === 'svg_ornament'">
              <img :src="obj.src" class="media-preview" />
            </template>
            <template v-else-if="obj.type === 'widget'">
              <div class="widget-placeholder">{{ obj.widgetType?.toUpperCase() }}</div>
            </template>
          </div>
        </div>
      </div>
    </main>

    <!-- RIGHT PROPERTIES -->
    <aside class="properties" v-if="store.selectedObject">
      <h2>Настройки элемента</h2>
      <label>X <input type="number" v-model.number="store.selectedObject.x" /></label>
      <label>Y <input type="number" v-model.number="store.selectedObject.y" /></label>
      <label>Width <input type="number" v-model.number="store.selectedObject.width" /></label>
      <label>Height <input type="number" v-model.number="store.selectedObject.height" /></label>
      <label>Z-Index <input type="number" v-model.number="store.selectedObject.zIndex" /></label>
      <label>Opacity <input type="number" step="0.1" min="0" max="1" v-model.number="store.selectedObject.opacity" /></label>

      <template v-if="store.selectedObject.type === 'text'">
        <label>Текст <textarea v-model="store.selectedObject.content" rows="3" /></label>
        <label>Шрифт <select v-model="store.selectedObject.style!.fontFamily"><option value="Playfair Display">Playfair Display</option><option value="Cormorant Garamond">Cormorant Garamond</option><option value="Georgia">Georgia</option><option value="Arial">Arial</option><option value="serif">Serif</option></select></label>
        <label>Font Size <input type="number" v-model.number="store.selectedObject.style!.fontSize" /></label>
        <label>Цвет текста <input type="color" v-model="store.selectedObject.style!.color" /></label>
        <label>Межбуквенный интервал <input type="number" min="0" max="20" v-model.number="store.selectedObject.style!.letterSpacing" /></label>
        <label>Толщина рамки <input type="number" min="0" max="10" v-model.number="store.selectedObject.style!.borderWidth" /></label>
        <label>Цвет рамки <input type="color" v-model="store.selectedObject.style!.borderColor" /></label>
        <label>
          Align
          <select v-model="store.selectedObject.style!.textAlign">
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
      </template>

      <template v-else-if="store.selectedObject.type === 'image' || store.selectedObject.type === 'svg_ornament'">
        <label>Ссылка на изображение <input v-model="store.selectedObject.src" placeholder="https://…" /></label>
        <button class="secondary-action" @click="imageInput?.click()">Заменить изображение</button>
      </template>
      <h3>Анимация</h3>
      <label>
        Type
        <select v-model="store.selectedObject.animation!.type">
          <option value="none">None</option>
          <option value="fade-up">Fade Up</option>
          <option value="zoom-in">Zoom In</option>
          <option value="slide-left">Slide Left</option>
          <option value="slide-right">Slide Right</option>
          <option value="rotate-in">Rotate In</option>
          <option value="bounce">Bounce</option>
          <option value="typewriter">Typewriter</option>
        </select>
      </label>
      <label>Duration <input type="number" step="0.1" v-model.number="store.selectedObject.animation!.duration" /></label>
      <label>Delay <input type="number" step="0.1" v-model.number="store.selectedObject.animation!.delay" /></label>

      <div class="actions">
        <button @click="store.bringForward">На передний план</button>
        <button @click="store.sendBackward">На задний план</button>
        <button class="danger" @click="store.removeSelected">Удалить элемент</button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useTemplateStore, type CanvasObject } from '../stores/template';

const store = useTemplateStore();
const route = useRoute();
const saving = ref(false);
const imageInput = ref<HTMLInputElement | null>(null);

const sortedObjects = computed(() =>
  [...store.objects].sort((a, b) => b.zIndex - a.zIndex)
);

onMounted(async () => {
  if (route.params.id) {
    await store.load(route.params.id as string);
  }
});

function itemStyle(obj: CanvasObject) {
  return {
    left: obj.x + 'px',
    top: obj.y + 'px',
    width: obj.width + 'px',
    height: obj.height + 'px',
    zIndex: obj.zIndex,
    opacity: obj.opacity ?? 1,
    transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined,
  };
}

function textStyle(obj: CanvasObject) {
  const s = obj.style || {};
  return {
    fontSize: (s.fontSize || 16) + 'px',
    fontFamily: s.fontFamily || 'serif',
    color: s.color || '#000',
    textAlign: s.textAlign || 'center',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: s.textAlign === 'left' ? 'flex-start' : s.textAlign === 'right' ? 'flex-end' : 'center',
  };
}

function deselect() {
  store.selectedId = null;
}

function addOrnament() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="90" viewBox="0 0 320 90"><g fill="none" stroke="#b99a5b" stroke-width="1.5"><path d="M8 45 C55 5 75 85 120 45 S200 5 240 45 S280 75 312 45"/><path d="M20 45 Q45 15 60 45 Q45 75 20 45 M260 45 Q275 15 300 45 Q275 75 260 45"/><circle cx="160" cy="45" r="15"/><path d="M160 23 L166 39 L182 45 L166 51 L160 67 L154 51 L138 45 L154 39 Z"/></g></svg>`;
  store.addObject('svg_ornament', { src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, width: 320, height: 90 });
}

function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { alert('Выберите файл изображения.'); input.value = ''; return; }
  if (file.size > 700 * 1024) { alert('Для надёжного сохранения выберите изображение до 700 КБ или используйте ссылку на изображение.'); input.value = ''; return; }
  const reader = new FileReader();
  reader.onload = () => {
    const src = String(reader.result || '');
    const selected = store.selectedObject;
    if (selected && (selected.type === 'image' || selected.type === 'svg_ornament')) {
      selected.src = src;
    } else {
      store.addObject('image', { src, width: 220, height: 180 });
    }
    input.value = '';
  };
  reader.onerror = () => alert('Не удалось прочитать изображение. Попробуйте другой файл.');
  reader.readAsDataURL(file);
}

// Simple drag
let dragObj: CanvasObject | null = null;
let startX = 0;
let startY = 0;
let origX = 0;
let origY = 0;

function startDrag(e: MouseEvent, obj: CanvasObject) {
  store.selectedId = obj.id;
  dragObj = obj;
  startX = e.clientX;
  startY = e.clientY;
  origX = obj.x;
  origY = obj.y;

  const onMove = (ev: MouseEvent) => {
    if (!dragObj) return;
    dragObj.x = origX + (ev.clientX - startX);
    dragObj.y = origY + (ev.clientY - startY);
  };

  const onUp = () => {
    dragObj = null;
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  };

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}

async function handleSave() {
  saving.value = true;
  try {
    await store.save();
    alert('Template saved!');
  } catch (err) {
    alert('Save failed');
  } finally {
    saving.value = false;
  }
}

function exportJson() {
  const json = JSON.stringify(store.exportJSON(), null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${store.title || 'template'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.editor-layout{display:grid;grid-template-columns:250px minmax(0,1fr) 285px;height:100vh;min-height:600px;background:#f4f0e9;color:#2d2924;font-family:Inter,system-ui,sans-serif;overflow:hidden}
.toolbar,.properties{background:#fffdf9;padding:20px 16px;overflow-y:auto;border-color:#e5ddd0;border-style:solid;border-width:0 1px 0 0}
.properties{border-width:0 0 0 1px}.brand-mark{display:flex;align-items:center;gap:10px;padding:4px 0 22px;border-bottom:1px solid #eee5d8}.brand-monogram{display:grid;place-items:center;width:42px;height:42px;border:1px solid #b99a5b;border-radius:50%;font-family:Georgia,serif;font-size:25px;color:#9b7b3d}.brand-mark strong{display:block;letter-spacing:3px;font-size:12px}.brand-mark small,.document-title small{display:block;color:#9c8c76;letter-spacing:1.7px;font-size:9px;margin-top:4px}.toolbar h2,.properties h2,.properties h3{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#9b896e;margin:20px 0 10px}.tool-button{display:flex;align-items:center;gap:10px;width:100%;padding:10px;margin-bottom:7px;background:#fff;border:1px solid #eee4d5;border-radius:10px;text-align:left;color:#43382a;transition:.18s}.tool-button>span{display:grid;place-items:center;width:34px;height:34px;flex:0 0 34px;background:#f5eee1;border-radius:8px;color:#a28243;font-size:17px}.tool-button div{font-size:12px;font-weight:600}.tool-button small{display:block;font-size:10px;font-weight:400;color:#9b8c79;margin-top:3px}.tool-button:hover{border-color:#c5a86a;transform:translateY(-1px);box-shadow:0 4px 14px #6d51210d}.hidden-input{display:none}.toolbar hr{border:0;border-top:1px solid #eee5d8;margin:18px 0}.layer-item{display:flex;justify-content:space-between;gap:6px;padding:9px 10px;border-radius:7px;cursor:pointer;font-size:11px;color:#6e6252}.layer-item.active{background:#efe4cf;color:#6d5222}.layer-item small{color:#a49683}.canvas-area{display:flex;flex-direction:column;align-items:center;overflow:auto;padding:22px;min-width:0;background:radial-gradient(ellipse at top,#fffdf9 0%,#f2ece2 68%)}.canvas-header{display:flex;justify-content:space-between;gap:16px;align-items:end;width:100%;max-width:850px;margin-bottom:15px}.document-title{min-width:0;flex:1}.title-input{display:block;width:100%;margin-top:6px;padding:8px 0;background:transparent;border:0;border-bottom:1px solid #d9cdbb;color:#3b3024;font-family:Georgia,serif;font-size:22px;outline:none}.header-actions{display:flex;gap:8px}.save-btn,.export-btn{padding:10px 14px;border-radius:8px;font-size:11px;font-weight:700;white-space:nowrap}.save-btn{background:#9a7b42;border:1px solid #9a7b42;color:#fff}.save-btn:hover{background:#7f622e}.save-btn:disabled{opacity:.65}.export-btn{background:#fffdf9;border:1px solid #e3d8c6;color:#6c5b42}.canvas-settings{display:flex;align-items:center;flex-wrap:wrap;gap:10px;width:100%;max-width:850px;padding:10px 12px;margin-bottom:18px;border:1px solid #e9dfd0;background:#fffdf9;border-radius:10px}.canvas-settings label{display:flex;align-items:center;gap:6px;font-size:10px;color:#89765b}.canvas-settings input[type=number]{width:62px}.canvas-settings input,.properties input,.properties select,.properties textarea{min-width:0;padding:7px 8px;background:#fff;border:1px solid #e4d9c8;color:#43382a;border-radius:6px;font:inherit}.canvas-settings input[type=color],.properties input[type=color]{width:28px;height:28px;padding:2px}.canvas-settings .bg-url{flex:1;min-width:160px}.canvas-settings .bg-url input{width:100%}.canvas-settings .switch-label{white-space:nowrap}.canvas-wrapper{padding:20px;background:#fffdf9;border:1px solid #e7ddcf;border-radius:14px;box-shadow:0 14px 40px #5c48200e;max-width:100%}.canvas{position:relative;box-shadow:0 0 0 1px #dfd4c2;overflow:hidden;background-size:cover;background-position:center}.canvas-item{position:absolute;border:1px dashed transparent;cursor:move;touch-action:none}.canvas-item.selected{border-color:#b99a5b;outline:2px solid #b99a5b38}.text-preview{width:100%;height:100%;overflow:hidden;white-space:pre-wrap;pointer-events:none}.media-preview{width:100%;height:100%;object-fit:contain;pointer-events:none}.widget-placeholder{width:100%;height:100%;background:#f7f0e4;border:1px dashed #b99a5b;display:flex;align-items:center;justify-content:center;font-size:11px;color:#8b6d36;font-weight:700;letter-spacing:1px}.properties label{display:block;margin-bottom:12px;font-size:11px;color:#8b7a63}.properties input,.properties select,.properties textarea{display:block;width:100%;margin-top:5px;font-size:12px}.properties input[type=color]{height:34px}.properties textarea{resize:vertical;line-height:1.5}.properties h3{padding-top:10px;border-top:1px solid #eee5d8}.actions{margin-top:20px;display:flex;flex-direction:column;gap:7px}.properties button{padding:9px 10px;border:1px solid #e3d7c4;background:#fff;border-radius:7px;color:#67553a;text-align:left;font-size:11px}.properties button:hover{background:#f7f0e4}.properties .danger{background:#fff5f3;border-color:#e7c8c1;color:#9c493a}.secondary-action{width:100%;margin-bottom:10px}
@media(max-width:1050px){.editor-layout{grid-template-columns:205px minmax(0,1fr)}.properties{grid-column:1/-1;border:1px solid #e5ddd0;max-height:320px}.canvas-area{grid-row:1/2;grid-column:2}.toolbar{grid-row:1/3}.canvas-header{align-items:stretch;flex-direction:column}.header-actions{justify-content:flex-end}}
@media(max-width:700px){.editor-layout{display:flex;flex-direction:column;height:auto;min-height:100vh;overflow:visible}.toolbar,.properties{overflow:visible;border:0;border-bottom:1px solid #e5ddd0}.toolbar{padding:14px}.toolbar .tool-button{display:inline-flex;width:calc(50% - 5px);vertical-align:top}.canvas-area{overflow:visible;padding:14px 8px}.canvas-settings{align-items:flex-start}.canvas-wrapper{padding:8px;overflow:auto;max-width:100%;width:100%}.canvas{transform-origin:top left}.properties{max-height:none}.header-actions{flex-wrap:wrap}.header-actions button{flex:1}}
</style>
