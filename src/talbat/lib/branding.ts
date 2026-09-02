import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'branding';

export type BrandingKind = 'brand' | 'logo';

/** Uploads a branding image into the user's own folder and returns its storage path. */
export async function uploadBrandingImage(
  userId: string,
  kind: BrandingKind,
  file: File
): Promise<string> {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const path = `${userId}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  return path;
}

/** Resolves a stored path (or absolute URL) into a displayable URL. */
export async function resolveBrandingUrl(path?: string | null): Promise<string | undefined> {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
  if (error) {
    console.error('Failed to sign branding url', error);
    return undefined;
  }
  return data?.signedUrl;
}
