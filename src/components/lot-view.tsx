"use client";

import { Drawer } from "vaul";
import { LotCard, LotStatus } from "./lot-card";
import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

interface LotViewProps {
  isEmbed?: boolean;
  lot: {
    number: string;
    price: number | string; // Handle decimal/string from Prisma
    currency: string;
    status: string;
    dimensions: string;
    area: number;
    description?: string | null;
  };
}

export function LotView({ lot, isEmbed = false }: LotViewProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Desktop View OR Embed Mode: Floating/Static Card
  if (!isMobile || isEmbed) {
    return (
      <div className={isEmbed ? "w-full h-full flex items-center justify-center p-2" : "absolute inset-0 pointer-events-none flex items-center justify-center p-4 z-10"}>
        <div className={`pointer-events-auto w-full ${isEmbed ? 'max-w-xs' : 'max-w-md'}`}>
          <LotCard
            number={lot.number}
            price={Number(lot.price)}
            currency={lot.currency}
            status={lot.status as LotStatus}
            dimensions={lot.dimensions}
            area={lot.area}
            description={lot.description || undefined}
          />
        </div>
      </div>
    );
  }

  // Mobile View: Drawer
  return (
    <Drawer.Root shouldScaleBackground open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Trigger asChild>
        <button className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 bg-forest text-cream pl-6 pr-8 py-3 rounded-full shadow-xl font-bold flex items-center gap-3 hover:scale-105 transition-transform active:scale-95">
            <span className="bg-white/20 p-1 rounded-full"><ChevronUp size={20} /></span>
            Ver Lote {lot.number}
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Drawer.Content className="bg-cream flex flex-col rounded-t-[20px] max-h-[90vh] fixed bottom-0 left-0 right-0 z-50 focus:outline-none shadow-2xl">
            <div className="p-4 bg-transparent flex-1 overflow-y-auto">
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
                <LotCard
                    number={lot.number}
                    price={Number(lot.price)}
                    currency={lot.currency}
                    status={lot.status as LotStatus}
                    dimensions={lot.dimensions}
                    area={lot.area}
                    description={lot.description || undefined}
                    onClose={() => setIsOpen(false)}
                />
            </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
