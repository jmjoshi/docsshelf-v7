/**
 * Session Management Service
 * Handles session timeout, activity tracking, and automatic logout
 * FR-LOGIN-010 implementation
 */

import * as SecureStore from 'expo-secure-store';
import { AppState, AppStateStatus } from 'react-native';

const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_KEY = 'session_data';

interface SessionData {
  lastActivity: number;
  sessionStart: number;
  isActive: boolean;
}

let activityTimer: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: any = null;

/**
 * Get current session data
 */
export async function getSessionData(): Promise<SessionData | null> {
  try {
    const data = await SecureStore.getItemAsync(SESSION_KEY);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to get session data:', error);
    return null;
  }
}

/**
 * Start a new session
 */
export async function startSession(): Promise<void> {
  const sessionData: SessionData = {
    lastActivity: Date.now(),
    sessionStart: Date.now(),
    isActive: true,
  };
  
  try {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(sessionData));
    console.log('[Session] Started new session');
  } catch (error) {
    console.error('Failed to start session:', error);
    throw error;
  }
}

/**
 * Update last activity timestamp
 */
export async function updateActivity(): Promise<void> {
  try {
    const session = await getSessionData();
    if (!session) {
      // No active session, start one
      await startSession();
      return;
    }
    
    session.lastActivity = Date.now();
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to update activity:', error);
  }
}

/**
 * End the current session
 */
export async function endSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    stopActivityMonitoring();
    console.log('[Session] Session ended');
  } catch (error) {
    console.error('Failed to end session:', error);
  }
}

/**
 * Check if session has expired
 * @returns true if session is valid, false if expired
 */
export async function isSessionValid(): Promise<boolean> {
  try {
    const session = await getSessionData();
    if (!session || !session.isActive) {
      return false;
    }
    
    const now = Date.now();
    const timeSinceLastActivity = now - session.lastActivity;
    
    if (timeSinceLastActivity > SESSION_TIMEOUT_MS) {
      console.log(`[Session] Session expired. Inactive for ${Math.round(timeSinceLastActivity / 1000 / 60)} minutes`);
      await endSession();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to check session validity:', error);
    return false;
  }
}

/**
 * Get session remaining time in milliseconds
 */
export async function getSessionRemainingTime(): Promise<number> {
  try {
    const session = await getSessionData();
    if (!session) {
      return 0;
    }
    
    const now = Date.now();
    const timeSinceLastActivity = now - session.lastActivity;
    const remaining = SESSION_TIMEOUT_MS - timeSinceLastActivity;
    
    return Math.max(0, remaining);
  } catch (error) {
    console.error('Failed to get remaining time:', error);
    return 0;
  }
}

/**
 * Start monitoring user activity and check for session timeout
 * @param onSessionExpired - Callback when session expires
 */
export function startActivityMonitoring(onSessionExpired: () => void): void {
  // Clear existing timer
  stopActivityMonitoring();
  
  // Check session validity every minute
  activityTimer = setInterval(async () => {
    const valid = await isSessionValid();
    if (!valid) {
      console.log('[Session] Session expired, calling expiration handler');
      stopActivityMonitoring();
      onSessionExpired();
    }
  }, 60 * 1000); // Check every minute
  
  // Monitor app state changes
  appStateSubscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App came to foreground, check if session is still valid
      console.log('[Session] App became active, checking session validity');
      const valid = await isSessionValid();
      if (!valid) {
        stopActivityMonitoring();
        onSessionExpired();
      } else {
        // Update activity timestamp
        await updateActivity();
      }
    } else if (nextAppState === 'background') {
      // App went to background, update activity
      console.log('[Session] App went to background');
      await updateActivity();
    }
  });
  
  console.log('[Session] Activity monitoring started');
}

/**
 * Stop monitoring activity
 */
export function stopActivityMonitoring(): void {
  if (activityTimer) {
    clearInterval(activityTimer);
    activityTimer = null;
  }
  
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
  
  console.log('[Session] Activity monitoring stopped');
}

/**
 * Format session remaining time for display
 */
export function formatSessionTime(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / (60 * 1000));
  const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Get session duration
 */
export async function getSessionDuration(): Promise<number> {
  try {
    const session = await getSessionData();
    if (!session) {
      return 0;
    }
    
    return Date.now() - session.sessionStart;
  } catch (error) {
    console.error('Failed to get session duration:', error);
    return 0;
  }
}
