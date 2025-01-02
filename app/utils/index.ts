import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Allocation, Cuboid, Solution } from '../typings'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const getColorByType = (priorty: number): string => {
	return priorty ? '#F97316' : '#8b5cf6' // Orange for P, Purple for E
}

export const parseCSV = (content: string): string[][] => {
	return content
		.trim()
		.split('\n')
		.map(line => line.split(','))
}

export const sleep = (ms: number) => {
	return new Promise<void>(res => {
		setTimeout(res, ms)
	})
}

export const mapAllocationsToCuboids = (packages: Allocation[]): Cuboid[] =>
	packages.map(p => ({
		uld_id: p.uld_id!,
		id: p.id,
		center: [(p.x1 + p.x2) / 2, (p.y1 + p.y2) / 2, (p.z1 + p.z2) / 2],
		size: [Math.abs(p.x2 - p.x1), Math.abs(p.y2 - p.y1), Math.abs(p.z2 - p.z1)],
		priority: p.priority,
	}))

export class Client {
	formData: FormData
	id: string
	private _polling: boolean
	private _cooldown: number

	constructor(
		uldFile: File,
		packageFile: File,
		k: string,
		cooldown: number = 5000
	) {
		this.id = new Date().toISOString()
		this._cooldown = cooldown
		this._polling = false
		this.formData = new FormData()
		this.formData.set('request_name', this.id)
		this.formData.set('k', k)
		this.formData.set('uld_file', uldFile, uldFile.name)
		this.formData.set('package_file', packageFile, packageFile.name)
		this.formData.set('strategy', 'greedy_heuristic')
	}

	async initiate() {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/filepack`, {
			method: 'POST',
			body: this.formData,
			mode: 'cors',
		})
		if (res.status !== 200 && res.status !== 201) {
			const data = await res.json()
			throw new Error(JSON.stringify(data.detail ?? 'Something went wrong'))
		}
	}

	async _fetchSolution() {
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/solution/${this.id}`,
			{
				mode: 'cors',
			}
		)

		const data = await res.json()
		if (res.status !== 200 && res.status !== 201)
			throw new Error(JSON.stringify(data.detail ?? 'Something went wrong'))

		return data.solution as Solution
	}

	async startPolling(cb: (solution: Solution) => void) {
		// Prevent duplicate polling
		if (this._polling) return
		this._polling = true

		const pollRequest = new Request(
			`${process.env.NEXT_PUBLIC_API_URL}/status/${this.id}`,
			{
				mode: 'cors',
			}
		)

		const poll = async () => {
			const res = await fetch(pollRequest)
			const data = await res.json()
			if (res.status !== 200 && res.status !== 201)
				throw new Error(JSON.stringify(data.detail ?? 'Something went wrong'))
			const pollStatus = data.status
			if (pollStatus === 'completed') {
				const allocations = await this._fetchSolution()
				cb(allocations)
			} else {
				await sleep(this._cooldown)
				await poll()
			}
		}

		await poll()
	}
}

const isInteger = (value: number) => {
	return Math.trunc(value) === value
}

export const prettify = (value: number) => {
	return isInteger(value) ? value : value.toFixed(2)
}
