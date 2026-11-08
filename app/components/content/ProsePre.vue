<!-- app/components/content/ProsePre.vue -->
<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import mermaid from 'mermaid'

const props = defineProps({
  code: { type: String, default: '' },
  language: { type: String, default: '' },
  filename: { type: String, default: null },
  highlights: { type: Array, default: () => [] }
})

const isMermaid = computed(() => {
  return props.language?.toLowerCase() === 'mermaid' || 
         props.code.trim().startsWith('graph') || 
         props.code.trim().startsWith('sequenceDiagram') || 
         props.code.trim().startsWith('classDiagram')
})

const containerRef = ref<HTMLElement | null>()
const svgContent = ref('')
const errorMessage = ref('')

const renderMermaid = async () => {
  if (!isMermaid.value) return
  
  try {
    errorMessage.value = ''
    const isDark = useColorMode().value === 'dark'

    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'neutral',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    })
    
    const id = 'mermaid-' + Math.random().toString(36).substring(2, 9)
    const { svg } = await mermaid.render(id, props.code.trim())
    
    // TRUCCO: Modifichiamo l'SVG via codice per rimuovere il max-width fisso 
    // e fare in modo che i testi e i nodi abbiano respiro
    svgContent.value = svg.replace(/max-width:[^;]+;/g, '')
  } catch (err: any) {
    console.error('Errore nel rendering di Mermaid:', err)
    errorMessage.value = 'Errore nel parsing del diagramma Mermaid'
  }
}

onMounted(renderMermaid)
watch(() => props.code, renderMermaid)
</script>

<template>
  <div v-if="isMermaid" class="my-6 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-x-auto shadow-sm">
    <div v-if="errorMessage" class="text-red-500 text-sm font-mono">{{ errorMessage }}</div>
    
    <!-- Contenitore con classe di zoom/ingrandimento forzato sui testi e sui nodi SVG -->
    <div 
      ref="containerRef" 
      v-html="svgContent" 
      class="mermaid-container w-full flex justify-center [&>svg]:w-full [&>svg]:h-auto [&_.node_text]:text-base [&_text]:text-sm! [&_g.node>rect]:stroke-2"
    ></div>
  </div>

  <pre v-else class="my-4 p-4 rounded-lg bg-neutral-900 text-neutral-100 overflow-x-auto text-sm font-mono"><slot /></pre>
</template>