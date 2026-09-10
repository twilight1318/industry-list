/* =====================================================
   INDUSTRIAL ASSIST
   BUSINESS DASHBOARD
===================================================== */


/* =====================================================
   STORAGE KEYS
===================================================== */

const SESSION_KEY =
    "industrialAssistSession";

const APPLICATIONS_KEY =
    "industrialAssistApplications";

const DOCUMENTS_KEY =
    "industrialAssistDocuments";

const GRIEVANCES_KEY =
    "industrialAssistGrievances";

const SETTINGS_KEY =
    "industrialAssistSettings";

const NOTIFICATION_READ_KEY =
    "industrialAssistBusinessReadNotifications";


/* =====================================================
   APPROVAL DATA
===================================================== */

const approvals = [

    {
        id: "labour-registration",
        name: "Labour Registration",
        category: "labour",
        timeline: "7–15 days",
        description:
            "Registration required for businesses employing workers.",
        documents: [
            "Business Registration Certificate",
            "PAN / Tax Document",
            "Address Proof",
            "Employee Details",
            "Business Owner ID Proof"
        ]
    },

    {
        id: "factory-license",
        name: "Factory / Industrial License",
        category: "factory",
        timeline: "15–30 days",
        description:
            "License for eligible factories and industrial establishments.",
        documents: [
            "Business Registration Certificate",
            "Factory Layout",
            "Address Proof",
            "Owner ID Proof",
            "Safety Plan"
        ]
    },

    {
        id: "pollution-clearance",
        name: "Pollution / Environmental Clearance",
        category: "environment",
        timeline: "30–60 days",
        description:
            "Environmental approval for industries with applicable impact.",
        documents: [
            "Business Registration Certificate",
            "Site Plan",
            "Environmental Details",
            "Address Proof",
            "Project Report"
        ]
    },

    {
        id: "trade-license",
        name: "Trade License",
        category: "trade",
        timeline: "7–20 days",
        description:
            "Local authority license required for eligible businesses.",
        documents: [
            "Business Registration Certificate",
            "Address Proof",
            "Owner ID Proof",
            "Property Document"
        ]
    },

    {
        id: "fire-noc",
        name: "Fire Safety NOC",
        category: "safety",
        timeline: "10–20 days",
        description:
            "Fire safety clearance for applicable premises.",
        documents: [
            "Building Plan",
            "Fire Safety Plan",
            "Address Proof",
            "Owner ID Proof"
        ]
    },

    {
        id: "shop-establishment",
        name: "Shop & Establishment Registration",
        category: "trade",
        timeline: "5–15 days",
        description:
            "Registration for eligible shops and establishments.",
        documents: [
            "Business Registration Certificate",
            "Address Proof",
            "Owner ID Proof",
            "Employee Details"
        ]
    }

];


/* =====================================================
   SESSION SECURITY
===================================================== */

(function protectBusinessDashboard() {

    const rawSession =
        sessionStorage.getItem(SESSION_KEY);


    if (!rawSession) {

        window.location.href =
            "../login.html";

        return;
    }


    try {

        const session =
            JSON.parse(rawSession);


        if (
            !session ||
            session.role !== "business"
        ) {

            sessionStorage.removeItem(
                SESSION_KEY
            );

            window.location.href =
                "../login.html";

            return;
        }


        if (
            session.expiresAt &&
            Date.now() > session.expiresAt
        ) {

            sessionStorage.removeItem(
                SESSION_KEY
            );

            window.location.href =
                "../login.html";

        }

    } catch (error) {

        sessionStorage.removeItem(
            SESSION_KEY
        );

        window.location.href =
            "../login.html";

    }

})();


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadUserProfile();

        setupNavigation();

        refreshDashboard();

        renderApprovals();

        renderDocuments();

        renderCompliance();

        renderSchemes();

        renderApplications();

        renderInspections();

        renderGrievances();

        populateGrievanceApplications();

        loadSettings();

        refreshNotifications();

    }
);


/* =====================================================
   SESSION
===================================================== */

function getSession() {

    try {

        const raw =
            sessionStorage.getItem(
                SESSION_KEY
            );


        if (!raw) {
            return null;
        }


        const session =
            JSON.parse(raw);


        if (!session) {
            return null;
        }


        if (
            session.expiresAt &&
            Date.now() > session.expiresAt
        ) {

            sessionStorage.removeItem(
                SESSION_KEY
            );

            return null;
        }


        return session;

    } catch (error) {

        return null;
    }

}


/* =====================================================
   USER PROFILE
===================================================== */

function loadUserProfile() {

    const session =
        getSession();


    if (!session) {
        return;
    }


    const name =
        session.name ||
        session.identity ||
        "Business User";


    const welcomeName =
        document.getElementById(
            "welcomeName"
        );

    const topUserName =
        document.getElementById(
            "topUserName"
        );

    const avatar =
        document.getElementById(
            "userAvatar"
        );


    if (welcomeName) {
        welcomeName.textContent = name;
    }


    if (topUserName) {
        topUserName.textContent = name;
    }


    if (avatar) {
        avatar.textContent =
            name.charAt(0).toUpperCase();
    }

}


