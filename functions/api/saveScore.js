/**
 * Save a score to the leaderboard
 * POST /api/saveScore
 * Body: { playerName: string (optional), completionTime: number (milliseconds) }
 */
export async function onRequestPost(context) {
  try {
    const { DB } = context.env;
    
    // Check if DB binding exists
    if (!DB) {
      console.error('DB binding not found in context.env');
      return new Response(JSON.stringify({ 
        error: 'Database not configured. Please add D1 binding in Cloudflare Pages settings.' 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    const body = await context.request.json();
    
    const { playerName, completionTime, level } = body;
    
    // Validation
    if (!completionTime || typeof completionTime !== 'number') {
      return new Response(JSON.stringify({ 
        error: 'completionTime is required and must be a number' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const levelNumber = (typeof level === 'number' && level >= 1) ? Math.floor(level) : 1;

    // Insert score into database
    const result = await DB.prepare(
      'INSERT INTO leaderboard (player_name, completion_time, level) VALUES (?, ?, ?)'
    ).bind(
      playerName || 'Anonymous',
      Math.floor(completionTime),
      levelNumber
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
