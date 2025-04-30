import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faXmark, faRecycle, faTimesCircle, faCheckCircle, faAppleAlt, faBreadSlice, faDrumstickBite, faCheese, faEgg, faCoffee, faFish, faUtensils, faLightbulb, faMugHot, faWineBottle, faWater, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

interface DisposalGuideContentProps {
    onClose: () => void;
}

interface ItemProps {
    icon: IconProp;
    text: string;
    color: string;
}

const Item = ({ icon, text, color }: ItemProps) => (
    <div className={`bg-white border border-[${color}] rounded-lg p-3 flex items-center gap-3`}>
        <FontAwesomeIcon icon={icon} className={`text-[${color}] text-xl`} />
        <span>{text}</span>
    </div>
);

const YesTab = () => (
    <div className="space-y-4">

        <div className="grid grid-cols-2 gap-4">
            <Item icon={faAppleAlt} text="Fruit & vegetable scraps" color="#4CAF50" />
            <Item icon={faBreadSlice} text="Bread, rice & pasta" color="#4CAF50" />
            <Item icon={faDrumstickBite} text="Meat, fish & bones" color="#4CAF50" />
            <Item icon={faCheese} text="Solid dairy products" color="#4CAF50" />
            <Item icon={faEgg} text="Eggshells" color="#4CAF50" />
            <Item icon={faCoffee} text="Coffee grounds & tea leaves" color="#4CAF50" />
            <Item icon={faFish} text="Soft shell seafood" color="#4CAF50" />
            <Item icon={faUtensils} text="Leftover food scraps" color="#4CAF50" />
        </div>

        <div className="flex justify-center">
            <div className="inline-block bg-[#4CAF50] text-white px-4 py-2 rounded-full text-sm">
                <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
                <span>
                    Did you know? Food waste in landfill creates methane, a harmful greenhouse gas!
                </span>
            </div>
        </div>
    </div>
);

const NoTab = () => (
    <div className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
            <Item icon={faMugHot} text="Tea bags" color="#F44336" />
            <Item icon={faCoffee} text="Coffee pods & cups" color="#F44336" />
            <Item icon={faWineBottle} text="Liquids & cooking oil" color="#F44336" />
            <Item icon={faWater} text="Hard seafood shells" color="#F44336" />
        </div>

        <div className="bg-[#FFEBEE] p-4 rounded-lg">
            <p className="text-gray-700 font-medium">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                If your bin contains prohibited items, the entire truckload could end up in landfill!
            </p>
        </div>
    </div>
);

export default function DisposalGuideContent({ onClose }: DisposalGuideContentProps) {
    const [activeTab, setActiveTab] = useState<string>("yes");

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mt-20">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <FontAwesomeIcon icon={faRecycle} className="text-[#4CAF50] text-2xl" />
                        <h2 className="text-2xl font-bold text-gray-800">
                            Green Waste Bin Guide
                        </h2>
                    </div>

                    <div className="mb-6">
                        <img
                            src="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/disposalguide.jpg"
                            alt="Green waste bin"
                            width={800}
                            height={400}
                            className="w-full h-48 object-cover rounded-lg"
                        />
                    </div>

                    <div className="flex border-b border-gray-200 mb-4">
                        <button
                            onClick={() => setActiveTab("yes")}
                            className={`flex-1 py-3 font-medium text-center transition-colors duration-300 border-b-2 ${activeTab === "yes" ? "border-[#4CAF50] text-[#4CAF50]" : "border-transparent text-gray-500"} cursor-pointer`}
                        >
                            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                            What CAN Go In
                        </button>
                        <button
                            onClick={() => setActiveTab("no")}
                            className={`flex-1 py-3 font-medium text-center transition-colors duration-300 border-b-2 ${activeTab === "no" ? "border-[#F44336] text-[#F44336]" : "border-transparent text-gray-500"} cursor-pointer`}
                        >
                            <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                            What CAN&apos;T Go In
                        </button>
                    </div>

                    {activeTab === "yes" ? <YesTab /> : <NoTab />}

                    <button
                        onClick={onClose}
                        className="w-full mt-6 bg-[#4CAF50] hover:bg-[#2E7D32] text-white py-3 rounded-lg transition-colors duration-300 !rounded-button whitespace-nowrap cursor-pointer"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
}