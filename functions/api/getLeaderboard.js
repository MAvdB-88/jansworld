/**
 * Get top scores from the leaderboard
 * GET /api/getLeaderboard?limit=10
 */
export async function onRequestGet(context) {
  try {
    const { DB } = context.env;
    const url = new URL(context.request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // Get top scores ordered by completion time (fastest first)
    const { results } = await DB.prepare(
      'SELECT id, player_name, completion_time, created_at FROM leaderboard ORDER BY completion_time ASC LIMIT ?'
    ).bind(limit).all();
    
    return new Response(JSON.stringify({ 
      success: true,
      leaderboard: results
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=10'
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch leaderboard',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
