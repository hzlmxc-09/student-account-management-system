
// SUPABASE CONFIGURATION
const SUPABASE_URL = "https://ihdyrtysnuvozzqhywck.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-p5DmMjQonJaJQfgTjx8fw_KNe8ZNNG";

// Connect to Supabase
const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// PAGE ELEMENTS
const loginPage = document.getElementById("loginPage");
const registerPage = document.getElementById("registerPage");
const dashboard = document.getElementById("dashboard");
const message = document.getElementById("message");

// SHOW LOGIN PAGE
function showLogin() {
    loginPage.classList.remove("hidden");
    registerPage.classList.add("hidden");
    dashboard.classList.add("hidden");
    message.textContent = "";
}

// SHOW REGISTRATION PAGE
function showRegister() {
    loginPage.classList.add("hidden");
    registerPage.classList.remove("hidden");
    dashboard.classList.add("hidden");
    message.textContent = "";
}

// SHOW DASHBOARD
function showDashboard(name, email) {
    loginPage.classList.add("hidden");
    registerPage.classList.add("hidden");
    dashboard.classList.remove("hidden");

    document.getElementById("userName").textContent =
        `Hello, ${name || email}!`;
}

// DISPLAY MESSAGE
function showMessage(text) {
    message.textContent = text;
}

// NAVIGATION
document.getElementById("showRegister")
    .addEventListener("click", function(event) {
        event.preventDefault();
        showRegister();
    });

document.getElementById("showLogin")
    .addEventListener("click", function(event) {
        event.preventDefault();
        showLogin();
    });

// REGISTER ACCOUNT
document.getElementById("registerForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const name = document.getElementById("fullName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;

        if (!name) {
            showMessage("Please enter your full name.");
            return;
        }

        if (SUPABASE_URL.startsWith("YOUR_") ||
            SUPABASE_ANON_KEY.startsWith("YOUR_")) {
            showMessage("Authentication setup is not finished yet.");
            return;
        }

        const button = this.querySelector("button");
        button.disabled = true;
        button.textContent = "Creating account...";

        const { data, error } = await db.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name
                }
            }
        });

        button.disabled = false;
        button.textContent = "Create Account";

        if (error) {
            showMessage(error.message);
            return;
        }

        this.reset();

        if (data.session) {
            showDashboard(name, email);
        } else {
            showLogin();
            showMessage("Registration successful! Please check your email to confirm your account.");
        }
    });

// LOGIN ACCOUNT
document.getElementById("loginForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        if (SUPABASE_URL.startsWith("YOUR_") ||
            SUPABASE_ANON_KEY.startsWith("YOUR_")) {
            showMessage("Authentication setup is not finished yet.");
            return;
        }

        const button = this.querySelector("button");
        button.disabled = true;
        button.textContent = "Signing in...";

        const { data, error } = await db.auth.signInWithPassword({
            email: email,
            password: password
        });

        button.disabled = false;
        button.textContent = "Sign In";

        if (error) {
            showMessage(error.message);
            return;
        }

        this.reset();

        const name = data.user.user_metadata.full_name;

        showDashboard(name, email);
    });

// LOGOUT ACCOUNT
document.getElementById("logoutButton")
    .addEventListener("click", async function() {

        const { error } = await db.auth.signOut();

        if (error) {
            showMessage(error.message);
            return;
        }

        showLogin();
        showMessage("You have successfully logged out.");
    });

// CHECK EXISTING SESSION
async function checkSession() {

    if (SUPABASE_URL.startsWith("YOUR_") ||
        SUPABASE_ANON_KEY.startsWith("YOUR_")) {
        return;
    }

    const { data } = await db.auth.getSession();

    if (data.session) {
        const user = data.session.user;
        const name = user.user_metadata.full_name;

        showDashboard(name, user.email);
    }
}

// INITIALIZE APPLICATION
checkSession();
