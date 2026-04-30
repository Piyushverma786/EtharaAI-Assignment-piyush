let token = localStorage.getItem("token") || "";
let user = JSON.parse(localStorage.getItem("user") || "null");

const output = document.getElementById("output");
const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const authInfo = document.getElementById("authInfo");

function print(data) {
  output.textContent = JSON.stringify(data, null, 2);
}

function setAuthState() {
  if (token && user) {
    authSection.style.display = "none";
    appSection.style.display = "block";
    authInfo.textContent = `Logged in as ${user.name} (${user.email}) - role: ${user.role}`;
  } else {
    authSection.style.display = "block";
    appSection.style.display = "none";
    authInfo.textContent = "Please signup/login";
  }
}

async function api(path, method = "GET", body) {
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

async function signup() {
  try {
    const data = await api("/api/auth/signup", "POST", {
      name: document.getElementById("signupName").value,
      email: document.getElementById("signupEmail").value,
      password: document.getElementById("signupPassword").value,
    });
    print(data);
  } catch (err) {
    print(err);
  }
}

async function login() {
  try {
    const data = await api("/api/auth/login", "POST", {
      email: document.getElementById("loginEmail").value,
      password: document.getElementById("loginPassword").value,
    });
    token = data.token;
    user = data.user;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setAuthState();
    print(data);
  } catch (err) {
    print(err);
  }
}

function logout() {
  token = "";
  user = null;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setAuthState();
  print({ message: "Logged out" });
}

async function loadDashboard() {
  try {
    print(await api("/api/dashboard"));
  } catch (err) {
    print(err);
  }
}

async function loadProjects() {
  try {
    print(await api("/api/projects"));
  } catch (err) {
    print(err);
  }
}

async function createProject() {
  try {
    print(
      await api("/api/projects", "POST", {
        name: document.getElementById("projectName").value,
        description: document.getElementById("projectDescription").value,
      })
    );
  } catch (err) {
    print(err);
  }
}

async function addMember() {
  try {
    const projectId = document.getElementById("memberProjectId").value;
    print(
      await api(`/api/projects/${projectId}/members`, "POST", {
        email: document.getElementById("memberEmail").value,
      })
    );
  } catch (err) {
    print(err);
  }
}

async function createTask() {
  try {
    const projectId = document.getElementById("taskProjectId").value;
    print(
      await api(`/api/projects/${projectId}/tasks`, "POST", {
        title: document.getElementById("taskTitle").value,
        description: document.getElementById("taskDescription").value,
        assignedTo: Number(document.getElementById("taskAssigneeId").value),
        dueDate: document.getElementById("taskDueDate").value || null,
      })
    );
  } catch (err) {
    print(err);
  }
}

async function fetchTasks() {
  try {
    const projectId = document.getElementById("fetchProjectId").value;
    print(await api(`/api/projects/${projectId}/tasks`));
  } catch (err) {
    print(err);
  }
}

async function updateTaskStatus() {
  try {
    const taskId = document.getElementById("statusTaskId").value;
    print(
      await api(`/api/tasks/${taskId}/status`, "PATCH", {
        status: document.getElementById("statusValue").value,
      })
    );
  } catch (err) {
    print(err);
  }
}

setAuthState();
