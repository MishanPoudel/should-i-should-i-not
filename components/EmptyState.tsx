import { Archive } from "lucide-react"

interface EmptyStateProps {
    theme: any
}

export function EmptyState({ theme }: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 ${theme.subtext}`}>
            <Archive className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-center font-medium">No saved messages</p>
            <p className="text-center text-xs mt-2 max-w-xs">Unsent messages with "Keep a copy" enabled will appear here</p>
        </div>
    )
}