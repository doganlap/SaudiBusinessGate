'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, Send, X, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackChatMessage, trackChatSession } from '@/lib/monitoring/analytics';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIChatbot({ lng = 'en' }: { lng?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isArabic = lng === 'ar';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setSessionStart(new Date());
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: isArabic
          ? 'مرحباً بك في المتجر السعودي! 🇸🇦 كيف يمكنني مساعدتك اليوم؟'
          : 'Welcome to Saudi Store! 🇸🇦 How can I assist you today?',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, isArabic]);

  useEffect(() => {
    return () => {
      // Track session on unmount
      if (sessionStart && messages.length > 1) {
        const duration = new Date().getTime() - sessionStart.getTime();
        trackChatSession(duration, messages.length - 1); // Exclude welcome message
      }
    };
  }, [sessionStart, messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    trackChatMessage('user', input.length);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: `Saudi Store customer support - ${isArabic ? 'Arabic' : 'English'}`,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || (isArabic ? 'عذراً، حدث خطأ' : 'Sorry, an error occurred'),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      trackChatMessage('bot', data.response?.length || 0);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: isArabic
          ? 'عذراً، لا يمكنني الرد الآن. يرجى المحاولة لاحقاً.'
          : 'Sorry, I cannot respond right now. Please try again later.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card
      className={cn(
        'fixed bottom-4 right-4 shadow-2xl z-50 transition-all',
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]',
        isArabic && 'left-4 right-auto'
      )}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <CardHeader className="p-4 border-b bg-primary text-primary-foreground flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 animate-pulse" />
          <CardTitle className="text-base">
            {isArabic ? 'المساعد الذكي 🇸🇦' : 'AI Assistant 🇸🇦'}
          </CardTitle>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="p-4 h-[460px] overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg p-3 text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <CardFooter className="p-4 border-t">
            <div className="flex w-full gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isArabic ? 'اكتب رسالتك...' : 'Type your message...'}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
