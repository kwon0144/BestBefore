interface TitleProps {
    heading: string;
    description: string;
}

export default function Title({heading, description}: TitleProps) {
    return <div className="max-w-3xl mx-auto flex flex-col justify-center items-center self-center py-10 text-darkgreen">
        <h1 className="text-4xl font-bold mb-4">{heading}</h1>
        <p className="text-lg text-center">{description}</p>
    </div>
}