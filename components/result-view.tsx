import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SuccessAnimation, FailureAnimation } from "./Animations"

interface ResultViewProps {
    theme: any
    result: "sent" | "not-sent" | null
    resetApp: () => void
    tryAgain: () => void
    isLoading: boolean
    darkMode: boolean
}

export function ResultView({
    theme,
    result,
    resetApp,
    tryAgain,
    isLoading,
    darkMode
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
                    {result === "sent" ? (
                        <div>
                            <SuccessAnimation darkMode={darkMode} />

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
                        <div>
                            <FailureAnimation darkMode={darkMode} />

                            <h2 className={`text-3xl font-bold ${theme.error} mb-4`}>Not This Time</h2>
                            <p className={`${theme.subtext} mb-10 max-w-xs mx-auto text-lg`}>
                                Your message has been placed in the vault.
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                                <Button
                                    onClick={tryAgain}
                                    disabled={isLoading}
                                    className={`${theme.accent} ${theme.accentHover} text-white py-6 px-8 text-lg transition-all duration-300 ${theme.buttonGlow}`}
                                >
                                    Try Again
                                </Button>

                                <Button
                                    onClick={resetApp}
                                    variant="outline"
                                    disabled={isLoading}
                                    className={`${theme.buttonSecondary} py-6 px-8 text-lg transition-all duration-300`}
                                >
                                    New Message
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}