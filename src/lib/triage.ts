export type Severity = "GREEN" | "YELLOW" | "ORANGE" | "RED";

export interface Assessment {
  severity: Severity;
  risk: string;
  priorityLabel: string;
  summary: string;
  firstAid: string[];
  actions: string[];
  callAmbulance: boolean;
  connectDoctor: boolean;
  recommendedSpeciality: string;
  source: "rules" | "openai";
}

export const DISCLAIMER =
  "This guidance does not replace professional medical care. If in doubt, call emergency services (999 / 112 in Kenya) immediately.";

interface Rule {
  keywords: string[];
  severity: Severity;
  risk: string;
  speciality: string;
  firstAid: string[];
}

const RULES: Rule[] = [
  {
    keywords: ["chest pain", "heart attack", "pressure in chest", "pain in left arm", "tight chest", "crushing"],
    severity: "RED",
    risk: "Possible Heart Attack (Acute Coronary Syndrome)",
    speciality: "Cardiologist",
    firstAid: [
      "Stay seated or half-sitting. Remain calm.",
      "Avoid walking or any physical effort.",
      "Loosen tight clothing and keep warm.",
      "If not allergic and available, chew one adult aspirin (300mg).",
      "Emergency team has been alerted — do not drive yourself.",
    ],
  },
  {
    keywords: ["stroke", "face drooping", "slurred speech", "one side", "numb arm", "cannot speak", "sudden confusion"],
    severity: "RED",
    risk: "Possible Stroke (FAST positive)",
    speciality: "Neurologist",
    firstAid: [
      "Note the exact time symptoms started — tell the medics.",
      "Lie the person on their side with head slightly raised.",
      "Do not give food, drink or medication.",
      "Keep talking to them and keep them calm.",
    ],
  },
  {
    keywords: ["unconscious", "not breathing", "no pulse", "collapsed", "fainted and not waking", "unresponsive"],
    severity: "RED",
    risk: "Unconscious Patient / Possible Cardiac Arrest",
    speciality: "Emergency Physician",
    firstAid: [
      "Check for breathing. If not breathing, start CPR: 30 chest compressions then 2 breaths.",
      "Push hard and fast in the centre of the chest (100–120 per minute).",
      "If breathing, place in the recovery position.",
      "Do not leave the patient alone.",
    ],
  },
  {
    keywords: ["difficulty breathing", "can't breathe", "cannot breathe", "shortness of breath", "choking", "gasping"],
    severity: "RED",
    risk: "Acute Respiratory Distress",
    speciality: "Emergency Physician",
    firstAid: [
      "Sit upright, lean slightly forward.",
      "Loosen tight clothing. Open windows for fresh air.",
      "If choking: give 5 back blows then 5 abdominal thrusts.",
      "Use prescribed inhaler if the patient has one.",
    ],
  },
  {
    keywords: ["severe asthma", "asthma attack", "wheezing badly", "inhaler not working"],
    severity: "ORANGE",
    risk: "Severe Asthma Attack",
    speciality: "Pulmonologist",
    firstAid: [
      "Sit upright and try to take slow, steady breaths.",
      "Take 1 puff of reliever inhaler every 30–60 seconds (up to 10 puffs).",
      "Stay calm — panic worsens breathing.",
      "If no improvement in 10 minutes, repeat inhaler doses while waiting.",
    ],
  },
  {
    keywords: ["fracture", "broken bone", "bone sticking", "cannot move leg", "cannot move arm", "deformed"],
    severity: "ORANGE",
    risk: "Suspected Fracture",
    speciality: "Orthopedic Surgeon",
    firstAid: [
      "Do not move the injured limb or try to straighten it.",
      "Immobilise with a splint or padding on both sides.",
      "Apply a cold pack wrapped in cloth to reduce swelling.",
      "If bone is exposed, cover with a clean dressing; do not push it back.",
    ],
  },
  {
    keywords: ["severe bleeding", "bleeding heavily", "won't stop bleeding", "blood everywhere", "stab", "gunshot"],
    severity: "ORANGE",
    risk: "Severe Haemorrhage",
    speciality: "Trauma Surgeon",
    firstAid: [
      "Apply firm, direct pressure using a clean cloth.",
      "Raise the injured limb above heart level if possible.",
      "Do not remove soaked cloth — add more layers on top.",
      "Keep the patient warm and lying down.",
    ],
  },
  {
    keywords: ["burn", "burnt", "scald", "fire"],
    severity: "YELLOW",
    risk: "Burn Injury",
    speciality: "General Physician",
    firstAid: [
      "Run cool (not ice-cold) water over the burn for 20 minutes.",
      "Do not apply oil, butter, toothpaste or ice.",
      "Remove rings/jewellery near the burn before swelling.",
      "Cover loosely with cling film or a clean non-fluffy cloth.",
      "Wait for medical personnel.",
    ],
  },
  {
    keywords: ["seizure", "convulsion", "fitting", "epilep"],
    severity: "ORANGE",
    risk: "Seizure / Convulsion",
    speciality: "Neurologist",
    firstAid: [
      "Clear the area of hard or sharp objects.",
      "Cushion the head; do not restrain the person.",
      "Do not put anything in their mouth.",
      "Time the seizure. After it stops, roll them onto their side.",
    ],
  },
  {
    keywords: ["poison", "overdose", "swallowed", "pills", "pesticide"],
    severity: "ORANGE",
    risk: "Poisoning / Overdose",
    speciality: "Emergency Physician",
    firstAid: [
      "Do NOT induce vomiting.",
      "Identify the substance and keep the container for medics.",
      "If unconscious, place in recovery position.",
      "Monitor breathing continuously.",
    ],
  },
  {
    keywords: ["allerg", "anaphyla", "swollen lips", "swollen tongue", "hives and breathing"],
    severity: "RED",
    risk: "Possible Anaphylaxis",
    speciality: "Emergency Physician",
    firstAid: [
      "Use an adrenaline auto-injector (EpiPen) in the outer thigh if available.",
      "Lie flat with legs raised unless breathing is difficult (then sit up).",
      "Avoid standing or walking suddenly.",
      "Second dose after 5 minutes if no improvement.",
    ],
  },
  {
    keywords: ["deep cut", "laceration", "needs stitches", "cut deep"],
    severity: "YELLOW",
    risk: "Deep Laceration",
    speciality: "General Physician",
    firstAid: [
      "Apply pressure using a clean cloth to stop bleeding.",
      "Rinse with clean water once bleeding slows.",
      "Raise the injured limb.",
      "Cover with a sterile dressing; may need stitches within 6 hours.",
    ],
  },
  {
    keywords: ["high fever", "fever of 39", "fever of 40", "very hot", "temperature 39", "temperature 40"],
    severity: "YELLOW",
    risk: "High Fever (possible infection / malaria)",
    speciality: "General Physician",
    firstAid: [
      "Drink plenty of fluids to stay hydrated.",
      "Take paracetamol as directed on the pack.",
      "Sponge with lukewarm water; avoid cold baths.",
      "Seek a malaria test if in a malaria zone.",
    ],
  },
  {
    keywords: ["vomiting blood", "coughing blood", "black stool"],
    severity: "ORANGE",
    risk: "Internal Bleeding",
    speciality: "Gastroenterologist",
    firstAid: ["Do not eat or drink anything.", "Lie down and stay still.", "Keep a sample/photo for the doctor."],
  },
  {
    keywords: ["labour", "labor", "pregnan", "water broke", "contractions"],
    severity: "ORANGE",
    risk: "Obstetric Emergency",
    speciality: "Obstetrician",
    firstAid: [
      "Help the mother into a comfortable position.",
      "Time the contractions.",
      "Prepare clean towels; keep warm.",
      "Do not attempt to delay delivery if the baby is coming.",
    ],
  },
  {
    keywords: ["diarr", "vomit", "stomach pain", "abdominal pain", "food poison"],
    severity: "YELLOW",
    risk: "Gastroenteritis / Abdominal Pain",
    speciality: "General Physician",
    firstAid: [
      "Sip oral rehydration solution (ORS) frequently.",
      "Avoid solid food for a few hours.",
      "Watch for signs of dehydration (dry mouth, dizziness).",
    ],
  },
  {
    keywords: ["headache", "migraine"],
    severity: "GREEN",
    risk: "Headache / Migraine",
    speciality: "General Physician",
    firstAid: [
      "Rest in a quiet, dark room.",
      "Drink water — dehydration is a common cause.",
      "Take paracetamol if needed.",
      "Seek urgent care if it is the worst headache of your life or comes with stiff neck.",
    ],
  },
  {
    keywords: ["mild fever", "slight fever", "cold", "flu", "cough", "sore throat", "runny nose"],
    severity: "GREEN",
    risk: "Mild Viral Illness",
    speciality: "General Physician",
    firstAid: [
      "Rest and drink plenty of fluids.",
      "Paracetamol for fever or aches.",
      "Monitor temperature; escalate if above 39°C.",
    ],
  },
  {
    keywords: ["rash", "itch", "skin", "acne", "eczema"],
    severity: "GREEN",
    risk: "Skin Condition",
    speciality: "Dermatologist",
    firstAid: ["Avoid scratching.", "Apply a cool compress.", "Book a dermatologist consultation."],
  },
  {
    keywords: ["child", "baby", "infant", "toddler"],
    severity: "YELLOW",
    risk: "Paediatric Concern",
    speciality: "Pediatrician",
    firstAid: ["Keep the child calm and hydrated.", "Monitor breathing and temperature closely.", "A pediatrician will review the case."],
  },
];

