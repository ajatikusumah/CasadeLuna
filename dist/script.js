
const menuToggle=document.querySelector(".menu-toggle");
const mainNav=document.querySelector(".main-nav");
menuToggle?.addEventListener("click",()=>{const open=mainNav.classList.toggle("is-open");menuToggle.setAttribute("aria-expanded",String(open));});
document.querySelectorAll(".main-nav a").forEach(link=>link.addEventListener("click",()=>{mainNav?.classList.remove("is-open");menuToggle?.setAttribute("aria-expanded","false");}));
const year=document.querySelector("#year");if(year)year.textContent=new Date().getFullYear();

// The public layout stays hand-designed; settings only replace copy, links and visibility.
fetch("content/settings.json").then(r=>r.ok?r.json():Promise.reject()).then(settings=>{
  const id=settings.identity||{}, menu=settings.menu||{}, contact=settings.contact||{}, home=settings.home||{};
  const announcement=document.querySelector(".announcement"); if(announcement&&id.announcement)announcement.innerHTML=`<span>✦</span> ${id.announcement} <span>✦</span>`;
  document.querySelectorAll(".brand-tagline").forEach(el=>{if(id.tagline)el.textContent=id.tagline;});
  document.querySelectorAll(".footer-quote").forEach(el=>{if(id.footerQuote)el.textContent=id.footerQuote;});
  document.querySelectorAll(".main-nav a").forEach(link=>{const href=link.getAttribute("href")||""; const key=href.includes("tentang")?"tentang":href.includes("kucing")?"kucing":href.includes("cerita")?"cerita":href.includes("pet-care")?"petCare":href.includes("shop")?"shop":href.includes("kontak")?"kontak":"beranda"; if(menu[key])link.textContent=menu[key]; if(menu[`show${key[0].toUpperCase()+key.slice(1)}`]===false)link.hidden=true;});
  document.querySelectorAll(".header-cta").forEach(el=>{if(menu.cta)el.lastChild.textContent=` ${menu.cta}`;});
  document.querySelectorAll("a[href*='wa.me']").forEach(el=>{if(contact.whatsapp){const url=new URL(el.href);url.pathname=`/${contact.whatsapp}`;el.href=url.toString();}});
  document.querySelectorAll("a[href^='mailto:']").forEach(el=>{if(contact.email){el.href=`mailto:${contact.email}`;el.textContent=contact.email;}});
  document.querySelectorAll("a[href*='instagram.com']").forEach(el=>{if(contact.instagram)el.href=contact.instagram;if(contact.instagramLabel&&el.classList.contains("contact-link"))el.textContent=contact.instagramLabel;});
  if(home.metaTitle)document.title=home.metaTitle;
  const desc=document.querySelector("meta[name='description']");if(desc&&home.metaDescription)desc.content=home.metaDescription;
}).catch(()=>{});

