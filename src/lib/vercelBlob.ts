import { del } from '@vercel/blob';
/**
 * Xóa template khỏi Vercel Blob Storage
 * @param blobPath Đường dẫn blob (ví dụ: 'maubieu/hop_dong_tin_dung.docx')
 */
export async function deleteTemplateFromVercelBlob(blobPath: string): Promise<void> {
  await del(blobPath);
}
/**
 * Lấy danh sách template từ Vercel Blob Storage (theo folder)
 * @param folderPath Đường dẫn folder (ví dụ: 'maubieu/')
 * @returns Danh sách file (tên file)
 */
export async function fetchTemplatesListFromVercelBlob(folderPath: string): Promise<string[]> {
  // Vercel Blob không có API liệt kê file public, cần backend hoặc lưu metadata, hoặc hardcode demo
  // Ở đây trả về demo static, thực tế cần backend API hoặc lưu metadata
  return [
    'hop_dong_tin_dung.docx',
    'to_trinh_tham_dinh.docx',
    'giay_de_nghi_vay_von.docx',
    'bien_ban_dinh_gia.docx',
    'hop_dong_the_chap.docx',
  ];
}
import { getDownloadUrl, put } from '@vercel/blob';

/**
 * Tải template từ Vercel Blob Storage
 * @param path Đường dẫn blob (ví dụ: 'maubieu/hop_dong_tin_dung.docx')
 * @returns Buffer nội dung file
 */
export async function fetchTemplateFromVercelBlob(path: string): Promise<Buffer> {
  const url = await getDownloadUrl(path);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Không thể tải template từ blob');
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Upload template lên Vercel Blob Storage
 * @param file File object (browser) hoặc Buffer (Node)
 * @param blobPath Đường dẫn blob (ví dụ: 'maubieu/hop_dong_tin_dung.docx')
 * @returns url blob
 */
export async function uploadTemplateToVercelBlob(file: File, blobPath: string): Promise<string> {
  // Chỉ hỗ trợ upload từ browser (File)
  // put(path, file, { access: 'public' })
  const { url } = await put(blobPath, file, { access: 'public' });
  return url;
}
