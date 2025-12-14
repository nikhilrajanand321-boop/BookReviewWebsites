document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "bookworm_user_reviews_v1";
  const form = document.getElementById("reviewForm");
  const submitBtn = document.getElementById("submitReview");
  const newReviewsContainer = document.getElementById("newReviewsContainer");
  const formError = document.getElementById("formError");

  function loadReviews() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveReviews(reviews) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }

  function createStars(rating) {
    const r = Math.max(1, Math.min(5, Math.round(Number(rating) || 0)));
    let stars = "";
    for (let i = 0; i < r; i++) stars += "★";
    for (let i = r; i < 5; i++) stars += "☆";
    return `Rating: ${stars} (${r}/5)`;
  }

  function buildArticle(review) {
    const article = document.createElement("article");
    article.className = "review-item";
    article.dataset.id = review.id;

    const h3 = document.createElement("h3");
    h3.textContent = review.title;
    article.appendChild(h3);

    const pAuthor = document.createElement("p");
    pAuthor.className = "author";
    pAuthor.textContent = "By " + review.author;
    article.appendChild(pAuthor);

    const pGenre = document.createElement("p");
    pGenre.className = "genre";
    pGenre.textContent = `${review.genre} • ${createStars(review.rating)}`;
    article.appendChild(pGenre);

    const pText = document.createElement("p");
    pText.className = "text";
    pText.textContent = review.text;
    article.appendChild(pText);

    const controls = document.createElement("div");
    controls.className = "review-controls";
    controls.style.marginTop = "6px";

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.textContent = "Delete";
    delBtn.className = "small-btn delete-btn";
    delBtn.addEventListener("click", () => removeReview(review.id));

    controls.appendChild(delBtn);
    article.appendChild(controls);

    return article;
  }

  function renderNewReviews() {
    const reviews = loadReviews();
    newReviewsContainer.innerHTML = "";
    if (reviews.length === 0) {
      newReviewsContainer.innerHTML = "<p>No submissions yet — add your review above!</p>";
      return;
    }
    const rev = [...reviews].reverse();
    rev.forEach((r) => {
      newReviewsContainer.appendChild(buildArticle(r));
    });
  }

  function removeReview(id) {
    const reviews = loadReviews();
    const filtered = reviews.filter((r) => r.id !== id);
    saveReviews(filtered);
    renderNewReviews();
  }

  function showError(msg) {
    formError.textContent = msg || "";
  }

  submitBtn.addEventListener("click", () => {
    showError("");

    const title = document.getElementById("title").value.trim();
    const author = document.getElementById("author").value.trim();
    const genre = document.getElementById("genre").value.trim();
    const ratingVal = document.getElementById("rating").value.trim();
    const reviewText = document.getElementById("review").value.trim();

    if (!title) return showError("Please enter the book title.");
    if (!author) return showError("Please enter the author name.");
    if (!genre) return showError("Please select a genre.");
    if (!ratingVal) return showError("Please enter a rating between 1 and 5.");
    const rating = Number(ratingVal);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) return showError("Rating must be a number between 1 and 5.");
    if (!reviewText) return showError("Please write your review.");

    const review = {
      id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8),
      title,
      author,
      genre,
      rating: Math.round(rating),
      text: reviewText,
      createdAt: new Date().toISOString()
    };

    const reviews = loadReviews();
    reviews.push(review);
    saveReviews(reviews);

    renderNewReviews();

    form.reset();

    document.getElementById("my-submissions").scrollIntoView({ behavior: "smooth" });
  });

  renderNewReviews();
});
