import React, { Component } from "react";
import { Fixture } from "../gen-fixtures";

/** description → HTML */
export type FixtureDictionary = Map<string, Fixture>;

interface FixtureSelectorProps {
  fixtures: FixtureDictionary;
  onChange?: (newFixture: Fixture) => void;
  defaultValue?: Fixture;
}

function attribution(selection?: Fixture) {
  if (!selection || !("author" in selection)) {
    return;
  }

  return (
    <>
      (<a href={selection.sourceUrl}>excerpt</a> by{" "}
      <a href={selection.authorUrl}>{selection.author}</a>,{" "}
      {selection.licenseName})
    </>
  );
}

export class FixtureSelector extends Component<FixtureSelectorProps> {
  setFixture = (fixtureTitle: string) => {
    const selected = this.props.fixtures.get(fixtureTitle);
    if (!selected) {
      return;
    }
    this.props.onChange?.(selected);
  };

  render() {
    return (
      <>
        <select
          value={this.props.defaultValue?.title ?? ""}
          onChange={e => this.setFixture(e.currentTarget.value)}
        >
          <option value="">Select one...</option>
          {[...this.props.fixtures.values()].map(fixture => (
            <option key={fixture.title} value={fixture.title}>
              {fixture.title}
            </option>
          ))}
        </select>
        {attribution(this.props.defaultValue)}
      </>
    );
  }
}
