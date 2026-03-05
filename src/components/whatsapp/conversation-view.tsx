"use client";

import { useState, useRef, useEffect } from "react";
import { useWhatsAppStore } from "@/lib/whatsapp-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Bot, Calendar, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WhatsAppMessage } from "@/types";

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDay(ts: string): string {
  return new Date(ts).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function MessageBubble({ message }: { message: WhatsAppMessage }) {
  const isOutbound = message.direction === "OUTBOUND";

  if (message.type === "CALENDLY_LINK") {
    return (
      <div className={cn("flex", isOutbound ? "justify-end" : "justify-start")}>
        <div className={cn(
          "max-w-[80%] rounded-xl border p-3",
          isOutbound ? "bg-green-600 text-white border-green-700" : "bg-white border-gray-200"
        )}>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-semibold">Lien Calendly</span>
          </div>
          <p className="text-sm">{message.content}</p>
          {message.metadata?.url && (
            <div className={cn(
              "mt-2 rounded-lg p-2 text-xs",
              isOutbound ? "bg-green-700/50" : "bg-blue-50"
            )}>
              <span className="underline">{message.metadata.url}</span>
            </div>
          )}
          <div className="flex items-center gap-1 mt-1">
            {message.isAutomatic && <Bot className="h-3 w-3 opacity-60" />}
            <span className="text-[10px] opacity-70">{formatTimestamp(message.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  }

  if (message.type === "PROPERTY_LISTING") {
    return (
      <div className={cn("flex", isOutbound ? "justify-end" : "justify-start")}>
        <div className={cn(
          "max-w-[80%] rounded-xl border p-3",
          isOutbound ? "bg-green-600 text-white border-green-700" : "bg-white border-gray-200"
        )}>
          <div className="flex items-center gap-2 mb-1">
            <Home className="h-4 w-4" />
            <span className="text-xs font-semibold">Fiche bien</span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <div className="flex items-center gap-1 mt-1">
            {message.isAutomatic && <Bot className="h-3 w-3 opacity-60" />}
            <span className="text-[10px] opacity-70">{formatTimestamp(message.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex", isOutbound ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[80%] rounded-xl px-3 py-2",
        isOutbound ? "bg-green-600 text-white" : "bg-white border border-gray-200"
      )}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <div className={cn(
          "flex items-center gap-1 mt-0.5",
          isOutbound ? "justify-end" : "justify-start"
        )}>
          {message.isAutomatic && (
            <span className={cn(
              "text-[10px] font-medium px-1 rounded",
              isOutbound ? "bg-green-700/50" : "bg-blue-100 text-blue-700"
            )}>
              Auto
            </span>
          )}
          <span className={cn("text-[10px]", isOutbound ? "text-green-100" : "text-muted-foreground")}>
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ConversationView({ leadId }: { leadId: string }) {
  const { getConversation, addMessage, simulateReply } = useWhatsAppStore();
  const messages = getConversation(leadId);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    addMessage(leadId, input.trim());
    simulateReply(leadId);
    setInput("");
  };

  // Group messages by day
  const groupedMessages: { day: string; messages: WhatsAppMessage[] }[] = [];
  let currentDay = "";
  for (const msg of messages) {
    const day = formatDay(msg.timestamp);
    if (day !== currentDay) {
      currentDay = day;
      groupedMessages.push({ day, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  }

  return (
    <Card className="flex flex-col overflow-hidden" style={{ height: "520px" }}>
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-green-600" />
          Conversation WhatsApp
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {messages.length} message{messages.length !== 1 ? "s" : ""}
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto bg-[#e5ddd5] px-3 py-2 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageCircle className="h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm">Aucune conversation WhatsApp.</p>
            </div>
          ) : (
            groupedMessages.map((group) => (
              <div key={group.day}>
                <div className="flex justify-center my-2">
                  <span className="rounded-full bg-white/80 px-3 py-0.5 text-[11px] text-muted-foreground shadow-sm">
                    {group.day}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {group.messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t bg-card px-3 py-2">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Écrire un message..."
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              size="icon"
              className="bg-green-600 hover:bg-green-700 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
