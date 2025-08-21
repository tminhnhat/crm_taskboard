import { put, list, del } from '@vercel/blob';

/**
 * Tải template từ Vercel Blob Storage
 * @param path Đường dẫn blob (ví dụ: 'maubieu/hop_dong_tin_dung.docx')
 * @returns Buffer nội dung file
 */
export async function fetchTemplateFromVercelBlob(path: string): Promise<Buffer> {
  try {
    // Lấy danh sách blob để tìm URL chính xác
    const { blobs } = await list({
      prefix: path.split('/')[0], // Lấy folder prefix (vd: 'maubieu')
      limit: 100
    });
    
    // Tìm blob có pathname khớp
    const targetBlob = blobs.find((blob: any) => blob.pathname === path);
    
    if (!targetBlob) {
      console.error(`Template không tìm thấy: ${path}`);
      console.error('Available templates:', blobs.map((b: any) => b.pathname));
      throw new Error(`Template không tìm thấy: ${path}`);
    }
    
    // Sử dụng URL chính xác từ blob metadata
    const response = await fetch(targetBlob.url);
    
    if (!response.ok) {
      throw new Error(`Không thể tải template: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error fetching template from blob:', error);
    throw new Error(`Không thể tải template từ blob: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  const { url } = await put(blobPath, buffer, { access: 'public' });
  return url;
}

/**
 * Xóa template khỏi Vercel Blob Storage
 * @param blobPath Đường dẫn blob (ví dụ: 'maubieu/hop_dong_tin_dung.docx')
 */
export async function deleteTemplateFromVercelBlob(blobPath: string): Promise<void> {
  await del(blobPath);
}