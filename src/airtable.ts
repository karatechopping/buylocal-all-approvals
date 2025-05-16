/**
 * Airtable API utility for multi-base, multi-table access.
 * Only supports simple CRUD for this dashboard.
 */
const API_KEY = 'pati4yugolFbjkyZd.36d0f4c3d0565fc9134b8df7bdcf741cdb4b2a9c65b082b3f4698725bf318269';
const API_URL = 'https://api.airtable.com/v0';

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
  const params = new URLSearchParams();
  if (filterByFormula) params.append('filterByFormula', filterByFormula);
  if (fields) fields.forEach(f => params.append('fields[]', f));
  params.append('pageSize', '100');
  const url = `${API_URL}/${baseId}/${encodeURIComponent(tableName)}?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error('Airtable fetch failed: Invalid JSON response');
  }
  if (!res.ok) {
    // Attach Airtable error message if present
    const errMsg = data && data.error && data.error.message
      ? `Airtable fetch failed: ${data.error.message}`
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
  const url = `${API_URL}/${baseId}/${encodeURIComponent(tableName)}/${recordId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error('Airtable update failed: Invalid JSON response');
  }
  if (!res.ok) {
    const errMsg = data && data.error && data.error.message
      ? `Airtable update failed: ${data.error.message}`
      : 'Airtable update failed';
    throw new Error(errMsg);
  }
  return data;
}
