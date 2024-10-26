import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

import { useGame, GAME_STATES } from '../stores/useGame.js'
import { HUDPanel } from './HUDPanel.jsx'
import { RESOURCE } from '../common/Constants.js'

const materials = {
  text: new THREE.MeshBasicMaterial({
    toneMapped: false,
    depthTest: false
  }),

  panel: new THREE.MeshBasicMaterial({
    depthTest: false,
    color: '#000',
    transparent: true,
    opacity: 0.2
  })
}

const panel_geometry = new THREE.PlaneGeometry()

const InterfaceHeadset = ({ inner_ref = null, ...props }) => {
  const refs = {
    time: useRef()
  }

  const
    restartGame = useGame(state => state.restartGame),
    phase = useGame(state => state.phase)

  // UPDATE GAME TIMER
  useFrame(() => {
    const { phase, start_time, end_time } = useGame.getState()

    let elapsed_time = 0

    switch (phase) {
      case GAME_STATES.READY:
        refs.time.current.text = '0.00'
        return

      case GAME_STATES.PLAYING:
        elapsed_time = Date.now() - start_time
        break

      case GAME_STATES.ENDED:
        elapsed_time = end_time - start_time
        break

      case GAME_STATES.HIT_TEST:
        return
    }

    // CONVERT TO SECONDS
    elapsed_time /= 1000
    elapsed_time = elapsed_time.toFixed(2)

    // UPDATE THE TIME DISPLAY
    if (refs.time.current) {
      refs.time.current.text = elapsed_time
    }
  })

  return <group
    ref={inner_ref}
    {...props}
  >
    {/* HIT-TEST INSTRUCTIONS */}
    {
      phase === GAME_STATES.HIT_TEST &&
      <group position={[0, 0.05, 0]}>
        <HUDPanel
          width={0.33}
          height={0.14}
          material={materials.panel}
          geometry={panel_geometry}
        />

        <Text
          material={materials.text}
          font={RESOURCE.FONT_BEBAS_NEUE}
          fontSize={1}
          scale={0.018}
          maxWidth={24}
          textAlign='left'
          frustumCulled={false}
          position={[0, -0.0045, 0.01]}

          text={`1 - aim with the targeting reticle(s)
2 - choose a flat surface (floor, table, etc.)
3 - place obstacle course (controller trigger)
4 - start playing (A button)`}
        />
      </group>
    }

    {/* GAME TIMER */}
    {
      [GAME_STATES.READY, GAME_STATES.PLAYING, GAME_STATES.ENDED].includes(phase) &&
      <group position={[0, 0.12, 0]}>
        <HUDPanel
          material={materials.panel}
          geometry={panel_geometry}
        />

        <Text
          ref={refs.time}
          material={materials.text}
          font={RESOURCE.FONT_BEBAS_NEUE}
          fontSize={1}
          scale={0.06}
          textAlign='center'
          frustumCulled={false}
          position={[0, -0.0045, 0.01]}
          text='0.00'
        />
      </group>
    }

    {/* RESTART BUTTON */}
    {
      phase === GAME_STATES.ENDED &&
      <group
        position={[0, -0.05, 0]}
        onClick={restartGame}
      >
        <HUDPanel
          height={0.14}
          material={materials.panel}
          geometry={panel_geometry}
        />

        <Text
          material={materials.text}
          font={RESOURCE.FONT_BEBAS_NEUE}
          fontSize={1}
          scale={0.11}
          textAlign='center'
          frustumCulled={false}
          position={[0, -0.0045, 0.01]}
          text='RESTART'
        />
      </group>
    }
  </group>
}

export { InterfaceHeadset }