/* =====================================================
   NAVIGATION
===================================================== */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(function (item) {

        item.addEventListener(
            "click",
            function () {

                const section =
                    item.dataset.section;


                navigateTo(section);

            }
        );

    });

}


function navigateTo(sectionId) {

    const sections =
        document.querySelectorAll(
            ".content-section"
        );


    sections.forEach(function (section) {

        section.classList.remove(
            "active"
        );

    });


    const selected =
        document.getElementById(
            sectionId
        );


    if (selected) {

        selected.classList.add(
            "active"
        );

    }


    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(function (item) {

        item.classList.toggle(
            "active",
            item.dataset.section === sectionId
        );

    });


    const titles = {

        dashboard: [
            "Dashboard",
            "Manage your industrial approvals and compliance"
        ],

        approvals: [
            "Find Approvals",
            "Find approvals required for your business"
        ],

        documents: [
            "Documents",
            "Manage your business documents"
        ],

        compliance: [
            "Compliance",
            "Monitor your compliance requirements"
        ],

        schemes: [
            "Government Schemes",
            "Explore support and incentives"
        ],

        applications: [
            "My Applications",
            "Track your approval applications"
        ],

        inspections: [
            "Inspections",
            "View scheduled inspections"
        ],

        grievances: [
            "Grievances",
            "Raise and track complaints"
        ],

        settings: [
            "Settings",
            "Manage your business profile"
        ]

    };


    const title =
        document.getElementById(
            "pageTitle"
        );

    const subtitle =
        document.getElementById(
            "pageSubtitle"
        );


    if (titles[sectionId]) {

        title.textContent =
            titles[sectionId][0];

        subtitle.textContent =
            titles[sectionId][1];

    }


    closeSidebar();

}


/* =====================================================
   SIDEBAR
===================================================== */

function toggleSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (sidebar) {

        sidebar.classList.toggle(
            "open"
        );

    }

}


function closeSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }

}


/* =====================================================
   APPLICATION STORAGE
===================================================== */

function getApplications() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    APPLICATIONS_KEY
                )
            );


        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        return [];

    }

}


function saveApplications(applications) {

    localStorage.setItem(
        APPLICATIONS_KEY,
        JSON.stringify(applications)
    );

}


/* =====================================================
   DOCUMENT STORAGE
===================================================== */

function getDocuments() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    DOCUMENTS_KEY
                )
            );


        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        return [];

    }

}


function saveDocuments(documents) {

    localStorage.setItem(
        DOCUMENTS_KEY,
        JSON.stringify(documents)
    );

}


/* =====================================================
   DASHBOARD
===================================================== */

function refreshDashboard() {

    const applications =
        getApplications();


    const total =
        applications.length;


    const pending =
        applications.filter(
            function (app) {

                return ![
                    "Approved",
                    "Rejected"
                ].includes(app.status);

            }
        ).length;


    const inspections =
        applications.filter(
            function (app) {

                return (
                    app.inspectionDateTime ||
                    app.inspectionStatus ||
                    [
                        "Inspection Scheduled",
                        "Inspection Completed"
                    ].includes(app.status)
                );

            }
        ).length;


    const approved =
        applications.filter(
            function (app) {

                return app.status === "Approved";

            }
        ).length;


    setText(
        "totalApplications",
        total
    );

    setText(
        "pendingApplications",
        pending
    );

    setText(
        "inspectionApplications",
        inspections
    );

    setText(
        "approvedApplications",
        approved
    );


    renderRecentApplications();

}


/* =====================================================
   RECENT APPLICATIONS
===================================================== */

function renderRecentApplications() {

    const container =
        document.getElementById(
            "recentApplications"
        );


    if (!container) return;


    const applications =
        getApplications()
            .slice()
            .sort(
                function (a, b) {

                    return new Date(
                        b.submittedAt || 0
                    ) -
                    new Date(
                        a.submittedAt || 0
                    );

                }
            )
            .slice(0, 5);


    if (!applications.length) {

        container.innerHTML = `
            <div class="empty-state">
                No applications yet.
                Start by finding an approval.
            </div>
        `;

        return;
    }


    container.innerHTML =
        applications.map(
            applicationCardHTML
        ).join("");

}


/* =====================================================
   APPROVALS
===================================================== */

