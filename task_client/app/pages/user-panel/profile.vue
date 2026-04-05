<script setup lang="ts">
useHead({ title: 'Profile — NoteApp' });
definePageMeta({ middleware: ['auth-user'], layout: 'user' });

const { getMyProfile, updateMyProfile } = useUsersApi();
const { setAuth } = useAuth();
const toast = useToast();

const isLoading = ref(true);
const isSaving = ref(false);
const form = reactive({ name: '', email: '', phone: '', bio: '' });
const interestInput = ref('');
const interests = ref<string[]>([]);

async function loadProfile() {
    isLoading.value = true;
    try {
        const res: any = await getMyProfile();
        const user = res?.data;
        Object.assign(form, { name: user.name || '', email: user.email || '', phone: user.phone || '', bio: user.bio || '' });
        interests.value = user.interests || [];
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load profile', life: 3000 });
    } finally {
        isLoading.value = false;
    }
}

function addInterest() {
    const val = interestInput.value.trim();
    if (val && !interests.value.includes(val)) {
        interests.value.push(val);
    }
    interestInput.value = '';
}

function removeInterest(i: number) {
    interests.value.splice(i, 1);
}

async function saveProfile() {
    if (!form.name || !form.email) {
        toast.add({ severity: 'warn', summary: 'Validation', detail: 'Name and email are required', life: 3000 });
        return;
    }
    isSaving.value = true;
    try {
        const payload = { ...form, interests: interests.value };
        const res: any = await updateMyProfile(payload);
        setAuth(null, res?.data ?? null);
        toast.add({ severity: 'success', summary: 'Saved', detail: 'Profile updated', life: 2000 });
    } catch (err: any) {
        const errors = err?.data?.errors;
        const msg = errors ? Object.values(errors).flat().join(', ') : err?.data?.message || 'Failed to save';
        toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
    } finally {
        isSaving.value = false;
    }
}

onMounted(loadProfile);
</script>

<template>
    <div>
        <Toast />

        <!-- Page Header -->
        <div class="mb-7">
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight">My Profile</h1>
            <p class="text-gray-500 text-sm mt-1">Manage your account information and interests</p>
        </div>

        <div v-if="isLoading" class="space-y-5">
            <div class="card">
                <Skeleton height="2rem" class="mb-3 rounded-xl" />
                <Skeleton height="2rem" class="mb-3 rounded-xl" />
                <Skeleton height="4rem" class="rounded-xl" />
            </div>
        </div>

        <form v-else class="space-y-5" @submit.prevent="saveProfile">
            <!-- Avatar + name banner -->
            <div class="card flex items-center gap-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100">
                <div
                    class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow">
                    {{ form.name?.charAt(0)?.toUpperCase() || '?' }}
                </div>
                <div>
                    <p class="font-bold text-gray-900">{{ form.name || 'Your Name' }}</p>
                    <p class="text-sm text-gray-500">{{ form.email }}</p>
                </div>
            </div>

            <!-- Personal Info -->
            <div class="card">
                <div class="flex items-center gap-2 mb-4">
                    <div class="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Icon name="lucide:user" class="text-emerald-600 text-sm" />
                    </div>
                    <h2 class="text-sm font-bold text-gray-900">Personal Information</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="form-label">Full Name <span class="text-red-500">*</span></label>
                        <InputText v-model="form.name" class="form-input" placeholder="Your full name" />
                    </div>
                    <div>
                        <label class="form-label">Email Address <span class="text-red-500">*</span></label>
                        <InputText v-model="form.email" type="email" class="form-input" placeholder="your@email.com" />
                    </div>
                    <div>
                        <label class="form-label">Phone</label>
                        <InputText v-model="form.phone" class="form-input" placeholder="+1 (555) 000-0000" />
                    </div>
                </div>
                <div class="mt-4">
                    <label class="form-label">Bio</label>
                    <Textarea v-model="form.bio" class="form-input w-full" rows="3"
                        placeholder="Tell us about yourself..." />
                </div>
            </div>

            <!-- Interests -->
            <div class="card">
                <div class="flex items-center gap-2 mb-1">
                    <div class="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Icon name="lucide:tag" class="text-blue-600 text-sm" />
                    </div>
                    <h2 class="text-sm font-bold text-gray-900">Interests</h2>
                </div>
                <p class="text-xs text-gray-400 mb-4 ml-9">Topics you are interested in. Used for user grouping.</p>

                <div class="flex gap-2 mb-4">
                    <InputText v-model="interestInput" class="form-input flex-1"
                        placeholder="e.g. Technology, Science..." @keydown.enter.prevent="addInterest" />
                    <Button type="button" icon="pi pi-plus" label="Add" outlined class="!rounded-xl flex-shrink-0"
                        @click="addInterest" />
                </div>

                <div class="flex flex-wrap gap-2">
                    <span v-for="(interest, i) in interests" :key="i"
                        class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-full border border-emerald-200 font-medium">
                        {{ interest }}
                        <button type="button" @click="removeInterest(i)"
                            class="text-emerald-400 hover:text-red-500 transition-colors">
                            <Icon name="lucide:x" class="text-xs" />
                        </button>
                    </span>
                    <div v-if="interests.length === 0" class="text-xs text-gray-400 italic py-1">No interests added yet.
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3">
                <Button type="button" label="Reset" text class="!rounded-xl" @click="loadProfile" />
                <Button type="submit" label="Save Changes" :loading="isSaving" class="!rounded-xl" />
            </div>
        </form>
    </div>
</template>
