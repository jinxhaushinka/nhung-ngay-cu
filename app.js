const gate = document.getElementById("gate");
const blog = document.getElementById("blog");

const home = document.getElementById("home");
const article = document.getElementById("article");

const login = document.getElementById("login");
const password = document.getElementById("password");
const error = document.getElementById("error");

const postsEl = document.getElementById("post-list");
const singlePostEl = document.getElementById("single-post");

const SESSION_KEY = "nhung-ngay-cu-unlocked";

let allPosts = [];


/* =========================
   INITIALIZE
========================= */

document.addEventListener("DOMContentLoaded", function () {
  const isUnlocked = sessionStorage.getItem(SESSION_KEY) === "true";

  if (isUnlocked) {
    unlockBlog();
  }
});


/* =========================
   LOGIN
========================= */

login.addEventListener("submit", async function (event) {
  event.preventDefault();

  const enteredPassword = password.value;

  if (enteredPassword !== BLOG_PASSWORD) {
    error.textContent = "Mật khẩu không đúng.";
    error.hidden = false;

    password.select();

    return;
  }

  error.hidden = true;

  sessionStorage.setItem(SESSION_KEY, "true");

  await unlockBlog();
});


/* =========================
   UNLOCK
========================= */

async function unlockBlog() {
  gate.hidden = true;
  blog.hidden = false;

  await loadPosts();
}


/* =========================
   LOAD POSTS
========================= */

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

    if (postIdExists()) {
      singlePostEl.innerHTML = `
        <p>Không thể tải bài viết.</p>
      `;
    } else {
      postsEl.innerHTML = `
        <p>Không thể tải bài viết.</p>
      `;
    }
  }
}


/* =========================
   HOME / POST LIST
========================= */

function showPostList() {
  home.hidden = false;
  article.hidden = true;

  if (!allPosts.length) {
    postsEl.innerHTML = `
      <p>Chưa có bài viết.</p>
    `;

    return;
  }

  postsEl.innerHTML = allPosts.map(function (post) {

    const excerpt = createExcerpt(
      post.content || post.body || ""
    );

    const postUrl =
      "?post=" + encodeURIComponent(post.id);

    return `
      <article class="post-preview">

        <h2>
          <a href="${postUrl}">
            ${escapeHtml(post.title || "")}
          </a>
        </h2>

        <p class="excerpt">
          ${escapeHtml(excerpt)}
        </p>

        <p class="date">
          ${escapeHtml(post.date || "")}
        </p>

      </article>
    `;

  }).join("");
}


/* =========================
   SINGLE POST
========================= */

function showSinglePost(postId) {
  const post = allPosts.find(function (item) {
    return String(item.id) === String(postId);
  });

  home.hidden = true;
  article.hidden = false;

  if (!post) {
    singlePostEl.innerHTML = `
      <a class="back-link" href="./">
        ← Những ngày cũ
      </a>

      <div class="single-post-header">
        <h1>Không tìm thấy bài viết</h1>
      </div>
    `;

    return;
  }


  /* =========================
     RECOMMENDATIONS
  ========================== */

  const recommendations = getRecommendations(post.id);


  /* =========================
     ARTICLE HTML
  ========================== */

  singlePostEl.innerHTML = `

    <a class="back-link" href="./">
      ← Những ngày cũ
    </a>

    <header class="single-post-header">

      <h1>
        ${escapeHtml(post.title || "")}
      </h1>

      <p class="date">
        ${escapeHtml(post.date || "")}
      </p>

    </header>


    <div class="article-divider"></div>


    <div class="article-body">
      ${post.content || post.body || ""}
    </div>


    ${renderRecommendations(recommendations)}


    <p class="back-bottom">
      <a href="./">
        ← Quay lại những ngày cũ
      </a>
    </p>

  `;
}


/* =========================
   RECOMMENDATIONS
========================= */

function getRecommendations(currentPostId) {

  const otherPosts = allPosts.filter(function (post) {
    return String(post.id) !== String(currentPostId);
  });

  /*
   * Lấy 3 bài đầu tiên sau khi loại bài hiện tại.
   * Như vậy recommendation ổn định, không nhảy ngẫu nhiên
   * mỗi lần refresh.
   */

  return otherPosts.slice(0, 3);
}


function renderRecommendations(posts) {

  if (!posts.length) {
    return "";
  }

  return `
    <section class="recommendations">

      <h2 class="recommendations-title">
          Những tản mạn linh tinh khác
      </h2>

      ${posts.map(function (post) {

        const postUrl =
          "?post=" + encodeURIComponent(post.id);

        return `
          <article class="recommendation">

            <a href="${postUrl}">

              <h3>
                ${escapeHtml(post.title || "")}
              </h3>

              <p class="date">
                ${escapeHtml(post.date || "")}
              </p>

            </a>

          </article>
        `;

      }).join("")}

    </section>
  `;
}


/* =========================
   EXCERPT
========================= */

function createExcerpt(html) {

  const temp = document.createElement("div");

  temp.innerHTML = html;


  /*
   * Không lấy những element không phù hợp
   * để làm excerpt.
   */

  temp
    .querySelectorAll(
      "img, video, iframe, figure, audio, script, style"
    )
    .forEach(function (el) {
      el.remove();
    });


  let text =
    temp.textContent ||
    temp.innerText ||
    "";


  text = text
    .replace(/\s+/g, " ")
    .trim();


  /*
   * Giới hạn excerpt.
   */

  if (text.length > 180) {
    text =
      text.substring(0, 180).trim() +
      "...";
  }


  return text;
}


/* =========================
   HTML ESCAPE
========================= */

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================
   HELPERS
========================= */

function postIdExists() {
  return Boolean(
    new URLSearchParams(window.location.search).get("post")
  );
}
