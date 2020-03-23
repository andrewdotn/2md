import React, { Component, ReactNode } from "react";

/** description → HTML */
export type FixtureDictionary = Map<string, string>;

interface FixtureSelectorProps {
  fixtures: FixtureDictionary;
  onChange?: (newHtml: string) => void;
}

export class FixtureSelector extends Component<FixtureSelectorProps> {
  changeHandler = (newValue: string) => {
    if (newValue) {
      this.props.onChange?.(newValue);
    }
  };

  render() {
    const optionList: ReactNode[] = [];
    this.props.fixtures.forEach((html, description) =>
      optionList.push(
        <option key={description} value={html}>
          {description}
        </option>
      )
    );

    return (
      <select onChange={e => this.changeHandler(e.currentTarget.value)}>
        <option value="">Select one...</option>
        {optionList}
      </select>
    );
  }
}
