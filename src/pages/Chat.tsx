import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { chatAPI, xrayAPI, symptomsAPI } from '@/lib/api';
import { Send, Loader2, User, Plus, Shield, Sparkles, FileImage, Stethoscope, HelpCircle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface XRayAnalysis {
  id: string;
  prediction: string;
  confidence: number;
  all_predictions: Record<string, number>;
  notes: string | null;
  created_at: string;
}

interface SymptomCheck {
  id: string;
  symptoms: string[];
  risk_level: string;
  recommendations: string[];
  created_at: string;
}

interface UserMedicalContext {
  latestXRay: XRayAnalysis | null;
  latestSymptom: SymptomCheck | null;
  recentXRays: XRayAnalysis[];
}

const buildSystemPrompt = (context: UserMedicalContext) => {
  let prompt = `You are the Clinical AI Assistant, an educational medical AI integrated with the MediVision platform.

## Your Capabilities:
1. You have access to the user's medical analysis history from this platform
2. Explain X-ray analysis results in plain language
3. Clarify symptom assessment results
4. Answer questions about chest conditions
5. Provide general health information

## Important Guidelines:
- This is for EDUCATIONAL purposes only, not medical diagnosis
- Always recommend consulting healthcare professionals for medical decisions
- Be clear, precise, and explain medical terms when used
- Reference the user's actual data when relevant

`;

  // Add user's latest X-ray context
  if (context.latestXRay) {
    const xray = context.latestXRay;
    const predictionLabel = xray.prediction.replace('_', ' ').replace(/^\w/, c => c.toUpperCase());
    prompt += `## User's Latest X-Ray Analysis (${format(new Date(xray.created_at), 'MMM d, yyyy HH:mm')}):
- **Primary Finding:** ${predictionLabel}
- **Confidence Score:** ${xray.confidence}%
- **All Classifications:**
  - Normal: ${xray.all_predictions.normal || 0}%
  - COVID-19: ${xray.all_predictions.covid19 || 0}%
  - Pneumonia: ${xray.all_predictions.pneumonia || 0}%
  - Lung Opacity: ${xray.all_predictions.lung_opacity || 0}%
${xray.notes ? `- **Clinical Notes:** ${xray.notes}` : ''}

`;
  } else {
    prompt += `## User's X-Ray History:
No X-ray analyses on record yet.

`;
  }

  // Add user's latest symptom check context
  if (context.latestSymptom) {
    const symptom = context.latestSymptom;
    const riskLabel = symptom.risk_level?.replace(/^\w/, c => c.toUpperCase()) || 'Unknown';
    prompt += `## User's Latest Symptom Check (${format(new Date(symptom.created_at), 'MMM d, yyyy HH:mm')}):
- **Risk Level:** ${riskLabel}
- **Reported Symptoms:** ${symptom.symptoms?.join(', ') || 'None recorded'}
- **Recommendations Given:** ${symptom.recommendations?.join('; ') || 'None'}

`;
  }

  // Add count of historical analyses
  if (context.recentXRays.length > 1) {
    prompt += `## Analysis History Summary:
The user has ${context.recentXRays.length} X-ray analyses on record.

`;
  }

  prompt += `## Instructions:
When the user asks about their "latest report", "my results", "my X-ray", or similar, refer to the data above.
If they ask about specific terms or findings, explain them in the context of their actual results.
If no data is available, let them know they haven't uploaded any analyses yet and guide them to do so.`;

  return prompt;
};

const STARTER_PROMPTS = [
  { icon: FileImage, text: "Explain my X-ray result", query: "Can you explain my latest X-ray analysis result?" },
  { icon: HelpCircle, text: "What does my confidence score mean?", query: "What does the confidence score in my X-ray result mean?" },
  { icon: Stethoscope, text: "What should I do next?", query: "Based on my latest results, what should I do next?" },
  { icon: Activity, text: "Compare my results", query: "Can you summarize all my analysis history?" },
];

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>(() => crypto.randomUUID());
  const [medicalContext, setMedicalContext] = useState<UserMedicalContext>({
    latestXRay: null,
    latestSymptom: null,
    recentXRays: [],
  });
  const [contextLoaded, setContextLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch user's medical context
  useEffect(() => {
    const fetchMedicalContext = async () => {
      if (!user) return;

      try {
        // Fetch context from API
        const context = await chatAPI.getContext();

        const xrays = context.xrays?.map(x => ({
          ...x,
          all_predictions: x.all_predictions as unknown as Record<string, number>
        })) || [];

        const symptoms = context.symptoms?.map(s => ({
          ...s,
          symptoms: s.symptoms as unknown as string[],
          recommendations: s.recommendations as unknown as string[]
        })) || [];

        setMedicalContext({
          latestXRay: xrays[0] || null,
          latestSymptom: symptoms[0] || null,
          recentXRays: xrays,
        });
        setContextLoaded(true);
      } catch (error) {
        console.error('Error fetching medical context:', error);
        setContextLoaded(true);
      }
    };

    fetchMedicalContext();
  }, [user]);

  const getWelcomeMessage = (): Message => {
    const hasData = medicalContext.latestXRay || medicalContext.latestSymptom;

    let content = `Hello! I'm the Clinical AI Assistant. 👋

I have access to your MediVision analysis history and can help you understand:
• Your X-ray analysis results
• Symptom assessment findings
• Medical terminology and conditions

`;

    if (hasData) {
      content += `**Your Data:** `;
      const dataParts = [];
      if (medicalContext.latestXRay) {
        dataParts.push(`Latest X-ray from ${format(new Date(medicalContext.latestXRay.created_at), 'MMM d')}`);
      }
      if (medicalContext.latestSymptom) {
        dataParts.push(`Latest symptom check from ${format(new Date(medicalContext.latestSymptom.created_at), 'MMM d')}`);
      }
      content += dataParts.join(' • ') + '\n\n';
    } else {
      content += `**No analyses yet** - Upload an X-ray or check symptoms to get started!\n\n`;
    }

    content += `**Important:** I provide educational information only, not medical advice. Always consult a healthcare professional for medical decisions.

How can I help you today?`;

    return {
      id: 'welcome',
      role: 'assistant',
      content,
      createdAt: new Date(),
    };
  };

  useEffect(() => {
    const loadMessages = async () => {
      if (!user || !contextLoaded) return;

      try {
        const data = await chatAPI.getMessages(conversationId);

        if (data && data.length > 0) {
          setMessages(
            data.map((m: any) => ({
              id: m._id || m.id,
              role: m.role as 'user' | 'assistant',
              content: m.content,
              createdAt: new Date(m.created_at),
            }))
          );
        } else {
          setMessages([getWelcomeMessage()]);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([getWelcomeMessage()]);
      }
    };

    loadMessages();
  }, [user, conversationId, contextLoaded]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || !user || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send message and get AI response
      const response = await chatAPI.chat(text, conversationId);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.response || "I'm having trouble right now. Please try again.",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const fallbackMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I understand you're asking about "${userMessage.content}". 

I'm experiencing technical difficulties. Please try again or consult a healthcare professional for medical concerns.`,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const startNewConversation = () => {
    setConversationId(crypto.randomUUID());
    setMessages([getWelcomeMessage()]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleStarterClick = (query: string) => {
    sendMessage(query);
  };

  const showStarters = messages.length === 1 && messages[0].id === 'welcome';

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Clinical AI Assistant</h1>
            <p className="text-muted-foreground text-sm">
              Ask about your X-ray results, symptoms, or medical terms
            </p>
          </div>

          {/* Compact info buttons with tooltips */}
          <div className="flex items-center gap-2">
            {/* Context indicator */}
            {medicalContext.latestXRay && (
              <div className="group relative">
                <button className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <FileImage className="h-4 w-4 text-primary" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-72 p-3 rounded-lg bg-popover border border-border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Connected:</strong> Your latest X-ray analysis ({medicalContext.latestXRay.prediction.replace('_', ' ')}, {medicalContext.latestXRay.confidence}% confidence) is available to the assistant.
                  </p>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="group relative">
              <button className="h-9 w-9 rounded-lg bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors">
                <Shield className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-72 p-3 rounded-lg bg-popover border border-border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Educational Only:</strong> Always consult healthcare professionals for medical decisions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card className="card-simple border-2 shadow-sm h-[calc(100vh-180px)] min-h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-medium">Clinical AI Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">
                    {contextLoaded ? 'Connected to your data' : 'Loading...'}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={startNewConversation}>
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0',
                      message.role === 'user' ? 'bg-muted' : 'bg-primary'
                    )}
                  >
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-3',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted rounded-bl-sm'
                    )}
                  >
                    {message.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Starter Prompts */}
              {showStarters && (
                <div className="mt-6">
                  <p className="text-xs text-muted-foreground mb-3 text-center">Quick questions about your data:</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {STARTER_PROMPTS.map((prompt, index) => (
                      <button
                        key={index}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-muted hover:bg-muted/80 text-sm transition-colors border border-border/50"
                        onClick={() => handleStarterClick(prompt.query)}
                      >
                        <prompt.icon className="h-4 w-4 text-primary" />
                        {prompt.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground mr-2">MediVision AI is thinking</span>
                      <span className="flex gap-1 h-1.5 items-center">
                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Ask about your X-ray results, symptoms, or medical terms..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="h-11"
              />
              <Button onClick={() => sendMessage()} disabled={!input.trim() || loading} size="lg">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
