<script setup lang="ts">
useHead({ title: 'User Posts — Admin' });
definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

const route = useRoute();
const { getUserWithPosts } = useUsersApi();
const toast = useToast();

const userId = computed(() => route.params.id as string);
const data = ref<any>(null);
const isLoading = ref(true);

async function loadData() {
    isLoading.value = true;
    try {
        const res: any = await getUserWithPosts(userId.value);
        data.value = res?.data || null;
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load user posts', life: 3000 });
    } finally {
        isLoading.value = false;
    }
}

onMounted(loadData);
</script>

<template>
    <div>
        <Toast />

        <!-- Back nav + title -->
        <div class="flex items-center gap-3 mb-6">
            <NuxtLink to="/admin-panel/users"
                class="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
                <Icon name="lucide:arrow-left" class="text-sm" />
            </NuxtLink>
            <div>
                <p class="text-xs text-gray-400 font-medium">User Management</p>
                <h1 class="text-2xl font-bold text-gray-900 tracking-tight">
                    {{ data?.name || 'User' }}'s Posts
                </h1>
            </div>
        </div>

        <div v-if="isLoading" class="space-y-3">
            <Skeleton height="6rem" class="rounded-2xl" />
            <Skeleton v-for="i in 4" :key="i" height="5rem" class="rounded-2xl" />
        </div>

        <template v-else-if="data">
            <!-- User info card -->
            <div class="card mb-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100">
                <div class="flex items-center gap-4">
                    <div
                        class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-xl shadow flex-shrink-0">
                        {{ data.name?.charAt(0)?.toUpperCase() }}
                    </div>
                    <div class="flex-1">
                        <p class="font-bold text-gray-900">{{ data.name }}</p>
                        <p class="text-sm text-gray-500">{{ data.email }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <div
                            class="w-10 h-10 rounded-xl bg-white border border-emerald-100 flex flex-col items-center justify-center shadow-sm">
                            <span class="text-sm font-extrabold text-emerald-700">{{ data.posts?.length || 0 }}</span>
                            <span class="text-xs text-gray-400 leading-none">posts</span>
                        </div>
                    </div>
                </div>
                <p class="text-xs text-gray-400 mt-3 italic">Fetched via MongoDB <code
                        class="bg-white/80 px-1 rounded">$lookup</code> aggregation</p>
            </div>

            <!-- Posts -->
            <div v-if="!data.posts?.length" class="empty-state">
                <div class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Icon name="lucide:newspaper" class="text-gray-400" style="font-size:1.5rem" />
                </div>
                <p class="text-sm font-medium text-gray-500">No posts yet</p>
            </div>

            <div v-else class="space-y-3">
                <div v-for="post in data.posts" :key="post._id" class="card">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1 min-w-0">
                            <h3 class="font-semibold text-gray-900 mb-1 truncate">{{ post.title }}</h3>
                            <p class="text-sm text-gray-500 line-clamp-2">{{ post.content }}</p>
                            <div class="mt-2 flex flex-wrap gap-1">
                                <span v-for="tag in post.tags" :key="tag" class="badge badge-blue">{{ tag }}</span>
                            </div>
                        </div>
                        <span :class="['badge flex-shrink-0', post.is_published ? 'badge-green' : 'badge-gray']">
                            {{ post.is_published ? 'Published' : 'Draft' }}
                        </span>
                    </div>
                </div>
            </div>
        </template>

        <div v-else class="empty-state">
            <p class="text-sm font-medium text-gray-500">User not found.</p>
        </div>
    </div>
</template>
