import React, { Component, ReactNode } from "react";
import { sortBy } from "lodash";

/** description → HTML */
export type FixtureDictionary = Map<string, string>;

interface FixtureSelectorProps {
  fixtures: FixtureDictionary;
  html?: string;
  onChange?: (newHtml: string) => void;
}

interface FixtureSelectorState {
  defaultValue: string;
}

export class FixtureSelector extends Component<
  FixtureSelectorProps,
  FixtureSelectorState
> {
  changeHandler = (newValue: string) => {
    if (newValue) {
      this.props.onChange?.(newValue);
    }
  };

  render() {
    const optionList: ReactNode[] = [];
    sortBy([...this.props.fixtures.entries()], e => e[0]).forEach(
      ([description, html]) => {
        const selected = { selected: false };
        if (html === this.props.html) {
          selected.selected = true;
        }
        optionList.push(
          <option key={description} value={html} {...selected}>
            {description}
          </option>
        );
      }
    );

    return (
      <select onChange={e => this.changeHandler(e.currentTarget.value)}>
        <option value="">Select one...</option>
        {optionList}
      </select>
    );
  }
}
