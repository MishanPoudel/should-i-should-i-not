// src/lib/firebase.ts
import React from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, increment, update } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const email = process.env.NEXT_PUBLIC_FIREBASE_EMAIL;
const password = process.env.NEXT_PUBLIC_FIREBASE_PASSWORD;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Reference to message stats
const statsRef = ref(database, 'messageStats');

// Hook to get real-time message stats
export function useMessageStats() {
    const [stats, setStats] = React.useState({
        attempted: 0,
        sent: 0
    });

    React.useEffect(() => {
        const unsubscribe = onValue(statsRef, (snapshot) => {
            const data = snapshot.val() || { attempted: 0, sent: 0 };
            setStats(data);
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, []);

    return stats;
}

export async function signInAsOwner() {
    try {
        if (!email || !password) {
            throw new Error("Firebase email or password is not defined in environment variables.");
        }
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Signed in as owner");
    } catch (error) {
        console.error("Failed to sign in:", error);
    }
}

// Functions to increment counters
export function incrementAttempted() {
    update(statsRef, {
        attempted: increment(1)
    });
}

export function incrementSent() {
    update(statsRef, {
        sent: increment(1)
    });
}