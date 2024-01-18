import fetch from 'node-fetch';

export const downloadConvertToBase64 = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image. Status: ${response.status}`);
    }

    const buffer = await response.buffer();
    const base64 = buffer.toString('base64');

    const base64UrlBlob = `data:${response.headers.get('content-type')};base64,${base64}`;

    return base64UrlBlob;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return null;
  }
};
