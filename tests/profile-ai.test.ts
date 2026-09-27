import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { analyzeProfile } from "../src/lib/profile-ai.functions";

// Exercise the server handler and real SDK without the framework's HTTP transport.
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({
    validator: () => ({ handler: (handler: unknown) => handler }),
  }),
}));

const input = {
  profile: "<plist><dict><key>Password</key><string>[REDACTED]</string></dict></plist>",
  locale: "zh" as const,
};
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("AI_API_KEY", "test-key");
  vi.stubEnv("AI_BASE_URL", "https://ai.example.test/v1");
  vi.stubEnv("AI_MODEL", "test-model");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

test.each(["AI_API_KEY", "AI_BASE_URL", "AI_MODEL"])(
  "missing %s disables AI without making a network request",
  async (name) => {
    vi.stubEnv(name, "");
    await expect(analyzeProfile({ data: input })).rejects.toThrow("AI analysis is not configured.");
    expect(fetchMock).not.toHaveBeenCalled();
  },
);

test("uses the configured compatible endpoint and returns structured profile analysis", async () => {
  const analysis = { summary: "测试摘要", settings: [], risks: [] };
  const chunk = {
    id: "test-completion",
    object: "chat.completion.chunk",
    created: 1,
    model: "test-model",
    choices: [{ index: 0, delta: { content: JSON.stringify(analysis) }, finish_reason: null }],
  };
  const done = {
    ...chunk,
    choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
  };
  fetchMock.mockResolvedValueOnce(
    new Response(
      `data: ${JSON.stringify(chunk)}\n\ndata: ${JSON.stringify(done)}\n\ndata: [DONE]\n\n`,
      {
        headers: { "content-type": "text/event-stream" },
      },
    ),
  );

  await expect(analyzeProfile({ data: input })).resolves.toEqual(analysis);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [url, options] = fetchMock.mock.calls[0] ?? [];
  expect(url).toBe("https://ai.example.test/v1/chat/completions");
  expect(new Headers(options?.headers).get("authorization")).toBe("Bearer test-key");
  const body = JSON.parse(String(options?.body));
  expect(body.model).toBe("test-model");
  expect(body.messages[0].content).toContain("Simplified Chinese");
  expect(body.messages[1].content).toContain("[REDACTED]");
  expect(body.response_format.type).toBe("json_schema");
});
