/**
 * Copyright 2018-present Facebook.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @format
 */
import {reportPlatformFailures} from './metrics';
import {promisify} from 'util';
import child_process from 'child_process';
import promiseRetry from 'promise-retry';
import adbConfig from '../utils/adbConfig';
import adbkit, {Client} from 'adbkit';

const MAX_RETRIES = 5;
let instance: Promise<Client>;

export function getAdbClient(): Promise<Client> {
  if (!instance) {
    instance = reportPlatformFailures(createClient(), 'createADBClient');
  }
  return instance;
}

/* Adbkit will attempt to start the adb server if it's not already running,
   however, it sometimes fails with ENOENT errors. So instead, we start it
   manually before requesting a client. */
function createClient(): Promise<Client> {
  const adbPath = process.env.ANDROID_HOME
    ? `${process.env.ANDROID_HOME}/platform-tools/adb`
    : 'adb';
  return reportPlatformFailures<Client>(
    promisify(child_process.exec)(`${adbPath} start-server`).then(() =>
      adbkit.createClient(adbConfig()),
    ),
    'createADBClient.shell',
  ).catch(err => {
    console.error(
      'Failed to create adb client using shell adb command. Trying with adbkit.\n' +
        err.toString(),
    );

    /* In the event that starting adb with the above method fails, fallback
         to using adbkit, though its known to be unreliable. */
    const unsafeClient: Client = adbkit.createClient(adbConfig());
    return reportPlatformFailures<Client>(
      promiseRetry<Client>(
        (retry, attempt): Promise<Client> => {
          return unsafeClient
            .listDevices()
            .then(() => {
              return unsafeClient;
            })
            .catch((e: Error) => {
              console.warn(
                `Failed to start adb client. Retrying. ${e.message}`,
              );
              if (attempt <= MAX_RETRIES) {
                retry(e);
              }
              throw e;
            });
        },
        {
          minTimeout: 200,
          retries: MAX_RETRIES,
        },
      ),
      'createADBClient.adbkit',
    );
  });
}
