"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import RotatingText from "../RotatingTextRef";

type LoadingProps = {
	onComplete?: () => void;
	exitDelayMs?: number;
	completeDelayMs?: number;
};

export default function Loading({ onComplete, exitDelayMs, completeDelayMs }: LoadingProps) {
	const [finalExit, setFinalExit] = useState(false);
    const [ showText, setShowText ] = useState(true);

	useEffect(() => {
		const exitDelay = exitDelayMs ?? 2200;
		const completeDelay = completeDelayMs ?? Math.max(exitDelay + 1000, 3200);

		const exitTimer = setTimeout(() => setFinalExit(true), exitDelay);
		const completeTimer = setTimeout(() => {
			if (onComplete) onComplete();
		}, completeDelay);
		return () => {
			clearTimeout(exitTimer);
			clearTimeout(completeTimer);
		};
	}, [onComplete, exitDelayMs, completeDelayMs]);

	useEffect(() => {
		if (finalExit) {
			setShowText(false);
		}
	}, [finalExit]);

	return (
		<div className='relative'>
			{/* Background */}
			<motion.div
				className="absolute inset-0 bg-[#F5F5F1]/30"
				animate={finalExit ? { opacity: 0 } : {}}
				transition={{ duration: 2 }}
			/>
			<motion.div
				className="h-screen bg-cover bg-center"
				style={{
					backgroundImage:
						"url('https://s3-tp22.s3.ap-southeast-2.amazonaws.com/login-bg.png')",
				}}
				animate={finalExit ? { scale: 1.2, opacity: 0 } : {}}
				transition={{ duration: 1 }}
			/>
			<div className="absolute inset-0 flex items-center justify-center px-4">
				<div className='flex flex-col items-center'>
					<motion.div
						initial={{ y: -20, opacity: 0 }}
						animate={
							finalExit ? { scale: 1.5, y: 0, opacity: 0 } : { y: 0, opacity: 1 }
						}
						transition={
							finalExit
								? { duration: 1, ease: "easeInOut" }
								: { duration: 1, ease: "easeOut" }
						}
						className="w-80"
					>
						<Image
							src="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/logo.png"
							alt="Best Before Logo"
							width={320}
							height={120}
							priority
						/>
					</motion.div>
					<AnimatePresence>
						{showText && (
							<motion.div 
								className='flex flex-col md:flex-row items-center'
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -50 }}
								transition={{ duration: 0.3 }}
							>
								<p className='text-center text-2xl font-bold text-darkgreen'>Together for a</p>
								<RotatingText
									texts={["Sustainable", "Cost Effective", "Zero Waste"]}
									mainClassName="px-2 sm:px-2 md:px-3 text-green font-bold text-3xl overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
									staggerFrom="last"
									initial={{ y: "100%" }}
									animate={{ y: 0 }}
									exit={{ y: "-120%" }}
									staggerDuration={0.025}
									splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
									transition={{ type: "spring", damping: 30, stiffness: 400 }}
									rotationInterval={1500}
								/>
								<p className='text-center text-2xl font-bold text-darkgreen'>Kitchen</p>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}