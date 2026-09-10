/* =========================================================
   INDUSTRIAL ASSIST LOGIN
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

const BUSINESS_ACCOUNTS_KEY =
    "industrialAssistBusinessAccounts";

const SESSION_KEY =
    "industrialAssistSession";


/* =========================================================
   GOVERNMENT ACCOUNTS
   EXACTLY 2 AUTHORIZED ACCOUNTS
========================================================= */

const governmentAccounts = [

    {
        officerId: "GOV-1001",
        name: "Government Officer 1",
        password: "GovSecure@123"
    },

    {
        officerId: "GOV-1002",
        name: "Government Officer 2",
        password: "OfficerSecure@123"
    }

];


/* =========================================================
   TEMPORARY OTP DATA
========================================================= */

let pendingBusinessAccount = null;

let generatedBusinessOtp = null;


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        checkExistingSession();

    }
);


/* =========================================================
   CHECK EXISTING SESSION
========================================================= */

function checkExistingSession() {

    const rawSession =
        sessionStorage.getItem(SESSION_KEY);


    if (!rawSession) {
        return;
    }


    try {

        const session =
            JSON.parse(rawSession);


        if (
            !session ||
            !session.role
        ) {
            sessionStorage.removeItem(
                SESSION_KEY
            );

            return;
        }


        if (
            session.expiresAt &&
            Date.now() > session.expiresAt
        ) {

            sessionStorage.removeItem(
                SESSION_KEY
            );

            return;
        }


        if (
            session.role === "business"
        ) {

            window.location.href =
                "./business/index.html";

            return;
        }


        if (
            session.role === "government"
        ) {

            window.location.href =
                "./government/index.html";

            return;
        }

    } catch (error) {

        sessionStorage.removeItem(
            SESSION_KEY
        );

    }

}


/* =========================================================
   PORTAL SELECTION
========================================================= */

function selectPortal(portal) {

    hideAllAuthSections();

    clearMessage();


    document
        .getElementById("portalSelection")
        .classList.add("hidden");


    if (portal === "business") {

        document
            .getElementById("businessAuth")
            .classList.remove("hidden");

        showBusinessMode("signin");

        return;
    }


    if (portal === "government") {

        document
            .getElementById("governmentAuth")
            .classList.remove("hidden");

        return;
    }

}


/* =========================================================
   BACK TO PORTAL SELECTION
========================================================= */

function backToPortals() {

    hideAllAuthSections();

    clearMessage();


    document
        .getElementById("portalSelection")
        .classList.remove("hidden");

}


/* =========================================================
   HIDE AUTH SECTIONS
========================================================= */

function hideAllAuthSections() {

    document
        .getElementById("businessAuth")
        .classList.add("hidden");


    document
        .getElementById("governmentAuth")
        .classList.add("hidden");

}


/* =========================================================
   BUSINESS MODE
========================================================= */

function showBusinessMode(mode) {

    const signInForm =
        document.getElementById(
            "businessSignInForm"
        );


    const createForm =
        document.getElementById(
            "businessCreateForm"
        );


    const signInTab =
        document.getElementById(
            "businessSignInTab"
        );


    const createTab =
        document.getElementById(
            "businessCreateTab"
        );


    clearMessage();


    if (mode === "signin") {

        signInForm.classList.remove(
            "hidden"
        );

        createForm.classList.add(
            "hidden"
        );


        signInTab.classList.add(
            "active"
        );

        createTab.classList.remove(
            "active"
        );

        return;
    }


    if (mode === "create") {

        signInForm.classList.add(
            "hidden"
        );

        createForm.classList.remove(
            "hidden"
        );


        signInTab.classList.remove(
            "active"
        );

        createTab.classList.add(
            "active"
        );

    }

}


/* =========================================================
   BUSINESS ACCOUNTS
========================================================= */

function getBusinessAccounts() {

    try {

        const raw =
            localStorage.getItem(
                BUSINESS_ACCOUNTS_KEY
            );


        if (!raw) {
            return [];
        }


        const accounts =
            JSON.parse(raw);


        return Array.isArray(accounts)
            ? accounts
            : [];

    } catch (error) {

        return [];
    }

}


