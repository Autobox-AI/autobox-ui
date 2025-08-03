"use client";

import { Construction, Hammer, HardHat, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface UnderConstructionProps {
  pageName?: string;
  description?: string;
}

export function UnderConstruction({ 
  pageName, 
  description = "We're working hard to bring you this feature. Check back soon!"
}: UnderConstructionProps) {
  const pathname = usePathname();
  const defaultPageName = pathname.split('/').pop()?.replace(/-/g, ' ');
  const displayName = pageName || defaultPageName || 'This Page';
  const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
      <div className="relative">
        <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center">
          <Construction className="h-12 w-12 text-zinc-400 animate-pulse" />
        </div>
        <Hammer className="h-6 w-6 text-zinc-500 absolute -top-1 -right-1 animate-bounce" />
        <HardHat className="h-6 w-6 text-zinc-500 absolute -bottom-1 -left-1" />
        <Wrench className="h-5 w-5 text-zinc-600 absolute bottom-0 right-0 rotate-45" />
      </div>
      
      <h1 className="mt-8 text-4xl font-bold text-white">
        {formattedName} Under Construction
      </h1>
      
      <p className="mt-4 max-w-md text-center text-zinc-400">
        {description}
      </p>
      
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href="/">
            Go Home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/projects">
            View Projects
          </Link>
        </Button>
      </div>
      
      <div className="mt-12 text-sm text-zinc-500">
        🚧 Our team is building something amazing here 🚧
      </div>
    </div>
  );
}