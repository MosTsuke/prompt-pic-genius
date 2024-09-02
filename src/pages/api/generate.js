import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      const imageFile = files.image;
      const imageBuffer = fs.readFileSync(imageFile.filepath);
      const base64Image = imageBuffer.toString('base64');

      const payload = {
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Generate a description and keywords (minimum 40, maximum 50) for an image with no mention of trademarks. The description should be concise (up to 200 characters) Keywords should follow SEO best practices and Keywords are 1-word format and should be as relevant to the image as possible."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 300
      };

      const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const generatedContent = openaiResponse.data.choices[0].message.content;
      const [description, keywordsString] = generatedContent.split('\n\nKeywords:');
      const keywords = keywordsString.trim().split(', ');

      res.status(200).json({
        description: description.trim(),
        keywords,
        tokenUsage: openaiResponse.data.usage.total_tokens
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}