import axios from 'axios';

export const generateDescriptionAndKeywords = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axios.post('/api/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
};