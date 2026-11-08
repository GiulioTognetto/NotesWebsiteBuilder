<!-- app/pages/[...slug].vue -->
<script setup lang="ts">
const route = useRoute()

const cleanPath = computed(() => decodeURIComponent(route.path).replace(/\/$/, '') || '/')
const isHome = computed(() => cleanPath.value === '/' || cleanPath.value === '/index')

// Chiave di cache stabile basata sul path pulito
const { data: page, pending } = useLazyAsyncData(`content-${cleanPath.value}`, async () => {
  const path = cleanPath.value

  if (isHome.value) {
    const rootIndex = await queryCollection('content').path('/').first()
    if (rootIndex) return rootIndex
    return queryCollection('content').path('/index').first()
  }

  // 1. Cerca per path esatto
  let found = await queryCollection('content').path(path).first()
  if (found) return found

  // 2. Cerca per path minuscolo
  found = await queryCollection('content').path(path.toLowerCase()).first()
  if (found) return found

  // 3. Cerca con suffisso /index
  found = await queryCollection('content').path(`${path}/index`).first()
  if (found) return found

  // 4. Fallback basato sullo slug finale
  const slug = path.split('/').filter(Boolean).pop()?.toLowerCase()
  if (slug) {
    const all = await queryCollection('content').all()
    found = all.find((n: any) => {
      const stemSlug = n.stem?.split('/').pop()?.toLowerCase()
      const titleSlug = n.title?.toLowerCase().replace(/\s+/g, '-')
      return stemSlug === slug || titleSlug === slug || n.path.toLowerCase().endsWith(`/${slug}`)
    }) as any
    if (found) return found
  }

  return null
})

useHead({
  title: computed(() => page.value?.title ? `${page.value.title} · Appunti` : 'Appunti'),
  meta: [
    {
      name: 'description',
      content: computed(() => (page.value as any)?.description || 'Obsidian Notes Website')
    }
  ]
})
</script>

