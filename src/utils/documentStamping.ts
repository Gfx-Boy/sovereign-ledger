import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface StampOptions {
  submitterName: string;
  isTrusteeUpload?: boolean;
  trusteeName?: string;
  clientName?: string;
}

export const addStampToDocument = async (pdfBytes: Uint8Array, options: StampOptions): Promise<Uint8Array> => {
  try {
    console.log('Loading PDF document...');
    const pdfDoc = await PDFDocument.load(pdfBytes, { 
      ignoreEncryption: true,
      updateMetadata: false 
    });
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;
    console.log(`PDF loaded with ${totalPages} pages, embedding font...`);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Create stamp text based on account type
    let submitterText: string;
    if (options.isTrusteeUpload && options.trusteeName && options.clientName) {
      submitterText = `${options.trusteeName} on behalf of ${options.clientName}`;
    } else {
      submitterText = options.submitterName;
    }
    
    const timestamp = new Date().toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    console.log('Adding stamps to all pages...');
    // Stamp every page
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const page = pages[pageIndex];
      const { width } = page.getSize();
      
      // Position stamp in bottom right corner
      const stampX = width - 250;
      const stampY = 35;
      
      // Add "Recorded by:" label and name in red
      page.drawText('Recorded by:', {
        x: stampX,
        y: stampY + 25,
        size: 11,
        font,
        color: rgb(0.8, 0, 0), // Red color
      });
      
      page.drawText(submitterText, {
        x: stampX,
        y: stampY + 10,
        size: 10,
        font,
        color: rgb(0.8, 0, 0), // Red color
      });
      
      // Add "Recorded on:" label and timestamp in red
      page.drawText('Recorded on:', {
        x: stampX,
        y: stampY - 5,
        size: 11,
        font,
        color: rgb(0.8, 0, 0), // Red color
      });
      
      page.drawText(timestamp, {
        x: stampX,
        y: stampY - 20,
        size: 10,
        font,
        color: rgb(0.8, 0, 0), // Red color
      });
    }
    
    console.log('Saving stamped PDF...');
    return await pdfDoc.save({ useObjectStreams: false });
  } catch (error) {
    console.error('Error adding stamp to document:', error);
    throw error;
  }
};