<script setup lang="ts">
useHead({ title: 'Post — NoteApp' });
definePageMeta({ middleware: ['auth-user'], layout: 'user' });

import { formatDate, timeAgo } from '~/utils/helpers';

const route = useRoute();
const router = useRouter();
const { getPost, updatePost, deletePost } = usePostsApi();
const { can, loadPermissions } = usePermissions();
const { user } = useAuth();
const toast = useToast();

const post = ref<any>(null);
const isLoading = ref(true);

// Edit modal
const showModal = ref(false);
const isSaving = ref(false);
const form = reactive({ title: '', content: '', tags: '', is_published: true });

// Delete confirm modal
const showConfirmModal = ref(false);

// Response modal
const responseModal = ref<{ status?: boolean; message?: string } | null>(null);

const isOwner = computed(() => {
    if (!post.value || !user.value) return false;
    const authorId = typeof post.value.userId === 'object' ? post.value.userId?._id : post.value.userId;
    return authorId === user.value._id;
});

async function loadPost() {
    isLoading.value = true;
    try {
        const res: any = await getPost(route.params.id as string);
        post.value = res?.data;
        useHead({ title: `${post.value?.title || 'Post'} — NoteApp` });
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.data?.message || 'Post not found', life: 3000 });
        router.push('/user-panel/posts');
    } finally {
        isLoading.value = false;
    }
}

function openEdit() {
    Object.assign(form, {
        title: post.value.title,
        content: post.value.content,
        tags: post.value.tags?.join(', ') || '',
        is_published: post.value.is_published,
    });
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
        await updatePost(post.value._id, payload);
        responseModal.value = { status: true, message: 'Post updated successfully' };
        showModal.value = false;
        await loadPost();
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.data?.message || 'Failed to save', life: 3000 });
    } finally {
        isSaving.value = false;
    }
}

async function confirmDelete() {
    try {
        await deletePost(post.value._id);
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Post deleted', life: 2000 });
        router.push('/user-panel/posts');
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.data?.message || 'Failed to delete', life: 3000 });
    }
}

const authorInitial = computed(() => {
    const name = typeof post.value?.userId === 'object' ? post.value.userId?.name : null;
    return name?.charAt(0)?.toUpperCase() || '?';
});

const authorName = computed(() => {
    return typeof post.value?.userId === 'object' ? post.value.userId?.name : 'Unknown';
});

onMounted(async () => {
    await loadPermissions();
    await loadPost();
});
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
                        <NuxtLink to="/user-panel/posts"
                            class="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">
                            <Icon name="lucide:arrow-left" class="text-sm" /> Posts
                        </NuxtLink>
                    </div>
                    <div class="flex items-center gap-3 flex-wrap">
                        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ post.title }}</h1>
                        <span :class="['badge flex-shrink-0', post.is_published !== false ? 'badge-green' : 'badge-gray']">
                            {{ post.is_published !== false ? 'Published' : 'Draft' }}
                        </span>
                    </div>
                    <p class="text-gray-400 text-sm mt-1">
                        <span class="font-medium text-gray-600">{{ authorName }}</span>
                        · {{ formatDate(post.createdAt) }}
                        <span v-if="post.updatedAt !== post.createdAt" class="ml-2">· Edited {{ timeAgo(post.updatedAt) }}</span>
                    </p>
                </div>

                <div v-if="isOwner && (can('posts.update') || can('posts.delete'))" class="flex gap-1.5 flex-shrink-0">
                    <button v-if="can('posts.update')" @click="openEdit" class="action-btn-edit" title="Edit post">
                        <Icon name="lucide:pencil" class="text-xs" />
                    </button>
                    <button v-if="can('posts.delete')" @click="showConfirmModal = true" class="action-btn-delete" title="Delete post">
                        <Icon name="lucide:trash-2" class="text-xs" />
                    </button>
                </div>
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
                    <p class="text-xs text-gray-400">{{ formatDate(post.createdAt, 'MMM d, yyyy · h:mm a') }}</p>
                </div>
                <span v-if="isOwner" class="badge badge-emerald text-xs">Your post</span>
            </div>
        </template>

        <!-- Edit Modal -->
        <Dialog v-model:visible="showModal" header="Edit Post" modal class="w-full max-w-lg">
            <div class="space-y-4 pt-2">
                <div>
                    <label class="form-label">Title <span class="text-red-500">*</span></label>
                    <InputText v-model="form.title" class="form-input" />
                </div>
                <div>
                    <label class="form-label">Content <span class="text-red-500">*</span></label>
                    <Textarea v-model="form.content" class="form-input w-full" rows="7" />
                </div>
                <div>
                    <label class="form-label">Tags <span class="text-gray-400 font-normal">(comma-separated)</span></label>
                    <InputText v-model="form.tags" class="form-input" />
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox v-model="form.is_published" inputId="pubEdit" binary />
                    <label for="pubEdit" class="text-sm font-medium text-gray-700 cursor-pointer">Published</label>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" text @click="showModal = false" />
                <Button label="Update" :loading="isSaving" @click="savePost" />
            </template>
        </Dialog>

        <!-- Confirm Delete Modal -->
        <ConfirmModal v-model:isOpenConModal="showConfirmModal" :title="`Delete '${post?.title}'?`"
            message="This action cannot be undone." @confirm="confirmDelete" />

        <!-- Response Modal -->
        <ResponseModal :response_modal="responseModal" />
    </div>
</template>
