/**
 * Copyright 2018-present Facebook.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @format
 */

import {Component} from 'react';

export type FeedbackPrompt = {
  preSubmitHeading: string;
  postSubmitHeading: string;
  commentPlaceholder: string;
  bodyText: string;
  predefinedComments: Array<string>;
  shouldPopup: boolean;
};

export async function submitRating(rating: number): Promise<void> {
  throw new Error('Method not implemented.');
}
export async function submitComment(
  rating: number,
  comment: string,
  selectedPredefinedComments: string[],
  allowUserInfoSharing: boolean,
): Promise<void> {
  throw new Error('Method not implemented.');
}
export async function dismiss(): Promise<void> {
  throw new Error('Method not implemented.');
}
export async function getPrompt(): Promise<FeedbackPrompt> {
  throw new Error('Method not implemented.');
}
