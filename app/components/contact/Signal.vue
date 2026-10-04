<template>
  <div class="channel-signal" aria-hidden="true">
    <div class="channel-signal__grid" />
    <div class="channel-signal__sweep" />
    <span class="channel-signal__label">AS / RECEIVE</span>
    <div class="channel-signal__wave">
      <i
        v-for="bar in 29"
        :key="bar"
        :style="{ '--bar': bar, '--level': `${18 + ((bar * 17) % 67)}%` }"
      />
    </div>
    <div class="channel-signal__footer">
      <span>IDEA → CONVERSATION</span><span>[ A/S ]</span>
    </div>
  </div>
</template>

<style scoped>
.channel-signal {
  position: relative;
  height: 170px;
  overflow: hidden;
  border-bottom: 1px solid rgb(96 165 250 / 0.22);
  background:
    radial-gradient(ellipse at 50% 100%, #10274c, transparent 70%), #050b14;
  color: #60a5fa;
}
.channel-signal__grid,
.channel-signal__sweep {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.channel-signal__grid {
  background:
    linear-gradient(rgb(96 165 250 / 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgb(96 165 250 / 0.07) 1px, transparent 1px);
  background-size: 22px 22px;
}
.channel-signal__sweep {
  background: linear-gradient(
    90deg,
    transparent 40%,
    rgb(96 165 250 / 0.15) 50%,
    transparent 60%
  );
  animation: channel-sweep 7s linear infinite;
}
.channel-signal__label {
  position: absolute;
  top: 18px;
  left: 22px;
  font: 500 0.6875rem/1.5 var(--ui-font);
  letter-spacing: 0.1em;
}
.channel-signal__wave {
  position: absolute;
  inset: 46px 24px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}
.channel-signal__wave i {
  flex: 1;
  max-width: 5px;
  height: var(--level);
  background: #3b82f6;
  box-shadow: 0 0 10px rgb(59 130 246 / 0.2);
  animation: channel-wave 2.8s steps(5, end) infinite;
  animation-delay: calc(var(--bar) * -0.11s);
}
.channel-signal__footer {
  position: absolute;
  inset: auto 22px 14px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font: 400 0.625rem/1.5 var(--ui-font);
  color: #8ba6cc;
}
@keyframes channel-wave {
  0%,
  100% {
    transform: scaleY(0.35);
    opacity: 0.45;
  }
  40% {
    transform: scaleY(1);
    opacity: 1;
  }
  75% {
    transform: scaleY(0.65);
    opacity: 0.7;
  }
}
@keyframes channel-sweep {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .channel-signal__sweep,
  .channel-signal__wave i {
    animation: none;
  }
}
</style>
