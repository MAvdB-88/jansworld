/**
 * Save a score to the leaderboard
 * POST /api/saveScore
 * Body: { playerName: string (optional), completionTime: number (milliseconds) }
 */
export async function onRequestPost(context) {
  try {
    const { DB } = context.env;
    const body = await context.request.json();
    
    const { playerName, completionTime } = body;
    
    // Validation
    if (!completionTime || typeof completionTime !== 'number') {
      return new Response(JSON.stringify({ 
        error: 'completionTime is required and must be a number' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Insert score into database
    const result = await DB.prepare(
      'INSERT INTO leaderboard (player_name, completion_time) VALUES (?, ?)'
    ).bind(
      playerName || 'Anonymous',
      Math.floor(completionTime)
    ).run();
    
    return new Response(JSON.stringify({ 
      success: true,
      id: result.meta.last_row_id
    }), {
      status: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error saving score:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to save score',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
