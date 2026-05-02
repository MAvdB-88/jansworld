/**
 * Login a player
 * POST /api/loginPlayer
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

    if (!playerName || !dateOfBirth) {
      return new Response(JSON.stringify({ error: 'playerName and dateOfBirth are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const player = await DB.prepare(
      'SELECT player_name, date_of_birth, highest_unlocked_level FROM player_progress WHERE player_name = ?'
    ).bind(playerName.trim()).first();

    if (!player) {
      return new Response(JSON.stringify({ error: 'Gebruiker niet gevonden.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    if (player.date_of_birth !== dateOfBirth) {
      return new Response(JSON.stringify({ error: 'Geboortedatum klopt niet.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      playerName: player.player_name,
      highestUnlockedLevel: player.highest_unlocked_level
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('Error logging in player:', error);
    return new Response(JSON.stringify({ error: 'Failed to login.', details: error.message }), {
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
