document.addEventListener("click", function (e) {

    // USER ICON
    const userIcon = e.target.closest("#user-icon");

    if (userIcon) {

        e.preventDefault();

        const token = localStorage.getItem("token");

        if (token) {
            window.location.href = "/account";
        } else {
            window.location.href = "/login";
        }

        return;
    }

    // SEARCH BUTTON
    const searchBtn = e.target.closest("#search-btn");

    if (searchBtn) {

        const searchInput = document.getElementById("search-input");

        if (!searchInput) return;

        const keyword = searchInput.value.trim();

        if (!keyword) return;

        window.location.href = `/search?q=${encodeURIComponent(keyword)}`;

    }

});


// ENTER SEARCH
document.addEventListener("keypress", function (e) {

    if (e.key !== "Enter") return;

    const searchInput = e.target.closest("#search-input");

    if (!searchInput) return;

    const keyword = searchInput.value.trim();

    if (!keyword) return;

    window.location.href = `/search?q=${encodeURIComponent(keyword)}`;

});