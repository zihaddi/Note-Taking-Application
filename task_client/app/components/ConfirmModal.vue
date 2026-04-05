<script setup lang="ts">
const props = defineProps<{
    isOpenConModal: boolean;
    title?: string;
    message?: string;
}>();

const emit = defineEmits<{
    confirm: [];
    'update:isOpenConModal': [value: boolean];
}>();

const visible = computed({
    get: () => props.isOpenConModal,
    set: (value) => { if (!value) emit('update:isOpenConModal', false); },
});

function confirmAction() {
    emit('confirm');
    emit('update:isOpenConModal', false);
}
</script>

<template>
    <Dialog v-model:visible="visible" modal :closable="false" :style="{ width: '25rem' }">
        <div class="flex justify-center">
            <div class="modal-warn-icon">
                <span class="warn-body"></span>
                <span class="warn-dot"></span>
            </div>
        </div>
        <div class="mb-6 mt-2 text-center">
            <h3 class="font-semibold text-lg mt-2">{{ title ?? 'Are you sure you want to proceed?' }}</h3>
            <p v-if="message" class="text-sm text-gray-600 mt-2">{{ message }}</p>
        </div>
        <div class="flex justify-end items-center gap-3">
            <Button type="button" label="Cancel" severity="danger" outlined
                @click="emit('update:isOpenConModal', false)">
                <template #icon="{ class: cls }">
                    <i class="pi pi-times-circle mr-2" :class="cls"></i>
                </template>
            </Button>
            <Button type="button" label="Yes" severity="success" raised @click="confirmAction">
                <template #icon="{ class: cls }">
                    <i class="pi pi-check-circle mr-2" :class="cls"></i>
                </template>
            </Button>
        </div>
    </Dialog>
</template>

<style scoped>
.modal-warn-icon {
    border-radius: 50%;
    border: 4px solid #f8bb86;
    box-sizing: content-box;
    height: 80px;
    margin: 20px auto;
    padding: 0;
    position: relative;
    width: 80px;
    animation: scaleWarning 0.75s infinite alternate;
}

.warn-body {
    background-color: #f8bb86;
    border-radius: 2px;
    height: 47px;
    left: 50%;
    margin-left: -2px;
    position: absolute;
    top: 10px;
    width: 5px;
    animation: pulseWarning 0.75s infinite alternate;
}

.warn-dot {
    background-color: #f8bb86;
    border-radius: 50%;
    bottom: 10px;
    height: 7px;
    left: 50%;
    margin-left: -3px;
    position: absolute;
    width: 7px;
    animation: pulseWarning 0.75s infinite alternate;
}

@keyframes scaleWarning {
    0% {
        transform: scale(1);
    }

    30% {
        transform: scale(1.02);
    }

    100% {
        transform: scale(1);
    }
}

@keyframes pulseWarning {
    0% {
        background-color: #f8d486;
    }

    100% {
        background-color: #f8bb86;
    }
}
</style>
