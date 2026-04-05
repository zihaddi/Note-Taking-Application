<script setup lang="ts">
import type { Role, Permission, PermissionGroup } from '~/types';

useHead({ title: 'Roles — Admin' });
definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

const { getRoles, createRole, updateRole, deleteRole } = useRolesApi();
const { getPermissionsGrouped } = usePermissionsApi();
const toast = useToast();

const roles = ref<Role[]>([]);
const meta = ref<any>(null);
const isLoading = ref(false);
const search = ref('');
const page = ref(1);
const perPage = 20;

const showModal = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const currentRole = ref<Role | null>(null);
const form = reactive({
    name: '',
    slug: '',
    description: '',
    permissions: [] as string[], // selected permission IDs
    isDefault: false,
});

const permissionGroups = ref<PermissionGroup[]>([]);
const showConfirmModal = ref(false);
const deleteTarget = ref<Role | null>(null);
const responseModal = ref<{ status?: boolean; message?: string } | null>(null);

async function fetchRoles() {
    isLoading.value = true;
    try {
        const res: any = await getRoles({ page: page.value, per_page: perPage, search: search.value });
        roles.value = res?.data?.data || [];
        meta.value = res?.data?.meta || null;
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load roles', life: 3000 });
    } finally {
        isLoading.value = false;
    }
}

async function loadPermissions() {
    try {
        const res: any = await getPermissionsGrouped();
        permissionGroups.value = res?.data || [];
    } catch {
        // ignore
    }
}

function openCreate() {
    isEditing.value = false;
    currentRole.value = null;
    Object.assign(form, { name: '', slug: '', description: '', permissions: [], isDefault: false });
    showModal.value = true;
}

function openEdit(role: Role) {
    isEditing.value = true;
    currentRole.value = role;
    Object.assign(form, {
        name: role.name,
        slug: role.slug,
        description: role.description || '',
        permissions: (role.permissions || []).map((p: any) => p._id || p),
        isDefault: role.isDefault,
    });
    showModal.value = true;
}

function togglePermission(permId: string) {
    const idx = form.permissions.indexOf(permId);
    if (idx >= 0) {
        form.permissions.splice(idx, 1);
    } else {
        form.permissions.push(permId);
    }
}

function toggleGroup(group: PermissionGroup) {
    const groupIds = group.permissions.map((p) => p._id);
    const allSelected = groupIds.every((id) => form.permissions.includes(id));
    if (allSelected) {
        form.permissions = form.permissions.filter((id) => !groupIds.includes(id));
    } else {
        groupIds.forEach((id) => {
            if (!form.permissions.includes(id)) form.permissions.push(id);
        });
    }
}

function groupAllSelected(group: PermissionGroup) {
    return group.permissions.every((p) => form.permissions.includes(p._id));
}

async function save() {
    if (!form.name) {
        toast.add({ severity: 'warn', summary: 'Validation', detail: 'Role name is required', life: 3000 });
        return;
    }
    isSaving.value = true;
    try {
        if (isEditing.value && currentRole.value) {
            await updateRole(currentRole.value._id, {
                name: form.name,
                description: form.description,
                permissions: form.permissions,
                isDefault: form.isDefault,
            });
            responseModal.value = { status: true, message: 'Role updated successfully' };
        } else {
            await createRole({
                name: form.name,
                slug: form.slug || undefined,
                description: form.description,
                permissions: form.permissions,
                isDefault: form.isDefault,
            });
            responseModal.value = { status: true, message: 'Role created successfully' };
        }
        showModal.value = false;
        fetchRoles();
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.data?.message || 'Failed to save', life: 4000 });
    } finally {
        isSaving.value = false;
    }
}

async function handleDelete(role: Role) {
    deleteTarget.value = role;
    showConfirmModal.value = true;
}

async function confirmDelete() {
    if (!deleteTarget.value) return;
    try {
        await deleteRole(deleteTarget.value._id);
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Role deleted', life: 2000 });
        fetchRoles();
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.data?.message || 'Failed to delete', life: 3000 });
    } finally {
        deleteTarget.value = null;
    }
}

let searchTimer: ReturnType<typeof setTimeout>;
watch(search, () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { page.value = 1; fetchRoles(); }, 400);
});

onMounted(() => {
    fetchRoles();
    loadPermissions();
});
</script>

