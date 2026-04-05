<script setup lang="ts">
useHead({ title: 'User Management — Admin' });
definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

const { getUsers, createUser, updateUser, deleteUser } = useUsersApi();
const toast = useToast();

const users = ref<any[]>([]);
const meta = ref<any>(null);
const isLoading = ref(false);
const search = ref('');
const page = ref(1);
const perPage = 10;

const showModal = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const currentUser = ref<any | null>(null);
const form = reactive({ name: '', email: '', password: '', role: 'user', status: 'active', phone: '', bio: '' });

// Confirm delete modal
const showConfirmModal = ref(false);
const deleteTarget = ref<any | null>(null);

// Response modal
const responseModal = ref<{ status?: boolean; message?: string } | null>(null);

async function fetchUsers() {
    isLoading.value = true;
    try {
        const res: any = await getUsers({ page: page.value, per_page: perPage, search: search.value });
        users.value = res?.data?.data || [];
        meta.value = res?.data?.meta || null;
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users', life: 3000 });
    } finally {
        isLoading.value = false;
    }
}

function openCreate() {
    isEditing.value = false;
    currentUser.value = null;
    Object.assign(form, { name: '', email: '', password: '', role: 'user', status: 'active', phone: '', bio: '' });
    showModal.value = true;
}

function openEdit(user: any) {
    isEditing.value = true;
    currentUser.value = user;
    Object.assign(form, { name: user.name, email: user.email, password: '', role: user.role, status: user.status || 'active', phone: user.phone || '', bio: user.bio || '' });
    showModal.value = true;
}

async function saveUser() {
    if (!form.name || !form.email) {
        toast.add({ severity: 'warn', summary: 'Validation', detail: 'Name and email are required', life: 3000 });
        return;
    }
    if (!isEditing.value && !form.password) {
        toast.add({ severity: 'warn', summary: 'Validation', detail: 'Password is required for new users', life: 3000 });
        return;
    }
    isSaving.value = true;
    try {
        const payload: any = { name: form.name, email: form.email, role: form.role, status: form.status, phone: form.phone, bio: form.bio };
        if (form.password) payload.password = form.password;
        if (isEditing.value && currentUser.value) {
            await updateUser(currentUser.value._id, payload);
            responseModal.value = { status: true, message: 'User updated successfully' };
        } else {
            await createUser(payload);
            responseModal.value = { status: true, message: 'User created successfully' };
        }
        showModal.value = false;
        fetchUsers();
    } catch (err: any) {
        const errors = err?.data?.errors;
        const msg = errors ? Object.values(errors).flat().join(', ') : err?.data?.message || 'Failed to save';
        toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
    } finally {
        isSaving.value = false;
    }
}

async function handleDelete(user: any) {
    deleteTarget.value = user;
    showConfirmModal.value = true;
}

async function confirmDelete() {
    if (!deleteTarget.value) return;
    try {
        await deleteUser(deleteTarget.value._id);
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'User deleted', life: 2000 });
        fetchUsers();
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.data?.message || 'Failed to delete', life: 3000 });
    } finally {
        deleteTarget.value = null;
    }
}

let searchTimer: ReturnType<typeof setTimeout>;
watch(search, () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { page.value = 1; fetchUsers(); }, 400);
});

onMounted(fetchUsers);
</script>

