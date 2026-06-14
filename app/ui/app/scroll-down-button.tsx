"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function ScrollDownButton({ scrollToID }: { scrollToID: string }) {
    const handleClick = () => {
        document
            .getElementById(scrollToID)
            ?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div
            onClick={handleClick}
            className="
              absolute
              inset-x-0
              flex justify-center
              bottom-6
              hidden
              sm:flex
              animate-bounce
              cursor-pointer
              z-20
            "
        >
            <div className="text-dark-muted hover:text-white transition-colors flex flex-col items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-widest opacity-50">
                  Explore
                </span>
                <ChevronDownIcon className="w-8 h-8" />
            </div>
        </div>
    );
}