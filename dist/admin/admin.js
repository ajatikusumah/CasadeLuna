const SOURCES = {
  gallery: {file: "../content/gallery.json", label: "Foto galeri", title: "Wajah-wajah kecil di rumah rembulan.", template: "gallery-template", addLabel: "Tambah foto"},
  cats: {file: "../content/cats.json", label: "Profil kucing", title: "Kenalan dengan anabul.", template: "cats-template", addLabel: "Tambah profil kucing"},
  stories: {file: "../content/stories.json", label: "Stories of de Luna", title: "Cerita yang tinggal di hati.", template: "stories-template", addLabel: "Tambah cerita"},
  "pet-care": {file: "../content/pet-care.json", label: "Panduan Pet Care", title: "Rawat dengan tenang.", template: "pet-care-template", addLabel: "Tambah kelompok panduan"}
};

const SETTINGS_DEFAULT = {
  identity: {siteName:"Casa de Luna", tagline:"CARE | MERCH | CONSULTANCY", announcement:"Lebih banyak kucing pulang. Lebih banyak hati yang utuh.", location:"Bogor", footerQuote:"gentle care for every paw — a home under the moon", primaryColor:"#132b45", accentColor:"#b9684f"},
  menu: {beranda:"Beranda", tentang:"Tentang", kucing:"Kucing", cerita:"Cerita", petCare:"Pet Care", shop:"Shop", kontak:"Kontak", cta:"Dukung", showTentang:true, showKucing:true, showCerita:true, showPetCare:true, showShop:true, showKontak:true},
  contact: {whatsapp:"6281389888900", email:"hello@casadeluna.id", instagram:"https://www.instagram.com/casadeluna19/", instagramLabel:"@Casadeluna19", visitHours:"Sabtu–Minggu, 10.00–15.00, dengan janji temu.", addressNote:"Alamat lengkap dikirimkan setelah konfirmasi melalui WhatsApp.", donationText:"Dukung perawatan, pakan, dan proses pulang anabul Casa de Luna.", bank:"", ewallet:"", qris:""},
  home: {metaTitle:"Rumah untuk Pulang — Casa de Luna", metaDescription:"Rumah untuk pulang — Casa de Luna, shelter kucing di Bogor.", heroEyebrow:"Casa de Luna · rumah bagi cerita", heroTitle:"Setiap kucing berhak memiliki tempat untuk pulang.", heroIntro:"Di Casa de Luna, kucing-kucing yang diselamatkan mendapatkan perawatan dan kesempatan menemukan jalan pulang.", featuredStory:"Dari Stories of de Luna", featuredGallery:"Dari Photos Anabul", shopStatus:"Shop akan segera dibuka.", maintenance:false},
  pages: {aboutEyebrow:"Tentang Casa de Luna", aboutTitle:"Rumah bagi cerita, tempat rindu pulang.", aboutIntro:"Casa de Luna hadir untuk memberi kucing-kucing terlantar ruang aman untuk pulih, bertumbuh, dan menemukan keluarga yang tepat.", catsEyebrow:"Kenalan dengan anabul", catsTitle:"Yuk kenalan dengan kita.", catsIntro:"Profil di bawah adalah pengantar. Untuk status terbaru dan kecocokan adopsi, silakan hubungi kami melalui WhatsApp.", storiesEyebrow:"Stories of de Luna", storiesTitle:"Cerita yang tinggal lebih lama di hati.", storiesIntro:"Materi dan nuansa halaman ini mengikuti perjalanan setiap anabul.", careEyebrow:"Casa de Luna Pet Care", careTitle:"Perawatan yang aman, langsung dari rumah rembulan.", careIntro:"Layanan perawatan untuk kucing sehat, rawat jalan, dan kebutuhan rawat inap.", shopEyebrow:"Casa de Luna Shop", shopTitle:"Kebaikan yang bisa dibawa pulang.", shopIntro:"Shop sedang disiapkan sebagai pintu masuk untuk karya dan barang yang ikut mendukung kehidupan anabul.", supportEyebrow:"Banyak cara untuk membantu", supportTitle:"Menjadi bagian dari perubahan.", supportIntro:"Setiap dukungan membantu Casa de Luna memberi tempat aman, perawatan, dan harapan.", contactEyebrow:"Hubungi Casa de Luna", contactTitle:"Mulai dari satu percakapan.", contactIntro:"Kami berada di area Bogor. Kunjungan dilakukan dengan janji temu untuk menjaga keamanan dan ketenangan shelter."},
  access: {adminUsername:"admin", sessionMinutes:60}
};

