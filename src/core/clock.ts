import { TypedEventTarget } from 'typescript-event-target';

type ClockEventMap = {
  tick: CustomEvent<Clock>;
};

class Clock extends TypedEventTarget<ClockEventMap> {
  public elapsed = 0;
  public delta = 16;
  private id?: number;

  constructor() {
    super();
    requestAnimationFrame((time) => {
      this.tick(time);
    });
  }

  private tick(time: number) {
    this.delta = time - this.elapsed;
    this.elapsed = time;
    this.dispatchTypedEvent('tick', new CustomEvent('tick', { detail: this }));

    this.id = requestAnimationFrame((time) => {
      this.tick(time);
    });
  }

  public dispose() {
    if (this.id != null) {
      cancelAnimationFrame(this.id);
    }
  }
}

export const clock = new Clock();
