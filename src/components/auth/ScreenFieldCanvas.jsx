import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";

const GRID_COLS = 6;
const GRID_ROWS = 4;
const INSTANCE_COUNT = GRID_COLS * GRID_ROWS;
const TINTS = [0x5b62f0, 0x7c6bf2, 0x9c7df5, 0xb9a6ff];

/**
 * 1.1 — Generated soft sprite: a radial bloom + rounded-rect panel face,
 * feathered so there are no hard edges under additive blending.
 */
function createSpriteTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // a. Radial bloom
  const bloom = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  bloom.addColorStop(0, "rgba(255,255,255,0.42)");
  bloom.addColorStop(0.42, "rgba(255,255,255,0.10)");
  bloom.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, 256, 256);

  // b. Rounded-rect panel face
  const pw = 256 * 0.72;
  const ph = 256 * 0.40;
  const px = (256 - pw) / 2;
  const py = (256 - ph) / 2;
  const r = 10;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(px + r, py);
  ctx.lineTo(px + pw - r, py);
  ctx.quadraticCurveTo(px + pw, py, px + pw, py + r);
  ctx.lineTo(px + pw, py + ph - r);
  ctx.quadraticCurveTo(px + pw, py + ph, px + pw - r, py + ph);
  ctx.lineTo(px + r, py + ph);
  ctx.quadraticCurveTo(px, py + ph, px, py + ph - r);
  ctx.lineTo(px, py + r);
  ctx.quadraticCurveTo(px, py, px + r, py);
  ctx.closePath();
  ctx.clip();

  const face = ctx.createLinearGradient(px, py, px + pw, py + ph);
  face.addColorStop(0, "rgba(255,255,255,0.95)");
  face.addColorStop(0.5, "rgba(255,255,255,0.62)");
  face.addColorStop(1, "rgba(255,255,255,0.88)");
  ctx.fillStyle = face;
  ctx.fillRect(px, py, pw, ph);
  ctx.restore();

  // c. Feather — removes every hard edge
  ctx.globalCompositeOperation = "destination-in";
  const feather = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  feather.addColorStop(0, "rgba(0,0,0,1)");
  feather.addColorStop(0.16, "rgba(0,0,0,1)");
  feather.addColorStop(0.82, "rgba(0,0,0,0.92)");
  feather.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = feather;
  ctx.fillRect(0, 0, 256, 256);
  ctx.globalCompositeOperation = "source-over";

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function ScreenFieldCanvas({ sweepTrigger = 0, onActive }) {
  const containerRef = useRef(null);
  const sweepState = useRef({ position: -10, active: false });

  // 2.1 + 2.2 — WebGL only at >= 1024px and without reduced motion
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false
  );
  const [reducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const shouldInit = isDesktop && !reducedMotion;

  // 1.4 — React to sweep trigger from the HUD
  useEffect(() => {
    if (sweepTrigger > 0 && shouldInit) {
      sweepState.current.active = true;
      sweepState.current.position = -2;
    }
  }, [sweepTrigger, shouldInit]);

  // Main WebGL lifecycle
  useEffect(() => {
    if (!shouldInit) return;

    const container = containerRef.current;
    if (!container || container.clientWidth === 0 || container.clientHeight === 0) return;

    let renderer, scene, camera, mesh, geometry, material, texture;
    let animationId = null;
    let isVisible = true;
    const cleanups = [];

    try {
      texture = createSpriteTexture();
      geometry = new THREE.PlaneGeometry(2.5, 2.5);
      material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      mesh = new THREE.InstancedMesh(geometry, material, INSTANCE_COUNT);
      mesh.frustumCulled = false;

      const dummy = new THREE.Object3D();
      const colour = new THREE.Color();
      const instances = [];

      for (let i = 0; i < INSTANCE_COUNT; i++) {
        const col = i % GRID_COLS;
        const row = Math.floor(i / GRID_COLS);

        const x = (col - 2.5) * 4.4 + (Math.random() - 0.5) * 0.7;
        const y = (row - 1.5) * 3.5 + (Math.random() - 0.5) * 0.6;
        const z = -16 + ((i * 7) % 5) * 3.2 + (Math.random() - 0.5) * 1.4;
        const ry = (Math.random() - 0.5) * 0.3;
        const rz = (Math.random() - 0.5) * 0.05;
        const scale = 0.8 + Math.random() * 0.45;
        const spin = 0.008 + Math.random() * 0.016;
        const idle = 0.18 + Math.random() * 0.16;
        const phase = Math.random() * Math.PI * 2;
        const tint = TINTS[i % TINTS.length];

        instances.push({ col, x, y, z, ry, rz, scale, spin, idle, phase, tint, flash: 0 });

        dummy.position.set(x, y, z);
        dummy.rotation.set(0, ry, rz);
        dummy.scale.set(scale, scale, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        colour.setHex(tint).multiplyScalar(idle);
        mesh.setColorAt(i, colour);
      }

      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

      // 2.3 — renderer with alpha, no antialias, sRGB output
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);

      // 1.5 — scene + camera
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x05070f, 0.03);

      camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 120);
      camera.position.set(0, 0, 9);
      camera.lookAt(0, 0, -7);

      scene.add(mesh);

      const clock = new THREE.Clock();
      let pointerX = 0, pointerY = 0;

      // 1.6 — pointer parallax, skip on touch
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const onPointerMove = (e) => {
        if (e.pointerType === "touch") return;
        pointerX = (e.clientX / window.innerWidth) * 2 - 1;
        pointerY = -(e.clientY / window.innerHeight) * 2 + 1;
      };
      if (!isTouchDevice) {
        window.addEventListener("pointermove", onPointerMove);
        cleanups.push(() => window.removeEventListener("pointermove", onPointerMove));
      }

      function animate() {
        animationId = requestAnimationFrame(animate);
        if (!isVisible) return;

        const delta = Math.min(clock.getDelta(), 0.1);
        const t = clock.elapsedTime;

        // Camera parallax — lerp toward pointer, max 0.9 x / 0.55 y
        camera.position.x += (pointerX * 0.9 - camera.position.x) * 0.04;
        camera.position.y += (pointerY * 0.55 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, -7);

        // 1.4 — advance column sweep
        if (sweepState.current.active) {
          sweepState.current.position += delta * 3.2;
          if (sweepState.current.position > GRID_COLS + 2) {
            sweepState.current.active = false;
          }
        }

        // 1.3 — brightness: idle breathing + sweep flash
        for (let i = 0; i < INSTANCE_COUNT; i++) {
          const inst = instances[i];
          inst.ry += inst.spin * delta;

          const distance = sweepState.current.active
            ? Math.abs(inst.col - sweepState.current.position)
            : Infinity;
          const hit = distance < 1.3 ? 1 - distance / 1.3 : 0;
          inst.flash += (hit - inst.flash) * (hit > inst.flash ? 0.22 : 0.045);

          const k = inst.idle * (0.86 + Math.sin(t * 0.5 + inst.phase) * 0.14) + inst.flash * 0.95;

          dummy.position.set(inst.x, inst.y, inst.z);
          dummy.rotation.set(0, inst.ry, inst.rz);
          dummy.scale.set(inst.scale, inst.scale, 1);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);

          colour.setHex(inst.tint).multiplyScalar(k);
          mesh.setColorAt(i, colour);
        }

        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

        renderer.render(scene, camera);
      }

      // 2.4 — pause on tab hidden
      const onVisibilityChange = () => {
        if (document.hidden) {
          isVisible = false;
          if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
        } else if (!isVisible) {
          isVisible = true;
          clock.getDelta();
          if (!animationId) animationId = requestAnimationFrame(animate);
        }
      };
      document.addEventListener("visibilitychange", onVisibilityChange);
      cleanups.push(() => document.removeEventListener("visibilitychange", onVisibilityChange));

      // Resize — update camera aspect + renderer size
      const onResize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);
      cleanups.push(() => window.removeEventListener("resize", onResize));

      animate();
      onActive?.(true);

      // 2.6 — full cleanup on unmount
      return () => {
        if (animationId) cancelAnimationFrame(animationId);
        sweepState.current.active = false;
        sweepState.current.position = -10;
        cleanups.forEach((fn) => fn());
        geometry?.dispose();
        material?.dispose();
        texture?.dispose();
        mesh?.dispose();
        if (renderer) {
          renderer.forceContextLoss();
          renderer.dispose();
          if (renderer.domElement?.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        }
        onActive?.(false);
      };
    } catch (e) {
      // 2.7 — fall back silently
      console.warn("ScreenFieldCanvas: WebGL unavailable", e);
      geometry?.dispose();
      material?.dispose();
      texture?.dispose();
      mesh?.dispose();
      if (renderer) {
        renderer.forceContextLoss();
        renderer.dispose();
        if (renderer.domElement?.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
      onActive?.(false);
    }
  }, [shouldInit]);

  return <div ref={containerRef} className="absolute inset-0" style={{ zIndex: 0 }} />;
}