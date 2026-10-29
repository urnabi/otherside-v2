import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Conversation data models
export interface Participant {
  id: string;
  name: string;
  role: 'creator' | 'invited';
  phoneOrEmail?: string;
  avatarBg?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  wasMediated: boolean;
  originalDraft?: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  inviteToken: string;
  title: string;
  participants: Participant[];
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  topicContext?: string;
}

// Initial realistic seed conversations demonstrating AI Mediator in practice
const defaultConversations: Conversation[] = [
  {
    id: 'conv-maya-lease',
    inviteToken: 'inv-maya-lease-892',
    title: 'Apartment Lease & Cleaning Schedule',
    topicContext: 'Roommates discussing division of chores and lease renewal',
    participants: [
      { id: 'user-me', name: 'You', role: 'creator', avatarBg: '#8E84B8' },
      { id: 'user-maya', name: 'Maya Lin', role: 'invited', phoneOrEmail: '+1 (555) 234-8901', avatarBg: '#6D8B74' }
    ],
    status: 'accepted',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    messages: [
      {
        id: 'msg-1',
        conversationId: 'conv-maya-lease',
        senderId: 'user-maya',
        senderName: 'Maya Lin',
        text: 'Hey! The landlord sent the lease renewal documents for next year. Have you had a chance to look at them?',
        wasMediated: false,
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        status: 'read'
      },
      {
        id: 'msg-2',
        conversationId: 'conv-maya-lease',
        senderId: 'user-me',
        senderName: 'You',
        text: "I did look at them. Before I sign, I'd really like us to talk through keeping up with shared chores, because I've been feeling overwhelmed doing most of the kitchen cleaning recently.",
        wasMediated: true,
        originalDraft: "You never clean the kitchen and leave everything to me. I'm not signing until you pull your weight.",
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        status: 'read'
      },
      {
        id: 'msg-3',
        conversationId: 'conv-maya-lease',
        senderId: 'user-maya',
        senderName: 'Maya Lin',
        text: "I really appreciate you being upfront about that. I honestly didn't realize it felt so unbalanced with my late shifts this month. Can we sit down tonight and draw up an equitable weekly plan?",
        wasMediated: true,
        originalDraft: "I work 60 hours a week, don't act like I do nothing! Fine whatever.",
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: 'read'
      }
    ]
  },
  {
    id: 'conv-alex-project',
    inviteToken: 'inv-alex-proj-419',
    title: 'Product Launch Timeline',
    topicContext: 'Coworkers aligning on design delivery dates',
    participants: [
      { id: 'user-me', name: 'You', role: 'creator', avatarBg: '#8E84B8' },
      { id: 'user-alex', name: 'Alex Rivera', role: 'invited', phoneOrEmail: 'alex.r@studio.design', avatarBg: '#E39E79' }
    ],
    status: 'accepted',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    messages: [
      {
        id: 'msg-alex-1',
        conversationId: 'conv-alex-project',
        senderId: 'user-alex',
        senderName: 'Alex Rivera',
        text: 'Are the mobile responsiveness specs ready yet? The engineering team is blocked waiting on this.',
        wasMediated: false,
        timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(),
        status: 'read'
      },
      {
        id: 'msg-alex-2',
        conversationId: 'conv-alex-project',
        senderId: 'user-me',
        senderName: 'You',
        text: "I understand the team needs to keep moving. I'm finalizing the touch-target specs today and will upload them by 3 PM so you'll have everything needed for the sprint.",
        wasMediated: true,
        originalDraft: "Stop pestering me, I already told you I have other fires to put out today.",
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
        status: 'read'
      }
    ]
  }
];

let conversations: Conversation[] = [...defaultConversations];

// Helper to generate IDs
function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

// AI Mediator prompt and analysis helper
const MEDIATOR_SYSTEM_INSTRUCTION = `You are THE OTHER SIDE, a neutral, empathetic, and transparent communication assistant. Help users express what they mean clearly and respectfully, especially during disagreements. Your role is to improve communication, not to decide who is right or wrong.

Preserve the user’s original meaning, feelings, boundaries, and intended message. Identify wording that could unintentionally sound accusatory, dismissive, hostile, or ambiguous, and suggest a clearer alternative. Explain briefly why the rewrite may reduce misunderstanding.

Never invent facts, assume hidden intentions, manipulate the recipient, pressure users to forgive, or force reconciliation. Do not automatically soften legitimate boundaries, concerns, or direct requests. Respectful communication can still be firm.

Always distinguish the user’s original message from AI-generated suggestions. Let the user edit, reject, or send the original message at any time. Never send anything without explicit approval.

Your goal is to help both people communicate and understand one another better, while preserving their autonomy and control.`;

