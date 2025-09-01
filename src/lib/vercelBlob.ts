import { put, list, del } from '@vercel/blob';

/**
 * Tải template từ Vercel Blob Storage
 * @param pathOrUrl Đường dẫn blob (ví dụ: 'maubieu/hop_dong_tin_dung.docx') hoặc full URL
 * @returns Buffer nội dung file
 */
export async function fetchTemplateFromVercelBlob(pathOrUrl: string): Promise<Buffer> {
  try {
    console.log(`Fetching template from pathOrUrl: ${pathOrUrl}`);
    
    // Check if BLOB_READ_WRITE_TOKEN exists
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN not configured');
      throw new Error('BLOB_READ_WRITE_TOKEN not configured');
    }
    
    // Check if it's already a full URL (starts with https://)
    if (pathOrUrl.startsWith('https://')) {
      console.log('Input is a full URL, fetching directly...');
      
      let response: Response;
      let attempt = 0;
      const maxRetries = 3;
      
      while (attempt < maxRetries) {
        try {
          console.log(`Fetching template directly, attempt ${attempt + 1}/${maxRetries}`);
          response = await fetch(pathOrUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Vercel-Function/1.0'
            }
          });
          
          if (response.ok) {
            break;
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (fetchError) {
          attempt++;
          console.warn(`Direct fetch attempt ${attempt} failed:`, fetchError);
          
          if (attempt >= maxRetries) {
            throw new Error(`Không thể tải template sau ${maxRetries} lần thử: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
      
      console.log(`Template fetched successfully via direct URL, status: ${response!.status}`);
      
      // Convert to buffer with proper error handling
      try {
        const arrayBuffer = await response!.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        console.log(`Template buffer created, size: ${buffer.length} bytes`);
        
        // Validate buffer is not empty and looks like a valid zip file (docx)
        if (buffer.length === 0) {
          throw new Error('Template file is empty');
        }
        
        // Check for ZIP file signature (docx files are ZIP archives)
        const zipSignature = buffer.subarray(0, 4);
        const validZipSignatures = [
          Buffer.from([0x50, 0x4B, 0x03, 0x04]), // Standard ZIP
          Buffer.from([0x50, 0x4B, 0x05, 0x06]), // Empty ZIP
          Buffer.from([0x50, 0x4B, 0x07, 0x08])  // Spanned ZIP
        ];
        
        const isValidZip = validZipSignatures.some(sig => zipSignature.equals(sig));
        if (!isValidZip) {
          console.warn('Template file may not be a valid ZIP/DOCX file, signature:', zipSignature);
        }
        
        return buffer;
      } catch (bufferError) {
        console.error('Error converting response to buffer:', bufferError);
        throw new Error(`Error reading template file: ${bufferError instanceof Error ? bufferError.message : 'Unknown buffer error'}`);
      }
    }
    
    // Original logic for path-based access
    const path = pathOrUrl;
    
    // Lấy danh sách blob để tìm URL chính xác
    console.log('Listing blobs to find template...');
    const { blobs } = await list({
      prefix: path.split('/')[0], // Lấy folder prefix (vd: 'maubieu')
      limit: 100
    });
    
    console.log(`Found ${blobs.length} blobs in folder`);
    console.log('Available blobs:', blobs.map((b: any) => b.pathname));
    
    // Tìm blob có pathname khớp
    const targetBlob = blobs.find((blob: any) => blob.pathname === path);
    
    if (!targetBlob) {
      console.error(`Template không tìm thấy: ${path}`);
      console.error('Available templates:', blobs.map((b: any) => b.pathname));
      throw new Error(`Template không tìm thấy: ${path}`);
    }
    
    console.log(`Found target blob: ${targetBlob.pathname}, URL: ${targetBlob.url}`);
    
    // Sử dụng URL chính xác từ blob metadata với retry logic
    let response: Response;
    let attempt = 0;
    const maxRetries = 3;
    
    while (attempt < maxRetries) {
      try {
        console.log(`Fetching template, attempt ${attempt + 1}/${maxRetries}`);
        response = await fetch(targetBlob.url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Vercel-Function/1.0'
          }
        });
        
        if (response.ok) {
          break;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (fetchError) {
        attempt++;
        console.warn(`Fetch attempt ${attempt} failed:`, fetchError);
        
        if (attempt >= maxRetries) {
          throw new Error(`Không thể tải template sau ${maxRetries} lần thử: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    console.log(`Template fetched successfully, status: ${response!.status}`);
    
    // Convert to buffer with proper error handling
    try {
      const arrayBuffer = await response!.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      console.log(`Template buffer created, size: ${buffer.length} bytes`);
      
      // Validate buffer is not empty and looks like a valid zip file (docx)
      if (buffer.length === 0) {
        throw new Error('Template file is empty');
      }
      
      // Check for ZIP file signature (docx files are ZIP archives)
      const zipSignature = buffer.subarray(0, 4);
      const validZipSignatures = [
        Buffer.from([0x50, 0x4B, 0x03, 0x04]), // Standard ZIP
        Buffer.from([0x50, 0x4B, 0x05, 0x06]), // Empty ZIP
        Buffer.from([0x50, 0x4B, 0x07, 0x08])  // Spanned ZIP
      ];
      
      const isValidZip = validZipSignatures.some(sig => zipSignature.equals(sig));
      if (!isValidZip) {
        console.warn('Template file may not be a valid ZIP/DOCX file, signature:', zipSignature);
      }
      
      return buffer;
    } catch (bufferError) {
      console.error('Error converting response to buffer:', bufferError);
      throw new Error(`Error reading template file: ${bufferError instanceof Error ? bufferError.message : 'Unknown buffer error'}`);
    }
    
  } catch (error) {
    console.error(`Error fetching template from blob storage:`, error);
    throw new Error(`Template file missing: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Lấy danh sách template từ Vercel Blob Storage (theo folder)
 * @param folderPath Đường dẫn folder (ví dụ: 'maubieu/')
 * @returns Danh sách file (tên file)
 */
export async function fetchTemplatesListFromVercelBlob(folderPath: string): Promise<string[]> {
  try {
    // Sử dụng list API để lấy danh sách files
    const { blobs } = await list({
      prefix: folderPath,
      limit: 100
    });
    
    // Trích xuất tên file từ pathname
    const templates = blobs
      .map((blob: any) => blob.pathname.replace(folderPath, ''))
      .filter((name: string) => name.endsWith('.docx') || name.endsWith('.doc'))
      .filter((name: string) => name.length > 0);
    
    return templates;
  } catch (error) {
    console.error('Error fetching templates list:', error);
    
    // Fallback: kiểm tra các template phổ biến
    const possibleTemplates = [
      'hop_dong_tin_dung.docx',
      'to_trinh_tham_dinh.docx',
      'giay_de_nghi_vay_von.docx',
      'bien_ban_dinh_gia.docx',
      'hop_dong_the_chap.docx',
    ];
    
    const existingTemplates: string[] = [];
    
    // Kiểm tra từng template xem có tồn tại không
    for (const template of possibleTemplates) {
      try {
        const response = await fetch(`https://blob.vercel-storage.com/${folderPath}${template}`, { 
          method: 'HEAD' 
        });
        if (response.ok) {
          existingTemplates.push(template);
        }
      } catch {
        // Template không tồn tại, bỏ qua
      }
    }
    
    return existingTemplates;
  }
}

/**
 * Upload template lên Vercel Blob Storage từ browser
 * @param file File object (browser)
 * @param blobPath Đường dẫn blob (ví dụ: 'maubieu/hop_dong_tin_dung.docx')
 * @returns url blob
 */
export async function uploadTemplateToVercelBlob(file: File, blobPath: string): Promise<string> {
  // Chỉ hỗ trợ upload từ browser (File)
  // put(path, file, { access: 'public' })
  const { url } = await put(blobPath, file, { access: 'public' });
  return url;
}

/**
 * Upload template lên Vercel Blob Storage từ server (Node.js)
 * @param filePath Đường dẫn file trên server
 * @param blobPath Đường dẫn blob (ví dụ: 'maubieu/hop_dong_tin_dung.docx')
 * @returns url blob
 */
export async function uploadTemplateFromServerToVercelBlob(filePath: string, blobPath: string): Promise<string> {
  const fs = await import('fs');
  const fileBuffer = fs.readFileSync(filePath);
  const { url } = await put(blobPath, fileBuffer, { access: 'public' });
  return url;
}

/**
 * Upload buffer lên Vercel Blob Storage
 * @param buffer Buffer data to upload
 * @param blobPath Đường dẫn blob (ví dụ: 'maubieu/hop_dong_tin_dung.docx')
 * @returns url blob
 */
export async function uploadBufferToVercelBlob(buffer: Buffer, blobPath: string): Promise<string> {
  const { url } = await put(blobPath, buffer, { 
    access: 'public',
    allowOverwrite: true 
  });
  return url;
}

/**
 * Xóa template khỏi Vercel Blob Storage
 * @param blobPath Đường dẫn blob (ví dụ: 'maubieu/hop_dong_tin_dung.docx')
 */
export async function deleteTemplateFromVercelBlob(blobPath: string): Promise<void> {
  await del(blobPath);
}

/**
 * Lấy danh sách documents từ Vercel Blob Storage (từ folder ketqua)
 * @param folderPath Đường dẫn folder (ví dụ: 'ketqua/')
 * @returns Danh sách file documents với metadata
 */
export async function fetchDocumentsListFromVercelBlob(folderPath: string = 'ketqua/'): Promise<Array<{
  pathname: string;
  url: string;
  size: number;
  uploadedAt: Date;
}>> {
  try {
    // Sử dụng list API để lấy danh sách files
    const { blobs } = await list({
      prefix: folderPath,
      limit: 1000 // Increase limit for documents
    });
    
    // Trích xuất thông tin file documents
    const documents = blobs
      .filter((blob: any) => blob.pathname.startsWith(folderPath))
      .map((blob: any) => ({
        pathname: blob.pathname,
        url: blob.url,
        size: blob.size,
        uploadedAt: new Date(blob.uploadedAt)
      }))
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()); // Sort by newest first
    
    return documents;
  } catch (error) {
    console.error('Error fetching documents list from blob:', error);
    return [];
  }
}

/**
 * Xóa document khỏi Vercel Blob Storage
 * @param blobPath Đường dẫn blob (ví dụ: 'ketqua/document.docx')
 */
export async function deleteDocumentFromVercelBlob(blobPath: string): Promise<void> {
  await del(blobPath);
}