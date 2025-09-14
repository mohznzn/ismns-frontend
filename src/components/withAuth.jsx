// src/components/withAuth.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function withAuth(Page) {
  return function ProtectedPage(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) router.replace("/login");
    }, [loading, user, router]);

    if (loading || !user) {
      return (
        <div className="min-h-[40vh] flex items-center justify-center text-gray-500">
          Checking access…
        </div>
      );
    }
    return <Page {...props} />;
  };
}
