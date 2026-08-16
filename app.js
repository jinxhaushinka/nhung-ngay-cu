const gate = document.getElementById("gate");
const content = document.getElementById("content");
const login = document.getElementById("login");
const password = document.getElementById("password");
const error = document.getElementById("error");
const postsEl = document.getElementById("post-list");

login.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (password.value !== BLOG_PASSWORD) {
    error.textContent = "Mật khẩu chưa đúng.";
    error.hidden = false;
    password.select();
    return;
  }

  error.textContent = "";
  error.hidden = true;

  gate.hidden = true;
  content.hidden = false;

  await loadPosts();
});

async function loadPosts() {
  try {
    const response = await fetch("posts.json?v=" + Date.now());

    if (!response.ok) {
      throw new Error("Could not load posts.json");
    }

    const posts = await response.json();

    postsEl.innerHTML = posts.map(post => `
      <article class="post">
        <p class="date">${escapeHtml(post.date || "")}</p>
        <h2>${escapeHtml(post.title || "")}</h2>
        <div class="content">${post.body || post.content || ""}</div>
      </article>
    `).join("");

  } catch (err) {
    postsEl.innerHTML = "<p>Không thể tải bài viết.</p>";
    console.error(err);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
