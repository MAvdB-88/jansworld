/**
 * Search player names for autocomplete
 * GET /api/searchPlayers?q=...
 * Returns a list of matching player names only (no DOB or progress data).
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
    const q = url.searchParams.get('q') || '';

    const { results } = await DB.prepare(
      'SELECT player_name FROM player_progress WHERE player_name LIKE ? ORDER BY player_name ASC LIMIT 10'
    ).bind(`%${q}%`).all();

    return new Response(JSON.stringify({
      success: true,
      players: results.map(r => r.player_name)
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Error searching players:', error);
    return new Response(JSON.stringify({ error: 'Failed to search players.', details: error.message }), {
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
