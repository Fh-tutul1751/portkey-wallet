import React, { ReactNode, useCallback } from 'react';
import { Fallback, IErrorBoundary } from 'components/Fallback';
import { exceptionManager } from 'utils/errorHandler/ExceptionHandler';
import { Severity } from '@portkey-wallet/utils/ExceptionManager';
import ReactErrorBoundary from '@portkey-wallet/utils/errorBoundary';
import * as errorUtils from 'utils/errorUtils';
export type ErrorBoundaryProps = {
  children: ReactNode;
  view: string;
};

class ReactNativeErrorBoundary extends ReactErrorBoundary {
  componentDidMount() {
    const originHandler = errorUtils.getGlobalHandler();
    errorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
      if (isFatal && !__DEV__) {
        const componentStack = error.stack;
        this.setState({ hasError: true, error, componentStack });
        this.props.onError?.(error, componentStack);
        return;
      }
      originHandler?.(error, isFatal);
    });
  }
}

export default function ErrorBoundary({ children, view }: ErrorBoundaryProps) {
  const onCaptureException = useCallback(
    ({ error, componentStack }: IErrorBoundary) => {
      const message = error.toString();
      const sendError = new Error(message);
      sendError.stack = componentStack || '';
      sendError.name = `Message:${message}, View:${view}`;
      exceptionManager.reportError(sendError, Severity.Error);
    },
    [view],
  );
  return (
    <ReactNativeErrorBoundary
      onError={(error, componentStack) => onCaptureException({ error, componentStack })}
      fallback={errorData => <Fallback {...errorData} />}>
      {children}
    </ReactNativeErrorBoundary>
  );
}
