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
        <div class="mb-8">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Overview</p>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p class="text-gray-500 text-sm mt-1">Platform statistics and recent activity</p>
        </div>

        <!-- Stat cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <template v-if="isLoading">
                <Skeleton v-for="i in 3" :key="i" height="7rem" class="rounded-2xl" />
            </template>
            <NuxtLink v-else v-for="card in statCards" :key="card.label" :to="card.link"
                class="card-stat group">
                <!-- Background decoration -->
                <div :class="['absolute inset-0 opacity-[0.03] rounded-2xl bg-gradient-to-br', card.gradient]" />
                <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br flex-shrink-0 shadow-lg', card.gradient]">
                    <Icon :name="card.icon" style="font-size:1.4rem" />
                </div>
                <div class="relative">
                    <p class="text-3xl font-extrabold text-gray-900 tabular-nums">{{ card.value.toLocaleString() }}</p>
                    <p class="text-xs font-semibold text-gray-500 mt-0.5 uppercase tracking-wide">{{ card.label }}</p>
                </div>
                <div class="ml-auto relative">
                    <div :class="['w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110', card.light]">
                        <Icon name="lucide:arrow-right" class="text-sm" />
                    </div>
                </div>
            </NuxtLink>
        </div>

        <!-- Recent Users -->
        <div class="card">
            <div class="flex items-center justify-between mb-5">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Icon name="lucide:users" class="text-blue-600 text-sm" />
                    </div>
                    <div>
                        <h2 class="text-sm font-bold text-gray-900">Recent Users</h2>
                        <p class="text-xs text-gray-400">Latest registrations</p>
                    </div>
                </div>
                <NuxtLink to="/admin-panel/users"
                    class="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
                    View all
                    <Icon name="lucide:arrow-right" class="text-sm" />
                </NuxtLink>
            </div>
            <div v-if="isLoading" class="space-y-3">
                <Skeleton v-for="i in 5" :key="i" height="3rem" class="rounded-xl" />
            </div>
            <div v-else-if="recentUsers.length === 0" class="empty-state">
                <p class="text-sm font-medium text-gray-500">No users yet.</p>
            </div>
            <div v-else class="overflow-x-auto -mx-1">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th class="hidden sm:table-cell">Email</th>
                            <th>Role</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in recentUsers" :key="user._id">
                            <td>
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                                        {{ user.name?.charAt(0)?.toUpperCase() }}
                                    </div>
                                    <span class="font-semibold text-gray-900 text-sm">{{ user.name }}</span>
                                </div>
                            </td>
                            <td class="text-gray-500 text-sm hidden sm:table-cell">{{ user.email }}</td>
                            <td>
                                <span :class="['badge', user.role === 'admin' ? 'badge-purple' : 'badge-blue']">{{ user.role }}</span>
                            </td>
                            <td>
                                <div class="flex items-center gap-1.5">
                                    <div :class="['w-1.5 h-1.5 rounded-full flex-shrink-0', user.status === 'active' ? 'bg-green-500' : 'bg-red-400']" />
                                    <span :class="['badge', user.status === 'active' ? 'badge-green' : 'badge-red']">{{ user.status || 'active' }}</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
