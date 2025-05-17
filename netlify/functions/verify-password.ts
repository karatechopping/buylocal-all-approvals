import { Handler } from '@netlify/functions';
import bcrypt from 'bcryptjs';

export const handler: Handler = async (event) => {
  // Enable CORS for local development
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: 'Method Not Allowed',
    };
  }

  try {
    const { password } = JSON.parse(event.body || '{}');
    const storedHash = process.env.ADMIN_PASSWORD_HASH;

    if (!password || !storedHash) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing password or hash configuration' }),
      };
    }

    const isMatch = await bcrypt.compare(password, storedHash);

    if (isMatch) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ success: false, error: 'Invalid password' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};