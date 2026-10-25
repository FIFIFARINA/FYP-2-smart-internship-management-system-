const form = document.getElementById("loginForm");
const message = document.getElementById("formMessage");
const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {
  const showing = password.type === "text";
  password.type = showing ? "password" : "text";
  togglePassword.textContent = showing ? "Show" : "Hide";
  togglePassword.setAttribute("aria-label", showing ? "Show password" : "Hide password");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  // Front-end demo only: connect this form to your backend/authentication API
  // before using it for real student, lecturer, or administrator accounts.
  message.textContent = "Form validated. Connect your backend to sign in.";
  message.style.color = "#173b2b";
});

document.getElementById("forgotLink").addEventListener("click", (event) => {
  event.preventDefault();
  message.textContent = "Password reset can be connected to your university email service.";
  message.style.color = "#173b2b";
});

document.getElementById("signupLink").addEventListener("click", (event) => {
  event.preventDefault();
  message.textContent = "Registration page can be added for students, lecturers, and administrators.";
  message.style.color = "#173b2b";
});
