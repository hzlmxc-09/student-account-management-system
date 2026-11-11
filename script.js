// ---------- PAGE ELEMENTS ----------
const loginPage = document.getElementById("loginPage");
const registerPage = document.getElementById("registerPage");
const dashboard = document.getElementById("dashboard");
const message = document.getElementById("message");

function showMessage(text) {
    message.textContent = text;
}

// ---------- PAGE NAVIGATION (works even if Supabase fails to load) ----------
function showLogin() {
    loginPage.classList.remove("hidden");
    registerPage.classList.add("hidden");
    dashboard.classList.add("hidden");
}

function showRegister() {
    loginPage.classList.add("hidden");
    registerPage.classList.remove("hidden");
    dashboard.classList.add("hidden");
    showMessage("");
}

document.getElementById("showRegister").addEventListener("click", function (event) {
    event.preventDefault();
    showRegister();
});

document.getElementById("showLogin").addEventListener("click", function (event) {
    event.preventDefault();
    showLogin();
});

// ---------- SUPABASE ----------
const SUPABASE_URL = "https://ihdyrtysnuvozzqhywck.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-p5DmMjQonJaJQfgTjx8fw_KNe8ZNNG";

let db = null;
try {
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (err) {
    showMessage("Could not connect to Supabase. Check your internet and refresh.");
}

// ---------- DASHBOARD ----------
function showDashboard(profile) {
    loginPage.classList.add("hidden");
    registerPage.classList.add("hidden");
    dashboard.classList.remove("hidden");

    const years = { 1: "1st Year", 2: "2nd Year", 3: "3rd Year", 4: "4th Year" };

    document.getElementById("studentId").textContent = profile.student_id || "Pending";
    document.getElementById("profileName").textContent = profile.full_name || "";
    document.getElementById("profileBirth").textContent = profile.date_of_birth || "";
    document.getElementById("profileGender").textContent = profile.gender || "";
    document.getElementById("profileAddress").textContent = profile.address || "";
    document.getElementById("profileContact").textContent = profile.contact_number || "";
    document.getElementById("profileEmail").textContent = profile.email || "";
    document.getElementById("profileProgram").textContent = profile.program || "";
    document.getElementById("profileYear").textContent =
        years[profile.year_level] || profile.year_level || "";
}

// Load the profile row; if the table row is missing, fall back to the
// details saved with the account so the dashboard still opens.
async function loadProfile(user) {
    // 1. Try to read the profile row
    const { data, error } = await db
        .from("student_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (data) return data;
    if (error) console.warn("Profile table error:", error.message);

    // 2. Row missing: ask the database to create it
    const { data: created, error: rpcError } = await db.rpc("ensure_my_profile");
    const row = Array.isArray(created) ? created[0] : created;
    if (row && row.student_id) return row;
    if (rpcError) console.warn("ensure_my_profile error:", rpcError.message);

    // 3. Last resort: show saved details
    const meta = user.user_metadata || {};
    return {
        student_id: "Pending",
        full_name: meta.full_name,
        date_of_birth: meta.date_of_birth,
        gender: meta.gender,
        address: meta.address,
        contact_number: meta.contact_number,
        email: user.email,
        program: meta.program,
        year_level: meta.year_level
    };

}

// ---------- REGISTER ----------
document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!db) {
        showMessage("Supabase is not loaded. Refresh the page.");
        return;
    }

    const button = this.querySelector("button");
    button.disabled = true;
    button.textContent = "Creating account...";
    showMessage("Creating your student account...");

    const dateOfBirth = document.getElementById("dateOfBirth").value;

    if (new Date(dateOfBirth) >= new Date()) {
        showMessage("Please enter a valid date of birth.");
        button.disabled = false;
        button.textContent = "Register";
        return;
    }

    try {
        const { data, error } = await db.auth.signUp({
            email: document.getElementById("registerEmail").value.trim(),
            password: document.getElementById("registerPassword").value,
            options: {
                emailRedirectTo: window.location.origin + window.location.pathname,
                data: {
                    full_name: document.getElementById("fullName").value.trim(),
                    date_of_birth: dateOfBirth,
                    gender: document.getElementById("gender").value,
                    address: document.getElementById("address").value.trim(),
                    contact_number: document.getElementById("contactNumber").value.trim(),
                    program: document.getElementById("program").value,
                    year_level: document.getElementById("yearLevel").value
                }
            }
        });

        if (error) {
            showMessage(error.message);
            return;
        }

        this.reset();
        showLogin();

        if (data.session) {
            // Email confirmation is off: they are already signed in, so sign out
            // and ask them to log in, keeping the flow consistent.
            await db.auth.signOut();
            showMessage("Registration successful! You can now sign in.");
        } else {
            showMessage("Registration successful! Check your email to confirm, then sign in.");
        }
    } catch (err) {
        showMessage("Something went wrong: " + err.message);
    } finally {
        button.disabled = false;
        button.textContent = "Register";
    }
});

// ---------- LOGIN ----------
document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!db) {
        showMessage("Supabase is not loaded. Refresh the page.");
        return;
    }

    const button = this.querySelector("button");
    button.disabled = true;
    button.textContent = "Signing in...";
    showMessage("Signing in...");

    try {
        const { data, error } = await db.auth.signInWithPassword({
            email: document.getElementById("loginEmail").value.trim(),
            password: document.getElementById("loginPassword").value
        });

        if (error) {
            showMessage(error.message);
            return;
        }

        const profile = await loadProfile(data.user);

        this.reset();
        showMessage("");
        showDashboard(profile);
    } catch (err) {
        showMessage("Something went wrong: " + err.message);
    } finally {
        button.disabled = false;
        button.textContent = "Sign In";
    }
});

// ---------- LOGOUT ----------
document.getElementById("logoutButton").addEventListener("click", async function () {
    if (!db) return;

    const { error } = await db.auth.signOut();

    if (error) {
        showMessage(error.message);
        return;
    }

    showLogin();
    showMessage("You have logged out successfully.");
});

// ---------- EXISTING SESSION ----------
async function checkSession() {
    if (!db) {
        showLogin();
        return;
    }

    try {
        const { data, error } = await db.auth.getSession();

        if (error || !data.session) {
            showLogin();
            return;
        }

        const profile = await loadProfile(data.session.user);
        showDashboard(profile);
    } catch (err) {
        showLogin();
    }
}

checkSession();