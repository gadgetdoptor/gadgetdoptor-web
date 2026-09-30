import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
  FaTiktok,
} from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import type { SiteSettings } from "@/lib/types";

export function Footer({ settings }: { settings: SiteSettings }) {
  const whatsappLink = `https://wa.me/88${settings.contactWhatsapp.replace(/\D/g, "")}`;

  return (
    <footer className="bg-black text-zinc-300 pt-16 pb-8 border-t border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand section */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <Image
                src={settings.siteLogo}
                alt={settings.siteName}
                width={180}
                height={180}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed text-zinc-400 max-w-xs">
              {settings.siteTagline}
            </p>
            <div className="flex items-center gap-4">
              {settings.socialFacebook && (
                <Link
                  href={settings.socialFacebook}
                  target="_blank"
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-[#1877F2] transition-all group"
                >
                  <FaFacebookF className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                </Link>
              )}
              {settings.socialInstagram && (
                <Link
                  href={settings.socialInstagram}
                  target="_blank"
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-[#E4405F] transition-all group"
                >
                  <FaInstagram className="h-5 w-5 text-zinc-400 group-hover:text-white" />
                </Link>
              )}
              {settings.socialYoutube && (
                <Link
                  href={settings.socialYoutube}
                  target="_blank"
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-[#FF0000] transition-all group"
                >
                  <FaYoutube className="h-5 w-5 text-zinc-400 group-hover:text-white" />
                </Link>
              )}
              {settings.socialTiktok && (
                <Link
                  href={settings.socialTiktok}
                  target="_blank"
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-black transition-all group"
                >
                  <FaTiktok className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                </Link>
              )}
              {settings.contactWhatsapp && (
                <Link
                  href={whatsappLink}
                  target="_blank"
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-[#25D366] transition-all group"
                >
                  <FaWhatsapp className="h-5 w-5 text-zinc-400 group-hover:text-white" />
                </Link>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/product"
                  className="hover:text-orange-500 transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/brand"
                  className="hover:text-orange-500 transition-colors"
                >
                  Shop by Brands
                </Link>
              </li>
              <li>
                <Link
                  href="/category"
                  className="hover:text-orange-500 transition-colors"
                >
                  Shop by Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-orange-500 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-orange-500 transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs">
              Contact Info
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-orange-500 shrink-0" />
                <span className="text-zinc-400">{settings.contactAddress}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-orange-500 shrink-0" />
                <a
                  href={`tel:${settings.contactPhone}`}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {settings.contactPhone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-orange-500 shrink-0" />
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {settings.contactEmail}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-6">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs">
              Legal
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-orange-500 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-orange-500 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/refund-policy"
                  className="hover:text-orange-500 transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-zinc-800 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>
            &copy; {new Date().getFullYear()} {settings.siteName.toUpperCase()}.
            All rights reserved.
          </p>
          <p>
            Powered by{" "}
            <a
              href="https://sofolit.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Sofol IT
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
