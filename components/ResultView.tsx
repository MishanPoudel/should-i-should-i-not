import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SuccessAnimation, FailureAnimation } from "./Animations"
import { ShieldQuestionIcon, AlertCircleIcon, HeartIcon } from "lucide-react"

interface ResultViewProps {
    theme: any
    result: "sent" | "not-sent" | null
    resetApp: () => void
    tryAgain: () => void
    isLoading: boolean
    darkMode: boolean
    sendingError?: string
    notifyResult: boolean
    keepCopy: boolean
    remainingTryAgainAttempts: number
}

export function ResultView({
    theme,
    result,
    resetApp,
    tryAgain,
    isLoading,
    darkMode,
    notifyResult,
    keepCopy,
    remainingTryAgainAttempts
}: ResultViewProps) {
    return (
        <motion.div
            key="result"
            className="text-center py-12 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={`${theme.glassCard} ${theme.shadow} ${theme.glow} rounded-xl overflow-hidden`}>
                <CardContent className="p-10 b">
                    {!notifyResult ? (
                        // Show mystery result when user doesn't want to know
                        <div>
                            <div className="flex justify-center mb-4">
                                <div className="w-24 h-24 flex items-center justify-center">
                                    <ShieldQuestionIcon size={64} className={`${darkMode ? "text-sky-400" : "text-blue-500"}`} />
                                </div>
                            </div>

                            <h2 className={`text-3xl font-bold mb-4 ${theme.text}`}>Fate Decided</h2>
                            <p className={`${theme.subtext} mb-10 max-w-xs mx-auto text-lg`}>
                                Your message's destiny has been determined, but you chose not to know its outcome.
                            </p>

                            <Button
                                onClick={resetApp}
                                className={`${theme.button} py-6 px-8 text-lg transition-all duration-300 ${theme.buttonGlow}`}
                            >
                                Write Another Message
                            </Button>
                        </div>
                    ) : result === "sent" ? (
                        // Show sent result when notification is enabled
                        <div>
                            <div className="flex justify-center mb-4">
                                <SuccessAnimation darkMode={darkMode} />
                            </div>

                            <h2 className={`text-3xl font-bold ${theme.success} mb-4`}>Message Sent!</h2>
                            <p className={`${theme.subtext} mb-10 max-w-xs mx-auto text-lg`}>
                                Your message has been delivered to its destination.
                            </p>

                            <Button
                                onClick={resetApp}
                                className={`${theme.button} py-6 px-8 text-lg transition-all duration-300 ${theme.buttonGlow}`}
                            >
                                Write Another Message
                            </Button>

                            {/* Spam folder notice */}
                            <div className={`mt-8 p-4 border ${darkMode ? "border-amber-600 bg-amber-950/30" : "border-amber-300 bg-amber-50"} rounded-lg`}>
                                <div className="flex items-start mb-3">
                                    <AlertCircleIcon className={`${darkMode ? "text-amber-500" : "text-amber-600"} mr-3 flex-shrink-0 mt-1`} size={20} />
                                    <p className={`text-left text-sm ${darkMode ? "text-amber-200" : "text-amber-800"}`}>
                                        Remind your recipient to check their spam folder if they don't see your message.
                                    </p>
                                </div>

                                <div className={`mt-3 pt-3 border-t ${darkMode ? "border-amber-700/50" : "border-amber-200"}`}>
                                    <p className={`text-sm mb-3 ${darkMode ? "text-amber-200" : "text-amber-800"}`}>
                                        Help keep this service running and improve delivery reliability! Your GitHub Sponsors donation will help fund a business email address to avoid spam filtering issues.
                                    </p>
                                    <a
                                        href="https://github.com/sponsors/MishanPoudel"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium ${darkMode
                                            ? "bg-amber-600 hover:bg-amber-500 text-amber-50"
                                            : "bg-amber-500 hover:bg-amber-600 text-white"} transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 
                                                ${darkMode ? "focus:ring-amber-500" : "focus:ring-amber-400"}`}>
                                        <svg className="mr-2 h-4 w-4" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                                        </svg>
                                        Support on GitHub Sponsors
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Show not sent result when notification is enabled
                        <div>
                            <div className="flex justify-center mb-4">
                                <FailureAnimation darkMode={darkMode} />
                            </div>

                            <h2 className={`text-3xl font-bold ${theme.error} mb-4`}>Not This Time</h2>
                            <p className={`${theme.subtext} mb-10 max-w-xs mx-auto text-lg`}>
                                {keepCopy ? "Your message has been placed in the vault." : "Your message was not saved."}
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                                {remainingTryAgainAttempts > 0 ? (
                                    <>
                                        <Button
                                            onClick={tryAgain}
                                            disabled={isLoading}
                                            className={`${theme.accent} ${theme.accentHover} text-white py-6 px-8 text-lg transition-all duration-300 ${theme.buttonGlow}`}
                                        >
                                            Try Again ({remainingTryAgainAttempts} left)
                                        </Button>

                                        <Button
                                            onClick={resetApp}
                                            variant="outline"
                                            disabled={isLoading}
                                            className={`${theme.buttonSecondary} py-6 px-8 text-lg transition-all duration-300`}
                                        >
                                            New Message
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={resetApp}
                                        className={`${theme.button} py-6 px-8 text-lg transition-all duration-300 ${theme.buttonGlow}`}
                                    >
                                        Write New Message
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}