function renderApprovals() {

    const grid =
        document.getElementById(
            "approvalGrid"
        );


    if (!grid) return;


    const search =
        (
            document.getElementById(
                "approvalSearch"
            )?.value || ""
        )
        .toLowerCase()
        .trim();


    const category =
        document.getElementById(
            "approvalCategory"
        )?.value || "all";


    const filtered =
        approvals.filter(
            function (approval) {

                const matchesSearch =
                    approval.name
                        .toLowerCase()
                        .includes(search) ||
                    approval.description
                        .toLowerCase()
                        .includes(search);


                const matchesCategory =
                    category === "all" ||
                    approval.category === category;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    if (!filtered.length) {

        grid.innerHTML = `
            <div class="empty-state">
                No matching approvals found.
            </div>
        `;

        return;
    }


    grid.innerHTML =
        filtered.map(
            function (approval) {

                return `
                    <div class="approval-card">

                        <h3>
                            ${escapeHTML(approval.name)}
                        </h3>

                        <p>
                            ${escapeHTML(approval.description)}
                        </p>

                        <div class="approval-meta">

                            <span class="meta-tag">
                                ⏱ ${escapeHTML(approval.timeline)}
                            </span>

                            <span class="meta-tag">
                                📄 ${approval.documents.length} Documents
                            </span>

                        </div>

                        <button
                            class="primary-button"
                            onclick="openApplicationModal('${approval.id}')"
                        >
                            Start Application
                        </button>

                    </div>
                `;

            }
        ).join("");

}


/* =====================================================
   APPLICATION MODAL
===================================================== */

let selectedApproval = null;


function openApplicationModal(approvalId) {

    const approval =
        approvals.find(
            function (item) {
                return item.id === approvalId;
            }
        );


    if (!approval) return;


    selectedApproval =
        approval;


    setText(
        "applicationModalTitle",
        "Apply for " + approval.name
    );


    setText(
        "applicationModalDescription",
        approval.description +
        " Estimated timeline: " +
        approval.timeline
    );


    setValue(
        "selectedApprovalId",
        approval.id
    );


    const settings =
        getSettings();


    setValue(
        "applicationBusinessName",
        settings.businessName || ""
    );


    setValue(
        "applicationBusinessType",
        settings.businessType || ""
    );


    const required =
        document.getElementById(
            "requiredDocuments"
        );


    required.innerHTML =
        approval.documents.map(
            function (documentName) {

                return `
                    <div>
                        📄 ${escapeHTML(documentName)}
                    </div>
                `;

            }
        ).join("");


    document
        .getElementById(
            "applicationModal"
        )
        .classList.remove("hidden");

}


function closeApplicationModal() {

    document
        .getElementById(
            "applicationModal"
        )
        .classList.add("hidden");

    selectedApproval = null;

}


/* =====================================================
   SUBMIT APPLICATION
===================================================== */

function submitApplication(event) {

    event.preventDefault();


    const session =
        getSession();


    if (!session) {

        window.location.href =
            "../login.html";

        return;
    }


    if (!selectedApproval) {

        showToast(
            "Please select an approval."
        );

        return;
    }


    const applications =
        getApplications();


    const now =
        new Date();


    const deadline =
        new Date(now);


    deadline.setDate(
        deadline.getDate() + 15
    );


    const application = {

        id:
            "APP-" +
            Date.now() +
            "-" +
            Math.floor(
                Math.random() * 1000
            ),

        approvalId:
            selectedApproval.id,

        approvalType:
            selectedApproval.name,

        approval:
            selectedApproval.name,

        businessName:
            getValue(
                "applicationBusinessName"
            ),

        businessType:
            getValue(
                "applicationBusinessType"
            ),

        industryType:
            getValue(
                "industryType"
            ),

        businessLocation:
            getValue(
                "businessLocation"
            ),

        location:
            getValue(
                "businessLocation"
            ),

        investment:
            getValue(
                "investment"
            ),

        employeeCount:
            getValue(
                "employeeCount"
            ),

        requiredDocuments:
            selectedApproval.documents,

        documents:
            [],

        documentsVerified:
            false,

        inspectionStatus:
            null,

        inspectionDate:
            null,

        inspectionTime:
            null,

        inspectionDateTime:
            null,

        status:
            "Application Received",

        submittedAt:
            now.toISOString(),

        deadline:
            deadline.toISOString(),

        ownerIdentity:
            session.identity,

        ownerName:
            session.name || session.identity

    };


    applications.push(
        application
    );


    saveApplications(
        applications
    );


    closeApplicationModal();

    refreshDashboard();

    renderApplications();

    renderInspections();

    refreshNotifications();


    navigateTo(
        "applications"
    );


    showToast(
        "Application submitted successfully."
    );

}


/* =====================================================
   APPLICATION LIST
===================================================== */

function renderApplications() {

    const container =
        document.getElementById(
            "applicationList"
        );


    if (!container) return;


    const applications =
        getApplications()
            .slice()
            .sort(
                function (a, b) {

                    return new Date(
                        b.submittedAt || 0
                    ) -
                    new Date(
                        a.submittedAt || 0
                    );

                }
            );


    if (!applications.length) {

        container.innerHTML = `
            <div class="empty-state">
                You have not submitted any applications yet.
            </div>
        `;

        return;
    }


    container.innerHTML =
        applications
            .map(
                applicationCardHTML
            )
            .join("");

}


function applicationCardHTML(application) {

    const statusClass =
        getStatusClass(
            application.status
        );


    return `
        <div class="application-card">

            <div class="application-main">

                <h3>
                    ${escapeHTML(
                        application.approvalType ||
                        application.approval ||
                        "Application"
                    )}
                </h3>

                <p>
                    Application ID:
                    ${escapeHTML(application.id)}
                </p>

                <p>
                    Submitted:
                    ${formatDate(application.submittedAt)}
                </p>

                <span class="status-badge ${statusClass}">
                    ${escapeHTML(application.status || "Pending")}
                </span>

            </div>

            <div class="document-actions">

                <button
                    class="small-button"
                    onclick="viewApplicationDetails('${application.id}')"
                >
                    View Details
                </button>

                <button
                    class="small-button delete"
                    onclick="deleteApplication('${application.id}')"
                >
                    Delete
                </button>

            </div>

        </div>
    `;

}


/* =====================================================
   APPLICATION DETAILS
===================================================== */

function viewApplicationDetails(applicationId) {

    const applications =
        getApplications();


    const application =
        applications.find(
            function (item) {

                return item.id === applicationId;

            }
        );


    if (!application) {

        showToast(
            "Application not found."
        );

        return;
    }


    const documents =
        Array.isArray(
            application.documents
        )
            ? application.documents
            : [];


    const required =
        Array.isArray(
            application.requiredDocuments
        )
            ? application.requiredDocuments
            : [];


    document.getElementById(
        "detailsContent"
    ).innerHTML = `

        <h2>
            ${escapeHTML(
                application.approvalType ||
                application.approval
            )}
        </h2>

        <div class="details-block">

            <p>
                <strong>Application ID:</strong>
                ${escapeHTML(application.id)}
            </p>

            <p>
                <strong>Status:</strong>
                ${escapeHTML(application.status)}
            </p>

            <p>
                <strong>Business:</strong>
                ${escapeHTML(application.businessName)}
            </p>

            <p>
                <strong>Business Type:</strong>
                ${escapeHTML(application.businessType)}
            </p>

            <p>
                <strong>Location:</strong>
                ${escapeHTML(application.location || "")}
            </p>

            <p>
                <strong>Submitted:</strong>
                ${formatDate(application.submittedAt)}
            </p>

        </div>


        <h3 style="margin:20px 0 10px;">
            Required Documents
        </h3>

        ${
            required.length
                ? required.map(
                    function (name) {

                        const uploaded =
                            documents.some(
                                function (doc) {

                                    return normalize(
                                        doc.name
                                    ) === normalize(
                                        name
                                    );

                                }
                            );

                        return `
                            <div class="document-card">

                                <div class="document-icon">
                                    ${uploaded ? "✅" : "⚠️"}
                                </div>

                                <div class="document-info">

                                    <strong>
                                        ${escapeHTML(name)}
                                    </strong>

                                    <small>
                                        ${
                                            uploaded
                                                ? "Uploaded"
                                                : "Not uploaded"
                                        }
                                    </small>

                                </div>

                            </div>
                        `;

                    }
                ).join("")
                : `<p>No required documents listed.</p>`
        }

    `;


    document
        .getElementById(
            "detailsModal"
        )
        .classList.remove("hidden");

}


function closeDetailsModal() {

    document
        .getElementById(
            "detailsModal"
        )
        .classList.add("hidden");

}


/* =====================================================
   DELETE APPLICATION
===================================================== */

function deleteApplication(applicationId) {

    const applications =
        getApplications();


    const application =
        applications.find(
            function (item) {

                return item.id === applicationId;

            }
        );


    if (!application) return;


    const confirmed =
        confirm(
            "Are you sure you want to delete this application?"
        );


    if (!confirmed) {
        return;
    }


    const updated =
        applications.filter(
            function (item) {

                return item.id !== applicationId;

            }
        );


    saveApplications(
        updated
    );


    refreshDashboard();

    renderApplications();

    renderInspections();

    refreshNotifications();


    showToast(
        "Application deleted."
    );

}


/* =====================================================
   DOCUMENTS
===================================================== */

function uploadDocument(event) {

    const file =
        event.target.files?.[0];


    if (!file) return;


    const reader =
        new FileReader();


    reader.onload = function () {

        const documents =
            getDocuments();


        const documentData = {

            id:
                "DOC-" +
                Date.now(),

            name:
                file.name,

            type:
                file.type,

            size:
                file.size,

            dataUrl:
                reader.result,

            uploadedAt:
                new Date().toISOString()

        };


        documents.push(
            documentData
        );


        try {

            saveDocuments(
                documents
            );

            renderDocuments();

            showToast(
                "Document uploaded successfully."
            );

        } catch (error) {

            showToast(
                "File is too large for browser storage."
            );

        }


        event.target.value = "";

    };


    reader.readAsDataURL(file);

}


function renderDocuments() {

    const container =
        document.getElementById(
            "documentList"
        );


    if (!container) return;


    const documents =
        getDocuments();


    if (!documents.length) {

        container.innerHTML = `
            <div class="empty-state">
                No documents uploaded yet.
            </div>
        `;

        return;
    }


    container.innerHTML =
        documents.map(
            function (doc) {

                return `
                    <div class="document-card">

                        <div class="document-icon">
                            📄
                        </div>

                        <div class="document-info">

                            <strong>
                                ${escapeHTML(doc.name)}
                            </strong>

                            <small>
                                ${formatFileSize(doc.size)}
                                •
                                ${formatDate(doc.uploadedAt)}
                            </small>

                        </div>

                        <div class="document-actions">

                            <button
                                class="small-button"
                                onclick="viewDocument('${doc.id}')"
                            >
                                View
                            </button>

                            <button
                                class="small-button delete"
                                onclick="removeDocument('${doc.id}')"
                            >
                                Remove
                            </button>

                        </div>

                    </div>
                `;

            }
        ).join("");

}


function viewDocument(documentId) {

    const documentData =
        getDocuments().find(
            function (doc) {

                return doc.id === documentId;

            }
        );


    if (!documentData) return;


    if (!documentData.dataUrl) {

        showToast(
            "Document preview is unavailable."
        );

        return;
    }


    const previewWindow =
        window.open(
            "",
            "_blank"
        );


    if (!previewWindow) {

        showToast(
            "Please allow pop-ups to preview the document."
        );

        return;
    }


    if (
        documentData.type &&
        documentData.type.startsWith("image/")
    ) {

        previewWindow.document.write(
            `<img src="${documentData.dataUrl}" style="max-width:100%;">`
        );

    } else if (
        documentData.type === "application/pdf"
    ) {

        previewWindow.document.write(
            `<iframe src="${documentData.dataUrl}" style="width:100%;height:100vh;border:0;"></iframe>`
        );

    } else {

        previewWindow.location.href =
            documentData.dataUrl;

    }

}


function removeDocument(documentId) {

    const confirmed =
        confirm(
            "Remove this document?"
        );


    if (!confirmed) return;


    const documents =
        getDocuments()
            .filter(
                function (doc) {

                    return doc.id !== documentId;

                }
            );


    saveDocuments(
        documents
    );


    renderDocuments();


    showToast(
        "Document removed."
    );

}


/* =====================================================
   COMPLIANCE
===================================================== */

function renderCompliance() {

    const container =
        document.getElementById(
            "complianceList"
        );


    if (!container) return;


    const applications =
        getApplications();


    if (!applications.length) {

        container.innerHTML = `
            <div class="empty-state">
                Submit an application to see your compliance checklist.
            </div>
        `;

        return;
    }


    container.innerHTML =
        applications.map(
            function (app) {

                const required =
                    app.requiredDocuments || [];


                const documents =
                    app.documents || [];


                const uploaded =
                    required.filter(
                        function (requiredName) {

                            return documents.some(
                                function (doc) {

                                    return normalize(
                                        doc.name
                                    ) === normalize(
                                        requiredName
                                    );

                                }
                            );

                        }
                    ).length;


                const percentage =
                    required.length
                        ? Math.round(
                            uploaded /
                            required.length *
                            100
                        )
                        : 100;


                return `
                    <div class="application-card">

                        <div class="application-main">

                            <h3>
                                ${escapeHTML(
                                    app.approvalType ||
                                    app.approval
                                )}
                            </h3>

                            <p>
                                Documents:
                                ${uploaded}/${required.length}
                            </p>

                            <span class="status-badge">
                                ${percentage}% Complete
                            </span>

                        </div>

                    </div>
                `;

            }
        ).join("");

}


/* =====================================================
   SCHEMES
===================================================== */

function renderSchemes() {

    const grid =
        document.getElementById(
            "schemeGrid"
        );


    if (!grid) return;


    const schemes = [

        {
            title: "MSME Support Scheme",
            description:
                "Support opportunities for eligible micro, small and medium enterprises."
        },

        {
            title: "Technology Upgrade Support",
            description:
                "Potential support for technology modernization and productivity improvements."
        },

        {
            title: "Employment Support",
            description:
                "Potential incentives related to employment generation."
        },

        {
            title: "Green Industry Support",
            description:
                "Explore support opportunities for environmentally responsible industrial practices."
        }

    ];


    grid.innerHTML =
        schemes.map(
            function (scheme) {

                return `
                    <div class="scheme-card">

                        <h3>
                            ${escapeHTML(scheme.title)}
                        </h3>

                        <p>
                            ${escapeHTML(scheme.description)}
                        </p>

                        <button
                            class="outline-button"
                            onclick="showToast('Scheme details can be connected to the official scheme database.')"
                        >
                            View Scheme
                        </button>

                    </div>
                `;

            }
        ).join("");

}


/* =====================================================
   INSPECTIONS
===================================================== */

function renderInspections() {

    const container =
        document.getElementById(
            "inspectionList"
        );


    if (!container) return;


    const applications =
        getApplications()
            .filter(
                function (app) {

                    return (
                        app.inspectionDateTime ||
                        app.inspectionStatus ||
                        [
                            "Inspection Scheduled",
                            "Inspection Completed"
                        ].includes(app.status)
                    );

                }
            );


    if (!applications.length) {

        container.innerHTML = `
            <div class="empty-state">
                No inspections scheduled yet.
            </div>
        `;

        return;
    }


    container.innerHTML =
        applications.map(
            function (app) {

                return `
                    <div class="inspection-card">

                        <h3>
                            ${escapeHTML(
                                app.approvalType ||
                                app.approval
                            )}
                        </h3>

                        <p>
                            Application ID:
                            ${escapeHTML(app.id)}
                        </p>

                        <p>
                            ${
                                app.inspectionDateTime
                                    ? "Scheduled: " +
                                      formatDateTime(
                                          app.inspectionDateTime
                                      )
                                    : "Inspection status: " +
                                      escapeHTML(
                                          app.inspectionStatus ||
                                          app.status
                                      )
                            }
                        </p>

                    </div>
                `;

            }
        ).join("");

}


/* =====================================================
   GRIEVANCES
===================================================== */

function getGrievances() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    GRIEVANCES_KEY
                )
            );


        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        return [];

    }

}


