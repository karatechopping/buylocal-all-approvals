import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

const API_KEY = process.env.PIT;

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { contactId } = JSON.parse(event.body || '{}');
    if (!contactId) {
      return { statusCode: 400, body: 'Contact ID is required' };
    }

    // Make the API call to GHL
    const response = await fetch(
      `https://services.leadconnectorhq.com/contacts/${contactId}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Version: '2021-07-28'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`GHL API returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Error fetching contact:', error);
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ 
        error: 'Failed to fetch contact data',
        details: error.message
      })
    };
  }
};

export { handler };
