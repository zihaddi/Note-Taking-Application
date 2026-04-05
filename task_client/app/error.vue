<script setup lang="ts">
useHead({ title: '403 Unauthorized — NoteApp' });
definePageMeta({ layout: 'default' });

const router = useRouter();
</script>

<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div class="max-w-md w-full text-center">
            <!-- Icon -->
            <div class="flex justify-center mb-6">
                <div
                    class="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-sm">
                    <Icon name="lucide:shield-x" class="text-red-500" style="font-size:2.5rem" />
                </div>
            </div>

            <!-- Code -->
            <p class="text-7xl font-black text-gray-100 mb-0 leading-none select-none">403</p>

            <!-- Text -->
            <h1 class="text-2xl font-bold text-gray-900 mt-2 mb-2">Access Denied</h1>
            <p class="text-gray-500 text-sm leading-relaxed mb-8">
                You don't have permission to view this page. Please contact an administrator if you believe this is a
                mistake.
            </p>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
                <button @click="router.back()"
                    class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm">
                    <Icon name="lucide:arrow-left" class="text-sm" />
                    Go Back
                </button>
                <NuxtLink to="/"
                    class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-sm">
                    <Icon name="lucide:home" class="text-sm" />
                    Home
                </NuxtLink>
            </div>
        </div>
    </div>
</template>
