const signInModal = document.querySelector("#signin-modal");
const openSignIn = document.querySelector('[data-modal-open="signin-modal"]');
const closeSignIn = signInModal?.querySelector(".modal-close");
const signInForm = signInModal?.querySelector(".signin-form");
const signInMessage = signInModal?.querySelector(".signin-message");
const loginLink = document.querySelector(".login-link");
const userMenu = document.querySelector(".user-menu");
const userButton = document.querySelector(".user-button");
const userName = document.querySelector(".user-name");
const pageUserName = document.querySelector(".page-user-name");
const logoutButton = document.querySelector(".logout-button");
const collectionsGrid = document.querySelector("[data-collections-grid]");
const createCollectionButton = document.querySelector(".create-collection-card");
const collectionModal = document.querySelector("#collection-modal");
const closeCollectionModal = document.querySelector("[data-collection-modal-close]");
const collectionForm = document.querySelector(".collection-form");
const collectionNameInput = document.querySelector("#collection-name");
const collectionMessage = document.querySelector(".collection-message");
const collectionModalTitle = document.querySelector("#collection-modal-title");
const collectionSubmitButton = collectionForm?.querySelector('button[type="submit"]');
const collectionTitle = document.querySelector("[data-collection-title]");
const bookshelf = document.querySelector("[data-bookshelf]");
const contactForm = document.querySelector(".contact-form");
const contactFormMessage = document.querySelector(".contact-form-message");
const demoAccount = {
  email: "TheFreeBookNook",
  password: "TheFreeBookNook",
};
const collectionsStorageKey = "freeBookNookCollections";
const sampleBooks = [
  {
    title: "Moonlit Margins",
    author: "A. Rivera",
    color: "#7d4f50",
  },
  {
    title: "The Open Chapter",
    author: "Lena Brooks",
    color: "#2f6f73",
  },
  {
    title: "Kitchen Notes",
    author: "M. Ito",
    color: "#b06f3c",
  },
  {
    title: "Library of Clouds",
    author: "Sam Chen",
    color: "#4f5f8f",
  },
];
const defaultCollections = [
  {
    id: "collection-1",
    name: "Collection 1",
    books: sampleBooks,
  },
];
let collectionModalMode = "create";
let collectionBeingRenamed = null;

function updateUserState() {
  const loggedIn = localStorage.getItem("freeBookNookUser") === demoAccount.email;

  if (loginLink) {
    loginLink.hidden = loggedIn;
  }

  if (userMenu) {
    userMenu.hidden = !loggedIn;
  }

  if (loggedIn && userName) {
    userName.textContent = demoAccount.email;
  }

  if (pageUserName) {
    pageUserName.textContent = loggedIn ? demoAccount.email : "Guest";
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

function getCollections() {
  const savedCollections = localStorage.getItem(collectionsStorageKey);

  if (!savedCollections) {
    return defaultCollections;
  }

  try {
    const collections = JSON.parse(savedCollections);
    return Array.isArray(collections) ? collections : defaultCollections;
  } catch {
    return defaultCollections;
  }
}

function saveCollections(collections) {
  localStorage.setItem(collectionsStorageKey, JSON.stringify(collections));
}

function namesMatch(firstName, secondName) {
  return firstName.trim().toLowerCase() === secondName.trim().toLowerCase();
}

function collectionNameExists(name, ignoredCollectionId = null) {
  return getCollections().some(
    (collection) =>
      collection.id !== ignoredCollectionId && namesMatch(collection.name, name)
  );
}

function setCollectionModal(open, mode = "create", collection = null) {
  if (!collectionModal || !collectionForm || !collectionNameInput) {
    return;
  }

  collectionModalMode = mode;
  collectionBeingRenamed = collection;
  collectionModal.classList.toggle("is-open", open);
  collectionModal.setAttribute("aria-hidden", String(!open));

  if (open) {
    const isRename = mode === "rename";
    collectionModalTitle.textContent = isRename
      ? "Rename collection"
      : "Create collection";
    collectionSubmitButton.textContent = isRename
      ? "Save name"
      : "Create collection";
    collectionNameInput.value = collection?.name || "";
    collectionMessage.textContent = "";
    collectionNameInput.focus();
    collectionNameInput.select();
    return;
  }

  collectionForm.reset();
  collectionMessage.textContent = "";
  collectionBeingRenamed = null;
  createCollectionButton?.focus();
}

function createCollectionCard(collection) {
  const card = document.createElement("article");
  card.className = "collection-card";
  card.tabIndex = 0;
  card.setAttribute("role", "link");
  card.setAttribute("aria-label", `Open ${collection.name}`);

  const cover = document.createElement("div");
  cover.className = "collection-cover";
  cover.setAttribute("aria-hidden", "true");

  const title = document.createElement("h3");
  title.textContent = collection.name;

  let openTimer = null;

  const openCollection = () => {
    window.location.href = `collection.html?id=${encodeURIComponent(
      collection.id
    )}`;
  };

  card.addEventListener("click", (event) => {
    if (event.detail > 1) {
      clearTimeout(openTimer);
      return;
    }

    openTimer = setTimeout(openCollection, 220);
  });
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      openCollection();
    }
  });

  title.addEventListener("dblclick", (event) => {
    event.preventDefault();
    event.stopPropagation();
    clearTimeout(openTimer);
    setCollectionModal(true, "rename", collection);
  });

  card.append(cover, title);
  return card;
}

