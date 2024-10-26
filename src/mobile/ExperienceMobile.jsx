import { useEffect, useRef, useState } from 'react'
import { Physics } from '@react-three/rapier'
import { IfInSessionMode, useXRSessionVisibilityState, useXRStore, XRDomOverlay, XROrigin } from '@react-three/xr'

import { Lights } from '../Lights.jsx'
import { Level } from '../Level.jsx'
import { PlayerMobile } from './PlayerMobile.jsx'
import { InterfaceMobile } from './InterfaceMobile.jsx'
import { GAME_STATES, useGame } from '../stores/useGame.js'
import { XR_MODE } from '../common/Constants.js'
import { HitTestMobile } from './HitTestMobile.jsx'

const BOARD = {
  POSITION_DEFAULT: [0, 0, 0],
  ROTATION_DEFAULT: [0, 0, 0]
}

const ExperienceMobile = () => {
  const refs = {
    game_board: useRef()
  }

  const
    [board_position, setBoardPosition] = useState(BOARD.POSITION_DEFAULT),
    [board_rotation, setBoardRotation] = useState(BOARD.ROTATION_DEFAULT)

  const
    block_count = useGame(state => state.block_count),
    block_seed = useGame(state => state.block_seed)

  const xr_visibility = useXRSessionVisibilityState()
  const xr_store = useXRStore()

  useEffect(() => {

    // XR MODE (AR ONLY)
    if (xr_visibility) {
      useGame.setState({ phase: GAME_STATES.HIT_TEST })

      if (refs.game_board.current) {
        refs.game_board.current.visible = false
      }
    }

    // NON-XR MODE
    else {
      const game_phase = useGame.getState().phase

      if (game_phase === GAME_STATES.HIT_TEST) {
        useGame.setState({ phase: GAME_STATES.READY })
      }

      setBoardPosition(BOARD.POSITION_DEFAULT)
      setBoardRotation(BOARD.ROTATION_DEFAULT)

      if (refs.game_board.current) {
        refs.game_board.current.visible = true
      }
    }
  }, [xr_visibility])

  return <>
    <color
      attach="background"
      args={['#bdedfc']}
    />

    <XROrigin
      position={[0, -5, 8]}
      scale={10.0}
    />

    <IfInSessionMode allow={XR_MODE.AR}>
      <HitTestMobile />

      <XRDomOverlay>
        <InterfaceMobile
          store={xr_store}
          xr_overlay={true}
        />
      </XRDomOverlay>
    </IfInSessionMode>

    <group
      ref={refs.game_board}
      position={board_position}
      rotation={board_rotation}
    >
      <Physics debug={false} >
        <Lights shadows={!xr_visibility} />

        <Level
          count={block_count}
          seed={block_seed}
        />

        <PlayerMobile />
      </Physics>
    </group>
  </>
}

export { ExperienceMobile }