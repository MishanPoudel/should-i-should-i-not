import { motion } from "framer-motion"
import { Send, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SavedMessage } from "@/components/MessageVault"
import { formatOdds } from "@/lib/utils"

interface MessageDetailsModalProps {
    message: SavedMessage
    theme: any
    darkMode: boolean
    onClose: () => void
    onDelete: (id: string) => void
    onResend: (message: SavedMessage) => void
}

export function MessageDetailsModal({
    message,
    theme,
    darkMode,
    onClose,
    onDelete,
    onResend
}: MessageDetailsModalProps) {
    return (
        <motion.div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ${theme.text}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                        onClick={onClose}
                    >
                        <X size={16} />
                    </Button>
                </div>

                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <div className={`text-sm font-medium ${theme.subtext}`}>Subject</div>
                        <div className="mt-1">{message.subject || '(No subject)'}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className={`text-sm font-medium ${theme.subtext}`}>From</div>
                            <div className="mt-1">{message.fromName || 'Anonymous'}</div>
                        </div>

                        <div>
                            <div className={`text-sm font-medium ${theme.subtext}`}>To</div>
                            <div className="mt-1">{message.recipient}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className={`text-sm font-medium ${theme.subtext}`}>Odds</div>
                            <div className="mt-1">{formatOdds(message.odds)}</div>
                        </div>

                        <div>
                            <div className={`text-sm font-medium ${theme.subtext}`}>Date</div>
                            <div className="mt-1">{message.timestamp.toLocaleString()}</div>
                        </div>
                    </div>

                    <div>
                        <div className={`text-sm font-medium ${theme.subtext}`}>Message</div>
                        <div className={`p-4 rounded-lg mt-1 ${theme.cardHeader} whitespace-pre-wrap`}>
                            {message.message}
                        </div>
                    </div>
                </div>

                <div className={`p-4 flex justify-end gap-3 ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50/70'
                    } border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    <Button
                        variant="outline"
                        onClick={() => {
                            onDelete(message.id);
                            onClose();
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
                            onResend(message);
                            onClose();
                        }}
                    >
                        <Send className="mr-2 h-4 w-4" />
                        Resend
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    )
}