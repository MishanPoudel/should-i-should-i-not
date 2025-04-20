import { motion } from "framer-motion"
import { Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface CollapsedViewProps {
    hasMessages: boolean
    messagesCount: number
    darkMode: boolean
    setIsCollapsed: (collapsed: boolean) => void
}

export function CollapsedView({
    hasMessages,
    messagesCount,
    darkMode,
    setIsCollapsed
}: CollapsedViewProps) {
    return (
        <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center"
        >
            <div className="py-8 flex flex-col items-center space-y-8">
                {hasMessages && (
                    <Badge
                        variant="outline"
                        className={`${darkMode ? 'hover:bg-sky-500/20 text-sky-400 border-sky-400' : 'hover:bg-blue-500/10 text-blue-500'}`}
                    >
                        {messagesCount}
                    </Badge>
                )}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`p-2 rounded-full ${darkMode ? 'hover:bg-sky-500/20 text-sky-400 hover:text-white' : 'hover:bg-blue-500/10 text-blue-500'
                                }`}
                            onClick={() => setIsCollapsed(false)}
                        >
                            <Eye className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">View messages</TooltipContent>
                </Tooltip>
            </div>
        </motion.div>
    )
}