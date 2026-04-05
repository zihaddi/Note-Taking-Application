<script setup lang="ts">
useHead({ title: 'Note Detail — Admin' });
definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

import { formatDate, timeAgo } from '~/utils/helpers';

const route = useRoute();
const router = useRouter();
const { adminGetNote } = useNotesApi();
const toast = useToast();

const note = ref<any>(null);
const isLoading = ref(true);

async function loadNote() {
    isLoading.value = true;
    try {
        const res: any = await adminGetNote(route.params.id as string);
        note.value = res?.data;
        useHead({ title: `${note.value?.title || 'Note'} — Admin` });
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.data?.message || 'Note not found', life: 3000 });
        router.push('/admin-panel/notes');
    } finally {
        isLoading.value = false;
    }
}

onMounted(loadNote);
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
                        <NuxtLink to="/admin-panel/notes"
                            class="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">
                            <Icon name="lucide:arrow-left" class="text-sm" /> All Notes
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
                        <span v-if="note.updatedAt !== note.createdAt" class="ml-2">· Updated {{ timeAgo(note.updatedAt) }}</span>
                    </p>
                </div>

                <!-- Read-only badge for admin -->
                <span class="badge badge-gray flex-shrink-0">Read-only</span>
            </div>

            <!-- Tags -->
            <div v-if="note.tags?.length" class="flex flex-wrap gap-1.5 mb-5">
                <span v-for="tag in note.tags" :key="tag" class="badge badge-emerald">{{ tag }}</span>
            </div>

            <!-- Content card -->
            <div class="card" :class="note.is_pinned ? 'ring-1 ring-emerald-200 relative overflow-hidden' : ''">
                <div v-if="note.is_pinned"
                    class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400" />
                <p class="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{{ note.content }}</p>
            </div>

            <!-- Author / meta footer -->
            <div class="mt-5 card !py-3 flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {{ note.userId?.name?.charAt(0)?.toUpperCase() || '?' }}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900 truncate">{{ note.userId?.name || 'Unknown User' }}</p>
                    <p class="text-xs text-gray-400 truncate">{{ note.userId?.email }}</p>
                </div>
                <div class="text-right">
                    <p class="text-xs text-gray-400">{{ formatDate(note.createdAt, 'MMM d, yyyy · h:mm a') }}</p>
                    <p class="text-xs text-gray-300 mt-0.5">Note ID: {{ note._id }}</p>
                </div>
            </div>
        </template>
    </div>
</template>
