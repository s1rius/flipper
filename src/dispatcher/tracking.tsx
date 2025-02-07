/**
 * Copyright 2018-present Facebook.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @format
 */

import {ipcRenderer} from 'electron';
import {performance} from 'perf_hooks';

import {Store} from '../reducers/index';
import {Logger} from '../fb-interfaces/Logger';
import Client from '../Client';

export default (store: Store, logger: Logger) => {
  let droppedFrames: number = 0;
  let largeFrameDrops: number = 0;
  function droppedFrameDetection(
    past: DOMHighResTimeStamp,
    isWindowFocused: () => boolean,
  ) {
    const now = performance.now();
    requestAnimationFrame(() => droppedFrameDetection(now, isWindowFocused));
    const dropped = Math.round((now - past) / (1000 / 60) - 1);
    if (!isWindowFocused() || dropped < 1) {
      return;
    }
    droppedFrames += dropped;
    if (dropped > 3) {
      largeFrameDrops++;
    }
  }

  if (typeof window !== 'undefined') {
    droppedFrameDetection(
      performance.now(),
      () => store.getState().application.windowIsFocused,
    );
  }

  ipcRenderer.on('trackUsage', () => {
    const {
      selectedDevice,
      selectedPlugin,
      selectedApp,
      clients,
    } = store.getState().connections;

    const {flipperRating} = store.getState().application;

    if (!selectedDevice || !selectedPlugin) {
      return;
    }

    let app: string | null = null;
    let sdkVersion: number | null = null;

    if (selectedApp) {
      const client = clients.find((c: Client) => c.id === selectedApp);
      if (client) {
        app = client.query.app;
        sdkVersion = client.query.sdk_version || 0;
      }
    }

    const info = {
      droppedFrames,
      largeFrameDrops,
      os: selectedDevice.os,
      device: selectedDevice.title,
      plugin: selectedPlugin,
      app,
      sdkVersion,
      flipperRating,
    };

    // reset dropped frames counter
    droppedFrames = 0;
    largeFrameDrops = 0;

    logger.track('usage', 'ping', info);
  });
};
