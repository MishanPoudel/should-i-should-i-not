import { motion } from "framer-motion"
import { Dice1, Heart, Check, X } from "lucide-react"

// Custom animated dice icon for loading animation
export const AnimatedDice = ({ darkMode }: { darkMode: boolean }) => {
  return (
    <motion.div
      animate={{
        rotate: 360,
        scale: [1, 1.1, 1]
      }}
      transition={{
        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
        scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
      }}
      className={`w-32 h-32 flex items-center justify-center rounded-xl ${darkMode
        ? "bg-slate-800 text-sky-400 shadow-lg shadow-sky-900/20"
        : "bg-cream-100 text-blue-500 shadow-lg shadow-blue-200/50"
        }`}
    >
      <Dice1 size={80} />
    </motion.div>
  )
}

// Custom animated heart icon for heartbeat animation
export const AnimatedHeart = ({ darkMode }: { darkMode: boolean }) => {
  return (
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`w-32 h-32 flex items-center justify-center rounded-xl ${darkMode
        ? "bg-slate-800 text-sky-400 shadow-lg shadow-sky-900/20"
        : "bg-cream-100 text-blue-500 shadow-lg shadow-blue-200/50"
        }`}
    >
      <Heart size={80} />
    </motion.div>
  )
}

// Success animation with check mark
export const SuccessAnimation = ({ darkMode }: { darkMode: boolean }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", damping: 10, stiffness: 100 }}
      className={`w-28 h-28 rounded-full flex items-center justify-center ${darkMode
        ? "bg-emerald-900/40 border border-emerald-700"
        : "bg-emerald-100 border border-emerald-200"
        }`}
    >
      <Check className={darkMode ? "h-14 w-14 text-emerald-400" : "h-14 w-14 text-emerald-500"} />
    </motion.div>
  )
}

// Failure animation with X mark
export const FailureAnimation = ({ darkMode }: { darkMode: boolean }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", damping: 10, stiffness: 100 }}
      className={`w-28 h-28 rounded-full flex items-center justify-center ${darkMode
        ? "bg-rose-900/40 border border-rose-700"
        : "bg-rose-100 border border-rose-200"
        }`}
    >
      <X className={darkMode ? "h-14 w-14 text-rose-400" : "h-14 w-14 text-rose-500"} />
    </motion.div>
  )
}
