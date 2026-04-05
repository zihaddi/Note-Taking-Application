<script setup lang="ts">
const features = [
    { icon: 'lucide:lock', text: 'Secure JWT authentication' },
    { icon: 'lucide:layers', text: 'Role-based access control' },
    { icon: 'lucide:database', text: 'MongoDB with aggregation' },
    { icon: 'lucide:zap', text: 'Fast search & pagination' },
];
</script>


<template>
    <div class="min-h-screen flex bg-white">
        <!-- Left branding panel (hidden on mobile) -->
        <div
            class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-emerald-800 flex-col items-center justify-center p-12 relative overflow-hidden">
            <!-- Background decoration -->
            <div class="absolute top-0 left-0 w-full h-full opacity-10">
                <div class="absolute top-10 left-10 w-48 h-48 bg-white rounded-full"></div>
                <div class="absolute bottom-20 right-10 w-64 h-64 bg-white rounded-full"></div>
                <div class="absolute top-1/2 left-1/4 w-32 h-32 bg-white rounded-full"></div>
            </div>
            <div class="relative z-10 text-center">
                <div
                    class="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/30">
                    <Icon name="lucide:file-text" class="text-white text-4xl" />
                </div>
                <h1 class="text-4xl font-extrabold text-white mb-3 tracking-tight">NoteApp</h1>
                <p class="text-emerald-100 text-lg mb-10 max-w-xs">Your secure space for notes, ideas, and
                    collaboration.</p>
                <div class="space-y-4 text-left max-w-xs mx-auto">
                    <div v-for="feature in features" :key="feature.text" class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Icon :name="feature.icon" class="text-white text-sm" />
                        </div>
                        <span class="text-emerald-100 text-sm">{{ feature.text }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right form panel -->
        <div class="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gray-50">
            <div class="w-full max-w-md">
                <!-- Mobile logo -->
                <div class="flex items-center justify-center gap-2 mb-8 lg:hidden">
                    <div class="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                        <Icon name="lucide:file-text" class="text-white text-xl" />
                    </div>
                    <span class="text-2xl font-bold text-gray-900">NoteApp</span>
                </div>
                <slot />
            </div>
        </div>
    </div>
</template>