const SEVERITY_RANK: Record<Severity, number> = { GREEN: 0, YELLOW: 1, ORANGE: 2, RED: 3 };

export const SEVERITY_META: Record<Severity, { label: string; color: string; bg: string; text: string }> = {
  GREEN: { label: "Minor", color: "#16a34a", bg: "bg-green-600", text: "text-green-400" },
  YELLOW: { label: "Moderate", color: "#ca8a04", bg: "bg-yellow-500", text: "text-yellow-400" },
  ORANGE: { label: "Serious", color: "#ea580c", bg: "bg-orange-600", text: "text-orange-400" },
  RED: { label: "Critical", color: "#dc2626", bg: "bg-red-600", text: "text-red-400" },
};

export function assessWithRules(symptoms: string): Assessment {
  const text = symptoms.toLowerCase();
  const matched = RULES.filter((r) => r.keywords.some((k) => text.includes(k)));

  // Escalate if multiple serious things combined (e.g. chest pain + breathing)
  let best: Rule | undefined;
  for (const r of matched) {
    if (!best || SEVERITY_RANK[r.severity] > SEVERITY_RANK[best.severity]) best = r;
  }

  if (!best) {
    return {
      severity: "GREEN",
      risk: "Unclassified – needs clinician review",
      priorityLabel: "GREEN",
      summary: "Your symptoms do not match a known emergency pattern. A doctor will review your description.",
      firstAid: ["Rest and monitor your symptoms.", "If symptoms worsen rapidly, request emergency help immediately."],
      actions: ["Chat with AI doctor", "Book a consultation"],
      callAmbulance: false,
      connectDoctor: true,
      recommendedSpeciality: "General Physician",
      source: "rules",
    };
  }

  let severity = best.severity;
  const seriousCount = matched.filter((m) => SEVERITY_RANK[m.severity] >= 2).length;
  if (seriousCount >= 2 && severity !== "RED") severity = "RED";

  const combinedRisk =
    matched.length > 1
      ? `${best.risk} (with ${matched
          .filter((m) => m !== best)
          .slice(0, 2)
          .map((m) => m.risk.split(" (")[0])
          .join(", ")})`
      : best.risk;

  const firstAid = [...best.firstAid];
  for (const m of matched) {
    if (m !== best && firstAid.length < 7) firstAid.push(m.firstAid[0]);
  }

  const actions: string[] = [];
  if (severity === "RED") actions.push("Call Ambulance Immediately", "Connect Doctor Now", "Notify Family");
  else if (severity === "ORANGE") actions.push("Dispatch Ambulance", "Connect Doctor Now");
  else if (severity === "YELLOW") actions.push("Connect Doctor", "Visit nearest hospital");
  else actions.push("Chat with AI doctor", "Book a consultation");

  const summaries: Record<Severity, string> = {
    RED: "CRITICAL. This is a life-threatening pattern. Emergency dispatch is recommended right now.",
    ORANGE: "SERIOUS. Urgent medical attention is needed within the hour.",
    YELLOW: "MODERATE. You should see a doctor today. Follow the first-aid steps while you wait.",
    GREEN: "MINOR. Self-care is likely sufficient. Monitor and escalate if things change.",
  };

  return {
    severity,
    risk: combinedRisk,
    priorityLabel: severity,
    summary: summaries[severity],
    firstAid,
    actions,
    callAmbulance: severity === "RED" || severity === "ORANGE",
    connectDoctor: true,
    recommendedSpeciality: best.speciality,
    source: "rules",
  };
}

