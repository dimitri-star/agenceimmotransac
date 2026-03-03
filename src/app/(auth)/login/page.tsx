"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <p className="text-muted-foreground">Redirection...</p>
    </div>
  );
}
