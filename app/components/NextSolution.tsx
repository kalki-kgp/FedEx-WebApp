'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, ChevronDown, ChevronRight, Square } from 'lucide-react'
import { Grid } from '@/app/components/scene/grid'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Card, CardContent } from '@/app/components/ui/card'
import { getColorByType, mapAllocationsToCuboids, prettify } from '@/app/utils'
import { Allocation, SolutionState, ULD } from '../typings'
import { Package3D } from './Package3D'
import { Axes } from './Axes'

// Types from ULDViewer
interface TransformedPackage {
	'ULD Id': string
	'Package Id': string
	x1: number
	y1: number
	z1: number
	x2: number
	y2: number
	z2: number
	length: number
	width: number
	height: number
	Type: number
	DelayCost: number
	Weight: number
}

type ULDData = Record<string, TransformedPackage[]>

// PieChart component from FirstSolution
const PieChartWrapper = ({
	percentage,
	color,
}: {
	percentage: number
	color: string
}) => {
	const data = [
		{ name: 'Used', value: percentage },
		{ name: 'Remaining', value: 100 - percentage },
	]

	return (
		<ResponsiveContainer width={90} height={90}>
			<PieChart>
				<Pie
					data={data}
					innerRadius={23}
					outerRadius={30}
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

const Scene = ({
	currentPackages,
	selectedULD,
	selectedPackage,
}: {
	currentPackages: Allocation[]
	selectedULD: string | null
	selectedPackage: string | null
}) => {
	const cuboids = mapAllocationsToCuboids(currentPackages)

	if (!selectedULD || selectedULD === 'Unassigned') {
		return (
			<>
				<Grid />
			</>
		)
	}

	return (
		<>
			<Grid />
			{cuboids.map(c => (
				<Package3D
					key={c.id}
					position={c.center}
					size={c.size}
					color={getColorByType(c.priority)}
					id={c.id}
					uldId={c.uld_id}
					isVisible={selectedPackage === null || selectedPackage === c.id}
				/>
			))}
		</>
	)
}

// Sidebar component from ULDViewer
const Sidebar: React.FC<{
	uldData: ULDData
	selectedULD: string | null
	setSelectedULD: (uldId: string | null) => void
	selectedPackage: string | null
	setSelectedPackage: (packageId: string | null) => void
}> = ({
	uldData,
	selectedULD,
	setSelectedULD,
	selectedPackage,
	setSelectedPackage,
}) => {
	const [expandedULDs, setExpandedULDs] = useState<{ [key: string]: boolean }>(
		{}
	)

	const toggleULD = (uldId: string) => {
		setExpandedULDs(prev => ({ ...prev, [uldId]: !prev[uldId] }))
	}

	const unassignedPackages = Object.values(uldData)
		.flat()
		.filter(pkg => pkg['ULD Id'] === null)

	return (
		<div className='w-80 h-full bg-gray-50 border-r border-gray-200 flex flex-col shadow-lg select-none'>
			<div className='p-6 border-b border-gray-100'>
				<h2 className='text-2xl font-semibold text-black-600 flex items-center'>
					<Package className='mr-2' />
					ULDs and Packages
				</h2>
			</div>
			<div className='flex-1 overflow-y-auto p-4 custom-scrollbar'>
				<ul className='space-y-4'>
					{/* Assigned ULDs */}
					{Object.entries(uldData)
						.filter(([uldId]) => uldId && uldId !== 'null')
						.sort(([a], [b]) => a.localeCompare(b))
						.map(([uldId, packages]) => (
							<li key={uldId}>
								<div
									className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
										selectedULD === uldId
											? 'bg-gray-200 text-black shadow-md'
											: 'bg-gray-50 text-gray-700 hover:bg-gray-100'
									}`}
									onClick={() => {
										setSelectedULD(uldId)
										setSelectedPackage(null)
										toggleULD(uldId)
									}}
								>
									{expandedULDs[uldId] ? (
										<ChevronDown className='h-5 w-5 mr-2' />
									) : (
										<ChevronRight className='h-5 w-5 mr-2' />
									)}
									<span className='font-medium'>{uldId}</span>
								</div>
								{expandedULDs[uldId] && (
									<ul className='ml-6 mt-2 space-y-2'>
										{packages.map(pkg => (
											<li
												key={pkg['Package Id']}
												className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
													selectedPackage === pkg['Package Id']
														? 'bg-gray-200 text-gray-600 shadow-md'
														: 'bg-gray-50 text-gray-600 hover:bg-gray-100'
												}`}
												onClick={() => {
													setSelectedULD(pkg['ULD Id'])
													setSelectedPackage(pkg['Package Id'])
												}}
											>
												<Package className='h-4 w-4 mr-2 text-gray-600' />
												<span>{pkg['Package Id']}</span>
											</li>
										))}
									</ul>
								)}
							</li>
						))}

					{unassignedPackages.length > 0 && (
						<li>
							<div
								className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
									selectedULD === 'Unassigned'
										? 'bg-purple-600 text-white shadow-md'
										: 'bg-gray-50 text-gray-700 hover:bg-gray-100'
								}`}
								onClick={() => toggleULD('Unassigned')}
							>
								<ChevronRight className='h-5 w-5 mr-2' />
								<span className='font-medium'>Unassigned</span>
							</div>
							{expandedULDs['Unassigned'] && (
								<ul className='ml-6 mt-2 space-y-2'>
									{unassignedPackages.map(pkg => (
										<li
											key={pkg['Package Id']}
											className='flex items-center p-3 rounded-lg bg-gray-50 text-gray-600'
										>
											<Package className='h-4 w-4 mr-2 text-gray-500' />
											<span>Package {pkg['Package Id']}</span>
										</li>
									))}
								</ul>
							)}
						</li>
					)}
				</ul>
			</div>
		</div>
	)
}

// Main component
export const NextSolution: React.FC<{
	onProceed: (arg: string) => void
	solutionState: SolutionState
}> = ({ onProceed, solutionState }) => {
	const [uldData, setUldData] = useState<ULDData>({})
	const [selectedULD, setSelectedULD] = useState<string | null>(null)
	const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
	//const [currentULDIndex, setCurrentULDIndex] = useState(0)

	useEffect(() => {
		if (!solutionState.loaded) return
		const transformedData: ULDData = solutionState.solution.ulds.reduce(
			(acc, uld) => {
				acc[uld.uld_id] = []
				return acc
			},
			{ Unassigned: [] } as ULDData
		)

		for (const allocation of solutionState.solution.allocation) {
			const transformedPackage: TransformedPackage = {
				'ULD Id': allocation.uld_id || 'Unassigned',
				'Package Id': allocation.id,
				x1: allocation.x1,
				y1: allocation.y1,
				z1: allocation.z1,
				x2: allocation.x2,
				y2: allocation.y2,
				z2: allocation.z2,
				Type: allocation.priority,
				DelayCost: allocation.delay_cost,
				Weight: allocation.weight,
				length: allocation.length,
				width: allocation.width,
				height: allocation.height,
			}
			transformedData[transformedPackage['ULD Id']].push(transformedPackage)
		}

		setUldData(transformedData)
	}, [solutionState])

	const getPackageData = (packageId: string | null) => {
		if (!packageId || !selectedULD) return null
		const pkg = uldData[selectedULD].find(p => p['Package Id'] === packageId)
		if (!pkg) return null

		return {
			'Package ID': pkg['Package Id'],
			'ULD-ID': pkg['ULD Id'],
			Type: pkg.Type,
			IntType: pkg.Type !== 0 ? 'Priority' : 'Economy',
			Dimensions: `${prettify(pkg.length)}cm x ${prettify(pkg.width)}cm x ${prettify(pkg.height)}cm`,
			PackageWeight: prettify(pkg.Weight),
			Position: `(${prettify(pkg.x1)}, ${prettify(pkg.y1)}, ${prettify(pkg.z1)}) - (${prettify(pkg.x2)}, ${prettify(pkg.y2)}, ${prettify(pkg.z2)})`,
			'Delay Cost': `${prettify(pkg.DelayCost)}`,
		}
	}

	const getULDData = (uldId: string | null): ULD | null => {
		if (!uldId || !solutionState.loaded) return null
		return solutionState.solution.ulds.find(uld => uld.uld_id === uldId) || null
	}

	const selectedUldData = useMemo(
		() => getULDData(selectedULD),
		[selectedULD, solutionState]
	)

	const selectedPackageData = useMemo(
		() => getPackageData(selectedPackage),
		[selectedPackage, selectedULD, uldData]
	)

	if (!solutionState.loaded) return <></>

	//const currentULD = solutionState.solution.ulds[currentULDIndex]

	const currentPackages = selectedULD
		? solutionState.solution.allocation.filter(a => a.uld_id === selectedULD)
		: solutionState.solution.allocation

	return (
		<div className='h-screen flex bg-gray-100'>
			<Sidebar
				uldData={uldData}
				selectedULD={selectedULD}
				setSelectedULD={setSelectedULD}
				selectedPackage={selectedPackage}
				setSelectedPackage={setSelectedPackage}
			/>
			<div className='flex-1 flex flex-col'>
				<div className='flex-1 relative'>
					<Canvas
						camera={{ position: [400, -300, 400], fov: 75 }}
						gl={{ antialias: true }}
					>
						<ambientLight intensity={1.6} />
						<pointLight
							position={[400000, -300000, 400000]}
							intensity={1000000000000}
						/>
						<Scene
							currentPackages={currentPackages}
							selectedULD={selectedULD}
							selectedPackage={selectedPackage}
						/>
						{selectedUldData && (
							// <ULD3D uldData={selectedUldData} isSelected={true} />
							<Line
								points={[
									[0, 0, 0],
									[selectedUldData.length, 0, 0],
									[selectedUldData.length, 0, selectedUldData.height],
									[0, 0, selectedUldData.height],
									[0, 0, 0],
									[0, selectedUldData.width, 0],
									[0, selectedUldData.width, selectedUldData.height],
									[0, 0, selectedUldData.height],
									[0, selectedUldData.width, selectedUldData.height],
									[
										selectedUldData.length,
										selectedUldData.width,
										selectedUldData.height,
									],
									[selectedUldData.length, 0, selectedUldData.height],
									[selectedUldData.length, 0, 0],
									[selectedUldData.length, selectedUldData.width, 0],
									[0, selectedUldData.width, 0],
									[0, selectedUldData.width, selectedUldData.height],
									[
										selectedUldData.length,
										selectedUldData.width,
										selectedUldData.height,
									],
									[selectedUldData.length, selectedUldData.width, 0],
								]}
								color='#222'
								lineWidth={2}
							/>
						)}
						<OrbitControls
							enableDamping
							dampingFactor={0.05}
							rotateSpeed={0.5}
							zoomSpeed={0.7}
							target={[
								selectedUldData ? selectedUldData.length / 2 : 0,
								selectedUldData ? selectedUldData.width / 2 : 0,
								selectedUldData ? selectedUldData.height / 2 : 0,
							]}
							panSpeed={0.5}
							minDistance={3}
							maxDistance={1000}
							maxPolarAngle={Math.PI / 2}
						/>

						<Axes
							limit={
								selectedUldData
									? Math.max(
											selectedUldData.height,
											selectedUldData.width,
											selectedUldData.length
										) + 100
									: 300
							}
						/>
					</Canvas>

					{!selectedULD && (
						<div className='text-8xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-semibold text-gray-300 text-center select-none'>
							Select ULD to view
						</div>
					)}

					<div className='absolute flaot float-col top-0 left-0 m-4 p-3 bg-black/5 border select-none text-sm border-gray-300 rounded shadow-sm'>
						<div className='flex gap-1 text-[#f97316] items-center mb-2'>
							<Package size={18} /> Priority
						</div>
						<div className='flex gap-1 text-[#8b5cf6] items-center'>
							<Package size={18} /> Economy
						</div>
					</div>

					<AnimatePresence>
						{selectedULD && !selectedPackage && selectedUldData && (
							<motion.div
								className='absolute right-10 top-4 min-w-[20rem] w-auto h-auto bg-white rounded-lg p-4 shadow-lg'
								initial={{ opacity: 0, x: 50 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 50 }}
								transition={{ duration: 0.3 }}
							>
								<h3 className='text-2xl font-semibold mb-1 text-black'>
									{selectedUldData.uld_id}
								</h3>
								<p className='text-xs text-gray-700 mb-4'>
									{`${prettify(selectedUldData.length)}cm x ${prettify(selectedUldData.width)}cm x ${prettify(selectedUldData.height)}cm`}
									&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
									{`${prettify(selectedUldData.weight_used)} kg`}
								</p>
								<div className='space-y-2 text-base mb-6'>
									<div className='flex justify-between'>
										<span className='font-medium text-gray-600'>
											Total Packages
										</span>
										<span className='text-gray-900 font-semibold'>
											{selectedUldData.total_packages}
										</span>
									</div>
									<div className='flex justify-between'>
										<span className='font-medium text-gray-600'>
											Priority Packages
										</span>
										<span className='text-gray-900 font-semibold'>
											{selectedUldData.num_priority_packages}
										</span>
									</div>
									<div className='flex justify-between'>
										<span className='font-medium text-gray-600'>
											Economy Packages
										</span>
										<span className='text-gray-900 font-semibold'>
											{selectedUldData.num_economy_packages}
										</span>
									</div>
								</div>
								<div className='flex flex-col gap-4'>
									<Card className='flex-1 overflow-hidden'>
										<CardContent className='px-0 flex'>
											<div className='flex flex-col flex-1'>
												<h3 className='text-sm text-gray-500 my-0 uppercase'>
													Volume
												</h3>
												<div className='flex-1 flex flex-col justify-center '>
													<p className='text-xl font-bold my-0 text-gray-700'>
														{prettify(selectedUldData.volume_used)} cm³
													</p>
													<p className='text-sm text-gray-500 my-0'>
														of{' '}
														{prettify(
															selectedUldData.length *
																selectedUldData.width *
																selectedUldData.height
														)}{' '}
														cm³
													</p>
												</div>
											</div>
											<div className='w-fit'>
												<PieChartWrapper
													percentage={selectedUldData.volume_efficiency * 100}
													color='#9333ea'
												/>
											</div>
										</CardContent>
									</Card>
									<Card className='flex-1 overflow-hidden'>
										<CardContent className='px-0 flex'>
											<div className='flex flex-col flex-1'>
												<h3 className='text-sm text-gray-500 my-0 uppercase'>
													Weight
												</h3>
												<div className='flex-1 flex flex-col justify-center '>
													<p className='text-xl font-bold my-0 text-gray-700'>
														{prettify(selectedUldData.weight_used)} kg
													</p>
													<p className='text-sm text-gray-500 my-0'>
														of {prettify(selectedUldData.weight_limit)} kg
													</p>
												</div>
											</div>
											<div className='w-fit'>
												<PieChartWrapper
													percentage={selectedUldData.weight_efficiency * 100}
													color='#9333ea'
												/>
											</div>
										</CardContent>
									</Card>
								</div>
							</motion.div>
						)}

						{selectedPackage && selectedPackageData && (
							<motion.div
								className='absolute right-10 top-4 w-[27rem] h-auto bg-white rounded-lg p-4 shadow-lg'
								initial={{ opacity: 0, x: 50 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 50 }}
								transition={{ duration: 0.3 }}
							>
								<h3
									className={`text-2xl font-bold mb-1 ${selectedPackageData.Type !== 0 ? 'text-[#f97316]' : 'text-[#8b5cf6]'}`}
								>
									{selectedPackageData['Package ID']}
								</h3>
								<p className='text-xs text-gray-700 mb-4'>
									{selectedPackageData.Dimensions}
									&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
									{selectedPackageData.PackageWeight} kg
									&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
									{selectedPackageData.IntType}
								</p>
								<div className='space-y-2 text-base'>
									<div className='flex justify-between'>
										<span className='font-medium text-gray-600'>
											Assigned ULD
										</span>
										<span className='text-gray-900 font-semibold'>
											{selectedPackageData['ULD-ID']}
										</span>
									</div>
									{selectedPackageData['ULD-ID'] !== 'Unassigned' && (
										<div className='flex justify-between'>
											<span className='font-medium text-gray-600'>
												Position
											</span>
											<span className='text-gray-900 font-semibold'>
												{selectedPackageData.Position}
											</span>
										</div>
									)}
									{!selectedPackageData['Type'] && (
										<div className='flex justify-between'>
											<span className='font-medium text-gray-600'>
												Delay Cost
											</span>
											<span className='text-gray-900 font-semibold'>
												{selectedPackageData['Delay Cost']}
											</span>
										</div>
									)}
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	)
}

export default NextSolution
