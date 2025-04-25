import { RefObject, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, Send, Settings, Dice1, Info } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { didYouKnowFacts } from "@/data/data"

// Function to convert odds to percentage
const oddsToPercentage = (odds: number): string => {
    const oddsValues = [50, 20, 10, 2, 1, 0.1, 0.01, 0.001, 0.0002, 0.0001];
    return `${oddsValues[odds - 1]}%`;
};

// Function to get a random fact for the current odds level
const getRandomFact = (odds: number): string => {
    const facts = didYouKnowFacts[odds.toString()];
    return facts[0]; // Always return the first fact initially
};

interface ComposeViewProps {
    theme: any
    formRef: RefObject<HTMLFormElement | null>
    handleSubmit: (e: React.FormEvent) => void
    odds: number
    setOdds: (value: number) => void
    darkMode: boolean
    isLoading: boolean
    keepCopy: boolean
    setKeepCopy: (value: boolean) => void
    notifyResult: boolean
    setNotifyResult: (value: boolean) => void
    emailError: string | null
}

export function ComposeView({
    theme,
    formRef,
    handleSubmit,
    odds,
    setOdds,
    darkMode,
    isLoading,
    keepCopy,
    setKeepCopy,
    notifyResult,
    setNotifyResult,
    emailError
}: ComposeViewProps) {
    // State for animating the slider value
    const [animatingOdds, setAnimatingOdds] = useState(odds);
    // State for the current fact
    const [currentFact, setCurrentFact] = useState(getRandomFact(odds));

    // Update animatingOdds and fact whenever odds changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const randomIndex = Math.floor(Math.random() * didYouKnowFacts[odds.toString()].length);
            setCurrentFact(didYouKnowFacts[odds.toString()][randomIndex]);
        }
    }, [odds]);

    // Expanded mapping with 10 odds values
    const oddsMap: Record<number, string> = {
        1: "1 in 2",
        2: "1 in 5",
        3: "1 in 10",
        4: "1 in 50",
        5: "1 in 100",
        6: "1 in 1,000",
        7: "1 in 10,000",
        8: "1 in 100,000",
        9: "1 in 500,000",
        10: "1 in 1,000,000"
    }

    return (
        <motion.div
            key="composer"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
        >
            <Card className={`${theme.glassCard} overflow-hidden ${theme.shadow} rounded-xl`}>
                <CardHeader className={`${theme.cardHeader} p-5`}>
                    <div className="flex items-center">
                        <MessageCircle className="mr-3 h-6 w-6" />
                        <h2 className="text-xl font-semibold">Compose Your Message</h2>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="recipient" className={`text-base ${theme.label}`}>
                                    To
                                </Label>
                                <Input
                                    type="email"
                                    id="recipient"
                                    name="recipient"
                                    required
                                    className={theme.input}
                                    placeholder="recipient@example.com"
                                />
                                {emailError && (
                                    <p className="text-red-500 text-sm mt-1">{emailError}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject" className={`text-base ${theme.label}`}>
                                    Subject (optional)
                                </Label>
                                <Input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    className={theme.input}
                                    placeholder="What's this about?"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fromName" className={`text-base ${theme.label}`}>
                                    From Name (optional)
                                </Label>
                                <Input
                                    type="text"
                                    id="fromName"
                                    name="fromName"
                                    placeholder="Anonymous"
                                    className={theme.input}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message" className={`text-base ${theme.label}`}>
                                    Your Message
                                </Label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    rows={6}
                                    required
                                    className={theme.input}
                                    placeholder="Type your message here..."
                                />
                            </div>
                        </div>

                        <Separator className={theme.border} />

                        {/* Enhanced Chance Selector with 10 Odds Levels and Animation */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <Dice1 className={`mr-2 h-5 w-5 ${darkMode ? "text-sky-400" : ""}`} />
                                    <h3 className={`text-lg font-medium ${theme.text}`}>Your Odds</h3>
                                </div>
                                <div className="flex items-center gap-3">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={odds}
                                            initial={{ y: -10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: 10, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Badge
                                                variant="outline"
                                                className={`text-base font-bold ${theme.highlight} ${darkMode ? "border-slate-700 bg-slate-800/50" : "border-blue-200"}`}
                                            >
                                                {oddsMap[odds]}
                                            </Badge>
                                        </motion.div>
                                    </AnimatePresence>
                                    <Badge
                                        variant="secondary"
                                        className={`text-sm ${darkMode ? "bg-slate-700 text-sky-300" : "bg-blue-50 text-blue-600"}`}
                                    >
                                        {oddsToPercentage(odds)}
                                    </Badge>
                                </div>
                            </div>

                            <div className="px-2">
                                <Slider
                                    defaultValue={[odds]}
                                    value={[odds]}
                                    max={10}
                                    min={1}
                                    step={1}
                                    onValueChange={(value) => {
                                        setOdds(value[0]);
                                    }}
                                    className={`${darkMode ? "[&_[role=slider]]:bg-sky-500" : "[&_[role=slider]]:bg-blue-500"} relative`}
                                />

                                {/* Animated highlight under the slider */}
                                <div className="relative h-3 mt-1">
                                    <motion.div
                                        className={`absolute h-1 rounded-full ${darkMode ? "bg-sky-500/30" : "bg-blue-500/30"}`}
                                        initial={false}
                                        animate={{
                                            left: `${((odds - 1) / 9) * 100}%`,
                                            width: '12px'
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 25
                                        }}
                                    />
                                </div>

                                <div className="flex justify-between text-xs mt-2">
                                    <span className={theme.subtext}>1 in 2</span>
                                    <span className={theme.subtext}>1 in 100</span>
                                    <span className={theme.subtext}>1 in 1,000,000</span>
                                </div>
                            </div>

                            {/* Did You Know Section */}
                            <div className={`mt-3 p-3 rounded-lg ${darkMode ? "bg-slate-800/50" : "bg-blue-50/80"}`}>
                                <div className="flex items-start gap-2">
                                    <Info className={`h-5 w-5 mt-0.5 ${darkMode ? "text-sky-400" : "text-blue-500"}`} />
                                    <div>
                                        <h4 className={`text-sm font-bold ${darkMode ? "text-sky-300" : "text-blue-600"}`}>
                                            Did you know?
                                        </h4>
                                        <AnimatePresence mode="wait">
                                            <motion.p
                                                key={currentFact}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className={`text-sm ${theme.text}`}
                                            >
                                                {currentFact}
                                            </motion.p>
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className={theme.border} />

                        {/* Settings Section */}
                        <div className="space-y-4">
                            <h3 className={`text-lg font-medium flex items-center ${theme.text}`}>
                                <Settings className={`mr-2 h-5 w-5 ${darkMode ? "text-sky-400" : ""}`} />
                                Settings
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="notifyResult" className={`cursor-pointer ${theme.label}`}>
                                        Do I want to know if it was sent?
                                    </Label>
                                    <Switch
                                        id="notifyResult"
                                        checked={notifyResult}
                                        onCheckedChange={setNotifyResult}
                                        className={`cursor-pointer ${theme.switch}`}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="keepCopy" className={`cursor-pointer ${theme.label}`}>
                                        Keep a copy if not sent
                                    </Label>
                                    <Switch
                                        id="keepCopy"
                                        checked={keepCopy && notifyResult}
                                        disabled={!notifyResult}
                                        onCheckedChange={setKeepCopy}
                                        className="cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-7 text-lg font-bold ${theme.accent} ${theme.accentHover} text-white mt-4 transition-all duration-300 ${theme.buttonGlow}`}
                        >
                            <Send className="mr-2 h-5 w-5" />
                            TAKE THE CHANCE
                        </Button>

                        <p className={`text-center text-sm ${theme.subtext}`}>No turning back once you hit this button</p>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    )
}