
const menuToggle=document.querySelector(".menu-toggle");
const mainNav=document.querySelector(".main-nav");
menuToggle?.addEventListener("click",()=>{const open=mainNav.classList.toggle("is-open");menuToggle.setAttribute("aria-expanded",String(open));});
document.querySelectorAll(".main-nav a").forEach(link=>link.addEventListener("click",()=>{mainNav?.classList.remove("is-open");menuToggle?.setAttribute("aria-expanded","false");}));
const year=document.querySelector("#year");if(year)year.textContent=new Date().getFullYear();
