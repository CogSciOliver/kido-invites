const {
    ADMIN_SECRET,
    GITHUB_TOKEN,
    GITHUB_OWNER,
    GITHUB_REPO,
    GITHUB_BRANCH = "main",
    ALLOWED_ORIGIN = "*",
} = process.env;

export default async function handler(req, res) {
    setCors(res);

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    if (req.method !== "GET") {
        return res.status(405).json({
            ok: false,
            error: "Method not allowed",
        });
    }

    const adminSecret = req.headers["x-admin-secret"];

    if (!ADMIN_SECRET || adminSecret !== ADMIN_SECRET) {
        return res.status(401).json({
            ok: false,
            error: "Unauthorized",
        });
    }

    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
        return res.status(500).json({
            ok: false,
            error: "Missing GitHub environment variables",
        });
    }

    const owner = normalizeEmail(req.query.owner);

    if (!owner) {
        return res.status(400).json({
            ok: false,
            error: "Missing owner email",
        });
    }

    try {
        const eventDirs = await githubGet(
            `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/events?ref=${encodeURIComponent(GITHUB_BRANCH)}`
        );

        if (!Array.isArray(eventDirs)) {
            return res.status(200).json({
                ok: true,
                events: [],
            });
        }

        const jsonResults = await Promise.allSettled(
            eventDirs
                .filter((item) => item.type === "dir")
                .map((item) => loadEventJson(item.name))
        );

        const events = jsonResults
            .filter((result) => result.status === "fulfilled" && result.value)
            .map((result) => result.value)
            .filter((event) => normalizeEmail(event.ownerEmail) === owner)
            .sort(sortNewestFirst);

        return res.status(200).json({
            ok: true,
            events,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            ok: false,
            error: error.message || "Unable to load events",
        });
    }
}

async function loadEventJson(slug) {
    try {
        const file = await githubGet(
            `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/events/${encodeURIComponent(slug)}/event.json?ref=${encodeURIComponent(GITHUB_BRANCH)}`
        );

        if (!file?.content) return null;

        const json = JSON.parse(Buffer.from(file.content, "base64").toString("utf8"));

        return {
            slug,
            title: json?.event?.title || "Untitled Invite",
            date: json?.event?.date_display || "",
            status: json?.meta?.status || "draft",
            template: json?.meta?.template || "",
            ownerEmail: json?.meta?.owner_email || "",
            createdAt: json?.meta?.created_at || "",
            updatedAt: json?.meta?.updated_at || ""
        };
    } catch (error) {
        console.warn(`Skipping ${slug}:`, error.message);
        return null;
    }
}


async function githubGet(path) {
    const response = await fetch(`https://api.github.com${path}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            `GitHub read failed: ${response.status} ${JSON.stringify(data)}`
        );
    }

    return data;
}

function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
}

function sortNewestFirst(a, b) {
    const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime();

    return bDate - aDate;
}

function setCors(res) {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-secret");
}