"use client";

import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { isClerkEnabledClient } from "@/lib/clerk-config";

function AccountMenuPlaceholder() {
  return (
    <div
      className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-xs font-bold text-white"
      aria-hidden
    />
  );
}

export function AccountMenu() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isClerkEnabledClient()) {
    return (
      <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-xs font-bold text-white">
        D
      </div>
    );
  }

  // Clerk UserButton renders different markup on server vs client — mount after hydration.
  if (!mounted) {
    return <AccountMenuPlaceholder />;
  }

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "w-8 h-8",
        },
      }}
    />
  );
}
