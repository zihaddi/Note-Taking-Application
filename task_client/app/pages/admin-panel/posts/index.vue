<script setup lang="ts">
useHead({ title: 'All Posts — Admin' });
definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

const { getPublicPosts } = usePostsApi();
const toast = useToast();

const posts = ref<any[]>([]);
const meta = ref<any>(null);
const isLoading = ref(false);
const search = ref('');
const page = ref(1);
const perPage = 12;

async function fetchPosts() {
    isLoading.value = true;
    try {
        const res: any = await getPublicPosts({ page: page.value, per_page: perPage, search: search.value });
        posts.value = res?.data?.data || [];
        meta.value = res?.data?.meta || null;
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load posts', life: 3000 });
    } finally {
        isLoading.value = false;
    }
}

let searchTimer: ReturnType<typeof setTimeout>;
watch(search, () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { page.value = 1; fetchPosts(); }, 400);
});

onMounted(fetchPosts);
</script>

<template>
    <div>
        <Toast />

        <!-- Header -->
        <div class="flex items-center justify-between mb-7">
            <div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Content</p>
                <h1 class="text-2xl font-bold text-gray-900 tracking-tight">All Posts</h1>
                <p class="text-gray-500 text-sm mt-0.5" v-if="meta">
                    <span class="font-semibold text-gray-700">{{ meta.total }}</span> total posts
                </p>
            </div>
        </div>

        <!-- Search -->
        <div class="mb-5">
            <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="search" placeholder="Search posts..." class="w-full !rounded-xl" />
            </IconField>
        </div>

        <div v-if="isLoading" class="space-y-3">
            <Skeleton v-for="i in 8" :key="i" height="6rem" class="rounded-2xl" />
        </div>

        <div v-else-if="posts.length === 0" class="empty-state py-16">
            <div class="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon name="lucide:newspaper" class="text-gray-400" style="font-size:1.5rem" />
            </div>
            <p class="text-sm font-semibold text-gray-500">No posts found</p>
        </div>

        <div v-else class="space-y-3">
            <div v-for="post in posts" :key="post._id" class="card group transition-all hover:shadow-md">
                <div class="flex items-start justify-between gap-4">
                    <NuxtLink :to="`/admin-panel/posts/${post._id}`" class="flex-1 min-w-0 cursor-pointer">
                        <div class="flex items-center gap-2 mb-1.5">
                            <h3 class="font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">{{ post.title }}</h3>
                            <span :class="['badge flex-shrink-0', post.is_published ? 'badge-green' : 'badge-gray']">
                                {{ post.is_published ? 'Published' : 'Draft' }}
                            </span>
                        </div>
                        <p class="text-sm text-gray-500 line-clamp-2 mb-2">{{ post.content }}</p>
                        <div class="flex flex-wrap gap-1">
                            <span v-for="tag in post.tags" :key="tag" class="badge badge-blue">{{ tag }}</span>
                        </div>
                    </NuxtLink>
                    <NuxtLink :to="`/admin-panel/users/${post.userId?._id}/posts`">
                        <button class="action-btn-view" title="View author">
                            <Icon name="lucide:user" class="text-xs" />
                        </button>
                    </NuxtLink>
                </div>
                <div class="mt-3 pt-2.5 border-t border-gray-100 flex items-center gap-2">
                    <div
                        class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {{ post.userId?.name?.charAt(0)?.toUpperCase() || '?' }}
                    </div>
                    <span class="text-xs font-semibold text-gray-700">{{ post.userId?.name || 'Unknown' }}</span>
                    <span class="text-xs text-gray-400 ml-auto">{{ post.userId?.email }}</span>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="meta && meta.last_page > 1" class="flex justify-center mt-6">
            <Paginator :rows="perPage" :totalRecords="meta.total" :first="(meta.current_page - 1) * perPage"
                @page="(e: any) => { page = e.page + 1; fetchPosts(); }" />
        </div>
    </div>
</template>