function saveGrievances(grievances) {

    localStorage.setItem(
        GRIEVANCES_KEY,
        JSON.stringify(grievances)
    );

}


function openGrievanceModal() {

    populateGrievanceApplications();

    document
        .getElementById(
            "grievanceModal"
        )
        .classList.remove("hidden");

}


function closeGrievanceModal() {

    document
        .getElementById(
            "grievanceModal"
        )
        .classList.add("hidden");

}


function populateGrievanceApplications() {

    const select =
        document.getElementById(
            "grievanceApplication"
        );


    if (!select) return;


    const applications =
        getApplications();


    select.innerHTML = `
        <option value="">
            General Issue
        </option>
    `;


    applications.forEach(
        function (app) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                app.id;


            option.textContent =
                (
                    app.approvalType ||
                    app.approval ||
                    "Application"
                ) +
                " - " +
                app.id;


            select.appendChild(
                option
            );

        }
    );

}


function submitGrievance(event) {

    event.preventDefault();


    const session =
        getSession();


    if (!session) return;


    const grievances =
        getGrievances();


    const grievance = {

        id:
            "GRV-" +
            Date.now(),

        applicationId:
            getValue(
                "grievanceApplication"
            ),

        subject:
            getValue(
                "grievanceSubject"
            ),

        description:
            getValue(
                "grievanceDescription"
            ),

        status:
            "Submitted",

        createdAt:
            new Date().toISOString(),

        ownerIdentity:
            session.identity

    };


    grievances.push(
        grievance
    );


    saveGrievances(
        grievances
    );


    document
        .getElementById(
            "grievanceModal"
        )
        .classList.add("hidden");


    document.querySelector(
        "#grievanceModal form"
    ).reset();


    renderGrievances();

    refreshNotifications();


    showToast(
        "Grievance submitted successfully."
    );

}


