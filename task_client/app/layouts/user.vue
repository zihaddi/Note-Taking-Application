<template>
    <div class="flex h-screen bg-gray-50 overflow-hidden">
        <!-- Sidebar -->
        <aside :class="[
            'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 shadow-sm transform transition-transform duration-300 ease-in-out flex flex-col',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'md:relative md:translate-x-0'
        ]">
            <!-- Logo -->
            <div class="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
                <div
                    class="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-sm">
                    <Icon name="lucide:file-text" class="text-white" style="font-size:1.1rem" />
                </div>
                <div>
                    <span class="text-base font-bold text-gray-900">NoteApp</span>
                    <p class="text-xs text-gray-400 leading-none mt-0.5">User Portal</p>
                </div>
            </div>

            <nav class="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
                <NuxtLink v-for="item in userNavItems" :key="item.to" :to="item.to"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                    :class="isActiveRoute(item.to)
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'" @click="sidebarOpen = false">
                    <div
                        :class="['w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors', isActiveRoute(item.to) ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500']">
                        <Icon :name="item.icon" style="font-size:0.9rem" />
                    </div>
                    {{ item.label }}
                </NuxtLink>
            </nav>

            <!-- User info + logout -->
            <div class="px-3 py-4 border-t border-gray-100">
                <div class="flex items-center gap-3 px-2 py-2 mb-1 rounded-xl bg-gray-50">
                    <div
                        class="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {{ user?.name?.charAt(0)?.toUpperCase() }}
                    </div>
                    <div class="flex-1 overflow-hidden">
                        <p class="text-sm font-semibold text-gray-900 truncate">{{ user?.name }}</p>
                        <p class="text-xs text-gray-400 truncate">{{ user?.email }}</p>
                    </div>
                </div>
                <button @click="logout"
                    class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors mt-1">
                    <Icon name="lucide:log-out" style="font-size:1rem" />
                    Sign Out
                </button>
            </div>
        </aside>

        <!-- Overlay for mobile -->
        <div v-if="sidebarOpen" class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            @click="sidebarOpen = false" />

        <!-- Main content -->
        <div class="flex-1 flex flex-col overflow-hidden">
            <!-- Top bar (mobile) -->
            <header
                class="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
                <button @click="sidebarOpen = true" class="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                    <Icon name="lucide:menu" class="text-gray-700" style="font-size:1.25rem" />
                </button>
                <div class="flex items-center gap-2">
                    <div
                        class="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
                        <Icon name="lucide:file-text" class="text-white text-sm" />
                    </div>
                    <span class="font-bold text-gray-900">NoteApp</span>
                </div>
                <div class="w-9" />
            </header>

            <main class="flex-1 overflow-auto p-5 md:p-7">
                <slot />
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
const { user, logout: authLogout } = useAuth();
const sidebarOpen = ref(false);
const $route = useRoute();

const userNavItems = [
    { to: '/user-panel', label: 'Dashboard', icon: 'lucide:layout-dashboard' },
    { to: '/user-panel/notes', label: 'My Notes', icon: 'lucide:file-text' },
    { to: '/user-panel/posts', label: 'Posts', icon: 'lucide:newspaper' },
    { to: '/user-panel/profile', label: 'Profile', icon: 'lucide:user' },
];

async function logout() {
    await authLogout();
}

function isActiveRoute(to: string) {
    return $route.path === to || $route.path.startsWith(to + '/');
}
</script>
