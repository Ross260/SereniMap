"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Home,
  Route,
  ShieldCheck,
  User,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Liens de navigation principaux de l'application.
 * Chaque lien correspond à une page décrite dans le cahier des charges.
 */
const navLinks = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/carte", label: "Carte", icon: MapPin },
  { href: "/itineraire", label: "Itineraire", icon: Route },
  { href: "/sources", label: "Sources", icon: ShieldCheck },
  { href: "/profil", label: "Profil", icon: User },
];

/**
 * Composant Navbar
 * Barre de navigation principale responsive.
 * Utilise les couleurs du thème (bleu foncé pour le fond, blanc pour le texte).
 * Le lien actif est mis en évidence avec la couleur accent (orange).
 */
export function Navbar() {
  const pathname = usePathname();
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[hsl(213,35%,18%)] text-[hsl(0,0%,100%)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo et nom de l'application */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <MapPin className="h-5 w-5 text-accent-foreground" />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight">
            SereniMap
          </span>
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {navLinks.map((link) => {
            const estActif = pathname === link.href;
            const Icone = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  estActif
                    ? "bg-accent text-accent-foreground"
                    : "text-[hsl(210,30%,80%)] hover:bg-[hsl(213,30%,25%)] hover:text-[hsl(0,0%,100%)]"
                )}
              >
                <Icone className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bouton menu mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="text-[hsl(0,0%,100%)] hover:bg-[hsl(213,30%,25%)] md:hidden"
          onClick={() => setMenuOuvert(!menuOuvert)}
          aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {menuOuvert ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Menu mobile déroulant */}
      {menuOuvert && (
        <nav
          className="border-t border-[hsl(213,25%,25%)] px-4 pb-4 md:hidden"
          aria-label="Navigation mobile"
        >
          {navLinks.map((link) => {
            const estActif = pathname === link.href;
            const Icone = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOuvert(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  estActif
                    ? "bg-accent text-accent-foreground"
                    : "text-[hsl(210,30%,80%)] hover:bg-[hsl(213,30%,25%)] hover:text-[hsl(0,0%,100%)]"
                )}
              >
                <Icone className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