<template>
    <div>
        <Toast />

        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <div class="flex items-center gap-2 text-xs text-gray-400 font-medium mb-1">
                    <Icon name="lucide:users" class="text-sm" /> User Management
                </div>
                <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Users</h1>
                <p class="text-gray-500 text-sm mt-0.5" v-if="meta">{{ meta.total }} total users</p>
            </div>
            <Button label="Add User" icon="pi pi-user-plus" @click="openCreate" class="!rounded-xl" />
        </div>

        <!-- Search -->
        <div class="mb-5">
            <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="search" placeholder="Search by name or email..." class="w-full !rounded-xl" />
            </IconField>
        </div>

        <!-- Table -->
        <div class="card">
            <div v-if="isLoading" class="space-y-3">
                <Skeleton v-for="i in 8" :key="i" height="3rem" class="rounded-xl" />
            </div>

            <div v-else-if="users.length === 0" class="empty-state">
                <div class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Icon name="lucide:users" class="text-gray-400" style="font-size:1.5rem" />
                </div>
                <p class="text-sm font-medium text-gray-500">No users found</p>
            </div>

            <div v-else class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="text-left border-b border-gray-100">
                            <th class="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                            <th
                                class="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                                Email</th>
                            <th class="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                            <th class="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status
                            </th>
                            <th class="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in users" :key="user._id"
                            class="border-b border-gray-50 hover:bg-gray-50/70 transition-colors group">
                            <td class="py-3 pr-4">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {{ user.name?.charAt(0)?.toUpperCase() }}
                                    </div>
                                    <span class="font-semibold text-gray-900">{{ user.name }}</span>
                                </div>
                            </td>
                            <td class="py-3 pr-4 text-gray-500 hidden sm:table-cell">{{ user.email }}</td>
                            <td class="py-3 pr-4">
                                <span :class="['badge', user.role === 'admin' ? 'badge-purple' : 'badge-blue']">{{
                                    user.role }}</span>
                            </td>
                            <td class="py-3 pr-4">
                                <span :class="['badge', user.status === 'active' ? 'badge-green' : 'badge-red']">{{
                                    user.status || 'active' }}</span>
                            </td>
                            <td class="py-3">
                                <div class="flex gap-1">
                                    <button @click="openEdit(user)"
                                        class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-gray-400 transition-colors"
                                        title="Edit">
                                        <Icon name="lucide:pencil" class="text-xs" />
                                    </button>
                                    <button @click="handleDelete(user)"
                                        class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-gray-400 transition-colors"
                                        title="Delete">
                                        <Icon name="lucide:trash-2" class="text-xs" />
                                    </button>
                                    <NuxtLink :to="`/admin-panel/users/${user._id}/posts`">
                                        <button
                                            class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center text-gray-400 transition-colors"
                                            title="View posts">
                                            <Icon name="lucide:newspaper" class="text-xs" />
                                        </button>
                                    </NuxtLink>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="meta && meta.last_page > 1" class="flex justify-center mt-5">
                <Paginator :rows="perPage" :totalRecords="meta.total" :first="(meta.current_page - 1) * perPage"
                    @page="(e: any) => { page = e.page + 1; fetchUsers(); }" />
            </div>
        </div>

        <!-- Create/Edit Modal -->
        <Dialog v-model:visible="showModal" :header="isEditing ? 'Edit User' : 'Add User'" modal
            class="w-full max-w-lg">
            <div class="space-y-3 pt-2">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="form-label">Name <span class="text-red-500">*</span></label>
                        <InputText v-model="form.name" class="form-input" />
                    </div>
                    <div>
                        <label class="form-label">Email <span class="text-red-500">*</span></label>
                        <InputText v-model="form.email" type="email" class="form-input" />
                    </div>
                    <div>
                        <label class="form-label">Password {{ isEditing ? '(leave blank to keep)' : '*' }}</label>
                        <Password v-model="form.password" class="form-input" :feedback="false" toggleMask />
                    </div>
                    <div>
                        <label class="form-label">Phone</label>
                        <InputText v-model="form.phone" class="form-input" />
                    </div>
                    <div>
                        <label class="form-label">Role</label>
                        <Select v-model="form.role" :options="['user', 'admin']" class="form-input w-full" />
                    </div>
                    <div>
                        <label class="form-label">Status</label>
                        <Select v-model="form.status" :options="['active', 'inactive', 'suspended']"
                            class="form-input w-full" />
                    </div>
                </div>
                <div>
                    <label class="form-label">Bio</label>
                    <Textarea v-model="form.bio" class="form-input w-full" rows="2" />
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" text @click="showModal = false" />
                <Button :label="isEditing ? 'Update' : 'Create'" :loading="isSaving" @click="saveUser" />
            </template>
        </Dialog>

        <!-- Confirm Delete Modal -->
        <ConfirmModal v-model:isOpenConModal="showConfirmModal" :title="`Delete '${deleteTarget?.name}'?`"
            message="This action cannot be undone." @confirm="confirmDelete" />

        <!-- Response Modal -->
        <ResponseModal :response_modal="responseModal" />
    </div>
</template>
