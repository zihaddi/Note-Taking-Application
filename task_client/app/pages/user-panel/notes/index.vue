<script setup lang="ts">
useHead({ title: 'My Notes — NoteApp' });
definePageMeta({ middleware: ['auth-user'], layout: 'user' });

import { timeAgo } from '~/utils/helpers';

const { getUserNotes, createNote, updateNote, deleteNote } = useNotesApi();
const toast = useToast();

// List state
const notes = ref<any[]>([]);
const meta = ref<any>(null);
const isLoading = ref(false);
const search = ref('');
const page = ref(1);
const perPage = 10;

// Modal state
const showModal = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const currentNote = ref<any | null>(null);
const form = reactive({ title: '', content: '', tags: '', is_pinned: false });

// Confirm delete modal
const showConfirmModal = ref(false);
const deleteTarget = ref<any | null>(null);

// Response modal
const responseModal = ref<{ status?: boolean; message?: string } | null>(null);

async function fetchNotes() {
    isLoading.value = true;
    try {
        const res: any = await getUserNotes({ page: page.value, per_page: perPage, search: search.value });
        notes.value = res?.data?.data || [];
        meta.value = res?.data?.meta || null;
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.data?.message || 'Failed to load notes', life: 3000 });
    } finally {
        isLoading.value = false;
    }
}

function openCreate() {
    isEditing.value = false;
    currentNote.value = null;
    Object.assign(form, { title: '', content: '', tags: '', is_pinned: false });
    showModal.value = true;
}

function openEdit(note: any) {
    isEditing.value = true;
    currentNote.value = note;
    Object.assign(form, { title: note.title, content: note.content, tags: note.tags?.join(', ') || '', is_pinned: note.is_pinned });
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

        if (isEditing.value && currentNote.value) {
            await updateNote(currentNote.value._id, payload);
            responseModal.value = { status: true, message: 'Note updated successfully' };
        } else {
            await createNote(payload);
            responseModal.value = { status: true, message: 'Note created successfully' };
        }
        showModal.value = false;
        await fetchNotes();
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.data?.message || 'Failed to save note', life: 3000 });
    } finally {
        isSaving.value = false;
    }
}

async function handleDelete(note: any) {
    deleteTarget.value = note;
    showConfirmModal.value = true;
}

async function confirmDelete() {
    if (!deleteTarget.value) return;
    isDeleting.value = true;
    try {
        await deleteNote(deleteTarget.value._id);
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Note deleted', life: 2000 });
        await fetchNotes();
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.data?.message || 'Failed to delete', life: 3000 });
    } finally {
        isDeleting.value = false;
        deleteTarget.value = null;
    }
}

let searchTimer: ReturnType<typeof setTimeout>;
watch(search, () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { page.value = 1; fetchNotes(); }, 400);
});
onMounted(fetchNotes);
</script>

<template>
    <div>
        <Toast />

        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 tracking-tight">My Notes</h1>
                <p class="text-gray-500 text-sm mt-0.5" v-if="meta">{{ meta.total }} notes total</p>
            </div>
            <Button label="New Note" icon="pi pi-plus" @click="openCreate" class="!rounded-xl" />
        </div>

        <!-- Search -->
        <div class="mb-5">
            <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="search" placeholder="Search notes..." class="w-full !rounded-xl" />
            </IconField>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton v-for="i in 6" :key="i" height="11rem" class="rounded-2xl" />
        </div>

        <!-- Empty -->
        <div v-else-if="notes.length === 0" class="empty-state">
            <div class="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon name="lucide:file-plus" class="text-emerald-400" style="font-size:1.75rem" />
            </div>
            <p class="text-base font-semibold text-gray-600">No notes found</p>
            <p class="text-sm text-gray-400 mt-1">Start by creating your first note!</p>
        </div>

        <!-- Notes grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="note in notes" :key="note._id" class="card group relative cursor-pointer flex flex-col"
                :class="note.is_pinned ? 'ring-1 ring-emerald-200 ring-offset-0' : ''">
                <!-- Pinned band -->
                <div v-if="note.is_pinned"
                    class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-t-2xl" />
                <div class="flex items-start justify-between mb-2">
                    <h3 class="font-semibold text-gray-900 text-sm pr-2 truncate flex-1">{{ note.title }}</h3>
                    <div class="flex items-center gap-1 flex-shrink-0">
                        <span v-if="note.is_pinned"
                            class="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <Icon name="lucide:pin" class="text-xs" /> Pinned
                        </span>
                    </div>
                </div>
                <p class="text-xs text-gray-500 line-clamp-3 mb-3 flex-1">{{ note.content }}</p>
                <div class="flex flex-wrap gap-1 mb-3">
                    <span v-for="tag in note.tags" :key="tag" class="badge badge-gray">{{ tag }}</span>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span class="text-xs text-gray-400">{{ timeAgo(note.createdAt) }}</span>
                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button @click.stop="openEdit(note)"
                            class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-gray-500 transition-colors">
                            <Icon name="lucide:pencil" class="text-xs" />
                        </button>
                        <button @click.stop="handleDelete(note)"
                            class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-gray-500 transition-colors">
                            <Icon name="lucide:trash-2" class="text-xs" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="meta && meta.last_page > 1" class="flex justify-center mt-6">
            <Paginator :rows="perPage" :totalRecords="meta.total" :first="(meta.current_page - 1) * perPage"
                @page="(e: any) => { page = e.page + 1; fetchNotes(); }" />
        </div>

        <!-- Create/Edit Modal -->
        <Dialog v-model:visible="showModal" :header="isEditing ? 'Edit Note' : 'New Note'" modal
            class="w-full max-w-lg">
            <div class="space-y-4 pt-2">
                <div>
                    <label class="form-label">Title <span class="text-red-500">*</span></label>
                    <InputText v-model="form.title" class="form-input" placeholder="Note title" />
                </div>
                <div>
                    <label class="form-label">Content <span class="text-red-500">*</span></label>
                    <Textarea v-model="form.content" class="form-input w-full" rows="5"
                        placeholder="Write your note..." />
                </div>
                <div>
                    <label class="form-label">Tags <span
                            class="text-gray-400 font-normal">(comma-separated)</span></label>
                    <InputText v-model="form.tags" class="form-input" placeholder="work, personal, ideas" />
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox v-model="form.is_pinned" inputId="pin" binary />
                    <label for="pin" class="text-sm font-medium text-gray-700 cursor-pointer">Pin this note</label>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" text @click="showModal = false" />
                <Button :label="isEditing ? 'Update' : 'Create'" :loading="isSaving" @click="saveNote" />
            </template>
        </Dialog>

        <!-- Confirm Delete Modal -->
        <ConfirmModal v-model:isOpenConModal="showConfirmModal" :title="`Delete '${deleteTarget?.title}'?`"
            message="This action cannot be undone." @confirm="confirmDelete" />

        <!-- Response Modal -->
        <ResponseModal :response_modal="responseModal" />
    </div>
</template>
