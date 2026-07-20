import React, { useRef, useEffect } from "react";
import * as THREE from "three";

const PANEL_COUNT = 60;
const BG_COLOR = 0x070b18;
const PALETTE = [
  new THREE.Color(0x6366f1), // indigo
  new THREE.Color(0x8b5cf6), // violet
  new THREE.Color(0xe0e7ff), // near-white (≈1 in 8)
];

export default function ScreenFieldCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 2.3 — skip if reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // 2.4 — skip below 768px (brand panel not visible)
    if (window.innerWidth < 768) return;
    // Guard against zero-size container
    if (container.clientWidth === 0 || container.clientHeight === 0) return;

    let renderer, scene, camera;
    let animationId = null;
    let isVisible = true;
    const cleanups = [];

    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(BG_COLOR, 1);
      container.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      scene.background = new THREE.Color(BG_COLOR);
      // 1.7 — fog so far panels dissolve
      scene.fog = new THREE.FogExp2(BG_COLOR, 0.055);

      // 1.8 — camera
      camera = new THREE.PerspectiveCamera(
        55,
        container.clientWidth / container.clientHeight,
        0.1,
        100
      );
      camera.position.z = 8;

      // 1.1 — single PlaneGeometry, InstancedMesh
      const panelGeo = new THREE.PlaneGeometry(1, 0.5625); // 16:9
      const glowGeo = new THREE.PlaneGeometry(1.6, 0.9); // 1.6x, preserving ratio

      // 1.3 — MeshBasicMaterial, additive, no lights
      const panelMat = new THREE.MeshBasicMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glowMat = new THREE.MeshBasicMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const panelMesh = new THREE.InstancedMesh(panelGeo, panelMat, PANEL_COUNT);
      const glowMesh = new THREE.InstancedMesh(glowGeo, glowMat, PANEL_COUNT);
      panelMesh.frustumCulled = false;
      glowMesh.frustumCulled = false;

      const dummy = new THREE.Object3D();
      const tmpColor = new THREE.Color();
      const instances = [];

      for (let i = 0; i < PANEL_COUNT; i++) {
        const x = (Math.random() - 0.5) * 28; // x[-14,14]
        const y = (Math.random() - 0.5) * 16; // y[-8,8]
        const z = -22 + Math.random() * 24; // z[-22,2]
        const rotY = (Math.random() - 0.5) * 0.7; // ±0.35
        const rotZ = (Math.random() - 0.5) * 0.16; // ±0.08
        const scale = 0.6 + Math.random() * 1.0; // 0.6–1.6

        const isWhite = Math.random() < 0.125;
        const baseColor = (
          isWhite ? PALETTE[2] : Math.random() < 0.5 ? PALETTE[0] : PALETTE[1]
        ).clone();

        // Opacity by depth: near (z→2) = 0.85, far (z→-22) = 0.15
        const depthFactor = (z + 22) / 24;
        const opacity = 0.15 + depthFactor * 0.7;

        instances.push({
          x, y, z, rotY, rotZ, scale, baseColor, opacity,
          rotSpeed: 0.02 + Math.random() * 0.06, // 0.02–0.08 rad/sec
          pulsing: false,
          pulseStart: 0,
        });

        dummy.position.set(x, y, z);
        dummy.rotation.set(0, rotY, rotZ);
        dummy.scale.set(scale, scale, 1);
        dummy.updateMatrix();
        panelMesh.setMatrixAt(i, dummy.matrix);
        glowMesh.setMatrixAt(i, dummy.matrix);

        // With additive blending, brightness encodes opacity
        tmpColor.copy(baseColor).multiplyScalar(opacity);
        panelMesh.setColorAt(i, tmpColor);
        tmpColor.copy(baseColor).multiplyScalar(0.12);
        glowMesh.setColorAt(i, tmpColor);
      }

      panelMesh.instanceMatrix.needsUpdate = true;
      glowMesh.instanceMatrix.needsUpdate = true;
      if (panelMesh.instanceColor) panelMesh.instanceColor.needsUpdate = true;
      if (glowMesh.instanceColor) glowMesh.instanceColor.needsUpdate = true;

      scene.add(glowMesh);
      scene.add(panelMesh);

      const clock = new THREE.Clock();
      let driftY = 0;
      let lastPulseTime = 0;
      let pointerX = 0,
        pointerY = 0;

      // 1.6 — pointer parallax (skip on touch)
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const onPointerMove = (e) => {
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
        const elapsed = clock.getElapsedTime();

        // Camera parallax — lerp toward pointer, max 1.2 units
        camera.position.x += (pointerX * 1.2 - camera.position.x) * 0.04;
        camera.position.y += (pointerY * 1.2 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);

        // 1.5 — whole field drifts +Y at 0.12 u/s
        driftY += delta * 0.12;

        // 1.5 — pulse one panel every ~3s over 900ms
        if (elapsed - lastPulseTime > 3) {
          lastPulseTime = elapsed;
          const idx = Math.floor(Math.random() * PANEL_COUNT);
          instances[idx].pulsing = true;
          instances[idx].pulseStart = elapsed;
        }

        for (let i = 0; i < PANEL_COUNT; i++) {
          const inst = instances[i];

          // Per-panel Y rotation
          inst.rotY += inst.rotSpeed * delta;

          // Wrap Y from top back to bottom
          let y = inst.y + driftY;
          y = (((y + 8) % 16) + 16) % 16 - 8;

          // Pulse opacity multiplier
          let opacityMul = 1;
          if (inst.pulsing) {
            const pe = elapsed - inst.pulseStart;
            if (pe >= 0.9) {
              inst.pulsing = false;
            } else {
              opacityMul = 1 + Math.sin(Math.PI * (pe / 0.9)) * 0.8;
            }
          }

          dummy.position.set(inst.x, y, inst.z);
          dummy.rotation.set(0, inst.rotY, inst.rotZ);
          dummy.scale.set(inst.scale, inst.scale, 1);
          dummy.updateMatrix();
          panelMesh.setMatrixAt(i, dummy.matrix);
          glowMesh.setMatrixAt(i, dummy.matrix);

          tmpColor.copy(inst.baseColor).multiplyScalar(inst.opacity * opacityMul);
          panelMesh.setColorAt(i, tmpColor);
          tmpColor.copy(inst.baseColor).multiplyScalar(0.12 * opacityMul);
          glowMesh.setColorAt(i, tmpColor);
        }

        panelMesh.instanceMatrix.needsUpdate = true;
        glowMesh.instanceMatrix.needsUpdate = true;
        if (panelMesh.instanceColor) panelMesh.instanceColor.needsUpdate = true;
        if (glowMesh.instanceColor) glowMesh.instanceColor.needsUpdate = true;

        renderer.render(scene, camera);
      }

      // 2.2 — pause render loop when tab hidden
      const onVisibilityChange = () => {
        if (document.hidden) {
          isVisible = false;
          if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
        } else if (!isVisible) {
          isVisible = true;
          clock.getDelta(); // reset to avoid jump
          if (!animationId) animationId = requestAnimationFrame(animate);
        }
      };
      document.addEventListener("visibilitychange", onVisibilityChange);
      cleanups.push(() => document.removeEventListener("visibilitychange", onVisibilityChange));

      // 2.4 — stop rendering below 768px on resize
      const onResize = () => {
        if (window.innerWidth < 768) {
          if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
          return;
        }
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

      // 2.5 — full cleanup on unmount
      return () => {
        if (animationId) cancelAnimationFrame(animationId);
        cleanups.forEach((fn) => fn());
        panelGeo.dispose();
        glowGeo.dispose();
        panelMat.dispose();
        glowMat.dispose();
        panelMesh.dispose();
        glowMesh.dispose();
        if (renderer) {
          renderer.dispose();
          if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        }
      };
    } catch (e) {
      // 2.6 — WebGL unavailable, fall back silently
      console.warn("ScreenFieldCanvas: WebGL unavailable, using CSS fallback");
      return () => {
        cleanups.forEach((fn) => fn());
      };
    }
  }, []);

  return <div ref={containerRef} className="absolute inset-0" style={{ zIndex: 0 }} />;
}