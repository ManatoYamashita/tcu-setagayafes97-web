"use client";

import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { EffectComposer, ShaderPass } from "postprocessing";
import "./PixelBlast.css";

export interface PixelBlastProps {
  variant?: "square" | "circle" | "triangle" | "diamond";
  pixelSize?: number;
  color?: string;
  patternScale?: number;
  patternDensity?: number;
  pixelSizeJitter?: number;
  enableRipples?: boolean;
  rippleSpeed?: number;
  rippleThickness?: number;
  rippleIntensityScale?: number;
  liquid?: boolean;
  speed?: number;
  edgeFade?: number;
  transparent?: boolean;
  autoPauseOffscreen?: boolean;
}

const PixelBlast: React.FC<PixelBlastProps> = ({
  variant = "square",
  pixelSize = 4,
  color = "#B19EEF",
  patternScale = 2,
  patternDensity = 1,
  pixelSizeJitter = 0,
  enableRipples = true,
  rippleSpeed = 0.3,
  rippleThickness = 0.1,
  rippleIntensityScale = 1,
  liquid = false,
  speed = 0.5,
  edgeFade = 0.25,
  transparent = true,
  autoPauseOffscreen = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const ripplesRef = useRef<Array<{ x: number; y: number; startTime: number }>>([]);
  const isPausedRef = useRef(false);

  const rgbColor = useMemo(() => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return new THREE.Vector3(r, g, b);
  }, [color]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: transparent,
      antialias: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Shader material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uPixelSize: { value: pixelSize },
        uColor: { value: rgbColor },
        uPatternScale: { value: patternScale },
        uPatternDensity: { value: patternDensity },
        uPixelSizeJitter: { value: pixelSizeJitter },
        uRipples: {
          value: Array(10)
            .fill(null)
            .map(() => new THREE.Vector4(0, 0, 0, 0)),
        },
        uRippleSpeed: { value: rippleSpeed },
        uRippleThickness: { value: rippleThickness },
        uRippleIntensityScale: { value: rippleIntensityScale },
        uLiquid: { value: liquid ? 1.0 : 0.0 },
        uSpeed: { value: speed },
        uEdgeFade: { value: edgeFade },
        uVariant: { value: getVariantValue(variant) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uResolution;
        uniform float uPixelSize;
        uniform vec3 uColor;
        uniform float uPatternScale;
        uniform float uPatternDensity;
        uniform float uPixelSizeJitter;
        uniform vec4 uRipples[10];
        uniform float uRippleSpeed;
        uniform float uRippleThickness;
        uniform float uRippleIntensityScale;
        uniform float uLiquid;
        uniform float uSpeed;
        uniform float uEdgeFade;
        uniform int uVariant;
        varying vec2 vUv;

        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        float getShapeDistance(vec2 p, int variant) {
          if (variant == 0) { // square
            return max(abs(p.x), abs(p.y));
          } else if (variant == 1) { // circle
            return length(p);
          } else if (variant == 2) { // triangle
            float a = atan(p.y, p.x);
            return length(p) * (1.0 + 0.3 * cos(a * 3.0));
          } else { // diamond
            return abs(p.x) + abs(p.y);
          }
        }

        void main() {
          vec2 uv = vUv;
          vec2 pixelCoord = floor(uv * uResolution / uPixelSize);
          vec2 pixelCenter = (pixelCoord + 0.5) * uPixelSize / uResolution;

          float jitter = random(pixelCoord) * uPixelSizeJitter;
          float effectivePixelSize = uPixelSize * (1.0 + jitter);

          float n = noise(pixelCoord * uPatternScale + uTime * uSpeed);
          float pattern = smoothstep(0.5 - uPatternDensity * 0.2, 0.5 + uPatternDensity * 0.2, n);

          float rippleEffect = 0.0;
          for (int i = 0; i < 10; i++) {
            vec4 ripple = uRipples[i];
            if (ripple.w > 0.0) {
              float dist = distance(pixelCenter, ripple.xy);
              float elapsed = uTime - ripple.z;
              float radius = elapsed * uRippleSpeed;
              float intensity = exp(-elapsed * 2.0) * uRippleIntensityScale;
              rippleEffect += intensity * smoothstep(uRippleThickness, 0.0, abs(dist - radius));
            }
          }

          float intensity = pattern + rippleEffect;

          if (uLiquid > 0.5) {
            float liquidNoise = noise(pixelCoord * 0.5 + uTime * uSpeed * 2.0);
            intensity += liquidNoise * 0.3;
          }

          intensity = clamp(intensity, 0.0, 1.0);

          vec2 fromCenter = pixelCenter - vec2(0.5);
          float distFromCenter = getShapeDistance(fromCenter * 2.0, uVariant);
          float edgeFactor = smoothstep(1.0, 1.0 - uEdgeFade, distFromCenter);

          intensity *= edgeFactor;

          vec3 finalColor = uColor * intensity;
          float alpha = intensity;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: transparent,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      if (!isPausedRef.current) {
        const elapsed = clock.getElapsedTime();
        material.uniforms.uTime.value = elapsed;

        // Update ripples
        const currentRipples = ripplesRef.current
          .filter((r) => elapsed - r.startTime < 3.0)
          .slice(0, 10);

        const rippleData = Array(10)
          .fill(null)
          .map((_, i) => {
            const ripple = currentRipples[i];
            if (ripple) {
              return new THREE.Vector4(ripple.x, ripple.y, ripple.startTime, 1);
            }
            return new THREE.Vector4(0, 0, 0, 0);
          });

        material.uniforms.uRipples.value = rippleData;

        renderer.render(scene, camera);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Click handler
    const handleClick = (e: MouseEvent) => {
      if (!enableRipples) return;

      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      const elapsed = clock.getElapsedTime();

      ripplesRef.current.push({ x, y, startTime: elapsed });
      if (ripplesRef.current.length > 10) {
        ripplesRef.current.shift();
      }
    };

    container.addEventListener("click", handleClick);

    // Intersection Observer for auto-pause
    let observer: IntersectionObserver | null = null;
    if (autoPauseOffscreen) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isPausedRef.current = !entry.isIntersecting;
          });
        },
        { threshold: 0 }
      );
      observer.observe(container);
    }

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      container.removeEventListener("click", handleClick);
      if (observer) {
        observer.disconnect();
      }
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [
    variant,
    pixelSize,
    rgbColor,
    patternScale,
    patternDensity,
    pixelSizeJitter,
    enableRipples,
    rippleSpeed,
    rippleThickness,
    rippleIntensityScale,
    liquid,
    speed,
    edgeFade,
    transparent,
    autoPauseOffscreen,
  ]);

  return <div ref={containerRef} className="pixel-blast-container" />;
};

function getVariantValue(variant: string): number {
  switch (variant) {
    case "square":
      return 0;
    case "circle":
      return 1;
    case "triangle":
      return 2;
    case "diamond":
      return 3;
    default:
      return 0;
  }
}

export default PixelBlast;
