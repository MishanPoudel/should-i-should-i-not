import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Archive, Clock, Send, Trash2, ChevronRight, ChevronLeft, Eye, X } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface SavedMessage {
    id: string
    recipient: string
    subject?: string
    message: string
    fromName?: string
    timestamp: Date
    odds: number
}

interface MessageVaultProps {
    theme: any
    darkMode: boolean
    savedMessages: SavedMessage[]
    onResend: (message: SavedMessage) => void
    onDelete: (id: string) => void
    isCollapsed: boolean
    setIsCollapsed: (collapsed: boolean) => void
}

export function MessageVault({
    theme,
    darkMode,
    savedMessages,
    onResend,
    onDelete,
    isCollapsed,
    setIsCollapsed
}: MessageVaultProps) {
    const [selectedMessage, setSelectedMessage] = useState<SavedMessage | null>(null)

    // Format relative time (e.g., "2 hours ago", "3 days ago")
    const formatRelativeTime = (date: Date) => {
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
        if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
        if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`

        // For older messages, show the actual date
        return date.toLocaleDateString()
    }

    // Format the odds value to a readable string
    const formatOdds = (odds: number) => {
        const oddsMap: Record<number, string> = {
            1: "1 in 2",
            2: "1 in 10",
            3: "1 in 100",
            4: "1 in 1,000",
            5: "1 in 1,000,000",
        }
        return oddsMap[odds] || odds.toString()
    }

    // Truncate text with ellipsis
    const truncateText = (text: string, maxLength: number) => {
        if (!text) return '';
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
    }

    const hasMessages = savedMessages.length > 0;

    return (
        <motion.div
            className={`h-full ${isCollapsed ? 'w-16' : 'w-64 lg:w-80'} transition-all duration-300 flex-shrink-0`}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Collapse/Expand Button */}
            <Button
                variant="outline"
                size="sm"
                className={`absolute -left-3 top-24 z-10 rounded-full p-1 ${theme.buttonSecondary} ${theme.shadow} ${darkMode ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-white'}`}
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </Button>

            <Card className={`h-full w-full ${theme.glassCard} ${theme.shadow} border-l-0`}>
                <CardHeader className={`${theme.cardHeader} py-4 px-4 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                        <div className="flex items-center">
                            <Archive className={`h-5 w-5 ${darkMode ? "text-sky-400" : "text-blue-500"}`} />
                            {!isCollapsed && <h2 className="text-base font-medium ml-2.5">Message Vault</h2>}
                        </div>

                        {!isCollapsed && hasMessages && (
                            <Badge variant="outline" className={`${darkMode ? 'bg-slate-800/70 text-white border-white' : 'bg-blue-50 border-blue-200'}`}>
                                {savedMessages.length}
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <AnimatePresence mode="wait">
                    {!isCollapsed ? (
                        <motion.div
                            key="expanded"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <CardContent className={`p-3 ${hasMessages ? '' : 'h-full flex flex-col justify-center'}`}>
                                {!hasMessages ? (
                                    <div className={`flex flex-col items-center justify-center py-12 ${theme.subtext}`}>
                                        <Archive className="h-12 w-12 mb-3 opacity-30" />
                                        <p className="text-center font-medium">No saved messages</p>
                                        <p className="text-center text-xs mt-2 max-w-xs">Unsent messages with "Keep a copy" enabled will appear here</p>
                                    </div>
                                ) : (
                                    <ScrollArea className="h-[calc(100vh-9rem)]">
                                        <div className="space-y-3 pb-3">
                                            {savedMessages.map((msg) => (
                                                <motion.div
                                                    key={msg.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`p-3 rounded-lg cursor-pointer transition-all group ${darkMode
                                                        ? 'hover:bg-slate-800/90 bg-slate-900/50 border border-slate-800'
                                                        : 'hover:bg-slate-100/90 bg-white/70 border border-slate-200'
                                                        } relative`}
                                                    onClick={() => setSelectedMessage(msg)}
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
                                                                ? truncateText(msg.subject, 24)
                                                                : <span className={`${theme.subtext} italic`}>(No subject)</span>}
                                                        </div>
                                                    </div>

                                                    <div className={`text-xs mb-2 ${theme.subtext}`}>
                                                        To: {truncateText(msg.recipient, 24)}
                                                    </div>

                                                    <div className={`text-sm mb-3 line-clamp-2 ${theme.text}`}>
                                                        {truncateText(msg.message, 80)}
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

                                                            <TooltipProvider>
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
                                                            </TooltipProvider>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                )}
                            </CardContent>
                        </motion.div>
                    ) : (
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
                                        {savedMessages.length}
                                    </Badge>
                                )}
                                <TooltipProvider>
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
                                </TooltipProvider>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>

            {/* Message Details Modal */}
            <AnimatePresence>
                {selectedMessage && (
                    <motion.div
                        className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ${theme.text}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedMessage(null)}
                    >
                        <motion.div
                            className={`w-full max-w-md m-4 ${theme.card} overflow-hidden ${theme.shadow} rounded-lg`}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={`p-4 flex justify-between ${theme.cardHeader} items-center border-b`}>
                                <h3 className="text-lg font-medium">
                                    Message Details
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-8 w-8 rounded-full"
                                    onClick={() => setSelectedMessage(null)}
                                >
                                    <X size={16} />
                                </Button>
                            </div>

                            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div>
                                    <div className={`text-sm font-medium ${theme.subtext}`}>Subject</div>
                                    <div className="mt-1">{selectedMessage.subject || '(No subject)'}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className={`text-sm font-medium ${theme.subtext}`}>From</div>
                                        <div className="mt-1">{selectedMessage.fromName || 'Anonymous'}</div>
                                    </div>

                                    <div>
                                        <div className={`text-sm font-medium ${theme.subtext}`}>To</div>
                                        <div className="mt-1">{selectedMessage.recipient}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className={`text-sm font-medium ${theme.subtext}`}>Odds</div>
                                        <div className="mt-1">{formatOdds(selectedMessage.odds)}</div>
                                    </div>

                                    <div>
                                        <div className={`text-sm font-medium ${theme.subtext}`}>Date</div>
                                        <div className="mt-1">{selectedMessage.timestamp.toLocaleString()}</div>
                                    </div>
                                </div>

                                <div>
                                    <div className={`text-sm font-medium ${theme.subtext}`}>Message</div>
                                    <div className={`p-4 rounded-lg mt-1 ${theme.cardHeader} whitespace-pre-wrap`}>
                                        {selectedMessage.message}
                                    </div>
                                </div>
                            </div>

                            <div className={`p-4 flex justify-end gap-3 ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50/70'
                                } border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        onDelete(selectedMessage.id);
                                        setSelectedMessage(null);
                                    }}
                                    className="text-red-500"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                                <Button
                                    variant="default"
                                    className={theme.accent}
                                    onClick={() => {
                                        onResend(selectedMessage);
                                        setSelectedMessage(null);
                                    }}
                                >
                                    <Send className="mr-2 h-4 w-4" />
                                    Resend
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}