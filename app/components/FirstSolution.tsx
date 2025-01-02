'use client'
import React, { useState, useEffect } from 'react'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Grid, Line } from '@react-three/drei'
import { Button } from '@/app/components/ui/button'
import { usePackageStore } from '../store/package-store'
import { Card, CardContent } from '@/app/components/ui/card'
import { Package3D } from '@/app/components/Package3D'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react'
import { getColorByType, mapAllocationsToCuboids, prettify } from '@/app/utils'
import { Allocation, SolutionState, ULD } from '../typings'
import * as THREE from 'three'
import { LoadingScreen } from './LoadingScreen'
import { Axes } from './Axes'

const Scene = ({ currentPackages }: { currentPackages: Allocation[] }) => {
	const cuboids = mapAllocationsToCuboids(currentPackages)
	return (
		<>
			<Grid
				rotation={[Math.PI / 2, 0, 0]}
				renderOrder={-1}
				position={[0, -0.01, 0]}
				infiniteGrid
				cellSize={20}
				cellThickness={1}
				cellColor='#494545'
				sectionSize={60}
				sectionThickness={1}
				sectionColor='#484242'
				fadeDistance={2300}
				fadeStrength={7}
			/>
			{cuboids.map(c => (
				<Package3D
					key={c.id}
					position={c.center}
					size={c.size}
					color={getColorByType(c.priority)}
					id={c.id}
					uldId={c.uld_id}
				/>
			))}
		</>
	)
}

interface PieChartProps {
	percentage: number
	text: string
	color: string
}

const PieChartWrapper = ({ percentage, color }: PieChartProps) => {
	const data = [
		{ name: 'Used', value: percentage },
		{ name: 'Remaining', value: 100 - percentage },
	]

	return (
		<ResponsiveContainer width='100%' height='100%'>
			<PieChart>
				<Pie
					data={data}
					innerRadius={35}
					outerRadius={45}
					paddingAngle={2}
					dataKey='value'
					startAngle={90}
					endAngle={-270}
				>
					<Cell fill={color} />
					<Cell fill='#e2e8f0' />
				</Pie>
			</PieChart>
		</ResponsiveContainer>
	)
}

