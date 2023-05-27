import * as THREE from 'three';

import { clock } from './core/clock';
import { renderer } from './core/renderer';
import { sizes } from './core/sizes';
import fragmentShader from './fragment.glsl';
import vertexShader from './vertex.glsl';

export function lerp(x: number, y: number, p: number) {
  return x + (y - x) * p;
}

// export function wrap(min: number, max: number, value: number) {
//   const range = max - min;
//   return ((range + ((value - min) % range)) % range) + min;
// }

export function clamp(value: number, min: number, max: number) {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  }
  return value;
}

function beta(p: number, delta: number) {
  return 1 - Math.pow(1 - p, 60 * (delta / 1000));
}

export class Slider {
  private mesh: THREE.Points<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  public scene = new THREE.Scene();
  private abortController = new AbortController();
  private progress = 0;
  private isDragging = false;

  constructor(private images: string[]) {
    const loader = new THREE.TextureLoader();
    const textures = images.map((img) => loader.load(img));
    const geometry = new THREE.PlaneGeometry(800, 450, 800, 450);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: clock.elapsed / 1000 },
        uPixelRatio: { value: sizes.pixelRatio },
        uProgress: { value: this.progress },
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
    this.initDnD();
  }

  private initDnD() {
    let start = 0;
    renderer.renderer.domElement.addEventListener(
      'mousedown',
      (e) => {
        this.isDragging = true;
        start = e.clientX;
        document.body.style.cursor = 'grabbing';
      },
      {
        signal: this.abortController.signal,
      },
    );
    renderer.renderer.domElement.addEventListener(
      'mousemove',
      (e) => {
        if (!this.isDragging) return;
        const delta = ((e.clientX - start) / sizes.width) * 1.5;
        start = e.clientX;
        this.progress -= delta;
      },
      {
        signal: this.abortController.signal,
      },
    );
    renderer.renderer.domElement.addEventListener(
      'mouseup',
      () => {
        this.isDragging = false;
        document.body.style.removeProperty('cursor');
      },
      {
        signal: this.abortController.signal,
      },
    );
  }

  public dispose() {
    this.abortController.abort();
  }

  public update() {
    const { uniforms } = this.mesh.material;
    uniforms.uTime.value = clock.elapsed / 1000;
    uniforms.uProgress.value = clamp(this.progress, 0, this.images.length - 1);

    if (this.progress < 0) {
      this.mesh.position.z = this.progress * 100;
    } else if (this.progress > this.images.length - 1) {
      this.mesh.position.z = (this.images.length - 1 - this.progress) * 100;
    }

    if (!this.isDragging) {
      const p = clamp(Math.round(this.progress), 0, this.images.length - 1);
      this.progress = lerp(this.progress, p, beta(0.1, clock.delta));
    }
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
