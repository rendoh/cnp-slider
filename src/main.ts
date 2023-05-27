import 'the-new-css-reset';

import img1 from './1.jpg';
import img2 from './2.jpg';
import img3 from './3.jpg';
import img4 from './4.jpg';
import { clock } from './core/clock';
import { renderer } from './core/renderer';
import { sizes } from './core/sizes';
import { Slider } from './Slider';

sizes.addEventListener('resize', resize);
clock.addEventListener('tick', update);

const slider = new Slider([img1, img2, img3, img4]);
renderer.scene.add(slider.scene);

function resize() {
  slider.resize();
  renderer.resize();
}

function update() {
  slider.update();
  renderer.update();
}