<template>
    <div>
        <Toast />

        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <div class="flex items-center gap-2 text-xs text-gray-400 font-medium mb-1">
                    <Icon name="lucide:shield" class="text-sm" /> RBAC
                </div>
                <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Roles</h1>
                <p class="text-gray-500 text-sm mt-0.5" v-if="meta">{{ meta.total }} total roles</p>
            </div>
            <Button label="Add Role" icon="pi pi-plus" @click="openCreate" class="!rounded-xl" />
        </div>

        <!-- Search -->
        <div class="mb-5">
            <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="search" placeholder="Search roles..." class="w-full !rounded-xl" />
            </IconField>
        </div>

        <!-- Table -->
        <div class="card">
            <div v-if="isLoading" class="space-y-3">
                <Skeleton v-for="i in 6" :key="i" height="3rem" class="rounded-xl" />
            </div>

            <div v-else-if="roles.length === 0" class="empty-state">
                <div class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Icon name="lucide:shield" class="text-gray-400" style="font-size:1.5rem" />
                </div>
                <p class="text-sm font-medium text-gray-500">No roles found</p>
            </div>

            <div v-else class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="text-left border-b border-gray-100">
                            <th class="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                            <th
                                class="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                                Slug</th>
                            <th class="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Permissions</th>
                            <th class="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Flags</th>
                            <th class="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="role in roles" :key="role._id"
                            class="border-b border-gray-50 hover:bg-gray-50/70 transition-colors group">
                            <td class="py-3 pr-4">
                                <div class="flex items-center gap-2">
                                    <div class="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                                        <Icon name="lucide:shield" class="text-indigo-500 text-xs" />
                                    </div>
                                    <span class="font-semibold text-gray-900">{{ role.name }}</span>
                                </div>
                            </td>
                            <td class="py-3 pr-4 text-gray-400 font-mono text-xs hidden sm:table-cell">{{ role.slug }}
                            </td>
                            <td class="py-3 pr-4">
                                <span class="badge badge-blue">{{ (role.permissions || []).length }} permissions</span>
                            </td>
                            <td class="py-3 pr-4">
                                <div class="flex gap-1 flex-wrap">
                                    <span v-if="role.isSystem" class="badge badge-purple">system</span>
                                    <span v-if="role.isDefault" class="badge badge-green">default</span>
                                </div>
                            </td>
                            <td class="py-3">
                                <div class="flex gap-1">
                                    <button @click="openEdit(role)"
                                        class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-gray-400 transition-colors"
                                        title="Edit">
                                        <Icon name="lucide:pencil" class="text-xs" />
                                    </button>
                                    <button @click="handleDelete(role)" :disabled="role.isSystem"
                                        :class="['w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                                            role.isSystem ? 'bg-gray-50 text-gray-200 cursor-not-allowed' : 'bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-400']"
                                        title="Delete">
                                        <Icon name="lucide:trash-2" class="text-xs" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="meta && meta.last_page > 1" class="flex justify-center mt-5">
                <Paginator :rows="perPage" :totalRecords="meta.total" :first="(meta.current_page - 1) * perPage"
                    @page="(e: any) => { page = e.page + 1; fetchRoles(); }" />
            </div>
        </div>

        <!-- Create/Edit Modal -->
        <Dialog v-model:visible="showModal" :header="isEditing ? 'Edit Role' : 'Add Role'" modal
            class="w-full max-w-lg">
            <div class="space-y-3 pt-2">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="form-label">Name <span class="text-red-500">*</span></label>
                        <InputText v-model="form.name" class="form-input w-full" placeholder="e.g. Editor" />
                    </div>
                    <div v-if="!isEditing">
                        <label class="form-label">Slug <span class="text-gray-400 text-xs">(auto if
                                empty)</span></label>
                        <InputText v-model="form.slug" class="form-input w-full" placeholder="e.g. editor" />
                    </div>
                    <div v-else>
                        <label class="form-label">Slug</label>
                        <InputText :value="form.slug" disabled class="form-input w-full opacity-50" />
                    </div>
                </div>
                <div>
                    <label class="form-label">Description</label>
                    <Textarea v-model="form.description" class="form-input w-full" rows="2" autoResize />
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox v-model="form.isDefault" :binary="true" inputId="isDefault" />
                    <label for="isDefault" class="form-label !mb-0 cursor-pointer">Set as default role for new
                        users</label>
                </div>

                <!-- Permissions section -->
                <div>
                    <label class="form-label mb-1.5">
                        Permissions
                        <span class="text-gray-400 text-xs font-normal">({{ form.permissions.length }} selected)</span>
                    </label>
                    <div class="max-h-52 overflow-y-auto border border-gray-200 rounded-xl p-2.5 space-y-2">
                        <div v-if="permissionGroups.length === 0" class="text-xs text-gray-400 text-center py-2">
                            Loading permissions...
                        </div>
                        <div v-for="group in permissionGroups" :key="group._id">
                            <!-- Group header with select-all -->
                            <div class="flex items-center gap-2 px-1 py-1 rounded-lg hover:bg-gray-50">
                                <Checkbox :modelValue="groupAllSelected(group)" :binary="true"
                                    @change="toggleGroup(group)" :inputId="`group-${group._id}`" />
                                <label :for="`group-${group._id}`"
                                    class="text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer flex-1">
                                    {{ group._id }}
                                </label>
                            </div>
                            <!-- Permissions grid -->
                            <div class="grid grid-cols-3 gap-x-2 gap-y-0.5 pl-6 pb-1">
                                <div v-for="perm in group.permissions" :key="perm._id"
                                    class="flex items-center gap-1.5 py-0.5">
                                    <Checkbox :modelValue="form.permissions.includes(perm._id)" :binary="true"
                                        @change="togglePermission(perm._id)" :inputId="`perm-${perm._id}`" />
                                    <label :for="`perm-${perm._id}`"
                                        class="text-xs text-gray-600 cursor-pointer truncate">
                                        {{ perm.action }}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
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
