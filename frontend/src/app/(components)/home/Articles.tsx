import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function Articles() {
    const articles = [
        {
            image: "https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/article1.jpeg",
            alt: "Reducing Food Waste",
            title: "Reducing Food Waste",
            description: "Food waste decomposes in landfill, emitting methane and contributing to climate change. Learn how we're helping the community reduce food waste to save the city.",
            link: "https://www.yarracity.vic.gov.au/climate-and-sustainability/waste-and-recycling/reducing-food-waste"
        },
        {
            image: "https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/article2.jpg",
            alt: "Melbourne on board to fight food waste",
            title: "Melbourne on board to fight food waste",
            description: "Australia’s food rescue organisation, OzHarvest, reveals households can cut their food waste by 40% with its innovative Use It Up tape.",
            link: "https://retailworldmagazine.com.au/melbourne-on-board-to-fight-food-waste/"
        },
        {
            image: "https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/article3.jpeg",
            alt: "Food waste savings spring up in Melbourne",
            title: "Food waste savings spring up in Melbourne",
            description: "Surplus food marketplace app, Too Good To Go, is launching in Melbourne, aiming to help households and businesses halve Australia’s annual food waste by 2030.",
            link: "https://www.foodanddrinkbusiness.com.au/news/food-waste-savings-spring-up-in-melbourne"
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
                        <div key={index} 
                            onClick={() => window.open(article.link, '_blank')}
                            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300">
                            <div className="h-48 overflow-hidden">
                                <img
                                    src={article.image}
                                    alt={article.alt}
                                    className="w-full h-full object-cover object-top"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-darkgreen mb-2">
                                    {article.title}
                                </h3>
                                <p className="text-gray-700 mb-4">
                                    {article.description}
                                </p>
                                <a
                                    className="text-darkgreen font-medium hover:underline cursor-pointer"
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