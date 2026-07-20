import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import ChatSession from '../../../models/chatSession.model.js';
import { buildUserContext, buildSystemPrompt } from './context.builder.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.0-flash-lite';

// Safety settings — relaxed so auction-related discussions aren't blocked
const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

const sanitizeHistoryForGemini = (history) => {
    const clean = history.filter(h => h.parts?.length > 0 && h.parts[0]?.text?.trim());

    // Build strictly alternating pairs
    const pairs = [];
    for (let i = 0; i + 1 < clean.length; i += 2) {
        if (clean[i].role === 'user' && clean[i + 1]?.role === 'model') {
            pairs.push(clean[i], clean[i + 1]);
        }
    }

    // Keep last 20 turns (10 exchanges) to stay within token limits
    return pairs.slice(-20).map(h => ({
        role: h.role,
        parts: [{ text: h.parts[0].text }],
    }));
};

export const chatWithAI = async (userId, userMessage) => {
    if (!process.env.GEMINI_API_KEY) {
        return {
            reply: `⚠️ **BidMind is not configured yet.** Add \`GEMINI_API_KEY=your_key\` to \`server/.env\` (get a free key at ai.google.dev). Once added, I'll provide real-time personalized auction intelligence!`,
        };
    }

    // 1. Build RAG context from MongoDB
    const context = await buildUserContext(userId);
    const systemInstruction = buildSystemPrompt(context);

    // 2. Load or create session
    let session = await ChatSession.findOne({ userId });
    if (!session) {
        session = new ChatSession({ userId, history: [] });
    }

    // 3. Sanitize history per Gemini's strict requirements
    const safeHistory = sanitizeHistoryForGemini(session.history);


    // 5. Start chat helper — tries primary then fallback
    const tryChat = async (modelName) => {
        const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction,
            safetySettings: SAFETY_SETTINGS,
            generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
        });
        const chat = model.startChat({ history: safeHistory });
        const result = await chat.sendMessage(userMessage);
        return result.response;
    };

    // 6. Send message — handle all Gemini failure modes gracefully
    let aiText = '';
    try {
        let response;
        try {
            response = await tryChat(PRIMARY_MODEL);
        } catch (primaryErr) {
            const msg = primaryErr.message || '';
            if (msg.includes('429') || msg.includes('quota') || msg.includes('model output')) {
                console.warn('[AI Service] Primary model failed, using fallback:', msg.slice(0, 80));
                response = await tryChat(FALLBACK_MODEL);
            } else {
                throw primaryErr;
            }
        }

        // Blocked by safety filter → empty candidates
        const finishReason = response.candidates?.[0]?.finishReason;
        if (finishReason === 'SAFETY' || finishReason === 'RECITATION') {
            aiText = `I wasn't able to answer that specific question due to content guidelines. Could you rephrase your request?`;
        } else {
            aiText = response.text();
        }

        // Gemini can return an empty string even without an error
        if (!aiText?.trim()) {
            aiText = `I received an empty response. Please try rephrasing your question.`;
        }
    } catch (err) {
        console.error('[AI Service] Gemini error:', err.message);
        if (err.message?.includes('model output') || err.message?.includes('empty')) {
            aiText = `I had trouble forming a response for that. Could you try rephrasing your question?`;
        } else if (err.message?.includes('API_KEY') || err.message?.includes('credentials')) {
            aiText = `⚠️ Invalid or missing GEMINI_API_KEY. Please check your server configuration.`;
        } else {
            aiText = `I encountered an unexpected issue (${err.message?.slice(0, 80)}). Please try again in a moment.`;
        }
    }

    // 7. Persist to session history
    session.history.push(
        { role: 'user', parts: [{ text: userMessage }], timestamp: new Date() },
        { role: 'model', parts: [{ text: aiText }], timestamp: new Date() }
    );
    session.contextVersion += 1;
    await session.save();

    return { reply: aiText };
};

export const getAiHistoryService = async (userId) => {
    const session = await ChatSession.findOne({ userId }).lean();
    return session?.history || [];
};

export const clearAiHistoryService = async (userId) => {
    await ChatSession.findOneAndUpdate(
        { userId },
        { $set: { history: [], contextVersion: 0 } },
        { upsert: true }
    );
};
