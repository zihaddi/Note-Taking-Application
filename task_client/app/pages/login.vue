<script setup lang="ts">
useHead({ title: 'Login — NoteApp' });
definePageMeta({ middleware: ['guest'], layout: 'auth' });

const { login } = useAuth();
const router = useRouter();
const toast = useToast();

const email = ref('alice@example.com');
const password = ref('User@123');
const isLoading = ref(false);

async function handleLogin() {
    if (!email.value || !password.value) {
        toast.add({ severity: 'warn', summary: 'Validation', detail: 'Email and password are required', life: 3000 });
        return;
    }
    isLoading.value = true;
    try {
        await login({ email: email.value, password: password.value });
        toast.add({ severity: 'success', summary: 'Welcome!', detail: 'Login successful', life: 2000 });
        await router.push('/user-panel');
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Login Failed', detail: err?.data?.message || 'Invalid credentials', life: 4000 });
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <div>
        <Toast />
        <div class="mb-8">
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back</h1>
            <p class="text-gray-500 text-sm mt-1">Sign in to your NoteApp account</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
            <div>
                <label class="form-label">Email Address</label>
                <InputText v-model="email" type="email" class="form-input" placeholder="you@example.com"
                    :disabled="isLoading" required />
            </div>
            <div>
                <label class="form-label">Password</label>
                <Password v-model="password" class="w-full" inputClass="form-input w-full" :feedback="false" toggleMask
                    :disabled="isLoading" required />
            </div>

            <Button type="submit" label="Sign In" icon="pi pi-sign-in" class="w-full !rounded-xl"
                :loading="isLoading" />
        </form>

        <div class="mt-6 pt-6 border-t border-gray-100 space-y-2">
            <p class="text-center text-sm text-gray-500">
                Don't have an account?
                <NuxtLink to="/register" class="text-emerald-600 font-semibold hover:underline">Create one</NuxtLink>
            </p>
            <p class="text-center text-sm text-gray-500">
                Are you an admin?
                <NuxtLink to="/admin-login" class="text-emerald-600 font-semibold hover:underline">Admin Portal →
                </NuxtLink>
            </p>
        </div>
    </div>
</template>