const state = {data: {}, settings: {}, active: "gallery"};
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
function mergeSettings(base, saved){ return Object.fromEntries(Object.keys(base).map(key=>[key,{...base[key],...(saved[key]||{})}])); }

function storageKey(section) {
  return `casa-de-luna-admin:${section}`;
}

function settingsKey(){ return "casa-de-luna-admin:settings"; }
function isUnlocked(){ return sessionStorage.getItem("casa-de-luna-admin:session") === "unlocked"; }
async function digest(value){ const bytes=new TextEncoder().encode(value); const hash=await crypto.subtle.digest("SHA-256",bytes); return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,"0")).join(""); }
function showApp(){ $("#login-screen").hidden=true; $(".admin-shell").hidden=false; }
function showLogin(message=""){ $("#login-screen").hidden=false; $(".admin-shell").hidden=true; $("#login-description").textContent=message||"Masukkan kata sandi admin untuk melanjutkan."; $("#login-confirm-wrap").hidden=true; $("#login-submit").textContent="Masuk"; }
async function handleLogin(event){ event.preventDefault(); const password=$("#login-pin").value; const username=$("#login-user").value.trim(); const error=$("#login-error"); error.textContent=""; try { const response=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,password})}); const body=await response.json(); if(!response.ok) throw new Error(body.error||"Login gagal."); sessionStorage.setItem("casa-de-luna-admin:session","unlocked"); $("#login-pin").value=""; showApp(); await loadAllSources(); render("gallery"); } catch (e) { error.textContent=e.message; } }
async function loadAllSources(){ state.settings=mergeSettings(clone(SETTINGS_DEFAULT),JSON.parse(localStorage.getItem(settingsKey())||"{}")); await Promise.all(Object.keys(SOURCES).map(async (section) => { state.data[section] = await loadSource(section); })); try { const remote=await fetch("/api/content/settings"); if(remote.ok) state.settings=mergeSettings(clone(SETTINGS_DEFAULT),await remote.json()); } catch (_) {} }

async function loadSource(section) {
  const stored = localStorage.getItem(storageKey(section));
  if (stored) {
    try { return JSON.parse(stored); } catch (_) { localStorage.removeItem(storageKey(section)); }
  }
  const response = await fetch(`/api/content/${section}`).catch(() => fetch(SOURCES[section].file));
  if (!response.ok) throw new Error(`Tidak bisa memuat ${section}`);
  return response.json();
}

function itemCount(section) {
  const value = state.data[section];
  return section === "pet-care" ? value.reduce((total, group) => total + (group.images?.length || 0), 0) : value.length;
}

function setField(element, value) {
  if (element.type === "checkbox") element.checked = Boolean(value);
  else element.value = value ?? "";
}

function getField(element) {
  return element.type === "checkbox" ? element.checked : element.value;
}

function renderPetCareImages(list, images) {
  list.innerHTML = "";
  (images || []).forEach((image, index) => {
    const row = document.createElement("div");
    row.className = "image-row";
    row.innerHTML = `<label>Foto ${index + 1}<input data-image-field="image" type="text" value="${escapeAttribute(image.image)}" /></label><label>Caption<input data-image-field="caption" type="text" value="${escapeAttribute(image.caption)}" /></label><button class="remove-image" type="button">Hapus</button>`;
    $(".remove-image", row).addEventListener("click", () => { row.remove(); persistActive(); });
    list.append(row);
  });
  const addImage = document.createElement("button");
  addImage.className = "add-button";
  addImage.type = "button";
  addImage.textContent = "+ Tambah foto dalam kelompok ini";
  addImage.addEventListener("click", () => {
    const row = document.createElement("div");
    row.className = "image-row";
    row.innerHTML = `<label>Foto baru<input data-image-field="image" type="text" placeholder="assets/photos/nama-foto.jpg" /></label><label>Caption<input data-image-field="caption" type="text" placeholder="Caption foto" /></label><button class="remove-image" type="button">Hapus</button>`;
    $(".remove-image", row).addEventListener("click", () => { row.remove(); persistActive(); });
    list.insertBefore(row, addImage);
  });
  list.append(addImage);
}

