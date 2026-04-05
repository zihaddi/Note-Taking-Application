export default defineNuxtPlugin(() => {
    return {
        provide: {
            truncateText: (text: string, length: number) => {
                if (!text) return ""
                return text.length > length
                    ? text.substring(0, length) + "..."
                    : text
            },
            viewFormatDate: (dateString: string) => {
                if (!dateString) return ""
                const options = {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                } as const
                const date = new Date(dateString)
                return date.toLocaleDateString("en-US", options)
            },
            viewFormatDateTime: (dateString: string) => {
                if (!dateString) return ""
                const options = {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                } as const
                const date = new Date(dateString)
                return date.toLocaleDateString("en-US", options)
            },
        },
    }
})
