const artworks = [...window.ARTWORKS].sort((a, b) => a.id - b.id);
const grid = document.querySelector("#galleryGrid");
const filters = document.querySelector("#filters");
const searchInput = document.querySelector("#searchInput");
const resultCount = document.querySelector("#resultCount");
const timelineList = document.querySelector("#timelineList");
const stats = document.querySelector("#stats");
const featuredImage = document.querySelector("#featuredImage");
const featuredTitle = document.querySelector("#featuredTitle");
const featuredDate = document.querySelector("#featuredDate");
const openFeatured = document.querySelector("#openFeatured");
const shuffleFeatured = document.querySelector("#shuffleFeatured");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxTitle = document.querySelector("#lightboxTitle");
const lightboxMeta = document.querySelector("#lightboxMeta");
const closeLightbox = document.querySelector("#closeLightbox");

let activeCategory = "全部作品";
let featured = artworks.find((item) => item.title === "青鸾") || artworks[0];

const categories = [
  "全部作品",
  ...Array.from(new Set(artworks.map((item) => item.category))).sort((a, b) => a.localeCompare(b, "zh-CN")),
];

function formatSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function createButton(category) {
  const button = document.createElement("button");
  button.className = "filter";
  button.type = "button";
  button.textContent = category;
  button.dataset.category = category;
  button.addEventListener("click", () => {
    activeCategory = category;
    render();
  });
  return button;
}

function getFilteredItems() {
  const query = searchInput.value.trim().toLowerCase();
  return artworks.filter((item) => {
    const categoryMatch = activeCategory === "全部作品" || item.category === activeCategory;
    const queryMatch = !query || item.title.toLowerCase().includes(query);
    return categoryMatch && queryMatch;
  });
}

function openArtwork(item) {
  lightboxImage.src = item.file;
  lightboxImage.alt = item.title;
  lightboxTitle.textContent = item.title;
  lightboxMeta.textContent = [item.date, item.category, formatSize(item.bytes)].filter(Boolean).join(" · ");
  if (typeof lightbox.showModal === "function") {
    lightbox.showModal();
  } else {
    window.open(item.file, "_blank");
  }
}

function renderFeatured() {
  featuredImage.src = featured.thumb;
  featuredImage.alt = featured.title;
  featuredTitle.textContent = featured.title;
  featuredDate.textContent = [featured.date, featured.category].filter(Boolean).join(" · ");
}

function renderFilters() {
  filters.innerHTML = "";
  categories.forEach((category) => {
    const button = createButton(category);
    button.classList.toggle("active", category === activeCategory);
    filters.append(button);
  });
}

function renderGallery(items) {
  grid.innerHTML = "";
  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "art-card";
    card.tabIndex = 0;
    card.innerHTML = `
      <img src="${item.thumb}" alt="${item.title}" loading="lazy">
      <div class="card-body">
        <h3 class="card-title">${item.title}</h3>
        <div class="card-meta">
          <span>${item.date || "未标日期"}</span>
          <span>${item.category}</span>
        </div>
      </div>
    `;
    card.addEventListener("click", () => openArtwork(item));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openArtwork(item);
      }
    });
    fragment.append(card);
  });

  grid.append(fragment);
  resultCount.textContent = `当前显示 ${items.length} 件作品`;
}

function renderTimeline() {
  timelineList.innerHTML = "";
  artworks
    .filter((item) => item.date)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12)
    .forEach((item) => {
      const row = document.createElement("button");
      row.className = "timeline-item";
      row.type = "button";
      row.innerHTML = `<time>${item.date}</time><strong>${item.title}</strong><span>${item.category}</span>`;
      row.addEventListener("click", () => openArtwork(item));
      timelineList.append(row);
    });
}

function renderStats() {
  const years = new Set(artworks.map((item) => item.date?.slice(0, 4)).filter(Boolean));
  const totalSize = artworks.reduce((sum, item) => sum + item.bytes, 0);
  stats.innerHTML = `
    <div class="stat"><strong>${artworks.length}</strong><span>收录作品</span></div>
    <div class="stat"><strong>${categories.length - 1}</strong><span>创作分类</span></div>
    <div class="stat"><strong>${years.size || "-"}</strong><span>学习年份</span></div>
    <div class="stat"><strong>${formatSize(totalSize)}</strong><span>清晰原图</span></div>
  `;
}

function render() {
  const items = getFilteredItems();
  renderFilters();
  renderGallery(items);
  renderFeatured();
}

searchInput.addEventListener("input", render);
openFeatured.addEventListener("click", () => openArtwork(featured));
shuffleFeatured.addEventListener("click", () => {
  const index = Math.floor(Math.random() * artworks.length);
  featured = artworks[index];
  renderFeatured();
});
closeLightbox.addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightbox.close();
  }
});

renderTimeline();
renderStats();
render();
