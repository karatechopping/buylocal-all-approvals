import { Handler } from '@netlify/functions';

const GHL_API_URL = 'https://services.leadconnectorhq.com/contacts';

const handler: Handler = async (event) => {
  // Only allow POST method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { contactId, fieldKey, value, isCustomField, custom_field_id } = JSON.parse(event.body || '{}');

    // Validate required parameters
    if (!contactId || !fieldKey || value === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'contactId, fieldKey, and value are required' }),
      };
    }

    // Prepare the update payload based on whether it's a custom field or standard field
    const updateData = isCustomField ? {
      customFields: [{
        id: custom_field_id,
        field_value: value
      }]
    } : {
      [fieldKey]: value
    };

    // Make request to GHL API
    const url = `${GHL_API_URL}/${contactId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.PIT}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('GHL API Error:', data);
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: data.message || 'Failed to update GHL record',
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
