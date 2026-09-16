import { animate, hover } from "motion";

const ISO = "matrix(0.866025 0.5 -0.866025 0.5 0 0)";
const HEIGHT = { flat: 1, rest: 24, hover: 21.6 };

const button = document.querySelector(".hero-btn-motion");
const shadow = document.querySelector(".hero-btn-shadow");
const face = document.querySelector(".hero-btn-face");
const slices = [...document.querySelectorAll(".hero-btn-wall > g")];

if (button && shadow && face && slices.length) {
  const shadowOpacity = { rest: 0.22, hover: 0.16, press: 0.1 };
  const spring = { type: "spring", stiffness: 500, damping: 28 };
  const pressSpring = { type: "spring", stiffness: 700, damping: 32 };
  const enterSpring = { type: "spring", duration: 1.2, bounce: 0.18 };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const state = { isHovered: false };
  const extrude = { h: HEIGHT.flat };
  let extrudeAnim;
  let busy = false;
  let seq = 0;

  const setHeight = (h) => {
    const scale = h / HEIGHT.rest;
    slices.forEach((el, i) => {
      el.setAttribute("transform", `translate(0 ${(-i * scale).toFixed(2)}) ${ISO}`);
    });
    face.setAttribute("transform", `translate(0 ${(-h).toFixed(2)}) ${ISO}`);
  };

  const animateHeight = (to, transition) => {
    extrudeAnim?.stop();
    extrudeAnim = animate(extrude.h, to, {
      ...transition,
      onUpdate: (latest) => {
        extrude.h = latest;
        setHeight(latest);
      },
    });
    return extrudeAnim;
  };

  const targetHeight = () => (state.isHovered ? HEIGHT.hover : HEIGHT.rest);

  const applyHover = () => {
    if (busy) return;
    const hovered = state.isHovered;
    animateHeight(targetHeight(), spring);
    animate(shadow, { opacity: hovered ? shadowOpacity.hover : shadowOpacity.rest }, spring);
  };

  const playEnter = async (id) => {
    animate(shadow, { opacity: shadowOpacity.rest }, enterSpring);
    try {
      await animateHeight(HEIGHT.rest, enterSpring).finished;
    } catch {
      return;
    }
    if (id !== seq) return;
    busy = false;
    applyHover();
  };

  const playPress = async () => {
    const id = ++seq;
    busy = true;
    animate(shadow, { opacity: shadowOpacity.press }, pressSpring);
    try {
      await animateHeight(HEIGHT.flat, pressSpring).finished;
    } catch {
      return;
    }
    if (id !== seq) return;
    await playEnter(id);
  };

  setHeight(HEIGHT.flat);

  if (reduce) {
    setHeight(HEIGHT.rest);
    shadow.style.opacity = String(shadowOpacity.rest);
  } else {
    busy = true;
    seq += 1;
    playEnter(seq);

    hover(button, () => {
      state.isHovered = true;
      applyHover();
      return () => {
        state.isHovered = false;
        applyHover();
      };
    });

    const onPress = (event) => {
      if (event.type === "pointerdown" && event.button !== 0) return;
      if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
      if (event.type === "keydown") event.preventDefault();
      playPress();
    };

    button.addEventListener("pointerdown", onPress);
    button.addEventListener("keydown", onPress);
  }
}
