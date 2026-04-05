// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

const MyPreset = definePreset(Aura, {
    semantic: {
        colorScheme: {
            light: {
                primary: {
                    50: '{emerald.50}',
                    100: '{emerald.100}',
                    200: '{emerald.200}',
                    300: '{emerald.300}',
                    400: '{emerald.400}',
                    500: '{emerald.500}',
                    600: '{emerald.600}',
                    700: '{emerald.700}',
                    800: '{emerald.800}',
                    900: '{emerald.900}',
                    950: '{emerald.950}'
                },
            }
        }
    },
});

export default defineNuxtConfig({

    future: {
        compatibilityVersion: 4,
    },

    experimental: {
        scanPageMeta: 'after-resolve',
    },

    runtimeConfig: {
        public: {
            API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
            SITE_NAME: process.env.SITE_NAME || 'NoteApp',
        }
    },

    compatibilityDate: '2025-07-15',

    devtools: { enabled: true },

    css: [
        '~/assets/css/main.css',
        'primeicons/primeicons.css',
    ],

    modules: [
        '@primevue/nuxt-module',
        '@nuxt/icon',
        '@nuxtjs/color-mode',
        '@nuxtjs/tailwindcss',
        '@nuxt/image',
    ],

    imports: {
        dirs: ['stores'],
    },

    colorMode: {
        preference: 'light',
        fallback: 'light',
        hid: 'nuxt-color-mode-script',
        globalName: '__NUXT_COLOR_MODE__',
        componentName: 'ColorScheme',
        classPrefix: '',
        classSuffix: '',
        storageKey: 'nuxt-color-mode'
    },

    primevue: {
        options: {
            theme: {
                preset: MyPreset,
                options: {
                    prefix: 'p',
                    darkModeSelector: false,
                    cssLayer: false
                }
            }
        },
        components: {
            include: '*'
        }
    },

    app: {
        head: {
            title: 'NoteApp',
            link: [
                { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
            ],
            meta: [
                { name: 'theme-color', content: '#10b981' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' }
            ]
        }
    },

    vite: {
        optimizeDeps: {
            include: [
                '@vue/devtools-core',
                '@vue/devtools-kit',
            ]
        }
    },
});
