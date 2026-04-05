<script setup lang="ts">
import type { Permission } from '~/types';

useHead({ title: 'Permissions — Admin' });
definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

const { getPermissions, createPermission, updatePermission, deletePermission } = usePermissionsApi();
const toast = useToast();

const permissions = ref<Permission[]>([]);
const meta = ref<any>(null);
const isLoading = ref(false);
const search = ref('');
const page = ref(1);
const perPage = 20;

const showModal = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const currentPermission = ref<Permission | null>(null);
const form = reactive({
    name: '',
    module: '',
    action: 'view' as Permission['action'],
    slug: '',
    description: '',
});

const showConfirmModal = ref(false);
const deleteTarget = ref<Permission | null>(null);
const responseModal = ref<{ status?: boolean; message?: string } | null>(null);

const actionOptions = ['view', 'create', 'update', 'delete', 'manage'];

async function fetchPermissions() {
    isLoading.value = true;
    try {
        const res: any = await getPermissions({ page: page.value, per_page: perPage, search: search.value });
        permissions.value = res?.data?.data || [];
        meta.value = res?.data?.meta || null;
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load permissions', life: 3000 });
    } finally {
        isLoading.value = false;
    }
}

function openCreate() {
    isEditing.value = false;
    currentPermission.value = null;
    Object.assign(form, { name: '', module: '', action: 'view', slug: '', description: '' });
    showModal.value = true;
}

function openEdit(p: Permission) {
    isEditing.value = true;
    currentPermission.value = p;
    Object.assign(form, { name: p.name, module: p.module, action: p.action, slug: p.slug, description: p.description || '' });
    showModal.value = true;
}

async function save() {
    if (!form.name || !form.module) {
        toast.add({ severity: 'warn', summary: 'Validation', detail: 'Name and module are required', life: 3000 });
        return;
    }
    isSaving.value = true;
    try {
        if (isEditing.value && currentPermission.value) {
            await updatePermission(currentPermission.value._id, { name: form.name, module: form.module, action: form.action, description: form.description });
            responseModal.value = { status: true, message: 'Permission updated successfully' };
        } else {
            await createPermission({ name: form.name, module: form.module, action: form.action, slug: form.slug || undefined, description: form.description });
            responseModal.value = { status: true, message: 'Permission created successfully' };
        }
        showModal.value = false;
        fetchPermissions();
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.data?.message || 'Failed to save', life: 4000 });
    } finally {
        isSaving.value = false;
    }
}

async function handleDelete(p: Permission) {
    deleteTarget.value = p;
    showConfirmModal.value = true;
}

async function confirmDelete() {
    if (!deleteTarget.value) return;
    try {
        await deletePermission(deleteTarget.value._id);
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Permission deleted', life: 2000 });
        fetchPermissions();
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.data?.message || 'Failed to delete', life: 3000 });
    } finally {
        deleteTarget.value = null;
    }
}

const actionBadgeClass: Record<string, string> = {
    view: 'badge-blue',
    create: 'badge-green',
    update: 'badge-yellow',
    delete: 'badge-red',
    manage: 'badge-purple',
};

let searchTimer: ReturnType<typeof setTimeout>;
watch(search, () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { page.value = 1; fetchPermissions(); }, 400);
});

onMounted(fetchPermissions);
</script>

<template>
    <div>
        <Toast />

        <!-- Header -->
        <div class="flex items-center justify-between mb-7">
            <div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">RBAC</p>
                <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Permissions</h1>
                <p class="text-gray-500 text-sm mt-0.5" v-if="meta">
                    <span class="font-semibold text-gray-700">{{ meta.total }}</span> total permissions
                </p>
            </div>
            <Button label="Add Permission" icon="pi pi-plus" @click="openCreate" class="!rounded-xl !shadow-sm" />
        </div>

        <!-- Search -->
        <div class="mb-5">
            <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="search" placeholder="Search by name, slug, or module..."
                    class="w-full !rounded-xl" />
            </IconField>
        </div>

        <!-- Table card -->
        <div class="card !p-0 overflow-hidden">
            <div v-if="isLoading" class="p-6 space-y-3">
                <Skeleton v-for="i in 8" :key="i" height="3rem" class="rounded-xl" />
            </div>

            <div v-else-if="permissions.length === 0" class="empty-state py-16">
                <div class="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon name="lucide:key" class="text-amber-400" style="font-size:1.5rem" />
                </div>
                <p class="text-sm font-semibold text-gray-500">No permissions found</p>
            </div>

            <div v-else class="overflow-x-auto">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th class="hidden sm:table-cell">Slug</th>
                            <th>Module</th>
                            <th>Action</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="perm in permissions" :key="perm._id">
                            <td class="font-semibold text-gray-900 text-sm">{{ perm.name }}</td>
                            <td class="hidden sm:table-cell">
                                <code class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg font-mono">{{ perm.slug }}</code>
                            </td>
                            <td>
                                <span class="badge badge-gray">{{ perm.module }}</span>
                            </td>
                            <td>
                                <span :class="['badge', actionBadgeClass[perm.action] || 'badge-gray']">{{ perm.action }}</span>
                            </td>
                            <td>
                                <div class="flex gap-1.5">
                                    <button @click="openEdit(perm)" class="action-btn-edit" title="Edit">
                                        <Icon name="lucide:pencil" class="text-xs" />
                                    </button>
                                    <button @click="handleDelete(perm)" class="action-btn-delete" title="Delete">
                                        <Icon name="lucide:trash-2" class="text-xs" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="meta && meta.last_page > 1" class="flex justify-center px-6 py-4 border-t border-gray-100">
                <Paginator :rows="perPage" :totalRecords="meta.total" :first="(meta.current_page - 1) * perPage"
                    @page="(e: any) => { page = e.page + 1; fetchPermissions(); }" />
            </div>
        </div>

        <!-- Create/Edit Modal -->
        <Dialog v-model:visible="showModal" :header="isEditing ? 'Edit Permission' : 'Add Permission'" modal
            class="w-full max-w-lg">
            <div class="space-y-3 pt-2">
                <div>
                    <label class="form-label">Name <span class="text-red-500">*</span></label>
                    <InputText v-model="form.name" class="form-input w-full" placeholder="e.g. View Users" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="form-label">Module <span class="text-red-500">*</span></label>
                        <InputText v-model="form.module" class="form-input w-full" placeholder="e.g. users" />
                    </div>
                    <div>
                        <label class="form-label">Action <span class="text-red-500">*</span></label>
                        <Select v-model="form.action" :options="actionOptions" class="form-input w-full" />
                    </div>
                </div>
                <div v-if="!isEditing">
                    <label class="form-label">Slug <span class="text-gray-400 text-xs">(auto-generated if
                            empty)</span></label>
                    <InputText v-model="form.slug" class="form-input w-full" placeholder="e.g. users.view" />
                </div>
                <div>
                    <label class="form-label">Description</label>
                    <Textarea v-model="form.description" class="form-input w-full" rows="2" />
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" text @click="showModal = false" />
                <Button :label="isEditing ? 'Update' : 'Create'" :loading="isSaving" @click="save" />
            </template>
        </Dialog>

        <!-- Confirm Delete Modal -->
        <ConfirmModal v-model:isOpenConModal="showConfirmModal" :title="`Delete '${deleteTarget?.name}'?`"
            message="This action cannot be undone." @confirm="confirmDelete" />

        <!-- Response Modal -->
        <ResponseModal :response_modal="responseModal" />
    </div>
</template>
