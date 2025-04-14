import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuildingColumns, faRecycle } from "@fortawesome/free-solid-svg-icons";
import DonationGuideButton from "./DonationGuideButton";
import DisposalGuideButton from "./DisposalGuideButton";

export default function DonationDisposalOptions() {
    return (
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto p-5">
          {/* Foodbank Component */}
          {/* <div className="p-8 flex flex-col bg-white/50 rounded-lg shadow-lg items-center text-center hover:translate-y-[-5px] transition-all duration-300"> */}
          <div className="p-8 flex flex-col items-center text-center hover:translate-y-[-5px] transition-all duration-300">    
            <h2 className="text-2xl font-bold text-green mb-4">Foodbank</h2>
            <div className="mb-6 text-green bg-green-50 p-8 rounded-full">
              <FontAwesomeIcon icon={faBuildingColumns} className="text-7xl" />
            </div>
            <p className="text-black mb-8">
              Share surplus food with those in need through our network of local
              food banks. Help reduce food waste while supporting your
              community.
            </p>
            <DonationGuideButton />
          </div>

          {/* Green Waste Bin Component */}
          {/* <div className="p-8 flex flex-col bg-white/50 rounded-lg shadow-lg items-center text-center hover:translate-y-[-5px] transition-all duration-300"> */}
          <div className="p-8 flex flex-col items-center text-center hover:translate-y-[-5px] transition-all duration-300">    
            <h2 className="text-2xl font-bold text-[#4cbd2c] mb-4">
              Green Waste Bin
            </h2>
            <div className="mb-6 text-[#4cbd2c] bg-green-50 p-8 rounded-full">
              <FontAwesomeIcon icon={faRecycle} className="text-7xl" />
            </div>
            <p className="text-black mb-8">
              Dispose of food waste responsibly to green waste bin.
              Learn how to properly sort and recycle food waste for
              environmental sustainability.
            </p>
            <DisposalGuideButton />
          </div>
        </div>
    )
}