<script setup lang="ts">
useHead({ title: 'Dashboard — NoteApp' });
definePageMeta({ middleware: ['auth-user'], layout: 'user' });

const { getUserNotes } = useNotesApi();
const { getMyPosts } = usePostsApi();
const { user } = useAuth();

const stats = reactive({ notes: 0, posts: 0 });
const recentNotes = ref<any[]>([]);
const isLoading = ref(true);

onMounted(async () => {
    try {
        const [notesRes, postsRes] = await Promise.all([
            getUserNotes({ per_page: 5 }),
            getMyPosts({ per_page: 5 }),
        ]);
        stats.notes = notesRes?.data?.meta?.total || 0;
        stats.posts = postsRes?.data?.meta?.total || 0;
        recentNotes.value = notesRes?.data?.data || [];
    } catch (err) {
        console.error(err);
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
    <div>
        <!-- Page Header -->
        <div class="mb-7">
            <p class="text-xs text-gray-400 font-medium mb-1">User Panel</p>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight">
                Welcome back, <span class="text-emerald-600">{{ user?.name?.split(' ')[0] }}</span>!
            </h1>
            <p class="text-gray-500 text-sm mt-1">Here's what's happening with your content.</p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-4 mb-8">
            <template v-if="isLoading">
                <Skeleton v-for="i in 2" :key="i" height="6rem" class="rounded-2xl" />
            </template>
            <template v-else>
                <NuxtLink to="/user-panel/notes" class="card-hover flex items-center gap-4 group cursor-pointer">
                    <div
                        class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                        <Icon name="lucide:file-text" style="font-size:1.25rem" />
                    </div>
                    <div>
                        <p class="text-2xl font-extrabold text-gray-900">{{ stats.notes }}</p>
                        <p class="text-xs text-gray-500 font-medium">My Notes</p>
                    </div>
                    <Icon name="lucide:arrow-right"
                        class="ml-auto text-gray-300 group-hover:text-emerald-500 transition-colors" />
                </NuxtLink>
                <NuxtLink to="/user-panel/posts" class="card-hover flex items-center gap-4 group cursor-pointer">
                    <div
                        class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                        <Icon name="lucide:newspaper" style="font-size:1.25rem" />
                    </div>
                    <div>
                        <p class="text-2xl font-extrabold text-gray-900">{{ stats.posts }}</p>
                        <p class="text-xs text-gray-500 font-medium">My Posts</p>
                    </div>
                    <Icon name="lucide:arrow-right"
                        class="ml-auto text-gray-300 group-hover:text-blue-500 transition-colors" />
                </NuxtLink>
            </template>
        </div>

        <!-- Recent Notes -->
        <div class="card">
            <div class="flex items-center justify-between mb-5">
                <h2 class="section-title mb-0">Recent Notes</h2>
                <NuxtLink to="/user-panel/notes"
                    class="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
                    View all
                    <Icon name="lucide:arrow-right" class="text-sm" />
                </NuxtLink>
            </div>

            <div v-if="isLoading" class="space-y-3">
                <Skeleton v-for="i in 3" :key="i" height="3.5rem" class="rounded-xl" />
            </div>

            <div v-else-if="recentNotes.length === 0" class="empty-state">
                <div class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Icon name="lucide:file-plus" class="text-gray-400" style="font-size:1.5rem" />
                </div>
                <p class="text-sm font-medium text-gray-500">No notes yet</p>
                <NuxtLink to="/user-panel/notes"
                    class="mt-2 inline-block text-xs text-emerald-600 hover:text-emerald-700 font-semibold">
                    Create your first note →
                </NuxtLink>
            </div>

            <ul v-else class="divide-y divide-gray-50">
                <li v-for="note in recentNotes" :key="note._id" class="py-3 first:pt-0 last:pb-0">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <Icon name="lucide:file-text" class="text-emerald-500 text-sm" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold text-gray-900 truncate">{{ note.title }}</p>
                            <p class="text-xs text-gray-400 truncate mt-0.5">{{ note.content }}</p>
                        </div>
                        <div class="flex items-center gap-2 flex-shrink-0">
                            <Icon v-if="note.is_pinned" name="lucide:pin" class="text-emerald-400 text-xs" />
                            <span v-if="note.tags?.length"
                                class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{{
                                note.tags[0] }}</span>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>