const galleryContainers=document.querySelectorAll("[data-gallery=photos]");
let galleryStoryDialog;
const openGalleryStory=(item)=>{
  if(!galleryStoryDialog){
    galleryStoryDialog=document.createElement("dialog");
    galleryStoryDialog.className="story-dialog";
    galleryStoryDialog.setAttribute("aria-labelledby","story-dialog-title");
    galleryStoryDialog.innerHTML=`<div class="story-dialog__card"><button class="story-dialog__close" type="button" aria-label="Tutup cerita">×</button><img class="story-dialog__image" alt="" /><div class="story-dialog__copy"><span class="story-dialog__source"></span><h2 id="story-dialog-title"></h2><p></p></div></div>`;
    document.body.append(galleryStoryDialog);
    galleryStoryDialog.querySelector(".story-dialog__close").addEventListener("click",()=>galleryStoryDialog.close());
    galleryStoryDialog.addEventListener("click",event=>{if(event.target===galleryStoryDialog)galleryStoryDialog.close();});
  }
  const image=galleryStoryDialog.querySelector(".story-dialog__image");
  image.src=item.image;image.alt=item.alt||item.caption||"Foto Casa de Luna";
  galleryStoryDialog.querySelector(".story-dialog__source").textContent=item.source||"Casa de Luna";
  galleryStoryDialog.querySelector("h2").textContent=item.caption||"Cerita Casa de Luna";
  galleryStoryDialog.querySelector("p").textContent=item.story||"Setiap foto menyimpan bagian kecil dari perjalanan di Casa de Luna.";
  if(typeof galleryStoryDialog.showModal==="function")galleryStoryDialog.showModal();
};
const bindGalleryCard=(card,item)=>{
  card.dataset.galleryStory="true";
  card.addEventListener("click",event=>{event.preventDefault();openGalleryStory(item);});
  card.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();openGalleryStory(item);}});
  if(card.tagName!=="A"){card.tabIndex=0;card.setAttribute("role","button");}
};
if(galleryContainers.length){
  fetch("content/gallery.json").then(response=>response.ok?response.json():Promise.reject(new Error("gallery unavailable"))).then(items=>{
    galleryContainers.forEach(container=>{
      const visible=items.filter(item=>item.visible!==false&&item.image);
      container.replaceChildren(...visible.map((item,index)=>{
        const mode=container.dataset.galleryMode;
        const card=mode==="story"?document.createElement("figure"):document.createElement("a");
        card.className=`cat-gallery-card${item.raised||index%3===1?" cat-gallery-card--raised":""}`;
        if(mode!=="story")card.href="cerita.html#gallery";
        const image=document.createElement("img");image.src=item.image;image.alt=item.alt||item.caption||"Foto Casa de Luna";image.loading=index<3?"eager":"lazy";image.decoding="async";card.append(image);
        const caption=document.createElement(mode==="story"?"figcaption":"span");caption.textContent=item.caption||item.source||"Casa de Luna";card.append(caption);
        bindGalleryCard(card,item);return card;
      }));
    });
  }).catch(()=>{});
}

// Apply editable copy to every public menu without changing the hand-designed layout.
fetch("content/settings.json").then(r=>r.ok?r.json():Promise.reject()).then(settings=>{
  const p=settings.pages||{}, home=settings.home||{}, id=settings.identity||{}, contact=settings.contact||{};
  const path=location.pathname.split("/").pop()||"index.html";
  const map=path==="tentang.html"?{eyebrow:p.aboutEyebrow,title:p.aboutTitle,intro:p.aboutIntro}:path==="kucing.html"?{eyebrow:p.catsEyebrow,title:p.catsTitle,intro:p.catsIntro}:path==="cerita.html"?{eyebrow:p.storiesEyebrow,title:p.storiesTitle,intro:p.storiesIntro}:path==="pet-care.html"?{eyebrow:p.careEyebrow,title:p.careTitle,intro:p.careIntro}:path==="shop.html"?{eyebrow:p.shopEyebrow,title:p.shopTitle,intro:p.shopIntro}:path==="dukung.html"?{eyebrow:p.supportEyebrow,title:p.supportTitle,intro:p.supportIntro}:path==="kontak.html"?{eyebrow:p.contactEyebrow,title:p.contactTitle,intro:p.contactIntro}:{eyebrow:home.heroEyebrow,title:home.heroTitle,intro:home.heroIntro};
  const hero=document.querySelector(".page-hero,.home-hero"); if(hero){const e=hero.querySelector(".eyebrow");if(e&&map.eyebrow)e.textContent=map.eyebrow;const t=hero.querySelector("h1");if(t&&map.title)t.textContent=map.title;const i=hero.querySelector(".hero-intro,.page-hero>p:last-child");if(i&&map.intro)i.textContent=map.intro;}
  document.querySelectorAll(".site-footer .footer-quote").forEach(e=>{if(id.footerQuote)e.textContent=id.footerQuote;});
  document.querySelectorAll(".home-contact h2").forEach(e=>{if(id.location)e.innerHTML=`Temui Casa de Luna<br /><em>di area ${id.location}.</em>`;});
  document.querySelectorAll(".contact-grid p").forEach(e=>{if(e.textContent.includes("Sabtu")&&contact.visitHours)e.textContent=contact.visitHours;if(e.textContent.includes("Alamat lengkap")&&contact.addressNote)e.textContent=contact.addressNote;});
}).catch(()=>{});
