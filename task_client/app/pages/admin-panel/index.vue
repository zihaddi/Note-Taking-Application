<script setup lang="ts">
useHead({ title: 'Admin Dashboard — NoteApp' });
definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

const { getUsers } = useUsersApi();
const { adminGetAllNotes } = useNotesApi();
const { getPublicPosts } = usePostsApi();
const toast = useToast();

const stats = ref({ users: 0, notes: 0, posts: 0 });
const recentUsers = ref<any[]>([]);
const isLoading = ref(true);

async function loadStats() {
    isLoading.value = true;
    try {
        const [usersRes, notesRes, postsRes] = await Promise.all([
            getUsers({ page: 1, per_page: 5 }),
            adminGetAllNotes({ page: 1, per_page: 1 }),
            getPublicPosts({ page: 1, per_page: 1 }),
        ]);
        stats.value.users = (usersRes as any)?.data?.meta?.total || 0;
        stats.value.notes = (notesRes as any)?.data?.meta?.total || 0;
        stats.value.posts = (postsRes as any)?.data?.meta?.total || 0;
        recentUsers.value = (usersRes as any)?.data?.data || [];
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load stats', life: 3000 });
    } finally {
        isLoading.value = false;
    }
}

const statCards = computed(() => [
    { label: 'Total Users', value: stats.value.users, icon: 'lucide:users', gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50 text-blue-600', link: '/admin-panel/users' },
    { label: 'Total Notes', value: stats.value.notes, icon: 'lucide:file-text', gradient: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 text-emerald-600', link: '/admin-panel/notes' },
    { label: 'Total Posts', value: stats.value.posts, icon: 'lucide:newspaper', gradient: 'from-purple-500 to-purple-600', light: 'bg-purple-50 text-purple-600', link: '/admin-panel/posts' },
]);

onMounted(loadStats);
</script>

<template>
    <div>
        <Toast />

        <!-- Page Header -->
        <div class="mb-7">
            <div class="flex items-center gap-2 text-xs text-gray-400 font-medium mb-1">
                <Icon name="lucide:layout-dashboard" class="text-sm" />
                Overview
            </div>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p class="text-gray-500 text-sm mt-1">Platform statistics and recent activity</p>
        </div>

        <!-- Stat cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <template v-if="isLoading">
                <Skeleton v-for="i in 3" :key="i" height="7rem" class="rounded-2xl" />
            </template>
            <NuxtLink v-else v-for="card in statCards" :key="card.label" :to="card.link"
                class="card-hover flex items-center gap-5 cursor-pointer group">
                <div
                    :class="['w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br flex-shrink-0 shadow-sm', card.gradient]">
                    <Icon :name="card.icon" class="text-2xl" />
                </div>
                <div>
                    <p class="text-2xl font-extrabold text-gray-900">{{ card.value.toLocaleString() }}</p>
                    <p class="text-sm text-gray-500">{{ card.label }}</p>
                </div>
                <Icon name="lucide:arrow-right"
                    class="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors" />
            </NuxtLink>
        </div>

        <!-- Recent Users -->
        <div class="card">
            <div class="flex items-center justify-between mb-5">
                <h2 class="section-title mb-0">Recent Users</h2>
                <NuxtLink to="/admin-panel/users"
                    class="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
                    View all
                    <Icon name="lucide:arrow-right" class="text-sm" />
                </NuxtLink>
            </div>
            <div v-if="isLoading" class="space-y-3">
                <Skeleton v-for="i in 5" :key="i" height="2.75rem" class="rounded-xl" />
            </div>
            <div v-else-if="recentUsers.length === 0" class="text-center py-10 text-gray-400 text-sm">No users yet.
            </div>
            <div v-else class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="text-left border-b border-gray-100">
                            <th class="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                            <th
                                class="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                                Email</th>
                            <th class="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                            <th class="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in recentUsers" :key="user._id"
                            class="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                            <td class="py-3 pr-4">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {{ user.name?.charAt(0)?.toUpperCase() }}
                                    </div>
                                    <span class="font-medium text-gray-900">{{ user.name }}</span>
                                </div>
                            </td>
                            <td class="py-3 pr-4 text-gray-500 hidden sm:table-cell">{{ user.email }}</td>
                            <td class="py-3 pr-4">
                                <span :class="['badge', user.role === 'admin' ? 'badge-purple' : 'badge-blue']">{{
                                    user.role
                                    }}</span>
                            </td>
                            <td class="py-3">
                                <span :class="['badge', user.status === 'active' ? 'badge-green' : 'badge-red']">{{
                                    user.status
                                    || 'active' }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
