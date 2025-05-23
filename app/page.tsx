"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { v4 as uuidv4 } from 'uuid'
import { ComposeView } from "@/components/ComposeView"
import { ProcessingView } from "@/components/ProcessingView"
import { ResultView } from "@/components/ResultView"
import { MessageVault } from "@/components/MessageVault"
import { ThemeToggle } from "@/components/ThemeToggle"
import { ConfettiEffect } from "@/components/Confetti"
import { useTheme } from "@/hooks/use-theme"
import { ToastContainer, toast, ToastPosition } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { incrementAttempted, incrementSent, useMessageStats } from "@/lib/firebase"
import { name } from "@/data/data"
import { signInAsOwner } from "@/lib/firebase"

// Type definitions
interface SavedMessage {
  id: string
  recipient: string
  subject?: string
  message: string
  fromName?: string
  timestamp: Date
  odds: number
}

interface EmailUsage {
  email: string
  lastUsed: Date
  attempts: number
}

interface TryAgainCounter {
  messageId: string
  attempts: number
}

interface MessageData {
  recipient: string
  subject: string
  message: string
  fromName: string
  keepCopy?: boolean
  id?: string
}

// Constants
const STORAGE_KEYS = {
  MESSAGES: 'savedMessages',
  EMAIL_USAGE: 'emailUsage',
  TRY_AGAIN: 'tryAgainAttempts',
  THEME: 'theme'
}

const COOLDOWN_PERIOD = 12 * 60 * 60 * 1000
const MAX_RETRY_ATTEMPTS = 3

// Probability mapping for odds selector
const PROBABILITY_MAP = {
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

// Helper functions
const setInLocalStorage = (key: string, value: any): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error)
    toast.error("Unable to save data to local storage")
  }
}

function getFromLocalStorage<T>(key: string, parser: (value: string) => T): T | null {
  const value = localStorage.getItem(key);
  if (!value) return null;

  try {
    return parser(value);
  } catch (error) {
    console.error(`Error parsing localStorage value for key ${key}:`, error);
    return null;
  }
}

// API handler for sending emails
const sendEmail = async (messageData: MessageData) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: messageData.recipient,
        subject: messageData.subject,
        text: messageData.message,
        from: messageData.fromName,
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Failed to send email')
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

