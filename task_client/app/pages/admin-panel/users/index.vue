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
        <div class="flex items-center justify-between mb-7">
            <div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">User Management</p>
                <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Users</h1>
                <p class="text-gray-500 text-sm mt-0.5" v-if="meta">
                    <span class="font-semibold text-gray-700">{{ meta.total }}</span> total users
                </p>
            </div>
            <Button label="Add User" icon="pi pi-user-plus" @click="openCreate" class="!rounded-xl !shadow-sm" />
        </div>

        <!-- Search -->
        <div class="mb-5">
            <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="search" placeholder="Search by name or email..." class="w-full !rounded-xl" />
            </IconField>
        </div>

        <!-- Table card -->
        <div class="card !p-0 overflow-hidden">
            <div v-if="isLoading" class="p-6 space-y-3">
                <Skeleton v-for="i in 8" :key="i" height="3rem" class="rounded-xl" />
            </div>

            <div v-else-if="users.length === 0" class="empty-state py-16">
                <div class="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon name="lucide:users" class="text-gray-400" style="font-size:1.5rem" />
                </div>
                <p class="text-sm font-semibold text-gray-500">No users found</p>
                <p class="text-xs text-gray-400 mt-1">Try adjusting your search</p>
            </div>

            <div v-else class="overflow-x-auto">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th class="hidden sm:table-cell">Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in users" :key="user._id">
                            <td>
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                                        {{ user.name?.charAt(0)?.toUpperCase() }}
                                    </div>
                                    <div>
                                        <p class="font-semibold text-gray-900 text-sm">{{ user.name }}</p>
                                        <p class="text-xs text-gray-400 sm:hidden">{{ user.email }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="text-gray-500 text-sm hidden sm:table-cell">{{ user.email }}</td>
                            <td>
                                <span :class="['badge', user.role === 'admin' ? 'badge-purple' : 'badge-blue']">{{ user.role }}</span>
                            </td>
                            <td>
                                <div class="flex items-center gap-1.5">
                                    <div :class="['w-1.5 h-1.5 rounded-full flex-shrink-0', user.status === 'active' ? 'bg-green-500' : 'bg-red-400']" />
                                    <span :class="['badge', user.status === 'active' ? 'badge-green' : 'badge-red']">{{ user.status || 'active' }}</span>
                                </div>
                            </td>
                            <td>
                                <div class="flex gap-1.5">
                                    <button @click="openEdit(user)" class="action-btn-edit" title="Edit">
                                        <Icon name="lucide:pencil" class="text-xs" />
                                    </button>
                                    <button @click="handleDelete(user)" class="action-btn-delete" title="Delete">
                                        <Icon name="lucide:trash-2" class="text-xs" />
                                    </button>
                                    <NuxtLink :to="`/admin-panel/users/${user._id}/posts`">
                                        <button class="action-btn-view" title="View posts">
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
            <div v-if="meta && meta.last_page > 1" class="flex justify-center px-6 py-4 border-t border-gray-100">
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
                        <Password v-model="form.password" class="w-full" inputClass="form-input w-full" :feedback="false" toggleMask />
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