/** Optional OpenAI upgrade. Falls back to rules on any failure. */
export async function assessSymptoms(symptoms: string): Promise<Assessment> {
  const base = assessWithRules(symptoms);
  const key = process.env.OPENAI_API_KEY;
  if (!key) return base;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an emergency triage AI for MediRescue in Kenya. Classify severity as GREEN (minor), YELLOW (moderate), ORANGE (serious), RED (critical). Return JSON: {severity, risk, summary, firstAid: string[], recommendedSpeciality}. Keep firstAid to 3-6 short imperative steps.",
          },
          { role: "user", content: symptoms },
        ],
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return base;
    const json = await res.json();
    const parsed = JSON.parse(json.choices?.[0]?.message?.content ?? "{}");
    const sev = String(parsed.severity || "").toUpperCase() as Severity;
    if (!SEVERITY_RANK.hasOwnProperty(sev)) return base;
    const severity: Severity = SEVERITY_RANK[sev] > SEVERITY_RANK[base.severity] ? sev : base.severity;
    return {
      ...base,
      severity,
      priorityLabel: severity,
      risk: parsed.risk || base.risk,
      summary: parsed.summary || base.summary,
      firstAid: Array.isArray(parsed.firstAid) && parsed.firstAid.length ? parsed.firstAid : base.firstAid,
      recommendedSpeciality: parsed.recommendedSpeciality || base.recommendedSpeciality,
      callAmbulance: severity === "RED" || severity === "ORANGE",
      source: "openai",
    };
  } catch {
    return base;
  }
}

