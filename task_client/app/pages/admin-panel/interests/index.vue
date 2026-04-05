<script setup lang="ts">
useHead({ title: 'Group by Interests — Admin' });
definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

const { getUsersGroupedByInterests } = useUsersApi();
const toast = useToast();

const groups = ref<any[]>([]);
const isLoading = ref(true);

async function loadGroups() {
    isLoading.value = true;
    try {
        const res: any = await getUsersGroupedByInterests();
        groups.value = res?.data || [];
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load interest groups', life: 3000 });
    } finally {
        isLoading.value = false;
    }
}

onMounted(loadGroups);
</script>

<template>
    <div>
        <Toast />

        <!-- Header -->
        <div class="mb-7">
            <div class="flex items-center gap-2 text-xs text-gray-400 font-medium mb-1">
                <Icon name="lucide:tag" class="text-sm" /> Analytics
            </div>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Users by Interest</h1>
            <p class="text-gray-500 text-sm mt-1">
                MongoDB aggregation —
                <code class="bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded font-mono">$unwind</code> +
                <code class="bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded font-mono">$group</code>
                pipeline via a single
                <code
                    class="bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded font-mono">collection.aggregate()</code>
                call
            </p>
        </div>

        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton v-for="i in 6" :key="i" height="10rem" class="rounded-2xl" />
        </div>

        <div v-else-if="groups.length === 0" class="empty-state">
            <div class="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon name="lucide:tag" class="text-gray-400" style="font-size:1.75rem" />
            </div>
            <p class="text-base font-semibold text-gray-600">No interest groups found</p>
            <p class="text-sm text-gray-400 mt-1">Users need to add interests to their profiles.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="group in groups" :key="group.interest" class="card-hover">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                        <div
                            class="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                            <Icon name="lucide:tag" class="text-white text-sm" />
                        </div>
                        <h3 class="font-bold text-gray-900 capitalize">{{ group.interest }}</h3>
                    </div>
                    <span class="badge badge-emerald font-bold">
                        {{ group.count }} {{ group.count === 1 ? 'user' : 'users' }}
                    </span>
                </div>

                <div class="flex flex-wrap gap-1.5">
                    <span v-for="user in group.users" :key="user._id"
                        class="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs px-2.5 py-1.5 rounded-full border border-blue-100 font-medium"
                        v-tooltip="user.email">
                        <span
                            class="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{{
                                user.name?.charAt(0)?.toUpperCase() }}</span>
                        {{ user.name }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>
