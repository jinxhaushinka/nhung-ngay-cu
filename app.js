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

  const isUnlocked =
    sessionStorage.getItem(SESSION_KEY) === "true";

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

  sessionStorage.setItem(
    SESSION_KEY,
    "true"
  );

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

    const response = await fetch(
      "posts.json?v=" + Date.now()
    );

    if (!response.ok) {
      throw new Error(
        "Không thể tải posts.json"
      );
    }

    allPosts = await response.json();

    const postId =
      new URLSearchParams(
        window.location.search
      ).get("post");


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
   HOME
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

    /*
     * Dùng excerpt riêng từ WordPress.
     * Không tự cắt content nữa.
     */

    const excerpt =
      post.excerpt || "";


    const postUrl =
      "?post=" +
      encodeURIComponent(post.id);


    return `

      <article class="post-preview">

        <h2>
          <a href="${postUrl}">
            ${escapeHtml(
              post.title || ""
            )}
          </a>
        </h2>

        <p class="excerpt">
          ${escapeHtml(excerpt)}
        </p>

        <p class="date">
          ${escapeHtml(
            post.date || ""
          )}
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

    return String(item.id) ===
      String(postId);

  });


  home.hidden = true;
  article.hidden = false;


  if (!post) {

    singlePostEl.innerHTML = `

      <a
        class="back-link"
        href="./"
      >
        ← Những ngày cũ
      </a>

      <div class="single-post-header">

        <h1>
          Không tìm thấy bài viết
        </h1>

      </div>

    `;

    return;
  }


  const recommendations =
    getRecommendations(post.id);


  /*
   * Convert WordPress content
   * thành HTML browser có thể render.
   */

  const processedContent =
    processWordPressContent(
      post.content || post.body || ""
    );


  singlePostEl.innerHTML = `

    <a
      class="back-link"
      href="./"
    >
      ← Những ngày cũ
    </a>


    <header class="single-post-header">

      <h1>
        ${escapeHtml(
          post.title || ""
        )}
      </h1>

      <p class="date">
        ${escapeHtml(
          post.date || ""
        )}
      </p>

    </header>


    <div class="article-divider"></div>


    <div class="article-body">

      ${processedContent}

    </div>


    ${renderRecommendations(
      recommendations
    )}


    <p class="back-bottom">

      <a href="./">
        ← Quay lại những ngày cũ
      </a>

    </p>

  `;
}


/* =========================
   WORDPRESS CONTENT
========================= */

function processWordPressContent(html) {

  if (!html) {
    return "";
  }


  /*
   * YouTube embed
   */

  html = html.replace(
    /<figure[^>]*class="[^"]*wp-block-embed[^"]*"[^>]*>[\s\S]*?<div[^>]*class="[^"]*wp-block-embed__wrapper[^"]*"[^>]*>\s*(https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^&\s<]+)[^\s<]*)\s*<\/div>[\s\S]*?<\/figure>/gi,

    function (
      match,
      fullUrl,
      videoId
    ) {

      return `

        <div class="video-embed">

          <iframe
            src="https://www.youtube.com/embed/${videoId}"
            title="YouTube video"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>

        </div>

      `;
    }
  );


  /*
   * Xóa WordPress block comments.
   *
   * Ví dụ:
   * <!-- wp:paragraph -->
   * <!-- /wp:paragraph -->
   */

  html = html.replace(
    /<!--\s*\/?wp:[\s\S]*?-->/gi,
    ""
  );


  return html;
}


/* =========================
   RECOMMENDATIONS
========================= */

function getRecommendations(currentPostId) {

  const currentPost = allPosts.find(function (post) {
    return String(post.id) === String(currentPostId);
  });

  if (!currentPost) {
    return [];
  }

  const currentDate = new Date(currentPost.date);

  const otherPosts = allPosts
    .filter(function (post) {
      return String(post.id) !== String(currentPostId);
    })
    .map(function (post) {

      const postDate = new Date(post.date);

      const distance = Math.abs(
        postDate - currentDate
      );

      return {
        post: post,
        distance: distance
      };

    })
    .sort(function (a, b) {

      return a.distance - b.distance;

    });


  return otherPosts
    .slice(0, 3)
    .map(function (item) {
      return item.post;
    });
}


function renderRecommendations(
  posts
) {

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
          "?post=" +
          encodeURIComponent(post.id);


        return `

          <article class="recommendation">

            <a href="${postUrl}">

              <h3>
                ${escapeHtml(
                  post.title || ""
                )}
              </h3>

              <p class="date">
                ${escapeHtml(
                  post.date || ""
                )}
              </p>

            </a>

          </article>

        `;

      }).join("")}

    </section>

  `;
}


/* =========================
   HTML ESCAPE
========================= */

function escapeHtml(value) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );
}


/* =========================
   HELPERS
========================= */

function postIdExists() {

  return Boolean(

    new URLSearchParams(
      window.location.search
    ).get("post")

  );
}