// Heuristic fallback in case Gemini API is temporarily unreachable
function fallbackAnalysis(draft: string) {
  const trimmed = draft.trim();
  const lower = trimmed.toLowerCase();

  const isBlaming = /you always|you never|you should have|your fault|why can't you|it's your/i.test(lower);
  const isSarcasticOrPassive = /whatever|fine then|good luck with that|as usual|obviously|if you even care/i.test(lower);
  const isAggressive = /shut up|idiot|stupid|hate|ridiculous|pissed|annoyed/i.test(lower);

  let suggestedRewrite = trimmed;
  let reasoning = 'Your message is straightforward. We preserved your exact points while keeping a constructive tone.';
  let emotionalIntensity: 'Calm' | 'Moderate' | 'High' = 'Calm';
  let potentialMisunderstanding = 'Unlikely to cause defensiveness.';
  let isAlreadyClear = true;

  if (isBlaming || isSarcasticOrPassive || isAggressive) {
    isAlreadyClear = false;
    emotionalIntensity = isAggressive ? 'High' : 'Moderate';

    if (isBlaming) {
      potentialMisunderstanding = 'Starting with accusations ("you always / you never") prompts defensive reactions rather than problem-solving.';
      suggestedRewrite = trimmed
        .replace(/you never/gi, "I feel like we haven't been able to")
        .replace(/you always/gi, 'I notice it often happens that')
        .replace(/your fault/gi, 'something we need to address');
      reasoning = 'Reframed around your personal experience and request, keeping your boundary intact without triggering immediate defensiveness.';
    } else if (isSarcasticOrPassive) {
      potentialMisunderstanding = 'Dismissive phrases like "whatever" or "as usual" mask what you genuinely need heard.';
      suggestedRewrite = `I feel frustrated about this situation, and I would appreciate if we could clarify expectations directly.`;
      reasoning = 'Replaces sarcastic tone with genuine honesty about your feelings and asks for clarity.';
    } else {
      potentialMisunderstanding = 'Strong emotional language can obscure the valid concern you are trying to address.';
      suggestedRewrite = `I'm feeling very overwhelmed and troubled by this. I need us to address what happened calmly.`;
      reasoning = 'Honors your strong emotion and need for resolution while removing incendiary phrasing.';
    }
  } else {
    // If already calm and clear
    suggestedRewrite = trimmed;
    reasoning = 'Your message already communicates your intent clearly and respectfully without accusatory phrasing.';
  }

  return {
    suggestedRewrite,
    reasoning,
    toneAnalysis: {
      emotionalIntensity,
      potentialMisunderstanding,
      isAlreadyClear,
      preservesBoundaries: 'Preserves your exact request and perspective.'
    }
  };
}

// ----------------- API ROUTES -----------------

