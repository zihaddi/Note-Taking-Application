<script setup lang="ts">
useHead({ title: 'Admin Login — NoteApp' });
definePageMeta({ middleware: ['guest'], layout: 'auth' });

const { adminLogin } = useAuth();
const router = useRouter();
const toast = useToast();

const email = ref('admin@example.com');
const password = ref('Admin@123');
const isLoading = ref(false);

async function handleLogin() {
    if (!email.value || !password.value) {
        toast.add({ severity: 'warn', summary: 'Validation', detail: 'Email and password are required', life: 3000 });
        return;
    }
    isLoading.value = true;
    try {
        await adminLogin({ email: email.value, password: password.value });
        toast.add({ severity: 'success', summary: 'Welcome Admin!', detail: 'Login successful', life: 2000 });
        await router.push('/admin-panel');
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Login Failed', detail: err?.data?.message || 'Invalid admin credentials', life: 4000 });
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <div>
        <Toast />
        <div class="mb-8">
            <div
                class="inline-flex items-center gap-2 bg-gray-900 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                <Icon name="lucide:shield-check" class="text-sm" />
                Administrator Access
            </div>
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Portal</h1>
            <p class="text-gray-500 text-sm mt-1">Sign in with your administrator credentials</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
            <div>
                <label class="form-label">Email Address</label>
                <InputText v-model="email" type="email" class="form-input" placeholder="admin@example.com"
                    :disabled="isLoading" required />
            </div>
            <div>
                <label class="form-label">Password</label>
                <Password v-model="password" class="w-full" inputClass="form-input w-full" :feedback="false" toggleMask
                    :disabled="isLoading" required />
            </div>

            <Button type="submit" label="Sign In as Admin" icon="pi pi-shield"
                class="w-full !rounded-xl !bg-gray-900 !border-gray-900 hover:!bg-gray-800" :loading="isLoading" />
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
            Not an admin?
            <NuxtLink to="/login" class="text-emerald-600 font-semibold hover:underline">User Login →</NuxtLink>
        </p>
    </div>
</template>
