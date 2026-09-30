"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useSiteSettings } from "@/context/settings-context";

export function TopBar() {
    const settings = useSiteSettings();
    const whatsappLink = `https://wa.me/88${settings.contactWhatsapp.replace(/\D/g, '')}`;

    return (
        // hide on sm
        <div className="hidden sm:block w-full bg-transparent text-muted-foreground text-[11px] font-medium tracking-wider uppercase border-b border-border">
            <div className="container flex items-center justify-between h-9 px-4">
                {/* Left Side: Quick Order & WhatsApp */}
                <div className="flex items-center gap-6">
                    <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer">
                        <Phone className="h-3 w-3" />
                        <span>Quick Order: {settings.contactPhone}</span>
                    </a>
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                        <FaWhatsapp className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                    </a>
                </div>

                {/* Right Side: Track Order */}
                <div className="flex items-center gap-4">
                    <Link href="/track-order" className="hover:text-foreground transition-colors">
                        Track Order
                    </Link>
                    <div className="w-px h-4 bg-border hidden sm:block"></div>
                    <Link href="/contact" className="hover:text-foreground transition-colors hidden sm:block">
                        Contact Us
                    </Link>
                </div>
            </div>
        </div>
    );
}
