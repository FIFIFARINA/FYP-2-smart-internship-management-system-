const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");
const loginForm = document.getElementById("loginForm");
const formMessage = document.getElementById("formMessage");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const logbookForm = document.getElementById("logbookForm");
const logbookFile = document.getElementById("logbookFile");
const fileName = document.getElementById("fileName");
const uploadStatus = document.getElementById("uploadStatus");

togglePassword.addEventListener("click", () => {
  const showing = passwordInput.type === "text";
  passwordInput.type = showing ? "password" : "text";
  togglePassword.textContent = showing ? "Show" : "Hide";
  togglePassword.setAttribute("aria-label", showing ? "Show password" : "Hide password");
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!loginForm.reportValidity()) return;
  const username = document.getElementById("username").value.trim();
  document.getElementById("welcomeName").textContent = username || "Student";
  loginPage.hidden = true;
  dashboardPage.hidden = false;
  document.title = "Student Dashboard | Smart Internship Management System";
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.getElementById("logoutButton").addEventListener("click", () => {
  dashboardPage.hidden = true;
  loginPage.hidden = false;
  loginForm.reset();
  formMessage.textContent = "";
  document.title = "Smart Internship Management System | UMK";
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.getElementById("forgotLink").addEventListener("click", (event) => {
  event.preventDefault();
  formMessage.textContent = "Password reset can be connected to your university email service.";
});
document.getElementById("signupLink").addEventListener("click", (event) => {
  event.preventDefault();
  formMessage.textContent = "Registration can be added for students, lecturers, and administrators.";
});

const ATTENDANCE_STORAGE_KEY = "sim_attendance_dates";
const LOGBOOK_STORAGE_KEY = "sim_logbook_count";
const TARGET_ATTENDANCE_DAYS = 100;
const TARGET_LOGBOOK_ENTRIES = 10;

function readAttendanceDates() {
  try {
    const value = JSON.parse(localStorage.getItem(ATTENDANCE_STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readLogbookCount() {
  const value = Number.parseInt(localStorage.getItem(LOGBOOK_STORAGE_KEY) || "0", 10);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLocalDate(date = new Date()) {
  return date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function renderProgress() {
  const attendanceDates = readAttendanceDates();
  const logbookCount = readLogbookCount();
  const attendanceCount = attendanceDates.length;
  document.getElementById("attendanceText").textContent = `${attendanceCount} ${attendanceCount === 1 ? "day" : "days"}`;
  document.getElementById("attendanceBar").style.width = `${Math.min(100, (attendanceCount / TARGET_ATTENDANCE_DAYS) * 100)}%`;
  document.getElementById("logbookText").textContent = `${logbookCount} Submitted`;
  document.getElementById("logbookBar").style.width = `${Math.min(100, (logbookCount / TARGET_LOGBOOK_ENTRIES) * 100)}%`;

  const combinedProgress = Math.round(
    (Math.min(100, (attendanceCount / TARGET_ATTENDANCE_DAYS) * 100) +
     Math.min(100, (logbookCount / TARGET_LOGBOOK_ENTRIES) * 100)) / 2
  );
  document.getElementById("statusBar").style.width = `${combinedProgress}%`;
  document.getElementById("statusText").textContent = combinedProgress >= 100 ? "Completed" : "In Progress";

  const alreadyMarked = attendanceDates.includes(getLocalDateKey());
  const hint = document.getElementById("attendanceHint");
  hint.textContent = alreadyMarked ? "Today's attendance is marked" : "Click to mark today's attendance";
  document.getElementById("markAttendanceButton").disabled = alreadyMarked;
  document.getElementById("markAttendanceButton").textContent = alreadyMarked ? "ALREADY MARKED TODAY" : "MARK PRESENT";
  document.getElementById("attendanceModalMessage").textContent = alreadyMarked
    ? "Your attendance for today has already been recorded."
    : "";
}

function openAttendanceModal() {
  document.getElementById("attendanceDateText").textContent = `Date: ${formatLocalDate()}`;
  renderProgress();
  document.getElementById("attendanceModal").hidden = false;
}

function closeAttendanceModal() {
  document.getElementById("attendanceModal").hidden = true;
}

document.getElementById("attendanceCard").addEventListener("click", openAttendanceModal);
document.getElementById("attendanceCard").addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openAttendanceModal();
  }
});
document.getElementById("closeAttendanceModal").addEventListener("click", closeAttendanceModal);
document.getElementById("attendanceModal").addEventListener("click", (event) => {
  if (event.target.id === "attendanceModal") closeAttendanceModal();
});
document.getElementById("markAttendanceButton").addEventListener("click", () => {
  const attendanceDates = readAttendanceDates();
  const today = getLocalDateKey();
  if (attendanceDates.includes(today)) {
    document.getElementById("attendanceModalMessage").textContent = "Attendance has already been marked for today.";
    renderProgress();
    return;
  }
  attendanceDates.push(today);
  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendanceDates));
  document.getElementById("attendanceModalMessage").textContent = "Attendance marked successfully for today!";
  renderProgress();
});

logbookFile.addEventListener("change", () => {
  const file = logbookFile.files[0];
  uploadStatus.textContent = "";
  if (!file) {
    fileName.textContent = "Choose a file to upload";
    return;
  }
  const allowedTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
  const extension = "." + file.name.split(".").pop().toLowerCase();
  if (!allowedTypes.includes(extension)) {
    logbookFile.value = "";
    fileName.textContent = "Choose a file to upload";
    uploadStatus.textContent = "Unsupported file type. Please choose PDF, DOC, DOCX, JPG, or PNG.";
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    logbookFile.value = "";
    fileName.textContent = "Choose a file to upload";
    uploadStatus.textContent = "File is larger than 10 MB. Please choose a smaller file.";
    return;
  }
  fileName.textContent = file.name;
  uploadStatus.textContent = "File selected and ready to submit.";
});

logbookForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const file = logbookFile.files[0];
  if (!file) {
    uploadStatus.textContent = "Please choose a logbook file first.";
    return;
  }
  const count = readLogbookCount() + 1;
  localStorage.setItem(LOGBOOK_STORAGE_KEY, String(count));
  renderProgress();
  uploadStatus.textContent = `Logbook submission counted (${count} total). Demo only: the file is not uploaded to a server yet.`;
  logbookForm.reset();
  fileName.textContent = "Choose a file to upload";
});

const REMINDERS_STORAGE_KEY = "sim_daily_reminders";

function readReminders() {
  try {
    const stored = JSON.parse(localStorage.getItem(REMINDERS_STORAGE_KEY) || "{}");
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

function saveReminders(reminders) {
  localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
}

function getTodayReminders() {
  const reminders = readReminders();
  const todayKey = getLocalDateKey();
  if (!Array.isArray(reminders[todayKey])) reminders[todayKey] = [];
  return { reminders, todayKey, items: reminders[todayKey] };
}

function renderReminders() {
  document.getElementById("reminderDate").textContent = formatLocalDate();
  const list = document.getElementById("updatesList");
  const empty = document.getElementById("reminderEmpty");
  const { items } = getTodayReminders();
  list.replaceChildren();
  empty.hidden = items.length > 0;

  items.forEach((item, index) => {
    const li = document.createElement("li");
    if (item.completed) li.classList.add("completed");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(item.completed);
    checkbox.setAttribute("aria-label", `Mark ${item.title} as complete`);
    checkbox.addEventListener("change", () => {
      const data = getTodayReminders();
      data.items[index].completed = checkbox.checked;
      saveReminders(data.reminders);
      renderReminders();
    });

    const content = document.createElement("div");
    content.className = "reminder-item-content";
    const title = document.createElement("span");
    title.className = "reminder-item-title";
    title.textContent = item.title;
    content.appendChild(title);

    const details = [];
    if (item.time) details.push(item.time);
    if (item.note) details.push(item.note);
    if (details.length) {
      const meta = document.createElement("span");
      meta.className = "reminder-item-meta";
      meta.textContent = details.join(" · ");
      content.appendChild(meta);
    }

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "reminder-delete";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", `Delete reminder ${item.title}`);
    removeButton.addEventListener("click", () => {
      const data = getTodayReminders();
      data.items.splice(index, 1);
      saveReminders(data.reminders);
      renderReminders();
    });

    li.append(checkbox, content, removeButton);
    list.appendChild(li);
  });
}

document.getElementById("reminderForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const titleInput = document.getElementById("reminderTitle");
  const timeInput = document.getElementById("reminderTime");
  const noteInput = document.getElementById("reminderNote");
  const title = titleInput.value.trim();
  if (!title) {
    titleInput.focus();
    return;
  }

  const data = getTodayReminders();
  data.items.push({
    title,
    time: timeInput.value,
    note: noteInput.value.trim(),
    completed: false
  });
  saveReminders(data.reminders);
  event.target.reset();
  renderReminders();
  titleInput.focus();
});

document.querySelectorAll(".updates-list input[type='checkbox']").forEach((checkbox) => {
  checkbox.addEventListener("change", () => checkbox.closest("li").classList.toggle("completed", checkbox.checked));
});

renderProgress();
renderReminders();
