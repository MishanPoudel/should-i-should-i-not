import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SuccessAnimation, FailureAnimation } from "./Animations"
import { ShieldQuestionIcon } from "lucide-react"

interface ResultViewProps {
    theme: any
    result: "sent" | "not-sent" | null
    resetApp: () => void
    tryAgain: () => void
    isLoading: boolean
    darkMode: boolean
    sendingError?: string
    notifyResult: boolean  // Add the notification preference prop
    keepCopy: boolean       // Add the keepCopy prop
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
    sendingError,
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
                        </div>
                    ) : (
                        // Show not sent result when notification is enabled
                        <div>
                            <p className={`${theme.subtext} mb-4`}>
                                {sendingError ?
                                    sendingError :
                                    "The coin toss didn't go your way this time."
                                }
                            </p>
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