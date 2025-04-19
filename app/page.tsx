"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { v4 as uuidv4 } from 'uuid'
import { ComposeView } from "@/components/compose-view"
import { ProcessingView } from "@/components/processing-view"
import { ResultView } from "@/components/result-view"
import { MessageVault } from "@/components/message-vault"
import { ThemeToggle } from "@/components/ThemeToggle"
import { ConfettiEffect } from "@/components/Confetti"
import { useTheme } from "@/hooks/use-theme"

// Define types
interface SavedMessage {
  id: string
  recipient: string
  subject?: string
  message: string
  fromName?: string
  timestamp: Date
  odds: number
}

// Storage key constant
const STORAGE_KEY = 'savedMessages';

export default function Home() {
  // State management
  const [view, setView] = useState<"compose" | "processing" | "result">("compose")
  const [odds, setOdds] = useState(1)
  const [result, setResult] = useState<"sent" | "not-sent" | null>(null)
  const [showHeartbeat, setShowHeartbeat] = useState(false)
  const [darkMode, setDarkMode] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState<{
    recipient: string;
    subject: string;
    message: string;
    fromName: string;
    keepCopy: boolean;
    id?: string; // Add id field to track which message is being processed
  } | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [keepCopy, setKeepCopy] = useState(true)

  const formRef = useRef<HTMLFormElement>(null)
  const theme = useTheme(darkMode ?? false)

  // Load saved messages and set initial dark mode on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    // First check localStorage for user preference
    const savedTheme = localStorage.getItem("theme")

    if (savedTheme !== null) {
      // Use saved preference if available
      setDarkMode(savedTheme === "true")
    } else {
      // Fall back to system preference if no saved preference
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setDarkMode(systemPrefersDark)
      // Save the system preference to localStorage
      localStorage.setItem("theme", systemPrefersDark.toString())
    }

    // Load saved messages from localStorage
    try {
      const storedMessages = localStorage.getItem(STORAGE_KEY)

      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages, (key, value) => {
          return key === 'timestamp' ? new Date(value) : value
        })
        setSavedMessages(parsedMessages)

        // Auto-expand sidebar if there are saved messages on desktop
        const isDesktop = window.innerWidth >= 1024
        if (parsedMessages.length > 0 && isDesktop) {
          setSidebarCollapsed(false)
        }
      }
    } catch (error) {
      console.error('Error loading saved messages:', error)
      // Recovery - start with empty messages
      setSavedMessages([])
    }
  }, [])

  const calculateOutcome = useCallback((selectedOdds: number): boolean => {
    // Map the UI odds values to actual probability denominators
    const probabilityMap: Record<number, number> = {
      1: 2,        // 1 in 2 (50%)
      2: 5,        // 1 in 5 (20%)
      3: 10,       // 1 in 10 (10%)
      4: 50,       // 1 in 50 (2%)
      5: 100,      // 1 in 100 (1%)
      6: 1000,     // 1 in 1,000 (0.1%)
      7: 10000,    // 1 in 10,000 (0.01%)
      8: 100000,   // 1 in 100,000 (0.001%)
      9: 500000,   // 1 in 500,000 (0.0002%)
      10: 1000000  // 1 in 1,000,000 (0.0001%)
    }

    const denominator = probabilityMap[selectedOdds] || 2;

    // Generate a random number between 1 and the denominator
    const roll = Math.floor(Math.random() * denominator) + 1;

    // If roll is 1, success! Otherwise, failure
    return roll === 1;
  }, [])

  // Persist messages to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      if (savedMessages.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMessages))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (error) {
      console.error('Error saving messages to localStorage:', error)
    }
  }, [savedMessages])

  // Extract form data
  const extractFormData = useCallback(() => {
    if (!formRef.current) return null

    const formData = new FormData(formRef.current)
    const keepCopyElement = document.getElementById('keepCopy') as HTMLInputElement;

    return {
      recipient: formData.get('recipient') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      fromName: formData.get('fromName') as string,
      keepCopy: keepCopy
    }
  }, [keepCopy])

  // Save message to vault
  const saveMessage = useCallback((messageData: {
    recipient: string;
    subject: string;
    message: string;
    fromName: string;
  }) => {
    const newMessage: SavedMessage = {
      id: uuidv4(),
      recipient: messageData.recipient,
      subject: messageData.subject,
      message: messageData.message,
      fromName: messageData.fromName,
      timestamp: new Date(),
      odds: odds
    }

    // Update state with new message
    setSavedMessages(prev => {
      const updatedMessages = [newMessage, ...prev];
      return updatedMessages;
    });

    // Return the id so we can track it
    return newMessage.id;
  }, [odds])

  // Form submission handler
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setView("processing")

    // Extract and store current message data
    const formData = extractFormData()
    if (!formData) return

    setCurrentMessage(formData)

    // Switch to heartbeat animation after 2 seconds
    const heartbeatTimer = setTimeout(() => {
      setShowHeartbeat(true)
    }, 2000)

    // Determine result after a randomized processing time (4-6 seconds)
    const processingTime = Math.floor(Math.random() * 2000) + 4000
    const resultTimer = setTimeout(() => {
      // Calculate outcome based on selected odds
      const isSuccess = calculateOutcome(odds)
      const resultStatus = isSuccess ? "sent" : "not-sent"
      setResult(resultStatus)
      setView("result")
      setIsLoading(false)

      if (isSuccess) {
        setShowConfetti(true)
        // Hide confetti after 3 seconds
        setTimeout(() => {
          setShowConfetti(false)
        }, 3000)
      } else if (formData.keepCopy) {
        // Save unsent message to vault WHEN "keepCopy" is true
        const messageId = saveMessage({
          recipient: formData.recipient,
          subject: formData.subject,
          message: formData.message,
          fromName: formData.fromName
        });

        // Update currentMessage with the saved ID for potential future reference
        setCurrentMessage(prev => prev ? { ...prev, id: messageId } : null);
      }
    }, processingTime)

    // Cleanup timers if component unmounts
    return () => {
      clearTimeout(heartbeatTimer)
      clearTimeout(resultTimer)
    }
  }, [extractFormData, saveMessage, odds, calculateOutcome])

  // App reset handler
  const resetApp = useCallback(() => {
    setView("compose")
    setResult(null)
    setShowHeartbeat(false)
    setIsLoading(false)
    setShowConfetti(false)
    setCurrentMessage(null)
    if (formRef.current) {
      formRef.current.reset()
    }
    setOdds(1)
  }, [])

  // Try again handler with message deletion on success
  const tryAgain = useCallback(() => {
    setIsLoading(true)
    setView("processing")
    setShowHeartbeat(false)

    // Switch to heartbeat after 2 seconds
    const heartbeatTimer = setTimeout(() => {
      setShowHeartbeat(true)

      // Calculate outcome based on selected odds
      const resultTimer = setTimeout(() => {
        const isSuccess = calculateOutcome(odds)
        const resultStatus = isSuccess ? "sent" : "not-sent"
        setResult(resultStatus)
        setView("result")
        setIsLoading(false)

        if (isSuccess) {
          // Remove the message from savedMessages when successfully sent
          if (currentMessage && currentMessage.id) {
            setSavedMessages(prev => prev.filter(msg => msg.id !== currentMessage.id));
          }

          setShowConfetti(true)
          // Hide confetti after 3 seconds
          setTimeout(() => {
            setShowConfetti(false)
          }, 3000)
        }
      }, 3000)

      return () => clearTimeout(resultTimer)
    }, 2000)

    return () => clearTimeout(heartbeatTimer)
  }, [odds, calculateOutcome, currentMessage])

  // Handle resending a saved message
  const handleResend = useCallback((message: SavedMessage) => {
    // Fill the form with saved message data when returning to compose view
    setView("compose")
    setKeepCopy(true)

    // Store the message ID for reference
    setCurrentMessage({
      recipient: message.recipient,
      subject: message.subject || '',
      message: message.message,
      fromName: message.fromName || '',
      keepCopy: true,
      id: message.id
    });

    // Need to wait for form to be in the DOM
    setTimeout(() => {
      if (!formRef.current) return

      const form = formRef.current
      const elements = form.elements as any

      // Fill form fields
      elements.recipient.value = message.recipient
      elements.subject.value = message.subject || ''
      elements.message.value = message.message
      elements.fromName.value = message.fromName || ''

      // Automatically check the "Keep a copy" checkbox
      const keepCopyElement = document.getElementById('keepCopy') as HTMLInputElement;
      if (keepCopyElement) {
        keepCopyElement.checked = true;
      }

      // Set odds
      setOdds(message.odds)
    }, 100)
  }, [])

  // Handle deleting a saved message
  const handleDelete = useCallback((id: string) => {
    setSavedMessages(prev => {
      const updatedMessages = prev.filter(msg => msg.id !== id);
      return updatedMessages;
    })
  }, [])

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text} transition-colors duration-500`}>
      {showConfetti && <ConfettiEffect />}

      {/* Theme Toggle - Positioned in bottom right corner */}
      <div className="fixed bottom-5 right-1.5 z-20">
        <ThemeToggle darkMode={darkMode ?? false} setDarkMode={setDarkMode} theme={theme} />
      </div>

      {/* Main Layout */}
      <div className="flex min-h-screen">
        {/* Main Content Area */}
        <div className="flex-1 px-4 lg:px-8 py-6 lg:py-10 overflow-y-auto">
          <div className="max-w-xl mx-auto">
            <AnimatePresence>
              {/* Enhanced Header */}
              <motion.header
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-10"
              >
                <motion.div
                  className="relative inline-block mb-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <h1 className={`text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent ${theme.accent} mb-2`}>
                    Should I Should I Not
                  </h1>
                  <div className={`absolute -inset-1 ${theme.accent} opacity-20 blur-lg rounded-lg -z-10`}></div>
                </motion.div>
                <p className={`${theme.subtext} mb-6 text-lg`}>A coin toss for your boldest messages</p>
                <div className={`text-sm ${theme.glassCard} rounded-full px-6 py-3 inline-block ${theme.shadow} ${theme.glow}`}>
                  <span>
                    <span className={`font-semibold ${theme.highlight}`}>78,102</span> messages attempted.
                    <span className={`font-semibold ${theme.highlight} ml-1`}>39,009</span> sent.
                  </span>
                </div>
              </motion.header>
            </AnimatePresence>

            {/* Main View Container */}
            <AnimatePresence mode="wait">
              {view === "compose" && (
                <ComposeView
                  key="compose"
                  theme={theme}
                  formRef={formRef}
                  handleSubmit={handleSubmit}
                  odds={odds}
                  setOdds={setOdds}
                  darkMode={darkMode ?? false}
                  isLoading={isLoading}
                  keepCopy={keepCopy ?? false}
                  setKeepCopy={setKeepCopy}
                />
              )}

              {view === "processing" && (
                <ProcessingView
                  key="processing"
                  theme={theme}
                  showHeartbeat={showHeartbeat}
                  darkMode={darkMode ?? false}
                />
              )}

              {view === "result" && (
                <ResultView
                  key="result"
                  theme={theme}
                  result={result}
                  resetApp={resetApp}
                  tryAgain={tryAgain}
                  isLoading={isLoading}
                  darkMode={darkMode ?? false}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Message Vault Sidebar */}
        <div className="fixed right-0 top-0 h-full transition-all duration-300 z-10">
          <MessageVault
            theme={theme}
            darkMode={darkMode ?? false}
            savedMessages={savedMessages}
            onResend={handleResend}
            onDelete={handleDelete}
            isCollapsed={sidebarCollapsed}
            setIsCollapsed={setSidebarCollapsed}
          />
        </div>
      </div>
    </div>
  )
}