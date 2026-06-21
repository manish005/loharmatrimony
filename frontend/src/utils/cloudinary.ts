export const uploadToCloudinary = async (file: File, folder: string, publicId: string): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not properly configured.");
  }

  const timestamp = Math.round(new Date().getTime() / 1000).toString();

  // Sort params alphabetically to generate signature
  // Params to sign: folder, public_id, timestamp
  const paramsToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;

  // Generate SHA-1 signature using Web Crypto API
  const msgUint8 = new TextEncoder().encode(paramsToSign);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("public_id", publicId);
  formData.append("folder", folder);
  formData.append("signature", signature);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Cloudinary upload failed: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.secure_url;
};

export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not properly configured.");
  }

  const timestamp = Math.round(new Date().getTime() / 1000).toString();

  // Params to sign: public_id, timestamp
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;

  const msgUint8 = new TextEncoder().encode(paramsToSign);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Cloudinary delete failed: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.result === "ok";
};
