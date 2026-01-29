import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface StampOptions {
  submitterName: string;
  isTrusteeUpload?: boolean;
  trusteeName?: string;
  clientName?: string;
}

export const addStampToDocument = async (pdfBytes: Uint8Array, options: StampOptions): Promise<Uint8Array> => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Create stamp text based on account type
    let stampText: string;
    if (options.isTrusteeUpload && options.trusteeName && options.clientName) {
      stampText = `Submitted By ${options.trusteeName} on behalf of ${options.clientName}`;
    } else {
      stampText = `Submitted By ${options.submitterName}`;
    }
    
    const timestamp = new Date().toLocaleString();
    
    // Add stamp to each page
    pages.forEach((page) => {
      const { width, height } = page.getSize();
      
      // Position stamp in bottom right corner
      const stampX = width - 200;
      const stampY = 30;
      
      // Add semi-transparent background
      page.drawRectangle({
        x: stampX - 10,
        y: stampY - 5,
        width: 190,
        height: 40,
        color: rgb(1, 1, 1),
        opacity: 0.8,
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 1,
      });
      
      // Add stamp text
      page.drawText(stampText, {
        x: stampX,
        y: stampY + 15,
        size: 8,
        font,
        color: rgb(0, 0, 0),
      });
      
      // Add timestamp
      page.drawText(timestamp, {
        x: stampX,
        y: stampY,
        size: 7,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    });
    
    return await pdfDoc.save();
  } catch (error) {
    console.error('Error adding stamp to document:', error);
    throw error;
  }
};