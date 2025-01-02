import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export const LoadingScreen = ({ loading }: { loading: boolean }) => {
	const [timeElapsed, setTimeElapsed] = useState(0)
	useEffect(() => {
		setTimeElapsed(0)
		const interval = setInterval(() => {
			setTimeElapsed(prev => prev + 1)
		}, 1000)

		return () => {
			clearInterval(interval)
		}
	}, [loading])

	return (
		<div className='h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white'>
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='text-4xl font-bold mb-8 text-gray-800'
			>
				Optimizing Cargo Plan
			</motion.div>
			<motion.div
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				transition={{
					type: 'spring',
					stiffness: 260,
					damping: 20,
				}}
			>
				<Loader2 size={60} className='animate-spin text-[#f47624]' />
			</motion.div>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className='mt-8 text-lg text-gray-600 text-center flex flex-col'
			>
				Please wait while we calculate the optimal solution...
				<div className='text-gray-600'>Time Elapsed: {timeElapsed}s</div>
			</motion.div>
		</div>
	)
}