// 1. Mediator Analyze endpoint
app.post('/api/mediator/analyze', async (req, res) => {
  try {
    const { draft, conversationContext, senderName, recipientName } = req.body;

    if (!draft || typeof draft !== 'string') {
      return res.status(400).json({ error: 'Draft message text is required' });
    }

    const trimmedDraft = draft.trim();
    if (!trimmedDraft) {
      return res.status(400).json({ error: 'Draft cannot be empty' });
    }

    if (!aiClient) {
      // Use empathetic fallback if no API key is present
      const fallback = fallbackAnalysis(trimmedDraft);
      return res.json(fallback);
    }

    // Call Gemini API with structured output
    const prompt = `Sender: "${senderName || 'Sender'}"
Recipient: "${recipientName || 'Recipient'}"
Conversation context: "${conversationContext || 'Ongoing conversation'}"

User's Original Outgoing Draft:
"""
${trimmedDraft}
"""

Analyze this outgoing draft carefully according to your mediator instructions.
Identify any wording that could unintentionally sound accusatory, dismissive, hostile, or ambiguous.
Determine whether a rewrite is actually needed. If it is already clear and respectful, state so and keep the rewrite identical or with minimal polish.
Generate a calmer, clearer suggested rewrite that preserves the sender's original meaning, feelings, boundaries, and intended request.
Explain briefly why the rewrite reduces misunderstanding without taking sides.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: MEDIATOR_SYSTEM_INSTRUCTION,
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedRewrite: {
              type: Type.STRING,
              description: 'Calmer, clearer rewrite preserving original meaning and boundaries.'
            },
            reasoning: {
              type: Type.STRING,
              description: 'Brief, neutral explanation of why this rewrite reduces misunderstanding.'
            },
            toneAnalysis: {
              type: Type.OBJECT,
              properties: {
                emotionalIntensity: {
                  type: Type.STRING,
                  description: 'Calm, Moderate, or High'
                },
                potentialMisunderstanding: {
                  type: Type.STRING,
                  description: 'What the recipient might hear or react defensively to in the original draft.'
                },
                isAlreadyClear: {
                  type: Type.BOOLEAN,
                  description: 'True if original was already clear, respectful, and did not need substantial rewording.'
                },
                preservesBoundaries: {
                  type: Type.STRING,
                  description: 'How the rewrite protects the user\'s legitimate boundary or need.'
                }
              },
              required: ['emotionalIntensity', 'potentialMisunderstanding', 'isAlreadyClear', 'preservesBoundaries']
            }
          },
          required: ['suggestedRewrite', 'reasoning', 'toneAnalysis']
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      return res.json(fallbackAnalysis(trimmedDraft));
    }

    const parsed = JSON.parse(responseText);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing message with AI:', error);
    // Graceful fallback to guarantee zero disruption to the user
    const fallback = fallbackAnalysis(req.body.draft || '');
    return res.json(fallback);
  }
});

// 2. Get all conversations (for Home / Older Chats)
app.get('/api/conversations', (req, res) => {
  // Sort by most recently updated
  const sorted = [...conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  res.json({ conversations: sorted });
});

// 3. Get single conversation by ID or Invite Token
app.get('/api/conversations/:idOrToken', (req, res) => {
  const { idOrToken } = req.params;
  const conv = conversations.find(
    (c) => c.id === idOrToken || c.inviteToken === idOrToken
  );
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  res.json({ conversation: conv });
});

// 4. Create new conversation & invitation
app.post('/api/conversations', (req, res) => {
  const { recipientName, phoneOrEmail, topicContext, creatorName } = req.body;

  if (!recipientName || !recipientName.trim()) {
    return res.status(400).json({ error: 'Recipient name is required' });
  }

  const newId = generateId('conv');
  const token = `inv-${Math.random().toString(36).substring(2, 10)}`;

  const newConv: Conversation = {
    id: newId,
    inviteToken: token,
    title: topicContext?.trim() || `Conversation with ${recipientName.trim()}`,
    topicContext: topicContext?.trim() || 'Open dialogue with AI mediation',
    participants: [
      {
        id: 'user-me',
        name: creatorName?.trim() || 'You',
        role: 'creator',
        avatarBg: '#8E84B8'
      },
      {
        id: `user-${Math.random().toString(36).substring(2, 7)}`,
        name: recipientName.trim(),
        role: 'invited',
        phoneOrEmail: phoneOrEmail?.trim() || undefined,
        avatarBg: '#6D8B74'
      }
    ],
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: []
  };

  conversations.unshift(newConv);
  res.status(201).json({ conversation: newConv });
});

// 5. Accept invitation
app.post('/api/conversations/:idOrToken/accept', (req, res) => {
  const { idOrToken } = req.params;
  const conv = conversations.find(
    (c) => c.id === idOrToken || c.inviteToken === idOrToken
  );
  if (!conv) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  conv.status = 'accepted';
  conv.updatedAt = new Date().toISOString();
  res.json({ conversation: conv, message: 'Invitation accepted successfully' });
});

// 6. Decline invitation
app.post('/api/conversations/:idOrToken/decline', (req, res) => {
  const { idOrToken } = req.params;
  const conv = conversations.find(
    (c) => c.id === idOrToken || c.inviteToken === idOrToken
  );
  if (!conv) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  conv.status = 'declined';
  conv.updatedAt = new Date().toISOString();
  res.json({ conversation: conv, message: 'Invitation declined' });
});

// 7. Post message to conversation
app.post('/api/conversations/:id/messages', (req, res) => {
  const { id } = req.params;
  const { senderId, senderName, text, wasMediated, originalDraft } = req.body;

  const conv = conversations.find((c) => c.id === id);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  if (conv.status !== 'accepted') {
    return res.status(403).json({
      error: 'Cannot send messages to a conversation that has not been accepted by the invited recipient.'
    });
  }

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text cannot be empty' });
  }

  const newMessage: Message = {
    id: generateId('msg'),
    conversationId: conv.id,
    senderId: senderId || 'user-me',
    senderName: senderName || 'You',
    text: text.trim(),
    wasMediated: !!wasMediated,
    originalDraft: wasMediated ? originalDraft : undefined,
    timestamp: new Date().toISOString(),
    status: 'delivered'
  };

  conv.messages.push(newMessage);
  conv.updatedAt = new Date().toISOString();

  res.status(201).json({ message: newMessage, conversation: conv });
});

// 8. Delete or leave conversation
app.delete('/api/conversations/:id', (req, res) => {
  const { id } = req.params;
  const index = conversations.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  conversations.splice(index, 1);
  res.json({ success: true, message: 'Conversation removed' });
});

// 9. Reset data
app.post('/api/reset-data', (req, res) => {
  conversations = [...defaultConversations];
  res.json({ success: true, message: 'Demo data reset to initial state' });
});

// Setup Vite middlewares in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`THE OTHER SIDE server running on port ${PORT}`);
  });
}

startServer();
