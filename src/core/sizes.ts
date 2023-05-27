import { TypedEventTarget } from 'typescript-event-target';

type SizesEventMap = {
  resize: CustomEvent<Sizes>;
};

class Sizes extends TypedEventTarget<SizesEventMap> {
  public width = window.innerWidth;
  public height = window.innerHeight;
  public pixelRatio = Math.min(window.devicePixelRatio, 2);
  private abortController = new AbortController();
  constructor() {
    super();
    window.addEventListener('resize', this.update.bind(this), {
      signal: this.abortController.signal,
    });
  }

  private update() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.dispatchTypedEvent(
      'resize',
      new CustomEvent('resize', { detail: this }),
    );
  }

  public dispose() {
    this.abortController.abort();
  }
}

export const sizes = new Sizes();
