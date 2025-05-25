import Papa from 'papaparse';
import csvContent from '../../extra_files/customfields_latest.csv?raw';

interface CsvRow {
    Type: 'STANDARD' | 'CUSTOM';
    fieldKey: string;
    custom_field_id?: string;
    name?: string;
    'Possible Values'?: string;
    'approval for'?: string;
    'display as': 'TEXT' | 'LINK' | 'EMBEDDED IMAGE' | 'EMBEDDED_IMAGE' | 'EMBEDDED VIDEO' | 'EMBEDDED_VIDEO' | 'BUTTONS';
    editable?: string;
    clickable?: string; // Add clickable column
}

export interface FieldDefinition {
    type: 'STANDARD' | 'CUSTOM';
    fieldKey: string;
    custom_field_id?: string;
    name?: string;
    possibleValues?: string[];
    approvalFor?: string;
    displayAs: 'TEXT' | 'LINK' | 'EMBEDDED IMAGE' | 'EMBEDDED_IMAGE' | 'EMBEDDED VIDEO' | 'EMBEDDED_VIDEO' | 'BUTTONS';
    editable?: boolean;
    clickableValues?: string[]; // Add clickableValues property
}

interface GHLResponse {
    contact: {
        id: string;
        name?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        companyName?: string;
        phone?: string;
        customFields: Array<{
            id: string;
            value: string;
        }>;
        [key: string]: any; // for other standard fields
    };
}

// Parse CSV data
const parsedCsv = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true
});

const csvData = (parsedCsv.data as CsvRow[]).map(row => ({
    type: row.Type,
    fieldKey: row.fieldKey,
    custom_field_id: row.custom_field_id || undefined,
    name: row.name || row.fieldKey.split('.').pop()?.replace(/_/g, ' ') || undefined,
    possibleValues: row['Possible Values'] ? row['Possible Values'].split('|') : undefined,
    approvalFor: row['approval for'] || undefined,
    displayAs: row['display as'] as FieldDefinition['displayAs'],
    editable: row.editable === 'EDITABLE',
    clickableValues: row.clickable ? row.clickable.split('|') : undefined // Populate clickableValues
}));

// Debug log the processed data
console.log('Processed fields with editable flag:',
    csvData.filter(field => field.editable).map(f => ({
        fieldKey: f.fieldKey,
        editable: f.editable
    }))
);

