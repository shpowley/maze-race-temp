const HUDPanel = ({ width = 1.0, height = 0.07, material = null, geometry = null }) => {
  if (!material || !geometry) return null

  return <mesh
    position={[0, 0, 0]}
    material={material}
    geometry={geometry}
    scale={[width, height, 1]}
  />
}

export { HUDPanel }