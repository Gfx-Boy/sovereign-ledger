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
  isPublic?: boolean;
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
    
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    let fileDataToUpload: string;
    
    // Simple and reliable base64 conversion using FileReader approach
    const uint8ArrayToBase64 = (bytes: Uint8Array): Promise<string> => {
      return new Promise((resolve, reject) => {
        try {
          console.log(`Converting ${bytes.length} bytes to base64...`);
          const blob = new Blob([bytes], { type: 'application/octet-stream' });
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            // Remove the data URL prefix (e.g., "data:application/octet-stream;base64,")
            const base64 = dataUrl.split(',')[1];
            console.log(`Conversion complete, base64 length: ${base64.length}`);
            resolve(base64);
          };
          reader.onerror = () => {
            console.error('FileReader error:', reader.error);
            reject(reader.error);
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          console.error('Error in uint8ArrayToBase64:', error);
          reject(error);
        }
      });
    };
    
    if (params.file) {
      if (params.file.type === 'application/pdf') {
        console.log('Processing PDF file:', params.file.name, 'Size:', params.file.size);
        const arrayBuffer = await params.file.arrayBuffer();
        const pdfBytes = new Uint8Array(arrayBuffer);
        console.log('PDF loaded, starting stamping process...');
        const stampOptions = {
          submitterName: params.submitterName || '',
          isTrusteeUpload: params.isTrusteeUpload,
          trusteeName: params.trusteeName,
          clientName: params.clientName
        };
        const stampedPdfBytes = await addStampToDocument(pdfBytes, stampOptions);
        console.log('Stamping complete, converting to base64...');
        fileDataToUpload = await uint8ArrayToBase64(stampedPdfBytes);
      } else {
        console.log('Processing non-PDF file:', params.file.name);
        const arrayBuffer = await params.file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        fileDataToUpload = await uint8ArrayToBase64(bytes);
      }
    } else {
      fileDataToUpload = params.fileData || '';
    }
    
    const requestBody = {
      title: params.title,
      submitterName: params.isTrusteeUpload ? params.clientName : (params.submitterName || params.trusteeName),
      fileName: params.file?.name || params.fileName,
      fileData: fileDataToUpload,
      clientName: params.clientName,
      clientEmail: params.clientEmail,
      privateNote: params.privateNote,
      isTrusteeUpload: params.isTrusteeUpload,
      trusteeId: params.trusteeId,
      trusteeName: params.trusteeName,
      folderId: params.folderId === 'no-folder' ? null : params.folderId,
      isPublic: params.isPublic ?? false
    };
    
    console.log('Making request to:', UPLOAD_FUNCTION_URL);
    console.log('Request body isPublic:', requestBody.isPublic, 'from params.isPublic:', params.isPublic);
    const response = await fetch(UPLOAD_FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Upload response:', result);
    
    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    // WORKAROUND: Edge Function doesn't properly handle isPublic, so update it directly
    if (result.document && params.isPublic !== undefined && result.document.is_public !== params.isPublic) {
      console.log(`Fixing is_public field: Edge Function returned ${result.document.is_public}, but should be ${params.isPublic}`);
      
      const { error: updateError } = await supabase
        .from('documents')
        .update({ is_public: params.isPublic })
        .eq('id', result.document.id);
      
      if (updateError) {
        console.error('Failed to update is_public field:', updateError);
      } else {
        result.document.is_public = params.isPublic;
        console.log('Successfully updated is_public to:', params.isPublic);
      }
    }

    return { success: true, document: result.document };
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
    
    // Only return public documents in search results
    query = query.eq('is_public', true);
    
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