import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AuthCTAProps {
  variant: "primary" | "secondary";
  text: string;
  href: string;
}

export function AuthCTA({ variant, text, href }: AuthCTAProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Button
      asChild
      variant={variant === "primary" ? "default" : "outline"}
      size="lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={`
        transition-all duration-300 ease-in-out
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        ${isHovered ? "transform scale-105 shadow-lg" : ""}
      `}
    >
      <a href={href} aria-label={text}>
        {text}
      </a>
    </Button>
  );
}
