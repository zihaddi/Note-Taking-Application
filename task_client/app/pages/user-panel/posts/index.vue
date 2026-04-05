<script setup lang="ts">
useHead({ title: 'Posts — NoteApp' });
definePageMeta({ middleware: ['auth-user'], layout: 'user' });

import { timeAgo } from '~/utils/helpers';

const { getPublicPosts, getMyPosts, createPost, updatePost, deletePost } = usePostsApi();
const toast = useToast();

const activeTab = ref<'all' | 'mine'>('all');
const posts = ref<any[]>([]);
const meta = ref<any>(null);
const isLoading = ref(false);
const search = ref('');
const page = ref(1);
const perPage = 10;

const showModal = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const currentPost = ref<any | null>(null);
const form = reactive({ title: '', content: '', tags: '', is_published: true });

// Confirm delete modal
const showConfirmModal = ref(false);
const deleteTarget = ref<any | null>(null);

// Response modal
const responseModal = ref<{ status?: boolean; message?: string } | null>(null);

async function fetchPosts() {
    isLoading.value = true;
    try {
        const params = { page: page.value, per_page: perPage, search: search.value };
        const res: any = activeTab.value === 'all'
            ? await getPublicPosts(params)
            : await getMyPosts(params);
        posts.value = res?.data?.data || [];
        meta.value = res?.data?.meta || null;
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load posts', life: 3000 });
    } finally {
        isLoading.value = false;
    }
}

watch(activeTab, () => { page.value = 1; fetchPosts(); });

function openCreate() {
    isEditing.value = false;
    currentPost.value = null;
    Object.assign(form, { title: '', content: '', tags: '', is_published: true });
    showModal.value = true;
}

function openEdit(post: any) {
    isEditing.value = true;
    currentPost.value = post;
    Object.assign(form, { title: post.title, content: post.content, tags: post.tags?.join(', ') || '', is_published: post.is_published });
    showModal.value = true;
}

async function savePost() {
    if (!form.title || !form.content) {
        toast.add({ severity: 'warn', summary: 'Validation', detail: 'Title and content are required', life: 3000 });
        return;
    }
    isSaving.value = true;
    try {
        const payload = {
            title: form.title,
            content: form.content,
            tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
            is_published: form.is_published,
        };
        if (isEditing.value && currentPost.value) {
            await updatePost(currentPost.value._id, payload);
            responseModal.value = { status: true, message: 'Post updated successfully' };
        } else {
            await createPost(payload);
            responseModal.value = { status: true, message: 'Post published successfully' };
        }
        showModal.value = false;
        await fetchPosts();
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.data?.message || 'Failed to save post', life: 3000 });
    } finally {
        isSaving.value = false;
    }
}

async function handleDelete(post: any) {
    deleteTarget.value = post;
    showConfirmModal.value = true;
}

async function confirmDelete() {
    if (!deleteTarget.value) return;
    try {
        await deletePost(deleteTarget.value._id);
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Post deleted', life: 2000 });
        fetchPosts();
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.data?.message || 'Failed to delete', life: 3000 });
    } finally {
        deleteTarget.value = null;
    }
}

onMounted(fetchPosts);
</script>

