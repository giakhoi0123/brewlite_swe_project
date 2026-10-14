import { AuthPage } from "@/components/auth/auth-page";

export default async function Home({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  return <AuthPage reason={reason} />;
}
