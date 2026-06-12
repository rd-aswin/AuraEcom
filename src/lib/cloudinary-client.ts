/**
 * Securely uploads a file directly from the browser to Cloudinary
 * using a signed request fetched from the Next.js backend.
 */
export async function uploadToCloudinary(file: File, folder = 'aura_products'): Promise<string> {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    // 1. Fetch signing credentials from the API route
    const signRes = await fetch('/api/media/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paramsToSign: {
          timestamp,
          folder,
        },
      }),
    });

    const signData = await signRes.json();
    if (!signRes.ok || !signData.success) {
      throw new Error(signData.error || 'Failed to sign upload parameters');
    }

    const { signature, apiKey, cloudName } = signData;

    // 2. Build FormData for direct API upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', timestamp.toString());
    formData.append('folder', folder);
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    // 3. Post directly to Cloudinary upload URL
    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const uploadData = await uploadRes.json().catch(() => ({}));
    if (!uploadRes.ok) {
      throw new Error(uploadData.error?.message || 'Cloudinary server rejected upload');
    }

    return uploadData.secure_url; // Returns the secure CDN URL of the uploaded image
  } catch (err: any) {
    console.error('Client uploadToCloudinary failed:', err);
    throw err;
  }
}
