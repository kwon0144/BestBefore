import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const menuItems = [
    {name: "Storage Assistant", link: "/storage-assistant", section: [
        {name: "Food Product Scanner"},
        {name: "Storage Management"},
        {name: "Expiration Reminder"},
    ]},
    {name: "Food Network", link: "/food-network", section: [
        {name: "Food Bank Network"},
        {name: "Green Waste Bin Network"},
    ]}
  ];

  return (
    <footer className="bg-darkgreen text-white py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-6 md:mb-0 ">
            <div className='px-16'>
              <img 
                src="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/logo.png" 
                alt="Best Before Logo" 
                className="h-24 w-52"
              />
            </div>
            <div className="mb-6 px-20 md:mb-0 ">
              <p className="mt-4 max-w-md">
                Together for a zero-waste kitchen — save food, money, and our planet with BestBefore
              </p>
            </div>
          </div>
            <div className="grid grid-cols-2 gap-8 text-sm px-20 ">
              {menuItems.map((item) => (
                <div key={item.name}>
                  <Link href={item.link}>
                    <p className="underline text-md font-bold mb-4 hover:text-[#A5D6B7] transition-colors duration-300 cursor-pointer">
                      {item.name}
                    </p>
                  </Link>
                  <ul className="space-y-2">
                  {item.section.map((section) => (
                    <div key={section.name}>
                        <li>
                            {section.name}
                        </li>
                    </div>
                  ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        <div className="border-t border-[#A5D6B7]/30 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-[#A5D6B7] px-20">
                © {new Date().getFullYear()} BestBefore. All rights reserved.
            </p>
        </div>
        </div>
    </footer>
  );
};

export default Footer;