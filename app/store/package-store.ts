import { create } from 'zustand'
import packagesData from '../../public/packages.json'

export interface Cuboid {
  id: string
  uldId: string | null // update the type to reflect that uldId can be null
  center: [number, number, number]
  size: [number, number, number]
  color: string
  type: 'P' | 'E'
}

interface PackageStore {
  cuboids: Cuboid[]
  selectedCuboid: Cuboid | null
  selectedULD: string | null
  setSelectedCuboid: (cuboid: Cuboid | null) => void
  setSelectedULD: (uldId: string | null) => void
}

const getColorByType = (type: 'P' | 'E') => {
  return type === 'P' ? '#f97316' : '#8b5cf6'
}

export const usePackageStore = create<PackageStore>((set) => ({
  cuboids: packagesData.map((pkg) => {
    const center: [number, number, number] = [
      (pkg.x1 + pkg.x2) / 2, 
      (pkg.y1 + pkg.y2) / 2, 
      (pkg.z1 + pkg.z2) / 2
    ]
    
    const size: [number, number, number] = [
      Math.abs(pkg.x2 - pkg.x1),
      Math.abs(pkg.y2 - pkg.y1),
      Math.abs(pkg.z2 - pkg.z1)
    ]
    
    return {
      id: pkg['Package Id'],
      uldId: pkg['ULD Id'],
      center,
      size,
      color: getColorByType(pkg.Type as 'P' | 'E'),
      type: pkg.Type as 'P' | 'E',
    }
  }),
  selectedCuboid: null,
  selectedULD: null,
  setSelectedCuboid: (cuboid) => set({ selectedCuboid: cuboid }),
  setSelectedULD: (uldId) => set({ selectedULD: uldId }),
}))