function renderCollections() {
  if (!collectionsGrid || !createCollectionButton) {
    return;
  }

  collectionsGrid
    .querySelectorAll(".collection-card")
    .forEach((card) => card.remove());

  getCollections().forEach((collection) => {
    collectionsGrid.insertBefore(
      createCollectionCard(collection),
      createCollectionButton
    );
  });
}

function renderBookshelf() {
  if (!bookshelf || !collectionTitle) {
    return;
  }

  const collectionId = new URLSearchParams(window.location.search).get("id");
  const collection = getCollections().find((item) => item.id === collectionId);

  if (!collection) {
    collectionTitle.textContent = "Collection not found";
    bookshelf.innerHTML =
      '<p class="empty-bookshelf">This collection could not be found.</p>';
    return;
  }

  collectionTitle.textContent = collection.name;
  collectionTitle.dataset.collectionId = collection.id;
  const books = collection.books || [];

  if (!books.length) {
    bookshelf.innerHTML =
      '<p class="empty-bookshelf">No books saved here yet.</p>';
    return;
  }

  bookshelf.innerHTML = "";
  books.forEach((book) => {
    const bookCard = document.createElement("article");
    bookCard.className = "book-spine-card";

    const cover = document.createElement("div");
    cover.className = "book-cover";
    cover.style.setProperty("--book-color", book.color || "#20183f");

    const title = document.createElement("h3");
    title.textContent = book.title;

    const author = document.createElement("p");
    author.textContent = book.author;

    bookCard.append(cover, title, author);
    bookshelf.append(bookCard);
  });
}

openSignIn?.addEventListener("click", (event) => {
  event.preventDefault();
  setSignInModal(true);
});

closeSignIn?.addEventListener("click", () => setSignInModal(false));

createCollectionButton?.addEventListener("click", () => {
  setCollectionModal(true);
});

closeCollectionModal?.addEventListener("click", () => {
  setCollectionModal(false);
});

collectionTitle?.addEventListener("dblclick", () => {
  const collection = getCollections().find(
    (item) => item.id === collectionTitle.dataset.collectionId
  );

  if (collection) {
    setCollectionModal(true, "rename", collection);
  }
});

collectionModal?.addEventListener("click", (event) => {
  if (event.target === collectionModal) {
    setCollectionModal(false);
  }
});

collectionForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = collectionNameInput.value.trim();
  const renamedId =
    collectionModalMode === "rename" ? collectionBeingRenamed?.id : null;

  if (!name) {
    collectionMessage.textContent = "Please enter a collection name.";
    return;
  }

  if (collectionNameExists(name, renamedId)) {
    collectionMessage.textContent = "A collection with this name already exists.";
    return;
  }

  const collections = getCollections();

  if (collectionModalMode === "rename" && collectionBeingRenamed) {
    const updatedCollections = collections.map((collection) =>
      collection.id === collectionBeingRenamed.id
        ? { ...collection, name }
        : collection
    );
    saveCollections(updatedCollections);
  } else {
    collections.push({
      id: `collection-${Date.now()}`,
      name,
      books: [],
    });
    saveCollections(collections);
  }

  renderCollections();
  renderBookshelf();
  setCollectionModal(false);
});

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
  userMenu?.classList.remove("is-open");
  userButton?.setAttribute("aria-expanded", "false");
  updateUserState();
});

userButton?.addEventListener("click", () => {
  const isOpen = userMenu?.classList.toggle("is-open") || false;
  userButton.setAttribute("aria-expanded", String(isOpen));
});

signInModal?.addEventListener("click", (event) => {
  if (event.target === signInModal) {
    setSignInModal(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setSignInModal(false);
    setCollectionModal(false);
    userMenu?.classList.remove("is-open");
    userButton?.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("click", (event) => {
  if (!userMenu?.contains(event.target)) {
    userMenu?.classList.remove("is-open");
    userButton?.setAttribute("aria-expanded", "false");
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

document.querySelectorAll(".recent-search-delete").forEach((button) => {
  button.addEventListener("click", () => {
    button.closest(".recent-search-chip")?.remove();
  });
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }

  contactForm.reset();

  if (contactFormMessage) {
    contactFormMessage.textContent =
      "Thank you! Your message is ready to be connected to our support inbox.";
  }
});

updateUserState();
renderCollections();
renderBookshelf();
