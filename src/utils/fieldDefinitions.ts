import Papa from 'papaparse';
import csvContent from '../../extra_files/customfields_latest.csv?raw';

export interface FieldDefinition {
    type: 'STANDARD' | 'CUSTOM';
    fieldKey: string;
    custom_field_id?: string;
    name?: string;
    possibleValues?: string[];
    approvalFor?: string;
    displayAs: 'TEXT' | 'LINK' | 'EMBEDDED IMAGE' | 'EMBEDDED_IMAGE' | 'EMBEDDED VIDEO' | 'EMBEDDED_VIDEO' | 'BUTTONS';
    editable?: boolean;
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

const csvData = parsedCsv.data.map(row => ({
    type: row.Type as 'STANDARD' | 'CUSTOM',
    fieldKey: row.fieldKey,
    custom_field_id: row.custom_field_id || undefined,
    name: row.name || row.fieldKey.split('.').pop()?.replace(/_/g, ' ') || undefined,
    possibleValues: row['Possible Values'] ? row['Possible Values'].split('|') : undefined,
    approvalFor: row['approval for'] || undefined,
    displayAs: row['display as'] as FieldDefinition['displayAs'],
    editable: row.editable === 'EDITABLE'
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
    ].map(key => csvData.find(field => field.fieldKey === key)!),

    // Content that needs approval (pairs of content + approval status)
    contentPairs: [
        {
            content: csvData.find(field => field.fieldKey === 'contact.blog_article__from_gpt')!,
            approval: csvData.find(field => field.fieldKey === 'contact.blog_article__approval')!
        },
        {
            content: csvData.find(field => field.fieldKey === 'contact.blog_article_image_url')!,
            approval: csvData.find(field => field.fieldKey === 'contact.blog_image__approval')!
        },
        {
            content: csvData.find(field => field.fieldKey === 'contact.video_script__from_gpt')!,
            approval: csvData.find(field => field.fieldKey === 'contact.video_script__approval')!
        },
        {
            content: csvData.find(field => field.fieldKey === 'contact.promo_video_url')!,
            approval: csvData.find(field => field.fieldKey === 'contact.video__approval')!
        },
        {
            content: csvData.find(field => field.fieldKey === 'contact.social_media_prompt')!,
            approval: csvData.find(field => field.fieldKey === 'contact.social_media_approval')!
        }
    ],

    // Important links
    links: [
        'contact.reach_profile_url',
        'contact.marketing_audit_report',
        'contact.reach_audit_video_url',
        'contact.content_blog_article',
        'contact.delivery_page_url'
    ].map(key => csvData.find(field => field.fieldKey === key)!),

    // Overall status indicators
    status: [
        'contact.all_elements_ready',
        'contact.featured_discovery_complete',
        'contact.featured_page_complete',
        'contact.featured_profile_complete'
    ].map(key => csvData.find(field => field.fieldKey === key)!)
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
