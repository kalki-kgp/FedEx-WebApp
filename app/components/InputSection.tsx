import React, { Dispatch, SetStateAction, useState } from 'react'
import { ScrollArea } from '@/app/components/ui/scroll-area'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, Upload } from 'lucide-react'
import * as csv from 'csvtojson'
import { SolutionState } from '../typings'
import { Client } from '../utils/index'
import { toast } from 'sonner'

export const InputSection = ({
	onComplete,
	onFailure,
	inProgress,
	setSolutionState,
}: {
	onComplete: () => void
	onFailure: () => void
	inProgress: () => void
	setSolutionState: Dispatch<SetStateAction<SolutionState>>
}) => {
	const [progress, setProgress] = useState(0)
	const [uldCsvContent, setUldCsvContent] = useState<any[]>([])
	const [packageCsvContent, setPackageCsvContent] = useState<any[]>([])
	const [k, setK] = useState<string>('')

	const [uldBlobData, setUldBlobData] = useState<File | null>(null)
	const [packageBlobData, setPackageBlobData] = useState<File | null>(null)

	const handleGetSolution = async () => {
		if (
			!k.trim() ||
			isNaN(Number(k)) ||
			Number(k) <= 0 ||
			!uldBlobData ||
			!packageBlobData
		)
			return

		inProgress()
		// Solution fetching
		try {
			const client = new Client(uldBlobData, packageBlobData, k)
			await client.initiate()
			toast.success('Task added to queue')
			await client.startPolling(solution => {
				setSolutionState({
					loaded: true,
					loading: false,
					solution,
				})
			})
			onComplete()
		} catch (err) {
			console.error(err)
			toast.error((err as Error).message)
			setSolutionState({
				loaded: false,
				loading: false,
				solution: null,
			})
			onFailure()
		}
	}

	const handleCSVUpload = async (
		file: File,
		setContent: React.Dispatch<React.SetStateAction<any[]>>
	) => {
		try {
			const text = await file.text()
			const jsonArray = await csv.default().fromString(text)
			setContent(jsonArray)
			setProgress(prev => prev + 1)
		} catch (error) {
			console.error('Error parsing CSV:', error)
			// You might want to add error handling UI here
		}
	}

	const renderTable = (data: any[]) => {
		if (!data.length) return null

		const headers = Object.keys(data[0])
		const fontSize = data.length > 20 ? 'text-xs' : 'text-sm' // Adjust font size based on data length

		return (
			<table className='w-full'>
				<thead>
					<tr>
						{headers.map((header, index) => (
							<th
								key={index}
								className={`px-2 py-1 text-left font-medium text-gray-600 ${fontSize} sticky top-0 bg-gray-50`}
							>
								{header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{data.map((row, rowIndex) => (
						<tr key={rowIndex}>
							{headers.map((header, cellIndex) => (
								<td
									key={cellIndex}
									className={`px-2 py-1 text-gray-600 ${fontSize} border-t border-gray-100`}
								>
									{row[header]}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		)
	}

	return (
		<div className='h-auto max-h-2/3 w-2/3 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden'>
			<div className='flex w-full'>
				<div className='w-80 bg-gray-50 py-10 border-r border-gray-100'>
					{['Upload ULD data', 'Upload package data', 'Set parameters'].map(
						(step, index) => (
							<motion.div
								key={step}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.1 }}
								onClick={() => {
									if (progress > index) {
										if (index === 0) {
											setUldCsvContent([])
											setPackageCsvContent([])
											setUldBlobData(null)
											setPackageBlobData(null)
											setK('')
										} else if (index === 1) {
											setPackageBlobData(null)
											setPackageCsvContent([])
											setK('')
										} else if (index === 2) {
											setK('')
										}

										setProgress(index)
									}
								}}
								className={`px-6 py-3 flex items-center gap-3 ${
									progress < index
										? 'text-gray-400'
										: progress === index
											? 'text-tint font-medium'
											: 'text-accent'
								}`}
							>
								{progress > index ? (
									<CheckCircle className='w-5 h-5' />
								) : (
									<div
										className={`w-5 h-5 rounded-full border-2 ${
											progress === index ? 'border-tint' : 'border-gray-300'
										}`}
									/>
								)}
								{step}
							</motion.div>
						)
					)}
				</div>

				<div className='p-10 flex-grow'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						{progress === 0 && (
							<div className='space-y-6'>
								<h1 className='text-2xl font-bold text-gray-900'>
									Upload ULD Data
								</h1>
								<div
									onDragOver={e => e.preventDefault()}
									onDrop={e => {
										e.preventDefault()
										if (!e.dataTransfer.items) return
										const item = e.dataTransfer.items[0]
										if (item.kind !== 'file') return
										const file = item.getAsFile()
										console.log(file)
										if (!file || !file.type.match('^text/csv')) return
										setUldBlobData(file)
										handleCSVUpload(file, setUldCsvContent)
									}}
									className='border-2 border-dashed border-gray-200 rounded-lg p-8 text-center'
								>
									<Upload className='mx-auto h-12 w-12 text-gray-400' />
									<Label
										htmlFor='uld'
										className='mt-4 block text-sm font-medium text-gray-600'
									>
										Choose a CSV file or drag and drop
									</Label>
									<Input
										onChange={event => {
											if (!event.target.files?.length) return
											setUldBlobData(event.target.files[0])
											handleCSVUpload(event.target.files[0], setUldCsvContent)
										}}
										id='uld'
										name='uld'
										type='file'
										accept='.csv'
										className='mt-2'
									/>
								</div>
							</div>
						)}

						{progress === 1 && (
							<div className='space-y-6'>
								<h1 className='text-2xl font-bold text-gray-900'>
									Upload Package Data
								</h1>
								<div
									onDragOver={e => e.preventDefault()}
									onDrop={e => {
										e.preventDefault()
										if (!e.dataTransfer.items) return
										const item = e.dataTransfer.items[0]
										if (item.kind !== 'file') return
										const file = item.getAsFile()
										if (!file || !file.type.match('^text/csv')) return
										setPackageBlobData(file)
										handleCSVUpload(file, setPackageCsvContent)
									}}
									className='border-2 border-dashed border-gray-200 rounded-lg p-8 text-center'
								>
									<Upload className='mx-auto h-12 w-12 text-gray-400' />
									<Label
										htmlFor='package'
										className='mt-4 block text-sm font-medium text-gray-600'
									>
										Choose a CSV file or drag and drop
									</Label>
									<Input
										onChange={event => {
											if (!event.target.files?.length) return
											setPackageBlobData(event.target.files[0])
											handleCSVUpload(
												event.target.files[0],
												setPackageCsvContent
											)
										}}
										id='package'
										name='package'
										type='file'
										accept='.csv'
										className='mt-2'
									/>
								</div>
							</div>
						)}

						{progress === 2 && (
							<div className='space-y-6'>
								<h1 className='text-2xl font-bold text-gray-900'>
									Set Parameters
								</h1>
								<div className='space-y-4 flex flex-col items-center'>
									<div className='w-full'>
										<Label htmlFor='k' className='text-gray-700 w-full'>
											Spread Cost Parameter (K)
										</Label>
										<Input
											type='number'
											name='k'
											id='k'
											className='mt-1'
											onChange={event => {
												event.preventDefault()
												setK(event.target.value)
											}}
											value={k}
											required
											min='0'
											step='1'
										/>
									</div>
									<Button
										onClick={handleGetSolution}
										className='w-auto mt-4 text-white bg-[#f47624] transition-all duration-300'
										disabled={!k.trim() || isNaN(Number(k)) || Number(k) <= 0}
									>
										Get Solution
										<ArrowRight className='ml-2 h-4 w-4' />
									</Button>
								</div>
							</div>
						)}
					</motion.div>
				</div>
			</div>

			<div className='flex-1 p-6 border-t border-gray-100'>
				<div className='grid grid-cols-2 gap-6'>
					{uldCsvContent.length > 0 && (
						<div className='space-y-2'>
							<h3 className='text-lg font-semibold text-gray-900'>
								ULD Data Preview
							</h3>
							<ScrollArea className='h-60 rounded-lg border border-gray-200 bg-gray-50 p-4 pt-0'>
								{renderTable(uldCsvContent)}
							</ScrollArea>
						</div>
					)}

					{packageCsvContent.length > 0 && (
						<div className='space-y-2'>
							<h3 className='text-lg font-semibold text-gray-900'>
								Package Data Preview
							</h3>
							<ScrollArea className='h-60 rounded-lg border border-gray-200 bg-gray-50 p-4 pt-0'>
								{renderTable(packageCsvContent)}
							</ScrollArea>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
