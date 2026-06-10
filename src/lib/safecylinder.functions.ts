import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

async function callGateway(body: unknown) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI gateway ${res.status}: ${text}`);
  }
  return res.json();
}

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in response");
  return JSON.parse(match[0]);
}

export const analyzeCylinderImage = createServerFn({ method: "POST" })
  .inputValidator(z.object({ imageDataUrl: z.string().min(20), language: z.string().optional() }))
  .handler(async ({ data }) => {
    const lang = data.language || "English";
    const result = await callGateway({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            `You are an LPG cylinder safety expert. The user has photographed the test date ring on a domestic LPG cylinder. Extract the alphanumeric expiry/test code (format: letter + two digits, e.g., A27, C29, D31 — where the letter = quarter A/B/C/D and the number = year, two-digit). Quarter A = Jan-Mar, B = Apr-Jun, C = Jul-Sep, D = Oct-Dec. Cylinders expire at the END of their stamped quarter. Compute months_remaining from today. Return ONLY a JSON object with keys: code, quarter (1-4), year (4 digit), expiry_date (human string in ${lang}), is_expired (bool), months_remaining (int). If the code is unreadable, return {"error":"unreadable"}.`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Today's date: ${new Date().toISOString().slice(0, 10)}. Read the test code on the metal ring and return the JSON.` },
            { type: "image_url", image_url: { url: data.imageDataUrl } },
          ],
        },
      ],
    });
    const text = result.choices?.[0]?.message?.content ?? "";
    return extractJson(text) as
      | { code: string; quarter: number; year: number; expiry_date: string; is_expired: boolean; months_remaining: number }
      | { error: string };
  });

export const analyzeLeakAudio = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      audioDataUrl: z.string().min(20),
      rms: z.number(),
      peakFreqHz: z.number().optional(),
      durationSec: z.number(),
      language: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const lang = data.language || "English";
    const result = await callGateway({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            `You are an acoustic safety analyst. The user held their phone near an LPG regulator for a few seconds to check for gas leaks. Analyse the audio and the supplied measurements to determine signs of a high-frequency hiss (500Hz–4kHz), irregular pressure sounds, or continuous airflow noise consistent with a gas leak. Be conservative — if uncertain, flag as possible leak. Return ONLY JSON with keys: leak_detected (bool), confidence ('low'|'medium'|'high'), frequency_notes (string), recommendation (string). Write the frequency_notes and recommendation strings in ${lang}.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Duration: ${data.durationSec}s. Background noise RMS: ${data.rms.toFixed(4)}. ${data.peakFreqHz ? `Detected peak frequency: ~${Math.round(data.peakFreqHz)}Hz.` : ""} Analyse the audio below.`,
            },
            { type: "input_audio", input_audio: { data: data.audioDataUrl.split(",")[1] ?? data.audioDataUrl, format: "wav" } },
          ],
        },
      ],
    });
    const text = result.choices?.[0]?.message?.content ?? "";
    return extractJson(text) as {
      leak_detected: boolean;
      confidence: "low" | "medium" | "high";
      frequency_notes: string;
      recommendation: string;
    };
  });
