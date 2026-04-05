<script setup lang="ts">
import type { MenuItem } from '~/types';

useHead({ title: 'Menu Manager — Admin' });
definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

const { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } = useMenusApi();
const toast = useToast();

const items = ref<MenuItem[]>([]);
const meta = ref<any>(null);
const isLoading = ref(false);
const search = ref('');
const page = ref(1);
const perPage = 50;

const showModal = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const currentItem = ref<MenuItem | null>(null);
const form = reactive({
    label: '',
    path: '',
    icon: 'lucide:circle',
    roles: [] as string[],
    order: 0,
    isActive: true,
    section: 'main',
});

const showConfirmModal = ref(false);
const deleteTarget = ref<MenuItem | null>(null);
const responseModal = ref<{ status?: boolean; message?: string } | null>(null);

const rolesInput = ref('');
const sectionOptions = ['main', 'admin', 'user'];

async function fetchItems() {
    isLoading.value = true;
    try {
        const res: any = await getMenuItems({ page: page.value, per_page: perPage, search: search.value });
        items.value = res?.data?.data || [];
        meta.value = res?.data?.meta || null;
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load menu items', life: 3000 });
    } finally {
        isLoading.value = false;
    }
}

function openCreate() {
    isEditing.value = false;
    currentItem.value = null;
    Object.assign(form, { label: '', path: '', icon: 'lucide:circle', roles: [], order: 0, isActive: true, section: 'main' });
    rolesInput.value = '';
    showModal.value = true;
}

function openEdit(item: MenuItem) {
    isEditing.value = true;
    currentItem.value = item;
    Object.assign(form, {
        label: item.label,
        path: item.path,
        icon: item.icon,
        roles: [...item.roles],
        order: item.order,
        isActive: item.isActive,
        section: item.section,
    });
    rolesInput.value = item.roles.join(', ');
    showModal.value = true;
}

function syncRoles() {
    form.roles = rolesInput.value.split(',').map((r) => r.trim()).filter(Boolean);
}

async function save() {
    if (!form.label || !form.path) {
        toast.add({ severity: 'warn', summary: 'Validation', detail: 'Label and path are required', life: 3000 });
        return;
    }
    syncRoles();
    isSaving.value = true;
    try {
        if (isEditing.value && currentItem.value) {
            await updateMenuItem(currentItem.value._id, {
                label: form.label,
                path: form.path,
                icon: form.icon,
                roles: form.roles,
                order: form.order,
                isActive: form.isActive,
                section: form.section,
            });
            responseModal.value = { status: true, message: 'Menu item updated successfully' };
        } else {
            await createMenuItem({
                label: form.label,
                path: form.path,
                icon: form.icon,
                roles: form.roles,
                order: form.order,
                isActive: form.isActive,
                section: form.section,
            });
            responseModal.value = { status: true, message: 'Menu item created successfully' };
        }
        showModal.value = false;
        fetchItems();
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.data?.message || 'Failed to save', life: 4000 });
    } finally {
        isSaving.value = false;
    }
}

async function handleDelete(item: MenuItem) {
    deleteTarget.value = item;
    showConfirmModal.value = true;
}

async function confirmDelete() {
    if (!deleteTarget.value) return;
    try {
        await deleteMenuItem(deleteTarget.value._id);
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Menu item deleted', life: 2000 });
        fetchItems();
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.data?.message || 'Failed to delete', life: 3000 });
    } finally {
        deleteTarget.value = null;
    }
}

async function toggleActive(item: MenuItem) {
    try {
        await updateMenuItem(item._id, { isActive: !item.isActive });
        item.isActive = !item.isActive;
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status', life: 3000 });
    }
}

let searchTimer: ReturnType<typeof setTimeout>;
watch(search, () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { page.value = 1; fetchItems(); }, 400);
});

onMounted(fetchItems);
</script>

