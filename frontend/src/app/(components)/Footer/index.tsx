/**
 * Footer Component
 * 
 * This component provides a responsive footer with:
 * - Logo and tagline
 * - Navigation links with subsections
 * - Copyright information
 * - Responsive grid layout
 * - Hover effects and transitions
 */
import React from 'react';
import Image from 'next/image';
import NoScrollLink from '../NoScrollLink';

/**
 * Array of footer menu items with their subsections
 * Each item contains:
 * - name: Display name of the section
 * - link: Navigation path
 * - section: Array of subsection items
 */
const menuItems = [
  {name: "Storage Assistant", link: "/storage-assistant", section: [
      {name: "Food Product Scanner"},
      {name: "Storage Management"},
      {name: "Expiration Reminder"},
  ]},
  {name: "Eco Grocery", link: "/eco-grocery", section: [
      {name: "Choices of Meals"},
      {name: "Food Inventory"},
      {name: "Smart Grocery List"},
  ]},
  {name: "Second Life", link: "/second-life", section: [
    {name: "Search for DIY ideas"},
    {name: "DIY procedures"},
  ]},
  {name: "Food Network", link: "/food-network", section: [
      {name: "Food Bank Network"},
      {name: "Green Waste Bin Network"},
  ]},
];

/**
 * Main footer component that displays navigation links and copyright information
 * 
 * @returns {JSX.Element} Rendered footer with navigation and branding
 */
const Footer = () => {
  return (
    <footer className="bg-darkgreen text-white py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col justify-center mb-10 md:flex-row md:justify-between">
          <div className='flex flex-col items-center md:items-start md:justify-start md:pl-16'>
            <NoScrollLink href="/">
              <Image 
                src="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/logo-white.png" 
                alt="Best Before Logo"
                width={208}
                height={208}
                className="cursor-pointer"
              />
            </NoScrollLink>
            <div className="max-w-md mb-10 pl-3 md:mb-0 text-center md:text-left">
              <p>
                Together for a zero-waste kitchen - save food, money, and our planet with BestBefore
              </p>
            </div>
          </div>
            <div className="grid grid-cols-2 gap-8 text-sm px-20 ">
              {menuItems.map((item) => (
                <NoScrollLink href={item.link} key={item.name}>
                  <div>
                    <p className="underline text-md font-bold mb-4 hover:text-[#A5D6B7] transition-colors duration-300 cursor-pointer">
                      {item.name}
                    </p>
                    <ul className="space-y-2 text-gray-300 pl-2 hidden xl:block">
                    {item.section.map((section) => (
                      <div key={section.name}>
                          <li>
                            •  {section.name}
                          </li>
                      </div>
                    ))}
                    </ul>
                  </div>
                </NoScrollLink>
              ))}
            </div>
          </div>
        <div className="border-t border-gray-300/30 pt-12 flex flex-col px-20">
            {/* Disclaimer */}
            <div className="text-sm text-gray-300 mb-8">
              <p>The information provided by BestBefore is intended as general guidance to support better food management. While we strive to offer helpful and accurate support, users are encouraged to use their own judgment and consult official sources when making decisions.</p>
            </div>
            <p className="text-sm text-gray-300">
                © {new Date().getFullYear()} BestBefore. All rights reserved.
            </p>
        </div>
        </div>
    </footer>
  );
};

export default Footer;