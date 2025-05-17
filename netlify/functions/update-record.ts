import { Handler } from '@netlify/functions';

const API_URL = 'https://api.airtable.com/v0';

const handler: Handler = async (event) => {
  // Only allow POST method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { baseId, tableName, recordId, fields } = JSON.parse(event.body || '{}');

    // Validate required parameters
    if (!baseId || !tableName || !recordId || !fields) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'baseId, tableName, recordId, and fields are required' }),
      };
    }

    // Make request to Airtable
    const url = `${API_URL}/${baseId}/${encodeURIComponent(tableName)}/${recordId}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: data.error ? data.error.message : 'Failed to update record',
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
