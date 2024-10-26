import { useCallback, useEffect, useRef } from 'react'
import { addEffect } from '@react-three/fiber'
import { Joystick } from 'react-joystick-component'

import { useGame, GAME_STATES } from '../stores/useGame.js'
import { useControls } from '../stores/useControls.js'
import { RESOURCE, XR_MODE } from '../common/Constants.js'

/** SOME DESIGN NOTES
 *
 * - ORIGINAL LESSON USED DOM OVERLAY ELEMENTS (COUNTDOWN TIMER AND RESTART)
 *
 * - EXISTING OPEN-SOURCE JOYSTICK LIBS (react-joystick-component, nipple.js) ALSO USE DOM
 *
 * - ORIGINAL GOAL WAS TO RE-USE THIS COMPONENT'S DOM OVERLAY + LOGIC FOR MOBILE (NON-XR) AND MOBILE+AR (XR) MODES
 *   - ISSUES ARISE DUE TO THE NATURE OF REACT + REACT-THREE/XR COMPARED TO VANILLA THREE.JS + WEBXR
 *   - SEPARATE XR AND NON-XR DOM OVERLAY COMPONENTS MIGHT BE A BETTER SOLUTION
 *     (REPLACING THE DOM OVERLAY ALTOGETHER WITH PURE THREE.JS ELEMENTS WOULD PROBABLY BE AN EVEN BETTER SOLUTION)
 */
const InterfaceMobile = ({ store = null, xr_overlay = false }) => {
  const xr_mode = store ? store.getState().visibilityState : null

  const refs = {
    time: useRef(),
    fullscreen: useRef()
  }

  const
    restartGame = useGame(state => state.restartGame),
    phase = useGame(state => state.phase)

  const
    setPosition = useControls(state => state.setPosition),
    setJump = useControls(state => state.setJump)

  const
    joystickMove = useCallback(data => {
      setPosition(data.x, data.y)
    }, []),

    joystickStop = useCallback(() => {
      setPosition(0, 0)
    }, []),

    // NOTE: TOGGLING TRUE => FALSE IS REQUIRED TO TRIGGER ZUSTAND "JUMP" SUBSCRIPTION
    jump = useCallback(() => {
      setJump(true)
      setTimeout(() => setJump(false), 200)
    }, []),

    fullscreenToggle = useCallback(() => {
      if (document.fullscreenElement) {
        refs.fullscreen.current.src = RESOURCE.ICON_FULLSCREEN
        document.exitFullscreen()
      }
      else {
        refs.fullscreen.current.src = RESOURCE.ICON_FULLSCREEN_EXIT
        document.documentElement.requestFullscreen()
      }
    }, []),

    xrModeToggle = () => xr_mode
      ? store.getState().session.end()
      : store.enterAR()

  // UPDATE GAME TIMER
  useEffect(() => {

    // 'addEffect' ALLOWS ADDING A CALLBACK EXECUTED EACH FRAME OUTSIDE THE <Canvas> COMPONENT
    const cleanupEffect = addEffect(() => {
      const { phase, start_time, end_time } = useGame.getState()

      let elapsed_time = 0

      switch (phase) {
        case GAME_STATES.READY:
          refs.time.current.textContent = '0.00'
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
        refs.time.current.textContent = elapsed_time
      }
    })

    return () => {
      cleanupEffect()
    }
  }, [])

  return <div id='interface' >

    {/* QUICK SETTINGS */}
    <div id='quick-settings'>
      {
        navigator?.xr.isSessionSupported(XR_MODE.AR) &&
        <div id='xr_mode'>
          <img
            src={RESOURCE.ICON_XR_MODE}
            className='animate-scale'
            onClick={xrModeToggle}
          />
        </div>
      }

      {
        document.fullscreenEnabled && !xr_overlay &&
        <div id='fullscreen'>
          <img
            ref={refs.fullscreen}
            src={RESOURCE.ICON_FULLSCREEN}
            className='animate-scale'
            onClick={fullscreenToggle}
          />
        </div>
      }
    </div>

    {/* GAME TIMER */}
    {
      [GAME_STATES.READY, GAME_STATES.PLAYING, GAME_STATES.ENDED].includes(phase) &&
      <div
        ref={refs.time}
        className='time'
      >
        0.00
      </div>
    }

    {/* RESTART BUTTON */}
    {
      phase === GAME_STATES.ENDED &&
      <div
        className='restart'
        onClick={restartGame}
        onTouchStart={e => e.stopPropagation()}
      >
        Restart
      </div>
    }

    {/*
      CONTROLS: VIRTUAL JOYSTICK + JUMP
      - e.stopPropagation() PREVENTS TOUCHING THE JOYSTICK AND TRIGGERING JUMP
    */}
    {
      [GAME_STATES.READY, GAME_STATES.PLAYING, GAME_STATES.ENDED].includes(phase) &&
      <div
        id='touch-controls-container'
        onTouchStart={jump}
      >
        <div
          id='touch-joystick'
          onTouchStart={e => e.stopPropagation()}
        >
          <Joystick
            baseColor={'#00000000'}
            stickColor={'#ececec'}
            size={120}
            stickSize={80}
            throttle={100}

            move={joystickMove}
            stop={joystickStop}
          />
        </div>
      </div>
    }
  </div>
}

export { InterfaceMobile }