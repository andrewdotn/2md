import React, { Component, ErrorInfo } from "react";

interface ErrorBoundaryState {
  error?: Error;
  errorString?: string;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<{}, ErrorBoundaryState> {
  state: ErrorBoundaryState = {};

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const newState: ErrorBoundaryState = {
      error,
      errorInfo,
      errorString: error.toString(),
    };

    const stack = errorInfo.componentStack;
    if (stack && error.toString().includes(stack)) {
      newState.errorString = newState.errorString!.replace(stack, "");
    }
    this.setState(newState);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="react-error">
          <h1 className="react-error__heading">
            Oops. There’s a problem with the demo.
          </h1>
          <h4 className="react-error__error">{this.state.errorString}</h4>
          {this.state.errorInfo && (
            <div className="react-error__stack">
              {this.state.errorInfo.componentStack}
            </div>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