function saveBusinessAccounts(accounts) {

    localStorage.setItem(
        BUSINESS_ACCOUNTS_KEY,
        JSON.stringify(accounts)
    );

}


/* =========================================================
   CREATE BUSINESS ACCOUNT
========================================================= */

function createBusinessAccount(event) {

    event.preventDefault();


    const fullName =
        document
            .getElementById("businessFullName")
            .value
            .trim();


    const email =
        document
            .getElementById("businessCreateEmail")
            .value
            .trim()
            .toLowerCase();


    const password =
        document
            .getElementById("businessCreatePassword")
            .value;


    const confirmPassword =
        document
            .getElementById("businessConfirmPassword")
            .value;


    clearMessage();


    /* NAME */

    if (fullName.length < 2) {

        showMessage(
            "Please enter a valid full name.",
            "error"
        );

        return;
    }


    /* EMAIL */

    if (!isValidEmail(email)) {

        showMessage(
            "Please enter a valid email address.",
            "error"
        );

        return;
    }


    /* PASSWORD */

    if (password.length < 8) {

        showMessage(
            "Password must contain at least 8 characters.",
            "error"
        );

        return;
    }


    /* CONFIRM PASSWORD */

    if (password !== confirmPassword) {

        showMessage(
            "Passwords do not match.",
            "error"
        );

        return;
    }


    const accounts =
        getBusinessAccounts();


    /* DUPLICATE EMAIL */

    const existingAccount =
        accounts.find(
            account =>
                account.email === email
        );


    if (existingAccount) {

        showMessage(
            "An account with this email already exists. Please sign in.",
            "error"
        );

        return;
    }


    /* CREATE TEMP ACCOUNT */

    pendingBusinessAccount = {

        id:
            "BUS-" +
            Date.now(),

        fullName:
            fullName,

        email:
            email,

        password:
            password,

        createdAt:
            new Date().toISOString(),

        verified:
            false

    };


    /* GENERATE DEMO OTP */

    generatedBusinessOtp =
        String(
            Math.floor(
                100000 +
                Math.random() * 900000
            )
        );


    document.getElementById(
        "demoOtpDisplay"
    ).textContent =
        generatedBusinessOtp;


    document.getElementById(
        "otpInput"
    ).value = "";


    document
        .getElementById("otpModal")
        .classList.remove("hidden");


    showMessage(
        "Account created. Complete the demo OTP verification.",
        "success"
    );

}


/* =========================================================
   VERIFY BUSINESS OTP
========================================================= */

function verifyBusinessOtp() {

    const enteredOtp =
        document
            .getElementById("otpInput")
            .value
            .trim();


    if (!pendingBusinessAccount) {

        showMessage(
            "No pending account verification.",
            "error"
        );

        return;
    }


    if (
        enteredOtp !==
        generatedBusinessOtp
    ) {

        showMessage(
            "Invalid OTP. Please enter the correct OTP.",
            "error"
        );

        return;
    }


    const accounts =
        getBusinessAccounts();


    pendingBusinessAccount.verified =
        true;

    pendingBusinessAccount.verifiedAt =
        new Date().toISOString();


    accounts.push(
        pendingBusinessAccount
    );


    saveBusinessAccounts(
        accounts
    );


    const verifiedAccount =
        pendingBusinessAccount;


    pendingBusinessAccount = null;

    generatedBusinessOtp = null;


    closeOtpModal();


    document
        .getElementById("businessCreateForm")
        .reset();


    /* AUTO SIGN IN AFTER VERIFICATION */

    createBusinessSession(
        verifiedAccount
    );


    showMessage(
        "Account verified successfully. Opening Business Portal...",
        "success"
    );


    setTimeout(
        function () {

            window.location.href =
                "./business/index.html";

        },
        500
    );

}


/* =========================================================
   CLOSE OTP
========================================================= */

function closeOtpModal() {

    document
        .getElementById("otpModal")
        .classList.add("hidden");

}


/* =========================================================
   BUSINESS SIGN IN
========================================================= */

