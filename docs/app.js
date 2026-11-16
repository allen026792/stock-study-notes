const home = document.querySelector("#home");
const reader = document.querySelector("#reader");
const slide = document.querySelector("#slide");
const previous = document.querySelector("#prev");
const next = document.querySelector("#next");
const pages = lessons.flatMap(lesson => lesson.slides.map(page => ({ ...page, chapter: lesson.title })));

function element(tag, value, className) {
  const node = document.createElement(tag);
  node.textContent = value;
  if (className) node.className = className;
  return node;
}

let start = 1;
for (const [index, lesson] of lessons.entries()) {
  const card = element("article", "", "card");
  const icon = element("span", ["📒", "🧮", "✏️"][index % 3], "chapter-icon");
  icon.setAttribute("aria-hidden", "true");
  const link = element("a", "開始閱讀 →", "button");
  link.href = "#/" + start;
  card.append(icon, element("p", lesson.slides.length + " 頁", "label"), element("h3", lesson.title), element("p", lesson.summary), link);
  document.querySelector("#cards").append(card);
  start += lesson.slides.length;
}

function currentPage() {
  const match = location.hash.match(/^#\/(\d+)$/);
  const number = match ? Number(match[1]) : 0;
  return number >= 1 && number <= pages.length ? number : 0;
}

function turn(offset) {
  const number = currentPage() + offset;
  if (number >= 1 && number <= pages.length) location.hash = "/" + number;
}

function render() {
  const number = currentPage();
  home.hidden = Boolean(number);
  reader.hidden = !number;
  if (!number) return;

  const page = pages[number - 1];
  const title = element("h1", page.title);
  title.tabIndex = -1;
  slide.replaceChildren(element("p", page.chapter, "label"), title, element("p", page.body, "content"));
  if (page.example) {
    const calculation = element("div", "", "example");
    calculation.append(element("span", "試算", "label"), element("p", page.example));
    slide.append(calculation);
  }
  if (page.answer) {
    const details = document.createElement("details");
    details.append(element("summary", "翻開解答"), element("p", page.answer));
    slide.append(details);
  }
  document.querySelector("#page-number").textContent = "第 " + number + " / " + pages.length + " 頁";
  const progress = document.querySelector("#progress");
  progress.max = pages.length;
  progress.value = number;
  previous.disabled = number === 1;
  next.textContent = number === pages.length ? "回講義目錄" : "下一頁 →";
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    slide.animate([{ opacity: 0.55, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 210 });
  }
  window.scrollTo(0, 0);
  title.focus({ preventScroll: true });
}

previous.addEventListener("click", () => turn(-1));
next.addEventListener("click", () => {
  if (currentPage() === pages.length) location.href = "./index.html";
  else turn(1);
});
window.addEventListener("hashchange", render);
window.addEventListener("keydown", event => {
  if (!currentPage() || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    turn(event.key === "ArrowLeft" ? -1 : 1);
  }
});
render();
