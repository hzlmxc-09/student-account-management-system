
// SUPABASE CONFIGURATION
const SUPABASE_URL = "https://ihdyrtysnuvozzqhywck.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-p5DmMjQonJaJQfgTjx8fw_KNe8ZNNG";

// Connect to Supabase
const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


const loginPage = document.getElementById("loginPage");
const registerPage = document.getElementById("registerPage");
const dashboard = document.getElementById("dashboard");
const message = document.getElementById("message");


// 3. PAGE NAVIGATION
function showLogin() {
    loginPage.classList.remove("hidden");
    registerPage.classList.add("hidden");
    dashboard.classList.add("hidden");
    showMessage("");
}

function showRegister() {
    loginPage.classList.add("hidden");
    registerPage.classList.remove("hidden");
    dashboard.classList.add("hidden");
    showMessage("");
}

function showDashboard(name, email) {
    loginPage.classList.add("hidden");
    registerPage.classList.add("hidden");
    dashboard.classList.remove("hidden");

    document.getElementById("userName").textContent =
        name || email;
}

function showMessage(text) {
    message.textContent = text;
}


// 4. SWITCH BETWEEN LOGIN AND REGISTRATION
document.getElementById("showRegister").addEventListener("click", function(e) {
    e.preventDefault();
    showRegister();
});

document.getElementById("showLogin").addEventListener("click", function(e) {
    e.preventDefault();
    showLogin();
});


// 5. STUDENT REGISTRATION
document.getElementById("registerForm").addEventListener("submit", async function(e) {
    e.preventDefault();

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
        return;
    }

    const { data, error } = await db.auth.signUp({
        email: email,
        password: password,
        options: {
            emailRedirectTo: window.location.origin +
                window.location.pathname,
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

    document.getElementById("registerForm").reset();

    if (data.session) {
        showMessage("Registration successful!");
        showLogin();
    } else {
        showMessage(
            "Registration successful! Please check your email to confirm your account before logging in."
        );
        showLogin();
    }
});


// 6. STUDENT LOGIN
document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    showMessage("Logging in...");

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

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
        .select("full_name")
        .eq("id", data.user.id)
        .single();

    if (profileError) {
        showMessage("Unable to load your student profile: " + profileError.message);
        return;
    }

    showDashboard(profile.full_name, data.user.email);
});


// 7. STUDENT LOGOUT
document.getElementById("logoutButton").addEventListener("click", async function() {
    const { error } = await db.auth.signOut();

    if (error) {
        showMessage(error.message);
        return;
    }

    showLogin();
    showMessage("You have logged out successfully.");
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
        .select("full_name")
        .eq("id", user.id)
        .single();

    if (profileError) {
        showLogin();
        showMessage("Unable to load your student profile.");
        return;
    }

    showDashboard(profile.full_name, user.email);
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
