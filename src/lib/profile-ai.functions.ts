import { createOpenAI } from "@ai-sdk/openai";
import { createServerFn } from "@tanstack/react-start";
import { APICallError, Output, streamText } from "ai";
import { z } from "zod";

const Input = z.object({
  profile: z.string().min(20).max(200_000),
  locale: z.enum(["en", "zh", "ja"]).default("en"),
});

const Schema = z.object({
  summary: z
    .string()
    .describe("2-4 sentence plain-language overview of what installing this profile does"),
  settings: z.array(
    z.object({
      payload: z.string().describe("Payload display name or type"),
      explanation: z.string().describe("What this payload configures and its notable keys"),
    }),
  ),
  risks: z.array(
    z.object({
      severity: z.enum(["high", "medium", "low", "info"]),
      title: z.string(),
      detail: z.string(),
      recommendation: z.string(),
    }),
  ),
});

export type ProfileAnalysis = z.infer<typeof Schema>;

const SYSTEM = `You are an Apple device-management and security expert reviewing an Apple configuration profile (.mobileconfig) for a developer.
Explain each payload's settings concisely and flag potential security risks, e.g.: root CA / certificate trust payloads, VPN or proxy routing traffic, DNS settings, MDM enrollment and its access rights, restrictions being loosened, PayloadRemovalDisallowed, plaintext credentials, weak Wi-Fi encryption, broad PPPC/TCC privacy grants, system extensions / kernel extensions, managed login items, unsigned or unknown-origin profiles, far-future or missing expiration.
Values marked [REDACTED] were removed client-side for privacy; treat their presence (not value) as relevant.
Order risks by severity. If there is no real risk, return a single "info" item saying so. Keep each field under 80 words. Do not invent keys that are not in the profile.`;

export const analyzeProfile = createServerFn({ method: "POST" })
  .validator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<ProfileAnalysis> => {
    const key = process.env["AI_API_KEY"];
    const baseURL = process.env["AI_BASE_URL"];
    const model = process.env["AI_MODEL"];
    if (!key || !baseURL || !model) throw new Error("AI analysis is not configured.");
    const provider = createOpenAI({ baseURL, apiKey: key });
    try {
      const result = streamText({
        model: provider.chat(model),
        system: `${SYSTEM}\nWrite all human-readable response fields in ${{ en: "English", zh: "Simplified Chinese", ja: "Japanese" }[data.locale]}. Keep technical keys, identifiers and severity enum values unchanged.`,
        prompt: `Profile:\n\n${data.profile}`,
        output: Output.object({ schema: Schema }),
        maxRetries: 0,
      });
      return await result.output;
    } catch (e) {
      if (APICallError.isInstance(e)) {
        if (e.statusCode === 429)
          throw new Error("Too many requests right now — please try again in a minute.");
        if (e.statusCode === 402)
          throw new Error("The configured AI provider requires payment or additional credits.");
        throw new Error(`AI analysis failed (${e.statusCode ?? "network"}).`);
      }
      throw new Error(e instanceof Error ? e.message : "AI analysis failed.");
    }
  });
