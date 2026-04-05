<script setup lang="ts">
useHead({ title: 'Note — NoteApp' });
definePageMeta({ middleware: ['auth-user'], layout: 'user' });

import { formatDate, timeAgo } from '~/utils/helpers';

const route = useRoute();
const router = useRouter();
const { getNote, updateNote, deleteNote } = useNotesApi();
const { can, loadPermissions } = usePermissions();
const toast = useToast();

const note = ref<any>(null);
const isLoading = ref(true);

// Edit modal
const showModal = ref(false);
const isSaving = ref(false);
const form = reactive({ title: '', content: '', tags: '', is_pinned: false });

// Delete confirm modal
const showConfirmModal = ref(false);
const isDeleting = ref(false);

// Response modal
const responseModal = ref<{ status?: boolean; message?: string } | null>(null);

async function loadNote() {
    isLoading.value = true;
    try {
        const res: any = await getNote(route.params.id as string);
        note.value = res?.data;
        useHead({ title: `${note.value?.title || 'Note'} — NoteApp` });
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.data?.message || 'Note not found', life: 3000 });
        router.push('/user-panel/notes');
    } finally {
        isLoading.value = false;
    }
}

function openEdit() {
    Object.assign(form, {
        title: note.value.title,
        content: note.value.content,
        tags: note.value.tags?.join(', ') || '',
        is_pinned: note.value.is_pinned,
    });
    showModal.value = true;
}

async function saveNote() {
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
            is_pinned: form.is_pinned,
        };
        await updateNote(note.value._id, payload);
        responseModal.value = { status: true, message: 'Note updated successfully' };
        showModal.value = false;
        await loadNote();
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.data?.message || 'Failed to save', life: 3000 });
    } finally {
        isSaving.value = false;
    }
}

async function confirmDelete() {
    isDeleting.value = true;
    try {
        await deleteNote(note.value._id);
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Note deleted', life: 2000 });
        router.push('/user-panel/notes');
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.data?.message || 'Failed to delete', life: 3000 });
    } finally {
        isDeleting.value = false;
    }
}

onMounted(async () => {
    await loadPermissions();
    await loadNote();
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

        <template v-else-if="note">
            <!-- Header -->
            <div class="flex items-start justify-between mb-7 gap-4">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-2">
                        <NuxtLink to="/user-panel/notes"
                            class="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">
                            <Icon name="lucide:arrow-left" class="text-sm" /> Notes
                        </NuxtLink>
                    </div>
                    <div class="flex items-center gap-3 flex-wrap">
                        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ note.title }}</h1>
                        <span v-if="note.is_pinned" class="badge badge-emerald flex items-center gap-1">
                            <Icon name="lucide:pin" class="text-xs" /> Pinned
                        </span>
                    </div>
                    <p class="text-gray-400 text-sm mt-1">
                        Created {{ formatDate(note.createdAt) }}
                        <span v-if="note.updatedAt !== note.createdAt" class="ml-2 text-gray-300">·</span>
                        <span v-if="note.updatedAt !== note.createdAt" class="ml-2">Updated {{ timeAgo(note.updatedAt) }}</span>
                    </p>
                </div>

                <div v-if="can('notes.update') || can('notes.delete')" class="flex gap-1.5 flex-shrink-0">
                    <button v-if="can('notes.update')" @click="openEdit" class="action-btn-edit" title="Edit note">
                        <Icon name="lucide:pencil" class="text-xs" />
                    </button>
                    <button v-if="can('notes.delete')" @click="showConfirmModal = true" class="action-btn-delete" title="Delete note">
                        <Icon name="lucide:trash-2" class="text-xs" />
                    </button>
                </div>
            </div>

            <!-- Tags -->
            <div v-if="note.tags?.length" class="flex flex-wrap gap-1.5 mb-5">
                <span v-for="tag in note.tags" :key="tag" class="badge badge-gray">{{ tag }}</span>
            </div>

            <!-- Content card -->
            <div class="card" :class="note.is_pinned ? 'ring-1 ring-emerald-200 relative overflow-hidden' : ''">
                <div v-if="note.is_pinned"
                    class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400" />
                <p class="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{{ note.content }}</p>
            </div>

            <!-- Meta footer -->
            <div class="mt-5 flex items-center gap-4 text-xs text-gray-400">
                <span class="flex items-center gap-1.5">
                    <Icon name="lucide:calendar" class="text-xs" />
                    {{ formatDate(note.createdAt, 'MMM d, yyyy · h:mm a') }}
                </span>
                <span v-if="note.tags?.length" class="flex items-center gap-1.5">
                    <Icon name="lucide:tag" class="text-xs" />
                    {{ note.tags.length }} tag{{ note.tags.length !== 1 ? 's' : '' }}
                </span>
            </div>
        </template>

        <!-- Edit Modal -->
        <Dialog v-model:visible="showModal" header="Edit Note" modal class="w-full max-w-lg">
            <div class="space-y-4 pt-2">
                <div>
                    <label class="form-label">Title <span class="text-red-500">*</span></label>
                    <InputText v-model="form.title" class="form-input" placeholder="Note title" />
                </div>
                <div>
                    <label class="form-label">Content <span class="text-red-500">*</span></label>
                    <Textarea v-model="form.content" class="form-input w-full" rows="7" placeholder="Write your note..." />
                </div>
                <div>
                    <label class="form-label">Tags <span class="text-gray-400 font-normal">(comma-separated)</span></label>
                    <InputText v-model="form.tags" class="form-input" placeholder="work, personal, ideas" />
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox v-model="form.is_pinned" inputId="pinEdit" binary />
                    <label for="pinEdit" class="text-sm font-medium text-gray-700 cursor-pointer">Pin this note</label>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" text @click="showModal = false" />
                <Button label="Update" :loading="isSaving" @click="saveNote" />
            </template>
        </Dialog>

        <!-- Confirm Delete Modal -->
        <ConfirmModal v-model:isOpenConModal="showConfirmModal" :title="`Delete '${note?.title}'?`"
            message="This action cannot be undone." @confirm="confirmDelete" />

        <!-- Response Modal -->
        <ResponseModal :response_modal="responseModal" />
    </div>
</template>
