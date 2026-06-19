import { ai } from "./gemini";

function cleanJson(text: string) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

export async function researchExamDetails(
  examName: string,
  country: string
) {
  const prompt = `
Using web search.

Find details about:

${examName}
Country: ${country}

Return ONLY VALID JSON.

{
  "description": "string",

  "minAge": 0,
  "maxAge": 0,

  "education": "string",

  "nationality": "string",

  "experience": "string",

  "physicalRequirements": "string",

  "attemptsAllowed": "string",

  "categoryRelaxation": "string",

  "officialUrl": "string"
}

RULES:

- Every field except minAge and maxAge MUST be a plain string.
- NEVER return objects.
- NEVER return arrays.
- NEVER return nested JSON.
- If information contains multiple categories, combine them into a single text string.
- Example:

"physicalRequirements":
"Flying Branch: Medical fitness required. Ground Duty: Standard medical requirements."

NOT:

"physicalRequirements": {
  "flyingBranch": "...",
  "groundDuty": "..."
}
`;
let response;

  try {

    response =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

  } catch (error: any) {

    if (
      error?.message?.includes("503") ||
      error?.message?.includes("UNAVAILABLE")
    ) {

      await new Promise(
        resolve =>
          setTimeout(resolve, 2000)
      );

response =
  await ai.models.generateContent({
    model: "gemini-2.5-flash",

    contents: prompt,

    config: {
      tools: [
        {
          googleSearch: {},
        },
      ],
    },
  });

    } else {

      throw error;

    }
  }

  return JSON.parse(
    cleanJson(
      response.text || "{}"
    )
  );
}