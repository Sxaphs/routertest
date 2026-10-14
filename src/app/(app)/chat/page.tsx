import type { Metadata } from "next";
import { Suspense } from "react";
import { ChatPlayground } from "@/components/chat-playground";

export const metadata: Metadata = {
  title: "Chat",
  description: "Playground: chat with any model side by side.",
};

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPlayground />
    </Suspense>
  );
}
