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
    const { baseId, tableName, filterByFormula, fields } = JSON.parse(event.body || '{}');

    // Validate required parameters
    if (!baseId || !tableName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'baseId and tableName are required' }),
      };
    }

    // Build query parameters
    const params = new URLSearchParams();
    if (filterByFormula) params.append('filterByFormula', filterByFormula);
    if (fields) fields.forEach((f: string) => params.append('fields[]', f));
    params.append('pageSize', '100');

    // Make request to Airtable
    const url = `${API_URL}/${baseId}/${encodeURIComponent(tableName)}?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: data.error ? data.error.message : 'Failed to fetch records',
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