function renderGrievances() {

    const container =
        document.getElementById(
            "grievanceList"
        );


    if (!container) return;


    const grievances =
        getGrievances();


    if (!grievances.length) {

        container.innerHTML = `
            <div class="empty-state">
                No grievances submitted.
            </div>
        `;

        return;
    }


    container.innerHTML =
        grievances
            .slice()
            .reverse()
            .map(
                function (grievance) {

                    return `
                        <div class="grievance-card">

                            <h3>
                                ${escapeHTML(
                                    grievance.subject
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    grievance.description
                                )}
                            </p>

                            <p>
                                Status:
                                <strong>
                                    ${escapeHTML(
                                        grievance.status
                                    )}
                                </strong>
                            </p>

                            <p>
                                Submitted:
                                ${formatDate(
                                    grievance.createdAt
                                )}
                            </p>

                        </div>
                    `;

                }
            ).join("");

}


/* =====================================================
   SETTINGS
===================================================== */

function getSettings() {

    try {

        return JSON.parse(
            localStorage.getItem(
                SETTINGS_KEY
            )
        ) || {};

    } catch (error) {

        return {};

    }

}


function loadSettings() {

    const settings =
        getSettings();


    setValue(
        "settingsBusinessName",
        settings.businessName || ""
    );


    setValue(
        "settingsBusinessType",
        settings.businessType || ""
    );

}


