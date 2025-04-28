import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  const menuItems = [
    {name: "Storage Assistant", link: "/storage-assistant", section: [
        {name: "Food Product Scanner"},
        {name: "Storage Management"},
        {name: "Expiration Reminder"},
    ]},
    {name: "Eco Grocery List", link: "/eco-grocery", section: [
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

  return (
    <footer className="bg-darkgreen text-white py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <div className='px-40 relative h-24 w-52'>
              <Image 
                src="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/logo-white.png" 
                alt="Best Before Logo"
                fill
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 768px) 100vw, 208px"
              />
            </div>
            <div className="mb-6 px-20 md:mb-0 ">
              <p className="max-w-md">
                Together for a zero-waste kitchen - save food, money, and our planet with BestBefore
              </p>
            </div>
          </div>
            <div className="grid grid-cols-2 gap-8 text-sm px-20 ">
              {menuItems.map((item) => (
                <Link href={item.link}>
                  <div key={item.name}>
                    <p className="underline text-md font-bold mb-4 hover:text-[#A5D6B7] transition-colors duration-300 cursor-pointer">
                      {item.name}
                    </p>
                    <ul className="space-y-2 text-gray-300 pl-2">
                    {item.section.map((section) => (
                      <div key={section.name}>
                          <li>
                            •  {section.name}
                          </li>
                      </div>
                    ))}
                    </ul>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        <div className="border-t border-gray-300/30 pt-12 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-300 px-20">
                © {new Date().getFullYear()} BestBefore. All rights reserved.
            </p>
        </div>
        </div>
    </footer>
  );
};

export default Footer;