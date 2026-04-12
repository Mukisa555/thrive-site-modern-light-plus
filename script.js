const navToggle = document.querySelector(".nav-toggle");
const navPanel = document.querySelector(".nav-panel");
const navContainer = document.querySelector(".nav-container");
const mobileBreakpoint = window.matchMedia("(max-width: 820px)");

if (navToggle && navPanel) {
  const setMenuState = (isOpen) => {
    navPanel.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  };

  navToggle.addEventListener("click", () => {
    setMenuState(!navPanel.classList.contains("is-open"));
  });

  navPanel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileBreakpoint.matches) {
        setMenuState(false);
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (
      mobileBreakpoint.matches &&
      navPanel.classList.contains("is-open") &&
      navContainer &&
      !navContainer.contains(event.target)
    ) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navPanel.classList.contains("is-open")) {
      setMenuState(false);
      navToggle.focus();
    }
  });

  mobileBreakpoint.addEventListener("change", (event) => {
    if (!event.matches) {
      setMenuState(false);
    }
  });
}