function saveSettings() {

    const settings = {

        businessName:
            getValue(
                "settingsBusinessName"
            ),

        businessType:
            getValue(
                "settingsBusinessType"
            )

    };


    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
    );


    loadUserProfile();


    showToast(
        "Settings saved successfully."
    );

}


/* =====================================================
   NOTIFICATION SYSTEM
===================================================== */

/*
   Notifications are generated from the shared
   application/grievance data.

   No Government Portal switch exists here.
*/

function getReadNotificationIds() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    NOTIFICATION_READ_KEY
                )
            );


        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        return [];

    }

}


function saveReadNotificationIds(ids) {

    localStorage.setItem(
        NOTIFICATION_READ_KEY,
        JSON.stringify(ids)
    );

}


/* -----------------------------
   CREATE NOTIFICATIONS
----------------------------- */

function buildNotifications() {

    const applications =
        getApplications();


    const grievances =
        getGrievances();


    const notifications = [];


    /* APPLICATION NOTIFICATIONS */

    applications.forEach(
        function (app) {

            const name =
                app.approvalType ||
                app.approval ||
                "Application";


            const appId =
                app.id;


            const submittedTime =
                app.submittedAt
                    ? new Date(
                        app.submittedAt
                    ).getTime()
                    : 0;


            /* Application received */

            notifications.push({

                id:
                    appId +
                    "-received",

                type:
                    "application",

                icon:
                    "📋",

                title:
                    "Application Received",

                message:
                    name +
                    " application has been received.",

                time:
                    app.submittedAt ||
                    new Date().toISOString(),

                timestamp:
                    submittedTime

            });


            /* Status */

            if (
                app.status &&
                app.status !== "Application Received"
            ) {

                const statusTime =
                    app.updatedAt ||
                    app.submittedAt ||
                    new Date().toISOString();


                notifications.push({

                    id:
                        appId +
                        "-status-" +
                        app.status,

                    type:
                        "status",

                    icon:
                        getStatusIcon(
                            app.status
                        ),

                    title:
                        "Application Status Updated",

                    message:
                        name +
                        " is now " +
                        app.status +
                        ".",

                    time:
                        statusTime,

                    timestamp:
                        new Date(
                            statusTime
                        ).getTime()

                });

            }


            /* Inspection */

            if (app.inspectionDateTime) {

                notifications.push({

                    id:
                        appId +
                        "-inspection-" +
                        app.inspectionDateTime,

                    type:
                        "inspection",

                    icon:
                        "🔎",

                    title:
                        "Inspection Scheduled",

                    message:
                        name +
                        " inspection is scheduled for " +
                        formatDateTime(
                            app.inspectionDateTime
                        ) +
                        ".",

                    time:
                        app.inspectionDateTime,

                    timestamp:
                        new Date(
                            app.inspectionDateTime
                        ).getTime()

                });

            }

        }
    );


    /* GRIEVANCES */

    grievances.forEach(
        function (grievance) {

            notifications.push({

                id:
                    grievance.id +
                    "-created",

                type:
                    "grievance",

                icon:
                    "⚠️",

                title:
                    "Grievance Submitted",

                message:
                    "Your grievance \"" +
                    grievance.subject +
                    "\" has been submitted.",

                time:
                    grievance.createdAt,

                timestamp:
                    new Date(
                        grievance.createdAt
                    ).getTime()

            });


            if (
                grievance.status &&
                grievance.status !== "Submitted"
            ) {

                notifications.push({

                    id:
                        grievance.id +
                        "-status-" +
                        grievance.status,

                    type:
                        "grievance",

                    icon:
                        "🔔",

                    title:
                        "Grievance Updated",

                    message:
                        "Grievance \"" +
                        grievance.subject +
                        "\" is now " +
                        grievance.status +
                        ".",

                    time:
                        grievance.updatedAt ||
                        grievance.createdAt,

                    timestamp:
                        new Date(
                            grievance.updatedAt ||
                            grievance.createdAt
                        ).getTime()

                });

            }

        }
    );


    return notifications
        .sort(
            function (a, b) {

                return b.timestamp -
                    a.timestamp;

            }
        );

}


