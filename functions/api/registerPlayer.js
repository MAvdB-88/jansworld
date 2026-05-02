/**
 * Register a new player
 * POST /api/registerPlayer
 * Body: { playerName: string, dateOfBirth: string (YYYY-MM-DD) }
 */
export async function onRequestPost(context) {
  try {
    const { DB } = context.env;
    if (!DB) {
      return new Response(JSON.stringify({ error: 'Database not configured.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const body = await context.request.json();
    const { playerName, dateOfBirth } = body;

    if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'playerName is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!dateOfBirth || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      return new Response(JSON.stringify({ error: 'dateOfBirth is required in YYYY-MM-DD format.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const trimmedName = playerName.trim();

    // Check if name is already taken
    const existing = await DB.prepare(
      'SELECT id FROM player_progress WHERE player_name = ?'
    ).bind(trimmedName).first();

    if (existing) {
      return new Response(JSON.stringify({ error: 'Gebruikersnaam is al bezet.' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    await DB.prepare(
      'INSERT INTO player_progress (player_name, date_of_birth, highest_unlocked_level, updated_at) VALUES (?, ?, 1, CURRENT_TIMESTAMP)'
    ).bind(trimmedName, dateOfBirth).run();

    return new Response(JSON.stringify({
      success: true,
      playerName: trimmedName,
      highestUnlockedLevel: 1
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('Error registering player:', error);
    return new Response(JSON.stringify({ error: 'Failed to register player.', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
