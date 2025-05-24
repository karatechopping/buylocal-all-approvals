import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
    // Set response headers for CORS and content type
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests and enforce POST
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                error: 'Method not allowed',
                message: 'This endpoint only accepts POST requests'
            })
        };
    }

    // Create debug info outside try block so it's available in catch
    const debugInfo = {
        hasVitePit: !!process.env.VITE_PIT,
        envKeys: Object.keys(process.env).filter(key => !key.includes('KEY') && !key.includes('SECRET')),
        nodeEnv: process.env.NODE_ENV,
        method: event.httpMethod,
        path: event.path
    };
    console.log('Debug info:', debugInfo);

    try {
        // 1. Get PIT token from environment (try both VITE_PIT and PIT)
        const pit = process.env.VITE_PIT || process.env.PIT;

        console.log('Environment check:', {
            hasPIT: !!process.env.PIT,
            hasVITE_PIT: !!process.env.VITE_PIT,
            pit: pit ? pit.substring(0, 10) + '...' : null // Log first 10 chars for verification
        });

        if (!pit) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    error: 'Configuration error: Missing authentication token',
                    detail: 'Neither VITE_PIT nor PIT environment variables are set',
                    debug: {
                        ...debugInfo,
                        envVarsAvailable: Object.keys(process.env).filter(key =>
                            !key.toLowerCase().includes('key') &&
                            !key.toLowerCase().includes('secret') &&
                            !key.toLowerCase().includes('password')
                        )
                    }
                })
            };
        }

        // 2. Setup API configuration
        const API_URL = 'https://services.leadconnectorhq.com/contacts/search';
        const ghlHeaders = {
            'Authorization': `Bearer ${pit}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28',
            'Accept': 'application/json'
        };

        // 3. Prepare search parameters
        const searchParams = {
            locationId: "78wsQgsv80W793JIIrOA",
            page: 1,
            pageLimit: 100,
            filters: [
                {
                    group: "AND",
                    filters: [
                        {
                            field: "customFields.E3hX9H8jB9EYovEqS5NM",
                            operator: "exists"
                        },
                        {
                            group: "OR",
                            filters: [
                                {
                                    field: "customFields.IyD2zCRvoZ28qOMOCHPt",
                                    operator: "not_eq",
                                    value: "Yes"
                                },
                                {
                                    field: "customFields.IyD2zCRvoZ28qOMOCHPt",
                                    operator: "not_exists"
                                }
                            ]
                        }
                    ]
                }
            ],
            sort: [
                {
                    field: "firstNameLowerCase",
                    direction: "asc"
                }
            ]
        };

        // 4. Make the request to GHL
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: ghlHeaders,
            body: JSON.stringify(searchParams)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GHL API error (${response.status}): ${errorText || response.statusText || 'Unknown error'}`);
        }

        const data = await response.json();
        const contactsArray = data.contacts || data.elements || [];

        if (!Array.isArray(contactsArray)) {
            return {
                statusCode: 200,
                body: JSON.stringify({ contacts: [] })
            };
        }

        // Transform contacts to the required format
        const transformedContacts = contactsArray.map(contact => {
            const customFields = contact.customFields || contact.contact || {};
            const fullName = contact.name ||
                `${contact.firstName || ''} ${contact.lastName || ''}`.trim() ||
                contact.email ||
                'Unknown Contact';

            return {
                id: contact.id,
                name: fullName,
                email: contact.email,
                phone: contact.phone,
                featuredUpgradeDate: customFields.featured_upgrade_date || customFields['contact.featured_upgrade_date'],
                profileComplete: customFields.featured_profile_complete || customFields['contact.featured_profile_complete']
            };
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ contacts: transformedContacts })
        };

    } catch (error) {
        console.error('Error in fetch-featured-contacts:', error);
        const errorResponse = {
            error: error instanceof Error ? error.message : 'An unexpected error occurred',
            timestamp: new Date().toISOString(),
            path: event.path,
            debug: debugInfo
        };

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify(errorResponse)
        };
    }
};
