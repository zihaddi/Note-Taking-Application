<script setup lang="ts">
useHead({ title: 'Welcome — NoteApp' });
definePageMeta({ layout: 'auth', middleware: ['guest'] });
</script>

<template>
    <div>
        <h1 class="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Get Started</h1>
        <p class="text-gray-500 text-sm mb-8">Choose how you'd like to sign in.</p>

        <div class="space-y-3 mb-6">
            <NuxtLink to="/login"
                class="flex items-center gap-4 w-full p-4 bg-white border-2 border-gray-200 hover:border-emerald-500 rounded-2xl transition-all group">
                <div
                    class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                    <Icon name="lucide:user"
                        class="text-emerald-600 group-hover:text-white transition-colors text-lg" />
                </div>
                <div class="text-left">
                    <p class="font-semibold text-gray-900 text-sm">User Login</p>
                    <p class="text-xs text-gray-500">Manage your notes and posts</p>
                </div>
                <Icon name="lucide:chevron-right"
                    class="text-gray-400 ml-auto group-hover:text-emerald-500 transition-colors" />
            </NuxtLink>

            <NuxtLink to="/admin-login"
                class="flex items-center gap-4 w-full p-4 bg-white border-2 border-gray-200 hover:border-gray-800 rounded-2xl transition-all group">
                <div
                    class="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                    <Icon name="lucide:shield-check" class="text-emerald-400 text-lg" />
                </div>
                <div class="text-left">
                    <p class="font-semibold text-gray-900 text-sm">Admin Portal</p>
                    <p class="text-xs text-gray-500">Manage users, notes and platform</p>
                </div>
                <Icon name="lucide:chevron-right"
                    class="text-gray-400 ml-auto group-hover:text-gray-700 transition-colors" />
            </NuxtLink>
        </div>

        <p class="text-center text-sm text-gray-500">
            New here?
            <NuxtLink to="/register" class="text-emerald-600 font-semibold hover:underline">Create an account</NuxtLink>
        </p>
    </div>
</template>
