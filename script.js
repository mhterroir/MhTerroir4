const sectionsView = document.getElementById("sectionsView");
const galleryView = document.getElementById("galleryView");
const breadcrumbs = document.getElementById("breadcrumbs");
const sectionInfo = document.getElementById("sectionInfo");
const galleryGrid = document.getElementById("galleryGrid");
const galleryEmpty = document.getElementById("galleryEmpty");
const backToSectionsBtn = document.getElementById("backToSections");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxInfo = document.getElementById("lightboxInfo");
const lightboxCounter = document.getElementById("lightboxCounter");
const closeLightboxBtn = document.getElementById("closeLightbox");
const prevImgBtn = document.getElementById("prevImg");
const nextImgBtn = document.getElementById("nextImg");
const downloadBtn = document.getElementById("downloadBtn");

let sectionsConfig = [];
let currentSection = null;
let currentImages = [];
let currentIndex = 0;

async function loadSectionsConfig() {
  const res = await fetch("sections.json");
  sectionsConfig = await res.json();
  renderSections();
  renderBreadcrumbs();
}

function renderSections() {
  sectionsView.innerHTML = "";
  sectionsConfig.forEach((section) => {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.sectionId = section.id;

    const media = document.createElement("div");
    media.className = "card-media";

    const coverImages = section.images.slice(0, 3);
    coverImages.forEach((fileName) => {
      const img = document.createElement("img");
      img.loading = "lazy";
      img.decoding = "async";
      img.src = section.folder + fileName;
      img.alt = section.label;
      media.appendChild(img);
    });

    while (media.children.length < 3) {
      const filler = document.createElement("div");
      filler.style.borderRadius = "7px";
      filler.style.border = "1px dashed rgba(255,255,255,0.16)";
      filler.style.background =
        "radial-gradient(circle at top, rgba(255,255,255,0.03), transparent)";
      media.appendChild(filler);
    }

    const footer = document.createElement("div");
    footer.className = "card-footer";

    const titleWrap = document.createElement("div");
    titleWrap.className = "card-title";

    const title = document.createElement("h2");
    title.textContent = section.label;
    const sub = document.createElement("small");
    sub.textContent = section.description || "";

    titleWrap.appendChild(title);
    titleWrap.appendChild(sub);

    const meta = document.createElement("div");
    meta.className = "card-meta";
    const dot = document.createElement("span");
    dot.className = "dot";
    const count = document.createElement("span");
    count.textContent = `${section.images.length} images`;
    meta.appendChild(dot);
    meta.appendChild(count);

    footer.appendChild(titleWrap);
    footer.appendChild(meta);

    card.appendChild(media);
    card.appendChild(footer);

    card.addEventListener("click", () => openSection(section.id));

    sectionsView.appendChild(card);
  });
}

function openSection(sectionId) {
  const section = sectionsConfig.find((s) => s.id === sectionId);
  if (!section) return;

  currentSection = section;
  currentImages = section.images.map((file) => section.folder + file);
  currentIndex = 0;

  sectionsView.style.display = "grid";
  galleryView.style.display = "block";
  sectionsView.style.display = "none";

  renderBreadcrumbs();
  renderGallery();
}

function goHome() {
  currentSection = null;
  currentImages = [];
  currentIndex = 0;
  sectionsView.style.display = "grid";
  galleryView.style.display = "none";
  renderBreadcrumbs();
}

function renderBreadcrumbs() {
  breadcrumbs.innerHTML = "";

  const homeBtn = document.createElement("button");
  homeBtn.type = "button";
  homeBtn.innerHTML = `<span>Home</span>`;
  homeBtn.addEventListener("click", () => goHome());
  breadcrumbs.appendChild(homeBtn);

  if (currentSection) {
    const sep = document.createElement("span");
    sep.className = "sep";
    sep.textContent = "/";
    const leaf = document.createElement("span");
    leaf.textContent = currentSection.label;
    breadcrumbs.appendChild(sep);
    breadcrumbs.appendChild(leaf);
  }
}

function renderGallery() {
  if (!currentSection) return;

  sectionInfo.innerHTML = "";
  const labelSpan = document.createElement("span");
  labelSpan.innerHTML = `<strong>${currentSection.label}</strong>`;
  const detailSpan = document.createElement("span");
  detailSpan.textContent = `• ${currentSection.images.length} images`;
  sectionInfo.appendChild(labelSpan);
  sectionInfo.appendChild(detailSpan);

  galleryGrid.innerHTML = "";

  if (!currentImages.length) {
    galleryEmpty.style.display = "block";
    return;
  }
  galleryEmpty.style.display = "none";

  currentImages.forEach((src, index) => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.dataset.index = index;

    const img = document.createElement("img");
    img.loading = "lazy";
    img.decoding = "async";
    img.src = src;
    img.alt = currentSection.label + " image " + (index + 1);

    item.appendChild(img);
    item.addEventListener("click", () => openLightbox(index));

    galleryGrid.appendChild(item);
  });
}

function openLightbox(index) {
  if (!currentImages.length) return;
  currentIndex = index;
  updateLightbox();
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function updateLightbox() {
  const src = currentImages[currentIndex];
  lightboxImage.src = src;
  lightboxImage.alt =
    (currentSection ? currentSection.label : "Image") +
    " " +
    (currentIndex + 1);
  lightboxInfo.textContent = `${
    currentSection ? currentSection.label : "Gallery"
  } • ${currentIndex + 1} of ${currentImages.length}`;
  lightboxCounter.textContent = `${currentIndex + 1}/${currentImages.length}`;
  downloadBtn.onclick = () => {
    const a = document.createElement("a");
    a.href = src;
    a.download = src.split("/").pop() || "image";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
}

function showNext(delta) {
  if (!currentImages.length) return;
  currentIndex =
    (currentIndex + delta + currentImages.length) % currentImages.length;
  updateLightbox();
}

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    closeLightbox();
  }
});

closeLightboxBtn.addEventListener("click", closeLightbox);
prevImgBtn.addEventListener("click", () => showNext(-1));
nextImgBtn.addEventListener("click", () => showNext(1));

window.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") showNext(-1);
  if (e.key === "ArrowRight") showNext(1);
});

backToSectionsBtn.addEventListener("click", goHome);

loadSectionsConfig().catch((err) =>
  console.error("Failed to load sections.json", err)
);
