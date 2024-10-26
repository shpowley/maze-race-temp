import { Matrix4 } from 'three'
import { useXRInputSourceStateContext, XRHitTest } from '@react-three/xr'

import { useHitTest } from '../stores/useHitTest'

const HANDEDNESS = {
  LEFT: 'left',
  RIGHT: 'right',
  SCREEN: 'none'
}

const helper_mat4 = new Matrix4()

// HIT-TEST RESULT STORED IN ZUSTAND STORE
function onResults(handedness, results, getWorldMatrix) {
  if (results && results.length > 0 && results[0]) {
    getWorldMatrix(helper_mat4, results[0])

    // LEFT
    if (handedness === HANDEDNESS.LEFT) {
      useHitTest.setState({ hit_test_left: helper_mat4.clone() })
    }

    // RIGHT || SCREEN
    else {
      useHitTest.setState({ hit_test_right: helper_mat4.clone() })
    }
  }
}

// CONTINUOUS HIT-TEST CONFIG (HEADSET)
const HitTestConfigHeadset = () => {
  const state = useXRInputSourceStateContext()

  return <XRHitTest
    space={state.inputSource.targetRaySpace}
    onResults={onResults.bind(null, state.inputSource.handedness)}
  />
}

export { HANDEDNESS, onResults, HitTestConfigHeadset }