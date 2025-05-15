'use client'

import Title from "../(components)/Title"

export default function FoodImpact() {
    return (
        <div>
            {/* Title */}
            <div className="py-12">
                <Title heading="Food Impact" 
                description="Explore the impact of food on the environment and how we can reduce waste and improve sustainability." 
                background="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/foodimpact-titlebg.jpeg"
                />
            </div>
        </div>
    )
}