import { Line } from '@react-three/drei'

export const Axes = ({ limit }: { limit: number }) => {
	return (
		<>
			<mesh position={[0, 0, limit]} rotation={[Math.PI / 2, 0, 0]}>
				<coneGeometry args={[5, 15, 32]} />
				<meshStandardMaterial color={'#3f3838'} />
			</mesh>
			<mesh position={[0, limit, 0]} rotation={[0, Math.PI / 2, 0]}>
				<coneGeometry args={[5, 15, 32]} />
				<meshStandardMaterial color={'#3f3838'} />
			</mesh>
			<mesh position={[limit, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
				<coneGeometry args={[5, 15, 32]} />
				<meshStandardMaterial color={'#3f3838'} />
			</mesh>

			<Line
				points={[
					[0, 0, 0],
					[limit, 0, 0],
				]}
				color='#3f3838'
				lineWidth={1}
			/>
			<Line
				points={[
					[0, 0, 0],
					[0, limit, 0],
				]}
				lineWidth={1}
				color='#3f3838'
			/>
			<Line
				points={[
					[0, 0, 0],
					[0, 0, limit],
				]}
				lineWidth={1}
				color='#3f3838'
			/>
		</>
	)
}
