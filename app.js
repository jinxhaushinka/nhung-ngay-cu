const ITERATIONS = 250000;
const SALT = "nhung-ngay-cu-v1";
const enc = new TextEncoder();
const dec = new TextDecoder();

async function deriveKey(password) {
  const material = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {name:"PBKDF2", salt:enc.encode(SALT), iterations:ITERATIONS, hash:"SHA-256"},
    material, {name:"AES-GCM", length:256}, false, ["decrypt"]
  );
}

async function decryptPayload(payload, password) {
  const key = await deriveKey(password);
  const iv = Uint8Array.from(atob(payload.iv), c=>c.charCodeAt(0));
  const data = Uint8Array.from(atob(payload.data), c=>c.charCodeAt(0));
  const plain = await crypto.subtle.decrypt({name:"AES-GCM", iv}, key, data);
  return JSON.parse(dec.decode(plain));
}

async function load() {
  const res = await fetch("content.enc.json", {cache:"no-store"});
  return res.json();
}

function render(posts) {
  const box = document.getElementById("post-list");
  box.innerHTML = posts.map(p => `
    <article class="post">
      <time>${p.date}</time>
      <h2>${escapeHtml(p.title)}</h2>
      ${p.body.split("\n\n").map(x => `<p>${escapeHtml(x).replaceAll("\n","<br>")}</p>`).join("")}
    </article>
  `).join("");
}
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

document.getElementById("login").addEventListener("submit", async e=>{
  e.preventDefault();
  const error=document.getElementById("error");
  error.hidden=true;
  try {
    const payload=await load();
    const posts=await decryptPayload(payload, document.getElementById("password").value);
    render(posts);
    document.getElementById("gate").hidden=true;
    document.getElementById("content").hidden=false;
  } catch {
    error.hidden=false;
  }
});
