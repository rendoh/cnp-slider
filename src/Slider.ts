import * as THREE from 'three';

import img1 from './1.jpg';
import img2 from './2.jpg';
import img3 from './3.jpg';
import img4 from './4.jpg';
import { clock } from './core/clock';
import { sizes } from './core/sizes';
import fragmentShader from './fragment.glsl';
import vertexShader from './vertex.glsl';

export class Slider {
  private mesh: THREE.Points<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  public scene = new THREE.Scene();

  constructor() {
    const images = [img1, img2, img3, img4];
    const loader = new THREE.TextureLoader();
    const textures = images.map((img) => loader.load(img));
    const geometry = new THREE.PlaneGeometry(800, 450, 800, 450);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: clock.elapsed / 1000 },
        uPixelRatio: { value: sizes.pixelRatio },
        uProgress: { value: 0 },
        uTextures: { value: textures },
      },
      vertexShader: vertexShader.replace(
        'const int LENGTH = 1;',
        `const int LENGTH = ${images.length};`,
      ),
      fragmentShader: fragmentShader
        .replace(
          'const int LENGTH = 1;',
          `const int LENGTH = ${images.length};`,
        )
        .replace(
          '#include <mix-textures>',
          images
            .map((_, i) => {
              if (i === 0) return '';
              return `
                tex = texture2D(uTextures[${i}], vUv);
                color = mix(color, tex, calcStrength(${i - 1}.));
              `;
            })
            .join(''),
        ),
    });
    this.mesh = new THREE.Points(geometry, material);
    this.scene.add(this.mesh);

    this.resize();

    document.querySelector('input')!.max = `${textures.length - 1}`;
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
