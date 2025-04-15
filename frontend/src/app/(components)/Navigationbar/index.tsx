"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
} from "@heroui/react";
import { usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

const menuItems = [
  { path: "/", label: "Home" },
  { path: "/storage-assistant", label: "Storage Assistant" },
  { path: "/eco-grocery", label: "Eco Grocery" },
  { path: "/food-network", label: "Food Network" },
  { path: "/second-life", label: "Second Life" },
];

const Navigationbar = () => {
  const pathname = usePathname();
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const [isScrolled, setIsScrolled] = useState(false);
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero-section');
      if (heroSection && isHomePage) {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        setIsScrolled(heroBottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const setContainerRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;

      const activeItem = node.querySelector(`[data-active="true"]`);
      if (activeItem) {
        const rect = (activeItem as HTMLElement).getBoundingClientRect();
        const containerRect = node.getBoundingClientRect();

        setUnderlineStyle({
          left: rect.left - containerRect.left,
          width: rect.width,
        });
      }
    },
    [pathname]
  );

  return (
    <Navbar 
      isBordered={!isHomePage || isScrolled}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        !isHomePage || isScrolled
          ? 'bg-background' 
          : 'bg-white/50'
      }`}
    >
      <NavbarBrand>
        <p className={`font-bold text-inherit text-xl ${
          !isHomePage || isScrolled ? 'text-primary' : 'text-primary'
        }`}>
          <img 
            src="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/logo.png" 
            alt="Best Before Logo" 
            className="h-24 w-52"
          />
        </p>
      </NavbarBrand>

      <div
        className="sm:flex justify-end relative"
        ref={setContainerRef}
      >
        <NavbarContent className={`gap-10 w-full transition-opacity duration-300`}>
          {/* Animated underline */}
          <span
            className="absolute bottom-0 h-[3px] bg-primary transition-all duration-300 rounded"
            style={{
              left: underlineStyle.left,
              width: underlineStyle.width,
              bottom: "-20px",
            }}
          />

          {menuItems.map((item) => (
            <NavbarItem
              key={item.path}
              data-active={pathname === item.path}
              className="relative"
            >
              <Link
                href={item.path}
                className={`transition-colors ${
                  pathname === item.path
                    ? `${!isHomePage || isScrolled ? 'text-primary' : 'text-primary'} pointer-events-none cursor-default`
                    : !isHomePage || isScrolled ? 'text-black' : 'text-black/80 hover:text-black'
                }`}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>
      </div>

      <NavbarMenuToggle className={`sm:hidden ${!isHomePage || isScrolled ? 'opacity-100' : 'opacity-0'}`} />

      <NavbarMenu className={!isHomePage || isScrolled ? 'bg-background' : 'bg-background/80 backdrop-blur-md'}>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              href={item.path}
              size="lg"
              color={!isHomePage || isScrolled ? "foreground" : "primary"}
              className={`w-full px-4 py-2 rounded-lg transition-colors
                ${
                  pathname === item.path
                    ? "text-primary pointer-events-none cursor-default"
                    : "hover:bg-default-200"
                }`}
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
};

export default Navigationbar;
