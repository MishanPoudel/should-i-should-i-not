import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { AnimatedDice, AnimatedHeart } from "./Animations"

interface ProcessingViewProps {
    theme: any
    showHeartbeat: boolean
    darkMode: boolean
}

export function ProcessingView({ theme, showHeartbeat, darkMode }: ProcessingViewProps) {
    return (
        <motion.div
            key="processing"
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={`${theme.glassCard} ${theme.shadow} ${theme.glow} rounded-xl overflow-hidden p-8`}>
                <div className="h-64 flex items-center justify-center mb-8">
                    {!showHeartbeat ?
                        <AnimatedDice darkMode={darkMode} /> :
                        <AnimatedHeart darkMode={darkMode} />
                    }
                </div>

                <motion.div
                    className={`text-2xl font-bold ${theme.highlight}`}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    Deciding fate...
                </motion.div>
            </Card>
        </motion.div>
    )
}