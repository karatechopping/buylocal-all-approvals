import Papa from 'papaparse';
import csvContent from '../../customfields/customfields.csv?raw';
import sectionOrderCsvContent from '../../customfields/SectionOrder.csv?raw';

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
    Section?: string; // Add Section column
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
    section?: string; // Add section property
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

// Parse the section order CSV and create sort order map
const sectionOrderCsv = Papa.parse(sectionOrderCsvContent, {
    skipEmptyLines: true
});

const sectionOrderMap: { [key: string]: number } = {};
const orderedSections: string[] = [];

// Skip the header row and process the remaining rows
sectionOrderCsv.data.slice(1).forEach((row: any) => {
    const section = row[0]?.trim(); // First column is Section
    const sortOrder = parseInt(row[1]?.trim() || '', 10); // Second column is SortOrder

    if (section && !isNaN(sortOrder)) {
        sectionOrderMap[section] = sortOrder;
        orderedSections.push(section);
    }
});

// Sort the orderedSections array based on their sort orders
orderedSections.sort((a, b) => sectionOrderMap[a] - sectionOrderMap[b]);

// Debug log to verify section order mapping
console.log('Section Order Map:', sectionOrderMap);
console.log('Ordered Sections:', orderedSections);

// Filter out the header row and map the data
const csvData = (parsedCsv.data as CsvRow[])
    .filter(row => row.Section !== 'Section') // Remove the header row if it got included
    .map(row => ({
        type: row.Type,
        fieldKey: row.fieldKey,
        custom_field_id: row.custom_field_id || undefined,
        name: row.name || row.fieldKey.split('.').pop()?.replace(/_/g, ' ') || undefined,
        possibleValues: row['Possible Values'] ? row['Possible Values'].split('|') : undefined,
        approvalFor: row['approval for'] || undefined,
        displayAs: row['display as'] as FieldDefinition['displayAs'],
        editable: row.editable === 'EDITABLE',
        clickableValues: row.clickable ? row.clickable.split('|') : undefined,
        section: row.Section // Don't default to any section
    }));

csvData.push({
    type: 'CUSTOM',
    fieldKey: 'ghlLink',
    custom_field_id: 'ghlLink',
    name: 'GHL Link',
    possibleValues: undefined,
    approvalFor: undefined,
    displayAs: 'LINK',
    editable: false,
    clickableValues: undefined,
    section: 'Basic Information'
});

// Structure to hold the final field definitions, grouped by section
const fieldDefinitions: { [key: string]: (FieldDefinition | { content: FieldDefinition; approval: FieldDefinition })[] } = {};

// First, create empty arrays for each section in the correct order
orderedSections.forEach(section => {
    fieldDefinitions[section] = [];
});

// Group fields by section while maintaining order
const sections: { [key: string]: FieldDefinition[] } = {};
orderedSections.forEach(section => {
    sections[section] = [];
});

// Check if we have any uncategorised fields
const uncategorisedFields = csvData.filter(field => !field.section || !sections[field.section]);
if (uncategorisedFields.length > 0) {
    sections['Uncategorised'] = [];
    fieldDefinitions['Uncategorised'] = [];
}

// Group fields into their sections
csvData.forEach(field => {
    if (field.section && sections[field.section]) {
        sections[field.section].push(field);
    } else if (uncategorisedFields.length > 0) {
        sections['Uncategorised'].push(field);
    }
});

// Export the section names in order (including Uncategorised if it exists)
export const sectionNames = [...orderedSections, ...(uncategorisedFields.length > 0 ? ['Uncategorised'] : [])];

// Debug log for sections
console.log('Sections before pairing:', Object.keys(sections));
for (const sectionName in sections) {
    console.log(`Section ${sectionName} has ${sections[sectionName].length} fields`);
}

// First, collect all fields across all sections for global lookup
const allFields = Object.values(sections).flat();

