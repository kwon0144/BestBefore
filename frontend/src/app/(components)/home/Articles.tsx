import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function Articles() {
    const articles = [
        {
            image: "https://public.readdy.ai/ai/img_res/31adbd7152dd82cbd9c3764665b7f15b.jpg",
            alt: "Food Waste in Australian Households",
            title: "Food Waste in Australian Households: The Hidden Cost",
            description: "New research reveals the economic and environmental impact of household food waste in Australia.",
            link: "#"
        },
        {
            image: "https://public.readdy.ai/ai/img_res/f1b012644f8a79ea38c19712e185a09b.jpg",
            alt: "Melbourne's Community Gardens",
            title: "Melbourne's Community Gardens Fighting Food Waste",
            description: "How local initiatives are transforming unused spaces into productive gardens and reducing food miles.",
            link: "#"
        },
        {
            image: "https://public.readdy.ai/ai/img_res/979d2542ea94b5d4f438a1a297806a40.jpg",
            alt: "Smart Storage Solutions",
            title: "Smart Storage: Technology Tackling Food Waste",
            description: "Innovative technologies helping Australians extend food shelf life and reduce kitchen waste.",
            link: "#"
        }
    ];

    return (
        <div className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-darkgreen text-center mb-12">
                    Food Waste Insights
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {articles.map((article, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="h-48 overflow-hidden">
                                <img
                                    src={article.image}
                                    alt={article.alt}
                                    className="w-full h-full object-cover object-top"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-[#2E5A4B] mb-2">
                                    {article.title}
                                </h3>
                                <p className="text-gray-700 mb-4">
                                    {article.description}
                                </p>
                                <a
                                    href={article.link}
                                    className="text-[#2E5A4B] font-medium hover:underline cursor-pointer"
                                >
                                    Read More <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}