<script setup lang="ts">
useHead({ title: 'All Notes — Admin' });
definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

const { adminGetAllNotes } = useNotesApi();
const toast = useToast();

const notes = ref<any[]>([]);
const meta = ref<any>(null);
const isLoading = ref(false);
const search = ref('');
const page = ref(1);
const perPage = 12;

async function fetchNotes() {
    isLoading.value = true;
    try {
        const res: any = await adminGetAllNotes({ page: page.value, per_page: perPage, search: search.value });
        notes.value = res?.data?.data || [];
        meta.value = res?.data?.meta || null;
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load notes', life: 3000 });
    } finally {
        isLoading.value = false;
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
                <div class="flex items-center gap-2 text-xs text-gray-400 font-medium mb-1">
                    <Icon name="lucide:file-text" class="text-sm" /> Notes
                </div>
                <h1 class="text-2xl font-bold text-gray-900 tracking-tight">All Notes</h1>
                <p class="text-gray-500 text-sm mt-0.5">Read-only view of all user notes</p>
            </div>
            <span v-if="meta" class="badge badge-gray text-sm px-3 py-1">{{ meta.total }} total</span>
        </div>

        <!-- Search -->
        <div class="mb-5">
            <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="search" placeholder="Search notes..." class="w-full !rounded-xl" />
            </IconField>
        </div>

        <!-- Grid -->
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton v-for="i in 9" :key="i" height="11rem" class="rounded-2xl" />
        </div>

        <div v-else-if="notes.length === 0" class="empty-state">
            <div class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon name="lucide:file-text" class="text-gray-400" style="font-size:1.5rem" />
            </div>
            <p class="text-sm font-medium text-gray-500">No notes found</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="note in notes" :key="note._id" class="card group flex flex-col"
                :class="note.is_pinned ? 'ring-1 ring-emerald-200' : ''">
                <div v-if="note.is_pinned"
                    class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-t-2xl" />
                <div class="flex items-start justify-between mb-2">
                    <h3 class="font-semibold text-gray-900 text-sm flex-1 pr-2 truncate">{{ note.title }}</h3>
                    <span v-if="note.is_pinned" class="badge badge-emerald flex-shrink-0">Pinned</span>
                </div>
                <p class="text-xs text-gray-500 line-clamp-3 mb-3 flex-1">{{ note.content }}</p>
                <div class="flex flex-wrap gap-1 mb-3">
                    <span v-for="tag in note.tags" :key="tag" class="badge badge-emerald">{{ tag }}</span>
                </div>
                <div class="pt-2 border-t border-gray-100 flex items-center gap-2">
                    <div
                        class="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {{ note.userId?.name?.charAt(0)?.toUpperCase() || '?' }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-semibold text-gray-700 truncate">{{ note.userId?.name || 'Unknown' }}</p>
                        <p class="text-xs text-gray-400 truncate">{{ note.userId?.email }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="meta && meta.last_page > 1" class="flex justify-center mt-6">
            <Paginator :rows="perPage" :totalRecords="meta.total" :first="(meta.current_page - 1) * perPage"
                @page="(e: any) => { page = e.page + 1; fetchNotes(); }" />
        </div>
    </div>
</template>
