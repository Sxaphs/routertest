import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = { title: "Sign In" };

export default function SignInPage() {
  return <AuthCard mode="sign-in" />;
}
