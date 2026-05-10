import Anthropic from "@anthropic-ai/sdk";

export type WorkMode = "remote" | "onsite" | "hybrid";

export interface ExtractedFields {
  companyName?: string;
  jobTitle?: string;
  salary?: string;
  workMode?: WorkMode;
  jobUrl?: string;
  sourceName?: string;
}

export type ExtractionResult =
  | { ok: true; fields: ExtractedFields }
  | { ok: false; error: string };

const SYSTEM_PROMPT = `You extract structured fields from job vacancy postings.

Critical rules:
- Only include a field if its value is LITERALLY PRESENT in the text. Never guess or infer.
- If a field is absent, ambiguous, or you are uncertain, omit it from your output.
- Never fabricate, paraphrase, or normalize values beyond mapping work mode to the allowed enum.

Field guidance:
- companyName: the hiring company's name as written.
- jobTitle: the role title as written.
- salary: the salary or salary range, copied verbatim (keep currency, units, formatting).
- workMode: map phrases to one of "remote" / "onsite" / "hybrid". "Remote", "Fully remote", "WFH", "Work from home", "Anywhere" -> remote. "Onsite", "On-site", "In-office", "In person" -> onsite. "Hybrid", "Flexible (X days remote, Y days office)" -> hybrid. Omit if not stated.
- jobUrl: the URL of the listing itself if it appears verbatim in the text. Job postings rarely contain their own URL; usually omit.
- sourceName: the platform or source (e.g. "LinkedIn", "Indeed", "Greenhouse", "dou", "djinni"). Almost never appears in vacancy bodies; usually omit.`;

const TOOL_NAME = "extract_vacancy_fields";

const TOOL_INPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    companyName: { type: "string" as const },
    jobTitle: { type: "string" as const },
    salary: { type: "string" as const },
    workMode: { type: "string" as const, enum: ["remote", "onsite", "hybrid"] },
    jobUrl: { type: "string" as const },
    sourceName: { type: "string" as const },
  },
  required: [],
};

interface ExtractOptions {
  apiKey: string;
}

export async function extractVacancyFields(
  text: string,
  options: ExtractOptions,
): Promise<ExtractionResult> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: true, fields: {} };

  const client = new Anthropic({ apiKey: options.apiKey });

  let response;
  try {
    response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [
        {
          name: TOOL_NAME,
          description:
            "Record the fields you extracted from the vacancy posting.",
          input_schema: TOOL_INPUT_SCHEMA,
        },
      ],
      tool_choice: { type: "tool", name: TOOL_NAME },
      messages: [{ role: "user", content: trimmed }],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );
  if (!toolUse) return { ok: false, error: "Model did not return extraction" };

  return { ok: true, fields: normalize(toolUse.input) };
}

function normalize(raw: unknown): ExtractedFields {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  const out: ExtractedFields = {};

  const str = (v: unknown): string | undefined => {
    if (typeof v !== "string") return undefined;
    const s = v.trim();
    return s ? s : undefined;
  };

  out.companyName = str(obj.companyName);
  out.jobTitle = str(obj.jobTitle);
  out.salary = str(obj.salary);
  out.jobUrl = str(obj.jobUrl);
  out.sourceName = str(obj.sourceName);

  const wm = obj.workMode;
  if (wm === "remote" || wm === "onsite" || wm === "hybrid") out.workMode = wm;

  for (const key of Object.keys(out) as (keyof ExtractedFields)[]) {
    if (out[key] === undefined) delete out[key];
  }
  return out;
}
