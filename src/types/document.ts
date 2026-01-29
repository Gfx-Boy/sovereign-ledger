export interface DocumentRecord {
  id: string;
  recordNumber: string;
  title: string;
  submitterName?: string;
  uploadDate: Date;
  fileName: string;
  fileData: string; // base64 encoded PDF
}

export interface DocumentSearchParams {
  name?: string;
  title?: string;
  recordNumber?: string;
}