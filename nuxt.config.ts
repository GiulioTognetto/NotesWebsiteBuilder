// https://nuxt.com/docs/api/configuration/nuxt-config

import { setupDevVaultSymlink } from './config/devVaultSymlink'
import { wikiLinkOptions } from './config/remarkWikiLink'
import remarkWikiLink from 'remark-wiki-link'

// Se siamo in dev e NOTES_VAULT_PATH è impostato, collega temporaneamente la cartella content/
const cleanupSymlink = setupDevVaultSymlink()

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/a11y',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/ui',
  ],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css',
          crossorigin: 'anonymous'
        }
      ]
    }
  },

  content: {
    build: {
      markdown: {
        remarkPlugins: {
          'remark-math': {},
          'remark-wiki-link': {
            instance: remarkWikiLink,
            options: wikiLinkOptions
          },
        },
        rehypePlugins: {
          'rehype-katex': {}
        },
        highlight: {
          theme: 'catppuccin-frappe',
        }
      }
    },
    database: {
      type: 'sqlite',
      filename: './.data/content/contents.sqlite'
    }
  },

  nitro: {
    prerender: {
      failOnError: false
    },
    routeRules: {
      '/**': {
        headers: {
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https: ws: wss:;"
        }
      }
    }
  },

  vite: {
    optimizeDeps: {
      include: [
        '@nuxt/content',
        '@nuxt/icon',
        '@nuxt/image',
        '@nuxt/scripts',
        '@nuxt/ui',
        '@vue/devtools-core',
        'lucide-vue-next',
        'mermaid',
        'remark-wiki-link',
      ]
    }
  },

  hooks: {
    close: () => {
      cleanupSymlink?.()
    }
  }
})


