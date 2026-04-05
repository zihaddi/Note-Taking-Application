<template>
    <div class="flex h-screen bg-gray-50 overflow-hidden">
        <!-- Sidebar -->
        <aside :class="[
            'fixed inset-y-0 left-0 z-50 w-64 bg-gray-950 text-white transform transition-transform duration-300 ease-in-out flex flex-col',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'md:relative md:translate-x-0'
        ]">
            <!-- Logo -->
            <div class="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
                <div
                    class="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/30">
                    <Icon name="lucide:shield-check" class="text-white text-lg" />
                </div>
                <div>
                    <span class="text-base font-bold text-white">Admin Panel</span>
                    <div class="text-xs text-gray-500 font-medium">NoteApp</div>
                </div>
            </div>

            <nav class="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
                <NuxtLink v-for="item in adminNavItems" :key="item.to" :to="item.to"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all" :class="isActiveRoute(item.to)
                        ? 'bg-emerald-600/15 text-emerald-400 ring-1 ring-emerald-500/20'
                        : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-100'" @click="sidebarOpen = false">
                    <div
                        :class="['w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all', isActiveRoute(item.to) ? 'bg-emerald-600/20 text-emerald-400' : 'text-gray-500 group-hover:text-gray-300']">
                        <Icon :name="item.icon" class="text-base" />
                    </div>
                    {{ item.label }}
                </NuxtLink>
            </nav>

            <!-- User info + logout -->
            <div class="px-3 py-4 border-t border-gray-800">
                <div class="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-800/50 mb-2">
                    <div
                        class="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {{ user?.name?.charAt(0)?.toUpperCase() }}
                    </div>
                    <div class="overflow-hidden flex-1 min-w-0">
                        <p class="text-sm font-semibold text-gray-100 truncate">{{ user?.name }}</p>
                        <p class="text-xs text-gray-500 truncate">{{ user?.email }}</p>
                    </div>
                    <span
                        class="text-xs bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">Admin</span>
                </div>
                <button @click="logout"
                    class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400/80 hover:bg-red-900/20 hover:text-red-400 rounded-xl transition-colors">
                    <Icon name="lucide:log-out" class="text-base" />
                    Sign Out
                </button>
            </div>
        </aside>

        <!-- Overlay for mobile -->
        <div v-if="sidebarOpen" class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            @click="sidebarOpen = false" />

        <!-- Main content -->
        <div class="flex-1 flex flex-col overflow-hidden min-w-0">
            <!-- Top bar (mobile) -->
            <header class="md:hidden flex items-center justify-between px-4 py-3 bg-gray-950 border-b border-gray-800">
                <button @click="sidebarOpen = true" class="p-2 rounded-xl hover:bg-gray-800 transition-colors">
                    <Icon name="lucide:menu" class="text-xl text-gray-300" />
                </button>
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <Icon name="lucide:shield-check" class="text-white text-xs" />
                    </div>
                    <span class="font-bold text-white text-sm">Admin Panel</span>
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

const adminNavItems = [
    { to: '/admin-panel', label: 'Dashboard', icon: 'lucide:layout-dashboard' },
    { to: '/admin-panel/users', label: 'Users', icon: 'lucide:users' },
    { to: '/admin-panel/notes', label: 'All Notes', icon: 'lucide:file-text' },
    { to: '/admin-panel/posts', label: 'Posts', icon: 'lucide:newspaper' },
    { to: '/admin-panel/interests', label: 'Group by Interests', icon: 'lucide:tag' },
];

async function logout() {
    await authLogout();
}

function isActiveRoute(to: string) {
    return $route.path === to || $route.path.startsWith(to + '/');
}
</script>
