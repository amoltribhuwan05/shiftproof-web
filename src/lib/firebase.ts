import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey:     process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId:      process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Guard initialization: NEXT_PUBLIC_ vars are absent during SSR / static build.
// All Firebase calls happen inside client-side event handlers and effects only.
const app = firebaseConfig.apiKey
  ? (getApps().length ? getApps()[0] : initializeApp(firebaseConfig))
  : null;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const auth = app ? getAuth(app) : null!;
