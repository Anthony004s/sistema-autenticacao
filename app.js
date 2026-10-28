
/*
  1. Abra o Supabase e selecione seu projeto.
  2. Entre em Project Settings > API Keys.
  3. Copie a Project URL e a chave publishable.
  4. Substitua os valores abaixo.
*/

const SUPABASE_URL = "https://xaxjtweklbhgazkzejwt.supabase.co/rest/v1/";
const SUPABASE_KEY = "sb_publishable_5WvtzLW7Hpk6-5dMiIZkuQ_lBBiRK9z";

const { createClient } = supabase;

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-button");
const logoutButton = document.getElementById("logout-button");

const loginMessage = document.getElementById("login-message");
const dashboardMessage = document.getElementById("dashboard-message");
const userEmail = document.getElementById("user-email");

let currentUserId = null;

function showMessage(element, message, type = "") {
  element.textContent = message;
  element.className = `message ${type}`;
}

function showLogin() {
  currentUserId = null;
  dashboardSection.hidden = true;
  loginSection.hidden = false;
  userEmail.textContent = "";
}

function showDashboard(user) {
  currentUserId = user.id;
  userEmail.textContent = user.email || "E-mail não disponível";
  loginSection.hidden = true;
  dashboardSection.hidden = false;
  showMessage(dashboardMessage, "");
  showMessage(loginMessage, "");
}

async function checkSession() {
  // Esconde as áreas até verificar a sessão.
  loginSection.hidden = true;
  dashboardSection.hidden = true;

  const { data, error } = await client.auth.getSession();

  if (error) {
    showLogin();
    showMessage(
      loginMessage,
      "Não foi possível verificar a sessão. Tente novamente.",
      "error"
    );
    return;
  }

  if (data.session?.user) {
    showDashboard(data.session.user);
  } else {
    showLogin();
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  loginButton.disabled = true;
  loginButton.textContent = "Entrando...";
  showMessage(loginMessage, "");

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      showMessage(
        loginMessage,
        "Não foi possível entrar. Verifique seu e-mail e senha.",
        "error"
      );
      return;
    }

    if (data.user) {
      showDashboard(data.user);
    }
  } catch (error) {
    showMessage(
      loginMessage,
      "Erro de conexão. Verifique sua internet e tente novamente.",
      "error"
    );
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Entrar";
  }
});

logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;
  showMessage(dashboardMessage, "");

  try {
    const { error } = await client.auth.signOut();

    if (error) {
      showMessage(
        dashboardMessage,
        "Não foi possível sair. Tente novamente.",
        "error"
      );
      return;
    }

    showLogin();
    loginForm.reset();
    showMessage(loginMessage, "Você saiu do sistema.", "success");
  } catch (error) {
    showMessage(
      dashboardMessage,
      "Erro de conexão ao tentar sair.",
      "error"
    );
  } finally {
    logoutButton.disabled = false;
  }
});

// Mantém a interface sincronizada com o estado de autenticação.
client.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    showDashboard(session.user);
  } else {
    showLogin();
  }
});

// Confere a sessão antes de mostrar a página.
checkSession();
