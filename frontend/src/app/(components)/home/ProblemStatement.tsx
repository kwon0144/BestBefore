import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faWeight, faGlobe } from '@fortawesome/free-solid-svg-icons';

export default function ProblemStatement() {
    const cards = [
        {
            icon: faDollarSign,
            title: "$2,000+",
            description: "Wasted per household annually on discarded food"
        },
        {
            icon: faWeight,
            title: "200,000+ tonnes",
            description: "Of food wasted in Victoria alone each year"
        },
        {
            icon: faGlobe,
            title: "Environmental Impact",
            description: "Food waste is a major contributor to greenhouse gas emissions"
        }
    ];

    return (
        <div id="problem-statement" className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-primary-main text-center mb-12">
                    The Food Waste Crisis
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {cards.map((card, index) => (
                        <div key={index} className="bg-white p-8 rounded-lg shadow-md text-center">
                            <div className="text-[#FF8C42] mb-4">
                                <FontAwesomeIcon icon={card.icon} className="text-5xl" />
                            </div>
                            <h3 className="text-2xl font-semibold text-primary-main mb-3">{card.title}</h3>
                            <p className="text-gray-700">
                                {card.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}