// Organize fields into logical groups
export const fieldDefinitions = {
    // Basic contact information
    basicInfo: [
        'firstName',
        'lastName',
        'email',
        'website',
        'companyName',
        'phone',
        'address1',
        'city',
        'country',
        'contact.primary_business_number',
        'contact.business_email',
        'contact.company_email_address',
        'contact.website',
        'contact.select_your_region_location',
        'contact.featured_upgrade_date'
    ].map(key => {
        const field = csvData.find(f => f.fieldKey === key);
        if (!field) {
            throw new Error(`Field definition not found for key: ${key}`);
        }
        return field;
    }),

    // Content that needs approval (pairs of content + approval status)
    contentPairs: [
        {
            content: (() => {
                const field = csvData.find(f => f.fieldKey === 'contact.blog_article__from_gpt');
                if (!field) throw new Error('Field definition not found for key: contact.blog_article__from_gpt');
                return field;
            })(),
            approval: (() => {
                const field = csvData.find(f => f.fieldKey === 'contact.blog_article__approval');
                if (!field) throw new Error('Field definition not found for key: contact.blog_article__approval');
                return field;
            })()
        },
        {
            content: (() => {
                const field = csvData.find(f => f.fieldKey === 'contact.blog_article_image_url');
                if (!field) throw new Error('Field definition not found for key: contact.blog_article_image_url');
                return field;
            })(),
            approval: (() => {
                const field = csvData.find(f => f.fieldKey === 'contact.blog_image__approval');
                if (!field) throw new Error('Field definition not found for key: contact.blog_image__approval');
                return field;
            })()
        },
        {
            content: (() => {
                const field = csvData.find(f => f.fieldKey === 'contact.video_script__from_gpt');
                if (!field) throw new Error('Field definition not found for key: contact.video_script__from_gpt');
                return field;
            })(),
            approval: (() => {
                const field = csvData.find(f => f.fieldKey === 'contact.video_script__approval');
                if (!field) throw new Error('Field definition not found for key: contact.video_script__approval');
                return field;
            })()
        },
        {
            content: (() => {
                const field = csvData.find(f => f.fieldKey === 'contact.promo_video_url');
                if (!field) throw new Error('Field definition not found for key: contact.promo_video_url');
                return field;
            })(),
            approval: (() => {
                const field = csvData.find(f => f.fieldKey === 'contact.video__approval');
                if (!field) throw new Error('Field definition not found for key: contact.video__approval');
                return field;
            })()
        },
        {
            content: (() => {
                const field = csvData.find(f => f.fieldKey === 'contact.social_media_prompt');
                if (!field) throw new Error('Field definition not found for key: contact.social_media_prompt');
                return field;
            })(),
            approval: (() => {
                const field = csvData.find(f => f.fieldKey === 'contact.social_media_approval');
                if (!field) throw new Error('Field definition not found for key: contact.social_media_approval');
                return field;
            })()
        },
        {
            content: (() => {
                const field = csvData.find(f => f.fieldKey === 'contact.delivery_page_url');
                if (!field) throw new Error('Field definition not found for key: contact.delivery_page_url');
                return field;
            })(),
            approval: (() => {
                const field = csvData.find(f => f.fieldKey === 'contact.delivery_page__approval');
                if (!field) throw new Error('Field definition not found for key: contact.delivery_page__approval');
                return field;
            })()
        },
        {
            content: (() => {
                const field = csvData.find(f => f.fieldKey === 'contact.reach_profile_url');
                if (!field) throw new Error('Field definition not found for key: contact.reach_profile_url');
                return field;
            })(),
            approval: (() => {
                const field = csvData.find(f => f.fieldKey === 'contact.profile_approval');
                if (!field) throw new Error('Field definition not found for key: contact.profile_approval');
                return field;
            })()
        }
    ],

    // Important links
    links: [
        'contact.marketing_audit_report',
        'contact.reach_audit_video_url',
        'contact.content_blog_article',
        'contact.delivery_page_url'
    ].map(key => {
        const field = csvData.find(f => f.fieldKey === key);
        if (!field) {
            throw new Error(`Field definition not found for key: ${key}`);
        }
        return field;
    }),

    // Overall status indicators
    status: [
        'contact.all_elements_ready',
        'contact.featured_discovery_complete',
        'contact.featured_page_complete',
        'contact.featured_profile_complete',
    ].map(key => {
        const field = csvData.find(f => f.fieldKey === key);
        if (!field) {
            throw new Error(`Field definition not found for key: ${key}`);
        }
        return field;
    })
};

export function getFieldValue(field: FieldDefinition, data: GHLResponse): string | undefined {
    if (!field || !data.contact) return undefined;

    if (field.type === 'STANDARD') {
        // Standard fields are direct properties of the contact object
        return data.contact[field.fieldKey];
    } else {
        // Custom fields are in the customFields array
        const customField = data.contact.customFields.find(
            cf => cf.id === field.custom_field_id
        );
        return customField?.value;
    }
}

// Helper to get a human-readable label for any field
export function getFieldLabel(field: FieldDefinition): string {
    if (field.name) return field.name;
    return field.fieldKey.split('.').pop()?.replace(/_/g, ' ') || field.fieldKey;
}

// Helper function to determine if a field has an approval field
export function hasApprovalField(field: FieldDefinition): boolean {
    return fieldDefinitions.contentPairs.some(
        pair => pair.content.fieldKey === field.fieldKey
    );
}

// Helper function to get the approval field for a content field
export function getApprovalField(field: FieldDefinition): FieldDefinition | undefined {
    const pair = fieldDefinitions.contentPairs.find(
        pair => pair.content.fieldKey === field.fieldKey
    );
    return pair?.approval;
}

// For debugging
console.log('Parsed CSV Data:', csvData);
console.log('Field Definitions:', fieldDefinitions);