export const FirstSolution = ({
	onProceed,
	solutionState,
}: {
	onProceed: (arg: string) => void
	solutionState: SolutionState
}) => {
	const [currentULDIndex, setCurrentULDIndex] = useState(0)

	const handlePrevious = () => {
		if (!solutionState.loaded) return
		setCurrentULDIndex(
			prev =>
				(prev + solutionState.solution.ulds.length - 1) %
				solutionState.solution.ulds.length
		)
	}

	const handleNext = () => {
		if (!solutionState.loaded) return
		setCurrentULDIndex(prev => (prev + 1) % solutionState.solution.ulds.length)
	}

	if (!solutionState.loaded)
		return <LoadingScreen loading={solutionState.loading} />

	const currentULD = solutionState.solution.ulds[currentULDIndex]
	const currentPackages = solutionState.solution.allocation.filter(
		a => a.uld_id === currentULD.uld_id
	)

	THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1)

	return (
		<div className='h-full pt-6 pb-[72px] w-full px-20 mx-auto my-auto flex bg-[#F5F7FA] gap-8'>
			{/* Left Section - Canvas */}
			<div className='w-[35%] h-full p-6 flex flex-col bg-white shadow-sm hover:shadow-md transition-all rounded-md'>
				<div className='flex items-center justify-between'>
					<Button
						onClick={handlePrevious}
						className='text-gray-400 hover:text-black'
					>
						<ChevronLeft size={28} />
					</Button>

					<div className='text-xl text-black font-semibold'>
						{currentULD.uld_id}
					</div>

					<Button
						onClick={handleNext}
						className='text-gray-400 hover:text-black'
					>
						<ChevronRight size={28} />
					</Button>
				</div>

				<div className='text-center text-gray-500 text-sm'>
					{prettify(currentULD.length)} cm x {prettify(currentULD.width)} cm x{' '}
					{prettify(currentULD.height)} cm &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
					{prettify(currentULD.weight_limit)} kg
				</div>

				<div className='flex-1 overflow-hidden'>
					<Canvas
						camera={{ position: [400, -300, 400], fov: 75 }}
						gl={{ antialias: true }}
					>
						<ambientLight intensity={1.6} />
						<pointLight
							position={[400000, -300000, 400000]}
							intensity={1000000000000}
						/>
						<Scene currentPackages={currentPackages} />
						<Line
							points={[
								[0, 0, 0],
								[currentULD.length, 0, 0],
								[currentULD.length, 0, currentULD.height],
								[0, 0, currentULD.height],
								[0, 0, 0],
								[0, currentULD.width, 0],
								[0, currentULD.width, currentULD.height],
								[0, 0, currentULD.height],
								[0, currentULD.width, currentULD.height],
								[currentULD.length, currentULD.width, currentULD.height],
								[currentULD.length, 0, currentULD.height],
								[currentULD.length, 0, 0],
								[currentULD.length, currentULD.width, 0],
								[0, currentULD.width, 0],
								[0, currentULD.width, currentULD.height],
								[currentULD.length, currentULD.width, currentULD.height],
								[currentULD.length, currentULD.width, 0],
							]}
							color='#222'
							lineWidth={2}
						/>
						<OrbitControls
							enableDamping
							dampingFactor={0.05}
							rotateSpeed={0.5}
							zoomSpeed={0.7}
							panSpeed={0.5}
							target={[
								currentULD.length / 2,
								currentULD.width / 2,
								currentULD.height / 2,
							]}
							minDistance={3}
							maxDistance={1000}
							maxPolarAngle={Math.PI / 2}
						/>

						<Axes
							limit={
								Math.max(
									currentULD.height,
									currentULD.width,
									currentULD.length
								) + 100
							}
						/>
					</Canvas>
				</div>
				<div className='flex justify-center gap-4 mt-4'></div>
			</div>

			{/* Right Section - Dashboard (65% width) */}
			<div className='w-[65%] h-full overflow-y-hidden '>
				<div className='h-full flex flex-col bg-transparent rounded-xl shadow-lg gap-8 pt-8'>
					<div className='flex shrink-0 justify-between items-center'>
						<h2 className='text-4xl font-bold text-gray-800 m-0'>
							Solution Overview
						</h2>
						<Button
							onClick={() => onProceed('proceed-to-full-solution')}
							className='bg-orange-500 hover:bg-orange-600 text-white'
						>
							Proceed to Full Solution
							<ArrowRight className='ml-2 h-4 w-4' />
						</Button>
					</div>

					{/* Top Row - Package Stats */}
					<div className='grid flex-1 grid-cols-6 grid-rows-6 gap-4 min-h-0'>
						<Card className='col-span-3 row-span-2'>
							<CardContent className='p-4 flex flex-col'>
								<h3 className='text-sm font-medium text-gray-500 mb-1'>
									TOTAL COST
								</h3>
								<div className='text-7xl font-semibold flex-1 flex items-center justify-center text-purple-600'>
									{prettify(solutionState.solution.total_cost)}
								</div>
							</CardContent>
						</Card>

						<Card className='row-span-1 col-span-3 '>
							<CardContent className='p-4 flex flex-col'>
								<h3 className='text-sm font-medium text-gray-500 mb-1'>
									DELAY COST
								</h3>
								<div className='text-3xl flex-1 flex items-center font-semibold text-gray-700'>
									{prettify(solutionState.solution.delay_cost)}
								</div>
							</CardContent>
						</Card>

						<Card className='row-span-1 col-span-3'>
							<CardContent className='p-4 flex flex-col'>
								<h3 className='text-sm font-medium text-gray-500 mb-1'>
									SPREAD COST
								</h3>
								<div className='text-3xl flex-1 flex items-center font-semibold text-gray-700 '>
									{prettify(solutionState.solution.priority_cost)}
								</div>
							</CardContent>
						</Card>

						<Card className='col-span-2 row-span-2'>
							<CardContent className='p-4 flex flex-col'>
								<h3 className='text-sm font-medium text-gray-500 mb-1'>
									PRIORITY ULDS
								</h3>
								<div className='text-8xl flex flex-1 justify-center items-center '>
									<div className='flex items-baseline'>
										<div className='text-gray-700'>
											{solutionState.solution.num_priority_ulds}
										</div>
										<p className='text-sm text-gray-500 my-0'>
											of {solutionState.solution.ulds.length}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className='col-span-2 row-span-2'>
							<CardContent className='p-4 flex flex-col'>
								<h3 className='text-sm font-medium text-gray-500 mb-1'>
									PACKAGES PACKED
								</h3>
								<div className='text-8xl flex flex-1 justify-center items-center '>
									<div className='flex items-baseline'>
										<div className='text-gray-700'>
											{solutionState.solution.total_packed_packages}
										</div>
										<p className='text-sm text-gray-500 my-0'>
											of{' '}
											{solutionState.solution.total_packed_packages +
												solutionState.solution.total_unpacked_packages}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Priority Packed Card (increased width) */}
						<Card className='row-span-1 col-span-2'>
							<CardContent className='p-4 flex flex-col'>
								<h3 className='text-sm font-medium text-gray-500 mb-1 uppercase'>
									Priority Packages
								</h3>
								<div className='text-3xl flex-1 flex items-center font-semibold text-gray-700 '>
									{solutionState.solution.total_packed_priority_packages}
								</div>
							</CardContent>
						</Card>

						{/* Economy Packed Card (increased width) */}
						<Card className='row-span-1 col-span-2 '>
							<CardContent className='p-4 flex flex-col'>
								<h3 className='text-sm font-medium text-gray-500 mb-1 uppercase'>
									Economy Packages
								</h3>
								<div className='text-3xl flex-1 flex items-center font-semibold text-gray-700'>
									{solutionState.solution.total_packed_economy_packages}
								</div>
							</CardContent>
						</Card>
						{/* Bottom Row - Volume and Weight */}
						{/* Volume Card */}
						<Card className='col-span-3 row-span-2 overflow-hidden'>
							<CardContent className='p-4 flex '>
								<div className='flex flex-col w-4/5'>
									<h3 className='text-sm text-gray-500 my-0 uppercase'>
										Volume packed
									</h3>
									<div className='flex-1 flex flex-col justify-center gap-2'>
										<p className='text-5xl font-semibold my-0 text-gray-700'>
											{prettify(solutionState.solution.volume_efficiency * 100)}{' '}
											%
										</p>
										<p className='text-sm text-gray-500 my-0'>
											{prettify(solutionState.solution.packed_volume)} cm
											<sup>3</sup>
										</p>
									</div>
								</div>
								<PieChartWrapper
									percentage={solutionState.solution.volume_efficiency * 100}
									color='#9333ea'
									text='Volume'
								/>
							</CardContent>
						</Card>

						{/* Weight Card */}
						<Card className='col-span-3 row-span-2 overflow-hidden'>
							<CardContent className='p-4 flex '>
								<div className='flex flex-col w-4/5'>
									<h3 className='text-sm text-gray-500 my-0 uppercase'>
										Weight packed
									</h3>
									<div className='flex-1 flex flex-col justify-center gap-2'>
										<p className='text-5xl font-semibold my-0 text-gray-700'>
											{prettify(solutionState.solution.weight_efficiency * 100)}{' '}
											%
										</p>
										<p className='text-sm text-gray-500 my-0'>
											{prettify(solutionState.solution.packed_weight)} kg
										</p>
									</div>
								</div>
								<PieChartWrapper
									percentage={solutionState.solution.weight_efficiency * 100}
									color='#9333ea'
									text='Volume'
								/>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}
