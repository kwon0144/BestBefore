import { Button } from "@heroui/react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faXmark, faAppleAlt, faBreadSlice, faUtensils, faWineBottle, faCoffee, faShower, faInfoCircle, faArrowLeft, faCheck } from "@fortawesome/free-solid-svg-icons";

interface DonationGuideContentProps {
    onClose: () => void;
}

export default function DonationGuideContent({ onClose }: DonationGuideContentProps) {
    const [flipped, setFlipped] = useState(false);

    const toggleFlip = () => {
        setFlipped(!flipped);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="relative perspective">
                {/* First Page */}
                <div
                    className={`relative bg-white rounded-xl shadow-2xl max-w-2xl w-full transition-all duration-700 transform ${flipped ? "rotate-y-180 hidden" : ""}`}
                >
                    {/* Close button */}
                    <Button
                        onPress={onClose}
                        className="absolute top-4 right-4 text-gray-500 bg-white text-2xl hover:text-gray-800 cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </Button>

                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                        <FontAwesomeIcon icon={faInfoCircle} className="text-[#4CAF50] text-2xl"></FontAwesomeIcon>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Foodbank Donation Guide
                            </h2>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Foodbank in Victoria relies on donations large and small. Join
                            us in the fight against hunger!
                        </p>

                        {/* Most Needed Items */}
                        <div className="bg-[#E8F5E9] p-4 rounded-lg mb-6">
                            <h3 className="font-bold text-lg text-gray-800 mb-2">
                                Most Needed Items
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {[
                                    { icon: faAppleAlt, text: "Canned food" },
                                    { icon: faBreadSlice, text: "Breakfast cereal" },
                                    { icon: faUtensils, text: "Pasta & rice" },
                                    { icon: faWineBottle, text: "Long life milk" },
                                    { icon: faCoffee, text: "Coffee & tea" },
                                    { icon: faShower, text: "Toiletries" }
                                ].map((item) => (
                                    <div key={item.text} className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={item.icon} className="text-[#4CAF50]" />
                                        <span>{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Image */}
                        <div className="mb-6">
                            <img
                                src="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/donationguide.jpg"
                                alt="Food donation items"
                                className="w-full h-48 object-cover rounded-lg"
                            />
                        </div>

                        {/* See complete donation guidelines */}
                        <Button
                            onPress={toggleFlip}
                            className="w-full bg-[#4CAF50] hover:bg-[#2E7D32] text-white py-3 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 !rounded-button whitespace-nowrap cursor-pointer"
                        >
                            <span>See complete donation guidelines</span>
                            <FontAwesomeIcon icon={faArrowRight} />
                        </Button>
                    </div>
                </div>


                {/* Second Page */}
                <div
              className={`relative bg-white rounded-xl shadow-2xl max-w-2xl w-full transition-all duration-700 transform ${!flipped ? "rotate-y-180 hidden" : ""}`}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-[#4CAF50] text-2xl"></FontAwesomeIcon>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Complete Donation Guidelines
                  </h2>
                </div>

                <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto pr-2">
                  <p className="text-gray-600">
                    Donations must be unopened, in their original packaging with
                    full ingredient and allergen listing, and within their best
                    before date.
                  </p>

                  <h3 className="font-bold text-lg text-gray-800">
                    Food Items
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      "Canned fruit & vegetables",
                      "Canned seafood & soups",
                      "Breakfast cereal",
                      "Pasta, noodles & rice",
                      "Long life milk & juice",
                      "Coffee, tea & spreads",
                      "Muesli bars & dried fruit",
                      "Sauces & cooking supplies"
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCheck} className="text-[#4CAF50]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={toggleFlip}
                    className="flex-1 border border-[#4CAF50] text-[#4CAF50] hover:bg-[#E8F5E9] py-3 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 !rounded-button whitespace-nowrap cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="flex-1 bg-[#4CAF50] hover:bg-[#2E7D32] text-white py-3 rounded-lg transition-colors duration-300 !rounded-button whitespace-nowrap cursor-pointer"
                  >
                    Got it!
                  </button>
                </div>
                </div>
            </div>
            </div>
        </div>
    );
}