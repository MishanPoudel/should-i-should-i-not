import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Archive, ChevronRight, ChevronLeft } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"

import { MessageList } from "@/components/MessageList"
import { EmptyState } from "@/components/EmptyState"
import { MessageDetailsModal } from "@/components/MessageDetailsModal"
import { CollapsedView } from "@/components/CollapsedView"

export interface SavedMessage {
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
    const hasMessages = savedMessages.length > 0

    return (
        <TooltipProvider>
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
                                <CardContent className={`${hasMessages ? '' : 'h-full flex flex-col justify-center'} p-3`}>
                                    {!hasMessages ? (
                                        <EmptyState theme={theme} />
                                    ) : (
                                        <MessageList
                                            savedMessages={savedMessages}
                                            theme={theme}
                                            darkMode={darkMode}
                                            onDelete={onDelete}
                                            onSelect={setSelectedMessage}
                                            onResend={onResend}
                                        />
                                    )}
                                </CardContent>
                            </motion.div>
                        ) : (
                            <CollapsedView
                                hasMessages={hasMessages}
                                messagesCount={savedMessages.length}
                                darkMode={darkMode}
                                setIsCollapsed={setIsCollapsed}
                            />
                        )}
                    </AnimatePresence>
                </Card>

                {/* Message Details Modal */}
                {selectedMessage && (
                    <MessageDetailsModal
                        message={selectedMessage}
                        theme={theme}
                        darkMode={darkMode}
                        onClose={() => setSelectedMessage(null)}
                        onDelete={onDelete}
                        onResend={onResend}
                    />
                )}
            </motion.div>
        </TooltipProvider>
    )
}