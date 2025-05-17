/**
 * Airtable API utility for multi-base, multi-table access.
 * Only supports simple CRUD for this dashboard.
 * Uses Netlify Functions as a secure proxy to Airtable API.
 */

export type AirtableRecord<T = any> = {
  id: string;
  createdTime: string;
  fields: T;
};

export async function fetchAirtableRecords<T>(
  baseId: string,
  tableName: string,
  filterByFormula?: string,
  fields?: string[]
): Promise<AirtableRecord<T>[]> {
  const response = await fetch('/.netlify/functions/fetch-records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      baseId,
      tableName,
      filterByFormula,
      fields,
    }),
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('Airtable fetch failed: Invalid JSON response');
  }

  if (!response.ok) {
    const errMsg = data && data.error
      ? `Airtable fetch failed: ${data.error}`
      : 'Airtable fetch failed';
    throw new Error(errMsg);
  }

  return data.records;
}

export async function updateAirtableRecord(
  baseId: string,
  tableName: string,
  recordId: string,
  fields: Record<string, any>
) {
  const response = await fetch('/.netlify/functions/update-record', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      baseId,
      tableName,
      recordId,
      fields,
    }),
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('Airtable update failed: Invalid JSON response');
  }

  if (!response.ok) {
    const errMsg = data && data.error
      ? `Airtable update failed: ${data.error}`
      : 'Airtable update failed';
    throw new Error(errMsg);
  }

  return data;
}
