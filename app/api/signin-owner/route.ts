import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { NextResponse } from 'next/server';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function POST() {
    const email = process.env.FIREBASE_EMAIL;
    const password = process.env.FIREBASE_PASSWORD;

    if (!email || !password) {
        return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        return NextResponse.json({ uid: user.uid, email: user.email }, { status: 200 });
    } catch (error: any) {
        console.error("Sign-in failed:", error.message);
        return NextResponse.json({ error: 'Auth failed', details: error.message }, { status: 401 });
    }
}
