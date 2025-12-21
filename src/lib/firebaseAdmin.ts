import admin from "firebase-admin";

// Utility function for safe error message extraction
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
    ) {
        return (error as { message: string }).message;
    }
    return String(error);
}

const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!admin.apps.length) {
    if (!serviceAccountEnv) {
        throw new Error("Missing FIREBASE_SERVICE_ACCOUNT env variable");
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountEnv);
        
        // Replace escaped newlines for the private key to be valid
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(`Failed to parse/initialize Firebase Admin SDK: ${errorMessage}`);
    }
}

// Export helpers for convenience
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();

export default admin;