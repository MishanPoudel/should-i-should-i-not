import { motion } from "framer-motion"
import { Clock, Send, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SavedMessage } from "@/components/MessageVault"
import { formatRelativeTime, formatOdds, truncateText } from "@/lib/utils"

interface MessageListProps {
    savedMessages: SavedMessage[]
    theme: any
    darkMode: boolean
    onDelete: (id: string) => void
    onSelect: (message: SavedMessage) => void
    onResend: (message: SavedMessage) => void
}

export function MessageList({
    savedMessages,
    theme,
    darkMode,
    onDelete,
    onSelect,
    onResend
}: MessageListProps) {
    return (
        <div className="h-[calc(100vh-9rem)] w-full overflow-y-scroll">
            <div className="space-y-3 pb-3">
                {savedMessages.map((msg) => (
                    <MessageItem
                        key={msg.id}
                        message={msg}
                        theme={theme}
                        darkMode={darkMode}
                        onDelete={onDelete}
                        onSelect={onSelect}
                        onResend={onResend}
                    />
                ))}
            </div>
        </div>
    )
}

interface MessageItemProps {
    message: SavedMessage
    theme: any
    darkMode: boolean
    onDelete: (id: string) => void
    onSelect: (message: SavedMessage) => void
    onResend: (message: SavedMessage) => void
}

function MessageItem({
    message: msg,
    theme,
    darkMode,
    onDelete,
    onSelect,
    onResend
}: MessageItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg cursor-pointer transition-all group ${darkMode
                ? 'hover:bg-slate-800/90 bg-slate-900/50 border border-slate-800'
                : 'hover:bg-slate-100/90 bg-white/70 border border-slate-200'
                } relative`}
            onClick={() => onSelect(msg)}
        >
            {/* Delete button - appears on hover */}
            <button
                className={`absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'text-slate-400 hover:text-red-400' : 'text-slate-500 hover:text-red-500'}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(msg.id);
                }}
            >
                <X size={14} />
            </button>

            <div className="flex justify-between items-start mb-2 pr-4">
                <div className="font-medium text-sm">
                    {msg.subject
                        ? <span className={theme.text}>{truncateText(msg.subject, 24)}</span>
                        : <span className={`${theme.subtext} italic`}>(No subject)</span>}
                </div>
            </div>

            <div className={`text-xs mb-2 ${theme.subtext}`}>
                To: {truncateText(msg.recipient, 24)}
            </div>

            <div className={`text-sm mb-3 ${theme.text}`}
                style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    maxHeight: '2.8em',
                }}
            >
                {msg.message}
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center text-xs">
                    <Clock className={`h-3 w-3 mr-1 ${theme.text}`} />
                    <span className={theme.text}>
                        {formatRelativeTime(msg.timestamp)}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className={`text-xs ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50'} ${theme.text}`}
                    >
                        {formatOdds(msg.odds)}
                    </Badge>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`h-6 w-6 p-0 rounded-full ${darkMode ? "text-sky-400 hover:bg-sky-500/20" : "text-blue-500 hover:bg-blue-500/10"}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onResend(msg);
                                }}
                            >
                                <Send className="h-3 w-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Resend</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </motion.div>
    )
}