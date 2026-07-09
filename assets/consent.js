document.addEventListener("DOMContentLoaded", function () {

  const banner = document.getElementById("cookie-consent");
  const acceptBtn = document.getElementById("cookie-accept");
  const declineBtn = document.getElementById("cookie-decline");

  // Stop if banner doesn't exist
  if (!banner) return;

  // Show banner only if user hasn't made a choice
  if (!localStorage.getItem("quickqr_cookie_choice")) {
    banner.classList.add("show");
  }

  // Accept
  if (acceptBtn) {
    acceptBtn.addEventListener("click", function () {

      localStorage.setItem("quickqr_cookie_choice", "accepted");

      banner.classList.remove("show");

    });
  }

  // Decline
  if (declineBtn) {
    declineBtn.addEventListener("click", function () {

      localStorage.setItem("quickqr_cookie_choice", "declined");

      banner.classList.remove("show");

    });
  }

});
