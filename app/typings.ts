type AllocationBase = {
	id: string
	height: number
	width: number
	length: number
	priority: number
	delay_cost: number
	weight: number
	x1: number
	y1: number
	z1: number
	x2: number
	y2: number
	z2: number
}

export type Allocation =
	| (AllocationBase & { uld_id: string })
	| (AllocationBase & { uld_id: null })

export interface ULD {
	uld_id: string
	height: number
	width: number
	length: number
	weight_limit: number
	volume_used: number
	weight_used: number
	num_economy_packages: number
	num_priority_packages: number
	total_packages: number
	has_priority_packages: number
	volume_efficiency: number
	weight_efficiency: number
}

export interface Solution {
	packed_volume: number
	packed_weight: number
	volume_efficiency: number
	weight_efficiency: number
	total_cost: number
	delay_cost: number
	priority_cost: number
	total_packed_packages: number
	total_packed_priority_packages: number
	total_packed_economy_packages: number
	num_priority_ulds: number
	total_unpacked_packages: number
	ulds: ULD[]
	allocation: Allocation[]
}

export type SolutionState =
	| {
			loaded: true
			loading: false
			solution: Solution
	  }
	| {
			loaded: false
			loading: boolean
			solution: null
	  }

export interface Cuboid {
	id: string
	uld_id: string
	center: [number, number, number]
	size: [number, number, number]
	priority: number
}
