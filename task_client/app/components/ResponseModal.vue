<script setup lang="ts">
const props = defineProps<{
    response_modal: { status?: boolean; message?: string; error?: Record<string, string[]> } | null | undefined;
}>();

const visible = ref(false);
let timer: ReturnType<typeof setTimeout>;

watch(() => props.response_modal, (val) => {
    if (val && val.status !== undefined) {
        visible.value = true;
        clearTimeout(timer);
        timer = setTimeout(() => { visible.value = false; }, 3000);
    }
});

const messageLogs = computed(() => {
    const msgs: string[] = [];
    if (props.response_modal?.error) {
        for (const value of Object.values(props.response_modal.error)) {
            msgs.push(...value);
        }
    }
    return msgs;
});
</script>

<template>
    <Dialog v-model:visible="visible" modal :closable="false" :style="{ width: '25rem' }">
        <div class="flex flex-wrap px-3">
            <div class="flex w-full justify-center items-center">
                <div v-if="!response_modal || response_modal.status === undefined"
                    class="flex justify-center items-center h-40">
                    <div class="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin">
                    </div>
                </div>
                <div v-else class="w-full text-center">
                    <!-- Success -->
                    <div v-if="response_modal.status === true" class="flex flex-col items-center justify-center">
                        <div class="ui-success">
                            <svg viewBox="0 0 87 87" xmlns="http://www.w3.org/2000/svg">
                                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                    <g transform="translate(2,2)">
                                        <circle stroke="rgba(165,220,134,0.2)" stroke-width="4" cx="41.5" cy="41.5"
                                            r="41.5" />
                                        <circle class="ui-success-circle" stroke="#A5DC86" stroke-width="4" cx="41.5"
                                            cy="41.5" r="41.5" />
                                        <polyline class="ui-success-path" stroke="#A5DC86" stroke-width="4"
                                            points="19 38.8 31.1 54.8 63.3 28" />
                                    </g>
                                </g>
                            </svg>
                        </div>
                        <p class="text-green-700 text-lg font-medium pb-2">{{ response_modal?.message }}</p>
                    </div>
                    <!-- Error -->
                    <div v-else class="flex flex-col items-center justify-center">
                        <div class="ui-error">
                            <svg viewBox="0 0 87 87" xmlns="http://www.w3.org/2000/svg">
                                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                    <g transform="translate(2,2)">
                                        <circle stroke="rgba(252,191,191,.5)" stroke-width="4" cx="41.5" cy="41.5"
                                            r="41.5" />
                                        <circle class="ui-error-circle" stroke="#F74444" stroke-width="4" cx="41.5"
                                            cy="41.5" r="41.5" />
                                        <path class="ui-error-line1" d="M22.244224,22 L60.4279902,60.1837662"
                                            stroke="#F74444" stroke-width="3" stroke-linecap="square" />
                                        <path class="ui-error-line2" d="M60.755776,21 L23.244224,59.8443492"
                                            stroke="#F74444" stroke-width="3" stroke-linecap="square" />
                                    </g>
                                </g>
                            </svg>
                        </div>
                        <p class="text-red-700 text-lg font-medium pb-2">{{ response_modal?.message }}</p>
                        <div v-for="(msg, i) in messageLogs" :key="i" class="text-sm text-red-500 text-left">{{ msg }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
.ui-success,
.ui-error {
    width: 100px;
    height: 100px;
    margin: 20px auto;
}

.ui-success svg,
.ui-error svg {
    display: block;
}

.ui-success-circle {
    stroke-dasharray: 260.752px;
    stroke-dashoffset: 260.752px;
    animation: success-circle 1s ease-in-out forwards;
}

.ui-success-path {
    stroke-dasharray: 60px 64px;
    stroke-dashoffset: 62px;
    animation: success-path 0.4s 1s ease-in-out forwards;
}

.ui-error-circle {
    stroke-dasharray: 260.752px;
    stroke-dashoffset: 260.752px;
    animation: error-circle 1s ease-in-out forwards;
}

.ui-error-line1 {
    stroke-dasharray: 54px 55px;
    stroke-dashoffset: 55px;
    animation: error-line 0.15s 1.2s ease-in-out forwards;
}

.ui-error-line2 {
    stroke-dasharray: 54px 55px;
    stroke-dashoffset: 55px;
    animation: error-line 0.2s 0.9s ease-in-out forwards;
}

@keyframes success-circle {
    to {
        stroke-dashoffset: 0;
    }
}

@keyframes success-path {
    0% {
        stroke-dashoffset: 62px;
    }

    65% {
        stroke-dashoffset: -5px;
    }

    84% {
        stroke-dashoffset: 4px;
    }

    100% {
        stroke-dashoffset: -2px;
    }
}

@keyframes error-circle {
    to {
        stroke-dashoffset: 0;
    }
}

@keyframes error-line {
    to {
        stroke-dashoffset: 0;
    }
}
</style>
