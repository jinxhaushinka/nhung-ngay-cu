const gate = document.getElementById("gate");
const content = document.getElementById("content");
const login = document.getElementById("login");
const password = document.getElementById("password");
const error = document.getElementById("error");
const postsEl = document.getElementById("post-list");

let allPosts = [];

login.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (password.value !== BLOG_PASSWORD) {
    error.textContent = "Mật khẩu không đúng.";
    error.hidden = false;
    password.select();
    return;
  }

  error.hidden = true;
  gate.hidden = true;
  content.hidden = false;

  await loadPosts();
});

async function loadPosts() {
  try {
    const response = await fetch("posts.json?v=" + Date.now());

    if (!response.ok) {
      throw new Error("Không thể tải posts.json");
    }

    allPosts = await response.json();

    const postId = new URLSearchParams(window.location.search).get("post");

    if (postId) {
      showSinglePost(postId);
    } else {
      showPostList();
    }

  } catch (err) {
    console.error(err);
    postsEl.innerHTML = "<p>Không thể tải bài viết.</p>";
  }
}

function showPostList() {
  postsEl.innerHTML = allPosts.map(function (post) {
    const excerpt = createExcerpt(post.content || post.body || "");

    return `
      <article class="post-preview">
        <p class="date">${escapeHtml(post.date || "")}</p>

        <h2>
          <a href="?post=${encodeURIComponent(post.id)}">
            ${escapeHtml(post.title || "")}
          </a>
        </h2>

        <p class="excerpt">
          ${escapeHtml(excerpt)}
        </p>

        <a class="read-more" href="?post=${encodeURIComponent(post.id)}">
          Đọc tiếp →
        </a>
      </article>
    `;
  }).join("");
}

function showSinglePost(postId) {
  const post = allPosts.find(function (item) {
    return String(item.id) === String(postId);
  });

  if (!post) {
    postsEl.innerHTML = `
      <p>Không tìm thấy bài viết.</p>
      <p><a href="./">← Quay lại</a></p>
    `;
    return;
  }

  postsEl.innerHTML = `
    <article class="single-post">

      <a class="back-link" href="./">
        ← Những ngày cũ
      </a>

      <p class="date">${escapeHtml(post.date || "")}</p>

      <h1>${escapeHtml(post.title || "")}</h1>

      <div class="content">
        ${post.content || post.body || ""}
      </div>

      <p class="back-bottom">
        <a href="./">← Quay lại những ngày cũ</a>
      </p>

    </article>
  `;
}

function createExcerpt(html) {
  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Bỏ ảnh, video, embed khỏi excerpt
  temp.querySelectorAll("img, video, iframe, figure, audio").forEach(function (el) {
    el.remove();
  });

  let text = temp.textContent || temp.innerText || "";

  // Xóa khoảng trắng thừa
  text = text.replace(/\s+/g, " ").trim();

  // Giới hạn excerpt khoảng 180 ký tự
  if (text.length > 180) {
    text = text.substring(0, 180).trim() + "...";
  }

  return text;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
