/* ===== CONFIG — edit these two lines ===== */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xrpgwjpl";
const WHATSAPP_NUMBER = "919489561162";

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce =
  matchMedia("(prefers-reduced-motion: reduce)").matches ||
  matchMedia("(max-width: 768px)").matches;

/* Navbar: darken on scroll, mobile menu */
const nav = $("#nav"), burger = $("#burger"), menu = $("#menu");
const closeMenu = () => { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); };
burger.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
});
$$("a", menu).forEach(a => a.addEventListener("click", closeMenu));

/* Scroll: nav state + parallax (single rAF loop) */
const heroBg = $("#heroBg"), pImgs = $$("[data-parallax]");
let ticking = false;
function onScroll() {
  const y = scrollY;
  nav.classList.toggle("scrolled", y > 40);
  if (!reduce) {
    if (y < innerHeight * 1.2) heroBg.style.transform = `translate3d(0,${y * 0.25}px,0)`;
    pImgs.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) img.style.transform = `translate3d(0,${(r.top - innerHeight / 2) * -0.06}px,0)`;
    });
  }
  ticking = false;
}
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

/* Reveal on scroll */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
$$(".reveal, .reveal-img").forEach(el => io.observe(el));

/* Cinematic strip: words light up in turn */
const words = $$(".strip__track span");
let w = 0;
if (!reduce) setInterval(() => { words.forEach((s, i) => s.classList.toggle("on", i === w)); w = (w + 1) % words.length; }, 1800);

/* Occasion buttons preselect event type */
$$("[data-event]").forEach(b => b.addEventListener("click", () => { $("#event").value = b.dataset.event; }));

/* Lightbox */
const lb = $("#lb"), lbImg = $("#lbImg");
const shots = $$(".g-open");
let cur = 0;
function show(i) {
  cur = (i + shots.length) % shots.length;
  const img = $("img", shots[cur]);
  lb.classList.toggle("empty", !img);
  if (img) { lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt; }
}
shots.forEach((b, i) => b.addEventListener("click", () => { lb.hidden = false; document.body.style.overflow = "hidden"; show(i); $("#lbClose").focus(); }));
const closeLb = () => { lb.hidden = true; document.body.style.overflow = ""; shots[cur].focus(); };
$("#lbClose").addEventListener("click", closeLb);
$("#lbPrev").addEventListener("click", () => show(cur - 1));
$("#lbNext").addEventListener("click", () => show(cur + 1));
lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") show(cur - 1);
  if (e.key === "ArrowRight") show(cur + 1);
});
let tx = 0;
lb.addEventListener("touchstart", e => tx = e.touches[0].clientX, { passive: true });
lb.addEventListener("touchend", e => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) show(cur + (d < 0 ? 1 : -1)); });

/* Booking form */
const form = $("#bookingForm"), err = $("#formErr"), btn = $("#submitBtn"), thanks = $("#thanks");
$("#date").min = new Date().toISOString().split("T")[0];
form.addEventListener("submit", async e => {
  e.preventDefault();
  err.hidden = true;
  const d = Object.fromEntries(new FormData(form));
  if (!d.name.trim() || !d.phone.trim() || !d.event || !d.date) {
    err.textContent = "Please fill in your name, phone number, event type and preferred date.";
    err.hidden = false; return;
  }
  btn.disabled = true; btn.textContent = "SENDING...";
  try {
    const res = await fetch(FORMSPREE_ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) });
    if (!res.ok) throw new Error();
    const msg = `Hi JMAX, I would like to book a private theatre experience. My name is ${d.name}. I am interested in ${d.event} on ${d.date}.`;
    $("#waBook").href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    form.hidden = true; thanks.hidden = false; thanks.focus();
    form.reset();
  } catch {
    err.textContent = "We couldn't send your request. Please try again or message us on WhatsApp.";
    err.hidden = false;
  } finally {
    btn.disabled = false; btn.textContent = "REQUEST BOOKING";
  }
});
