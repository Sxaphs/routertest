import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = { title: "Sign Up" };

export default function SignUpPage() {
  return <AuthCard mode="sign-up" />;
}
