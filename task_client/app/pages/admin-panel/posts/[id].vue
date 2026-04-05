<script setup lang="ts">
useHead({ title: 'Post Detail — Admin' });
definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

import { formatDate, timeAgo } from '~/utils/helpers';

const route = useRoute();
const router = useRouter();
const { getPost } = usePostsApi();
const toast = useToast();

const post = ref<any>(null);
const isLoading = ref(true);

async function loadPost() {
    isLoading.value = true;
    try {
        const res: any = await getPost(route.params.id as string);
        post.value = res?.data;
        useHead({ title: `${post.value?.title || 'Post'} — Admin` });
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.data?.message || 'Post not found', life: 3000 });
        router.push('/admin-panel/posts');
    } finally {
        isLoading.value = false;
    }
}

const authorInitial = computed(() => {
    const name = typeof post.value?.userId === 'object' ? post.value.userId?.name : null;
    return name?.charAt(0)?.toUpperCase() || '?';
});

const authorName = computed(() => {
    return typeof post.value?.userId === 'object' ? post.value.userId?.name : 'Unknown';
});

const authorEmail = computed(() => {
    return typeof post.value?.userId === 'object' ? post.value.userId?.email : '';
});

onMounted(loadPost);
</script>

<template>
    <div>
        <Toast />

        <!-- Loading skeleton -->
        <div v-if="isLoading" class="space-y-4">
            <Skeleton height="2rem" width="60%" class="rounded-xl" />
            <Skeleton height="1rem" width="30%" class="rounded-xl" />
            <Skeleton height="12rem" class="rounded-xl mt-6" />
        </div>

        <template v-else-if="post">
            <!-- Header -->
            <div class="flex items-start justify-between mb-7 gap-4">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-2">
                        <NuxtLink to="/admin-panel/posts"
                            class="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">
                            <Icon name="lucide:arrow-left" class="text-sm" /> All Posts
                        </NuxtLink>
                    </div>
                    <div class="flex items-center gap-3 flex-wrap">
                        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ post.title }}</h1>
                        <span :class="['badge flex-shrink-0', post.is_published !== false ? 'badge-green' : 'badge-gray']">
                            {{ post.is_published !== false ? 'Published' : 'Draft' }}
                        </span>
                    </div>
                    <p class="text-gray-400 text-sm mt-1">
                        By <span class="font-medium text-gray-600">{{ authorName }}</span>
                        · {{ formatDate(post.createdAt) }}
                        <span v-if="post.updatedAt !== post.createdAt" class="ml-2">· Edited {{ timeAgo(post.updatedAt) }}</span>
                    </p>
                </div>

                <!-- Read-only badge for admin -->
                <span class="badge badge-gray flex-shrink-0">Read-only</span>
            </div>

            <!-- Tags -->
            <div v-if="post.tags?.length" class="flex flex-wrap gap-1.5 mb-5">
                <span v-for="tag in post.tags" :key="tag" class="badge badge-blue">{{ tag }}</span>
            </div>

            <!-- Content card -->
            <div class="card">
                <p class="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{{ post.content }}</p>
            </div>

            <!-- Author / meta footer -->
            <div class="mt-5 card !py-3 flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {{ authorInitial }}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900 truncate">{{ authorName }}</p>
                    <p class="text-xs text-gray-400 truncate">{{ authorEmail }}</p>
                </div>
                <div class="text-right">
                    <p class="text-xs text-gray-400">{{ formatDate(post.createdAt, 'MMM d, yyyy · h:mm a') }}</p>
                    <p class="text-xs text-gray-300 mt-0.5">Post ID: {{ post._id }}</p>
                </div>
            </div>
        </template>
    </div>
</template>
