import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePackageStore } from '../store/package-store'

interface Package3DProps {
	position: [number, number, number]
	size: [number, number, number]
	color: string
	id: string
	uldId: string
	isVisible?: boolean
}

export const Package3D: React.FC<Package3DProps> = ({
	position,
	size,
	color,
	id,
	uldId,
	isVisible = true,
}) => {
	const meshRef = useRef<THREE.Mesh>(null!)
	const edgesRef = useRef<THREE.LineSegments>(null!)
	const { setSelectedCuboid } = usePackageStore()

	useFrame(() => {
		if (edgesRef.current) {
			edgesRef.current.rotation.x = meshRef.current.rotation.x
			edgesRef.current.rotation.y = meshRef.current.rotation.y
			edgesRef.current.rotation.z = meshRef.current.rotation.z
		}
	})

	const handleClick = (event: { stopPropagation: () => void }) => {
		event.stopPropagation()
		setSelectedCuboid({ id, uldId, center: position, size, color, type: 'P' })
	}

	return (
		<group position={position}>
			<mesh ref={meshRef} onClick={handleClick} visible={isVisible}>
				<boxGeometry args={size} />
				<meshStandardMaterial color={color} opacity={0.9} transparent />
			</mesh>
			<lineSegments ref={edgesRef}>
				<edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
				<lineBasicMaterial color={isVisible ? 'black' : 'gray'} />
			</lineSegments>
		</group>
	)
}