/* -----------------------------
   REFRESH NOTIFICATIONS
----------------------------- */

function refreshNotifications() {

    const notifications =
        buildNotifications();


    const readIds =
        getReadNotificationIds();


    const unread =
        notifications.filter(
            function (notification) {

                return !readIds.includes(
                    notification.id
                );

            }
        );


    const count =
        document.getElementById(
            "notificationCount"
        );


    const list =
        document.getElementById(
            "notificationList"
        );


    const summary =
        document.getElementById(
            "notificationSummary"
        );


    if (count) {

        count.textContent =
            unread.length;


        count.classList.toggle(
            "hidden-count",
            unread.length === 0
        );

    }


    if (summary) {

        summary.textContent =
            unread.length
                ? unread.length +
                  " unread notification" +
                  (
                    unread.length > 1
                        ? "s"
                        : ""
                  )
                : "No new notifications";

    }


    if (!list) return;


    if (!notifications.length) {

        list.innerHTML = `
            <div class="empty-notifications">
                🔔<br><br>
                You're all caught up.
            </div>
        `;

        return;
    }


    list.innerHTML =
        notifications
            .map(
                function (notification) {

                    const isUnread =
                        !readIds.includes(
                            notification.id
                        );


                    return `
                        <div
                            class="notification-item ${
                                isUnread
                                    ? "unread"
                                    : ""
                            }"
                            onclick="readNotification('${notification.id}')"
                        >

                            <div class="notification-icon">
                                ${notification.icon}
                            </div>

                            <div class="notification-content">

                                <strong>
                                    ${escapeHTML(
                                        notification.title
                                    )}
                                </strong>

                                <p>
                                    ${escapeHTML(
                                        notification.message
                                    )}
                                </p>

                                <span class="notification-time">
                                    ${formatDateTime(
                                        notification.time
                                    )}
                                </span>

                            </div>

                        </div>
                    `;

                }
            ).join("");

}


/* -----------------------------
   TOGGLE NOTIFICATIONS
----------------------------- */

function toggleNotifications() {

    const panel =
        document.getElementById(
            "notificationPanel"
        );


    if (!panel) return;


    panel.classList.toggle(
        "hidden"
    );


    refreshNotifications();

}


/* -----------------------------
   READ ONE
----------------------------- */

function readNotification(id) {

    const readIds =
        getReadNotificationIds();


    if (!readIds.includes(id)) {

        readIds.push(id);

        saveReadNotificationIds(
            readIds
        );

    }


    refreshNotifications();

}


/* -----------------------------
   MARK ALL READ
----------------------------- */

function markAllNotificationsRead() {

    const notifications =
        buildNotifications();


    const ids =
        notifications.map(
            function (notification) {

                return notification.id;

            }
        );


    saveReadNotificationIds(
        ids
    );


    refreshNotifications();


    showToast(
        "All notifications marked as read."
    );

}


/* =====================================================
   REAL-TIME DATA REFRESH
===================================================== */

