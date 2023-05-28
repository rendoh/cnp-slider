import GUI from 'lil-gui';
import * as THREE from 'three';

import { clock } from './core/clock';
import { renderer } from './core/renderer';
import { sizes } from './core/sizes';
import fragmentShader from './fragment.glsl';
import vertexShader from './vertex.glsl';

const gui = new GUI();
const config = {
  distortionRange: 0.5,
  distortionStrength: 50,
  distortionFrequency: 0.07,
  boundaryClarity: 3,
};
gui.add(config, 'distortionRange', 0, 1, 0.01);
gui.add(config, 'distortionStrength', 0, 200, 0.1);
gui.add(config, 'distortionFrequency', 0, 0.1, 0.001);
gui.add(config, 'boundaryClarity', 0, 100, 0.1);

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
        uDistortionRange: { value: config.distortionRange },
        uDistortionStrength: { value: config.distortionStrength },
        uDistortionFrequency: { value: config.distortionFrequency },
        uBoundaryClarity: { value: config.boundaryClarity },
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
    const handleStart = (e: MouseEvent | TouchEvent) => {
      this.isDragging = true;
      start = 'clientX' in e ? e.clientX : e.touches[0].clientX;
      document.body.style.cursor = 'grabbing';
    };
    renderer.renderer.domElement.addEventListener('touchstart', handleStart, {
      signal: this.abortController.signal,
    });
    renderer.renderer.domElement.addEventListener('mousedown', handleStart, {
      signal: this.abortController.signal,
    });

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
      const delta = ((clientX - start) / sizes.width) * 4;
      start = clientX;
      this.progress -= delta;
    };
    renderer.renderer.domElement.addEventListener('touchmove', handleMove, {
      signal: this.abortController.signal,
    });

    renderer.renderer.domElement.addEventListener('mousemove', handleMove, {
      signal: this.abortController.signal,
    });

    const handleEnd = () => {
      this.isDragging = false;
      document.body.style.removeProperty('cursor');
    };
    renderer.renderer.domElement.addEventListener('touchend', handleEnd, {
      signal: this.abortController.signal,
    });
    renderer.renderer.domElement.addEventListener('mouseup', handleEnd, {
      signal: this.abortController.signal,
    });
  }

  public dispose() {
    this.abortController.abort();
  }

  public update() {
    const { uniforms } = this.mesh.material;
    uniforms.uTime.value = clock.elapsed / 1000;
    uniforms.uProgress.value = clamp(this.progress, 0, this.images.length - 1);

    if (this.progress < 0) {
      this.mesh.position.z = this.progress * 50;
    } else if (this.progress > this.images.length - 1) {
      this.mesh.position.z = (this.images.length - 1 - this.progress) * 50;
    }

    if (!this.isDragging) {
      const p = clamp(Math.round(this.progress), 0, this.images.length - 1);
      this.progress = lerp(this.progress, p, beta(0.1, clock.delta));
    }

    this.mesh.material.uniforms.uDistortionRange.value = config.distortionRange;
    this.mesh.material.uniforms.uDistortionStrength.value =
      config.distortionStrength;
    this.mesh.material.uniforms.uDistortionFrequency.value =
      config.distortionFrequency;
    this.mesh.material.uniforms.uBoundaryClarity.value = config.boundaryClarity;
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
