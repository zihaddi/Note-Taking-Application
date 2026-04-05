<script setup lang="ts">
const { user, logout: authLogout } = useAuth();
const { getMyMenus } = useMenusApi();
const sidebarOpen = ref(false);
const profileOpen = ref(false);
const profileDropdownRef = ref<HTMLElement | null>(null);
const $route = useRoute();

const fallbackNavItems = [
    { to: '/user-panel', label: 'Dashboard', icon: 'lucide:layout-dashboard', exact: true },
    { to: '/user-panel/notes', label: 'My Notes', icon: 'lucide:file-text' },
    { to: '/user-panel/posts', label: 'Posts', icon: 'lucide:newspaper' },
    { to: '/user-panel/profile', label: 'Profile', icon: 'lucide:user' },
];

const navItems = ref([...fallbackNavItems]);

onMounted(async () => {
    // Load dynamic menu from API
    try {
        const res: any = await getMyMenus();
        const apiItems: any[] = (res?.data || []).filter((item: any) => item.section === 'user' && item.isActive);
        if (apiItems.length > 0) {
            navItems.value = apiItems
                .sort((a: any, b: any) => a.order - b.order)
                .map((item: any) => ({
                    to: item.path,
                    label: item.label,
                    icon: item.icon || 'lucide:circle',
                    exact: item.path === '/user-panel',
                }));
        }
    } catch {

    }


    document.addEventListener('click', (e) => {
        if (profileDropdownRef.value && !profileDropdownRef.value.contains(e.target as Node)) {
            profileOpen.value = false;
        }
    });
});

const currentPageTitle = computed(() => {
    const matched = navItems.value.find(item => {
        if (item.exact) return $route.path === item.to;
        return $route.path === item.to || $route.path.startsWith(item.to + '/');
    });
    return matched?.label ?? 'Dashboard';
});

async function logout() {
    await authLogout();
}

function isActiveRoute(to: string, exact = false) {
    if ($route.path === to) return true;
    if (exact) return false;
    return $route.path.startsWith(to + '/');
}
</script>

<template>
    <div class="flex h-screen bg-slate-50 overflow-hidden">
        <!-- Sidebar -->
        <aside :class="[
            'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out flex flex-col',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'md:relative md:translate-x-0'
        ]">
            <!-- Logo -->
            <div class="flex items-center gap-3 px-5 h-16 border-b border-gray-100 flex-shrink-0">
                <div class="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                    <Icon name="lucide:file-text" class="text-white" style="font-size:1rem" />
                </div>
                <div>
                    <p class="text-sm font-bold text-gray-900 leading-tight">NoteApp</p>
                    <p class="text-[10px] text-gray-400 font-medium">User Portal</p>
                </div>
            </div>

            <!-- Nav -->
            <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                <p class="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Menu</p>
                <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
                    :class="isActiveRoute(item.to, item.exact)
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
                    @click="sidebarOpen = false">
                    <div :class="['w-6 h-6 flex items-center justify-center flex-shrink-0',
                        isActiveRoute(item.to, item.exact) ? 'text-white' : 'text-gray-400 group-hover:text-gray-600']">
                        <Icon :name="item.icon" style="font-size:0.9rem" />
                    </div>
                    <span class="flex-1">{{ item.label }}</span>
                    <Icon v-if="isActiveRoute(item.to, item.exact)" name="lucide:chevron-right"
                        class="text-white/60 text-xs flex-shrink-0" />
                </NuxtLink>
            </nav>

            <!-- User footer -->
            <div class="px-3 py-4 border-t border-gray-100 flex-shrink-0">
                <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-gray-100 mb-2">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                        {{ user?.name?.charAt(0)?.toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold text-gray-900 truncate">{{ user?.name }}</p>
                        <p class="text-[10px] text-gray-400 truncate">{{ user?.email }}</p>
                    </div>
                </div>
                <button @click="logout"
                    class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors font-medium">
                    <Icon name="lucide:log-out" style="font-size:0.9rem" />
                    Sign Out
                </button>
            </div>
        </aside>

        <!-- Overlay for mobile -->
        <div v-if="sidebarOpen" class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
            @click="sidebarOpen = false" />

        <!-- Main content -->
        <div class="flex-1 flex flex-col overflow-hidden">
            <!-- Topbar -->
            <header class="flex items-center justify-between px-4 md:px-6 h-16 bg-white border-b border-gray-100 flex-shrink-0">
                <!-- Left -->
                <div class="flex items-center gap-3">
                    <button @click="sidebarOpen = true"
                        class="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <Icon name="lucide:menu" class="text-gray-700" style="font-size:1.1rem" />
                    </button>
                    <div class="hidden md:flex items-center gap-1.5 text-sm">
                        <span class="text-gray-400 font-medium">Portal</span>
                        <Icon name="lucide:chevron-right" class="text-gray-300 text-xs" />
                        <span class="font-semibold text-gray-800">{{ currentPageTitle }}</span>
                    </div>
                    <div class="md:hidden flex items-center gap-2">
                        <div class="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <Icon name="lucide:file-text" class="text-white text-sm" />
                        </div>
                        <span class="font-bold text-gray-900 text-sm">NoteApp</span>
                    </div>
                </div>

                <!-- Right: profile dropdown -->
                <div class="relative" ref="profileDropdownRef">
                    <button @click="profileOpen = !profileOpen"
                        class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 border border-gray-200 transition-all">
                        <div class="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {{ user?.name?.charAt(0)?.toUpperCase() }}
                        </div>
                        <span class="hidden sm:block text-sm font-semibold text-gray-700 max-w-[120px] truncate">{{ user?.name }}</span>
                        <Icon name="lucide:chevron-down" class="text-gray-400 text-xs transition-transform duration-200"
                            :class="profileOpen ? 'rotate-180' : ''" />
                    </button>

                    <!-- Dropdown -->
                    <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 scale-95 -translate-y-1" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 -translate-y-1">
                        <div v-if="profileOpen"
                            class="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50">
                            <div class="px-4 py-3 bg-gradient-to-br from-emerald-50 to-white border-b border-gray-100">
                                <p class="text-sm font-bold text-gray-900 truncate">{{ user?.name }}</p>
                                <p class="text-xs text-gray-400 truncate mt-0.5">{{ user?.email }}</p>
                            </div>
                            <div class="p-1">
                                <NuxtLink to="/user-panel/profile"
                                    class="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors rounded-xl font-medium"
                                    @click="profileOpen = false">
                                    <Icon name="lucide:user" class="text-gray-400" />
                                    My Profile
                                </NuxtLink>
                                <button @click="logout"
                                    class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors rounded-xl font-medium">
                                    <Icon name="lucide:log-out" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </Transition>
                </div>
            </header>

            <main class="flex-1 overflow-auto p-5 md:p-7">
                <slot />
            </main>
        </div>
    </div>
</template>
