import admin from "firebase-admin";

// Utility function for safe error message extraction
function getErrorMessage(error: unknown): string {
    // 1. Check if the error is a standard Error object
    if (error instanceof Error) {
        return error.message;
    }
    // 2. Check if the error is an object with a 'message' property
    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
    ) {
        return (error as { message: string }).message;
    }
    // 3. Fallback: Convert anything else to a string
    return String(error);
}

const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!admin.apps.length) {
    if (!serviceAccountEnv) {
        throw new Error("Missing FIREBASE_SERVICE_ACCOUNT env variable");
    }

    // --- START DEBUG BLOCK ---
    console.log("--- Firebase Admin Debug ---");
    console.log("1. Environment Variable Loaded (Start 50 chars):", serviceAccountEnv.substring(0, 50) + "...");

    try {
        const serviceAccount = JSON.parse(serviceAccountEnv);

        // Crucial fix: Replace escaped newlines for the private key to be valid
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

        console.log("2. Project ID:", serviceAccount.project_id);
        
        // CHECK 1 & 2
        const pkLength = serviceAccount.private_key.length;
        console.log("3. Private Key Start:", serviceAccount.private_key.substring(0, 30) + "..."); 
        console.log("4. Private Key End:", serviceAccount.private_key.substring(pkLength - 30)); 

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        
        console.log("5. Firebase Admin SDK Initialized Successfully.");

    } catch (error) {
        // --- FIX IS HERE ---
        const errorMessage = getErrorMessage(error);
        console.error("6. FATAL ERROR during Service Account initialization:", errorMessage);
        throw new Error(`Failed to parse/initialize Firebase Admin SDK: ${errorMessage}`);
    }
    console.log("--- END Firebase Admin Debug ---");
}

// Export helpers for convenience
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();

export default admin;