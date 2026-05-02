/**
 * Save / update player progress
 * POST /api/saveProgress
 * Body: { playerName: string, dateOfBirth: string, highestUnlockedLevel: number }
 * DOB is verified before updating to prevent unauthenticated level bumps.
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
    const { playerName, dateOfBirth, highestUnlockedLevel } = body;

    if (!playerName || !dateOfBirth || typeof highestUnlockedLevel !== 'number') {
      return new Response(JSON.stringify({ error: 'playerName, dateOfBirth and highestUnlockedLevel are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const player = await DB.prepare(
      'SELECT date_of_birth, highest_unlocked_level FROM player_progress WHERE player_name = ?'
    ).bind(playerName.trim()).first();

    if (!player) {
      return new Response(JSON.stringify({ error: 'Gebruiker niet gevonden.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    if (player.date_of_birth !== dateOfBirth) {
      return new Response(JSON.stringify({ error: 'Geboortedatum klopt niet.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Only update if the new level is higher than what's stored
    if (highestUnlockedLevel > player.highest_unlocked_level) {
      await DB.prepare(
        'UPDATE player_progress SET highest_unlocked_level = ?, updated_at = CURRENT_TIMESTAMP WHERE player_name = ?'
      ).bind(highestUnlockedLevel, playerName.trim()).run();
    }

    return new Response(JSON.stringify({
      success: true,
      highestUnlockedLevel: Math.max(highestUnlockedLevel, player.highest_unlocked_level)
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    return new Response(JSON.stringify({ error: 'Failed to save progress.', details: error.message }), {
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
