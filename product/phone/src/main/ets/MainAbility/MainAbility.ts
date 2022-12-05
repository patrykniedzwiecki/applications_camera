/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Ability from '@ohos.application.Ability'
import window from '@ohos.window'
import Trace from '../../../../../../common/src/main/ets/default/utils/Trace'
import { CameraBasicFunction } from '../../../../../../common/src/main/ets/default/function/CameraBasicFunction'
import { debounce } from '../../../../../../common/src/main/ets/default/featurecommon/screenlock/Decorators'
import { PreferencesService } from '../../../../../../common/src/main/ets/default/featurecommon/preferences/PreferencesService'

const debounceTimeout = 500;

export default class MainAbility extends Ability {
  private cameraBasicFunction: any = null
  onCreate(want, launchParam) {
    // Ability is creating, initialize resources for this ability
    Trace.start(Trace.ABILITY_WHOLE_LIFE)
    console.info('Camera MainAbility onCreate.')
    globalThis.cameraAbilityContext = this.context
    globalThis.cameraAbilityWant = this.launchWant
    globalThis.permissionFlag = false
    globalThis.cameraStartTime = new Date().getTime()
    globalThis.cameraStartFlag = true
    globalThis.stopRecordingFlag = false;
    globalThis.doOnForeground = false
    this.cameraBasicFunction = CameraBasicFunction.getInstance()
    this.cameraBasicFunction.initCamera({ cameraId: 'BACK', mode: 'PHOTO' }, 'onCreate')
  }

  onDestroy() {
    // Ability is creating, release resources for this ability
    Trace.end(Trace.ABILITY_WHOLE_LIFE)
    Trace.end(Trace.APPLICATION_WHOLE_LIFE)
    this.cameraBasicFunction.startIdentification = false
    PreferencesService.getInstance().flush()
    console.info('Camera MainAbility onDestroy.')
  }

  async onWindowStageCreate(windowStage) {
    // Main window is created, set main page for this ability
    Trace.start(Trace.ABILITY_VISIBLE_LIFE)
    console.info('Camera MainAbility onWindowStageCreate.')
    windowStage.on('windowStageEvent', (event) => {
      console.info('Camera MainAbility onWindowStageEvent: ' + JSON.stringify(event))
      globalThis.cameraWindowStageEvent = event
      if (event === window.WindowStageEventType.INACTIVE) {
        globalThis.stopRecordingFlag = true
        globalThis?.stopCameraRecording && globalThis.stopCameraRecording()
      } else {
        globalThis.stopRecordingFlag = false
      }
    })

    windowStage.getMainWindow().then((win) => {
      try {
        win.setLayoutFullScreen(true).then(() => {
          console.info('Camera setFullScreen finished.')
          win.setSystemBarEnable(['navigation']).then(() => {
            console.info('Camera setSystemBarEnable finished.')
          })
        })

        win.setSystemBarProperties({
          navigationBarColor: '#00000000', navigationBarContentColor: '#B3B3B3'
        }).then(() => {
          console.info('Camera setSystemBarProperties.')
        })

        globalThis.cameraWinClass = win

      } catch (err) {
        console.error('Camera setFullScreen err: ' + err)
      }
    })

    if (this.launchWant.parameters.uri === 'capture') {
      globalThis.cameraFormParam = {
        action: 'capture',
        cameraPosition: 'PHOTO',
        mode: 'PHOTO'
      }
    } else if (this.launchWant.parameters.uri === 'video') {
      globalThis.cameraFormParam = {
        action: 'video',
        cameraPosition: 'VIDEO',
        mode: 'VIDEO'
      }
    }


    windowStage.setUIContent(this.context, 'pages/index', null)
  }

  onWindowStageDestroy() {
    Trace.end(Trace.ABILITY_VISIBLE_LIFE)
    console.info('Camera MainAbility onWindowStageDestroy.')
  }

  @debounce(debounceTimeout)
  onForeground() {
    Trace.start(Trace.ABILITY_FOREGROUND_LIFE)
    console.info('Camera MainAbility onForeground.')
    if (globalThis?.doOnForeground && globalThis.doOnForeground) {
      console.info('Camera MainAbility onForeground.')
      globalThis?.onForegroundInit && globalThis.onForegroundInit()
    } else {
      globalThis.doOnForeground = true
    }
  }

  @debounce(debounceTimeout)
  onBackground() {
    Trace.end(Trace.ABILITY_FOREGROUND_LIFE)
    console.info('Camera MainAbility onBackground.')
    this.cameraBasicFunction.startIdentification = false
    globalThis.needInitCameraFlag = false
    globalThis?.releaseCamera && globalThis.releaseCamera()
  }

  onNewWant(want) {
    console.info('Camera MainAbility onNewWant.')
    globalThis.cameraNewWant = want
  }
}