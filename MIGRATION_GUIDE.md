# Migration Guide: @google/generative-ai to @google/genai

**Date:** February 5, 2026  
**Project:** Gym 3.0 - V5.2  
**Goal:** Transition from the deprecated legacy SDK to the official modern SDK.

## 1. Library Patterns Comparison

### 1.1 Initialization
The old SDK used a class-based instantiation, while the new SDK uses a factory function (`createClient`).

**Legacy SDK (@google/generative-ai):**
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(API_KEY);
const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
```

**Modern SDK (@google/genai):**
```typescript
import { createClient } from "@google/genai";

const client = createClient({ apiKey: API_KEY });
// Access models directly via client.models
```

### 1.2 Execution Pattern (Simple Text)
The new SDK adopts a more structured request object.

**Legacy SDK:**
```typescript
const result = await model.generateContent(promptString);
const text = result.response.text();
```

**Modern SDK:**
```typescript
const result = await client.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [{ role: 'user', parts: [{ text: promptString }] }]
});
const text = result.text(); // Helper still exists in v1.x
```

## 2. Key Differences in Gym 3.0 Functions

| Feature | Legacy (@google/generative-ai) | Modern (@google/genai) |
| :--- | :--- | :--- |
| **API Key Pass** | Passed to constructor as first argument. | Passed as an object property `{ apiKey: key }`. |
| **Model Selection** | via `ai.getGenerativeModel({ model: "..." })`. | Passed inside the `generateContent` config object. |
| **Response Parsing** | `result.response.text()` | `result.text()` (direct on result) or `result.response.text()`. |
| **Input Structure** | Accepts raw string. | Requires `contents` array with `role` and `parts`. |

## 3. Function-Specific Migration Notes

### 3.1 `handleGeminiEval` & `handleReflectionSubmit`
These currently use a single prompt generator.
- **Change:** Instead of just passing `prompt`, they must wrap the `promptGenerator` output into the structure: `{ contents: [{ role: 'user', parts: [{ text: prompt }] }] }`.

### 3.2 `handleChatSend`
Currently, this function generates a long string containing the history and sends it as a single prompt.
- **Current logic:** `const prompt = content.promptGenerator(newHistory, chatInput, content.scenario);`
- **Migration:** Maintain the string generation logic, but use the new `client.models.generateContent` call pattern. 

## 4. Why Migrate?
1. **End of Life:** Support for `@google/generative-ai` ended in November 2025.
2. **Stability:** The new SDK is built for the 2.x/3.x series models (like the recently selected `gemini-2.5-flash`).
3. **Performance:** Better support for streaming and direct type safety in TypeScript.

## 5. Security Note
Inทั้ง SDKs, ensure the `API_KEY` is not exposed in the client bundle. The current project correctly uses `process.env.API_KEY`, but this requires a secure environment (like Vite's `.env` handling or a backend proxy).
