import React, { Component } from "react";

interface ContentEditableProps {
  value?: string;
  className?: string;
  onInput?: (newValue: string, domElement?: Element) => void;
}

interface ContentEditableState {
  lastNewValue?: string;
}

export class ContentEditable extends Component<
  ContentEditableProps,
  ContentEditableState
> {
  state = { lastNewValue: undefined };

  div?: HTMLDivElement | null;

  handleInput = () => {
    const newValue = this.div?.innerHTML ?? "";
    this.props.onInput?.(newValue, this.div ?? undefined);
    this.setState({ lastNewValue: newValue });
  };

  componentDidMount() {
    if (this.div) {
      this.div.contentEditable = "true";
      this.div.innerHTML = this.props.value ?? "";
    }
  }

  componentDidUpdate(
    prevProps: Readonly<ContentEditableProps>,
    prevState: Readonly<ContentEditableState>
  ): void {
    if (!this.div) {
      return;
    }

    // Don’t replace innerHTML if the change is being trigger by this
    // component’s own input handler, as that will lose the caret position.
    if (this.props.value !== this.state.lastNewValue) {
      this.div.innerHTML = this.props.value ?? "";
    }
  }

  render() {
    return (
      <div
        className={this.props.className}
        onInput={this.handleInput}
        ref={e => (this.div = e)}
      />
    );
  }
}