<template>
    <div>
        <Toast />
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Posts</h1>
                <p class="text-gray-500 text-sm mt-0.5" v-if="meta">{{ meta.total }} posts total</p>
            </div>
            <Button label="New Post" icon="pi pi-plus" @click="openCreate" class="!rounded-xl" />
        </div>

        <!-- Search -->
        <div class="mb-5">
            <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="search" placeholder="Search posts..." class="w-full !rounded-xl" />
            </IconField>
        </div>

        <!-- Tabs -->
        <!-- Tabs -->
        <div class="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
            <button v-for="tab in [{ key: 'all', label: 'All Posts' }, { key: 'mine', label: 'My Posts' }]"
                :key="tab.key" @click="activeTab = tab.key as any"
                :class="['px-4 py-2 text-sm font-semibold rounded-lg transition-all', activeTab === tab.key ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700']">
                {{ tab.label }}
            </button>
        </div>

        <!-- Posts list -->
        <div v-if="isLoading" class="space-y-3">
            <Skeleton v-for="i in 5" :key="i" height="6rem" class="rounded-2xl" />
        </div>

        <div v-else-if="posts.length === 0" class="empty-state">
            <div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon name="lucide:newspaper" class="text-blue-400" style="font-size:1.75rem" />
            </div>
            <p class="text-base font-semibold text-gray-600">No posts found</p>
        </div>

        <div v-else class="space-y-3">
            <div v-for="post in posts" :key="post._id" class="card group">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1.5">
                            <h3 class="font-semibold text-gray-900 truncate">{{ post.title }}</h3>
                            <span
                                :class="['badge flex-shrink-0', post.is_published !== false ? 'badge-green' : 'badge-gray']">{{
                                    post.is_published !== false ? 'Published' : 'Draft' }}</span>
                        </div>
                        <p class="text-sm text-gray-500 line-clamp-2 mb-2">{{ post.content }}</p>
                        <div class="flex flex-wrap gap-1">
                            <span v-for="tag in post.tags" :key="tag" class="badge badge-blue">{{ tag }}</span>
                        </div>
                    </div>
                    <div v-if="activeTab === 'mine'" class="flex gap-1 flex-shrink-0">
                        <button @click="openEdit(post)"
                            class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-gray-500 transition-colors">
                            <Icon name="lucide:pencil" class="text-xs" />
                        </button>
                        <button @click="handleDelete(post)"
                            class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-gray-500 transition-colors">
                            <Icon name="lucide:trash-2" class="text-xs" />
                        </button>
                    </div>
                </div>
                <div class="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div
                            class="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                            {{ post.userId?.name?.charAt(0)?.toUpperCase() || '?' }}</div>
                        <span class="text-xs text-gray-500 font-medium">{{ post.userId?.name || 'Unknown' }}</span>
                    </div>
                    <span class="text-xs text-gray-400">{{ timeAgo(post.createdAt) }}</span>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="meta && meta.last_page > 1" class="flex justify-center mt-6">
            <Paginator :rows="perPage" :totalRecords="meta.total" :first="(meta.current_page - 1) * perPage"
                @page="(e: any) => { page = e.page + 1; fetchPosts(); }" />
        </div>

        <!-- Create/Edit Modal -->
        <Dialog v-model:visible="showModal" :header="isEditing ? 'Edit Post' : 'New Post'" modal
            class="w-full max-w-lg">
            <div class="space-y-4 pt-2">
                <div>
                    <label class="form-label">Title <span class="text-red-500">*</span></label>
                    <InputText v-model="form.title" class="form-input" />
                </div>
                <div>
                    <label class="form-label">Content <span class="text-red-500">*</span></label>
                    <Textarea v-model="form.content" class="form-input w-full" rows="5" />
                </div>
                <div>
                    <label class="form-label">Tags <span
                            class="text-gray-400 font-normal">(comma-separated)</span></label>
                    <InputText v-model="form.tags" class="form-input" />
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox v-model="form.is_published" inputId="pub" binary />
                    <label for="pub" class="text-sm font-medium text-gray-700 cursor-pointer">Publish
                        immediately</label>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" text @click="showModal = false" />
                <Button :label="isEditing ? 'Update' : 'Publish'" :loading="isSaving" @click="savePost" />
            </template>
        </Dialog>

        <!-- Confirm Delete Modal -->
        <ConfirmModal v-model:isOpenConModal="showConfirmModal" :title="`Delete '${deleteTarget?.title}'?`"
            message="This action cannot be undone." @confirm="confirmDelete" />

        <!-- Response Modal -->
        <ResponseModal :response_modal="responseModal" />
    </div>
</template>
