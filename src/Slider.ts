import * as THREE from 'three';

import img1 from './1.jpg';
import img2 from './2.jpg';
import { clock } from './core/clock';
import { sizes } from './core/sizes';
import fragmentShader from './fragment.glsl';
import vertexShader from './vertex.glsl';

export class Slider {
  private mesh: THREE.Points<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  public scene = new THREE.Scene();

  constructor() {
    const loader = new THREE.TextureLoader();
    const geometry = new THREE.PlaneGeometry(800, 450, 800, 450);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: clock.elapsed / 1000 },
        uPixelRatio: { value: sizes.pixelRatio },
        uTexture1: { value: loader.load(img1) },
        uTexture2: { value: loader.load(img2) },
        uProgress: { value: 0 },
      },
      vertexShader,
      fragmentShader,
    });
    this.mesh = new THREE.Points(geometry, material);
    this.scene.add(this.mesh);

    this.resize();

    document.querySelector('input')?.addEventListener('input', (e) => {
      const progress = (e.target as HTMLInputElement).valueAsNumber;
      this.mesh.material.uniforms.uProgress.value = progress;
    });
  }

  public update() {
    const { uniforms } = this.mesh.material;
    uniforms.uTime.value = clock.elapsed / 1000;
  }

  public resize() {
    const scale = this.scale;
    this.mesh.scale.setScalar(scale);
    this.mesh.material.uniforms.uPixelRatio.value = sizes.pixelRatio;
  }

  private get scale() {
    return Math.min(sizes.width, 1280) / 1280;
  }
}
