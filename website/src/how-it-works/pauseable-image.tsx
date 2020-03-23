import "./pauseable-image.css";

import React, { SyntheticEvent } from "react";

interface PauseableImageProps {
  src: string;
  className?: string;
}
interface PauseableImageState {
  paused: boolean;
}

/**
 * A component for displaying animated gifs while allowing them to be paused and
 * resuming by clicking/tapping on them.
 *
 * On Chrome the initial frame is shown during rendering; on Safari, the
 * animation frame that was visible when pausing is shown.
 */
export class PauseableImage extends React.Component<
  PauseableImageProps,
  PauseableImageState
> {
  state = { paused: false };

  img?: HTMLImageElement | null;
  canvas?: HTMLCanvasElement | null;

  setCanvas = (e: HTMLCanvasElement) => {
    this.canvas = e;
  };

  handleImgLoad = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    this.img = e.currentTarget;
  };

  /**
   * Render the <img> onto the <canvas> and return true. Return false if
   * references are missing or the a drawing context can’t be acquired.
   */
  renderCanvasIfReady = () => {
    if (!this.img || !this.canvas) {
      return false;
    }

    const w = this.img.width;
    const h = this.img.height;

    this.canvas.width = w;
    this.canvas.height = h;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      return false;
    }

    // specifying the width and height again prevents zoom when pausing on
    // retina screens; haven’t tried with a high-DPI source image.
    ctx.drawImage(this.img, 0, 0, w, h);

    ctx.font = `${Math.floor(h / 4)}px sans-serif`;
    const msg = "paused";
    const measure = ctx.measureText(msg);
    const measureHeight =
      measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;
    ctx.fillStyle = "white";
    const verticalPadding = 2;
    ctx.fillRect(
      w / 2 - measure.width / 2,
      h / 2 - measureHeight / 2 - verticalPadding,
      measure.width,
      measureHeight + 2 * verticalPadding
    );
    ctx.fillStyle = "darkgray";
    ctx.fillText(
      msg,
      w / 2 - measure.width / 2,
      h / 2 - measureHeight / 2 + measure.actualBoundingBoxAscent
    );

    return true;
  };

  handleClick = () => {
    this.setState(({ paused }) => {
      if (paused) {
        return { paused: false };
      }
      if (!paused && this.renderCanvasIfReady()) {
        return { paused: !paused };
      }
      // If the image didn’t load, don’t do anything.
      return { paused };
    });
  };

  render() {
    return (
      <div onClick={this.handleClick}>
        <canvas
          className={`pauseable-image__canvas ${this.props.className}`}
          hidden={!this.state.paused}
          ref={this.setCanvas}
        />
        <img
          className={this.props.className}
          hidden={this.state.paused}
          onLoad={this.handleImgLoad}
          src={this.props.src}
        />
      </div>
    );
  }
}
