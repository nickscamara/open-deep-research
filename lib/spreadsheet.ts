interface SpreadsheetData {
  headers: string[];
  rows: string[][];
}

// Escape a single CSV field per RFC 4180: wrap in double quotes when it
// contains a comma, double quote, or line break, and double any inner quotes.
export function escapeCSVField(value: unknown): string {
  const escaped = String(value ?? '').replace(/"/g, '""');
  return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
}

// Build RFC 4180 compliant CSV text from spreadsheet data. Headers are escaped
// the same way as body cells, and short rows are padded to the header width.
export function buildCSV(data: SpreadsheetData): string {
  if (!data?.headers || !data?.rows) {
    throw new Error('Invalid spreadsheet data');
  }

  const normalizedRows = data.rows.map((row) => {
    const normalizedRow = [...row];
    while (normalizedRow.length < data.headers.length) {
      normalizedRow.push('');
    }
    return normalizedRow;
  });

  return [
    data.headers.map(escapeCSVField).join(','),
    ...normalizedRows.map((row) => row.map(escapeCSVField).join(',')),
  ].join('\n');
}

export function exportToCSV(
  content: string,
  filename = 'spreadsheet.csv',
): void {
  try {
    const data = JSON.parse(content) as SpreadsheetData;
    const csvContent = buildCSV(data);

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return;
  } catch (error) {
    throw new Error('Failed to export CSV: ' + (error as Error).message);
  }
}
