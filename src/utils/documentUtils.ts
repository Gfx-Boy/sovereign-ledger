import { DocumentRecord } from '@/types/document';

export const generateRecordNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Get existing records to determine next sequence number
  const existingRecords = getStoredDocuments();
  const todayPrefix = `SR-${year}${month}${day}`;
  const todayRecords = existingRecords.filter(r => r.recordNumber.startsWith(todayPrefix));
  const nextSequence = String(todayRecords.length + 1).padStart(4, '0');
  
  return `${todayPrefix}-${nextSequence}`;
};

export const getStoredDocuments = (): DocumentRecord[] => {
  const stored = localStorage.getItem('sovereignRecords');
  return stored ? JSON.parse(stored) : [];
};

export const storeDocument = (document: DocumentRecord): void => {
  const existing = getStoredDocuments();
  existing.push(document);
  localStorage.setItem('sovereignRecords', JSON.stringify(existing));
};

export const searchDocuments = (params: { name?: string; title?: string; recordNumber?: string }): DocumentRecord[] => {
  const documents = getStoredDocuments();
  return documents.filter(doc => {
    if (params.recordNumber && !doc.recordNumber.toLowerCase().includes(params.recordNumber.toLowerCase())) return false;
    if (params.title && !doc.title.toLowerCase().includes(params.title.toLowerCase())) return false;
    if (params.name && (!doc.submitterName || !doc.submitterName.toLowerCase().includes(params.name.toLowerCase()))) return false;
    return true;
  });
};