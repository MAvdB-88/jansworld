const STORAGE_KEY = 'jansworld_session';

/**
 * Manages player identity and progress persistence.
 * Stores session in localStorage; syncs to the Cloudflare D1 backend.
 */
export class ProgressManager {
  constructor() {
    this._session = this._loadSession();
  }

  _loadSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  _saveSession(session) {
    this._session = session;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('ProgressManager: failed to write localStorage', e);
    }
  }

  isLoggedIn() {
    return this._session !== null;
  }

  getPlayerName() {
    return this._session?.playerName ?? null;
  }

  getDateOfBirth() {
    return this._session?.dateOfBirth ?? null;
  }

  getHighestUnlockedLevel() {
    return this._session?.highestUnlockedLevel ?? 1;
  }

  /**
   * Register a new player and immediately log them in.
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async register(playerName, dateOfBirth) {
    try {
      const res = await fetch('/api/registerPlayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, dateOfBirth })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registratie mislukt.' };
      }
      this._saveSession({ playerName: data.playerName, dateOfBirth, highestUnlockedLevel: 1 });
      return { success: true };
    } catch (e) {
      console.error('ProgressManager.register error:', e);
      return { success: false, error: 'Geen verbinding met de server.' };
    }
  }

  /**
   * Log in an existing player.
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async login(playerName, dateOfBirth) {
    try {
      const res = await fetch('/api/loginPlayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, dateOfBirth })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Inloggen mislukt.' };
      }
      this._saveSession({
        playerName: data.playerName,
        dateOfBirth,
        highestUnlockedLevel: data.highestUnlockedLevel
      });
      return { success: true };
    } catch (e) {
      console.error('ProgressManager.login error:', e);
      return { success: false, error: 'Geen verbinding met de server.' };
    }
  }

  /**
   * Unlock a level. Updates localStorage immediately; syncs to backend.
   * @param {number} level
   */
  unlockLevel(level) {
    if (!this._session) return;
    if (level <= this._session.highestUnlockedLevel) return;

    this._session.highestUnlockedLevel = level;
    this._saveSession(this._session);

    // Fire-and-forget backend sync
    fetch('/api/saveProgress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerName: this._session.playerName,
        dateOfBirth: this._session.dateOfBirth,
        highestUnlockedLevel: level
      })
    }).catch(e => console.error('ProgressManager.unlockLevel sync error:', e));
  }

  logout() {
    this._session = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('ProgressManager.logout error:', e);
    }
  }

  /**
   * Search registered player names for autocomplete.
   * @param {string} query
   * @returns {Promise<string[]>}
   */
  async searchPlayers(query) {
    try {
      const res = await fetch(`/api/searchPlayers?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      return data.players || [];
    } catch {
      return [];
    }
  }
}
