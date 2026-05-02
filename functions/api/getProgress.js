/**
 * Get player progress
 * GET /api/getProgress?playerName=...
 * Returns progress without DOB.
 */
export async function onRequestGet(context) {
  try {
    const { DB } = context.env;
    if (!DB) {
      return new Response(JSON.stringify({ error: 'Database not configured.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const url = new URL(context.request.url);
    const playerName = url.searchParams.get('playerName');

    if (!playerName) {
      return new Response(JSON.stringify({ error: 'playerName query parameter is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const player = await DB.prepare(
      'SELECT player_name, highest_unlocked_level FROM player_progress WHERE player_name = ?'
    ).bind(playerName.trim()).first();

    if (!player) {
      return new Response(JSON.stringify({ error: 'Gebruiker niet gevonden.' }), {
        status: 404,
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
    console.error('Error fetching progress:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch progress.', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
