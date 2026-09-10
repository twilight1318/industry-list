/* =========================================================
   INDUSTRIAL ASSIST - GOVERNMENT PORTAL
   Shared data:
   industrialAssistApplications
   industrialAssistGrievances
   industrialAssistBusinessAccounts
   industrialAssistGovernmentNotifications
========================================================= */


/* =========================================================
   1. GOVERNMENT ROLE PROTECTION
========================================================= */

(function protectGovernmentDashboard() {

    const rawSession =
        sessionStorage.getItem("industrialAssistSession");

    if (!rawSession) {
        window.location.href = "../login.html";
        return;
    }

    try {

        const session = JSON.parse(rawSession);

        if (!session || session.role !== "government") {
            sessionStorage.removeItem("industrialAssistSession");
            window.location.href = "../login.html";
            return;
        }

        if (session.expiresAt && Date.now() > session.expiresAt) {
            sessionStorage.removeItem("industrialAssistSession");
            window.location.href = "../login.html";
        }

    } catch (error) {

        sessionStorage.removeItem("industrialAssistSession");
        window.location.href = "../login.html";
    }

})();


/* =========================================================
   2. CONSTANTS
========================================================= */

const APPLICATION_KEY = "industrialAssistApplications";
const GRIEVANCE_KEY = "industrialAssistGrievances";
const GOVERNMENT_NOTIFICATION_KEY =
    "industrialAssistGovernmentNotifications";

const READ_NOTIFICATION_KEY =
    "industrialAssistGovernmentReadNotifications";


/* =========================================================
   3. SESSION
========================================================= */

function getSession() {

    try {

        return JSON.parse(
            sessionStorage.getItem("industrialAssistSession")
        );

    } catch (error) {

        return null;
    }
}


/* =========================================================
   4. STORAGE HELPERS
========================================================= */

function getApplications() {

    try {

        const data = localStorage.getItem(APPLICATION_KEY);

        if (!data) return [];

        const parsed = JSON.parse(data);

        return Array.isArray(parsed) ? parsed : [];

    } catch (error) {

        console.error("Application storage error:", error);

        return [];
    }
}


function saveApplications(applications) {

    localStorage.setItem(
        APPLICATION_KEY,
        JSON.stringify(applications)
    );

    window.dispatchEvent(
        new StorageEvent("storage", {
            key: APPLICATION_KEY,
            newValue: JSON.stringify(applications)
        })
    );
}


function getGrievances() {

    try {

        const data = localStorage.getItem(GRIEVANCE_KEY);

        if (!data) return [];

        const parsed = JSON.parse(data);

        return Array.isArray(parsed) ? parsed : [];

    } catch (error) {

        console.error("Grievance storage error:", error);

        return [];
    }
}


function saveGrievances(grievances) {

    localStorage.setItem(
        GRIEVANCE_KEY,
        JSON.stringify(grievances)
    );

    window.dispatchEvent(
        new StorageEvent("storage", {
            key: GRIEVANCE_KEY,
            newValue: JSON.stringify(grievances)
        })
    );
}


/* =========================================================
   5. SAFE TEXT
========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   6. DATE HELPERS
========================================================= */

