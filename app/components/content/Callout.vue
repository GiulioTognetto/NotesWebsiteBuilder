<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type?: string
  title?: string
}>()

const iconMap: Record<string, string> = {
  abstract: 'i-lucide-file-text',
  info: 'i-lucide-info',
  note: 'i-lucide-pencil',
  tip: 'i-lucide-flame',
  warning: 'i-lucide-alert-triangle',
  danger: 'i-lucide-zap',
  success: 'i-lucide-check-circle',
  question: 'i-lucide-help-circle',
  todo: 'i-lucide-check-square'
}

const currentIcon = computed(() => {
  return iconMap[props.type || 'note'] || 'i-lucide-info'
})
</script>

<template>
  <aside class="flex flex-col callout my-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-4 text-sm">
    <div class="flex items-center gap-2 font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
      <UIcon :name="currentIcon" class="w-4 h-4 shrink-0" />
      <span>{{ title }}</span>
    </div>
    
    <!-- Corpo del callout con classe dedicata per rimuovere il primo paragrafo spazzatura se ripete il titolo -->
    <div class="text-neutral-700 dark:text-neutral-300 space-y-2 prose dark:prose-invert max-w-none">
      <slot />
    </div>
  </aside>
</template>