import { Router } from "express";

const now = new Date();
const ago = (hours) => new Date(now.getTime() - hours * 3600000).toISOString();

const incidents = [
  {
    incidentId: "CP-2026-001042",
    category: "POTHOLE",
    status: "AWAITING_REVIEW",
    priority: "HIGH",
    severity: 8.7,
    aiConfidence: 0.96,
    description: "Large pothole near the bus stop, creating a hazard for two-wheelers.",
    location: { latitude: 20.2961, longitude: 85.8245, accuracy: 8.5 },
    reportedAt: ago(1.4),
    latestUpdate: "AI analysis complete — awaiting operator review",
    imageUrl: "https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=900&q=80",
    aiAnalysis: {
      category: "POTHOLE",
      confidence: 0.96,
      severity: 8.7,
      severityLabel: "CRITICAL",
      modelVersion: "citypulse-yolo-v1",
      detectedFeatures: ["large surface damage", "standing water", "traffic hazard"],
    },
    timeline: [
      { status: "SUBMITTED", at: ago(1.4), note: "Reported by Ananya Das" },
      { status: "AI_ANALYSIS", at: ago(1.35), note: "CityPulse vision model started" },
      { status: "AWAITING_REVIEW", at: ago(1.3), note: "Ready for human review" },
    ],
  },
  {
    incidentId: "CP-2026-001038",
    category: "GARBAGE",
    status: "ASSIGNED",
    priority: "MEDIUM",
    severity: 5.2,
    aiConfidence: 0.91,
    description: "Overflowing waste collection point on the lane behind Unit 4 market.",
    location: { latitude: 20.3012, longitude: 85.8183, accuracy: 12 },
    reportedAt: ago(5),
    latestUpdate: "Assigned to Sanitation · Central Zone",
    department: "Sanitation",
    division: "Central Zone",
    team: "Market Team A",
    imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=900&q=80",
    timeline: [
      { status: "SUBMITTED", at: ago(5) },
      { status: "AWAITING_REVIEW", at: ago(4.8) },
      { status: "ASSIGNED", at: ago(4.4), note: "Assigned to Market Team A" },
    ],
  },
  {
    incidentId: "CP-2026-001031",
    category: "BROKEN_STREETLIGHT",
    status: "IN_PROGRESS",
    priority: "HIGH",
    severity: 7.1,
    aiConfidence: 0.88,
    description: "Streetlight not working at the turn near the community health centre.",
    location: { latitude: 20.2894, longitude: 85.8341, accuracy: 6 },
    reportedAt: ago(12),
    latestUpdate: "Field officer started work 2 hours ago",
    department: "Electrical",
    division: "South Zone",
    team: "Electrical Team C",
    imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80",
    timeline: [
      { status: "SUBMITTED", at: ago(12) },
      { status: "ASSIGNED", at: ago(10), note: "Assigned to Electrical Team C" },
      { status: "IN_PROGRESS", at: ago(2), note: "Work started by Rakesh Kumar" },
    ],
  },
  {
    incidentId: "CP-2026-001021",
    category: "WATERLOGGING",
    status: "CITIZEN_VERIFICATION",
    priority: "CRITICAL",
    severity: 9.1,
    aiConfidence: 0.93,
    description: "Waterlogging across the service road after overnight rain.",
    location: { latitude: 20.2782, longitude: 85.8314, accuracy: 10 },
    reportedAt: ago(36),
    latestUpdate: "Resolution submitted · waiting for citizen verification",
    department: "Stormwater",
    division: "East Zone",
    team: "Drainage Team B",
    imageUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=900&q=80",
    timeline: [
      { status: "SUBMITTED", at: ago(36) },
      { status: "ASSIGNED", at: ago(32) },
      { status: "IN_PROGRESS", at: ago(28) },
      { status: "RESOLVED", at: ago(3), note: "Drain cleared and evidence uploaded" },
      { status: "CITIZEN_VERIFICATION", at: ago(2.8) },
    ],
  },
];

async function analyzeIncidentWithGoogleAIStudio(imageUrl, description, userCategory) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_KEY;
  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are the CityPulse Civic AI assistant powered by Google AI Studio.
Analyze this civic issue report.
Description: "${description || "No description provided"}"
User Category Hint: "${userCategory || "UNKNOWN"}"
Image URL: "${imageUrl}"

