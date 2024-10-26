import { useCallback, useEffect, } from 'react'
import * as THREE from 'three'

import { ReticleMesh } from './ReticleMesh'
import { useHitTest } from '../stores/useHitTest'
import { HANDEDNESS } from '../common/HitTest'

/** RETICLE MESH + LOGIC
 * - VISIBILITY / POSITION / ROTATION BASED ON XR "HIT-TEST" SUBSCRIPTION
 * - "handedness" ALLOWS FOR TRACKING 'left' OR 'right' CONTROLLER / HAND
 *
 * - HEADSET: THERE SHOULD BE 2 RETICLES ('left' AND 'right')
 * - HANDHELD (ANDROID): THERE IS ONLY ONE RETICLE ('screen')
 */
const helpers = {
  vec3: new THREE.Vector3()
}

const Reticle = ({ ref_reticle, handedness, ...props }) => {
  const updateReticle = useCallback(hit_test_mat4 => {
    if (ref_reticle.current) {
      let reticle_is_valid = false

      if (hit_test_mat4) {

        // .decompose() MOVES AND ROTATES THE RETICLE MESH
        hit_test_mat4.decompose(
          ref_reticle.current.position,
          ref_reticle.current.quaternion,

          ref_reticle.current.scale

          // IGNORES THE .decompose() SCALE ..REALLY ONLY NEEDS TO BE DONE ONCE, MAYBE ELSEWHERE
          // helpers.vec3
        )

        console.log("RETICLE POSITION", ref_reticle.current.position)
        console.log("RETICLE SCALE", ref_reticle.current.scale)

        reticle_is_valid = true
      }

      ref_reticle.current.visible = reticle_is_valid
    }
  }, [])

  useEffect(() => {
    const cleanupHitTest = useHitTest.subscribe(
      state => updateReticle(
        handedness === HANDEDNESS.LEFT
          ? state.hit_test_left
          : state.hit_test_right
      )
    )

    return () => {
      cleanupHitTest()
    }
  }, [])

  return <ReticleMesh
    inner_ref={ref_reticle}
    visible={false}
    {...props}
  />
}

export { Reticle }