function businessSignIn(event) {

    event.preventDefault();


    const email =
        document
            .getElementById(
                "businessLoginEmail"
            )
            .value
            .trim()
            .toLowerCase();


    const password =
        document
            .getElementById(
                "businessLoginPassword"
            )
            .value;


    clearMessage();


    if (!isValidEmail(email)) {

        showMessage(
            "Enter a valid Gmail / email address.",
            "error"
        );

        return;
    }


    if (!password) {

        showMessage(
            "Enter your password.",
            "error"
        );

        return;
    }


    const accounts =
        getBusinessAccounts();


    const account =
        accounts.find(
            item =>
                item.email === email
        );


    if (!account) {

        showMessage(
            "No Business account exists with this email.",
            "error"
        );

        return;
    }


    if (!account.verified) {

        showMessage(
            "This account has not been verified.",
            "error"
        );

        return;
    }


    /*
       EXACT PASSWORD CHECK
    */

    if (
        account.password !==
        password
    ) {

        showMessage(
            "Incorrect password.",
            "error"
        );

        return;
    }


    createBusinessSession(
        account
    );


    showMessage(
        "Login successful. Opening Business Portal...",
        "success"
    );


    setTimeout(
        function () {

            window.location.href =
                "./business/index.html";

        },
        400
    );

}


/* =========================================================
   CREATE BUSINESS SESSION
========================================================= */

function createBusinessSession(
    account
) {

    const session = {

        role:
            "business",

        identity:
            account.email,

        name:
            account.fullName,

        accountId:
            account.id,

        loginTime:
            Date.now(),

        sessionId:
            "business-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8),

        expiresAt:
            Date.now() +
            (2 * 60 * 60 * 1000)

    };


    sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(session)
    );

}


/* =========================================================
   GOVERNMENT LOGIN
========================================================= */

function governmentLogin(event) {

    event.preventDefault();


    const officerId =
        document
            .getElementById(
                "governmentOfficerId"
            )
            .value
            .trim()
            .toUpperCase();


    const password =
        document
            .getElementById(
                "governmentPassword"
            )
            .value;


    clearMessage();


    if (!officerId) {

        showMessage(
            "Enter your Government Officer ID.",
            "error"
        );

        return;
    }


    if (!password) {

        showMessage(
            "Enter your Government password.",
            "error"
        );

        return;
    }


    /*
       EXACT MATCH:
       Officer ID AND password
       must belong to the same account.
    */

    const officer =
        governmentAccounts.find(
            account =>
                account.officerId ===
                    officerId &&
                account.password ===
                    password
        );


    /*
       RANDOM / WRONG CREDENTIALS
       WILL ALWAYS FAIL.
    */

    if (!officer) {

        showMessage(
            "Invalid Government Officer ID or password.",
            "error"
        );

        return;
    }


    const session = {

        role:
            "government",

        identity:
            officer.officerId,

        name:
            officer.name,

        loginTime:
            Date.now(),

        sessionId:
            "government-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8),

        expiresAt:
            Date.now() +
            (2 * 60 * 60 * 1000)

    };


    sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(session)
    );


    showMessage(
        "Government authentication successful. Opening portal...",
        "success"
    );


    setTimeout(
        function () {

            window.location.href =
                "./government/index.html";

        },
        400
    );

}


/* =========================================================
   GOOGLE DEMO
========================================================= */

function demoGoogleLogin() {

    showMessage(
        "Google Sign-In is demo-only. Real Google OAuth requires a backend authentication service.",
        "info"
    );

}


/* =========================================================
   EMAIL VALIDATION
========================================================= */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "loginMessage"
        );


    element.textContent =
        message;


    element.className =
        "login-message " +
        type;


    element.style.display =
        "block";

}


function clearMessage() {

    const element =
        document.getElementById(
            "loginMessage"
        );


    element.textContent =
        "";

    element.className =
        "login-message";


    element.style.display =
        "none";

}


/* =========================================================
   HIDDEN CLASS SUPPORT
========================================================= */

const hiddenStyle =
    document.createElement("style");

hiddenStyle.textContent = `
    .hidden {
        display: none !important;
    }
`;

document.head.appendChild(
    hiddenStyle
);