<template>
    <div>
        <Toast />

        <!-- Header -->
        <div class="flex items-center justify-between mb-7">
            <div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Navigation</p>
                <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Menu Manager</h1>
                <p class="text-gray-500 text-sm mt-0.5" v-if="meta">
                    <span class="font-semibold text-gray-700">{{ meta.total }}</span> total items
                </p>
            </div>
            <Button label="Add Item" icon="pi pi-plus" @click="openCreate" class="!rounded-xl !shadow-sm" />
        </div>

        <!-- Search -->
        <div class="mb-5">
            <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="search" placeholder="Search by label or path..." class="w-full !rounded-xl" />
            </IconField>
        </div>

        <!-- Table card -->
        <div class="card !p-0 overflow-hidden">
            <div v-if="isLoading" class="p-6 space-y-3">
                <Skeleton v-for="i in 8" :key="i" height="3rem" class="rounded-xl" />
            </div>

            <div v-else-if="items.length === 0" class="empty-state py-16">
                <div class="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon name="lucide:menu" class="text-gray-400" style="font-size:1.5rem" />
                </div>
                <p class="text-sm font-semibold text-gray-500">No menu items found</p>
            </div>

            <div v-else class="overflow-x-auto">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Label</th>
                            <th class="hidden md:table-cell">Path</th>
                            <th>Section</th>
                            <th class="hidden sm:table-cell">Roles</th>
                            <th>Order</th>
                            <th>Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in items" :key="item._id">
                            <td>
                                <div class="flex items-center gap-2.5">
                                    <div class="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                                        <Icon :name="item.icon || 'lucide:circle'" class="text-gray-500 text-sm" />
                                    </div>
                                    <span class="font-semibold text-gray-900 text-sm">{{ item.label }}</span>
                                </div>
                            </td>
                            <td class="hidden md:table-cell">
                                <code class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg font-mono">{{ item.path }}</code>
                            </td>
                            <td>
                                <span class="badge badge-gray">{{ item.section }}</span>
                            </td>
                            <td class="hidden sm:table-cell">
                                <div class="flex flex-wrap gap-1" v-if="item.roles.length">
                                    <span v-for="role in item.roles" :key="role" class="badge badge-purple">{{ role }}</span>
                                </div>
                                <span v-else class="text-xs text-gray-400">all roles</span>
                            </td>
                            <td>
                                <span class="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold">{{ item.order }}</span>
                            </td>
                            <td>
                                <button @click="toggleActive(item)"
                                    :class="['relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
                                        item.isActive ? 'bg-emerald-500' : 'bg-gray-300']"
                                    :title="item.isActive ? 'Active — click to deactivate' : 'Inactive — click to activate'">
                                    <span :class="['pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition duration-200',
                                        item.isActive ? 'translate-x-4' : 'translate-x-0']"></span>
                                </button>
                            </td>
                            <td>
                                <div class="flex gap-1.5">
                                    <button @click="openEdit(item)" class="action-btn-edit" title="Edit">
                                        <Icon name="lucide:pencil" class="text-xs" />
                                    </button>
                                    <button @click="handleDelete(item)" class="action-btn-delete" title="Delete">
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
                    @page="(e: any) => { page = e.page + 1; fetchItems(); }" />
            </div>
        </div>

        <!-- Create/Edit Modal -->
        <Dialog v-model:visible="showModal" :header="isEditing ? 'Edit Menu Item' : 'Add Menu Item'" modal
            class="w-full max-w-lg">
            <div class="space-y-3 pt-2">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="form-label">Label <span class="text-red-500">*</span></label>
                        <InputText v-model="form.label" class="form-input w-full" placeholder="e.g. Dashboard" />
                    </div>
                    <div>
                        <label class="form-label">Path <span class="text-red-500">*</span></label>
                        <InputText v-model="form.path" class="form-input w-full" placeholder="e.g. /admin-panel" />
                    </div>
                    <div>
                        <label class="form-label">Icon</label>
                        <InputText v-model="form.icon" class="form-input w-full" placeholder="e.g. lucide:home" />
                    </div>
                    <div>
                        <label class="form-label">Section</label>
                        <Select v-model="form.section" :options="sectionOptions" class="form-input w-full" />
                    </div>
                    <div>
                        <label class="form-label">Order</label>
                        <InputText v-model.number="form.order" type="number" min="0" class="form-input w-full" />
                    </div>
                    <div class="flex items-end pb-1">
                        <div class="flex items-center gap-2">
                            <Checkbox v-model="form.isActive" :binary="true" inputId="isActiveChk" />
                            <label for="isActiveChk" class="form-label !mb-0 cursor-pointer">Active</label>
                        </div>
                    </div>
                </div>
                <div>
                    <label class="form-label">
                        Roles
                        <span class="text-gray-400 text-xs">(comma-separated slugs, e.g. admin, user — leave empty for
                            all)</span>
                    </label>
                    <InputText v-model="rolesInput" @input="syncRoles" class="form-input w-full"
                        placeholder="admin, user" />
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" text @click="showModal = false" />
                <Button :label="isEditing ? 'Update' : 'Create'" :loading="isSaving" @click="save" />
            </template>
        </Dialog>

        <!-- Confirm Delete Modal -->
        <ConfirmModal v-model:isOpenConModal="showConfirmModal" :title="`Delete '${deleteTarget?.label}'?`"
            message="This action cannot be undone." @confirm="confirmDelete" />

        <!-- Response Modal -->
        <ResponseModal :response_modal="responseModal" />
    </div>
</template>