// Create maps for quick lookup
const fieldsByKey = new Map<string, FieldDefinition>();
const fieldsByCustomId = new Map<string, FieldDefinition>();
const approvalFields: FieldDefinition[] = [];

// Populate the maps
allFields.forEach(field => {
    fieldsByKey.set(field.fieldKey, field);
    if (field.custom_field_id) {
        fieldsByCustomId.set(field.custom_field_id, field);
    }
    if (field.approvalFor) {
        approvalFields.push(field);
    }
});

console.log('All fields by key:', Array.from(fieldsByKey.keys()));
console.log('All fields by custom ID:', Array.from(fieldsByCustomId.keys()));

// Identify content/approval pairs within each section
for (const sectionName in sections) {
    const fieldsInSection = sections[sectionName];
    fieldDefinitions[sectionName] = [];

    // Log fields in this section
    console.log(`Processing section: ${sectionName}`);
    console.log(`Fields in section ${sectionName}:`, fieldsInSection.map(f => ({
        fieldKey: f.fieldKey,
        custom_field_id: f.custom_field_id,
        approvalFor: f.approvalFor,
        displayAs: f.displayAs
    })));

    // Process fields in this section
    const processedContentFields = new Set();

    for (const field of fieldsInSection) {
        if (field.approvalFor) {
            // This is an approval field
            // Find the content field by custom_field_id (which is stored in approvalFor)
            const contentField = fieldsByCustomId.get(field.approvalFor);

            if (contentField) {
                console.log(`Found content/approval pair: ${contentField.fieldKey} / ${field.fieldKey}`);
                fieldDefinitions[sectionName].push({
                    content: contentField,
                    approval: field
                });
                processedContentFields.add(contentField.fieldKey);
            } else {
                console.warn(`Approval field ${field.fieldKey} references content field with custom_field_id ${field.approvalFor} which was not found`);
                fieldDefinitions[sectionName].push(field);
            }
        } else if (!processedContentFields.has(field.fieldKey)) {
            // Check if this content field has an approval field in any section
            const hasApproval = approvalFields.some(af => af.approvalFor === field.custom_field_id);

            if (!hasApproval) {
                // No approval field found, add as a regular field
                fieldDefinitions[sectionName].push(field);
            }
            // Skip content fields that have approval fields - they'll be added as pairs
        }
    }
}

// Debug log for final fieldDefinitions
console.log('Final fieldDefinitions structure:');
for (const sectionName in fieldDefinitions) {
    console.log(`Section ${sectionName} has ${fieldDefinitions[sectionName].length} items`);
    console.log(`Items in section ${sectionName}:`, fieldDefinitions[sectionName].map(item => {
        if ('content' in item && 'approval' in item) {
            return {
                type: 'pair',
                content: item.content.fieldKey,
                approval: item.approval.fieldKey
            };
        } else {
            return {
                type: 'single',
                fieldKey: (item as FieldDefinition).fieldKey
            };
        }
    }));
}

export { fieldDefinitions }; // Export the dynamically generated object

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
    // Check if this field is the content field in any pair across all sections
    for (const sectionName in fieldDefinitions) {
        const sectionItems = fieldDefinitions[sectionName];
        for (const item of sectionItems) {
            if ('content' in item && item.content.fieldKey === field.fieldKey) {
                return true;
            }
        }
    }
    return false;
}

// Helper function to get the approval field for a content field
export function getApprovalField(field: FieldDefinition): FieldDefinition | undefined {
    // Find the pair where this field is the content field, across all sections
    for (const sectionName in fieldDefinitions) {
        const sectionItems = fieldDefinitions[sectionName];
        for (const item of sectionItems) {
            if ('content' in item && item.content.fieldKey === field.fieldKey) {
                return item.approval;
            }
        }
    }
    return undefined;
}

// For debugging
console.log('Parsed CSV Data:', csvData);
console.log('Field Definitions:', fieldDefinitions);
