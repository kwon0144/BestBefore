"use client";

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Image from 'next/image';
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from 'next/link';
import { motion } from 'framer-motion';

const menuItems = [
  { path: "/", label: "Home" },
  { path: "/storage-assistant", label: "Storage Assistant" },
  { path: "/eco-grocery", label: "Eco Grocery" },
  { path: "/food-network", label: "Food Network" },
  { path: "/second-life", label: "Second Life" },
];

const Navigationbar = () => {
  const pathname = usePathname();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
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

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <AppBar 
        position="fixed" 
        sx={{ 
          backgroundColor: !isHomePage || isScrolled ? 'rgba(255, 255, 255)' : 'rgba(255, 255, 255, 0.5)',
          backdropFilter: !isHomePage || isScrolled ? 'none' : 'blur(8px)',
          boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
        }}
      >
        <Container 
          maxWidth="lg" 
          sx={{ 
            maxWidth: '80rem',
            margin: '0 auto',
            padding: '0 1rem'
          }}
        >
          <Toolbar disableGutters>
            {/* Tablet and Desktop View */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}>
              <div className="relative h-16 w-32">
                <Image 
                  src="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/logo.png" 
                  alt="Best Before Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                sx={{ color: !isHomePage || isScrolled ? 'text.primary' : 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                  '& .MuiPaper-root': {
                    backgroundColor: !isHomePage || isScrolled ? 'background.paper' : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                  }
                }}
              >
                {menuItems.map((item) => (
                  <MenuItem 
                    key={item.path} 
                    onClick={handleCloseNavMenu}
                    component={Link}
                    href={item.path}
                    selected={pathname === item.path}
                  >
                    <Typography 
                      textAlign="center"
                      sx={{
                        color: pathname === item.path ? 'primary.dark' : 'grey.700',
                        fontWeight: pathname === item.path ? 'semibold' : 'normal',
                      }}
                    >
                      {item.label}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            
            {/* Desktop View */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1 }}>
              <div className="relative h-16 w-32">
                <Image 
                  src="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/logo.png" 
                  alt="Best Before Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="(max-width: 768px) 100vw, 128px"
                />
              </div>
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end', gap: 4 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  href={item.path}
                  onClick={handleCloseNavMenu}
                  sx={{
                    my: 2,
                    color: pathname === item.path 
                      ? 'primary.dark' 
                      : (!isHomePage || isScrolled ? 'grey.800' : 'grey.800'),
                    display: 'block',
                    position: 'relative',
                    fontWeight: pathname === item.path ? 'bold' : 'normal',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-16px',
                      left: 0,
                      width: pathname === item.path ? '100%' : '0%',
                      height: '3px',
                      backgroundColor: 'primary.dark',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease',
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </motion.div>
  );
};

export default Navigationbar;
