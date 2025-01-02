import { Grid as DreiGrid } from '@react-three/drei'

export function Grid() {
	return (
		<DreiGrid
			rotation={[Math.PI / 2, 0, 0]}
			renderOrder={-1}
			position={[0, 0, 0]}
			infiniteGrid
			cellSize={20}
			cellThickness={1}
			cellColor='#403c3c'
			sectionSize={60}
			sectionThickness={1}
			sectionColor='#3f3838'
			fadeDistance={2300}
			fadeStrength={7}
			followCamera={false}
		/>
	)
}