export default function Home() {
  // App state
  const [view, setView] = useState<"compose" | "processing" | "result">("compose")
  const [odds, setOdds] = useState(1)
  const [result, setResult] = useState<"sent" | "not-sent" | null>(null)
  const [showHeartbeat, setShowHeartbeat] = useState(false)
  const [darkMode, setDarkMode] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState<MessageData | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [keepCopy, setKeepCopy] = useState(true)
  const [notifyResult, setNotifyResult] = useState(true)
  const [usedEmails, setUsedEmails] = useState<EmailUsage[]>([])
  const [tryAgainAttempts, setTryAgainAttempts] = useState<TryAgainCounter[]>([])
  const [emailError, setEmailError] = useState<string | null>(null)

  // Refs
  const formRef = useRef<HTMLFormElement>(null)
  const processTimerRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Theme
  const theme = useTheme(darkMode ?? false)

  // Stats
  const stats = useMessageStats();

  // Memoized functions
  const calculateOutcome = useCallback((selectedOdds: number): boolean => {
    const denominator = PROBABILITY_MAP[selectedOdds as keyof typeof PROBABILITY_MAP] || 2
    return Math.floor(Math.random() * denominator) + 1 === 1
  }, [])

  const isEmailOnCooldown = useCallback((email: string): boolean => {
    const emailUsage = usedEmails.find(usage => usage.email === email)
    if (!emailUsage || emailUsage.attempts < 4) return false

    const now = new Date()
    return (now.getTime() - emailUsage.lastUsed.getTime()) < COOLDOWN_PERIOD
  }, [usedEmails])

  const getCooldownTimeRemaining = useCallback((email: string): string => {
    const emailUsage = usedEmails.find(usage => usage.email === email)
    if (!emailUsage) return "0 hours"

    const now = new Date()
    const timeRemaining = Math.max(0, COOLDOWN_PERIOD - (now.getTime() - emailUsage.lastUsed.getTime()))

    if (timeRemaining <= 0) return "0 hours"

    const hoursRemaining = Math.ceil(timeRemaining / (60 * 60 * 1000))
    return `${hoursRemaining} ${hoursRemaining === 1 ? 'hour' : 'hours'}`
  }, [usedEmails])

  const trackEmailUsage = useCallback((email: string) => {
    setUsedEmails(prev => {
      const existing = prev.find(usage => usage.email === email)
      if (existing) {
        return prev.map(usage =>
          usage.email === email
            ? { ...usage, attempts: (usage.attempts || 0) + 1, lastUsed: new Date() }
            : usage
        )
      } else {
        return [...prev, { email, attempts: 1, lastUsed: new Date() }]
      }
    })
  }, [])

  const getRemainingTryAgainAttempts = useCallback((messageId: string): number => {
    const attemptCounter = tryAgainAttempts.find(counter => counter.messageId === messageId)
    return attemptCounter ? Math.max(0, MAX_RETRY_ATTEMPTS - attemptCounter.attempts) : MAX_RETRY_ATTEMPTS
  }, [tryAgainAttempts])

  const incrementTryAgainCounter = useCallback((messageId: string) => {
    setTryAgainAttempts(prev => {
      const existing = prev.find(counter => counter.messageId === messageId)
      if (existing) {
        return prev.map(counter =>
          counter.messageId === messageId
            ? { ...counter, attempts: counter.attempts + 1 }
            : counter
        )
      } else {
        return [...prev, { messageId, attempts: 1 }]
      }
    })
  }, [])

  const extractFormData = useCallback((): MessageData | null => {
    if (!formRef.current) return null

    const formData = new FormData(formRef.current)
    return {
      recipient: formData.get('recipient') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      fromName: formData.get('fromName') as string,
      keepCopy
    }
  }, [keepCopy])

  const saveMessage = useCallback((messageData: MessageData): string => {
    const newMessage: SavedMessage = {
      id: messageData.id || uuidv4(),
      recipient: messageData.recipient,
      subject: messageData.subject,
      message: messageData.message,
      fromName: messageData.fromName,
      timestamp: new Date(),
      odds
    }

    setSavedMessages(prev => [newMessage, ...prev])
    toast.info("Message saved to vault")
    return newMessage.id
  }, [odds])

  const cleanupExpiredEmailRecords = useCallback(() => {
    const now = new Date()
    setUsedEmails(prev => {
      const filtered = prev.filter(usage => now.getTime() - usage.lastUsed.getTime() < COOLDOWN_PERIOD)
      if (filtered.length !== prev.length) {
        toast.info("Some email cooldowns have expired")
      }
      return filtered
    })
  }, [])

  const cleanupTryAgainCounters = useCallback(() => {
    const validMessageIds = savedMessages.map(msg => msg.id)
    setTryAgainAttempts(prev => prev.filter(counter => validMessageIds.includes(counter.messageId)))
  }, [savedMessages])

  // Process and send message
  const processAndSendMessage = useCallback(async (messageData: MessageData, isRetry = false) => {
    const isSuccess = calculateOutcome(odds)
    trackEmailUsage(messageData.recipient)

    if (isSuccess) {
      try {
        const sendResult = await sendEmail(messageData)

        if (!sendResult.success) {
          setResult("not-sent")
          toast.error("Failed to send email")
        } else {
          // Successful send
          incrementSent();
          setResult("sent")

          // Remove from saved messages if this was a retry
          if (isRetry && messageData.id) {
            setSavedMessages(prev => prev.filter(msg => msg.id !== messageData.id))
          }

          if (notifyResult) {
            toast.success("Email sent successfully!")
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 3000)
          }
        }
      } catch (error) {
        console.error("Error in send email process:", error)
        setResult("not-sent")
        toast.error("Error sending email")
      }
    } else {
      setResult("not-sent")

      if (notifyResult) {
        toast.info(isRetry ? "The odds weren't in your favor this time either" : "The odds weren't in your favor")

        // Only save on first attempt, not retry
        if (!isRetry && messageData.keepCopy) {
          const messageId = saveMessage(messageData)
          setCurrentMessage(prev => prev ? { ...prev, id: messageId } : null)
        }
      }
    }

    setView("result")
    setIsLoading(false)
  }, [calculateOutcome, trackEmailUsage, odds, incrementSent, notifyResult, saveMessage])

  useEffect(() => {
    signInAsOwner();
  }, []);

  // Form submission handler
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setEmailError(null)

    // Always increment attempted counter when form is submitted
    incrementAttempted();

    // Extract and validate form data
    const formData = extractFormData()
    if (!formData) return

    if (!formData.recipient.trim()) {
      toast.error("Please enter a recipient email address")
      return
    }

    if (!formData.message.trim()) {
      toast.error("Please enter a message")
      return
    }

    // Check cooldown status
    if (isEmailOnCooldown(formData.recipient)) {
      const timeRemaining = getCooldownTimeRemaining(formData.recipient)
      setEmailError(`This email address was recently used. Please wait ${timeRemaining} before trying again.`)
      toast.warning(`Email cooldown: Wait ${timeRemaining}`)
      return
    }

    // Start processing
    setIsLoading(true)
    setView("processing")
    setCurrentMessage(formData)

    // Show heartbeat animation after delay
    heartbeatTimerRef.current = setTimeout(() => {
      setShowHeartbeat(true)
    }, 2000)

    // Calculate result after random processing time
    const processingTime = Math.floor(Math.random() * 2000) + 4000
    processTimerRef.current = setTimeout(() => {
      processAndSendMessage(formData)
    }, processingTime)
  }, [
    extractFormData,
    isEmailOnCooldown,
    getCooldownTimeRemaining,
    processAndSendMessage,
    incrementAttempted
  ])

  // Reset app to initial state
  const resetApp = useCallback(() => {
    setView("compose")
    setResult(null)
    setShowHeartbeat(false)
    setIsLoading(false)
    setShowConfetti(false)
    setCurrentMessage(null)
    setEmailError(null)

    if (formRef.current) {
      formRef.current.reset()
    }

    setOdds(1)
    toast.info("Starting fresh")

    // Run cleanup operations
    cleanupExpiredEmailRecords()
    cleanupTryAgainCounters()
  }, [cleanupExpiredEmailRecords, cleanupTryAgainCounters])

  // Try sending a message again
  const tryAgain = useCallback(() => {
    // Validate current message
    if (!currentMessage || !currentMessage.id) {
      toast.error("Cannot retry: Missing message information")
      return
    }

    // Check retry attempt limits
    const remainingAttempts = getRemainingTryAgainAttempts(currentMessage.id)
    if (remainingAttempts <= 0) {
      toast.warning("No retry attempts remaining")
      return
    }

    // Check cooldown status
    if (isEmailOnCooldown(currentMessage.recipient)) {
      const timeRemaining = getCooldownTimeRemaining(currentMessage.recipient)
      toast.warning(`Email cooldown: Wait ${timeRemaining}`)
      return
    }

    // Increment retry counter
    incrementTryAgainCounter(currentMessage.id)
    incrementAttempted();
    toast.info(`Retry attempt ${MAX_RETRY_ATTEMPTS - remainingAttempts + 1}/${MAX_RETRY_ATTEMPTS}`)

    // Start processing
    setIsLoading(true)
    setView("processing")
    setShowHeartbeat(false)

    // Show heartbeat after delay and then process
    heartbeatTimerRef.current = setTimeout(() => {
      setShowHeartbeat(true)

      processTimerRef.current = setTimeout(() => {
        processAndSendMessage(currentMessage, true)
      }, 3000)
    }, 2000)
  }, [
    currentMessage,
    getRemainingTryAgainAttempts,
    isEmailOnCooldown,
    getCooldownTimeRemaining,
    incrementTryAgainCounter,
    processAndSendMessage
  ])

  // Handle resending a saved message
  const handleResend = useCallback((message: SavedMessage) => {
    setView("compose")
    setNotifyResult(true)
    setKeepCopy(true)
    setEmailError(null)

    setCurrentMessage({
      recipient: message.recipient,
      subject: message.subject || '',
      message: message.message,
      fromName: message.fromName || '',
      keepCopy: true,
      id: message.id
    })

    toast.info("Message loaded for resending")

    // Wait for form to be in DOM
    setTimeout(() => {
      if (!formRef.current) return

      const form = formRef.current
      const elements = form.elements as any

      // Fill form fields
      elements.recipient.value = message.recipient
      elements.subject.value = message.subject || ''
      elements.message.value = message.message
      elements.fromName.value = message.fromName || ''

      // Set odds
      setOdds(message.odds)
    }, 100)
  }, [])

  // Delete a saved message
  const handleDelete = useCallback((id: string) => {
    setSavedMessages(prev => prev.filter(msg => msg.id !== id))
    toast.info("Message deleted from vault")
  }, [])

  // Handle notification preference changes
  const handleNotifyResultChange = useCallback((value: boolean) => {
    setNotifyResult(value)
    // Link keepCopy to notifyResult
    if (!value) {
      setKeepCopy(false)
    }
  }, [])

  // Keep notifyResult and keepCopy states linked
  useEffect(() => {
    if (!notifyResult) setKeepCopy(false)
  }, [notifyResult])

  // Initialize app from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return

    // Set theme preference
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME)
    if (savedTheme !== null) {
      setDarkMode(savedTheme === "true")
    } else {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setDarkMode(systemPrefersDark)
      localStorage.setItem(STORAGE_KEYS.THEME, systemPrefersDark.toString())
    }

    try {
      // Load saved messages with date parsing
      const parseDateReviver = (_key: string, value: any) =>
        _key === 'timestamp' || _key === 'lastUsed' ? new Date(value) : value;

      // Load saved messages
      const storedMessages = getFromLocalStorage<SavedMessage[]>(
        STORAGE_KEYS.MESSAGES,
        (value) => JSON.parse(value, parseDateReviver)
      );

      if (storedMessages) {
        setSavedMessages(storedMessages)

        // Auto-expand sidebar if messages exist on desktop
        const isDesktop = window.innerWidth >= 1024
        if (storedMessages.length > 0 && isDesktop) {
          setSidebarCollapsed(false)
        }
      }

      // Load email usage history
      const storedEmailUsage = getFromLocalStorage<EmailUsage[]>(
        STORAGE_KEYS.EMAIL_USAGE,
        (value) => JSON.parse(value, parseDateReviver)
      );

      if (storedEmailUsage) {
        try {
          // Add attempts property if missing
          const migratedEmailUsage = storedEmailUsage.map((usage: any) => ({
            ...usage,
            attempts: usage.attempts || 1
          }))
          setUsedEmails(migratedEmailUsage)
        } catch (error) {
          console.error("Error parsing email usage data:", error)
          toast.error("Invalid email usage data found. Resetting to default.")
          setUsedEmails([])
          localStorage.removeItem(STORAGE_KEYS.EMAIL_USAGE)
        }
      }

      // Load try again attempts
      const storedTryAgainAttempts = getFromLocalStorage<TryAgainCounter[]>(
        STORAGE_KEYS.TRY_AGAIN,
        (value) => JSON.parse(value)
      );
      if (storedTryAgainAttempts) {
        setTryAgainAttempts(storedTryAgainAttempts)
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error)
      toast.error("Unable to load saved data")
      // Recovery - reset to empty states
      setSavedMessages([])
      setUsedEmails([])
      setTryAgainAttempts([])
    }
  }, [])

  // Persist data to localStorage
  useEffect(() => {
    if (savedMessages.length > 0) {
      setInLocalStorage(STORAGE_KEYS.MESSAGES, savedMessages)
    } else {
      localStorage.removeItem(STORAGE_KEYS.MESSAGES)
    }
  }, [savedMessages])

  useEffect(() => {
    if (usedEmails.length > 0) {
      setInLocalStorage(STORAGE_KEYS.EMAIL_USAGE, usedEmails)
    } else {
      localStorage.removeItem(STORAGE_KEYS.EMAIL_USAGE)
    }
  }, [usedEmails])

  useEffect(() => {
    if (darkMode !== null) {
      localStorage.setItem(STORAGE_KEYS.THEME, darkMode.toString())
    }
  }, [darkMode])

  useEffect(() => {
    if (tryAgainAttempts.length > 0) {
      setInLocalStorage(STORAGE_KEYS.TRY_AGAIN, tryAgainAttempts)
    } else {
      localStorage.removeItem(STORAGE_KEYS.TRY_AGAIN)
    }
  }, [tryAgainAttempts])

  // Run cleanup operations on mount and interval
  useEffect(() => {
    cleanupExpiredEmailRecords()
    cleanupTryAgainCounters()

    const cleanupInterval = setInterval(() => {
      cleanupExpiredEmailRecords()
      cleanupTryAgainCounters()
    }, 3600000) // Run every hour

    return () => clearInterval(cleanupInterval)
  }, [cleanupExpiredEmailRecords, cleanupTryAgainCounters])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (processTimerRef.current) clearTimeout(processTimerRef.current)
      if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current)
    }
  }, [])

  // Toast configuration
  const toastConfig = useMemo(() => ({
    position: "bottom-left" as ToastPosition,
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: darkMode ? 'dark' : 'light',
  }), [darkMode]);

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text} transition-colors duration-500`}>
      {showConfetti && <ConfettiEffect />}

      {/* Toast notifications */}
      <ToastContainer {...toastConfig} />

      {/* Theme toggle button */}
      <div className="fixed bottom-5 right-1.5 z-20">
        <ThemeToggle darkMode={darkMode ?? false} setDarkMode={setDarkMode} theme={theme} />
      </div>

      {/* Main layout */}
      <div className="flex min-h-screen select-none">
        {/* Content area */}
        <div className="flex-1 px-4 lg:px-8 py-6 lg:py-10 overflow-y-auto">
          <div className="max-w-xl mx-auto">
            <AnimatePresence>
              {/* App header */}
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
                  <h1 onClick={resetApp} className={`text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent ${theme.accent} mb-2 hover:cursor-pointer`}>
                    {name}
                  </h1>
                  <div className={`absolute -inset-1 ${theme.accent} opacity-20 blur-lg rounded-lg -z-10`}></div>
                </motion.div>
                <p className={`${theme.subtext} mb-6 text-lg`}>A coin toss for your boldest messages</p>
                <div className={`text-sm ${theme.glassCard} rounded-full px-6 py-3 inline-block ${theme.shadow} ${theme.glow}`}>
                  <span>
                    <span className={`font-semibold ${theme.highlight}`}>{stats.attempted.toLocaleString()}</span> messages attempted.
                    <span className={`font-semibold ${theme.highlight} ml-1`}>{stats.sent.toLocaleString()}</span> sent.
                  </span>
                </div>
              </motion.header>
            </AnimatePresence>

            {/* Main view container with view transitions */}
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
                  keepCopy={keepCopy}
                  setKeepCopy={setKeepCopy}
                  notifyResult={notifyResult}
                  setNotifyResult={handleNotifyResultChange}
                  emailError={emailError}
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
                  notifyResult={notifyResult}
                  keepCopy={keepCopy}
                  remainingTryAgainAttempts={currentMessage?.id ? getRemainingTryAgainAttempts(currentMessage.id) : 0}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Message vault sidebar */}
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