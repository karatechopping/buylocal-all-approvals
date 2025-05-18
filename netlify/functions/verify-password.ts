import { Handler } from '@netlify/functions';
import bcrypt from 'bcryptjs';

export const handler: Handler = async (event) => {
  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const { password } = JSON.parse(event.body || '{}');
    
    // Validate input
    if (!password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Password is required' }),
      };
    }

    // Get stored hash
    const hash = process.env.ADMIN_PASSWORD_HASH;
    if (!hash) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    // Compare password
    const match = await bcrypt.compare(password, hash);

    if (match) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    }

    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid password' }),
    };

  } catch (error) {
    console.error('Password verification error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};