function escapeAttribute(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function makeCard(section, item, index) {
  const template = document.getElementById(SOURCES[section].template);
  const card = template.content.firstElementChild.cloneNode(true);
  $("[data-item-number]", card).textContent = String(index + 1).padStart(2, "0");
  $$('[data-field]', card).forEach((field) => setField(field, item[field.dataset.field]));
  if (section === "pet-care") renderPetCareImages($("[data-image-list]", card), item.images);
  $$("[data-field]", card).forEach((field) => field.addEventListener("input", persistActive));
  $("[data-remove]", card).addEventListener("click", () => { card.remove(); persistActive(); renumber(); });
  return card;
}

function render(section) {
  state.active = section;
  if(["settings","contact","home"].includes(section)) return renderSettings(section);
  const source = SOURCES[section];
  $("#section-kicker").textContent = source.label;
  $("#section-title").textContent = source.title;
  const root = $("#editor-content");
  root.innerHTML = "";
  (state.data[section] || []).forEach((item, index) => root.append(makeCard(section, item, index)));
  if (!state.data[section]?.length) root.innerHTML = '<div class="empty-state">Belum ada data. Tambahkan item pertama di bawah.</div>';
  const add = document.createElement("button");
  add.className = "add-button";
  add.type = "button";
  add.textContent = `+ ${source.addLabel}`;
  add.addEventListener("click", () => addItem(section));
  root.append(add);
  $$(".tab-button").forEach((button) => button.classList.toggle("is-active", button.dataset.section === section));
  updateCounts();
}

const SETTINGS_SECTIONS={settings:{label:"Identitas & menu",title:"Atur wajah dan navigasi Casa de Luna.",groups:["identity","menu"]},contact:{label:"Kontak & dukung",title:"Pastikan orang tahu cara menghubungi dan membantu.",groups:["contact"]},home:{label:"Beranda & SEO",title:"Kelola pesan utama yang tampil di website.",groups:["home"]},pages:{label:"Halaman website",title:"Atur pengantar untuk setiap menu utama.",groups:["pages"]},access:{label:"Keamanan admin",title:"Kelola akun lokal dan durasi sesi admin.",groups:["access"]}};
const SETTING_LABELS={siteName:"Nama website",tagline:"Tagline",announcement:"Pengumuman atas",location:"Lokasi singkat",footerQuote:"Kutipan footer",primaryColor:"Warna utama",accentColor:"Warna aksen",beranda:"Label Beranda",tentang:"Label Tentang",kucing:"Label Kucing",cerita:"Label Cerita",petCare:"Label Pet Care",shop:"Label Shop",kontak:"Label Kontak",cta:"Label tombol Dukung",showTentang:"Tampilkan Tentang",showKucing:"Tampilkan Kucing",showCerita:"Tampilkan Cerita",showPetCare:"Tampilkan Pet Care",showShop:"Tampilkan Shop",showKontak:"Tampilkan Kontak",whatsapp:"Nomor WhatsApp",email:"Email",instagram:"Instagram URL",instagramLabel:"Nama Instagram",visitHours:"Jam kunjungan",addressNote:"Catatan alamat",donationText:"Pesan dukungan",bank:"Rekening bank",ewallet:"E-wallet",qris:"QRIS / tautan donasi",metaTitle:"Judul SEO",metaDescription:"Deskripsi SEO",heroEyebrow:"Eyebrow beranda",heroTitle:"Judul hero",heroIntro:"Pengantar hero",featuredStory:"Label cerita unggulan",featuredGallery:"Label galeri",shopStatus:"Pesan status Shop",maintenance:"Mode pemeliharaan",adminUsername:"Nama pengguna admin",sessionMinutes:"Durasi sesi (menit)"};
function renderSettings(section){ const config=SETTINGS_SECTIONS[section]; $("#section-kicker").textContent=config.label; $("#section-title").textContent=config.title; const root=$("#editor-content"); root.innerHTML=""; const form=document.createElement("div"); form.className="settings-grid"; config.groups.forEach(group=>{ const wrap=document.createElement("section"); wrap.className="settings-group"; const h=document.createElement("h3"); h.textContent=group==="identity"?"Identitas":group==="menu"?"Menu navigasi":group==="contact"?"Kontak, kunjungan & donasi":"Beranda, pesan & SEO"; wrap.append(h); Object.entries(state.settings[group]).forEach(([key,value])=>{const label=document.createElement("label"); label.className=value===true||value===false?"setting-check":""; label.textContent=SETTING_LABELS[key]||key; const input=document.createElement("input"); input.type=typeof value==="boolean"?"checkbox":key.toLowerCase().includes("color")?"color":"text"; if(input.type==="checkbox")input.checked=value; else input.value=value??""; input.dataset.group=group; input.dataset.key=key; label.append(input); wrap.append(label);}); form.append(wrap); }); root.append(form); const actions=document.createElement("div"); actions.className="settings-actions"; actions.innerHTML='<button class="button button--dark" type="button" id="save-settings">Simpan pengaturan</button><button class="button" type="button" id="download-settings">Unduh settings.json</button>'; root.append(actions); $$("input",form).forEach(input=>input.addEventListener("input",()=>{state.settings[input.dataset.group][input.dataset.key]=input.type==="checkbox"?input.checked:input.value; localStorage.setItem(settingsKey(),JSON.stringify(state.settings)); $("#draft-status").textContent="Pengaturan tersimpan sebagai draft";})); $("#save-settings").addEventListener("click",()=>{localStorage.setItem(settingsKey(),JSON.stringify(state.settings)); download("settings.json",state.settings); $("#draft-status").textContent="Pengaturan siap dipublikasikan";}); $("#download-settings").addEventListener("click",()=>download("settings.json",state.settings)); }

// Extended settings renderer: includes all public menu groups and PIN rotation.
function renderSettings(section){
  const config=SETTINGS_SECTIONS[section]; $("#section-kicker").textContent=config.label; $("#section-title").textContent=config.title;
  const root=$("#editor-content"); root.innerHTML=""; const form=document.createElement("div"); form.className="settings-grid";
  config.groups.forEach(group=>{const wrap=document.createElement("section");wrap.className="settings-group";const h=document.createElement("h3");h.textContent=group==="identity"?"Identitas":group==="menu"?"Menu navigasi":group==="contact"?"Kontak, kunjungan & donasi":group==="pages"?"Pengantar setiap halaman":group==="access"?"Akses admin":"Beranda, pesan & SEO";wrap.append(h);
    Object.entries(state.settings[group]).forEach(([key,value])=>{const label=document.createElement("label");label.className=value===true||value===false?"setting-check":"";label.textContent=SETTING_LABELS[key]||key;const input=document.createElement("input");input.type=typeof value==="boolean"?"checkbox":key.toLowerCase().includes("color")?"color":"text";if(input.type==="checkbox")input.checked=value;else input.value=value??"";input.dataset.group=group;input.dataset.key=key;label.append(input);wrap.append(label);});form.append(wrap);});root.append(form);
  if(section==="access"){const reset=document.createElement("section");reset.className="settings-group";reset.innerHTML='<h3>Ganti PIN admin</h3><label>PIN baru<input id="new-admin-pin" type="password" minlength="6"></label><label>Ulangi PIN baru<input id="confirm-admin-pin" type="password" minlength="6"></label><button class="button" type="button" id="change-admin-pin">Simpan PIN baru</button><p class="login-error" id="pin-change-status"></p>';root.append(reset);$("#change-admin-pin",reset).addEventListener("click",async()=>{const pin=$("#new-admin-pin",reset).value;const confirm=$("#confirm-admin-pin",reset).value;const status=$("#pin-change-status",reset);if(pin.length<6||pin!==confirm){status.textContent="PIN minimal 6 karakter dan harus sama.";return;}localStorage.setItem("casa-de-luna-admin:pin-hash",await digest(pin));sessionStorage.removeItem("casa-de-luna-admin:session");showLogin();});}
  const actions=document.createElement("div");actions.className="settings-actions";actions.innerHTML='<button class="button button--dark" type="button" id="save-settings">Simpan online</button><button class="button" type="button" id="download-settings">Unduh settings.json</button>';root.append(actions);$$('input',form).forEach(input=>input.addEventListener('input',()=>{state.settings[input.dataset.group][input.dataset.key]=input.type==='checkbox'?input.checked:input.value;localStorage.setItem(settingsKey(),JSON.stringify(state.settings));$("#draft-status").textContent="Pengaturan tersimpan sebagai draft";}));$("#save-settings").addEventListener("click",()=>publish("settings",state.settings));$("#download-settings").addEventListener("click",()=>download("settings.json",state.settings));
}

async function publish(section, value){ try { $("#draft-status").textContent="Menyimpan ke GitHub…"; const response=await fetch(`/api/content/${section}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(value)}); const body=await response.json(); if(!response.ok) throw new Error(body.error||"Publikasi gagal."); $("#draft-status").textContent="Tersimpan online di GitHub"; } catch (e) { $("#draft-status").textContent=e.message; } }

function emptyItem(section) {
  if (section === "gallery") return {image: "", alt: "", caption: "", source: "Photos Anabul", raised: false, visible: true};
  if (section === "cats") return {id: "kucing-baru", name: "Kucing baru", meta: "", status: "Dalam perawatan", bio: "", avatarClass: "cat-avatar--luna", initial: "K"};
  if (section === "stories") return {id: "cerita-baru", tag: "Kisah anabul", title: "Cerita baru", description: "", image: "", alt: "", linkLabel: "Baca cerita", link: "cerita.html"};
  return {id: "panduan-baru", number: String(state.data[section].length + 1).padStart(2, "0"), title: "Kelompok panduan baru", intro: "", images: []};
}

function addItem(section) {
  if (document.querySelector(".empty-state")) $(".empty-state").remove();
  state.data[section].push(emptyItem(section));
  render(section);
  $(".editor-card:last-of-type input", $("#editor-content"))?.focus();
  persistActive();
}

function readCard(section, card) {
  const item = {};
  $$('[data-field]', card).forEach((field) => { item[field.dataset.field] = getField(field); });
  if (section === "pet-care") item.images = $$(".image-row", card).map((row) => ({image: $("[data-image-field=image]", row)?.value || "", caption: $("[data-image-field=caption]", row)?.value || ""}));
  return item;
}

function persistActive() {
  const section = state.active;
  const cards = $$("[data-item-card]", $("#editor-content"));
  state.data[section] = cards.map((card) => readCard(section, card));
  localStorage.setItem(storageKey(section), JSON.stringify(state.data[section]));
  $("#draft-status").textContent = `Draft ${new Date().toLocaleTimeString("id-ID", {hour: "2-digit", minute: "2-digit"})}`;
  updateCounts();
}

function renumber() { $$("[data-item-number]").forEach((number, index) => { number.textContent = String(index + 1).padStart(2, "0"); }); }

function updateCounts() { Object.keys(SOURCES).forEach((section) => { const count = document.querySelector(`[data-count="${section}"]`); if (count) count.textContent = itemCount(section); }); }

function download(name, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], {type: "application/json"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function init() {
  showLogin("Masukkan kata sandi admin untuk melanjutkan.");
  $("#login-form").addEventListener("submit",handleLogin);
  $("#logout-button").addEventListener("click",async()=>{await fetch("/api/auth/logout",{method:"POST"});sessionStorage.removeItem("casa-de-luna-admin:session");showLogin();});
  try { const auth=await fetch("/api/auth/me"); const body=await auth.json(); if(!body.authenticated) return; } catch (_) { return; }
  showApp();
  await loadAllSources();
  render("gallery");
  $$(".tab-button").forEach((button) => button.addEventListener("click", () => { if(SOURCES[state.active])persistActive(); render(button.dataset.section); }));
  $("#download-section").addEventListener("click", () => { persistActive(); download(`${state.active}.json`, state.data[state.active]); });
  $("#publish-section").addEventListener("click", () => { if(SOURCES[state.active]) { persistActive(); publish(state.active, state.data[state.active]); } else publish("settings", state.settings); });
  $("#download-all").addEventListener("click", () => { persistActive(); download("casa-de-luna-content.json", state.data); });
  $("#draft-status").textContent = "Draft siap diedit";
}

init().catch((error) => { $("#draft-status").textContent = "Data belum bisa dimuat"; $("#editor-content").innerHTML = `<div class="empty-state">${error.message}. Buka halaman melalui website, bukan file lokal.</div>`; });
