'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '../../components/layout/Sidebar';
import {
  Send,
  Bot,
  User,
  BookOpen,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  MessageSquare,
  Mic,
  Copy,
  Check,
  Trash2
} from 'lucide-react';
import { api, authStorage } from '../../lib/api';
import { ChatMessage, ConversationSummary } from '../../types';
import { FormattedMessage } from '../../components/chat/FormattedMessage';
import { ScrollReveal } from '../../components/animations/ScrollReveal';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: 'Hello! I am **PlacePrep AI**, your campus placement preparation assistant. Grounded in curated placement resources, I can help you solve DSA problems, understand system architecture, review DBMS queries, and master core OOP concepts.\n\nWhat topic would you like to prepare today?',
      timestamp: 'Just now',
      sources: ['Placement Preparation Guide', 'DSA Fundamentals', 'Interview Handbook']
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const isLoggedIn = !!authStorage.getToken();

  const suggestedQuestions = [
    'What DSA topics should I prepare for campus placements?',
    'Explain the difference between an Array and a Linked List.',
    'Explain ACID properties in DBMS with real examples.',
    'What is the difference between Method Overloading and Overriding?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load the conversation list once, on mount, only if logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConversations = async () => {
    setConversationsLoading(true);
    try {
      const res = await api.getConversations();
      setConversations(res.conversations);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setConversationsLoading(false);
    }
  };

  const openConversation = async (id: string) => {
    if (id === activeConversationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getConversation(id);
      const loaded: ChatMessage[] = res.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.createdAt).toLocaleString(),
        sources: m.sources,
      }));
      setMessages(loaded);
      setActiveConversationId(id);
    } catch (err: any) {
      setError(err.message || 'Failed to load that conversation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMessageId = 'user-' + Date.now();
    const newUserMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: textToSend.trim(),
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome-1')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await api.sendChatMessage(textToSend.trim(), history, activeConversationId || undefined);

      const aiMsg: ChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: res.answer,
        timestamp: 'Just now',
        sources: res.sources
      };

      setMessages(prev => [...prev, aiMsg]);

      // First message of a new conversation — backend just created one, capture its id
      // and refresh the sidebar list so the new thread appears.
      if (res.conversationId && res.conversationId !== activeConversationId) {
        setActiveConversationId(res.conversationId);
        if (isLoggedIn) loadConversations();
      } else if (isLoggedIn && activeConversationId) {
        // Existing conversation just got a new message — bump it to top of the list
        loadConversations();
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Something went wrong while connecting to the AI service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRetry = () => {
    if (messages.length === 0) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: 'New chat session started. Ask any placement-related doubt!',
        timestamp: 'Just now',
        sources: ['Placement Preparation Guide', 'Interview Handbook']
      }
    ]);
    setActiveConversationId(null);
    setError(null);
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (id === activeConversationId) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  return (
    <div className="flex-1 flex bg-[#07111F] min-h-0">
      <Sidebar />

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Left Sub-sidebar: Conversation History */}
        <div className="w-full md:w-64 shrink-0 bg-[#060608]/95 border-r border-white/[0.07] p-4 hidden lg:flex flex-col justify-between">
          <div className="space-y-4 flex-1 min-h-0 flex flex-col">
            <button
              onClick={handleNewChat}
              className="w-full py-2.5 px-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-black" />
              <span>New Conversation</span>
            </button>

            <div className="flex-1 min-h-0 overflow-y-auto">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2 px-1">
                {isLoggedIn ? 'Your Conversations' : 'Recent Queries'}
              </p>

              {!isLoggedIn ? (
                <p className="text-[11px] text-neutral-500 px-1 py-2 italic leading-relaxed">
                  Sign in to save and revisit your past conversations.
                </p>
              ) : conversationsLoading ? (
                <p className="text-[11px] text-neutral-500 px-1 py-2 italic leading-relaxed">
                  Loading conversations…
                </p>
              ) : conversations.length === 0 ? (
                <p className="text-[11px] text-neutral-500 px-1 py-2 italic leading-relaxed">
                  No conversations yet. Ask a question to begin!
                </p>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => openConversation(conv.id)}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors group flex items-start gap-2 ${
                        conv.id === activeConversationId
                          ? 'bg-white/[0.08] text-white'
                          : 'hover:bg-white/[0.05] text-neutral-300 hover:text-white'
                      }`}
                    >
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                        conv.id === activeConversationId ? 'text-purple-400' : 'text-neutral-500 group-hover:text-purple-400'
                      }`} />
                      <div className="flex-1 truncate">
                        <p className="truncate font-medium">{conv.title}</p>
                      </div>
                      <span
                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                        className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-opacity shrink-0"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RAG Information Pill */}
          <div className="p-3 bg-[#0B0B0F] border border-white/[0.08] rounded-xl text-xs space-y-1 text-neutral-400 mt-4">
            <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Knowledge Grounding</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Curated documents from Azure AI Search &amp; Placement Handbook index.
            </p>
          </div>
        </div>

        {/* Center/Main Chat Area */}
        <div className="flex-1 flex flex-col h-full min-h-0 bg-[#07111F] relative">
          {/* Header */}
          <ScrollReveal className="h-16 border-b border-white/[0.07] px-6 flex items-center justify-between bg-[#060608]/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  PlacePrep AI
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Online
                  </span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Placement Preparation Assistant &bull; Grounded in Campus Resources
                </p>
              </div>
            </div>

            <button
              onClick={handleNewChat}
              className="text-xs text-neutral-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </ScrollReveal>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 min-h-0">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 18, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex gap-3.5 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                      isUser
                        ? 'bg-white text-black shadow-sm'
                        : 'bg-purple-500/10 border border-purple-500/30 text-purple-400'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-2 max-w-[85%] sm:max-w-[78%]">
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-white/[0.09] border border-white/10 text-white rounded-tr-none shadow-sm'
                          : 'bg-[#0D0D12] border border-white/[0.08] text-neutral-200 rounded-tl-none shadow-sm'
                      }`}
                    >
                      {isUser ? (
                        <div className="whitespace-pre-line text-sm">
                          {msg.content}
                        </div>
                      ) : (
                        <FormattedMessage content={msg.content} />
                      )}

                      {/* Copy Action Button */}
                      {!isUser && (
                        <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
                          <span className="text-[11px] text-neutral-500">AI Generated Guidance</span>
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="flex items-center gap-1 hover:text-neutral-200 transition-colors"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[10px] text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="text-[10px]">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Grounded Sources Display */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-[#0B0B0F] border border-white/[0.08] rounded-xl p-3 text-xs space-y-1.5"
                      >
                        <div className="flex items-center gap-1.5 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                          <BookOpen className="w-3 h-3 text-purple-400" />
                          <span>Sources Grounded</span>
                        </div>
                        <ul className="flex flex-wrap gap-1.5">
                          {msg.sources.map((src, sIdx) => (
                            <li
                              key={sIdx}
                              className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-purple-300 font-mono text-[11px]"
                            >
                              &bull; {src}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3 max-w-xl mr-auto">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-[#0D0D12] border border-white/[0.08] rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                  <span className="text-xs text-neutral-400">PlacePrep AI is thinking</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            {/* Error Message with Retry */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl max-w-xl flex items-start justify-between gap-3 text-sm text-red-300">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={handleRetry}
                  className="px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold shrink-0 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          {messages.length <= 2 && (
            <div className="px-6 py-2 flex flex-wrap gap-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="text-xs px-3 py-1.5 rounded-full bg-[#0E0E14] hover:bg-white/[0.06] border border-white/10 hover:border-purple-500/40 text-neutral-300 hover:text-white transition-all shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-4 sm:p-6 border-t border-white/[0.07] bg-[#060608]/90 backdrop-blur-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 bg-[#0E0E14] border border-white/10 rounded-xl p-2 focus-within:border-purple-500/60 transition-colors shadow-inner"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask PlacePrep anything about DSA, DBMS, OOP, or system design..."
                disabled={isLoading}
                className="flex-1 bg-transparent px-3 py-1.5 text-sm text-white placeholder-neutral-500 focus:outline-none disabled:opacity-50"
              />

              {/* Speech Microphone Enhancement Icon */}
              <button
                type="button"
                className="p-2 rounded-lg text-neutral-400 hover:text-purple-400 hover:bg-white/5 transition-colors"
                title="Voice input (Powered by Azure Speech STT)"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="p-2.5 rounded-lg bg-white hover:bg-neutral-200 disabled:opacity-30 text-black font-semibold shadow-sm transition-all"
                title="Send message"
              >
                <Send className="w-4 h-4 text-black" />
              </button>
            </form>
            <p className="text-[11px] text-center text-neutral-500 mt-2">
              PlacePrep AI is grounded in placement curriculum. All responses are AI-generated practice guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}