/**
 * Copyright 2018-present Facebook.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @format
 */

import {colors} from '../ui/components/colors';
import {styled} from '../ui';
import {connect} from 'react-redux';
import {State} from '../reducers';
import React, {ReactElement} from 'react';
import Text from '../ui/components/Text';

const StatusBarContainer = styled(Text)({
  backgroundColor: colors.macOSTitleBarBackgroundBlur,
  borderTop: '1px solid #b3b3b3',
  lineHeight: '26px',
  padding: '0 10px',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
});

type Props = {
  statusMessage: string | null;
};

export function statusBarView(props: Props): ReactElement | null {
  const {statusMessage} = props;
  if (statusMessage) {
    return (
      <StatusBarContainer italic={true} whiteSpace="nowrap">
        {statusMessage}
      </StatusBarContainer>
    );
  } else {
    return null;
  }
}

export default connect<Props, void, void, State>(
  ({application: {statusMessages}}) => {
    if (statusMessages.length > 0) {
      return {statusMessage: statusMessages[statusMessages.length - 1]};
    }
    return {
      statusMessage: null,
    };
  },
)(statusBarView);
