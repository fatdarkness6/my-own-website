// Shader sources are kept separate from component lifecycle and rendering code.
export const vertexShader = `
      attribute float aSize;
      attribute float aOpacity;
      attribute float aHighlight;
      varying float vOpacity;
      varying float vHighlight;
      uniform float uDotPixelSize;
      void main() {
        vOpacity = aOpacity;
        vHighlight = aHighlight;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uDotPixelSize * (1.0 + aHighlight * 0.9);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

export const fragmentShader = `
      precision mediump float;
      varying float vOpacity;
      varying float vHighlight;
      uniform vec3 uColor;
      uniform vec3 uAccent;
      uniform float uRevealProgress;
      uniform float uFlashIntensity;
      uniform float uLayerOpacity;
      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float dist = length(uv);
        if (dist > 0.5) discard;
        float alpha = smoothstep(0.5, 0.42, dist) * vOpacity * uRevealProgress * uLayerOpacity;
        alpha = clamp(alpha * (1.0 + uFlashIntensity * 0.7), 0.0, 1.0);
        float mixAmount = clamp(vHighlight + uFlashIntensity * 0.6, 0.0, 1.0);
        vec3 color = mix(uColor, uAccent, mixAmount);
        gl_FragColor = vec4(color, alpha);
      }
    `;
