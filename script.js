
// SUPABASE CONFIGURATION
const SUPABASE_URL = "https://ihdyrtysnuvozzqhywck.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-p5DmMjQonJaJQfgTjx8fw_KNe8ZNNG";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// PAGE ELEMENTS
const loginPage = document.getElementById("loginPage");
const registerPage = document.getElementById("registerPage");
const dashboard = document.getElementById("dashboard");
const message = document.getElementById("message");

// MESSAGE
function showMessage(text) {
    message.textContent = text;
}

// PAGE NAVIGATION
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

function showDashboard(profile) {
    loginPage.classList.add("hidden");
    registerPage.classList.add("hidden");
    dashboard.classList.remove("hidden");

    document.getElementById("studentId").textContent = profile.student_id;
    document.getElementById("profileName").textContent = profile.full_name;
    document.getElementById("profileBirth").textContent = profile.date_of_birth;
    document.getElementById("profileGender").textContent = profile.gender;
    document.getElementById("profileAddress").textContent = profile.address;
    document.getElementById("profileContact").textContent = profile.contact_number;
    document.getElementById("profileEmail").textContent = profile.email;
    document.getElementById("profileProgram").textContent = profile.program;

    const years = {
        1: "1st Year",
        2: "2nd Year",
        3: "3rd Year",
        4: "4th Year"
    };

    document.getElementById("profileYear").textContent =
        years[profile.year_level] || profile.year_level;
}

// NAVIGATION BUTTONS
document.getElementById("showRegister").addEventListener("click", function(event) {
    event.preventDefault();
    showRegister();
});

document.getElementById("showLogin").addEventListener("click", function(event) {
    event.preventDefault();
    showLogin();
});

// REGISTER ACCOUNT
document.getElementById("registerForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const button = this.querySelector("button");
    button.disabled = true;
    button.textContent = "Creating account...";

    showMessage("Creating your student account...");

    const fullName = document.getElementById("fullName").value.trim();
    const dateOfBirth = document.getElementById("dateOfBirth").value;
    const gender = document.getElementById("gender").value;
    const address = document.getElementById("address").value.trim();
    const contactNumber = document.getElementById("contactNumber").value.trim();
    const program = document.getElementById("program").value;
    const yearLevel = document.getElementById("yearLevel").value;
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    if (new Date(dateOfBirth) >= new Date()) {
        showMessage("Please enter a valid date of birth.");
        button.disabled = false;
        button.textContent = "Register";
        return;
    }

    try {
        const { data, error } = await db.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: window.location.origin + window.location.pathname,
                data: {
                    full_name: fullName,
                    date_of_birth: dateOfBirth,
                    gender: gender,
                    address: address,
                    contact_number: contactNumber,
                    program: program,
                    year_level: yearLevel
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
            showMessage("Registration successful! You can now log in.");
        } else {
            showMessage("Registration successful! Please check your email to confirm your account.");
        }

    } catch (error) {
        showMessage("Something went wrong: " + error.message);
    } finally {
        button.disabled = false;
        button.textContent = "Register";
    }
});

// LOGIN ACCOUNT
document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const button = this.querySelector("button");
    button.disabled = true;
    button.textContent = "Signing in...";

    showMessage("Logging in...");

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const { data, error } = await db.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            showMessage(error.message);
            return;
        }

        const { data: profile, error: profileError } = await db
            .from("student_profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

        if (profileError) {
            showMessage("Unable to load student profile: " + profileError.message);
            return;
        }

        this.reset();
        showMessage("");
        showDashboard(profile);

    } catch (error) {
        showMessage("Something went wrong: " + error.message);
    } finally {
        button.disabled = false;
        button.textContent = "Sign In";
    }
});

// LOGOUT
document.getElementById("logoutButton").addEventListener("click", async function() {
    const { error } = await db.auth.signOut();

    if (error) {
        showMessage(error.message);
        return;
    }

    showLogin();
    showMessage("You have logged out successfully.");
});

// CHECK EXISTING SESSION
async function checkSession() {
    const { data, error } = await db.auth.getSession();

    if (error || !data.session) {
        showLogin();
        return;
    }

    const user = data.session.user;

    const { data: profile, error: profileError } = await db
        .from("student_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (profileError) {
        await db.auth.signOut();
        showLogin();
        showMessage("Unable to load your student profile. Please contact the administrator.");
        return;
    }

    showDashboard(profile);
}

// START APPLICATION
checkSession();
e logged out successfully.");
});


// 8. CHECK EXISTING LOGIN SESSION
async function checkSession() {
    const { data, error } = await db.auth.getSession();

    if (error || !data.session) {
        showLogin();
        return;
    }

    const user = data.session.user;

    const { data: profile, error: profileError } = await db
        .from("student_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (profileError) {
        showLogin();
        showMessage("Unable to load your student profile.");
        return;
    }

    showDashboard(profile);
}

checkSession();


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
