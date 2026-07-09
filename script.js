const signInModal = document.querySelector("#signin-modal");
const openSignIn = document.querySelector('[data-modal-open="signin-modal"]');
const closeSignIn = signInModal?.querySelector(".modal-close");
const signInForm = signInModal?.querySelector(".signin-form");
const signInMessage = signInModal?.querySelector(".signin-message");
const loginLink = document.querySelector(".login-link");
const userMenu = document.querySelector(".user-menu");
const logoutButton = document.querySelector(".logout-button");
const demoAccount = {
  email: "TheFreeBookNook",
  password: "TheFreeBookNook",
};

function updateUserState() {
  const loggedIn = localStorage.getItem("freeBookNookUser") === demoAccount.email;

  if (loginLink) {
    loginLink.hidden = loggedIn;
  }

  if (userMenu) {
    userMenu.hidden = !loggedIn;
  }
}

function setSignInModal(open) {
  if (!signInModal) {
    return;
  }

  signInModal.classList.toggle("is-open", open);
  signInModal.setAttribute("aria-hidden", String(!open));

  if (open) {
    if (signInMessage) {
      signInMessage.textContent = "";
    }

    signInModal.querySelector("input")?.focus();
  } else {
    openSignIn?.focus();
  }
}

openSignIn?.addEventListener("click", (event) => {
  event.preventDefault();
  setSignInModal(true);
});

closeSignIn?.addEventListener("click", () => setSignInModal(false));

signInForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(signInForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const termsAccepted = formData.get("terms") === "on";

  if (!termsAccepted) {
    if (signInMessage) {
      signInMessage.textContent = "Please accept the Terms of Service.";
    }
    return;
  }

  if (email === demoAccount.email && password === demoAccount.password) {
    localStorage.setItem("freeBookNookUser", demoAccount.email);
    updateUserState();
    setSignInModal(false);
    signInForm.reset();
    return;
  }

  if (signInMessage) {
    signInMessage.textContent =
      "Use TheFreeBookNook for both email and password.";
  }
});

logoutButton?.addEventListener("click", () => {
  localStorage.removeItem("freeBookNookUser");
  updateUserState();
});

signInModal?.addEventListener("click", (event) => {
  if (event.target === signInModal) {
    setSignInModal(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setSignInModal(false);
  }
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    if (link.dataset.modalOpen) {
      return;
    }

    const target = document.querySelector(link.getAttribute("href"));

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

updateUserState();
