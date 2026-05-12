const nav = document.querySelector(".site-nav");

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", () => {
    const menu = document.querySelector(".navbar-collapse.show");
    if (!menu) return;
    bootstrap.Collapse.getOrCreateInstance(menu).hide();
  });
});

const updateNavState = () => {
  if (!nav) return;
  nav.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateNavState();
window.addEventListener("scroll", updateNavState, { passive: true });
