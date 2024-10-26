import { useCallback, useRef } from 'react'
import * as THREE from 'three'
import { useXRInputSourceEvent, useXRInputSourceState, useXRStore } from '@react-three/xr'

import { Reticle } from '../components/Reticle'
import { HANDEDNESS } from '../common/HitTest'
import { GAME_STATES, useGame } from '../stores/useGame'
import { useFrame } from '@react-three/fiber'

const HitTestHeadset = ({ hitTestSuccess, ref_game_board }) => {
  const refs = {
    left_reticle: useRef(),
    right_reticle: useRef()
  }

  const phase = useGame(state => state.phase)
  const xr_store = useXRStore()
  const controller_right = useXRInputSourceState('controller', 'right')

  // TEST IF HIT-TEST SURFACE IS FLAT AND NOT TOO HIGH
  // - EX. FLOOR, BED, TABLE, ETC., BUT NOT ON THE WALLS OR CEILING
  const validateSurface = useCallback(ref_reticle => {
    if (ref_reticle.current) {

      // TEST TARGET RETICLE ISN'T TOO HIGH
      // - COMMENT: VALUE OF ~73 EQUATES RETURNED FOR 8' CEILING (UNSURE OF UNITS)
      if (ref_reticle.current.position.y < 50) {
        const direction = new THREE.Vector3()

        ref_reticle.current.getWorldDirection(direction)
        direction.normalize()

        // TEST IF SURFACE IS PRETTY FLAT USING DOT-PRODUCT
        const dot_product = Math.abs(direction.dot(THREE.Object3D.DEFAULT_UP))

        if (dot_product < 0.05) {
          return ref_reticle.current.position.clone()
        }
      }
    }

    return null
  }, [])

  useXRInputSourceEvent(
    'all',
    'select',

    e => {
      if (phase === GAME_STATES.HIT_TEST) {
        const result = validateSurface(
          e.inputSource.handedness === HANDEDNESS.LEFT
            ? refs.left_reticle
            : refs.right_reticle
        )

        if (hitTestSuccess && result) {
          hitTestSuccess(result.toArray())
        }
      }
    },

    [phase]
  )

  useFrame(() => {
    // CHECK IF OBSTACLE COURSE PLACED USING WEBXR HIT-TEST (BOARD BECOMES VISIBLE)
    if (phase !== GAME_STATES.HIT_TEST || !ref_game_board || !ref_game_board.current) return

    const a_button = controller_right?.gamepad?.['a-button']

    if (ref_game_board.current.visible && a_button?.state === 'pressed') {
      xr_store.setController()
      xr_store.setHand()

      useGame.setState({ phase: GAME_STATES.READY })
    }
  })

  return phase === GAME_STATES.HIT_TEST
    ? <>
      <Reticle handedness={HANDEDNESS.RIGHT} ref_reticle={refs.right_reticle} scale={[30, 30, 30]} />
      <Reticle handedness={HANDEDNESS.LEFT} ref_reticle={refs.left_reticle} scale={[30, 30, 30]} />
    </>
    : null
}

export { HitTestHeadset }