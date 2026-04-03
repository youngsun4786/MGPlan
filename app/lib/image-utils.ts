import imageCompression from 'browser-image-compression'

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB per D-14
export const MAX_DIMENSION = 1568 // Claude's optimal processing size (research recommendation)
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
export const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.heic,.heif'

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'Image too large. Maximum size is 10MB.' }
  }
  // HEIC files may have generic MIME type on some browsers
  const isAccepted = ACCEPTED_TYPES.includes(file.type) ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')
  if (!isAccepted) {
    return { valid: false, error: 'Unsupported format. Use PNG, JPEG, HEIC, or WebP.' }
  }
  return { valid: true }
}

export async function prepareImage(file: File): Promise<{ base64: string; mediaType: 'image/jpeg' }> {
  const options = {
    maxSizeMB: 4,
    maxWidthOrHeight: MAX_DIMENSION,
    useWebWorker: true,
    fileType: 'image/jpeg' as const,
  }
  const compressed = await imageCompression(file, options)
  const dataUrl = await imageCompression.getDataUrlFromFile(compressed)
  // Strip data:image/jpeg;base64, prefix
  const base64 = dataUrl.split(',')[1]
  return { base64, mediaType: 'image/jpeg' }
}
