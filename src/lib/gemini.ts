// Interface for the structured response from Gemini
export interface ParsedReceiptData {
  supplierName: string;
  date: string;
  amount: number;
  hasTaxInvoice: boolean;
  description: string;
}

// Convert a public image URL to base64 format for Gemini API
const urlToBase64 = async (url: string): Promise<{ mimeType: string; data: string }> => {
  // If it's already a local base64 data URI, extract details directly to avoid network fetch
  if (url.startsWith('data:')) {
    const parts = url.split(',');
    const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const data = parts[1];
    return { mimeType, data };
  }

  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve({ mimeType: blob.type || 'image/jpeg', data: base64Data });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Main function to parse a receipt image using Google Gemini 1.5 Flash
export const parseReceiptWithAI = async (imageUrl: string, apiKey: string): Promise<ParsedReceiptData | null> => {
  if (!apiKey) {
    throw new Error('مفتاح API الخاص بـ Gemini غير متوفر. يرجى ضبطه في إعدادات النظام.');
  }

  try {
    const { mimeType, data: base64Data } = await urlToBase64(imageUrl);

    const prompt = `You are an expert accountant. Analyze this receipt or invoice image and extract key financial data.
Return a valid JSON object matching the following structure exactly.
Structure:
{
  "supplierName": "Name of the merchant or supplier in Arabic (or English if only English is present)",
  "date": "Date of the invoice/receipt in YYYY-MM-DD format (if not found, return current date or empty string)",
  "amount": The final total amount as a number (float or integer, e.g. 150.50. Extract the actual total/final sum including tax if present)",
  "hasTaxInvoice": true if it mentions tax/VAT/GST or has a tax number/VAT registration number, false otherwise,
  "description": "A very brief, clear description of the items purchased in Arabic (e.g. 'شراء قرطاسية ومستلزمات مكتبية' or 'فاتورة شراء وقود للسيارات')"
}

IMPORTANT:
- Ensure amounts are parsed correctly as numbers.
- Translate merchant name and description to Arabic if possible, to keep the system accounting records consistent.
- Ensure the output is strictly valid JSON.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`خطأ في الاتصال بـ Gemini API: ${response.statusText}`);
    }

    const resData = await response.json();
    const resultText = resData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      console.error('Gemini API returned empty text');
      return null;
    }

    const parsedData: ParsedReceiptData = JSON.parse(resultText);
    return parsedData;
  } catch (err) {
    console.error('parseReceiptWithAI error:', err);
    throw err;
  }
};
