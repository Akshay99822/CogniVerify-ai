import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ForensicEvidence {
  label: string;
  match_percentage: number;
  analysis_focus: string;
  forensic_reason: string;
  image_query: string;
}

export interface AnalysisResult {
  verdict: "REAL" | "FAKE" | "MISLEADING";
  confidence_score: number;
  claim: string;
  reality_check: string;
  reasoning: string[];
  manipulation_signals: string[];
  supporting_facts: string[];
  source_reliability: {
    level: "HIGH" | "MEDIUM" | "LOW";
    explanation: string;
  };
  final_explanation_simple: string;
  image_prompt: string;
  forensic_gallery: ForensicEvidence[];
}

export const analyzeNews = async (input: { text?: string, url?: string, imageBase64?: string }): Promise<AnalysisResult> => {
  const model = "gemini-3-flash-preview";
  
  let prompt = "Analyze the following news content for authenticity:\n";
  if (input.url) prompt += `URL: ${input.url}\n`;
  if (input.text) prompt += `Content: ${input.text}\n`;

  const parts: any[] = [{ text: prompt }];
  
  if (input.imageBase64) {
    parts.push({
      inlineData: {
        data: input.imageBase64.split(',')[1],
        mimeType: "image/jpeg"
      }
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts }],
    config: {
      systemInstruction: `You are "CogniVerify AI", an advanced fake news detection and fact-checking system.
      Your task is to analyze a given news claim, article, or URL and determine whether it is REAL, FAKE, or MISLEADING.

      STRICT OUTPUT STRUCTURE:
      - VERDICT: (FAKE / REAL / MISLEADING)
      - CONFIDENCE SCORE: (Realistic percentage between 70%–98%, NEVER 100%)
      - CLAIM: (Summarize the main claim in one line)
      - REALITY CHECK: (Provide verified factual comparison using known scientific, historical, or logical data)
      - REASONING: (Bullet points identifying exaggeration, impossibility, lack of sources, or sensational language)
      - MANIPULATION SIGNALS: (Bullet points for clickbait, fear tactics, conspiracy framing, etc.)
      - SUPPORTING FACTS: (2–4 real-world facts, scientific limits, or verified reports)
      - SOURCE RELIABILITY: (HIGH / MEDIUM / LOW with explanation)
      - FINAL EXPLANATION (SIMPLE): (2–3 lines in simple English)

      STRICT RULES:
      - Be precise, analytical, and realistic.
      - Do NOT hallucinate fake sources.
      - If unsure, classify as MISLEADING instead of guessing.
      - Use scientific reasoning when applicable (e.g., biology limits, physics laws).
      - Avoid overconfidence.
      - For the forensic_gallery, generate 3-4 unique entries with technical forensic reasons.
      - 'image_query' should be a specific search query for a relevant image.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verdict: { type: Type.STRING, enum: ["REAL", "FAKE", "MISLEADING"] },
          confidence_score: { type: Type.NUMBER },
          claim: { type: Type.STRING },
          reality_check: { type: Type.STRING },
          reasoning: { type: Type.ARRAY, items: { type: Type.STRING } },
          manipulation_signals: { type: Type.ARRAY, items: { type: Type.STRING } },
          supporting_facts: { type: Type.ARRAY, items: { type: Type.STRING } },
          source_reliability: {
            type: Type.OBJECT,
            properties: {
              level: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
              explanation: { type: Type.STRING }
            },
            required: ["level", "explanation"]
          },
          final_explanation_simple: { type: Type.STRING },
          image_prompt: { type: Type.STRING },
          forensic_gallery: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                match_percentage: { type: Type.NUMBER },
                analysis_focus: { type: Type.STRING },
                forensic_reason: { type: Type.STRING },
                image_query: { type: Type.STRING }
              },
              required: ["label", "match_percentage", "analysis_focus", "forensic_reason", "image_query"]
            }
          }
        },
        required: ["verdict", "confidence_score", "claim", "reality_check", "reasoning", "manipulation_signals", "supporting_facts", "source_reliability", "final_explanation_simple", "image_prompt", "forensic_gallery"]
      },
      tools: [{ googleSearch: {} }]
    }
  });

  if (!response.text) {
    throw new Error("Failed to get analysis response");
  }

  return JSON.parse(response.text) as AnalysisResult;
};

export const generateVisualContext = async (prompt: string): Promise<string> => {
  const model = "gemini-2.5-flash-image";
  
  const response = await ai.models.generateContent({
    model,
    contents: [{
      parts: [{ text: `A realistic, high-quality news agency photograph of: ${prompt}. Photojournalism style, natural lighting, sharp focus, 8k resolution, authentic news atmosphere.` }]
    }],
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "1K"
      }
    }
  });

  const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (imagePart?.inlineData?.data) {
    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  }
  
  throw new Error("Failed to generate image");
};