/*
   When Government changes application status in the
   same browser, the Business portal receives the
   storage event and refreshes automatically.
*/

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key === APPLICATIONS_KEY ||
            event.key === GRIEVANCES_KEY ||
            event.key === DOCUMENTS_KEY
        ) {

            refreshDashboard();

            renderApplications();

            renderInspections();

            renderCompliance();

            renderGrievances();

            refreshNotifications();

        }

    }
);


/*
   Also refresh when user returns to this tab.
*/

document.addEventListener(
    "visibilitychange",
    function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            refreshDashboard();

            renderApplications();

            renderInspections();

            renderCompliance();

            renderGrievances();

            refreshNotifications();

        }

    }
);


/* =====================================================
   AI DOUBT CLARIFIER
===================================================== */

function handleAIKey(event) {

    if (event.key === "Enter") {

        askAI();

    }

}


function askAI() {

    const question =
        getValue(
            "aiQuestion"
        )
        .toLowerCase()
        .trim();


    const answer =
        document.getElementById(
            "aiAnswer"
        );


    if (!answer) return;


    if (!question) {

        answer.textContent =
            "Please enter your question.";

        return;
    }


    let response =
        "I can help with approvals, documents, timelines, inspections, status, grievances and schemes.";


    if (
        question.includes("labour") ||
        question.includes("labor")
    ) {

        response =
            "Labour Registration generally requires business registration, tax details, address proof, employee details and owner identity proof.";

    } else if (
        question.includes("document") ||
        question.includes("docs")
    ) {

        response =
            "Open Documents to upload your files. The required documents for each approval are also shown when you start an application.";

    } else if (
        question.includes("time") ||
        question.includes("days") ||
        question.includes("timeline")
    ) {

        response =
            "Approval timelines vary by approval type. Each approval card displays an estimated processing timeline.";

    } else if (
        question.includes("inspection")
    ) {

        response =
            "Once document verification is completed, an eligible application can move to inspection. Scheduled inspections appear under Inspections.";

    } else if (
        question.includes("status") ||
        question.includes("track")
    ) {

        response =
            "Open My Applications to view the latest status of your submitted applications.";

    } else if (
        question.includes("grievance") ||
        question.includes("complaint")
    ) {

        response =
            "Open Grievances and select Raise Grievance to submit an issue for review.";

    } else if (
        question.includes("scheme") ||
        question.includes("subsidy") ||
        question.includes("incentive")
    ) {

        response =
            "Open Schemes to explore possible government support and incentive opportunities.";

    }


    answer.textContent =
        response;

}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmed) {
        return;
    }


    sessionStorage.removeItem(
        SESSION_KEY
    );


    window.location.href =
        "../login.html";

}


/* =====================================================
   TOAST
===================================================== */

let toastTimer = null;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) return;


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =====================================================
   HELPERS
===================================================== */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value;

    }

}


function getValue(elementId) {

    const element =
        document.getElementById(
            elementId
        );


    return element
        ? element.value.trim()
        : "";

}


function setValue(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.value =
            value;

    }

}


function normalize(value) {

    return String(
        value || ""
    )
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

}


function escapeHTML(value) {

    return String(
        value || ""
    )
    .replace(
        /[&<>"']/g,
        function (char) {

            const entities = {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            };


            return entities[char];

        }
    );

}


function formatDate(date) {

    if (!date) {
        return "—";
    }


    const parsed =
        new Date(date);


    if (Number.isNaN(
        parsed.getTime()
    )) {

        return "—";
    }


    return parsed.toLocaleDateString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function formatDateTime(date) {

    if (!date) {
        return "—";
    }


    const parsed =
        new Date(date);


    if (Number.isNaN(
        parsed.getTime()
    )) {

        return "—";
    }


    return parsed.toLocaleString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


function formatFileSize(bytes) {

    if (!bytes) {
        return "0 KB";
    }


    if (bytes < 1024) {
        return bytes + " B";
    }


    if (bytes < 1024 * 1024) {

        return (
            bytes / 1024
        ).toFixed(1) + " KB";

    }


    return (
        bytes /
        (1024 * 1024)
    ).toFixed(1) + " MB";

}


function getStatusClass(status) {

    if (status === "Approved") {
        return "status-approved";
    }


    if (status === "Rejected") {
        return "status-rejected";
    }


    if (
        status === "Final Review" ||
        status === "Inspection Completed" ||
        status === "Inspection Scheduled"
    ) {

        return "status-review";

    }


    return "";

}


function getStatusIcon(status) {

    if (status === "Approved") {
        return "✅";
    }

    if (status === "Rejected") {
        return "❌";
    }

    if (
        status === "Inspection Scheduled" ||
        status === "Inspection Completed"
    ) {
        return "🔎";
    }

    if (
        status === "Changes Requested"
    ) {
        return "⚠️";
    }

    return "🔔";

}


/* =====================================================
   CLOSE NOTIFICATION WHEN CLICKING OUTSIDE
===================================================== */

document.addEventListener(
    "click",
    function (event) {

        const wrapper =
            document.querySelector(
                ".notification-wrapper"
            );


        const panel =
            document.getElementById(
                "notificationPanel"
            );


        if (
            wrapper &&
            panel &&
            !wrapper.contains(event.target)
        ) {

            panel.classList.add(
                "hidden"
            );

        }

    }
);