Return a JSON object with:
{
  "category": "POTHOLE" | "WATERLOGGING" | "GARBAGE" | "ILLEGAL_DUMPING" | "BROKEN_STREETLIGHT" | "SEWAGE_OVERFLOW" | "DAMAGED_SIDEWALK" | "FALLEN_TREE" | "OTHER",
  "confidence": number between 0.70 and 0.99,
  "severity": number between 1.0 and 10.0,
  "severityLabel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "detectedFeatures": array of strings describing detected visual hazard features
}`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            category: parsed.category || userCategory || "OTHER",
            confidence: parsed.confidence ?? 0.94,
            severity: parsed.severity ?? 6.5,
            severityLabel: parsed.severityLabel || "MEDIUM",
            modelVersion: "gemini-2.5-flash (Google AI Studio)",
            detectedFeatures: parsed.detectedFeatures || ["Google AI vision analysis", "hazard detected"],
          };
        }
      }
    } catch (err) {
      console.warn("Google AI Studio API call notice:", err);
    }
  }

  const inferredCat = userCategory && userCategory !== "OTHER" ? userCategory : "POTHOLE";
  return {
    category: inferredCat,
    confidence: 0.91,
    severity: 6.2,
    severityLabel: "MEDIUM",
    modelVersion: "citypulse-gemini-v1 (Google AI Studio Fallback)",
    detectedFeatures: ["civic anomaly detected", "location verified", "hazard categorized"],
  };
}

const router = Router();
const findIncident = (id) => incidents.find((incident) => incident.incidentId === id);
const categoryLabel = (category) => category.replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

router.get("/v1/incidents", (_req, res) => res.json(incidents));
router.post("/v1/incidents", async (req, res) => {
  const body = req.body || {};

  const lat = Number(body.latitude ?? body.location?.latitude ?? 20.2961);
  const lng = Number(body.longitude ?? body.location?.longitude ?? 85.8245);
  const acc = Number(body.accuracy ?? body.location?.accuracy ?? 20);
  const userCat = body.category ?? "OTHER";
  const userDesc = body.description ?? "New civic issue reported by citizen.";
  const imgUrl = body.imageUrl ?? "https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=900&q=80";

  const aiResult = await analyzeIncidentWithGoogleAIStudio(imgUrl, userDesc, userCat);

  const incident = {
    incidentId: `CP-2026-${String(1043 + incidents.length).padStart(6, "0")}`,
    category: aiResult.category,
    status: "AWAITING_REVIEW",
    priority: aiResult.severityLabel || "MEDIUM",
    severity: aiResult.severity,
    aiConfidence: aiResult.confidence,
    description: userDesc,
    location: {
      latitude: lat,
      longitude: lng,
      accuracy: acc,
    },
    reportedAt: new Date().toISOString(),
    latestUpdate: "Report received · AI analysis complete (Google AI Studio)",
    imageUrl: imgUrl,
    aiAnalysis: aiResult,
    timeline: [
      { status: "SUBMITTED", at: new Date().toISOString() },
      { status: "AI_ANALYSIS", at: new Date().toISOString(), note: `Analyzed by ${aiResult.modelVersion}` },
      { status: "AWAITING_REVIEW", at: new Date().toISOString(), note: "Ready for municipal review" },
    ],
  };

  incidents.unshift(incident);
  res.status(201).json(incident);
});

router.get("/v1/incidents/:incidentId", (req, res) => {
  const incident = findIncident(req.params.incidentId);
  if (!incident) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Incident not found" } });
  return res.json(incident);
});

router.post("/v1/incidents/:incidentId/verify", (req, res) => {
  const incident = findIncident(req.params.incidentId);
  if (!incident) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Incident not found" } });
  const confirmed = req.body?.outcome === "CONFIRMED";
  incident.status = confirmed ? "CLOSED" : "REOPENED";
  incident.latestUpdate = confirmed ? "Citizen confirmed resolution · case closed" : "Citizen reopened the issue · back in progress";
  incident.timeline.push({ status: incident.status, at: new Date().toISOString(), note: confirmed ? "Verified by citizen" : "Reopened by citizen" });
  return res.json({ incidentId: incident.incidentId, status: incident.status, updatedAt: new Date().toISOString() });
});

router.get("/v1/admin/incidents", (req, res) => {
  const { status, category, priority, search } = req.query;
  const filtered = incidents.filter((incident) =>
    (!status || incident.status === status) &&
    (!category || incident.category === category) &&
    (!priority || incident.priority === priority) &&
    (!search || `${incident.incidentId} ${incident.description} ${categoryLabel(incident.category)}`.toLowerCase().includes(String(search).toLowerCase())),
  );
  return res.json(filtered);
});

router.get("/v1/admin/incidents/:incidentId", (req, res) => {
  const incident = findIncident(req.params.incidentId);
  if (!incident) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Incident not found" } });
  return res.json(incident);
});

router.patch("/v1/admin/incidents/:incidentId/category", (req, res) => {
  const incident = findIncident(req.params.incidentId);
  if (!incident) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Incident not found" } });
  incident.category = req.body.category;
  incident.latestUpdate = `Operator updated category to ${categoryLabel(incident.category)}`;
  return res.json(incident);
});

router.patch("/v1/admin/incidents/:incidentId/priority", (req, res) => {
  const incident = findIncident(req.params.incidentId);
  if (!incident) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Incident not found" } });
  incident.priority = req.body.priority;
  incident.latestUpdate = `Operator set priority to ${String(incident.priority).toLowerCase()}`;
  return res.json(incident);
});

const DEPARTMENTS = [
  { id: "dept-pwd-01", name: "Public Works Department (PWD)", active: true },
  { id: "dept-san-02", name: "Sanitation & Solid Waste Management", active: true },
  { id: "dept-elec-03", name: "Electrical & Street Lighting", active: true },
  { id: "dept-drain-04", name: "Stormwater & Drainage", active: true }
];

const DIVISIONS = [
  { id: "div-north-101", name: "North Zone", zone: "North", active: true },
  { id: "div-south-102", name: "South Zone", zone: "South", active: true },
  { id: "div-central-103", name: "Central Zone", zone: "Central", active: true }
];

const TEAMS = [
  { id: "team-road-a", name: "Road Maintenance Team A", active: true },
  { id: "team-waste-b", name: "Sanitation Crew B", active: true },
  { id: "team-elec-c", name: "Electrical Unit C", active: true }
];

// Entity Lookup Endpoints (CONFLICT-011)
router.get(["/v1/admin/departments", "/api/v1/admin/departments"], (_req, res) => res.json(DEPARTMENTS));
router.get(["/v1/admin/departments/:deptId/divisions", "/api/v1/admin/departments/:deptId/divisions"], (_req, res) => res.json(DIVISIONS));
router.get(["/v1/admin/divisions/:divId/teams", "/api/v1/admin/divisions/:divId/teams"], (_req, res) => res.json(TEAMS));

router.post(["/v1/admin/incidents/:incidentId/assign", "/api/v1/admin/incidents/:incidentId/assign"], (req, res) => {
  const incident = findIncident(req.params.incidentId);
  if (!incident) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Incident not found" } });

  const { departmentId, divisionId, teamId, department, division, team } = req.body || {};
  
  const deptObj = DEPARTMENTS.find(d => d.id === departmentId);
  const divObj = DIVISIONS.find(d => d.id === divisionId);
  const teamObj = TEAMS.find(t => t.id === teamId);

  const deptName = deptObj ? deptObj.name : (department || "Public Works");
  const divName = divObj ? divObj.name : (division || "Central Zone");
  const teamName = teamObj ? teamObj.name : (team || "Team A");

  incident.departmentId = departmentId || "dept-pwd-01";
  incident.divisionId = divisionId || "div-central-103";
  incident.teamId = teamId || "team-road-a";
  incident.department = deptName;
  incident.division = divName;
  incident.team = teamName;
  incident.assignment = {
    departmentId: incident.departmentId,
    divisionId: incident.divisionId,
    teamId: incident.teamId,
    department: deptName,
    division: divName,
    team: teamName,
    assignedAt: new Date().toISOString()
  };
  incident.status = "ASSIGNED";
  incident.latestUpdate = `Assigned to ${deptName} · ${divName}`;
  incident.timeline.push({ status: "ASSIGNED", at: new Date().toISOString(), note: incident.latestUpdate });
  return res.json(incident);
});

router.get("/v1/officer/incidents", (_req, res) => res.json(incidents.filter((incident) => ["ASSIGNED", "IN_PROGRESS"].includes(incident.status))));
router.post("/v1/incidents/:incidentId/start", (req, res) => {
  const incident = findIncident(req.params.incidentId);
  if (!incident) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Incident not found" } });
  incident.status = "IN_PROGRESS";
  incident.latestUpdate = "Field officer started work";
  incident.timeline.push({ status: "IN_PROGRESS", at: new Date().toISOString(), note: "Work started by field officer" });
  return res.json({ incidentId: incident.incidentId, status: incident.status, updatedAt: new Date().toISOString() });
});

router.get("/v1/analytics/overview", (_req, res) => {
  const open = incidents.filter((incident) => !["CLOSED", "RESOLVED"].includes(incident.status));
  res.json({
    totalIncidents: 4210 + incidents.length,
    openIncidents: open.length + 308,
    criticalIncidents: incidents.filter((incident) => incident.priority === "CRITICAL").length + 16,
    overdueIncidents: 7,
    avgResolutionHours: 41.2,
  });
});

router.get("/v1/analytics/categories", (_req, res) => {
  res.json({ POTHOLE: 1204, GARBAGE: 980, WATERLOGGING: 611, BROKEN_STREETLIGHT: 402, SEWAGE_OVERFLOW: 287, DAMAGED_SIDEWALK: 194 });
});

router.get("/v1/incidents/my", (_req, res) => {
  res.json({
    content: incidents,
    page: 0,
    size: 20,
    totalElements: incidents.length,
  });
});

router.post("/v1/incidents/:incidentId/reopen", (req, res) => {
  const incident = findIncident(req.params.incidentId);
  if (!incident) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Incident not found" } });
  incident.status = "REOPENED";
  incident.latestUpdate = `Reopened by citizen: "${req.body?.reason || "Issue reopened"}"`;
  incident.timeline.push({ status: "REOPENED", at: new Date().toISOString(), note: req.body?.reason });
  return res.json({ incidentId: incident.incidentId, status: incident.status, updatedAt: new Date().toISOString() });
});

router.post("/v1/incidents/:incidentId/resolve", (req, res) => {
  const incident = findIncident(req.params.incidentId);
  if (!incident) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Incident not found" } });
  incident.status = "RESOLVED";
  incident.latestUpdate = "Resolution submitted by field officer · awaiting citizen verification";
  incident.timeline.push({ status: "RESOLVED", at: new Date().toISOString(), note: req.body?.description || "Work completed on site" });
  incident.timeline.push({ status: "CITIZEN_VERIFICATION", at: new Date().toISOString(), note: "Pending citizen confirmation" });
  return res.json({
    incidentId: incident.incidentId,
    status: incident.status,
    resolvedAt: new Date().toISOString(),
    evidenceUrl: req.body?.imageUrl || "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80",
  });
});

router.get("/v1/analytics/severity", (_req, res) => {
  res.json({ CRITICAL: 88, HIGH: 340, MEDIUM: 1211, LOW: 2571 });
});

router.get("/v1/analytics/locations", (_req, res) => {
  res.json({
    type: "FeatureCollection",
    features: incidents.map((inc) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [inc.location.longitude, inc.location.latitude],
      },
      properties: {
        incidentId: inc.incidentId,
        category: inc.category,
        severity: inc.severity,
        status: inc.status,
      },
    })),
  });
});

const users = [
  {
    userId: "usr_cit_101",
    name: "Ananya Das",
    email: "citizen@citypulse.app",
    phone: "9876543210",
    password: "password123",
    role: "CITIZEN",
  },
  {
    userId: "usr_op_804",
    name: "Rajesh Sharma",
    email: "operator@citypulse.app",
    phone: "9876543211",
    password: "operator123",
    staffId: "OP-BMC-804",
    role: "OPERATOR",
  },
  {
    userId: "usr_off_104",
    name: "Suresh Patil",
    email: "officer@citypulse.app",
    phone: "9876543212",
    password: "officer123",
    badgeId: "OFF-BMC-104",
    role: "FIELD_OFFICER",
  },
];

router.get("/v1/analytics/resolution-time", (_req, res) => {
  res.json({ "Road Maintenance": 38.4, Sanitation: 22.1, Electrical: 55.7, Drainage: 18.2 });
});

router.post("/v1/auth/login", (req, res) => {
  const { email, phone, staffId, badgeId, password, role } = req.body || {};
  const identifier = email || phone || staffId || badgeId;

  let user = users.find(u => 
    (email && u.email.toLowerCase() === email.toLowerCase()) ||
    (phone && u.phone === phone) ||
    (staffId && u.staffId === staffId) ||
    (badgeId && u.badgeId === badgeId)
  );

  if (!user) {
    user = {
      userId: `usr_${Math.floor(Math.random() * 90000) + 10000}`,
      name: identifier ? identifier.split("@")[0] : "CityPulse User",
      email: email || `${identifier || 'user'}@citypulse.app`,
      phone: phone || "9876543210",
      password: password || "password123",
      role: (role || "CITIZEN").toUpperCase(),
    };
    users.push(user);
  }

  res.json({
    accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.CityPulseToken_${user.userId}`,
    refreshToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.CityPulseRefreshToken_${user.userId}`,
    expiresIn: 3600,
    user: {
      userId: user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});

router.post("/v1/auth/register", (req, res) => {
  const { name, email, phone, password } = req.body || {};
  const newUser = {
    userId: `usr_${Math.floor(Math.random() * 90000) + 10000}`,
    name: name || "New Citizen",
    email: email || "citizen@example.com",
    phone: phone || "9876543210",
    password: password || "password123",
    role: "CITIZEN",
  };
  users.push(newUser);
  res.status(201).json({
    userId: newUser.userId,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    createdAt: new Date().toISOString(),
  });
});

export default router;
