import { useEffect, useRef } from 'react'
import { useXRHitTest, useXRInputSourceEvent, useXRStore } from '@react-three/xr'

import { HANDEDNESS, onResults } from '../common/HitTest'
import { GAME_STATES, useGame } from '../stores/useGame'
import { Reticle } from '../components/Reticle'

const HitTestActive = () => {
  const refs = {
    reticle: useRef()
  }

  const xr_store = useXRStore()

  // SETS UP MOBILE DEVICE CONTINUOUS HIT-TESTING
  // - store.setScreen() METHOD REQUIRES TOUCHING THE SCREEN TO TRIGGER HIT-TEST..
  useXRHitTest(onResults.bind(null, HANDEDNESS.SCREEN), 'viewer')

  useXRInputSourceEvent(
    'all',
    'select',

    e => {
      console.log("HIT-TEST > RETICLE", refs.reticle?.current.position)
    },

    []
  )

  useEffect(() => {
    console.log("HitTestMobile - MOUNT")

    return () => {
      console.log("HitTestMobile - UNMOUNT")
      xr_store?.setScreenInput(false)
    }
  }, [])

  /**
   * STOPPED HERE
   * (1)
   * - HitTestMobile.jsx, HitTestHeadset.jsx
   * - Reticle scale shrinks in proportion to <XROrigin> scale, and has to be scaled back up..
   * - also, I believe <XROrigin> scale + ANDROID hit-test +position+ is affected, (tested <XROrigin> scale = 1, and hit-test now works ok)
   *
   * (2)
   * - interfaceMobile.jsx jump - I think this needs a "is_jumping" flag, like PlayerHeadset.jsx
   */

  return <Reticle
    handedness={HANDEDNESS.SCREEN}
    ref_reticle={refs.reticle}
  />
}

const HitTestMobile = () => {
  const phase = useGame(state => state.phase)

  return phase === GAME_STATES.HIT_TEST
    ? <HitTestActive />
    : null
}

export { HitTestMobile }