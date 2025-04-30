import { motion } from 'framer-motion';

interface TitleProps {
    heading: string;
    description: string;
    background?: string;
}

export default function Title({heading, description, background}: TitleProps) {
    return <motion.div
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 1, ease: "easeOut" }}
    style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    }}>
        <div 
            className="max-w-3xl mx-auto flex flex-col justify-center items-center self-center py-24 text-darkgreen"
        >
            <h1 className="text-4xl font-bold mb-4 text-center">{heading}</h1>
            <p className="text-lg font-semibold text-center text-center">{description}</p>
        </div>
    </motion.div>
}