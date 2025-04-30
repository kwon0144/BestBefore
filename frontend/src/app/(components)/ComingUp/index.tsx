import Image from "next/image";
import NoScrollLink from "../NoScrollLink";

interface ComingUpProps {
  message: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageSrc: string;
  imageAlt: string;
}

const ComingUp: React.FC<ComingUpProps> = ({
  message,
  title,
  description,
  buttonText,
  buttonLink,
  imageSrc,
  imageAlt,
}) => {
  return (
    <div className="max-w-5xl mx-auto bg-amber-50/70 rounded-3xl p-4 md:p-6 shadow-md hover:axi">
      <div className="flex flex-col md:flex-row justify-center items-center">
        <div className="flex flex-col items-center w-full md:w-2/3 px-4 md:px-12 justify-center text-center">
          <p className="text-2xl md:text-2xl lg:text-2xl text-amber-900 font-bold mb-4 md:mb-6 text-center">
            {message}
          </p>
          <h3 className="text-lg md:text-lg lg:text-xl font-semibold text-amber-900 mb-2 text-center">
            {title}
          </h3>
          <p className="text-base md:text-base lg:text-lg text-amber-700 mb-6 md:mb-6 text-center">
            {description}
          </p>
          <NoScrollLink href={buttonLink}>
            <div className="bg-amber-700 text-white py-2 px-6 md:px-8 rounded-lg cursor-pointer hover:bg-amber-700 transition-colors duration-300">
              <p className="font-semibold text-white text-sm md:text-sm lg:text-base">{buttonText}</p>
            </div>
          </NoScrollLink>
        </div>
        <div className="flex justify-center items-center w-full hidden md:w-1/3 mt-6 md:mt-0 md:block">
          <Image 
            src={imageSrc} 
            alt={imageAlt} 
            width={400} 
            height={400}
            className="w-full max-w-[300px] md:max-w-[350px] lg:max-w-[400px]"
          />
        </div>
      </div>
    </div>
  );
};

export default ComingUp;
