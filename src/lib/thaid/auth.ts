import { getTHAIDConfig } from "./config";

// Type Definitions
interface OpenIDConfiguration {
  issuer: string;
  authorization_endpoint: string;
}

interface AuthorizationUrlResult {
  url: string;
  state: string;
  nonce: string;
}

interface StateValidationResult {
  isValid: boolean;
  error?: string;
  storedNonce?: string;
}

let discoveryCache: OpenIDConfiguration | null = null;

/**
 * Load OpenID Connect configuration from ThaID
 */
export async function loadOpenIDConfiguration(): Promise<OpenIDConfiguration> {
  if (discoveryCache) {
    return discoveryCache;
  }

  try {
    console.log("Loading OpenID Connect configuration from ThaID...");

    const THAID_CONFIG = getTHAIDConfig();

    const thaIDConfig: OpenIDConfiguration = {
      issuer: THAID_CONFIG.ISSUER,
      authorization_endpoint: `${THAID_CONFIG.ISSUER}/api/v2/oauth2/auth/`,
    };

    discoveryCache = thaIDConfig;
    return thaIDConfig;
  } catch (error) {
    console.error("Failed to load OpenID configuration:", error);
    throw new Error("Failed to initialize ThaID authentication");
  }
}

/**
 * Generate cryptographically secure random string for OAuth2 security
 */
function generateRandomString(length: number = 32): string {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let result = "";

  if (
    typeof window !== "undefined" &&
    window.crypto &&
    window.crypto.getRandomValues
  ) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }
  } else {
    // Fallback for server-side
    for (let i = 0; i < length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
  }

  return result;
}

/**
 * Create ThaID authorization URL for OAuth2 flow
 */
export async function createAuthorizationUrl(): Promise<AuthorizationUrlResult> {
  try {
    // Load OpenID configuration
    const oidcConfig = await loadOpenIDConfiguration();

    const THAID_CONFIG = getTHAIDConfig();

    // Generate random state and nonce for security
    const state = generateRandomString();
    const nonce = generateRandomString();

    // Store state and nonce in sessionStorage for validation later (if needed)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("thaid_state", state);
      sessionStorage.setItem("thaid_nonce", nonce);
    }

    // Build authorization URL with all required parameters
    const authUrl = new URL(oidcConfig.authorization_endpoint);

    const params: Record<string, string> = {
      client_id: THAID_CONFIG.CLIENT_ID,
      redirect_uri: THAID_CONFIG.REDIRECT_URL,
      response_type: THAID_CONFIG.RESPONSE_TYPE,
      scope: THAID_CONFIG.SCOPE,
      state: state,
      nonce: nonce,
    };

    // Add all parameters to the authorization URL
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        authUrl.searchParams.set(key, value);
      }
    });

    console.log("Generated ThaID authorization URL");
    console.log("Security parameters:", {
      state: state.substring(0, 8) + "...",
      nonce: nonce.substring(0, 8) + "...",
    });

    return {
      url: authUrl.toString(),
      state: state,
      nonce: nonce,
    };
  } catch (error) {
    console.error("Failed to create authorization URL:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error("Failed to initialize ThaID login: " + errorMessage);
  }
}

/**
 * Clean up ThaID session storage
 * Should be called when authentication fails or completes
 */
export function cleanupThaIDSession(): void {
  try {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("thaid_state");
      sessionStorage.removeItem("thaid_nonce");
      console.log("Cleaned up ThaID session storage");
    }
  } catch (error) {
    console.warn("Error cleaning up ThaID session:", error);
  }
}

/**
 * Validate OAuth2 callback state parameter for security
 * Compares the state received from ThaID with the one stored in sessionStorage
 */
export function validateCallbackState(
  receivedState: string | null
): StateValidationResult {
  try {
    if (typeof window === "undefined") {
      console.warn("Cannot validate state on server side");
      return { isValid: false, error: "Server-side validation not supported" };
    }

    const storedState = sessionStorage.getItem("thaid_state");
    const storedNonce = sessionStorage.getItem("thaid_nonce");

    console.log("Validating OAuth2 callback security parameters...");

    // Check if state parameter exists
    if (!receivedState) {
      console.error("Missing state parameter in callback");
      cleanupThaIDSession(); // Clean up on error
      return {
        isValid: false,
        error: "Missing state parameter - potential CSRF attack",
      };
    }

    // Check if stored state exists
    if (!storedState) {
      console.error("No stored state found in sessionStorage");
      cleanupThaIDSession(); // Clean up on error
      return {
        isValid: false,
        error: "No stored state found - session may have expired",
      };
    }

    // Validate state matches
    if (receivedState !== storedState) {
      console.error("State parameter mismatch - possible CSRF attack");
      console.error("Received:", receivedState.substring(0, 8) + "...");
      console.error("Expected:", storedState.substring(0, 8) + "...");
      cleanupThaIDSession(); // Clean up on security error
      return {
        isValid: false,
        error: "State parameter mismatch - security validation failed",
      };
    }

    console.log("OAuth2 state validation successful");

    // Clean up only state, keep nonce for backend validation
    sessionStorage.removeItem("thaid_state");

    return {
      isValid: true,
      storedNonce: storedNonce || undefined,
    };
  } catch (error) {
    console.error("Error validating callback state:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    cleanupThaIDSession(); // Clean up on any error
    return {
      isValid: false,
      error: "Validation error: " + errorMessage,
    };
  }
}

export default {
  createAuthorizationUrl,
  loadOpenIDConfiguration,
  validateCallbackState,
  cleanupThaIDSession,
};
