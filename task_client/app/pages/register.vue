<script setup lang="ts">
useHead({ title: 'Register — NoteApp' });
definePageMeta({ middleware: ['guest'], layout: 'auth' });

const { register } = useAuth();
const router = useRouter();
const toast = useToast();

const form = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    interests: [] as string[],
});

const interestInput = ref('');
const isLoading = ref(false);

function addInterest() {
    const val = interestInput.value.trim().toLowerCase();
    if (val && !form.interests.includes(val)) {
        form.interests.push(val);
    }
    interestInput.value = '';
}

function removeInterest(interest: string) {
    form.interests = form.interests.filter((i) => i !== interest);
}

async function handleRegister() {
    if (form.password !== form.confirmPassword) {
        toast.add({ severity: 'warn', summary: 'Validation', detail: 'Passwords do not match', life: 3000 });
        return;
    }

    isLoading.value = true;
    try {
        await register({
            name: form.name,
            email: form.email,
            password: form.password,
            role: 'user',
            interests: form.interests,
        });
        toast.add({ severity: 'success', summary: 'Registered!', detail: 'Account created successfully', life: 2000 });
        await router.push('/user-panel');
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Registration Failed', detail: err?.data?.message || 'Please try again', life: 4000 });
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <div>
        <Toast />
        <div class="mb-7">
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h1>
            <p class="text-gray-500 text-sm mt-1">Join NoteApp — it's free</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                    <label class="form-label">Full Name</label>
                    <InputText v-model="form.name" class="form-input" placeholder="John Doe" :disabled="isLoading"
                        required />
                </div>
                <div class="col-span-2">
                    <label class="form-label">Email Address</label>
                    <InputText v-model="form.email" type="email" class="form-input" placeholder="you@example.com"
                        :disabled="isLoading" required />
                </div>
                <div>
                    <label class="form-label">Password</label>
                    <Password v-model="form.password" class="w-full" inputClass="form-input w-full" toggleMask
                        :disabled="isLoading" required />
                </div>
                <div>
                    <label class="form-label">Confirm Password</label>
                    <Password v-model="form.confirmPassword" class="w-full" inputClass="form-input w-full"
                        :feedback="false" toggleMask :disabled="isLoading" required />
                </div>
            </div>

            <!-- Interests -->
            <div>
                <label class="form-label">
                    Interests
                    <span class="text-gray-400 font-normal">(optional)</span>
                </label>
                <div class="flex gap-2">
                    <InputText v-model="interestInput" class="form-input flex-1" placeholder="e.g. chess, reading"
                        @keydown.enter.prevent="addInterest" />
                    <Button type="button" icon="pi pi-plus" @click="addInterest" outlined
                        class="!rounded-xl flex-shrink-0" />
                </div>
                <div v-if="form.interests.length" class="flex flex-wrap gap-2 mt-2.5">
                    <span v-for="interest in form.interests" :key="interest"
                        class="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                        {{ interest }}
                        <button type="button" @click="removeInterest(interest)"
                            class="ml-1 hover:text-red-500 transition-colors leading-none">&times;</button>
                    </span>
                </div>
            </div>

            <Button type="submit" label="Create Account" icon="pi pi-check" class="w-full !rounded-xl"
                :loading="isLoading" />
        </form>

        <p class="text-center text-sm text-gray-500 mt-5 pt-5 border-t border-gray-100">
            Already have an account?
            <NuxtLink to="/login" class="text-emerald-600 font-semibold hover:underline">Sign In</NuxtLink>
        </p>
    </div>
</template>
