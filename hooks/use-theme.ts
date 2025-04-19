export function useTheme(darkMode: boolean) {
    return {
        // Background and containers
        background: darkMode
            ? "bg-gradient-to-b from-slate-950 to-slate-900"
            : "bg-gradient-to-b from-blue-50 to-cream-50",
        card: darkMode
            ? "bg-slate-900 border border-slate-800 backdrop-blur-sm bg-opacity-80"
            : "bg-white border border-blue-100",
        cardHeader: darkMode
            ? "bg-slate-800 text-white border-b border-slate-700"
            : "bg-blue-100 text-slate-800 border-b border-blue-200",

        // Text colors
        text: darkMode ? "text-slate-100" : "text-slate-800",
        subtext: darkMode ? "text-slate-400" : "text-slate-500",
        rangeBg: "bg-blue-400",

        // Accent colors and buttons
        accent: darkMode
            ? "bg-gradient-to-r from-sky-600 to-blue-700"
            : "bg-gradient-to-r from-blue-400 to-blue-500",
        accentHover: darkMode
            ? "hover:from-sky-500 hover:to-blue-600"
            : "hover:from-blue-500 hover:to-blue-600",
        button: darkMode
            ? "bg-sky-600 text-white hover:bg-sky-500"
            : "bg-blue-500 hover:bg-blue-600 text-white",
        buttonSecondary: darkMode
            ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
            : "bg-cream-100 hover:bg-cream-200 text-slate-800 border border-blue-200",

        // Form elements
        input: darkMode
            ? "bg-slate-800 border border-slate-700 focus:border-sky-500 focus:ring-sky-500 text-white placeholder:text-slate-500"
            : "bg-white border border-blue-200 focus:border-blue-400 focus:ring-blue-400 placeholder:text-slate-400",

        label: darkMode
            ? "text-slate-400"
            : "text-slate-600",

        // Status colors
        success: darkMode ? "text-emerald-400" : "text-emerald-500",
        successBg: darkMode ? "bg-emerald-900/40" : "bg-emerald-100",
        error: darkMode ? "text-rose-400" : "text-rose-500",
        errorBg: darkMode ? "bg-rose-900/40" : "bg-rose-100",
        highlight: darkMode ? "text-sky-400" : "text-blue-600",

        // Misc
        border: darkMode ? "border-slate-800" : "border-blue-200",
        shadow: darkMode
            ? "shadow-lg shadow-sky-900/10"
            : "shadow-lg shadow-blue-200/50",
        toggleBackground: darkMode ? "bg-slate-800" : "bg-blue-200",

        // New theme elements
        glassCard: darkMode
            ? "bg-slate-900/90 backdrop-blur-md border border-slate-800/50"
            : "bg-white/90 backdrop-blur-md border border-blue-200/50",
        glow: darkMode ? "shadow-lg shadow-sky-500/20" : "",
        buttonGlow: darkMode ? "shadow-md shadow-sky-500/30" : "",

        // Additional theme elements
        cardBg: darkMode ? "bg-slate-900" : "bg-white",
        inputBg: darkMode ? "bg-slate-800" : "bg-white",
        buttonPrimary: darkMode
            ? "bg-sky-600 text-white hover:bg-sky-500"
            : "bg-blue-500 text-white hover:bg-blue-600",
        buttonDanger: darkMode
            ? "bg-rose-600 text-white hover:bg-rose-500"
            : "bg-rose-500 text-white hover:bg-rose-600",
    }
}