<template>
  <div class="note-page">
    <!-- Skeleton / Caricamento pagina completa con Nuxt UI -->
    <div v-if="pending && !page" class="py-6 space-y-6 animate-pulse">
      <!-- Intestazione (Icona + Titolo + Data/Tag) -->
      <div class="space-y-3 pb-4 border-b border-neutral-200/60 dark:border-neutral-800/80">
        <USkeleton class="h-10 w-10 rounded-lg" />
        <USkeleton class="h-9 w-3/4" />
        <div class="flex gap-2 pt-1">
          <USkeleton class="h-5 w-24 rounded" />
          <USkeleton class="h-5 w-16 rounded" />
        </div>
      </div>

      <!-- Primo blocco di testo / Paragrafo introduttivo -->
      <div class="space-y-2 pt-2">
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-11/12" />
        <USkeleton class="h-4 w-4/5" />
      </div>

      <!-- Callout fittizio di caricamento -->
      <div class="p-4 rounded-lg border border-neutral-200/60 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 space-y-3">
        <div class="flex items-center gap-2">
          <USkeleton class="h-4 w-4 rounded-full" />
          <USkeleton class="h-4 w-1/3" />
        </div>
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-5/6" />
      </div>

      <!-- Secondo blocco con elenco puntato simulato -->
      <div class="space-y-3 pt-2">
        <USkeleton class="h-6 w-1/2 mb-4" /> <!-- Sottotitolo H2 -->
        <div class="flex items-center gap-3">
          <USkeleton class="h-2 w-2 rounded-full shrink-0" />
          <USkeleton class="h-4 w-full" />
        </div>
        <div class="flex items-center gap-3">
          <USkeleton class="h-2 w-2 rounded-full shrink-0" />
          <USkeleton class="h-4 w-10/12" />
        </div>
        <div class="flex items-center gap-3">
          <USkeleton class="h-2 w-2 rounded-full shrink-0" />
          <USkeleton class="h-4 w-11/12" />
        </div>
      </div>

      <!-- Blocco di codice o formula finale -->
      <USkeleton class="h-24 w-full rounded-lg" />
    </div>

    <!-- 1. Se la pagina esiste -->
    <article v-else-if="page" class="space-y-6">
      <div v-if="(page as any)?.cover" class="-mx-6 sm:-mx-12 -mt-8 md:-mt-14 mb-8 overflow-hidden rounded-b-xl max-h-56">
        <img
          :src="(page as any).cover"
          alt="Cover"
          class="w-full h-full object-cover"
        >
      </div>

      <header class="space-y-3 pb-4">
        <div class="text-4xl sm:text-5xl select-none mb-2">
          <span>{{ (page as any)?.icon || (isHome ? '🌿' : '📄') }}</span>
        </div>

        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          {{ page.title || (isHome ? 'Index' : 'Senza titolo') }}
        </h1>

        <div v-if="(page as any)?.date || (page as any)?.tags" class="flex flex-wrap items-center gap-2 pt-2 text-xs text-neutral-500 dark:text-neutral-400">
          <div v-if="(page as any)?.date" class="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800/80">
            <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" />
            <span>{{ (page as any).date }}</span>
          </div>

          <div v-if="(page as any)?.tags" class="flex flex-wrap gap-1">
            <span
              v-for="tag in (Array.isArray((page as any).tags) ? (page as any).tags : [(page as any).tags])"
              :key="tag"
              class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

        <hr class="border-t border-neutral-200/60 dark:border-neutral-800/80 pt-2">
      </header>

      <!-- Corpo del Contenuto protetto per evitare mismatch del renderer Markdown -->
      <ClientOnly>
        <ContentRenderer :value="page" class="notion-prose" />
        <template #fallback>
          <div class="py-6 space-y-6 animate-pulse">
            <!-- Intestazione (Icona + Titolo + Data/Tag) -->
            <div class="space-y-3 pb-4 border-b border-neutral-200/60 dark:border-neutral-800/80">
              <USkeleton class="h-10 w-10 rounded-lg" />
              <USkeleton class="h-9 w-3/4" />
              <div class="flex gap-2 pt-1">
                <USkeleton class="h-5 w-24 rounded" />
                <USkeleton class="h-5 w-16 rounded" />
              </div>
            </div>

            <!-- Primo blocco di testo / Paragrafo introduttivo -->
            <div class="space-y-2 pt-2">
              <USkeleton class="h-4 w-full" />
              <USkeleton class="h-4 w-11/12" />
              <USkeleton class="h-4 w-4/5" />
            </div>

            <!-- Callout fittizio di caricamento -->
            <div class="p-4 rounded-lg border border-neutral-200/60 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 space-y-3">
              <div class="flex items-center gap-2">
                <USkeleton class="h-4 w-4 rounded-full" />
                <USkeleton class="h-4 w-1/3" />
              </div>
              <USkeleton class="h-4 w-full" />
              <USkeleton class="h-4 w-5/6" />
            </div>

            <!-- Secondo blocco con elenco puntato simulato -->
            <div class="space-y-3 pt-2">
              <USkeleton class="h-6 w-1/2 mb-4" /> <!-- Sottotitolo H2 -->
              <div class="flex items-center gap-3">
                <USkeleton class="h-2 w-2 rounded-full shrink-0" />
                <USkeleton class="h-4 w-full" />
              </div>
              <div class="flex items-center gap-3">
                <USkeleton class="h-2 w-2 rounded-full shrink-0" />
                <USkeleton class="h-4 w-10/12" />
              </div>
              <div class="flex items-center gap-3">
                <USkeleton class="h-2 w-2 rounded-full shrink-0" />
                <USkeleton class="h-4 w-11/12" />
              </div>
            </div>

            <!-- Blocco di codice o formula finale -->
            <USkeleton class="h-24 w-full rounded-lg" />
          </div>
        </template>
      </ClientOnly>
    </article>

    <!-- 2. Home vuota -->
    <div v-else-if="isHome" class="space-y-6">
      <header class="space-y-2">
        <div class="text-5xl mb-2 select-none">🌿</div>
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          I Miei Appunti
        </h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          Crea un file <code class="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-xs">index.md</code> nel tuo vault per personalizzare questa pagina iniziale.
        </p>
      </header>
    </div>

    <!-- 3. 404 -->
    <div v-else class="text-center py-16 space-y-4">
      <div class="text-5xl select-none">🔍</div>
      <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        Nota non trovata
      </h2>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
        La nota a cui stai tentando di accedere non esiste o è stata spostata.
      </p>
      <div class="pt-2">
        <UButton to="/" icon="i-lucide-arrow-left" color="neutral" variant="outline" size="sm">
          Torna all'indice
        </UButton>
      </div>
    </div>
  </div>
</template>