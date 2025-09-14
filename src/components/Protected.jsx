"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/api";

export default function Protected({ children }) {
  const [ok, setOk] = useState(false);
  const [checked, setChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    auth.me()
      .then((r) => {
        if (!mounted) return;
        if (r?.user) { setOk(true); }
        else { router.replace(`/login?next=${encodeURIComponent(pathname)}`); }
      })
      .catch(() => router.replace(`/login?next=${encodeURIComponent(pathname)}`))
      .finally(() => { if (mounted) setChecked(true); });
    return () => { mounted = false; };
  }, [pathname, router]);

  if (!checked) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-500">
        Checking session…
      </div>
    );
  }
  if (!ok) return null;
  return <>{children}</>;
}
