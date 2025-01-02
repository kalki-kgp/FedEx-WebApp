'use client'

import { useRef, useState } from 'react'
import { ScrollTracker } from './components/ScrollTracker'
import { InputSection } from './components/InputSection'
import { FirstSolution } from './components/FirstSolution'
import { Button } from '@/app/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import Image from 'next/image'
import type { SolutionState } from './typings'
import NextSolution from './components/NextSolution'

const initialSolutionState: SolutionState = {
	loaded: false,
	loading: false,
	solution: null,
}

export default function Page() {
	const scrollRef = useRef<HTMLDivElement>(null)

	const [currentSection, setCurrentSection] = useState(0)
	const [canScroll, setCanScroll] = useState(false)
	const [solutionState, setSolutionState] =
		useState<SolutionState>(initialSolutionState)

	const scrollToSection = (section: number) => {
		if (!scrollRef.current) return
		setCurrentSection(section)
		scrollRef.current.scrollTo({
			top: section * scrollRef.current.getBoundingClientRect().height,
			behavior: 'instant',
		})
	}

	return (
		<div className='h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 to-white text-gray-900'>
			<div
				className='flex-1 overflow-y-auto remove-scrollbar'
				ref={scrollRef}
				style={{
					overflowY: 'hidden',
				}}
			>
				<ScrollTracker
					scrollToSection={scrollToSection}
					canScroll={canScroll}
					currentSection={currentSection}
				/>

				{/* Hero Section */}
				<motion.div className='bg-[#D3C9F6] flex h-screen shrink-0 items-center justify-center relative gap-10'>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}
						className='flex flex-col w-1/2 ml-20 items-center justify-between'
					>
						<motion.div
							className='text-6xl font-bold text-center mb-4 bg-clip-text text-[#442e8c]'
							initial={{ y: -50 }}
							animate={{ y: 0 }}
							transition={{ delay: 0.2, duration: 0.5 }}
						>
							Optimal Cargo Planning
						</motion.div>

						<motion.div
							initial={{ y: -50 }}
							animate={{ y: 0 }}
							transition={{ delay: 0.2, duration: 0.5 }}
							className='text-xl text-center font-light mt-2 mb-6'
						>
							Efficiently manage and visualize your ULDs with our intuitive 3D
							solution. Track, organize, and optimize your assets in real time,
							streamlining operations and improving workflow.
						</motion.div>
						<motion.div
							initial={{ y: 50, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.4, duration: 0.5 }}
							className='space-y-4'
						>
							<Button
								onClick={() => scrollToSection(1)}
								className='bg-[#f47624] mb-8 text-white px-8 py-4 rounded-xl text-xl font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2'
							>
								Get Started
								<ArrowDown className='h-5 w-5' />
							</Button>
						</motion.div>
					</motion.div>
					<div className='mr-20'>
						<Image
							src={'/plane.png'}
							alt='plane'
							height={600}
							width={600}
							priority
						/>
					</div>
				</motion.div>

				{/* Input Section */}
				<div className='flex flex-col items-center justify-center h-screen shrink-0 bg-gradient-to-br from-gray-50 to-white relative'>
					<motion.div
						className='absolute inset-0 pointer-events-none'
						initial={{ opacity: 0 }}
						animate={{ opacity: 0.1 }}
						transition={{ delay: 0.5 }}
					>
						<div className='absolute inset-0 bg-gradient-to-r from-tint/10 to-accent/10' />
					</motion.div>
					<InputSection
						setSolutionState={setSolutionState}
						onFailure={() => {
							setCanScroll(false)
							scrollToSection(1)
						}}
						inProgress={() => {
							setCanScroll(true)
							scrollToSection(2)
							setSolutionState({
								loaded: false,
								loading: true,
								solution: null,
							})
						}}
						onComplete={() => {
							setCanScroll(true)
							scrollToSection(2)
						}}
					/>
				</div>

				{/* First Solution */}
				<div className='h-screen shrink-0'>
					<FirstSolution
						solutionState={solutionState}
						onProceed={() => {
							setCanScroll(true)
							scrollToSection(3)
						}}
					/>
				</div>

				{/* Next Section */}
				<div className='h-screen shrink-0'>
					<NextSolution
						solutionState={solutionState}
						onProceed={() => {
							setCanScroll(true)
							scrollToSection(3)
						}}
					/>
				</div>
			</div>
		</div>
	)
}
