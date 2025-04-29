import DonationGuideButton from "./DonationGuideButton";
import DisposalGuideButton from "./DisposalGuideButton";
import Image from "next/image";
export default function DonationDisposalOptions() {
    return (
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-darkgreen text-center mb-12">
          What are the options?
        </h2>
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Foodbank Component */}
          <div 
          className="p-8 flex flex-col rounded-3xl shadow-lg items-center text-center hover:translate-y-[-5px] transition-all duration-300 relative overflow-hidden"
          style={{
            backgroundImage: `url('https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/donationbg.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-2">Foodbank</h2>
              <p className="text-lg text-white">
                Share surplus food to the community.
              </p>
              <div className="text-white flex justify-center items-center">
                <Image src="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/foodbank-icon.png" 
                  alt="Foodbank" width={250} height={250}/>
              </div>
              <p className="text-white mb-8">
                Get extra food? Let it nourish someone in need! Discover your nearest foodbank and donate today.
              </p>
              <DonationGuideButton />
            </div>
          </div>

          {/* Green Waste Bin Component */}
          <div 
          className="p-8 flex flex-col rounded-3xl shadow-lg items-center text-center hover:translate-y-[-5px] transition-all duration-300 relative overflow-hidden"
          style={{
            backgroundImage: `url('https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/disposalbg.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-darkgreen mb-2">Green Waste Bin</h2>
              <p className="text-lg text-darkgreen font-semibold">
                Recycle your food waste smartly
              </p>
              <div className="text-darkgreen flex justify-center items-center">
                <Image src="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/greenbin-icon.png" 
                  alt="Green Waste Bin" width={250} height={250}/>
              </div>
              <p className="text-darkgreen mb-8 font-semibold">
                Don't toss it! Compost it! See how to sort your scraps the eco-friendly way.
              </p>
              <DisposalGuideButton />
            </div>
          </div>
        </div>
      </div>
    )
}