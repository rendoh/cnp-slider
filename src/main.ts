import 'the-new-css-reset';

import { clock } from './core/clock';
import { renderer } from './core/renderer';
import { sizes } from './core/sizes';
import { Slider } from './Slider';

sizes.addEventListener('resize', resize);
clock.addEventListener('tick', update);

const slider = new Slider();
renderer.scene.add(slider.scene);

function resize() {
  slider.resize();
  renderer.resize();
}

function update() {
  slider.update();
  renderer.update();
}
