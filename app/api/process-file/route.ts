import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse';
import { Readable } from 'stream';
import { Transform } from 'stream';
import * as XLSX from 'xlsx';

const CHUNK_SIZE = 1000; // Process 1000 rows at a time

interface ProcessedRow {
  [key: string]: string | number | null;
}

function processDateColumns(row: ProcessedRow): ProcessedRow {
  Object.entries(row).forEach(([key, value]) => {
    if (value !== null && value !== '' && !isNaN(new Date(value).getTime())) {
      const date = new Date(value);
      row[`${key}_year`] = String(date.getFullYear());
      row[`${key}_month`] = String(date.getMonth() + 1).padStart(2, '0');
      row[`${key}_day`] = String(date.getDate()).padStart(2, '0');
      row[`${key}_hour`] = String(date.getHours()).padStart(2, '0');
      row[`${key}_date`] = date.toISOString().split('T')[0];
      row[`${key}_day_of_week`] = date.toLocaleDateString('en-US', { weekday: 'long' });
      delete row[key];
    }
  });
  return row;
}

interface ChunkData {
  rows: ProcessedRow[];
  isFirstChunk: boolean;
  totalRows: number;
}

async function processExcelFile(file: File): Promise<ProcessedRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  console.log(`Excel file processed: ${jsonData.length} rows`);
  return jsonData as ProcessedRow[];
}

async function processCSVFile(file: File): Promise<ProcessedRow[]> {
  const buffer = await file.arrayBuffer();
  const fileStream = Readable.from(Buffer.from(buffer));
  const parser = parse({
    columns: true,
    skip_empty_lines: true,
  });

  return new Promise((resolve, reject) => {
    const rows: ProcessedRow[] = [];
    fileStream
      .pipe(parser)
      .on('data', (row: ProcessedRow) => rows.push(row))
      .on('end', () => {
        console.log(`CSV file processed: ${rows.length} rows`);
        resolve(rows);
      })
      .on('error', reject);
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    console.log('1');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);

    // Process the file based on its type
    let processedRows: ProcessedRow[];
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      processedRows = await processExcelFile(file);
    } else {
      processedRows = await processCSVFile(file);
    }

    console.log(`Total rows before date processing: ${processedRows.length}`);

    // Process date columns
    processedRows = processedRows.map(processDateColumns);
    console.log(`Total rows after date processing: ${processedRows.length}`);

    // Stream the processed data in chunks
    const transformStream = new Transform({
      objectMode: true,
      transform(chunk: { rows: ProcessedRow[]; isFirstChunk: boolean; totalRows: number }, encoding, callback) {
        const chunkData: ChunkData = { rows: chunk.rows, isFirstChunk: chunk.isFirstChunk, totalRows: chunk.totalRows };
        this.push(JSON.stringify(chunkData) + '\n');
        callback();
      },
    });

    // Split the data into chunks and stream them
    let totalChunks = 0;
    for (let i = 0; i < processedRows.length; i += CHUNK_SIZE) {
      const chunk = processedRows.slice(i, i + CHUNK_SIZE);

      // First chunk set to true, other chunks set to false
      const chunkData = { rows: chunk, isFirstChunk: totalChunks === 0, totalRows: processedRows.length };
      transformStream.write(chunkData);

      totalChunks++;
    }
    console.log(`Total chunks processed: ${totalChunks}`);
    transformStream.end();

    return new NextResponse(transformStream as unknown as ReadableStream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ error: 'Error processing file' }, { status: 500 });
  }
}
