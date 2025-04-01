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
import { useCallback, useEffect, useState } from "react";

const menuItems = [
  { path: "/", label: "Home" },
  { path: "/storage-assistant", label: "Storage Assistant" },
  { path: "/food-network", label: "Food Network" },
];

const Navigationbar = () => {
  const pathname = usePathname();
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

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
    <Navbar isBordered>
      <NavbarBrand>
        <p className="font-bold text-inherit text-xl text-primary">
          BestBefore
        </p>
      </NavbarBrand>

      <div
        className="hidden sm:flex justify-end relative"
        ref={setContainerRef}
      >
        <NavbarContent className="gap-10 w-full">
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
                    ? "text-primary pointer-events-none cursor-default"
                    : "text-foreground"
                }`}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>
      </div>

      <NavbarMenuToggle className="sm:hidden" />

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              href={item.path}
              size="lg"
              color="foreground"
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
