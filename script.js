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
const bookSearchForm = document.querySelector(".book-search-form");
const bookSearchInput = document.querySelector("#book-search");
const searchPage = document.querySelector(".search-page");
const searchResults = document.querySelector(".search-results");
const searchResultsGrid = document.querySelector(".search-results-grid");
const searchResultsCount = document.querySelector(".search-results-count");
const searchStatus = document.querySelector(".search-status");
const searchResultTabs = document.querySelectorAll(".search-result-tab");
const recentSearchList = document.querySelector(".recent-search-list");
const recentSearchesEmpty = document.querySelector(".recent-searches-empty");
const demoAccount = {
  email: "TheFreeBookNook",
  password: "TheFreeBookNook",
};
const collectionsStorageKey = "freeBookNookCollections";
const recentSearchesStorageKey = "freeBookNookRecentSearches";
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
let latestSearchBooks = [];
let latestSearchQuery = "";
let activeSearchScope = "all";

function getRecentSearches() {
  try {
    const searches = JSON.parse(
      localStorage.getItem(recentSearchesStorageKey) || "[]"
    );
    return Array.isArray(searches) ? searches : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query) {
  const normalizedQuery = query.trim();
  const searches = getRecentSearches().filter(
    (search) => search.toLowerCase() !== normalizedQuery.toLowerCase()
  );

  searches.unshift(normalizedQuery);
  localStorage.setItem(
    recentSearchesStorageKey,
    JSON.stringify(searches.slice(0, 8))
  );
}

function deleteRecentSearch(query) {
  const searches = getRecentSearches().filter(
    (search) => search.toLowerCase() !== query.toLowerCase()
  );
  localStorage.setItem(recentSearchesStorageKey, JSON.stringify(searches));
  renderRecentSearches();
}

function runSearch(query) {
  if (!bookSearchInput || !query.trim()) {
    return;
  }

  const normalizedQuery = query.trim();
  bookSearchInput.value = normalizedQuery;
  searchPage?.classList.add("has-search-results");
  saveRecentSearch(normalizedQuery);
  searchBooks(normalizedQuery);
}

function renderRecentSearches() {
  if (!recentSearchList || !recentSearchesEmpty) {
    return;
  }

  const searches = getRecentSearches();
  recentSearchList.replaceChildren();
  recentSearchesEmpty.hidden = searches.length > 0;

  searches.forEach((query) => {
    const chip = document.createElement("span");
    chip.className = "recent-search-chip";

    const searchButton = document.createElement("button");
    searchButton.className = "recent-search-term";
    searchButton.type = "button";
    searchButton.textContent = query;
    searchButton.addEventListener("click", () => runSearch(query));

    const deleteButton = document.createElement("button");
    deleteButton.className = "recent-search-delete";
    deleteButton.type = "button";
    deleteButton.setAttribute(
      "aria-label",
      `Delete ${query} from recent searches`
    );
    deleteButton.innerHTML = "&times;";
    deleteButton.addEventListener("click", () => deleteRecentSearch(query));

    chip.append(searchButton, deleteButton);
    recentSearchList.append(chip);
  });
}
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

function createSearchResultCard(book) {
  const card = document.createElement("article");
  card.className = "search-result-card";

  const cover = document.createElement("div");
  cover.className = "search-result-cover";

  if (book.cover_url) {
    const image = document.createElement("img");
    image.src = book.cover_url;
    image.alt = `Cover of ${book.title}`;
    cover.append(image);
  } else {
    const placeholder = document.createElement("span");
    placeholder.textContent = book.title.slice(0, 1).toUpperCase();
    placeholder.setAttribute("aria-hidden", "true");
    cover.append(placeholder);
  }

  const details = document.createElement("div");
  details.className = "search-result-details";

  const title = document.createElement("h3");
  title.textContent = book.title;

  const metadata = document.createElement("dl");
  metadata.className = "search-result-metadata";

  const addMetadata = (label, value) => {
    if (!value) {
      return;
    }

    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.textContent = value;
    metadata.append(term, description);
  };

  addMetadata("Author", book.author);
  addMetadata("ISBN", book.isbn);
  addMetadata("DOI", book.doi);

  const description = document.createElement("p");
  description.className = "search-result-description";
  description.textContent =
    book.description || "No description is available for this book yet.";

  details.append(title, metadata, description);

  if (book.has_file) {
    const readLink = document.createElement("a");
    readLink.className = "search-result-link";
    readLink.href = `reader.html?id=${encodeURIComponent(book.id)}`;
    readLink.target = "_blank";
    readLink.rel = "noopener";
    readLink.textContent = "Start reading";
    readLink.setAttribute("aria-label", `Start reading ${book.title}`);
    details.append(readLink);
  } else {
    const unavailable = document.createElement("span");
    unavailable.className = "search-result-link is-unavailable";
    unavailable.textContent = "Start reading";
    details.append(unavailable);
  }

  card.append(cover, details);
  return card;
}

function renderSearchResults() {
  if (!searchResultsGrid || !searchStatus || !searchResultsCount) {
    return;
  }

  const normalizedQuery = latestSearchQuery.toLowerCase();
  const scopedBooks = latestSearchBooks.filter((book) => {
    if (activeSearchScope === "title") {
      return String(book.title || "").toLowerCase().includes(normalizedQuery);
    }

    if (activeSearchScope === "author") {
      return String(book.author || "").toLowerCase().includes(normalizedQuery);
    }

    return true;
  });
  const visibleBooks = scopedBooks;

  searchResultsGrid.replaceChildren();
  searchStatus.textContent = visibleBooks.length
    ? ""
    : `No books found for “${latestSearchQuery}” in this category.`;
  searchResultsCount.textContent = `${visibleBooks.length.toLocaleString()} ${
    visibleBooks.length === 1 ? "TITLE" : "TITLES"
  } IN`;

  visibleBooks.forEach((book) => {
    searchResultsGrid.append(createSearchResultCard(book));
  });
}

async function searchBooks(query) {
  if (!searchResults || !searchResultsGrid || !searchStatus) {
    return;
  }

  searchResults.hidden = false;
  searchResultsGrid.replaceChildren();
  searchStatus.textContent = "Searching the nook...";
  searchResultsCount.textContent = "";
  latestSearchQuery = query;

  try {
    const response = await fetch(
      `/api/books/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Search request failed");
    }

    latestSearchBooks = await response.json();
    renderSearchResults();
  } catch {
    searchStatus.textContent =
      "We couldn’t search right now. Make sure the server is running and try again.";
  }
}

bookSearchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = bookSearchInput.value.trim();

  if (!query) {
    bookSearchInput.focus();
    return;
  }

  runSearch(query);
});

searchResultTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeSearchScope = tab.dataset.searchScope;

    searchResultTabs.forEach((currentTab) => {
      const isActive = currentTab === tab;
      currentTab.classList.toggle("is-active", isActive);
      currentTab.setAttribute("aria-pressed", String(isActive));
    });

    renderSearchResults();
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
renderRecentSearches();