function formatDate(dateValue) {

    if (!dateValue) return "Not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return escapeHTML(dateValue);
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function formatDateTime(dateValue) {

    if (!dateValue) return "Not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return escapeHTML(dateValue);
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* =========================================================
   7. SLA
========================================================= */

function getDeadlineDate(application) {

    if (application.deadline) {

        const deadline = new Date(application.deadline);

        if (!Number.isNaN(deadline.getTime())) {
            return deadline;
        }
    }

    if (application.submittedAt) {

        const date = new Date(application.submittedAt);

        if (!Number.isNaN(date.getTime())) {

            date.setDate(date.getDate() + 15);

            return date;
        }
    }

    return null;
}


function getSLAState(application) {

    if (
        application.status === "Approved" ||
        application.status === "Rejected"
    ) {
        return {
            state: "Completed",
            className: "gray",
            days: null
        };
    }

    const deadline = getDeadlineDate(application);

    if (!deadline) {

        return {
            state: "Unknown",
            className: "gray",
            days: null
        };
    }

    const now = new Date();

    const difference =
        deadline.getTime() - now.getTime();

    const days =
        Math.ceil(
            difference / (1000 * 60 * 60 * 24)
        );

    if (days < 0) {

        return {
            state: "Delayed",
            className: "red",
            days
        };
    }

    if (days <= 3) {

        return {
            state: "Due Soon",
            className: "orange",
            days
        };
    }

    return {
        state: "On Track",
        className: "green",
        days
    };
}


/* =========================================================
   8. STATUS CLASS
========================================================= */

function getStatusClass(status) {

    switch (status) {

        case "Approved":
            return "green";

        case "Rejected":
            return "red";

        case "Changes Requested":
            return "orange";

        case "Inspection Scheduled":
        case "Final Review":
            return "purple";

        case "Inspection Completed":
            return "blue";

        case "Document Verification":
        case "Application Received":
            return "orange";

        default:
            return "gray";
    }
}


/* =========================================================
   9. INIT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadOfficerDetails();

    refreshEverything();

    setInterval(() => {
        refreshEverything();
    }, 5000);

});


/* =========================================================
   10. OFFICER DETAILS
========================================================= */

function loadOfficerDetails() {

    const session = getSession();

    if (!session) return;

    const name =
        session.name ||
        "Government Officer";

    const identity =
        session.identity ||
        "Officer";

    const initials =
        name
            .split(" ")
            .map(word => word.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();

    document.getElementById("sidebarOfficerName").textContent = name;
    document.getElementById("sidebarOfficerId").textContent = identity;

    document.getElementById("topOfficerName").textContent = name;
    document.getElementById("topOfficerId").textContent = identity;

    document.getElementById("sidebarAvatar").textContent = initials;
    document.getElementById("topAvatar").textContent = initials;
}


/* =========================================================
   11. REFRESH ALL
========================================================= */

function refreshEverything() {

    const applications = getApplications();
    const grievances = getGrievances();

    renderStats(applications, grievances);
    renderRecentApplications(applications);
    renderPendingActions(applications, grievances);

    renderApplications();
    renderDocuments();
    renderInspections();
    renderSLA();
    renderGrievances();
    renderReports();

    refreshGovernmentNotifications();
}


/* =========================================================
   12. STATS
========================================================= */

function renderStats(applications, grievances) {

    const pendingVerification =
        applications.filter(app =>
            !app.documentsVerified &&
            app.status !== "Approved" &&
            app.status !== "Rejected"
        ).length;

    const inspections =
        applications.filter(app =>
            app.status === "Inspection Scheduled" ||
            app.status === "Inspection Completed"
        ).length;

    const delayed =
        applications.filter(app =>
            getSLAState(app).state === "Delayed"
        ).length;

    const approved =
        applications.filter(app =>
            app.status === "Approved"
        ).length;

    const openGrievances =
        grievances.filter(g =>
            g.status !== "Resolved" &&
            g.status !== "Rejected"
        ).length;

    document.getElementById("statApplications").textContent =
        applications.length;

    document.getElementById("statVerification").textContent =
        pendingVerification;

    document.getElementById("statInspections").textContent =
        inspections;

    document.getElementById("statDelayed").textContent =
        delayed;

    document.getElementById("statApproved").textContent =
        approved;

    document.getElementById("statGrievances").textContent =
        openGrievances;
}


/* =========================================================
   13. RECENT APPLICATIONS
========================================================= */

function renderRecentApplications(applications) {

    const container =
        document.getElementById("recentApplications");

    const sorted =
        [...applications]
            .sort(
                (a, b) =>
                    new Date(b.submittedAt || 0) -
                    new Date(a.submittedAt || 0)
            )
            .slice(0, 6);

    if (!sorted.length) {

        container.innerHTML = `
            <div class="empty-state">
                <strong>No applications yet</strong>
                Applications submitted by businesses will appear here.
            </div>
        `;

        return;
    }

    container.innerHTML =
        sorted.map(app => {

            return `
                <div class="application-item">

                    <div class="application-main">

                        <strong>
                            ${escapeHTML(
                                app.approvalType ||
                                app.approval ||
                                "Approval Application"
                            )}
                        </strong>

                        <p>
                            ${escapeHTML(
                                app.businessName ||
                                app.ownerName ||
                                "Business"
                            )}
                        </p>

                        <small>
                            ${formatDateTime(app.submittedAt)}
                        </small>

                    </div>

                    <div class="application-actions">

                        <span class="status ${getStatusClass(app.status)}">
                            ${escapeHTML(
                                app.status ||
                                "Application Received"
                            )}
                        </span>

                        <button
                            class="small-btn"
                            onclick="openApplication('${escapeHTML(app.id)}')"
                        >
                            View
                        </button>

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================================
   14. PENDING ACTIONS
========================================================= */

function renderPendingActions(applications, grievances) {

    const container =
        document.getElementById("pendingActions");

    const actions = [];

    applications.forEach(app => {

        if (!app.documentsVerified) {

            actions.push({
                type: "Document Verification",
                text:
                    `${app.businessName || "Business"} - ${
                        app.approvalType ||
                        app.approval ||
                        "Application"
                    }`,
                id: app.id
            });

        } else if (
            app.documentsVerified &&
            !app.inspectionDate &&
            app.status !== "Approved" &&
            app.status !== "Rejected"
        ) {

            actions.push({
                type: "Inspection",
                text:
                    `${app.businessName || "Business"} requires inspection`,
                id: app.id
            });

        } else if (
            app.status === "Final Review"
        ) {

            actions.push({
                type: "Final Review",
                text:
                    `${app.businessName || "Business"} is ready for final review`,
                id: app.id
            });

        }

    });


    grievances.forEach(grievance => {

        if (
            grievance.status !== "Resolved" &&
            grievance.status !== "Rejected"
        ) {

            actions.push({
                type: "Grievance",
                text:
                    grievance.subject ||
                    "Business grievance",
                id: grievance.id
            });

        }

    });


    if (!actions.length) {

        container.innerHTML = `
            <div class="empty-state">
                <strong>All caught up</strong>
                There are no pending actions.
            </div>
        `;

        return;
    }


    container.innerHTML =
        actions
            .slice(0, 8)
            .map(action => {

                let click = "";

                if (action.type === "Grievance") {

                    click =
                        `openGrievance('${escapeHTML(action.id)}')`;

                } else {

                    click =
                        `openApplication('${escapeHTML(action.id)}')`;
                }

                return `
                    <div class="application-item">

                        <div class="application-main">

                            <strong>
                                ${escapeHTML(action.type)}
                            </strong>

                            <p>
                                ${escapeHTML(action.text)}
                            </p>

                        </div>

                        <button
                            class="small-btn"
                            onclick="${click}"
                        >
                            Review
                        </button>

                    </div>
                `;

            }).join("");
}


/* =========================================================
   15. APPLICATIONS TABLE
========================================================= */

function renderApplications() {

    const container =
        document.getElementById("applicationsTable");

    const search =
        (
            document.getElementById("applicationSearch")
                ?.value || ""
        )
        .toLowerCase()
        .trim();

    const statusFilter =
        document.getElementById("applicationStatusFilter")
            ?.value || "all";


    let applications = getApplications();


    if (search) {

        applications =
            applications.filter(app => {

                const text = [
                    app.businessName,
                    app.businessType,
                    app.industryType,
                    app.approvalType,
                    app.approval,
                    app.id,
                    app.ownerIdentity
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return text.includes(search);
            });
    }


    if (statusFilter !== "all") {

        applications =
            applications.filter(
                app =>
                    app.status === statusFilter
            );
    }


    applications.sort(
        (a, b) =>
            new Date(b.submittedAt || 0) -
            new Date(a.submittedAt || 0)
    );


    if (!applications.length) {

        container.innerHTML = `
            <div class="empty-state">
                <strong>No applications found</strong>
                Business applications will appear here after submission.
            </div>
        `;

        return;
    }


    container.innerHTML = `
        <div class="table-wrap">

            <table>

                <thead>

                    <tr>
                        <th>Application</th>
                        <th>Business</th>
                        <th>Industry</th>
                        <th>Submitted</th>
                        <th>SLA</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>

                </thead>

                <tbody>

                    ${applications.map(app => {

                        const sla =
                            getSLAState(app);

                        return `
                            <tr>

                                <td>
                                    <strong>
                                        ${escapeHTML(
                                            app.approvalType ||
                                            app.approval ||
                                            "Approval"
                                        )}
                                    </strong>

                                    <small>
                                        ID: ${escapeHTML(app.id)}
                                    </small>
                                </td>

                                <td>
                                    <strong>
                                        ${escapeHTML(
                                            app.businessName ||
                                            "Business"
                                        )}
                                    </strong>

                                    <small>
                                        ${escapeHTML(
                                            app.ownerIdentity ||
                                            app.ownerName ||
                                            ""
                                        )}
                                    </small>
                                </td>

                                <td>
                                    ${escapeHTML(
                                        app.industryType ||
                                        app.businessType ||
                                        "-"
                                    )}
                                </td>

                                <td>
                                    ${formatDate(
                                        app.submittedAt
                                    )}
                                </td>

                                <td>
                                    <span class="status ${sla.className}">
                                        ${sla.state}
                                    </span>
                                </td>

                                <td>
                                    <span class="status ${getStatusClass(app.status)}">
                                        ${escapeHTML(
                                            app.status ||
                                            "Application Received"
                                        )}
                                    </span>
                                </td>

                                <td>
                                    <button
                                        class="small-btn"
                                        onclick="openApplication('${escapeHTML(app.id)}')"
                                    >
                                        View
                                    </button>
                                </td>

                            </tr>
                        `;

                    }).join("")}

                </tbody>

            </table>

        </div>
    `;
}


/* =========================================================
   16. OPEN APPLICATION
========================================================= */

function openApplication(applicationId) {

    const applications =
        getApplications();

    const application =
        applications.find(
            app => String(app.id) === String(applicationId)
        );

    if (!application) {

        showToast("Application not found.");

        return;
    }


    document.getElementById(
        "modalApplicationTitle"
    ).textContent =
        application.approvalType ||
        application.approval ||
        "Application Review";


    const requiredDocuments =
        Array.isArray(application.requiredDocuments)
            ? application.requiredDocuments
            : [];


    const uploadedDocuments =
        Array.isArray(application.documents)
            ? application.documents
            : [];


    const deadline =
        getDeadlineDate(application);


    const sla =
        getSLAState(application);


    document.getElementById(
        "applicationModalBody"
    ).innerHTML = `

        <div class="modal-body">

            <div class="detail-grid">

                <div class="detail-box">
                    <span>Business Name</span>
                    <strong>
                        ${escapeHTML(
                            application.businessName ||
                            "Not provided"
                        )}
                    </strong>
                </div>

                <div class="detail-box">
                    <span>Business Type</span>
                    <strong>
                        ${escapeHTML(
                            application.businessType ||
                            "Not provided"
                        )}
                    </strong>
                </div>

                <div class="detail-box">
                    <span>Industry Type</span>
                    <strong>
                        ${escapeHTML(
                            application.industryType ||
                            "Not provided"
                        )}
                    </strong>
                </div>

                <div class="detail-box">
                    <span>Owner / Account</span>
                    <strong>
                        ${escapeHTML(
                            application.ownerIdentity ||
                            application.ownerName ||
                            "Not provided"
                        )}
                    </strong>
                </div>

                <div class="detail-box">
                    <span>Business Location</span>
                    <strong>
                        ${escapeHTML(
                            application.businessLocation ||
                            application.location ||
                            "Not provided"
                        )}
                    </strong>
                </div>

                <div class="detail-box">
                    <span>Investment</span>
                    <strong>
                        ${escapeHTML(
                            application.investment ||
                            "Not provided"
                        )}
                    </strong>
                </div>

                <div class="detail-box">
                    <span>Employees</span>
                    <strong>
                        ${escapeHTML(
                            application.employeeCount ||
                            "Not provided"
                        )}
                    </strong>
                </div>

                <div class="detail-box">
                    <span>Submitted</span>
                    <strong>
                        ${formatDateTime(
                            application.submittedAt
                        )}
                    </strong>
                </div>

                <div class="detail-box">
                    <span>SLA Deadline</span>
                    <strong>
                        ${
                            deadline
                                ? formatDate(deadline)
                                : "Not available"
                        }
                    </strong>
                </div>

                <div class="detail-box">
                    <span>Current Status</span>
                    <strong>
                        ${escapeHTML(
                            application.status ||
                            "Application Received"
                        )}
                    </strong>
                </div>

            </div>

        </div>


        <div class="modal-section">

            <h3>Application Documents</h3>

            ${
                requiredDocuments.length
                    ? requiredDocuments.map(required => {

                        const uploaded =
                            uploadedDocuments.find(
                                doc =>
                                    String(
                                        doc.requiredName ||
                                        doc.name
                                    ).toLowerCase() ===
                                    String(required).toLowerCase()
                            );

                        return renderModalDocument(
                            application.id,
                            required,
                            uploaded
                        );

                    }).join("")
                    : uploadedDocuments.length
                        ? uploadedDocuments.map(doc =>
                            renderModalDocument(
                                application.id,
                                doc.name,
                                doc
                            )
                        ).join("")
                        : `
                            <div class="empty-state">
                                No documents attached to this application.
                            </div>
                        `
            }

        </div>


        <div class="modal-section">

            <h3>Application Timeline</h3>

            <div class="detail-grid">

                <div class="detail-box">
                    <span>Documents Verified</span>
                    <strong>
                        ${
                            application.documentsVerified
                                ? "Yes"
                                : "No"
                        }
                    </strong>
                </div>

                <div class="detail-box">
                    <span>Inspection</span>
                    <strong>
                        ${
                            application.inspectionStatus ||
                            "Not Scheduled"
                        }
                    </strong>
                </div>

                <div class="detail-box">
                    <span>Inspection Date</span>
                    <strong>
                        ${
                            application.inspectionDate
                                ? formatDate(
                                    application.inspectionDate
                                )
                                : "Not Scheduled"
                        }
                    </strong>
                </div>

                <div class="detail-box">
                    <span>Inspection Time</span>
                    <strong>
                        ${
                            application.inspectionTime ||
                            "-"
                        }
                    </strong>
                </div>

                <div class="detail-box">
                    <span>SLA</span>
                    <strong>
                        ${sla.state}
                    </strong>
                </div>

            </div>

        </div>


        <div class="modal-actions">

            ${
                !application.documentsVerified
                    ? `
                        <button
                            class="primary-btn"
                            onclick="completeDocumentVerification('${escapeHTML(application.id)}')"
                        >
                            Complete Document Verification
                        </button>
                    `
                    : ""
            }


            ${
                application.documentsVerified &&
                application.status !== "Approved" &&
                application.status !== "Rejected" &&
                application.inspectionStatus !== "Completed"
                    ? `
                        <button
                            class="primary-btn"
                            onclick="openInspectionModal('${escapeHTML(application.id)}')"
                        >
                            ${
                                application.inspectionDate
                                    ? "Update Inspection"
                                    : "Schedule Inspection"
                            }
                        </button>
                    `
                    : ""
            }


            ${
                application.inspectionStatus === "Completed" &&
                application.status !== "Approved" &&
                application.status !== "Rejected"
                    ? `
                        <button
                            class="success-btn"
                            onclick="approveApplication('${escapeHTML(application.id)}')"
                        >
                            Approve
                        </button>

                        <button
                            class="danger-btn"
                            onclick="rejectApplication('${escapeHTML(application.id)}')"
                        >
                            Reject
                        </button>

                        <button
                            class="secondary-btn"
                            onclick="requestChanges('${escapeHTML(application.id)}')"
                        >
                            Request Changes
                        </button>
                    `
                    : ""
            }

        </div>
    `;


    openModal("applicationModal");
}


/* =========================================================
   17. DOCUMENT RENDER
========================================================= */

function renderModalDocument(
    applicationId,
    requiredName,
    uploaded
) {

    if (!uploaded) {

        return `
            <div class="modal-document">

                <div>
                    <strong>
                        ${escapeHTML(requiredName)}
                    </strong>

                    <small>
                        Missing document
                    </small>
                </div>

                <span class="status red">
                    Missing
                </span>

            </div>
        `;
    }


    const status =
        uploaded.status ||
        "Pending";


    let statusClass = "orange";

    if (status === "Verified") {
        statusClass = "green";
    }

    if (status === "Rejected") {
        statusClass = "red";
    }


    return `
        <div class="modal-document">

            <div>

                <strong>
                    ${escapeHTML(
                        uploaded.name ||
                        requiredName
                    )}
                </strong>

                <small>
                    ${
                        uploaded.rejectionReason
                            ? escapeHTML(
                                uploaded.rejectionReason
                            )
                            : escapeHTML(
                                uploaded.type ||
                                "Document"
                            )
                    }
                </small>

            </div>

            <div class="document-actions">

                <span class="status ${statusClass}">
                    ${escapeHTML(status)}
                </span>

                ${
                    uploaded.dataUrl ||
                    uploaded.url
                        ? `
                            <button
                                class="small-btn"
                                onclick="viewDocument('${escapeHTML(applicationId)}','${escapeHTML(uploaded.id || uploaded.name)}')"
                            >
                                View
                            </button>
                        `
                        : ""
                }

                ${
                    status !== "Verified"
                        ? `
                            <button
                                class="success-btn"
                                onclick="verifyDocument('${escapeHTML(applicationId)}','${escapeHTML(uploaded.id || uploaded.name)}')"
                            >
                                Verify
                            </button>
                        `
                        : ""
                }

                ${
                    status !== "Rejected"
                        ? `
                            <button
                                class="danger-btn"
                                onclick="rejectDocument('${escapeHTML(applicationId)}','${escapeHTML(uploaded.id || uploaded.name)}')"
                            >
                                Reject
                            </button>
                        `
                        : ""
                }

            </div>

        </div>
    `;
}


/* =========================================================
   18. FIND APPLICATION DOCUMENT
========================================================= */

function findApplicationDocument(application, documentId) {

    const documents =
        Array.isArray(application.documents)
            ? application.documents
            : [];

    return documents.find(doc =>
        String(doc.id || doc.name) ===
        String(documentId)
    );
}


/* =========================================================
   19. VERIFY DOCUMENT
========================================================= */

function verifyDocument(
    applicationId,
    documentId
) {

    const applications =
        getApplications();

    const application =
        applications.find(
            app =>
                String(app.id) ===
                String(applicationId)
        );

    if (!application) return;


    if (!Array.isArray(application.documents)) {
        application.documents = [];
    }


    const document =
        findApplicationDocument(
            application,
            documentId
        );


    if (!document) {

        showToast(
            "Document data is not attached to this application."
        );

        return;
    }


    document.status = "Verified";
    document.verifiedAt = new Date().toISOString();
    document.verifiedBy =
        getSession()?.identity ||
        "Government Officer";


    updateApplicationStatusAfterDocuments(
        application
    );


    saveApplications(applications);

    showToast("Document verified successfully.");

    openApplication(applicationId);
    refreshEverything();
}


/* =========================================================
   20. REJECT DOCUMENT
========================================================= */

function rejectDocument(
    applicationId,
    documentId
) {

    const reason =
        prompt(
            "Enter the reason for rejecting this document:"
        );


    if (!reason || !reason.trim()) {

        showToast(
            "Rejection reason is required."
        );

        return;
    }


    const applications =
        getApplications();

    const application =
        applications.find(
            app =>
                String(app.id) ===
                String(applicationId)
        );

    if (!application) return;


    if (!Array.isArray(application.documents)) {
        application.documents = [];
    }


    const document =
        findApplicationDocument(
            application,
            documentId
        );


    if (!document) {

        showToast(
            "Document not found."
        );

        return;
    }


    document.status = "Rejected";

    document.rejectionReason =
        reason.trim();

    document.rejectedAt =
        new Date().toISOString();

    document.rejectedBy =
        getSession()?.identity ||
        "Government Officer";


    application.documentsVerified = false;

    application.status =
        "Changes Requested";


    application.lastUpdatedAt =
        new Date().toISOString();


    application.lastUpdatedBy =
        getSession()?.identity ||
        "Government Officer";


    saveApplications(applications);


    createGovernmentActionNotification(
        application,
        "Document Rejected",
        `Document rejected for ${application.approvalType || application.approval || "application"}. Reason: ${reason.trim()}`
    );


    showToast(
        "Document rejected. Business has been notified."
    );


    openApplication(applicationId);

    refreshEverything();
}


/* =========================================================
   21. UPDATE APPLICATION DOCUMENT STATUS
========================================================= */

function updateApplicationStatusAfterDocuments(
    application
) {

    const required =
        Array.isArray(application.requiredDocuments)
            ? application.requiredDocuments
            : [];


    const documents =
        Array.isArray(application.documents)
            ? application.documents
            : [];


    if (!required.length) {

        const allVerified =
            documents.length > 0 &&
            documents.every(
                doc => doc.status === "Verified"
            );

        application.documentsVerified =
            allVerified;

        if (allVerified) {

            application.status =
                "Inspection Pending";
        }

        return;
    }


    const allVerified =
        required.every(requiredName => {

            const matching =
                documents.find(doc =>
                    String(
                        doc.requiredName ||
                        doc.name
                    ).toLowerCase() ===
                    String(requiredName).toLowerCase()
                );

            return (
                matching &&
                matching.status === "Verified"
            );
        });


    application.documentsVerified =
        allVerified;


    if (allVerified) {

        application.status =
            "Inspection Pending";

        application.documentsVerifiedAt =
            new Date().toISOString();

        createGovernmentActionNotification(
            application,
            "Documents Verified",
            `All required documents for ${application.approvalType || application.approval || "application"} have been verified.`
        );
    }
}


/* =========================================================
   22. COMPLETE DOCUMENT VERIFICATION
========================================================= */

function completeDocumentVerification(
    applicationId
) {

    const applications =
        getApplications();

    const application =
        applications.find(
            app =>
                String(app.id) ===
                String(applicationId)
        );

    if (!application) return;


    const required =
        Array.isArray(application.requiredDocuments)
            ? application.requiredDocuments
            : [];


    const documents =
        Array.isArray(application.documents)
            ? application.documents
            : [];


    const missing =
        required.filter(requiredName => {

            const matching =
                documents.find(doc =>
                    String(
                        doc.requiredName ||
                        doc.name
                    ).toLowerCase() ===
                    String(requiredName).toLowerCase()
                );

            return !matching;

        });


    const unverified =
        required.filter(requiredName => {

            const matching =
                documents.find(doc =>
                    String(
                        doc.requiredName ||
                        doc.name
                    ).toLowerCase() ===
                    String(requiredName).toLowerCase()
                );

            return (
                matching &&
                matching.status !== "Verified"
            );
        });


    if (missing.length) {

        showToast(
            `Cannot complete verification. ${missing.length} required document(s) are missing.`
        );

        return;
    }


    if (unverified.length) {

        showToast(
            `Cannot complete verification. ${unverified.length} document(s) are not verified.`
        );

        return;
    }


    application.documentsVerified = true;

    application.documentsVerifiedAt =
        new Date().toISOString();

    application.status =
        "Inspection Pending";

    application.lastUpdatedAt =
        new Date().toISOString();

    application.lastUpdatedBy =
        getSession()?.identity ||
        "Government Officer";


    saveApplications(applications);


    createGovernmentActionNotification(
        application,
        "Document Verification Completed",
        `Document verification completed for ${application.approvalType || application.approval || "application"}.`
    );


    showToast(
        "Document verification completed."
    );


    openApplication(applicationId);

    refreshEverything();
}


/* =========================================================
   23. VIEW DOCUMENT
========================================================= */

function viewDocument(
    applicationId,
    documentId
) {

    const applications =
        getApplications();

    const application =
        applications.find(
            app =>
                String(app.id) ===
                String(applicationId)
        );

    if (!application) return;


    const document =
        findApplicationDocument(
            application,
            documentId
        );


    if (!document) {

        showToast("Document not found.");

        return;
    }


    const dataUrl =
        document.dataUrl ||
        document.url;


    document.getElementById;


    document.querySelector("#documentModalTitle")
        .textContent =
        document.name || "Document";


    const body =
        document.querySelector("#documentModalBody");


    if (!dataUrl) {

        body.innerHTML = `
            <div class="document-preview">

                <div class="file-message">
                    <strong>
                        File preview unavailable
                    </strong>

                    <p>
                        The uploaded file does not contain
                        preview data.
                    </p>
                </div>

            </div>
        `;

        openModal("documentModal");

        return;
    }


    if (
        document.type &&
        document.type.startsWith("image/")
    ) {

        body.innerHTML = `
            <div class="document-preview">
                <img
                    src="${dataUrl}"
                    alt="${escapeHTML(document.name || "Document")}"
                >
            </div>
        `;

    } else if (
        document.type === "application/pdf" ||
        String(dataUrl).startsWith("data:application/pdf")
    ) {

        body.innerHTML = `
            <div class="document-preview">

                <iframe
                    src="${dataUrl}"
                    title="Document Preview"
                ></iframe>

            </div>
        `;

    } else {

        body.innerHTML = `
            <div class="document-preview">

                <div class="file-message">

                    <strong>
                        ${escapeHTML(
                            document.name ||
                            "Uploaded document"
                        )}
                    </strong>

                    <p>
                        File type:
                        ${escapeHTML(
                            document.type ||
                            "Unknown"
                        )}
                    </p>

                    <a
                        href="${dataUrl}"
                        target="_blank"
                        rel="noopener"
                        class="primary-btn"
                        style="display:inline-block;margin-top:15px;text-decoration:none;"
                    >
                        Open Document
                    </a>

                </div>

            </div>
        `;
    }


    openModal("documentModal");
}


/* =========================================================
   24. INSPECTIONS
========================================================= */

function renderInspections() {

    const container =
        document.getElementById("inspectionsList");

    const applications =
        getApplications().filter(app =>
            app.documentsVerified ||
            app.inspectionDate ||
            app.inspectionStatus
        );


    if (!applications.length) {

        container.innerHTML = `
            <div class="empty-state">
                <strong>No inspections</strong>
                Verified applications will appear here.
            </div>
        `;

        return;
    }


    container.innerHTML =
        applications.map(app => {

            const inspectionStatus =
                app.inspectionStatus ||
                "Not Scheduled";


            return `
                <div class="inspection-card">

                    <div class="inspection-top">

                        <div>

                            <h3>
                                ${escapeHTML(
                                    app.approvalType ||
                                    app.approval ||
                                    "Application"
                                )}
                            </h3>

                            <p>
                                Business:
                                ${escapeHTML(
                                    app.businessName ||
                                    "Business"
                                )}
                            </p>

                        </div>

                        <span class="status ${
                            inspectionStatus === "Completed"
                                ? "green"
                                : app.inspectionDate
                                    ? "purple"
                                    : "orange"
                        }">
                            ${escapeHTML(
                                inspectionStatus
                            )}
                        </span>

                    </div>


                    <div class="inspection-info">

                        <div>
                            <span>Date</span>

                            <strong>
                                ${
                                    app.inspectionDate
                                        ? formatDate(
                                            app.inspectionDate
                                        )
                                        : "Not Scheduled"
                                }
                            </strong>
                        </div>


                        <div>
                            <span>Time</span>

                            <strong>
                                ${
                                    app.inspectionTime ||
                                    "-"
                                }
                            </strong>
                        </div>


                        <div>
                            <span>Business Location</span>

                            <strong>
                                ${escapeHTML(
                                    app.businessLocation ||
                                    app.location ||
                                    "-"
                                )}
                            </strong>
                        </div>

                    </div>


                    ${
                        app.inspectionNotes
                            ? `
                                <div class="response-box">
                                    <strong>
                                        Officer Notes
                                    </strong>
                                    <p>
                                        ${escapeHTML(
                                            app.inspectionNotes
                                        )}
                                    </p>
                                </div>
                            `
                            : ""
                    }


                    <div class="application-actions" style="margin-top:15px;">

                        ${
                            app.documentsVerified &&
                            inspectionStatus !== "Completed"
                                ? `
                                    <button
                                        class="primary-btn"
                                        onclick="openInspectionModal('${escapeHTML(app.id)}')"
                                    >
                                        ${
                                            app.inspectionDate
                                                ? "Update Schedule"
                                                : "Schedule Inspection"
                                        }
                                    </button>
                                `
                                : ""
                        }


                        ${
                            app.inspectionDate &&
                            inspectionStatus !== "Completed"
                                ? `
                                    <button
                                        class="success-btn"
                                        onclick="completeInspection('${escapeHTML(app.id)}')"
                                    >
                                        Complete Inspection
                                    </button>
                                `
                                : ""
                        }


                        <button
                            class="small-btn"
                            onclick="openApplication('${escapeHTML(app.id)}')"
                        >
                            View Application
                        </button>

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================================
   25. OPEN INSPECTION MODAL
========================================================= */

function openInspectionModal(applicationId) {

    const application =
        getApplications().find(
            app =>
                String(app.id) ===
                String(applicationId)
        );


    if (!application) return;


    if (!application.documentsVerified) {

        showToast(
            "Document verification must be completed first."
        );

        return;
    }


    document.getElementById(
        "inspectionApplicationId"
    ).value = application.id;


    document.getElementById(
        "inspectionDate"
    ).value =
        application.inspectionDate || "";


    document.getElementById(
        "inspectionTime"
    ).value =
        application.inspectionTime || "";


    document.getElementById(
        "inspectionNotes"
    ).value =
        application.inspectionNotes || "";


    const dateInput =
        document.getElementById(
            "inspectionDate"
        );


    dateInput.min =
        new Date().toISOString().split("T")[0];


    openModal("inspectionModal");
}


/* =========================================================
   26. SAVE INSPECTION
========================================================= */

function saveInspection(event) {

    event.preventDefault();


    const applicationId =
        document.getElementById(
            "inspectionApplicationId"
        ).value;


    const date =
        document.getElementById(
            "inspectionDate"
        ).value;


    const time =
        document.getElementById(
            "inspectionTime"
        ).value;


    const notes =
        document.getElementById(
            "inspectionNotes"
        ).value.trim();


    if (!date || !time) {

        showToast(
            "Inspection date and time are required."
        );

        return;
    }


    const selected =
        new Date(`${date}T${time}`);


    if (selected <= new Date()) {

        showToast(
            "Please select a future inspection date and time."
        );

        return;
    }


    const applications =
        getApplications();


    const application =
        applications.find(
            app =>
                String(app.id) ===
                String(applicationId)
        );


    if (!application) return;


    if (!application.documentsVerified) {

        showToast(
            "Documents must be verified before scheduling inspection."
        );

        return;
    }


    application.inspectionDate =
        date;

    application.inspectionTime =
        time;

    application.inspectionDateTime =
        selected.toISOString();

    application.inspectionNotes =
        notes;

    application.inspectionStatus =
        "Scheduled";

    application.status =
        "Inspection Scheduled";

    application.inspectionScheduledAt =
        new Date().toISOString();

    application.inspectionScheduledBy =
        getSession()?.identity ||
        "Government Officer";

    application.lastUpdatedAt =
        new Date().toISOString();


    saveApplications(applications);


    createGovernmentActionNotification(
        application,
        "Inspection Scheduled",
        `Inspection scheduled for ${formatDate(date)} at ${time}.`
    );


    closeModal("inspectionModal");

    showToast(
        "Inspection scheduled. Business portal updated."
    );


    refreshEverything();
}


/* =========================================================
   27. COMPLETE INSPECTION
========================================================= */

function completeInspection(applicationId) {

    if (
        !confirm(
            "Mark this inspection as completed?"
        )
    ) {
        return;
    }


    const applications =
        getApplications();


    const application =
        applications.find(
            app =>
                String(app.id) ===
                String(applicationId)
        );


    if (!application) return;


    if (!application.inspectionDate) {

        showToast(
            "Inspection is not scheduled."
        );

        return;
    }


    application.inspectionStatus =
        "Completed";

    application.inspectionCompletedAt =
        new Date().toISOString();

    application.inspectionCompletedBy =
        getSession()?.identity ||
        "Government Officer";

    application.status =
        "Final Review";

    application.lastUpdatedAt =
        new Date().toISOString();


    saveApplications(applications);


    createGovernmentActionNotification(
        application,
        "Inspection Completed",
        "Inspection has been completed. Application is now ready for final review."
    );


    showToast(
        "Inspection completed. Application moved to Final Review."
    );


    refreshEverything();
}


/* =========================================================
   28. APPROVE
========================================================= */

function approveApplication(applicationId) {

    const applications =
        getApplications();


    const application =
        applications.find(
            app =>
                String(app.id) ===
                String(applicationId)
        );


    if (!application) return;


    if (
        application.inspectionStatus !==
        "Completed"
    ) {

        showToast(
            "Inspection must be completed before approval."
        );

        return;
    }


    if (!confirm("Approve this application?")) {
        return;
    }


    application.status =
        "Approved";

    application.approvedAt =
        new Date().toISOString();

    application.approvedBy =
        getSession()?.identity ||
        "Government Officer";

    application.lastUpdatedAt =
        new Date().toISOString();


    saveApplications(applications);


    createGovernmentActionNotification(
        application,
        "Application Approved",
        `${application.approvalType || application.approval || "Application"} has been approved.`
    );


    closeModal("applicationModal");


    showToast(
        "Application approved. Business portal updated."
    );


    refreshEverything();
}


/* =========================================================
   29. REJECT
========================================================= */

function rejectApplication(applicationId) {

    const reason =
        prompt(
            "Enter the reason for rejecting this application:"
        );


    if (!reason || !reason.trim()) {

        showToast(
            "Rejection reason is required."
        );

        return;
    }


    const applications =
        getApplications();


    const application =
        applications.find(
            app =>
                String(app.id) ===
                String(applicationId)
        );


    if (!application) return;


    if (
        application.inspectionStatus !==
        "Completed"
    ) {

        showToast(
            "Inspection must be completed before final rejection."
        );

        return;
    }


    application.status =
        "Rejected";

    application.rejectionReason =
        reason.trim();

    application.rejectedAt =
        new Date().toISOString();

    application.rejectedBy =
        getSession()?.identity ||
        "Government Officer";

    application.lastUpdatedAt =
        new Date().toISOString();


    saveApplications(applications);


    createGovernmentActionNotification(
        application,
        "Application Rejected",
        `Application rejected. Reason: ${reason.trim()}`
    );


    closeModal("applicationModal");


    showToast(
        "Application rejected. Business portal updated."
    );


    refreshEverything();
}


/* =========================================================
   30. REQUEST CHANGES
========================================================= */

function requestChanges(applicationId) {

    const reason =
        prompt(
            "Enter the changes required from the business:"
        );


    if (!reason || !reason.trim()) {

        showToast(
            "Please enter the required changes."
        );

        return;
    }


    const applications =
        getApplications();


    const application =
        applications.find(
            app =>
                String(app.id) ===
                String(applicationId)
        );


    if (!application) return;


    application.status =
        "Changes Requested";

    application.changesRequested =
        reason.trim();

    application.lastUpdatedAt =
        new Date().toISOString();

    application.lastUpdatedBy =
        getSession()?.identity ||
        "Government Officer";


    saveApplications(applications);


    createGovernmentActionNotification(
        application,
        "Changes Requested",
        reason.trim()
    );


    closeModal("applicationModal");


    showToast(
        "Changes requested. Business portal updated."
    );


    refreshEverything();
}


/* =========================================================
   31. SLA
========================================================= */

function renderSLA() {

    const container =
        document.getElementById("slaList");

    const applications =
        getApplications();


    let onTrack = 0;
    let dueSoon = 0;
    let delayed = 0;


    applications.forEach(app => {

        const state =
            getSLAState(app).state;

        if (state === "On Track") {
            onTrack++;
        }

        if (state === "Due Soon") {
            dueSoon++;
        }

        if (state === "Delayed") {
            delayed++;
        }

    });


    document.getElementById(
        "slaOnTrack"
    ).textContent = onTrack;


    document.getElementById(
        "slaDueSoon"
    ).textContent = dueSoon;


    document.getElementById(
        "slaDelayed"
    ).textContent = delayed;


    if (!applications.length) {

        container.innerHTML = `
            <div class="empty-state">
                <strong>No SLA records</strong>
            </div>
        `;

        return;
    }


    container.innerHTML =
        applications
            .sort(
                (a, b) =>
                    new Date(
                        getDeadlineDate(a) || 0
                    ) -
                    new Date(
                        getDeadlineDate(b) || 0
                    )
            )
            .map(app => {

                const sla =
                    getSLAState(app);

                const deadline =
                    getDeadlineDate(app);


                return `
                    <div class="sla-row">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    app.businessName ||
                                    "Business"
                                )}
                            </strong>

                            <p>
                                ${escapeHTML(
                                    app.approvalType ||
                                    app.approval ||
                                    "Application"
                                )}
                            </p>

                            <p>
                                Deadline:
                                ${
                                    deadline
                                        ? formatDate(deadline)
                                        : "Not available"
                                }
                            </p>

                        </div>

                        <div>

                            <span class="status ${sla.className}">
                                ${sla.state}
                            </span>

                            ${
                                sla.days !== null
                                    ? `
                                        <p>
                                            ${
                                                sla.days < 0
                                                    ? Math.abs(sla.days) + " day(s) overdue"
                                                    : sla.days + " day(s) remaining"
                                            }
                                        </p>
                                    `
                                    : ""
                            }

                        </div>

                    </div>
                `;

            }).join("");
}


/* =========================================================
   32. GRIEVANCES
========================================================= */

function renderGrievances() {

    const container =
        document.getElementById("grievancesList");

    const grievances =
        getGrievances();


    if (!grievances.length) {

        container.innerHTML = `
            <div class="empty-state">
                <strong>No grievances</strong>
                Business grievances will appear here.
            </div>
        `;

        return;
    }


    const sorted =
        [...grievances].sort(
            (a, b) =>
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
        );


    container.innerHTML =
        sorted.map(grievance => {

            const status =
                grievance.status ||
                "Submitted";


            let statusClass =
                "orange";

            if (status === "Resolved") {
                statusClass = "green";
            }

            if (status === "Rejected") {
                statusClass = "red";
            }

            if (status === "Under Review") {
                statusClass = "purple";
            }


            return `
                <div class="grievance-card">

                    <div class="grievance-head">

                        <div>

                            <h3>
                                ${escapeHTML(
                                    grievance.subject ||
                                    "Business Grievance"
                                )}
                            </h3>

                        </div>

                        <span class="status ${statusClass}">
                            ${escapeHTML(status)}
                        </span>

                    </div>


                    <p>
                        ${escapeHTML(
                            grievance.description ||
                            grievance.message ||
                            "No description"
                        )}
                    </p>


                    <div class="grievance-meta">

                        <span>
                            Business:
                            ${escapeHTML(
                                grievance.businessName ||
                                grievance.ownerName ||
                                "Business"
                            )}
                        </span>

                        <span>
                            Account:
                            ${escapeHTML(
                                grievance.ownerIdentity ||
                                ""
                            )}
                        </span>

                        <span>
                            Submitted:
                            ${formatDateTime(
                                grievance.createdAt ||
                                grievance.submittedAt
                            )}
                        </span>

                        ${
                            grievance.applicationId
                                ? `
                                    <span>
                                        Application:
                                        ${escapeHTML(
                                            grievance.applicationId
                                        )}
                                    </span>
                                `
                                : ""
                        }

                    </div>


                    ${
                        grievance.response
                            ? `
                                <div class="response-box">

                                    <strong>
                                        Officer Response
                                    </strong>

                                    <p>
                                        ${escapeHTML(
                                            grievance.response
                                        )}
                                    </p>

                                    ${
                                        grievance.respondedAt
                                            ? `
                                                <small>
                                                    ${formatDateTime(
                                                        grievance.respondedAt
                                                    )}
                                                </small>
                                            `
                                            : ""
                                    }

                                </div>
                            `
                            : ""
                    }


                    <div class="application-actions" style="margin-top:15px;">

                        ${
                            status !== "Resolved" &&
                            status !== "Rejected"
                                ? `
                                    <button
                                        class="primary-btn"
                                        onclick="openGrievance('${escapeHTML(grievance.id)}')"
                                    >
                                        Update
                                    </button>
                                `
                                : ""
                        }

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================================
   33. OPEN GRIEVANCE
========================================================= */

function openGrievance(grievanceId) {

    const grievance =
        getGrievances().find(
            item =>
                String(item.id) ===
                String(grievanceId)
        );


    if (!grievance) {

        showToast(
            "Grievance not found."
        );

        return;
    }


    document.getElementById(
        "grievanceId"
    ).value =
        grievance.id;


    document.getElementById(
        "grievanceStatus"
    ).value =
        grievance.status === "Submitted"
            ? "Under Review"
            : grievance.status ||
              "Under Review";


    document.getElementById(
        "grievanceResponse"
    ).value =
        grievance.response || "";


    openModal("grievanceModal");
}


/* =========================================================
   34. SAVE GRIEVANCE
========================================================= */

function saveGrievance(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "grievanceId"
        ).value;


    const status =
        document.getElementById(
            "grievanceStatus"
        ).value;


    const response =
        document.getElementById(
            "grievanceResponse"
        ).value.trim();


    if (!response) {

        showToast(
            "Officer response is required."
        );

        return;
    }


    const grievances =
        getGrievances();


    const grievance =
        grievances.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!grievance) return;


    grievance.status =
        status;

    grievance.response =
        response;

    grievance.respondedAt =
        new Date().toISOString();

    grievance.respondedBy =
        getSession()?.identity ||
        "Government Officer";


    saveGrievances(grievances);


    createGrievanceNotification(
        grievance,
        status,
        response
    );


    closeModal("grievanceModal");


    showToast(
        "Grievance updated. Business portal notified."
    );


    refreshEverything();
}


/* =========================================================
   35. REPORTS
========================================================= */

function renderReports() {

    const applications =
        getApplications();


    const total =
        applications.length;


    const approved =
        applications.filter(
            app => app.status === "Approved"
        ).length;


    const rejected =
        applications.filter(
            app => app.status === "Rejected"
        ).length;


    const pending =
        total -
        approved -
        rejected;


    document.getElementById(
        "reportTotal"
    ).textContent = total;


    document.getElementById(
        "reportApproved"
    ).textContent = approved;


    document.getElementById(
        "reportRejected"
    ).textContent = rejected;


    document.getElementById(
        "reportPending"
    ).textContent = pending;


    const statusCounts = {};


    applications.forEach(app => {

        const status =
            app.status ||
            "Application Received";

        statusCounts[status] =
            (statusCounts[status] || 0) + 1;

    });


    const container =
        document.getElementById(
            "reportStatusList"
        );


    if (!Object.keys(statusCounts).length) {

        container.innerHTML = `
            <div class="empty-state">
                No application data available.
            </div>
        `;

        return;
    }


    container.innerHTML =
        Object.entries(statusCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([status, count]) => {

                return `
                    <div class="report-status">

                        <span class="status ${getStatusClass(status)}">
                            ${escapeHTML(status)}
                        </span>

                        <strong>
                            ${count}
                        </strong>

                    </div>
                `;

            }).join("");
}


/* =========================================================
   36. GOVERNMENT NOTIFICATIONS
========================================================= */

function getGovernmentNotifications() {

    try {

        const raw =
            localStorage.getItem(
                GOVERNMENT_NOTIFICATION_KEY
            );

        if (!raw) return [];

        const data =
            JSON.parse(raw);

        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        return [];
    }
}


function saveGovernmentNotifications(
    notifications
) {

    localStorage.setItem(
        GOVERNMENT_NOTIFICATION_KEY,
        JSON.stringify(notifications)
    );
}


function createGovernmentActionNotification(
    application,
    title,
    message
) {

    const notifications =
        getGovernmentNotifications();


    notifications.unshift({

        id:
            "gov-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8),

        title,

        message,

        applicationId:
            application.id,

        createdAt:
            new Date().toISOString(),

        read: false

    });


    saveGovernmentNotifications(
        notifications.slice(0, 100)
    );
}


function createGrievanceNotification(
    grievance,
    status,
    response
) {

    const notifications =
        getGovernmentNotifications();


    notifications.unshift({

        id:
            "gov-grievance-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8),

        title:
            "Grievance Updated",

        message:
            `Grievance "${grievance.subject || "Grievance"}" is now ${status}.`,

        grievanceId:
            grievance.id,

        createdAt:
            new Date().toISOString(),

        read: false

    });


    saveGovernmentNotifications(
        notifications.slice(0, 100)
    );
}


function getReadNotificationIds() {

    try {

        const raw =
            localStorage.getItem(
                READ_NOTIFICATION_KEY
            );

        if (!raw) return [];

        const ids =
            JSON.parse(raw);

        return Array.isArray(ids)
            ? ids
            : [];

    } catch (error) {

        return [];
    }
}


function saveReadNotificationIds(ids) {

    localStorage.setItem(
        READ_NOTIFICATION_KEY,
        JSON.stringify(ids)
    );
}


function refreshGovernmentNotifications() {

    const notifications =
        getGovernmentNotifications();


    const readIds =
        getReadNotificationIds();


    const unread =
        notifications.filter(
            notification =>
                !readIds.includes(
                    notification.id
                )
        );


    const badge =
        document.getElementById(
            "notificationBadge"
        );


    if (unread.length) {

        badge.textContent =
            unread.length;

        badge.style.display =
            "grid";

    } else {

        badge.style.display =
            "none";
    }


    const list =
        document.getElementById(
            "notificationList"
        );


    if (!notifications.length) {

        list.innerHTML = `
            <div class="empty-state">
                No notifications.
            </div>
        `;

        return;
    }


    list.innerHTML =
        notifications
            .slice(0, 20)
            .map(notification => {

                const isRead =
                    readIds.includes(
                        notification.id
                    );


                return `
                    <div
                        class="notification-item"
                        style="${
                            isRead
                                ? ""
                                : "background:#eff6ff;"
                        }"
                        onclick="readGovernmentNotification('${escapeHTML(notification.id)}')"
                    >

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

                        <small>
                            ${formatDateTime(
                                notification.createdAt
                            )}
                        </small>

                    </div>
                `;

            }).join("");
}


function toggleNotifications() {

    const panel =
        document.getElementById(
            "notificationPanel"
        );

    panel.classList.toggle("show");
}


function readGovernmentNotification(
    id
) {

    const ids =
        getReadNotificationIds();


    if (!ids.includes(id)) {

        ids.push(id);

        saveReadNotificationIds(ids);
    }


    refreshGovernmentNotifications();
}


function markAllNotificationsRead() {

    const notifications =
        getGovernmentNotifications();


    const ids =
        notifications.map(
            notification =>
                notification.id
        );


    saveReadNotificationIds(ids);

    refreshGovernmentNotifications();
}


/* =========================================================
   37. MODALS
========================================================= */

function openModal(id) {

    const modal =
        document.getElementById(id);

    if (modal) {
        modal.classList.add("show");
    }
}


function closeModal(id) {

    const modal =
        document.getElementById(id);

    if (modal) {
        modal.classList.remove("show");
    }
}


document.addEventListener("click", event => {

    if (
        event.target.classList.contains(
            "modal-overlay"
        )
    ) {

        event.target.classList.remove(
            "show"
        );
    }

});


/* =========================================================
   38. NAVIGATION
========================================================= */

const sectionInfo = {

    dashboard: {
        title: "Government Dashboard",
        subtitle:
            "Manage business approvals, verification and inspections"
    },

    applications: {
        title: "Applications",
        subtitle:
            "Review applications submitted by businesses"
    },

    documents: {
        title: "Document Verification",
        subtitle:
            "Verify business documents"
    },

    inspections: {
        title: "Inspections",
        subtitle:
            "Schedule and complete inspections"
    },

    sla: {
        title: "SLA & Delays",
        subtitle:
            "Monitor approval deadlines and delays"
    },

    grievances: {
        title: "Grievances",
        subtitle:
            "Review business grievances"
    },

    reports: {
        title: "Reports",
        subtitle:
            "Approval and compliance analytics"
    }

};


function showSection(
    sectionId,
    button
) {

    document
        .querySelectorAll(".page-section")
        .forEach(section => {

            section.classList.remove(
                "active"
            );

        });


    const target =
        document.getElementById(sectionId);


    if (target) {
        target.classList.add("active");
    }


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.remove(
                "active"
            );

        });


    if (button) {
        button.classList.add("active");
    }


    const info =
        sectionInfo[sectionId];


    if (info) {

        document.getElementById(
            "pageTitle"
        ).textContent =
            info.title;

        document.getElementById(
            "pageSubtitle"
        ).textContent =
            info.subtitle;
    }


    document
        .getElementById("sidebar")
        .classList.remove("open");


    refreshEverything();
}


function showSectionById(sectionId) {

    const button =
        document.querySelector(
            `.nav-item[onclick*="'${sectionId}'"]`
        );

    showSection(
        sectionId,
        button
    );
}


/* =========================================================
   39. MOBILE SIDEBAR
========================================================= */

function toggleSidebar() {

    document
        .getElementById("sidebar")
        .classList.toggle("open");
}


/* =========================================================
   40. LOGOUT
========================================================= */

function logout() {

    if (
        !confirm(
            "Are you sure you want to logout?"
        )
    ) {
        return;
    }


    sessionStorage.removeItem(
        "industrialAssistSession"
    );


    window.location.href =
        "../login.html";
}


/* =========================================================
   41. TOAST
========================================================= */

function showToast(message) {

    const container =
        document.getElementById(
            "toastContainer"
        );


    const toast =
        document.createElement("div");


    toast.className =
        "toast";


    toast.textContent =
        message;


    container.appendChild(toast);


    setTimeout(() => {

        toast.remove();

    }, 3500);
}


/* =========================================================
   42. CROSS-TAB / CROSS-PORTAL SYNC
========================================================= */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key === APPLICATION_KEY ||
            event.key === GRIEVANCE_KEY ||
            event.key === GOVERNMENT_NOTIFICATION_KEY
        ) {

            refreshEverything();
        }

    }
);


document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            refreshEverything();
        }

    }
);