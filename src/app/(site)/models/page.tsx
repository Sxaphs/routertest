import type { Metadata } from "next";
import { ModelsBrowser } from "@/components/models-browser";

export const metadata: Metadata = {
  title: "Models",
  description: "Browse every model on the platform: pricing, context length, and capabilities.",
};

export default function ModelsPage() {
  return <ModelsBrowser />;
}