/** Conversational AI doctor. Rule-based fallback, OpenAI if key is configured. */
export async function chatReply(
  history: { role: "user" | "assistant"; content: string }[],
  latest: string
): Promise<{ reply: string; assessment: Assessment }> {
  const assessment = assessWithRules(latest);
  const key = process.env.OPENAI_API_KEY;

  if (key) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.4,
          messages: [
            {
              role: "system",
              content: `You are MediRescue AI, a calm emergency medical assistant in Nakuru, Kenya. Ask short clarifying questions, give concise first-aid guidance, and always remind the patient that you do not replace professional care. If symptoms sound critical (RED), tell them to press the SOS button immediately. Current rule-based triage: ${assessment.severity} – ${assessment.risk}.`,
            },
            ...history.slice(-10),
            { role: "user", content: latest },
          ],
          signal: undefined,
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const json = await res.json();
        const reply = json.choices?.[0]?.message?.content;
        if (reply) return { reply, assessment: { ...assessment, source: "openai" } };
      }
    } catch {
      /* fall through to rules */
    }
  }

  const lower = latest.toLowerCase();
  const greeting = /^(hi|hello|hey|habari|jambo)\b/.test(lower);
  if (greeting && latest.length < 25) {
    return {
      reply:
        "Hello, I'm MediRescue AI. I'm here to help. Please describe what you're feeling right now — for example, where it hurts, when it started, and how severe it is (1–10). If this is life-threatening, press the red SOS button now.",
      assessment,
    };
  }

  const steps = assessment.firstAid.map((s, i) => `${i + 1}. ${s}`).join("\n");
  const urgency =
    assessment.severity === "RED"
      ? "⚠️ This sounds CRITICAL. Please press the SOS button now so an ambulance and doctor are dispatched to your location."
      : assessment.severity === "ORANGE"
      ? "This sounds SERIOUS. I recommend requesting an ambulance and connecting with a doctor right away."
      : assessment.severity === "YELLOW"
      ? "This is MODERATE. You should be seen by a doctor today — I can book a consultation or show you the nearest hospital."
      : "This appears MINOR. Self-care should help, but let me know if anything changes.";

  const followUp =
    assessment.severity === "GREEN" && assessment.risk.startsWith("Unclassified")
      ? "Could you tell me more? Where exactly is the problem, when did it start, and is there any pain, bleeding, or trouble breathing?"
      : "Is the patient conscious and breathing normally? Any known conditions or allergies I should pass to the medical team?";

  const reply = `Assessment: **${assessment.severity} – ${assessment.risk}**\n\n${urgency}\n\nWhile help is on the way:\n${steps}\n\n${followUp}\n\n_${DISCLAIMER}_`;
  return { reply, assessment };
}
