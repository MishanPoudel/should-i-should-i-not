import React from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, increment, update } from 'firebase/database';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

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
        const res = await fetch('/api/signin-owner', {
            method: 'POST',
        });

        if (!res.ok) {
            throw new Error('Failed to sign in as owner');
        }

        const data = await res.json();
        console.log('Signed in as owner:', data);
    } catch (error) {
        console.error('Sign-in error:', error);
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