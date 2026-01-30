import { supabase } from '@/lib/supabase';
import { DocumentRecord } from '@/types/document';
import { addStampToDocument } from './documentStamping';

const UPLOAD_FUNCTION_URL = 'https://pcsxikfvpunrkhfnauqr.supabase.co/functions/v1/833fa4d1-a392-48cd-8f21-6b2c2785ff92';

interface UploadParams {
  file?: File;
  title: string;
  submitterName?: string;
  fileName?: string;
  fileData?: string;
  clientName?: string;
  clientEmail?: string;
  privateNote?: string;
  isTrusteeUpload?: boolean;
  trusteeId?: string;
  trusteeName?: string;
  folderId?: string;
}

let uploadInProgress = false;

export const uploadDocument = async (params: UploadParams) => {
  // Prevent multiple simultaneous uploads
  if (uploadInProgress) {
    console.warn('Upload already in progress, ignoring duplicate request');
    return { success: false, error: 'Upload already in progress' };
  }

  uploadInProgress = true;
  
  try {
    console.log('Starting upload with params:', { ...params, fileData: params.fileData ? '[FILE_DATA]' : 'none' });
    
    console.log('Checking authentication...');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Session:', session?.user ? 'Authenticated' : 'Not authenticated');
    
    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    let fileToUpload: Blob;
    let fileName: string;

    console.log('File validation:', {
      hasFile: !!params.file,
      isFile: params.file instanceof File,
      size: params.file?.size,
      type: typeof params.file
    });

    // Process the file (stamp PDF if needed)
    if (params.file && params.file instanceof File && params.file.size > 0) {
      fileName = params.file.name;
      const fileSizeKB = params.file.size / 1024;
      console.log(`Processing file: ${fileName}, Size: ${fileSizeKB.toFixed(2)} KB`);
      
      if (params.file.type === 'application/pdf') {
        console.log('Stamping PDF...');
        try {
          const arrayBuffer = await params.file.arrayBuffer();
          console.log('File loaded, stamping...');
          const pdfBytes = new Uint8Array(arrayBuffer);
          const stampOptions = {
            submitterName: params.submitterName || '',
            isTrusteeUpload: params.isTrusteeUpload,
            trusteeName: params.trusteeName,
            clientName: params.clientName
          };
          
          // Use setTimeout to break up the work and prevent freezing
          await new Promise(resolve => setTimeout(resolve, 0));
          
          const stampedPdfBytes = await addStampToDocument(pdfBytes, stampOptions);
          console.log('PDF stamping completed');
          fileToUpload = new Blob([stampedPdfBytes], { type: 'application/pdf' });
        } catch (stampError) {
          console.error('Stamping failed:', stampError);
          throw new Error('Failed to process PDF: ' + (stampError instanceof Error ? stampError.message : 'Unknown error'));
        }
      } else {
        fileToUpload = params.file;
      }
    } else if (params.fileData) {
      // Fallback for base64 data (legacy)
      console.log('Processing base64 file data...');
      const binaryString = atob(params.fileData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      fileToUpload = new Blob([bytes], { type: 'application/pdf' });
      fileName = params.fileName || 'document.pdf';
    } else {
      console.error('Invalid file provided:', params.file);
      throw new Error('No valid file provided. Please select a PDF file.');
    }

    // Upload to Supabase Storage
    const fileExt = fileName.split('.').pop();
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `uploads/${uniqueFileName}`;
    
    console.log('Uploading file to storage:', filePath);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, fileToUpload, {
        contentType: params.file?.type || 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error('Storage upload failed: ' + uploadError.message);
    }

    console.log('File uploaded successfully:', uploadData);

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    console.log('Public URL:', publicUrl);

    // Create database record
    console.log('Creating database record...');
    const recordData: any = {
      title: params.title,
      file_path: filePath,
      file_url: publicUrl,
      file_name: fileName,
      submitter_name: params.isTrusteeUpload ? params.clientName : (params.submitterName || params.trusteeName),
      user_id: session.user.id,
      is_trustee_upload: params.isTrusteeUpload || false,
      status: 'active'
    };

    if (params.clientName) recordData.client_name = params.clientName;
    if (params.clientEmail) recordData.client_email = params.clientEmail;
    if (params.privateNote) recordData.private_note = params.privateNote;
    if (params.trusteeId) recordData.trustee_id = params.trusteeId;
    if (params.trusteeName) recordData.trustee_name = params.trusteeName;
    if (params.folderId && params.folderId !== 'no-folder') recordData.folder_id = params.folderId;

    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert(recordData)
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      console.error('Database insert error:', dbError);
      await supabase.storage.from('documents').remove([filePath]);
      throw new Error('Database error: ' + dbError.message);
    }

    console.log('Upload complete:', document);
    return { success: true, document };
  } catch (error) {
    console.error('Upload error in supabaseUtils:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
  } finally {
    uploadInProgress = false;
  }
};

export const createUserProfile = async (userId: string, email: string, fullName: string, userRole: string = 'individual') => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        email,
        full_name: fullName,
        display_name: fullName,
        user_role: userRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, profile: data };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create profile' };
  }
};

export const searchDocuments = async (params: { recordNumber?: string; title?: string; name?: string }) => {
  try {
    let query = supabase.from('documents').select('*');
    
    if (params.recordNumber) {
      query = query.ilike('record_number', `%${params.recordNumber}%`);
    }
    
    if (params.title) {
      query = query.ilike('title', `%${params.title}%`);
    }
    
    if (params.name) {
      query = query.or(`submitter_name.ilike.%${params.name}%,client_name.ilike.%${params.name}%`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const getDocumentUrl = (filePath: string) => {
  const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
  return data.publicUrl;
};

export const getViewableDocumentUrl = (filePath: string) => {
  const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
  return `${data.publicUrl}#view=FitH`;
};

export const getShareableLink = (recordNumber: string) => {
  return `${window.location.origin}/document/${recordNumber}`;
};