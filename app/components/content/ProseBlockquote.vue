<!-- app/components/content/ProseBlockquote.vue -->
<script setup lang="ts">
import { useSlots, computed, h } from 'vue'

const slots = useSlots()

const calloutData = computed(() => {
  const defaultSlot = slots.default?.()
  if (!defaultSlot || defaultSlot.length === 0) return null

  const firstNode = defaultSlot[0]
  let text = ''

  function extractText(node: any): string {
    if (!node) return ''
    if (typeof node.children === 'string') return node.children
    if (Array.isArray(node.children)) return node.children.map(extractText).join('')
    if (node.children?.default) return node.children.default().map(extractText).join('')
    return ''
  }

  text = extractText(firstNode)
  const lines = text.split(/\r?\n/)
  const firstLine = lines[0]?.trim() || ''

  const match = firstLine.match(/^\[?!([a-zA-Z0-9_-]+)\]?([+-]?)(?:[ \t]+([^\r\n]+))?/)
  if (!match) return null

  const type = (match[1] || 'note').toLowerCase()
  const customTitle = (match[3] || '').trim()
  const title = customTitle || (type.charAt(0).toUpperCase() + type.slice(1))

  // Ricostruiamo i nodi figli puliti: rimuoviamo la prima riga dal primo nodo se contiene il testo della dichiarazione
  // e lasciamo intatto tutto il resto (altri paragrafi, liste, formule, ecc.)
  const remainingContentLines = lines.slice(1)
  const restOfSlots = defaultSlot.slice(1)

  // Se c'è del testo residuo dopo il \n nel primo nodo, creiamo un nodo testuale/paragrafo ripulito
  let cleanedFirstNode = null
  if (remainingContentLines.length > 0 && firstNode) {
    const cleanedText = remainingContentLines.join('\n')
    // Cloniamo il primo nodo ma aggiorniamo il suo testo interno senza la prima riga
    cleanedFirstNode = h(firstNode.type as any, firstNode.props, cleanedText)
  }

  // Il contenuto finale dello slot per il callout sarà la prima riga ripulita + tutti i nodi successivi
  const renderCleanedContent = () => {
    const nodes = []
    if (cleanedFirstNode) nodes.push(cleanedFirstNode)
    nodes.push(...restOfSlots)
    return nodes
  }

  return { type, title, renderCleanedContent }
})
</script>

<template>
  <Callout v-if="calloutData" :type="calloutData.type" :title="calloutData.title">
    <component :is="calloutData.renderCleanedContent" />
  </Callout>

  <blockquote v-else class="my-4 border-l-4 border-neutral-300 dark:border-neutral-700 pl-4 py-1 italic text-neutral-700 dark:text-neutral-300">
    <slot />
  </blockquote>
</template>