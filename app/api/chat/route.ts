import { 
    streamText, 
    UIMessage, 
    convertToModelMessages, 
    stepCountIs, 
    createUIMessageStream, 
    createUIMessageStreamResponse,
    type Tool // <-- Added 'type Tool' to define the tools object type
} from 'ai';

import { MODEL } from '@/config';
import { SYSTEM_PROMPT } from '@/prompts';
import { isContentFlagged } from '@/lib/moderation';

// ❌ OLD IMPORTS - We are removing the generic web search 
// import { webSearch } from './tools/web-search'; 

// 🔑 NEW IMPORT: Import your specialized financial tool
import { getCurrentRatesTool } from "./tools/get-current-rates"; 

// Keep the Pinecone RAG tool import if you want RAG for definitions
import { vectorDatabaseSearch } from './tools/search-vector-database';

// Extend timeout for complex search and reasoning operations
export const maxDuration = 30; 

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const latestUserMessage = messages
        .filter(msg => msg.role === 'user')
        .pop();

    // --- Content Moderation Check ---
    if (latestUserMessage) {
        const textParts = latestUserMessage.parts
            .filter(part => part.type === 'text')
            .map(part => 'text' in part ? part.text : '')
            .join('');

        if (textParts) {
            const moderationResult = await isContentFlagged(textParts);

            if (moderationResult.flagged) {
                const stream = createUIMessageStream({
                    execute({ writer }) {
                        const textId = 'moderation-denial-text';

                        writer.write({
                            type: 'start',
                        });

                        writer.write({
                            type: 'text-start',
                            id: textId,
                        });

                        writer.write({
                            type: 'text-delta',
                            id: textId,
                            delta: moderationResult.denialMessage || "Your message violates our guidelines. I can't answer that.",
                        });

                        writer.write({
                            type: 'text-end',
                            id: textId,
                        });

                        writer.write({
                            type: 'finish',
                        });
                    },
                });

                return createUIMessageStreamResponse({ stream });
            }
        }
    }

    // --- AI Response Generation with Tool Calling ---
    
    // 🔑 Define the available tools. Note: webSearch is replaced by getCurrentRatesTool
    const availableTools: Record<string, Tool> = {
        getCurrentRatesTool, // Your new specialized Exa tool
        vectorDatabaseSearch, // Keep the RAG tool (if desired)
    };

    const result = streamText({
        model: MODEL,
        system: SYSTEM_PROMPT,
        messages: convertToModelMessages(messages),
        tools: availableTools, // Pass the specialized tools
        stopWhen: stepCountIs(10),
        providerOptions: {
            openai: {
                reasoningSummary: 'auto',
                reasoningEffort: 'low',
                parallelToolCalls: false,
            }
        }
    });

    return result.toUIMessageStreamResponse({
        sendReasoning: true,
    });
}
