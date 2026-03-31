import { useState, useEffect, useRef, useCallback } from "react";
import { getStats, registerUser, submitScore, getLeaderboard } from "./api";

const AccentureLogo = ({ dark = false }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img
      src="/Accenture-logo.png"
      alt="Accenture"
      style={{
        height: 24,
        width: 'auto',
        filter: dark ? 'brightness(0) invert(1)' : 'none',
      }}
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ICB LOGO
// ─────────────────────────────────────────────────────────────────────────────
const ICBLogo = ({ size = 40, showText = true }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="url(#icbg1)" />
      <defs>
        <linearGradient id="icbg1" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a1a2e"/><stop offset="100%" stopColor="#16213e"/>
        </linearGradient>
      </defs>
      <polygon points="32,10 44,17 44,31 32,38 20,31 20,17" fill="none" stroke="#f59e0b" strokeWidth="2.2"/>
      <polygon points="32,16 40,21 40,30 32,35 24,30 24,21" fill="none" stroke="#f59e0b" strokeOpacity="0.4" strokeWidth="1.2"/>
      <circle cx="32" cy="26" r="4" fill="#f59e0b"/>
      <line x1="32" y1="38" x2="32" y2="46" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
      <line x1="26" y1="41" x2="22" y2="48" stroke="#f59e0b" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="38" y1="41" x2="42" y2="48" stroke="#f59e0b" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round"/>
      <text x="32" y="57" textAnchor="middle" fill="#f59e0b" fontSize="7" fontWeight="800" fontFamily="Arial">ICB</text>
    </svg>
    {showText && (
      <div>
        <div style={{ fontSize: 13, fontWeight: 900, color: '#1a1a2e', lineHeight: 1, letterSpacing: -0.3 }}>Indira Carbon</div>
        <div style={{ fontSize: 9, color: '#92400e', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Black Ltd.</div>
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────
const RAJAN_CAUTION = `Rajan Mehta is unambiguously pro-AI and pro-digital — he sees technology as the defining lever that will take Indira from a good Indian carbon black company to a globally competitive one. He has mandated enterprise-scale AI within 36 months and has the board's backing to invest. Where he asks for discipline is in execution: plant continuity must be protected (experienced plant heads need to be won over, not overruled), workforce transition must be managed with genuine reskilling (Indira's operators are a strategic asset, not a liability), and customer grade quality is non-negotiable at every stage of the journey. Rajan's ambition is total. His approach to getting there is deliberate.`;

const FUNC_CURRENT_STATE = {
  'Sales':{ icon:'📈', title:'Sales & Commercial – Where Indira Stands Today', narrative:`Indira Carbon sells across three grade families: N-series tyre-grade blacks (N220, N330, N550, N660 — 68% of revenue), specialty functional grades (N990 thermal, conductive grades for EV battery electrodes — 22%), and pigment-grade blacks for inks and coatings (10%). Domestically, Indira holds ~18% market share by volume, competing with Philips Carbon and Birla Carbon.\n\nThe commercial team of 42 field executives operates from Chennai, Pune, Hyderabad, and Ahmedabad hubs. Pricing is largely cost-plus with quarterly reviews — leaving margin on the table when feedstock costs dip. Customer profitability analysis is done in Excel; KAM reviews happen annually. The Salesforce CRM has ~40% data entry compliance. Export revenue is just 9% of topline, limited to Sri Lanka and Bangladesh.` },
  'Mfg&Ops':{ icon:'🏭', title:'Manufacturing & Operations – Where Indira Stands Today', narrative:`Indira operates four furnace-black reactors: Krishnapatnam, AP (2 reactors, 95,000 MTPA) and Cuddalore, TN (2 reactors, 85,000 MTPA) — total 1,80,000 MTPA. Krishnapatnam has a 12 MW captive power plant on tail gas; Cuddalore is grid-supplied.\n\nOEE averages 71% — below the 80–85% benchmark. PMs are calendar-based, causing ₹18–22 Cr in avoidable downtime annually. Energy cost per tonne runs 12–15% above best-in-class. Quality control relies on end-of-batch lab sampling — no inline detection. MES coverage is partial (Wonderware at Krishnapatnam Plant 1 only); the rest run on paper logbooks and Excel. Plant heads are highly experienced and deeply sceptical of technology-first approaches that haven't been validated on the shop floor.` },
  'Procurement':{ icon:'📦', title:'Procurement – Where Indira Stands Today', narrative:`Clarified Slurry Oil (CSO) and Coal Tar Feedstock (CTFS) account for ~58% of COGS. Direct procurement (feedstock + utilities) is 74% of total spend; indirect (MRO, logistics, services) is 26%. Total addressable spend: ~₹1,750 Cr annually.\n\nThe 28-person procurement team operates reactively — spot purchases cover 31% of feedstock despite volatile pricing. No formal category management exists; savings are tracked informally. Contract compliance is ~55%, with high maverick MRO spend. SAP MM is used for POs; contracts are paper-based. Supplier on-time delivery averages 78% (target: 92%). e-Auctions are sporadic; no supplier risk dashboard exists.` },
  'SC':{ icon:'🚛', title:'Supply Chain & Logistics – Where Indira Stands Today', narrative:`Indira dispatches in 500 kg jumbo bags and 25 kg sacks to ~180 active customers, primarily by road (87%). Six depots (Chennai, Mumbai, Pune, Ahmedabad, Delhi, Kolkata) hold 18–22 days of FG inventory — well above the 12-day industry norm.\n\nDemand forecasting is monthly in Excel; MAPE is 31%. No formal S&OP exists — finance, sales, and production work off different numbers until month-end. Freight is managed through 7 transporters, negotiated annually, with no dynamic optimisation. Customer complaint rate on delivery: 4.2% (target: <1%).` },
  'Finance':{ icon:'💰', title:'Finance & Controlling – Where Indira Stands Today', narrative:`68 finance staff run on SAP ECC 6.0 (last upgraded 2017). The annual budget cycle takes 11 weeks and is typically obsolete within Q1 due to feedstock volatility. Monthly variance reporting takes 6 business days to close and is backward-looking.\n\nPlant-level profitability is visible only at cost-centre level — true per-grade, per-customer P&L does not exist. Working capital days: 74 (DSO: 48, DPO: 32, DIO: 54). Treasury manually forecasts 4 weeks out; no 13-week rolling forecast exists. No EPM or planning tool beyond SAP and Excel.` },
  'HR':{ icon:'👥', title:'HR & Talent – Where Indira Stands Today', narrative:`1,500 employees: ~820 plant operators/technicians, 340 engineers/specialists, 180 corporate staff, 160 contract workers. Plant engineer attrition is 14% — above industry average. Time-to-fill: 67 days. Darwinbox (HR system since 2022) is used mainly for payroll and attendance.\n\nL&D is ad hoc — no structured skills framework. Krishnapatnam had 3 LTIs in FY24; near-miss culture is weak. EHS compliance at Cuddalore is paper-based. Workforce planning is an annual finance exercise. Many of Indira's plant workers are second-generation employees — their loyalty is high, but so is their resistance to change that feels imposed from outside.` },
  'IT&Digital':{ icon:'💻', title:'IT & Digital Infrastructure – Where Indira Stands Today', narrative:`Fragmented landscape: SAP ECC 6.0, Darwinbox, partially implemented Salesforce, Wonderware MES (1 plant), and SCADA systems from 3 vendors with no unified historian. No enterprise data warehouse, no BI platform beyond Excel, no API integration layer.\n\nIT team of 22 (12 internal, 10 MSP) manages BAU. OT and IT networks are not segregated; endpoint protection is inconsistent; last pen test was 2021. Cloud adoption is minimal. IT spend: ~₹28 Cr (~0.9% of revenue) vs. 2–3% benchmark. No CDO or digital leadership role exists.` },
};

const FUNCTION_KPI_IMPACT = {
  'Mfg&Ops':{
    processLed:[{name:'OEE Improvement',value:'+2–4%',icon:'⚙️'},{name:'Unplanned Downtime',value:'−10–20%',icon:'🔧'},{name:'Energy Cost/Tonne',value:'−3–5%',icon:'⚡'},{name:'Product Yield',value:'+1–2%',icon:'📈'},{name:'Quality Complaints',value:'−10–20%',icon:'✅'}],
    hybrid:[{name:'OEE Improvement',value:'+4–6%',icon:'⚙️'},{name:'Unplanned Downtime',value:'−25–35%',icon:'🔧'},{name:'Energy Cost/Tonne',value:'−6–9%',icon:'⚡'},{name:'Product Yield',value:'+2–4%',icon:'📈'},{name:'Quality Complaints',value:'−30–40%',icon:'✅'}],
    aiLed:[{name:'OEE Improvement',value:'+6–10%',icon:'⚙️'},{name:'Unplanned Downtime',value:'−35–50%',icon:'🔧'},{name:'Energy Cost/Tonne',value:'−8–14%',icon:'⚡'},{name:'Product Yield',value:'+4–6%',icon:'📈'},{name:'Quality Complaints',value:'−40–55%',icon:'✅'}],
  },
  'Procurement':{
    processLed:[{name:'Procurement Savings',value:'1–3% of spend',icon:'💰'},{name:'Contract Compliance',value:'+10–15%',icon:'📋'},{name:'Supplier On-time',value:'+5–10%',icon:'🚚'},{name:'Touchless Invoices',value:'20–40%',icon:'🤖'},{name:'Maverick Spend',value:'−15–25%',icon:'📉'}],
    hybrid:[{name:'Procurement Savings',value:'3–5% of spend',icon:'💰'},{name:'Contract Compliance',value:'+20–30%',icon:'📋'},{name:'Supplier On-time',value:'+10–15%',icon:'🚚'},{name:'Touchless Invoices',value:'50–75%',icon:'🤖'},{name:'Maverick Spend',value:'−30–45%',icon:'📉'}],
    aiLed:[{name:'Procurement Savings',value:'4–7% of spend',icon:'💰'},{name:'Contract Compliance',value:'+30–45%',icon:'📋'},{name:'Supplier On-time',value:'+15–20%',icon:'🚚'},{name:'Touchless Invoices',value:'80–95%',icon:'🤖'},{name:'Maverick Spend',value:'−45–65%',icon:'📉'}],
  },
  'SC':{
    processLed:[{name:'Forecast Accuracy',value:'+5–10%',icon:'🎯'},{name:'Inventory Turns',value:'+0.5–1x',icon:'🔄'},{name:'Freight Cost/Tonne',value:'−2–5%',icon:'🚛'},{name:'Order Fill Rate',value:'+1–2%',icon:'📦'},{name:'Supply Disruptions',value:'−10–20%',icon:'⚠️'}],
    hybrid:[{name:'Forecast Accuracy',value:'+12–18%',icon:'🎯'},{name:'Inventory Turns',value:'+1–1.5x',icon:'🔄'},{name:'Freight Cost/Tonne',value:'−5–9%',icon:'🚛'},{name:'Order Fill Rate',value:'+2–4%',icon:'📦'},{name:'Supply Disruptions',value:'−25–35%',icon:'⚠️'}],
    aiLed:[{name:'Forecast Accuracy',value:'+20–30%',icon:'🎯'},{name:'Inventory Turns',value:'+1.5–2.5x',icon:'🔄'},{name:'Freight Cost/Tonne',value:'−8–14%',icon:'🚛'},{name:'Order Fill Rate',value:'+4–6%',icon:'📦'},{name:'Supply Disruptions',value:'−35–50%',icon:'⚠️'}],
  },
  'Finance':{
    processLed:[{name:'Forecast Cycle Time',value:'−20–30%',icon:'⏱️'},{name:'Working Capital Days',value:'−2–5 days',icon:'💵'},{name:'Finance Productivity',value:'+10–15%',icon:'👥'},{name:'Cost Visibility',value:'Cost-centre level',icon:'🏭'},{name:'Cash Conversion',value:'−3–6 days',icon:'🔃'}],
    hybrid:[{name:'Forecast Cycle Time',value:'−40–55%',icon:'⏱️'},{name:'Working Capital Days',value:'−5–9 days',icon:'💵'},{name:'Finance Productivity',value:'+20–30%',icon:'👥'},{name:'Cost Visibility',value:'Plant-level P&L',icon:'🏭'},{name:'Cash Conversion',value:'−6–10 days',icon:'🔃'}],
    aiLed:[{name:'Forecast Cycle Time',value:'−60–75%',icon:'⏱️'},{name:'Working Capital Days',value:'−10–14 days',icon:'💵'},{name:'Finance Productivity',value:'+35–50%',icon:'👥'},{name:'Cost Visibility',value:'Grade-level real-time P&L',icon:'🏭'},{name:'Cash Conversion',value:'−10–16 days',icon:'🔃'}],
  },
  'Sales':{
    processLed:[{name:'Export Revenue',value:'+₹10–25 Cr',icon:'🌏'},{name:'Customer Retention',value:'+1–3%',icon:'🤝'},{name:'Pricing Realisation',value:'+0.5–1%',icon:'💹'},{name:'Sales Cycle Time',value:'−5–10%',icon:'⚡'},{name:'Cross-sell Revenue',value:'+₹5–15 Cr',icon:'📊'}],
    hybrid:[{name:'Export Revenue',value:'+₹25–70 Cr',icon:'🌏'},{name:'Customer Retention',value:'+3–6%',icon:'🤝'},{name:'Pricing Realisation',value:'+1–2%',icon:'💹'},{name:'Sales Cycle Time',value:'−15–25%',icon:'⚡'},{name:'Cross-sell Revenue',value:'+₹15–35 Cr',icon:'📊'}],
    aiLed:[{name:'Export Revenue',value:'+₹50–120 Cr',icon:'🌏'},{name:'Customer Retention',value:'+5–10%',icon:'🤝'},{name:'Pricing Realisation',value:'+2–3.5%',icon:'💹'},{name:'Sales Cycle Time',value:'−25–40%',icon:'⚡'},{name:'Cross-sell Revenue',value:'+₹30–65 Cr',icon:'📊'}],
  },
  'HR':{
    processLed:[{name:'Attrition Rate',value:'−1–2%',icon:'👤'},{name:'Time-to-Productivity',value:'−10–15%',icon:'⏳'},{name:'Safety Incidents',value:'−10–20%',icon:'🦺'},{name:'Workforce Accuracy',value:'+10–15%',icon:'📐'},{name:'Employee NPS',value:'+5–10 pts',icon:'😊'}],
    hybrid:[{name:'Attrition Rate',value:'−2–4%',icon:'👤'},{name:'Time-to-Productivity',value:'−20–30%',icon:'⏳'},{name:'Safety Incidents',value:'−20–35%',icon:'🦺'},{name:'Workforce Accuracy',value:'+20–25%',icon:'📐'},{name:'Employee NPS',value:'+10–18 pts',icon:'😊'}],
    aiLed:[{name:'Attrition Rate',value:'−4–6%',icon:'👤'},{name:'Time-to-Productivity',value:'−30–45%',icon:'⏳'},{name:'Safety Incidents',value:'−35–50%',icon:'🦺'},{name:'Workforce Accuracy',value:'+30–40%',icon:'📐'},{name:'Employee NPS',value:'+18–28 pts',icon:'😊'}],
  },
  'IT&Digital':{
    processLed:[{name:'System Downtime',value:'−20–35%',icon:'💻'},{name:'Data Availability',value:'97–98%',icon:'📡'},{name:'Incident Response',value:'−20–30%',icon:'🔒'},{name:'IT Cost/User',value:'−5–10%',icon:'💰'},{name:'AI Deploy Speed',value:'Baseline only',icon:'🚀'}],
    hybrid:[{name:'System Downtime',value:'−40–55%',icon:'💻'},{name:'Data Availability',value:'98.5–99%',icon:'📡'},{name:'Incident Response',value:'−45–55%',icon:'🔒'},{name:'IT Cost/User',value:'−10–18%',icon:'💰'},{name:'AI Deploy Speed',value:'1.5–2x faster',icon:'🚀'}],
    aiLed:[{name:'System Downtime',value:'−60–80%',icon:'💻'},{name:'Data Availability',value:'99.5%+',icon:'📡'},{name:'Incident Response',value:'−65–75%',icon:'🔒'},{name:'IT Cost/User',value:'−18–28%',icon:'💰'},{name:'AI Deploy Speed',value:'3–5x faster',icon:'🚀'}],
  },
};

const FUNCTION_COMMENTARY = {
  'Sales':["Sharp opener. The revenue engine is often the most under-digitised part of a carbon black business. Accenture's commercial reinvention practice sees pricing intelligence as the fastest lever for margin recovery — but consider that Indira's commercial team is relationship-driven and may resist algorithmic approaches.","Interesting choice. Customer intelligence can unlock significant retention and cross-sell value — but remember that Salesforce compliance is at 40%. The data foundation matters before the AI.","Bold. Commercial transformation anchors the entire value thesis — but Rajan has flagged that customer relationships are hard-won and easily damaged. The right approach balances ambition with execution reality."],
  'Mfg&Ops':["The core of the business — and Rajan's most sensitive area. Plant heads have decades of institutional knowledge and will scrutinise every initiative. Accenture sees 60–70% of industrial value on the shop floor, but the change management challenge here is significant.","Manufacturing is where data is richest and impact is most tangible — but also where workforce resistance is highest. Indira's operators are the backbone of the business; transformation here requires their buy-in, not just management mandates.","Exactly the right starting point — but proceed with eyes open. Any approach that risks production continuity or product quality will face immediate pushback from plant heads and, ultimately, from Rajan himself."],
  'Procurement':["Smart. In commodity-intensive businesses like carbon black, procurement transformation can deliver 3–6% of spend back to the P&L. Accenture's SynOps model treats procurement as a strategic lever — but Indira's supplier relationships for CTFS and CSO are critical and must be protected.","Procurement reinvention is often the fastest path to credible EBITDA impact. But with 28 people managing ₹1,750 Cr of spend, the team's bandwidth is a real constraint — pick approaches that are executable with current capacity.","This signals maturity. The category management gap is real and expensive. But beware of approaches that automate before the process foundation is solid — garbage in, garbage out."],
  'SC':["Supply chain resilience is the defining challenge. Accenture's practice sees demand sensing and risk intelligence at the top of the agenda — but Indira's 31% MAPE problem is partly a people and process issue, not just a technology gap.","Timely choice. With automotive volatility still biting, supply chain transformation can unlock cost and service simultaneously. But remember: Indira's 6-depot network and 7 carrier relationships were built over decades. Change here requires careful stakeholder management.","End-to-end thinking is right. But inventory, logistics and demand planning changes affect customers directly. Any approach that reduces service reliability — even temporarily — risks damaging Indira's most important asset: its delivery reputation."],
  'Finance':["Finance transformation is no longer just about closing faster. Accenture's CFO Reinvention agenda pushes finance teams to become real-time intelligence engines — but Indira's finance team of 68 is stretched on BAU and may resist tools that change their workflows significantly.","An underrated choice. When finance has real cost visibility at plant and grade level, every other transformation decision becomes sharper. But SAP ECC data quality must be fixed first — analytics on bad data is worse than no analytics.","Shrewd. The board flies blind on plant-level profitability. Fixing that unlocks every other conversation. But be realistic about the 11-week budget cycle culture — rolling forecasts represent a significant behavioural change for the team."],
  'HR':["People are the multiplier — and Indira's most underinvested area. Accenture's Talent & Organisation practice sees workforce transformation as the critical enabler. But remember: many of Indira's plant workers are second-generation employees. Approaches that feel surveillance-heavy or threaten job security will face real resistance.","Attrition and safety are silent P&L destroyers. But Rajan has been explicit: he will not rush change management at the risk of labour relations. Any approach here must come with genuine reskilling commitments and workforce communication.","Culture eats strategy for breakfast. In a company as relationship-driven as Indira, the HR and EHS agenda determines whether every other transformation lands — but the workforce trust must be earned before digital tools are imposed."],
  'IT&Digital':["The enabler of everything — but also the area where ambition most often outpaces execution. Accenture's Technology Reinvention practice treats the data foundation as the prerequisite for all AI. Without it, every AI initiative in the portfolio is building on sand.","A foundational bet. ERP modernisation isn't glamorous, but it's the difference between AI pilots and enterprise-scale AI. Be realistic: S/4HANA rollouts at manufacturing companies of Indira's complexity typically take 18–24 months.","Cybersecurity and data infrastructure are invisible until they fail — catastrophically. But Rajan has flagged that any IT programme that risks plant OT network stability is off the table. OT/IT integration must be approached with extreme care."],
};
const getFuncCommentary = (fids) => fids.map(fid => { const arr = FUNCTION_COMMENTARY[fid]; return arr ? arr[Math.floor(Math.random()*arr.length)] : null; }).filter(Boolean);

const APPROACH_COMMENTARY = {
  processLed:["A grounded call — and often underestimated. Process discipline is the bedrock of any transformation. This builds the muscle memory Indira needs before layering technology, and earns plant-head credibility for bolder moves ahead.","Classic and reliable. Accenture's research shows that process-first approaches in industrial settings deliver the most durable results — and set the foundation that makes future AI investments stick.","Bold in its pragmatism. The most common mistake in industrial transformation is layering AI on broken processes. You're fixing the foundation first.","A deliberate, sequenced bet. Process-led now, with a clear runway to Hybrid or AI-led once the data and capability base is in place."],
  hybrid:["The pragmatist's play — and often the highest risk-adjusted ROI approach for a company at Indira's maturity level. You're blending human judgement with digital leverage in exactly the right proportion.","Smart balance. Indira's workforce is experienced but not yet fully digitally native. Hybrid approaches raise the bar while keeping change management manageable.","This is where most high-performing industrials live. Building capability and technology in parallel compresses the payback window without overextending the organisation.","Shrewd bet. Accenture's SynOps data shows hybrid approaches in manufacturing deliver 2–3x the EBITDA per rupee invested vs. purely process-led — with significantly lower programme failure rates than pure AI-led."],
  aiLed:["Ambitious — and exactly what Rajan's digital mandate calls for. AI-led approaches carry higher upside and require strong data foundations and change management. Done right, this is the highest value path.","Frontier bet, top-quartile outcomes. Accenture's industrial AI practice consistently sees AI-led initiatives deliver 2–4x the EBITDA of process-led equivalents — with the right governance in place.","This is the kind of thinking that separates top-quartile performers. High conviction, high return — just ensure the rollout is phased and the workforce is brought along from Day 1.","Visionary. Rajan's mandate is enterprise-scale AI in 36 months — and this choice moves Indira meaningfully in that direction. Pair it with solid change management and a clear pilot-to-scale pathway."],
};
const getCommentary = (approach) => { const arr = APPROACH_COMMENTARY[approach]; return arr[Math.floor(Math.random()*arr.length)]; };

const INIT_NARRATIVE_TEMPLATES = {
  'HR_SF1_I1':{processLed:(e1,e2,e3,inv)=>`Structured 30-60-90 day onboarding journeys cut time-to-productivity for new plant engineers from 90 to ~55 days, delivering ₹${e1.toFixed(1)} Cr in Year 1. Cumulative 3-year EBITDA: ₹${(e1+e2+e3).toFixed(1)} Cr against ₹${inv.toFixed(1)} Cr investment.`,hybrid:(e1,e2,e3,inv)=>`Digital onboarding on Darwinbox slashed ramp time by 35%. Year 1 EBITDA: ₹${e1.toFixed(1)} Cr; cumulative 3-year: ₹${(e1+e2+e3).toFixed(1)} Cr against ₹${inv.toFixed(1)} Cr investment.`,aiLed:(e1,e2,e3,inv)=>`The AI onboarding agent personalised journeys across 4 plants, reducing early attrition by 40%. Year 1 EBITDA: ₹${e1.toFixed(1)} Cr; cumulative 3-year: ₹${(e1+e2+e3).toFixed(1)} Cr against ₹${inv.toFixed(1)} Cr.`},
  'HR_SF2_I1':{processLed:(e1,e2,e3,inv)=>`Annual headcount planning reduced overstaffing during slowdowns. ₹${e1.toFixed(1)} Cr in Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years against ₹${inv.toFixed(1)} Cr investment.`,hybrid:(e1,e2,e3,inv)=>`Attrition risk dashboard identified flight-risk engineers, avoiding repeat hiring costs. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr invested.`,aiLed:(e1,e2,e3,inv)=>`ML predicted attrition 6 months ahead; plant engineer attrition fell from 14% toward 9%. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr invested.`},
  'HR_SF3_I1':{processLed:(e1,e2,e3,inv)=>`Digital PTW eliminated near-miss incidents from manual handoffs. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr invested. ESG: contributed to Indira's first GRI-aligned safety disclosure.`,hybrid:(e1,e2,e3,inv)=>`Video AI caught PPE violations in real time — incident rate dropped materially. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr invested.`,aiLed:(e1,e2,e3,inv)=>`Predictive safety engine flagged high-risk shifts. LTI rate near-zero by Year 2. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr. ESG: zero-LTI trajectory strengthens OEM audit scores.`},
  'Finance_SF1_I1':{processLed:(e1,e2,e3,inv)=>`Rolling forecasts replaced the 11-week budget cycle. CFO re-forecasts in days. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr invested.`,hybrid:(e1,e2,e3,inv)=>`EPM platform gave finance a single version of truth. AI variance commentary cut reporting time by 60%. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr invested.`,aiLed:(e1,e2,e3,inv)=>`AI FP&A copilot ran hundreds of feedstock scenarios in real time, enabling a favourable CTFS hedge. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`},
  'Finance_SF2_I1':{processLed:(e1,e2,e3,inv)=>`DSO improved from 48 to ~39 days. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr invested.`,hybrid:(e1,e2,e3,inv)=>`Dynamic discounting captured early-payment discounts. 13-week cash forecast — a first for Indira. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr invested.`,aiLed:(e1,e2,e3,inv)=>`ML predicted payment delays weeks ahead. Auto collections improved DSO by ~14 days. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr.`},
  'Finance_SF3_I1':{processLed:(e1,e2,e3,inv)=>`Standard cost cards corrected. Monthly reviews caught energy drift at Cuddalore before it became structural. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`,hybrid:(e1,e2,e3,inv)=>`ABC modelling revealed N990 specialty grades generate disproportionate EBITDA. Commercial team repriced accordingly. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr.`,aiLed:(e1,e2,e3,inv)=>`Real-time shift-level P&L — AI caught a major energy anomaly at Krishnapatnam Plant 2 within 48 hours. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`},
  'IT&Digital_SF1_I1':{processLed:(e1,e2,e3,inv)=>`ERP lift-and-shift to IaaS cut data centre costs and improved uptime. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`,hybrid:(e1,e2,e3,inv)=>`S/4HANA unlocked real-time visibility across all 4 plants. TMS integration reduced freight disputes by 70%. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr.`,aiLed:(e1,e2,e3,inv)=>`Composable AI-ready architecture enabled multiple AI agents live in Year 2 at a fraction of greenfield cost. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`},
  'IT&Digital_SF2_I1':{processLed:(e1,e2,e3,inv)=>`Data warehouse + Power BI gave Indira its first enterprise KPI dashboard. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`,hybrid:(e1,e2,e3,inv)=>`Databricks lakehouse ingested MES, ERP and SCADA in one place — finance and ops finally agreed on the same OEE number. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr.`,aiLed:(e1,e2,e3,inv)=>`Data mesh + MLOps enabled AI models to deploy and retrain without IT bottlenecks. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`},
  'IT&Digital_SF3_I1':{processLed:(e1,e2,e3,inv)=>`Structured patching and phishing simulations reduced endpoint vulnerabilities significantly. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`,hybrid:(e1,e2,e3,inv)=>`OT/IT segmentation contained a ransomware attempt to a single VLAN — no production impact. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr.`,aiLed:(e1,e2,e3,inv)=>`Zero trust eliminated lateral movement risk. AI threat detection flagged OT anomalies before escalation. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`},
  'Sales_SF1_I1':{processLed:(e1,e2,e3,inv)=>`Feedstock index linkage clauses protected margin during a CTFS spike. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`,hybrid:(e1,e2,e3,inv)=>`Segment P&L analysis revealed mid-tier customers priced below cost. Value-based repricing added margin without losing accounts. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`,aiLed:(e1,e2,e3,inv)=>`AI pricing engine adjusted quotes in real time as CTFS moved — recovering margin lost under the quarterly review cycle. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`},
  'Sales_SF2_I1':{processLed:(e1,e2,e3,inv)=>`CRM hygiene and structured KAM reviews caught at-risk accounts early. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`,hybrid:(e1,e2,e3,inv)=>`Churn propensity dashboards flagged declining accounts — proactive outreach retained the majority. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr.`,aiLed:(e1,e2,e3,inv)=>`AI commercial copilot generated white-space analysis. GenAI proposals cut tender response from 5 days to 4 hours. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`},
  'Sales_SF3_I1':{processLed:(e1,e2,e3,inv)=>`Trade shows in Vietnam and UAE opened new distributor relationships, contributing export revenue by Year 2. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`,hybrid:(e1,e2,e3,inv)=>`Trade intelligence identified Indonesia as high-growth for N330 grades. First SE Asian framework agreement closed within 18 months. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr.`,aiLed:(e1,e2,e3,inv)=>`AI market-entry analysis shortlisted high-potential geographies in 2 weeks. Export BU generated strong qualified leads in Year 1. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`},
  'SC_SF1_I1':{processLed:(e1,e2,e3,inv)=>`Dedicated demand planner + monthly S&OP cut MAPE from 31% to ~22%. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`,hybrid:(e1,e2,e3,inv)=>`IBP gave sales and production a shared forecast for the first time. Collaborative OEM forecasting improved N220 availability. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr.`,aiLed:(e1,e2,e3,inv)=>`ML demand sensing ingested OEM production schedules — MAPE fell to ~14%, fill rates rose from 91% to 97%. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`},
  'SC_SF2_I1':{processLed:(e1,e2,e3,inv)=>`Manual route planning + GPS reduced empty miles. Delivery complaint rate fell from 4.2%. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`,hybrid:(e1,e2,e3,inv)=>`TMS algorithmic routing cut freight cost/tonne and recovered overbilling through freight audit. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr.`,aiLed:(e1,e2,e3,inv)=>`AI control tower dynamically rerouted hundreds of shipments, reducing ETA misses by 71%. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr. ESG: ~8% CO₂ reduction.`},
  'SC_SF3_I1':{processLed:(e1,e2,e3,inv)=>`ABC-XYZ reclassification right-sized safety stock, releasing working capital. Inventory accuracy 84%→96%. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`,hybrid:(e1,e2,e3,inv)=>`VMI with feedstock suppliers eliminated several stock-outs, avoiding spot-purchase premiums. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr.`,aiLed:(e1,e2,e3,inv)=>`Probabilistic AI inventory model reduced FG inventory ~21% while holding 97% service levels. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`},
  'Procurement_SF1_I1':{processLed:(e1,e2,e3,inv)=>`Should-cost models revealed Indira paying above market for CTFS/CSO. Renegotiated contracts delivered savings in Year 1. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`,hybrid:(e1,e2,e3,inv)=>`First competitive reverse auction for MRO — 23% savings vs. last price. AI supplier discovery reduced single-source risk. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr.`,aiLed:(e1,e2,e3,inv)=>`Autonomous sourcing agent ran multiple RFx without manual intervention. Negotiation simulation unlocked packaging savings. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`},
  'Procurement_SF2_I1':{processLed:(e1,e2,e3,inv)=>`Centralised contract repository prevented evergreen renewals at above-market rates. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`,hybrid:(e1,e2,e3,inv)=>`CLM platform flagged contracts missing price review clauses; renegotiation delivered 3-year savings. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr.`,aiLed:(e1,e2,e3,inv)=>`GenAI scanned all active contracts in 48 hours, flagging recoverable overcharges. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`},
  'Procurement_SF3_I1':{processLed:(e1,e2,e3,inv)=>`PO compliance controls reduced maverick spend and surfaced consolidation opportunities. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`,hybrid:(e1,e2,e3,inv)=>`3-way match automation achieved ~72% touchless invoice processing in Year 1. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr.`,aiLed:(e1,e2,e3,inv)=>`AI invoice agents hit ~95% touchless rate by Year 2. Duplicate payment detection recovered overbillings. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`},
  'Mfg&Ops_SF1_I1':{processLed:(e1,e2,e3,inv)=>`Lean kaizen across 4 plants delivered ~2% yield improvement — operators were the real change agents. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr. Built plant-head trust critical for future digital initiatives.`,hybrid:(e1,e2,e3,inv)=>`MES + SPC caught process deviations 40 min earlier than lab sampling. Customer quality complaints dropped sharply. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr.`,aiLed:(e1,e2,e3,inv)=>`Autonomous yield agent tuned 18 process parameters in real time — Indira's single largest EBITDA lever. ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr. ESG: lower feedstock per tonne, cutting Scope 3 intensity.`},
  'Mfg&Ops_SF2_I1':{processLed:(e1,e2,e3,inv)=>`RCM-based PM reduced unplanned downtime at Cuddalore. Plant heads embraced it — validated their knowledge. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`,hybrid:(e1,e2,e3,inv)=>`IoT condition monitoring predicted critical compressor failures before they occurred. MTTR cut by 31%. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr.`,aiLed:(e1,e2,e3,inv)=>`Cognitive maintenance AI predicted failures weeks ahead. GenAI RCA guided engineers through root-cause faster. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`},
  'Mfg&Ops_SF3_I1':{processLed:(e1,e2,e3,inv)=>`Shift-level energy targets drove a meaningful reduction in energy cost/tonne at Krishnapatnam. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`,hybrid:(e1,e2,e3,inv)=>`SCADA dashboards revealed compressor scheduling inefficiencies invisible to operators. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr. ESG: 7% Scope 1 GHG intensity reduction.`,aiLed:(e1,e2,e3,inv)=>`Autonomous energy system optimised furnace firing in real time — >10% energy cost reduction. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr. ESG: ~11,000 tonnes CO₂ avoided.`},
  'Mfg&Ops_SF4_I1':{processLed:(e1,e2,e3,inv)=>`Tighter SPC reduced grade-slip losses and rework. Plant heads strongly preferred this approach. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`,hybrid:(e1,e2,e3,inv)=>`Vision AI cut defect escape rate from 2.8% to ~0.9%. Specialty grade satisfaction improved materially. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr.`,aiLed:(e1,e2,e3,inv)=>`Feed-to-finish AI model predicted final grade quality from feedstock parameters — reclassification decisions hours earlier. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`},
  'Mfg&Ops_SF5_I1':{processLed:(e1,e2,e3,inv)=>`Daily shift huddles with OEE scorecards lifted OEE from 71% toward 76% in 12 months. Plant heads championed it. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr.`,hybrid:(e1,e2,e3,inv)=>`Constraint-based scheduling eliminated suboptimal changeovers, adding effective plant capacity annually. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr cumulative vs. ₹${inv.toFixed(1)} Cr.`,aiLed:(e1,e2,e3,inv)=>`RL scheduler cut changeover losses by 58%, improved throughput ~9%. EBITDA: ₹${e1.toFixed(1)} Cr Year 1, ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years vs. ₹${inv.toFixed(1)} Cr. ESG: higher throughput/MW = lower Scope 1 intensity.`},
};
const getInitNarrative = (id, approach, e1, e2, e3, inv) => {
  const tmpl = INIT_NARRATIVE_TEMPLATES[id]?.[approach];
  return tmpl ? tmpl(e1,e2,e3,inv) : `This initiative contributed ₹${(e1+e2+e3).toFixed(1)} Cr over 3 years (Year 1: ₹${e1.toFixed(1)} Cr) against ₹${inv.toFixed(1)} Cr total investment.`;
};

const getPersonalisedAlternatives = (inits, selections) => {
  const results = [];
  inits.forEach(i => {
    const chosen = selections[i.id]; if (!chosen) return;
    const d = i.approaches[chosen];
    const chosenE = (d.ebitdaYr1||0)+(d.ebitdaYr2||0)+(d.ebitdaYr3||0);
    if (chosen === 'processLed') {
      const h = i.approaches['hybrid']; const hE = (h.ebitdaYr1||0)+(h.ebitdaYr2||0)+(h.ebitdaYr3||0);
      const delta = (hE - chosenE).toFixed(1);
      if (delta > 0) results.push(`${i.name} (${i.func}): You chose Process-led (₹${chosenE.toFixed(1)} Cr). A Hybrid approach would have delivered ₹${delta} Cr more over 3 years — worth considering as a Phase 2 step once the process foundation is validated.`);
    } else if (chosen === 'aiLed') {
      const h = i.approaches['hybrid']; const hE = (h.ebitdaYr1||0)+(h.ebitdaYr2||0)+(h.ebitdaYr3||0);
      const riskDelta = (d.riskPenalty - h.riskPenalty).toFixed(2);
      results.push(`${i.name} (${i.func}): You chose AI-led (₹${chosenE.toFixed(1)} Cr) — bold. A Hybrid path would have delivered ₹${hE.toFixed(1)} Cr with ₹${riskDelta} Cr less risk penalty. Given Rajan's workforce readiness concerns, a staged Hybrid-then-AI path may be more sustainable.`);
    } else {
      const a = i.approaches['aiLed']; const aE = (a.ebitdaYr1||0)+(a.ebitdaYr2||0)+(a.ebitdaYr3||0);
      const delta = (aE - chosenE).toFixed(1);
      if (delta > 0) results.push(`${i.name} (${i.func}): Your Hybrid choice (₹${chosenE.toFixed(1)} Cr) was well-balanced. AI-led could have added ₹${delta} Cr more — but carried ₹${(a.riskPenalty - d.riskPenalty).toFixed(2)} Cr additional risk. Given Indira's data maturity, your call was arguably the right risk-adjusted one.`);
    }
  });
  return results.slice(0, 3);
};

const MASTER_DATA_RAW = {"functions":[{"id":"HR","name":"HR & Talent","subFunctions":[{"id":"HR_SF1","name":"Talent & Onboarding","initiatives":[{"id":"HR_SF1_I1","name":"AI-Enhanced Employee Onboarding","approaches":{"processLed":{"name":"Structured Onboarding + Buddy System","description":"30-60-90 day onboarding journeys by role and plant. Buddy allocation and manager check-ins.","risk":0.4,"riskPenalty":0.2,"year1":0.1,"year2":0.08,"year3":0.08,"ebitdaYr1":0.2,"ebitdaYr2":0.25,"ebitdaYr3":0.3,"payback":0.5},"hybrid":{"name":"Digital Onboarding Platform + E-learning","description":"HRMS-integrated digital onboarding with role-specific e-learning and completion analytics.","risk":0.3,"riskPenalty":0.15,"year1":0.75,"year2":0.2,"year3":0.2,"ebitdaYr1":0.4,"ebitdaYr2":0.45,"ebitdaYr3":0.5,"payback":1.88},"aiLed":{"name":"AI Onboarding Agent (Personalised + GenAI Q&A)","description":"AI agent personalises onboarding content by role and plant. GenAI chatbot answers HR policy queries 24x7.","risk":0.5,"riskPenalty":0.275,"year1":0.6,"year2":0.3,"year3":0.3,"ebitdaYr1":0.5,"ebitdaYr2":0.75,"ebitdaYr3":1.0,"payback":1.2}}}]},{"id":"HR_SF2","name":"Workforce Planning","initiatives":[{"id":"HR_SF2_I1","name":"Predictive Workforce & Attrition Analytics","approaches":{"processLed":{"name":"Headcount Planning + Annual Skills Assessment","description":"Annual workforce planning linked to budget. Structured skills gap assessment and development plans.","risk":0.4,"riskPenalty":0.2,"year1":0.4,"year2":0.15,"year3":0.15,"ebitdaYr1":0.3,"ebitdaYr2":2.0,"ebitdaYr3":3.0,"payback":1.33},"hybrid":{"name":"HRMS Analytics + Attrition Risk Dashboard","description":"HRMS-powered dashboards: attrition risk scores, tenure analysis, skill bench strength and succession coverage.","risk":0.7,"riskPenalty":0.35,"year1":1.2,"year2":1.0,"year3":1.0,"ebitdaYr1":0.8,"ebitdaYr2":1.5,"ebitdaYr3":2.5,"payback":1.5},"aiLed":{"name":"ML Attrition Prediction + NLP Skills Intelligence","description":"ML model predicting attrition risk 6 months ahead. NLP skills taxonomy from JDs and appraisals. Nudge engine for managers.","risk":0.7,"riskPenalty":0.35,"year1":1.5,"year2":0.75,"year3":0.75,"ebitdaYr1":0.6,"ebitdaYr2":2.0,"ebitdaYr3":4.0,"payback":2.5}}}]},{"id":"HR_SF3","name":"EHS & Safety","initiatives":[{"id":"HR_SF3_I1","name":"Digital Safety Management","approaches":{"processLed":{"name":"Digital Permit-to-Work + Mobile Incident Reporting","description":"Replace paper PTW with digital system. Mobile near-miss reporting app for all plant employees.","risk":0.6,"riskPenalty":0.6,"year1":2.0,"year2":1.0,"year3":0.5,"ebitdaYr1":0.5,"ebitdaYr2":1.2,"ebitdaYr3":1.8,"payback":4.0},"hybrid":{"name":"Video AI for Unsafe Behaviour + EHS Platform","description":"CCTV-based AI for real-time PPE violation detection. Integrated EHS platform for incident trends.","risk":0.7,"riskPenalty":0.7,"year1":2.0,"year2":2.0,"year3":1.0,"ebitdaYr1":0.8,"ebitdaYr2":1.8,"ebitdaYr3":3.0,"payback":2.5},"aiLed":{"name":"Integrated EHS AI + Predictive Safety Engine","description":"Full EHS platform with ML model predicting high-risk shifts and zones. Automated safety briefings.","risk":1.5,"riskPenalty":1.5,"year1":3.5,"year2":2.0,"year3":2.0,"ebitdaYr1":1.0,"ebitdaYr2":2.5,"ebitdaYr3":5.0,"payback":3.5}}}]}]},{"id":"Finance","name":"Finance & Controlling","subFunctions":[{"id":"Finance_SF1","name":"FP&A","initiatives":[{"id":"Finance_SF1_I1","name":"Forecasting & Scenario Planning","approaches":{"processLed":{"name":"Rolling Forecasts + Driver-based Excel Models","description":"Move from annual budgeting to quarterly rolling forecasts with P&L driver trees. Mandatory variance commentary.","risk":0.4,"riskPenalty":0.4,"year1":0.3,"year2":0.3,"year3":0.3,"ebitdaYr1":2.5,"ebitdaYr2":4.0,"ebitdaYr3":6.0,"payback":0.12},"hybrid":{"name":"EPM Platform + AI-Assisted Variance Commentary","description":"Cloud EPM (Anaplan/OneStream) for integrated planning. AI auto-generates variance commentary for CFO review.","risk":1.4,"riskPenalty":1.4,"year1":2.0,"year2":1.0,"year3":0.8,"ebitdaYr1":3.0,"ebitdaYr2":6.0,"ebitdaYr3":8.0,"payback":0.67},"aiLed":{"name":"AI FP&A Copilot (ML Forecasting + GenAI Narratives)","description":"ML forecasting with external signals. GenAI copilot for scenario simulation and board narrative generation.","risk":1.5,"riskPenalty":1.5,"year1":4.0,"year2":3.0,"year3":3.0,"ebitdaYr1":4.0,"ebitdaYr2":12.0,"ebitdaYr3":20.0,"payback":1.0}}}]},{"id":"Finance_SF2","name":"Treasury & Working Capital","initiatives":[{"id":"Finance_SF2_I1","name":"Working Capital Optimisation","approaches":{"processLed":{"name":"DSO/DPO Improvement + Supply Chain Finance","description":"AR follow-up process tightening, payment term renegotiation and SCF programme with anchor bank.","risk":0.3,"riskPenalty":0.45,"year1":1.0,"year2":0.8,"year3":0.8,"ebitdaYr1":1.2,"ebitdaYr2":1.8,"ebitdaYr3":2.5,"payback":0.83},"hybrid":{"name":"Cash Flow Forecasting Tool + Dynamic Discounting","description":"13-week rolling cash forecast with daily banking API feeds. Dynamic discounting for early payment discounts.","risk":0.5,"riskPenalty":0.75,"year1":3.0,"year2":2.0,"year3":2.0,"ebitdaYr1":3.5,"ebitdaYr2":5.0,"ebitdaYr3":7.5,"payback":0.86},"aiLed":{"name":"AI WC Intelligence (Payment Prediction + Auto Collections)","description":"ML payment behaviour prediction per customer. Automated collections prioritisation and AI-driven discounting.","risk":0.7,"riskPenalty":1.05,"year1":4.0,"year2":3.5,"year3":3.5,"ebitdaYr1":5.5,"ebitdaYr2":10.0,"ebitdaYr3":15.0,"payback":0.73}}}]},{"id":"Finance_SF3","name":"Cost Management","initiatives":[{"id":"Finance_SF3_I1","name":"Plant-level Cost Intelligence","approaches":{"processLed":{"name":"Standard Costing + Monthly Plant Cost Reviews","description":"Strengthen standard cost cards per grade. Monthly plant cost review meetings with variance ownership.","risk":0.4,"riskPenalty":0.32,"year1":0.65,"year2":0.65,"year3":0.5,"ebitdaYr1":1.5,"ebitdaYr2":3.0,"ebitdaYr3":4.5,"payback":0.43},"hybrid":{"name":"Activity-Based Costing + BI Dashboards","description":"ABC model for true per-grade profitability across 4 plants. Power BI dashboards for plant managers.","risk":1.0,"riskPenalty":0.8,"year1":1.0,"year2":0.25,"year3":0.25,"ebitdaYr1":2.5,"ebitdaYr2":6.0,"ebitdaYr3":10.0,"payback":0.4},"aiLed":{"name":"Real-time Plant P&L (IoT + ERP + AI Anomaly Detection)","description":"IoT cost signals streamed to ERP for shift-level P&L. AI detects cost anomalies and triggers corrective actions.","risk":1.5,"riskPenalty":1.2,"year1":5.0,"year2":5.0,"year3":5.0,"ebitdaYr1":4.0,"ebitdaYr2":15.0,"ebitdaYr3":30.0,"payback":1.25}}}]}]},{"id":"IT&Digital","name":"IT & Digital Infrastructure","subFunctions":[{"id":"IT&Digital_SF1","name":"Cloud & Core Infrastructure","initiatives":[{"id":"IT&Digital_SF1_I1","name":"ERP Modernisation & Cloud Migration","approaches":{"processLed":{"name":"ERP Harmonisation + Lift-and-Shift to IaaS","description":"Harmonise ERP processes across plants. Move on-prem ERP to IaaS. Reduce hardware and DC costs.","risk":1.6,"riskPenalty":1.6,"year1":3.5,"year2":1.5,"year3":1.0,"ebitdaYr1":1.2,"ebitdaYr2":2.5,"ebitdaYr3":4.0,"payback":2.92},"hybrid":{"name":"ERP Upgrade to S/4HANA + Selective SaaS Add-ons","description":"S/4HANA upgrade with process improvements. Best-of-breed SaaS for MES and TMS. API integration layer.","risk":2.5,"riskPenalty":2.5,"year1":8.0,"year2":4.0,"year3":2.0,"ebitdaYr1":2.0,"ebitdaYr2":5.0,"ebitdaYr3":12.0,"payback":4.0},"aiLed":{"name":"Composable AI-ready Architecture (SAP + Agentic Layer)","description":"Modular composable stack: S/4HANA + specialised SaaS + agentic AI orchestration layer.","risk":2.5,"riskPenalty":2.5,"year1":12.0,"year2":6.0,"year3":3.0,"ebitdaYr1":3.5,"ebitdaYr2":10.0,"ebitdaYr3":25.0,"payback":3.43}}}]},{"id":"IT&Digital_SF2","name":"Data & Analytics","initiatives":[{"id":"IT&Digital_SF2_I1","name":"Unified Data Platform","approaches":{"processLed":{"name":"Data Warehouse + Self-service BI","description":"Centralised data warehouse with single source of truth. Self-service BI rollout with training programme.","risk":1.2,"riskPenalty":1.2,"year1":1.2,"year2":0.8,"year3":0.5,"ebitdaYr1":0.5,"ebitdaYr2":1.5,"ebitdaYr3":2.5,"payback":2.4},"hybrid":{"name":"Cloud Data Lakehouse + Governed Analytics","description":"Scalable cloud lakehouse for structured and unstructured data. Governed data catalogue with business metrics layer.","risk":1.6,"riskPenalty":1.6,"year1":3.0,"year2":2.0,"year3":1.5,"ebitdaYr1":1.2,"ebitdaYr2":4.0,"ebitdaYr3":7.5,"payback":2.5},"aiLed":{"name":"AI-ready Data Mesh + MLOps Platform","description":"Federated data mesh with domain-owned data products. MLOps pipeline for model training and deployment.","risk":2.0,"riskPenalty":2.0,"year1":5.0,"year2":3.0,"year3":2.0,"ebitdaYr1":2.0,"ebitdaYr2":8.0,"ebitdaYr3":15.0,"payback":2.5}}}]},{"id":"IT&Digital_SF3","name":"Cybersecurity","initiatives":[{"id":"IT&Digital_SF3_I1","name":"OT/IT Cybersecurity Resilience","approaches":{"processLed":{"name":"OT/IT Patch Management + Security Training","description":"Structured patching programme. Annual cybersecurity training and phishing simulations for all 1,500 employees.","risk":1.5,"riskPenalty":1.8,"year1":1.5,"year2":0.8,"year3":0.8,"ebitdaYr1":0.4,"ebitdaYr2":1.0,"ebitdaYr3":1.5,"payback":3.75},"hybrid":{"name":"SOC + SIEM + OT Network Segmentation","description":"24x7 SOC with SIEM for threat detection. Purdue-model OT network segmentation.","risk":2.5,"riskPenalty":3.0,"year1":4.0,"year2":2.5,"year3":2.5,"ebitdaYr1":1.0,"ebitdaYr2":3.0,"ebitdaYr3":6.0,"payback":4.0},"aiLed":{"name":"Zero Trust Architecture + AI Threat Detection","description":"Zero-trust network with micro-segmentation. AI-based anomaly detection on OT/IT traffic. Automated incident response.","risk":3.0,"riskPenalty":3.6,"year1":6.0,"year2":3.0,"year3":3.0,"ebitdaYr1":2.0,"ebitdaYr2":7.0,"ebitdaYr3":12.0,"payback":3.0}}}]}]},{"id":"Sales","name":"Sales & Commercial","subFunctions":[{"id":"Sales_SF1","name":"Pricing & Revenue Management","initiatives":[{"id":"Sales_SF1_I1","name":"Dynamic Pricing Capability","approaches":{"processLed":{"name":"Pricing Committee + Cost-Plus with Index Linkage","description":"Monthly pricing committee with cost-plus methodology. Feedstock index linkage clauses in contracts.","risk":0.3,"riskPenalty":10.0,"year1":1.5,"year2":1.5,"year3":1.5,"ebitdaYr1":1.0,"ebitdaYr2":1.0,"ebitdaYr3":3.0,"payback":2.7},"hybrid":{"name":"Value-based Pricing Model + Segment P&L Analysis","description":"Segment-level value-based pricing backed by WTP research. Customer-grade P&L to identify under-priced volumes.","risk":0.4,"riskPenalty":12.5,"year1":1.7,"year2":1.8,"year3":1.8,"ebitdaYr1":2.0,"ebitdaYr2":2.0,"ebitdaYr3":4.5,"payback":2.4},"aiLed":{"name":"AI Dynamic Pricing Engine (Real-time Feedstock)","description":"ML pricing engine auto-adjusts quotes based on real-time CTFS/CSO costs, competitor signals and contract rules.","risk":0.6,"riskPenalty":15.0,"year1":2.0,"year2":2.5,"year3":2.5,"ebitdaYr1":3.0,"ebitdaYr2":3.5,"ebitdaYr3":3.5,"payback":2.2}}}]},{"id":"Sales_SF2","name":"Customer Intelligence","initiatives":[{"id":"Sales_SF2_I1","name":"Customer Profitability & Retention Analytics","approaches":{"processLed":{"name":"CRM Hygiene + Key Account Plans","description":"CRM data cleansing. Structured KAM reviews for top 20 customers. Annual NPS survey.","risk":0.5,"riskPenalty":8.0,"year1":1.0,"year2":1.1,"year3":1.1,"ebitdaYr1":1.5,"ebitdaYr2":1.5,"ebitdaYr3":1.5,"payback":2.1},"hybrid":{"name":"CRM Analytics + Churn Propensity Dashboards","description":"CRM with funnel analytics, churn risk scores and cross-sell opportunity flags.","risk":0.8,"riskPenalty":10.0,"year1":1.5,"year2":1.5,"year3":1.5,"ebitdaYr1":2.5,"ebitdaYr2":2.5,"ebitdaYr3":2.5,"payback":1.8},"aiLed":{"name":"AI Commercial Copilot (GenAI Proposals + White-space)","description":"GenAI copilot drafts proposals, surfaces white-space cross-sell opportunities and models per-customer profitability.","risk":1.0,"riskPenalty":12.0,"year1":2.0,"year2":2.0,"year3":2.0,"ebitdaYr1":4.0,"ebitdaYr2":4.0,"ebitdaYr3":4.0,"payback":1.5}}}]},{"id":"Sales_SF3","name":"Market Development","initiatives":[{"id":"Sales_SF3_I1","name":"Export Market Expansion","approaches":{"processLed":{"name":"Trade Shows + Distributor Network Building","description":"Participate in 3 international trade exhibitions. Appoint distributors in SE Asia and Middle East.","risk":0.7,"riskPenalty":7.0,"year1":0.5,"year2":0.5,"year3":0.5,"ebitdaYr1":1.0,"ebitdaYr2":1.0,"ebitdaYr3":1.0,"payback":1.5},"hybrid":{"name":"Digital Trade Intelligence + Export Team","description":"Trade data platform for import trend analysis. Dedicated 3-person export team targeting 2 new geographies.","risk":0.5,"riskPenalty":5.0,"year1":0.6,"year2":0.6,"year3":0.6,"ebitdaYr1":1.5,"ebitdaYr2":1.5,"ebitdaYr3":1.5,"payback":1.2},"aiLed":{"name":"AI Market Entry Analysis + Dedicated Export BU","description":"AI engine analyses tariffs, competitor gaps and buyer profiles. Export BU with AI-powered outreach sequencing.","risk":0.6,"riskPenalty":6.0,"year1":0.7,"year2":0.7,"year3":0.7,"ebitdaYr1":2.0,"ebitdaYr2":2.0,"ebitdaYr3":2.0,"payback":1.1}}}]}]},{"id":"SC","name":"Supply Chain & Logistics","subFunctions":[{"id":"SC_SF1","name":"Demand Planning","initiatives":[{"id":"SC_SF1_I1","name":"Demand Forecasting Accuracy","approaches":{"processLed":{"name":"S&OP Process + Statistical Forecasting","description":"Monthly S&OP with time-series statistical models. Dedicated demand planner role.","risk":0.4,"riskPenalty":2.0,"year1":0.5,"year2":0.4,"year3":0.4,"ebitdaYr1":0.6,"ebitdaYr2":0.7,"ebitdaYr3":1.0,"payback":2.0},"hybrid":{"name":"IBP/Kinaxis + Collaborative Forecasting","description":"Cloud IBP tool with collaborative forecasting portal for top 15 tyre customers.","risk":1.3,"riskPenalty":4.5,"year1":0.8,"year2":1.0,"year3":1.1,"ebitdaYr1":1.4,"ebitdaYr2":1.6,"ebitdaYr3":1.8,"payback":1.9},"aiLed":{"name":"ML Demand Sensing (External Signal Ingestion)","description":"ML model ingesting automotive production schedules, tyre export data, commodity indices and weather.","risk":1.2,"riskPenalty":4.0,"year1":1.0,"year2":1.2,"year3":1.4,"ebitdaYr1":1.7,"ebitdaYr2":1.9,"ebitdaYr3":2.5,"payback":1.8}}}]},{"id":"SC_SF2","name":"Outbound Logistics","initiatives":[{"id":"SC_SF2_I1","name":"Freight & Distribution Optimisation","approaches":{"processLed":{"name":"Manual Route Planning + GPS Fleet Tracking","description":"Daily manual route planning with GPS tracking. Monthly carrier performance reviews.","risk":0.6,"riskPenalty":4.0,"year1":0.4,"year2":0.6,"year3":0.6,"ebitdaYr1":0.5,"ebitdaYr2":0.5,"ebitdaYr3":0.6,"payback":2.0},"hybrid":{"name":"TMS with Algorithmic Route Optimisation","description":"TMS with algorithmic route planning, carrier tendering and freight audit. Reduces empty miles.","risk":1.0,"riskPenalty":5.0,"year1":0.6,"year2":0.6,"year3":0.6,"ebitdaYr1":0.7,"ebitdaYr2":0.7,"ebitdaYr3":0.75,"payback":1.8},"aiLed":{"name":"AI Logistics Control Tower (Dynamic Routing)","description":"AI control tower with real-time signals for dynamic re-routing. Automated carrier switching and ETA prediction.","risk":1.1,"riskPenalty":5.5,"year1":0.8,"year2":0.9,"year3":0.9,"ebitdaYr1":1.0,"ebitdaYr2":1.1,"ebitdaYr3":1.2,"payback":1.6}}}]},{"id":"SC_SF3","name":"Inventory Management","initiatives":[{"id":"SC_SF3_I1","name":"Multi-echelon Inventory Optimisation","approaches":{"processLed":{"name":"ABC-XYZ Classification + Min-Max Reorder Rules","description":"Rigorous ABC-XYZ analysis with recalibrated safety stock. Cycle-count programme for inventory accuracy.","risk":0.3,"riskPenalty":1.0,"year1":0.3,"year2":0.3,"year3":0.3,"ebitdaYr1":0.2,"ebitdaYr2":0.4,"ebitdaYr3":0.5,"payback":2.0},"hybrid":{"name":"ERP-integrated Safety Stock Optimisation","description":"Statistical safety stock with automated replenishment triggers. VMI with top 3 feedstock suppliers.","risk":0.7,"riskPenalty":1.5,"year1":0.4,"year2":0.4,"year3":0.4,"ebitdaYr1":0.5,"ebitdaYr2":0.5,"ebitdaYr3":0.5,"payback":1.8},"aiLed":{"name":"Probabilistic AI Inventory Model","description":"Probabilistic demand and supply variability model with dynamic safety stock. Reduces inventory 18–22%.","risk":0.9,"riskPenalty":2.0,"year1":0.6,"year2":0.6,"year3":0.6,"ebitdaYr1":0.6,"ebitdaYr2":0.8,"ebitdaYr3":0.8,"payback":1.7}}}]}]},{"id":"Procurement","name":"Procurement","subFunctions":[{"id":"Procurement_SF1","name":"Source-to-Contract","initiatives":[{"id":"Procurement_SF1_I1","name":"Strategic Sourcing & Category Management","approaches":{"processLed":{"name":"Category Management + Should-Cost Benchmarking","description":"Structured category management for top 10 spend categories. Should-cost models and TCO analysis.","risk":0.4,"riskPenalty":0.2,"year1":0.75,"year2":0.5,"year3":0.5,"ebitdaYr1":2.5,"ebitdaYr2":4.0,"ebitdaYr3":5.5,"payback":0.3},"hybrid":{"name":"e-Sourcing Platform + AI Supplier Discovery","description":"e-Sourcing for competitive RFx and auction. AI-assisted supplier discovery for alternate CTFS/CSO vendors.","risk":0.6,"riskPenalty":0.3,"year1":4.0,"year2":1.5,"year3":2.0,"ebitdaYr1":5.0,"ebitdaYr2":12.0,"ebitdaYr3":18.0,"payback":0.8},"aiLed":{"name":"Autonomous Agentic Sourcing (AI RFx + Negotiation)","description":"AI agent drafts RFx, evaluates bids, simulates negotiation scenarios and routes award recommendations.","risk":1.0,"riskPenalty":0.5,"year1":3.0,"year2":2.0,"year3":2.0,"ebitdaYr1":6.0,"ebitdaYr2":15.0,"ebitdaYr3":25.0,"payback":0.5}}}]},{"id":"Procurement_SF2","name":"Contract Management","initiatives":[{"id":"Procurement_SF2_I1","name":"Contract Intelligence & Compliance","approaches":{"processLed":{"name":"Contract Repository + Standardised Templates","description":"Centralised contract repository, clause library and renewal calendar managed by procurement team.","risk":0.6,"riskPenalty":0.3,"year1":0.45,"year2":0.3,"year3":0.3,"ebitdaYr1":0.8,"ebitdaYr2":1.2,"ebitdaYr3":1.5,"payback":0.56},"hybrid":{"name":"CLM Platform + Periodic AI Review","description":"Contract Lifecycle Management with automated obligation tracking. Quarterly AI-assisted risk review.","risk":1.1,"riskPenalty":0.55,"year1":3.0,"year2":1.0,"year3":1.0,"ebitdaYr1":1.5,"ebitdaYr2":4.5,"ebitdaYr3":7.0,"payback":2.0},"aiLed":{"name":"GenAI Contract Analysis (Continuous Risk Extraction)","description":"LLM continuously scans all contracts for risk clauses, deviations, expiry risks and opportunities.","risk":1.1,"riskPenalty":0.55,"year1":1.0,"year2":0.5,"year3":0.5,"ebitdaYr1":2.0,"ebitdaYr2":6.0,"ebitdaYr3":10.0,"payback":0.5}}}]},{"id":"Procurement_SF3","name":"Purchase-to-Pay","initiatives":[{"id":"Procurement_SF3_I1","name":"P2P & Invoice Automation","approaches":{"processLed":{"name":"PO Compliance Controls + Maverick Spend Reduction","description":"Policy enforcement on requisitions, PO creation mandates and supplier on-contract targeting.","risk":0.4,"riskPenalty":0.24,"year1":0.45,"year2":0.45,"year3":0.25,"ebitdaYr1":1.0,"ebitdaYr2":2.5,"ebitdaYr3":3.5,"payback":0.45},"hybrid":{"name":"ERP P2P Optimisation + 3-Way Match","description":"ERP-native P2P workflow with automated 3-way match, GRN automation and payment scheduling.","risk":0.8,"riskPenalty":0.48,"year1":1.5,"year2":0.5,"year3":0.5,"ebitdaYr1":2.5,"ebitdaYr2":5.0,"ebitdaYr3":8.0,"payback":0.8},"aiLed":{"name":"Fully Agentic AP (AI Invoice Processing Agents)","description":"AI agents handle end-to-end invoice capture, intelligent matching, exception resolution and payment.","risk":1.1,"riskPenalty":0.66,"year1":3.0,"year2":1.0,"year3":1.0,"ebitdaYr1":4.0,"ebitdaYr2":10.0,"ebitdaYr3":18.0,"payback":0.75}}}]}]},{"id":"Mfg&Ops","name":"Manufacturing & Operations","subFunctions":[{"id":"Mfg&Ops_SF1","name":"Process Optimisation","initiatives":[{"id":"Mfg&Ops_SF1_I1","name":"Production Yield Optimisation","approaches":{"processLed":{"name":"Lean Manufacturing + Kaizen Programme","description":"Lean programme across 4 plants: VSM, kaizen events, standard work. Focus on reducing batch losses.","risk":0.6,"riskPenalty":0.3,"year1":1.5,"year2":0.8,"year3":0.4,"ebitdaYr1":2.0,"ebitdaYr2":4.1,"ebitdaYr3":6.8,"payback":0.6},"hybrid":{"name":"MES + Statistical Process Control (SPC)","description":"MES with SPC for real-time process deviation alerts. Operators guided by dashboards; engineers tune monthly.","risk":1.3,"riskPenalty":0.7,"year1":4.0,"year2":2.0,"year3":1.0,"ebitdaYr1":3.4,"ebitdaYr2":6.8,"ebitdaYr3":10.8,"payback":0.9},"aiLed":{"name":"Autonomous AI Yield Optimisation Agent","description":"ML model continuously analyses feed quality, furnace temperature and quench rates to adjust parameters.","risk":1.6,"riskPenalty":0.8,"year1":7.0,"year2":3.5,"year3":1.8,"ebitdaYr1":4.7,"ebitdaYr2":9.5,"ebitdaYr3":14.9,"payback":1.1}}}]},{"id":"Mfg&Ops_SF2","name":"Asset Reliability","initiatives":[{"id":"Mfg&Ops_SF2_I1","name":"Predictive Maintenance","approaches":{"processLed":{"name":"Preventive Maintenance Scheduling (RCM-based)","description":"RCM programme with structured PM schedules, rotating equipment logs and OEM-guided inspection intervals.","risk":0.6,"riskPenalty":0.3,"year1":1.0,"year2":0.5,"year3":0.3,"ebitdaYr1":1.4,"ebitdaYr2":2.7,"ebitdaYr3":4.7,"payback":0.5},"hybrid":{"name":"IoT Condition Monitoring + CMMS Integration","description":"Vibration, temperature and acoustic sensors on critical equipment feed CMMS. Threshold-based alerts.","risk":1.1,"riskPenalty":0.6,"year1":3.0,"year2":1.5,"year3":0.8,"ebitdaYr1":2.4,"ebitdaYr2":5.4,"ebitdaYr3":8.8,"payback":0.8},"aiLed":{"name":"Cognitive Maintenance AI (Failure Prediction + GenAI RCA)","description":"ML models predict failures 2–4 weeks ahead. GenAI RCA copilot guides engineers. Closed-loop learning.","risk":1.3,"riskPenalty":0.7,"year1":6.0,"year2":3.0,"year3":1.5,"ebitdaYr1":3.4,"ebitdaYr2":7.4,"ebitdaYr3":12.2,"payback":1.2}}}]},{"id":"Mfg&Ops_SF3","name":"Energy & Utilities","initiatives":[{"id":"Mfg&Ops_SF3_I1","name":"Plant Energy Optimisation","approaches":{"processLed":{"name":"Energy Audits + Shift-level Energy Accountability","description":"Third-party energy audit followed by shift-level kWh targets and furnace oil benchmarks.","risk":0.5,"riskPenalty":0.3,"year1":0.8,"year2":0.4,"year3":0.2,"ebitdaYr1":1.4,"ebitdaYr2":2.7,"ebitdaYr3":4.1,"payback":0.5},"hybrid":{"name":"SCADA Energy Monitoring + Periodic AI Recommendations","description":"Real-time SCADA energy dashboards with monthly AI-generated optimisation recommendations.","risk":0.8,"riskPenalty":0.4,"year1":2.5,"year2":1.2,"year3":0.6,"ebitdaYr1":2.0,"ebitdaYr2":4.7,"ebitdaYr3":7.4,"payback":0.8},"aiLed":{"name":"Autonomous Energy Management System","description":"AI continuously optimises furnace firing, compressor loads and steam generation in closed-loop.","risk":1.0,"riskPenalty":0.5,"year1":5.0,"year2":2.5,"year3":1.2,"ebitdaYr1":2.7,"ebitdaYr2":6.8,"ebitdaYr3":10.8,"payback":1.1}}}]},{"id":"Mfg&Ops_SF4","name":"Quality Management","initiatives":[{"id":"Mfg&Ops_SF4_I1","name":"Inline Quality Detection","approaches":{"processLed":{"name":"Manual SPC + Increased Lab Sampling","description":"Strengthen quality gates: more frequent lab sampling, tighter SPC control limits, cross-shift reviews.","risk":0.6,"riskPenalty":0.3,"year1":1.0,"year2":0.5,"year3":0.3,"ebitdaYr1":1.1,"ebitdaYr2":2.4,"ebitdaYr3":4.1,"payback":0.6},"hybrid":{"name":"Vision AI for Surface Defects + Manual Grade Review","description":"Camera-based vision AI for inline surface and colour inspection. Final grade classification engineer-reviewed.","risk":1.2,"riskPenalty":0.6,"year1":3.5,"year2":1.8,"year3":0.9,"ebitdaYr1":2.0,"ebitdaYr2":4.7,"ebitdaYr3":7.4,"payback":1.1},"aiLed":{"name":"Multivariate AI Quality Model (Feed-to-Finish)","description":"End-to-end AI model linking raw feedstock to final carbon black grade quality in real time.","risk":1.4,"riskPenalty":0.7,"year1":6.5,"year2":3.2,"year3":1.6,"ebitdaYr1":2.7,"ebitdaYr2":6.8,"ebitdaYr3":10.8,"payback":1.4}}}]},{"id":"Mfg&Ops_SF5","name":"Production Efficiency","initiatives":[{"id":"Mfg&Ops_SF5_I1","name":"OEE Improvement & Scheduling","approaches":{"processLed":{"name":"OEE Baseline Programme + Shift Huddles","description":"Establish OEE measurement with daily shift huddles and weekly improvement sprints. Operator-led.","risk":0.5,"riskPenalty":0.3,"year1":1.0,"year2":0.5,"year3":0.3,"ebitdaYr1":1.1,"ebitdaYr2":2.4,"ebitdaYr3":4.1,"payback":0.6},"hybrid":{"name":"MES-based OEE Tracking + Constraint-based Scheduling","description":"MES for real-time OEE with downtime coding. Constraint-based scheduling to optimise plant utilisation.","risk":1.4,"riskPenalty":0.7,"year1":4.0,"year2":2.0,"year3":1.0,"ebitdaYr1":2.0,"ebitdaYr2":4.7,"ebitdaYr3":8.1,"payback":1.2},"aiLed":{"name":"AI Dynamic Production Scheduler (Self-optimising)","description":"RL scheduler continuously optimises across maintenance windows, changeovers, energy costs and priorities.","risk":1.6,"riskPenalty":0.8,"year1":7.5,"year2":3.8,"year3":1.9,"ebitdaYr1":2.7,"ebitdaYr2":6.8,"ebitdaYr3":12.2,"payback":1.5}}}]}]}]};

const FUNCTION_ORDER = ['Sales','Mfg&Ops','Procurement','SC','Finance','HR','IT&Digital'];
const MASTER_DATA = { functions: FUNCTION_ORDER.map(id => MASTER_DATA_RAW.functions.find(f => f.id === id)).filter(Boolean) };
const BASELINE_EBITDA = 390;
const SCREENS = { LOGIN:0, CONTEXT:1, STORY:2, GUIDELINES:3, SELECT_FUNC:4, SELECT_AREA:5, GAME:6, RESULTS:7, LEADERBOARD:8 };

// ── Particles ────────────────────────────────────────────────────────────────
const ParticlesBg = () => (
  <div style={{ position:'fixed', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:0 }}>
    {[...Array(14)].map((_,i) => (
      <div key={i} style={{ position:'absolute', borderRadius:'50%', opacity:0.055,
        width:20+Math.random()*70, height:20+Math.random()*70,
        left:`${Math.random()*100}%`, top:`${Math.random()*100}%`,
        background:i%3===0?'#f59e0b':i%3===1?'#6366f1':'#16a34a',
        animation:`float ${6+i*0.7}s ease-in-out infinite alternate`, animationDelay:`${i*0.4}s`
      }}/>
    ))}
    <style>{`
      @keyframes float{from{transform:translateY(0) scale(1)}to{transform:translateY(-26px) scale(1.1)}}
      @keyframes slideIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    `}</style>
  </div>
);

// ── Shared UI components ─────────────────────────────────────────────────────
const funcIcons = {'HR':'👥','Finance':'💰','IT&Digital':'💻','Sales':'📈','SC':'🚛','Procurement':'📦','Mfg&Ops':'🏭'};

const Btn = ({children,onClick,disabled,green,secondary,small}) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: secondary?'#fff':green?'linear-gradient(135deg,#16a34a,#22c55e)':'linear-gradient(135deg,#6366f1,#8b5cf6)',
    border: secondary?'2px solid #e5e7eb':'none',
    borderRadius:12, padding:small?'9px 18px':'13px 28px',
    fontSize:small?12:14, fontWeight:800, color:secondary?'#4b5563':'#fff',
    cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.5:1,
    boxShadow:disabled||secondary?'none':'0 4px 14px rgba(99,102,241,0.28)',
    transition:'transform 0.15s', letterSpacing:0.3,
  }}
  onMouseEnter={e=>{if(!disabled&&!secondary)e.target.style.transform='translateY(-2px)';}}
  onMouseLeave={e=>{e.target.style.transform='translateY(0)';}}
  >{children}</button>
);

const Card = ({children,wide,nopad}) => (
  <div style={{
    background:'#fff', borderRadius:24, boxShadow:'0 20px 60px rgba(0,0,0,0.11)',
    padding:nopad?0:30, width:'100%', maxWidth:wide?1010:750,
    position:'relative', zIndex:1, animation:'slideIn 0.4s ease',
  }}>{children}</div>
);

const Badge = ({children,color}) => (
  <span style={{
    display:'inline-block',
    background:`rgba(${color||'99,102,241'},0.12)`,
    color:`rgb(${color||'99,102,241'})`,
    padding:'5px 14px', borderRadius:20, fontSize:10, fontWeight:800,
    letterSpacing:2, marginBottom:8,
  }}>{children}</span>
);

// ── Main component ───────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState(SCREENS.LOGIN);
  const [userName, setUserName]   = useState('');
  const [userId, setUserId]       = useState('');
  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState('');
  const [nameLoading, setNameLoading] = useState(false);

  const [funcs, setFuncs]         = useState([]);
  const [areas, setAreas]         = useState({});
  const [selections, setSelections] = useState({});
  const [commentary, setCommentary] = useState({});
  const [funcCommentary, setFuncCommentary] = useState([]);

  const [stats, setStats]         = useState({ joined:0, completed:0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [rank, setRank]           = useState(0);
  const [loading, setLoading]     = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [expandedInit, setExpandedInit] = useState(null);
  const [showCommentary, setShowCommentary] = useState(null);

  // Fetch stats on mount and poll every 30s
  useEffect(() => {
    fetchStats();
    const t = setInterval(fetchStats, 30000);
    return () => clearInterval(t);
  }, []);

  const fetchStats = async () => {
    try { const d = await getStats(); setStats(d); } catch(e) {}
  };

  // ── Name submission — debounced to avoid double-clicks ──────────────────
  const handleNameSubmit = async () => {
    const n = nameInput.trim();
    if (n.length < 2) { setNameError('Please enter at least 2 characters.'); return; }
    setNameError('');
    setNameLoading(true);
    try {
      const { userId: uid, name } = await registerUser(n);
      setUserId(uid);
      setUserName(name);
      await fetchStats();
      setScreen(SCREENS.CONTEXT);
    } catch(e) {
      setNameError(e.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setNameLoading(false);
    }
  };

  // ── Score submission ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError('');
    try {
      const t = calcTotals();
      const { leaderboard: lb, rank: r } = await submitScore({
        userId, name: userName,
        score:   Math.round(t.score  * 10) / 10,
        ebitda:  Math.round(t.te     * 10) / 10,
        inv:     Math.round(t.ti     * 10) / 10,
        risk:    Math.round(t.rp     * 10) / 10,
        payback: Math.round(t.avgPb  * 10) / 10,
        pct: t.pct,
      });
      setLeaderboard(lb);
      setRank(r);
      await fetchStats();
      setScreen(SCREENS.RESULTS);
    } catch(e) {
      setSubmitError(e.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewLeaderboard = async () => {
    try { const { leaderboard: lb } = await getLeaderboard(); setLeaderboard(lb); } catch(e) {}
    setScreen(SCREENS.LEADERBOARD);
  };

  // ── Game helpers ─────────────────────────────────────────────────────────
  const getInits = () => {
    const inits = []; const allAreas = Object.values(areas).flat();
    MASTER_DATA.functions.forEach(f => {
      if (funcs.includes(f.id)) {
        f.subFunctions.forEach(sf => {
          if (allAreas.includes(sf.id)) {
            sf.initiatives.forEach(i => inits.push({...i, func:f.name, funcId:f.id, subFunc:sf.name}));
          }
        });
      }
    });
    return inits;
  };

  const calcTotals = () => {
    let e1=0,e2=0,e3=0,i1=0,i2=0,i3=0,rp=0,pbs=0,cnt=0;
    getInits().forEach(i => {
      const a = selections[i.id];
      if (a && i.approaches[a]) {
        const d = i.approaches[a];
        e1+=d.ebitdaYr1||0; e2+=d.ebitdaYr2||0; e3+=d.ebitdaYr3||0;
        i1+=d.year1||0;     i2+=d.year2||0;     i3+=d.year3||0;
        rp+=d.riskPenalty||0; pbs+=d.payback||0; cnt++;
      }
    });
    const te=e1+e2+e3, ti=i1+i2+i3;
    const score = te - ti - rp;
    return { e1,e2,e3,te, i1,i2,i3,ti, rp, score, avgPb:cnt>0?pbs/cnt:0, newE:BASELINE_EBITDA+te, pct:((te/BASELINE_EBITDA)*100).toFixed(1) };
  };

  const canProceed  = () => funcs.length===2 && funcs.every(f=>(areas[f]||[]).length===2);
  const allSelected = () => { const inits=getInits(); return inits.length>0 && inits.every(i=>selections[i.id]); };
  const totals = calcTotals();

  const handleApproachSelect = (initId, approach) => {
    setSelections(s => ({...s,[initId]:approach}));
    setCommentary(p => ({...p,[initId]:getCommentary(approach)}));
    setShowCommentary(initId);
    setTimeout(() => setShowCommentary(null), 4500);
  };

  const reset = () => {
    setScreen(SCREENS.LOGIN); setUserName(''); setUserId(''); setNameInput(''); setNameError('');
    setFuncs([]); setAreas({}); setSelections({}); setRank(0); setExpandedInit(null); setCommentary({});
  };

  // ── Shared header ────────────────────────────────────────────────────────
  const StatsBar = () => (
    <div style={{fontSize:12,color:'#6b7280',background:'#f3f4f6',padding:'6px 14px',borderRadius:20,fontWeight:600,whiteSpace:'nowrap'}}>
      👥 <b style={{color:'#6366f1'}}>{stats.joined}</b> Joined · <b style={{color:'#16a34a'}}>{stats.completed}</b> Completed
    </div>
  );

  const Header = () => (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22,paddingBottom:16,borderBottom:'2px solid #f3f4f6',flexWrap:'wrap',gap:10}}>
      <ICBLogo size={36}/>
      {userName && <span style={{background:'rgba(99,102,241,0.1)',color:'#6366f1',padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:700}}>👤 {userName}</span>}
      <div style={{display:'flex',gap:10,alignItems:'center'}}>
        <AccentureLogo/>
        <StatsBar/>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // SCREEN: LOGIN
  // ════════════════════════════════════════════════════════════════════════════
  if (screen === SCREENS.LOGIN) return (
    <div style={{...S.page, background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)'}}>
      <ParticlesBg/>
      <Card>
        <div style={{textAlign:'center',marginBottom:24}}>
          {/* Accenture logo top-right of card */}
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
            <AccentureLogo dark/>
          </div>
          <div style={{display:'flex',justifyContent:'center',marginBottom:14}}><ICBLogo size={54}/></div>
          <div style={{fontSize:10,fontWeight:800,color:'#f59e0b',letterSpacing:4}}>ENTERPRISE TRANSFORMATION</div>
          <h1 style={{fontSize:26,fontWeight:900,color:'#1a1a2e',margin:'6px 0 4px',letterSpacing:-1}}>Strategy Simulation</h1>
          <div style={{fontSize:12,color:'#9ca3af',marginBottom:8}}>Carbon Black Manufacturing · Powered by Accenture</div>
          <div style={{width:56,height:3,background:'linear-gradient(135deg,#f59e0b,#92400e)',margin:'10px auto',borderRadius:3}}/>
          <div style={{display:'flex',justifyContent:'center',marginBottom:12}}><StatsBar/></div>
        </div>

        {/* Name input */}
        <div style={{maxWidth:380,margin:'0 auto'}}>
          <div style={{fontSize:11,color:'#6b7280',fontWeight:700,letterSpacing:2,textAlign:'center',marginBottom:10}}>⬇ ENTER YOUR NAME TO BEGIN</div>
          <input
            type="text"
            placeholder="Your full name"
            value={nameInput}
            onChange={e => { setNameInput(e.target.value); setNameError(''); }}
            onKeyDown={e => { if (e.key==='Enter') handleNameSubmit(); }}
            maxLength={60}
            style={{
              width:'100%', padding:'14px 18px', borderRadius:12, fontSize:15, fontWeight:600,
              border:`2px solid ${nameError?'#dc2626':'#e5e7eb'}`, outline:'none',
              marginBottom:10, fontFamily:"'Segoe UI',sans-serif",
              boxShadow: nameError ? '0 0 0 3px rgba(220,38,38,0.1)' : 'none',
              transition:'border-color 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor='#6366f1'; }}
            onBlur={e => { e.target.style.borderColor=nameError?'#dc2626':'#e5e7eb'; }}
          />
          {nameError && <div style={{color:'#dc2626',fontSize:11,marginBottom:8,fontWeight:600}}>⚠ {nameError}</div>}
          <div style={{textAlign:'center'}}>
            <Btn onClick={handleNameSubmit} disabled={nameLoading || nameInput.trim().length < 2}>
              {nameLoading ? '⏳ Registering...' : 'BEGIN THE SIMULATION →'}
            </Btn>
          </div>
          <div style={{textAlign:'center',marginTop:10,fontSize:10,color:'#9ca3af'}}>
            Your name will appear on the shared leaderboard
          </div>
        </div>
      </Card>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // SCREEN: CONTEXT
  // ════════════════════════════════════════════════════════════════════════════
  if (screen === SCREENS.CONTEXT) return (
    <div style={S.page}><ParticlesBg/>
      <Card wide>
        <Header/>
        <div style={{textAlign:'center',marginBottom:16}}>
          <Badge color="146,64,14">CLIENT BRIEF</Badge>
          <div style={{display:'flex',justifyContent:'center',marginBottom:8}}><ICBLogo size={50}/></div>
          <h1 style={{fontSize:22,fontWeight:900,color:'#1a1a2e',margin:'0 0 3px'}}>Indira Carbon Black Ltd.</h1>
          <div style={{fontSize:11,color:'#9ca3af'}}>Established 1982 · Kurnool, Andhra Pradesh</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
          {[{label:'Total Capacity',value:'1,80,000 MTPA',sub:'Across 4 reactors',icon:'🏭'},{label:'Revenue (FY24)',value:'₹3,000 Cr',sub:'13% EBITDA margin',icon:'💰'},{label:'Employees',value:'~1,500',sub:'820 plant operators',icon:'👥'},{label:'Market Position',value:'#3 in India',sub:'~18% market share',icon:'🏆'}].map(({label,value,sub,icon})=>(
            <div key={label} style={{background:'#f9fafb',borderRadius:12,padding:'12px 10px',textAlign:'center',border:'2px solid #e5e7eb'}}>
              <div style={{fontSize:22,marginBottom:4}}>{icon}</div>
              <div style={{fontSize:9,color:'#9ca3af',fontWeight:700,letterSpacing:0.5}}>{label}</div>
              <div style={{fontSize:15,fontWeight:900,color:'#1a1a2e',marginTop:2}}>{value}</div>
              <div style={{fontSize:9,color:'#6b7280',marginTop:2}}>{sub}</div>
            </div>
          ))}
        </div>
        <div style={{background:'#fffbeb',borderRadius:14,padding:14,marginBottom:12,border:'2px solid #fde68a'}}>
          <div style={{fontWeight:800,fontSize:12,color:'#92400e',marginBottom:8}}>🧪 Product Portfolio</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
            {[{g:'N-Series Tyre Grade',d:'N220, N330, N550, N660 — tyre OEMs and replacement market.',s:'68%'},{g:'Specialty Functional',d:'N990 thermal black, conductive grades for EV battery electrodes.',s:'22%'},{g:'Pigment Grade',d:'High-colour blacks for printing inks, coatings and plastics.',s:'10%'}].map(({g,d,s})=>(
              <div key={g} style={{background:'#fff',borderRadius:10,padding:12,border:'1px solid #fde68a'}}>
                <div style={{fontWeight:800,fontSize:11,color:'#92400e',marginBottom:4}}>{g}</div>
                <div style={{fontSize:10,color:'#6b7280',lineHeight:1.5,marginBottom:6}}>{d}</div>
                <div style={{background:'#fef3c7',color:'#92400e',padding:'2px 8px',borderRadius:8,fontSize:9,fontWeight:800,display:'inline-block'}}>{s} of revenue</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
          <div style={{background:'#f0fdf4',borderRadius:14,padding:14,border:'2px solid #bbf7d0'}}>
            <div style={{fontWeight:800,fontSize:12,color:'#166534',marginBottom:8}}>🏗️ Manufacturing</div>
            {[{loc:'Krishnapatnam, AP',cap:'95,000 MTPA',d:'2 reactors · 12 MW captive power (tail gas)'},{loc:'Cuddalore, TN',cap:'85,000 MTPA',d:'2 reactors · Grid-supplied power'}].map(({loc,cap,d})=>(
              <div key={loc} style={{background:'#fff',borderRadius:8,padding:10,marginBottom:6,border:'1px solid #bbf7d0'}}>
                <div style={{fontWeight:700,fontSize:11}}>{loc} <span style={{background:'#d1fae5',color:'#166534',padding:'2px 7px',borderRadius:7,fontSize:9,marginLeft:4}}>{cap}</span></div>
                <div style={{fontSize:10,color:'#6b7280',marginTop:2}}>{d}</div>
              </div>
            ))}
          </div>
          <div style={{background:'#eff6ff',borderRadius:14,padding:14,border:'2px solid #bfdbfe'}}>
            <div style={{fontWeight:800,fontSize:12,color:'#1e40af',marginBottom:8}}>🌐 Market</div>
            {[{l:'Competitors',v:'Philips Carbon, Birla Carbon'},{l:'Customer Segments',v:'Tyre OEMs (58%), Replacement (22%), Industrial (12%), Pigments (8%)'},{l:'Export Share',v:'9% — Sri Lanka, Bangladesh. Expanding SE Asia'},{l:'Depots',v:'Chennai, Mumbai, Pune, Ahmedabad, Delhi, Kolkata'}].map(({l,v})=>(
              <div key={l} style={{marginBottom:6}}>
                <span style={{fontSize:9,fontWeight:800,color:'#6b7280',letterSpacing:0.5,textTransform:'uppercase'}}>{l} · </span>
                <span style={{fontSize:10,color:'#1a1a2e',fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,marginBottom:16,flexWrap:'wrap'}}>
          <div style={{background:'#f9fafb',borderRadius:12,padding:'12px 18px',textAlign:'center',border:'2px solid #e5e7eb'}}>
            <div style={{fontSize:9,color:'#9ca3af',fontWeight:700}}>BASELINE EBITDA</div>
            <div style={{fontSize:20,fontWeight:900}}>₹390 Cr</div>
            <div style={{fontSize:10,color:'#9ca3af'}}>13.0% Margin</div>
          </div>
          <span style={{fontSize:24,color:'#f59e0b'}}>→</span>
          <div style={{background:'rgba(245,158,11,0.08)',borderRadius:12,padding:'12px 18px',textAlign:'center',border:'2px solid #f59e0b'}}>
            <div style={{fontSize:9,color:'#92400e',fontWeight:700}}>3-YEAR ASPIRATION</div>
            <div style={{fontSize:20,fontWeight:900,color:'#92400e'}}>₹570–660 Cr</div>
            <div style={{fontSize:10,color:'#9ca3af'}}>₹180–270 Cr incremental</div>
          </div>
        </div>
        <div style={{textAlign:'center'}}><Btn onClick={()=>setScreen(SCREENS.STORY)}>MEET RAJAN MEHTA →</Btn></div>
      </Card>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // SCREEN: STORY
  // ════════════════════════════════════════════════════════════════════════════
  if (screen === SCREENS.STORY) return (
    <div style={S.page}><ParticlesBg/>
      <Card wide>
        <Header/>
        <div style={{textAlign:'center',marginBottom:16}}>
          <Badge color="146,64,14">THE COMPANY & THE MISSION</Badge>
          <h1 style={{fontSize:22,fontWeight:900,color:'#1a1a2e'}}>Four Decades. One Family. One Reinvention.</h1>
        </div>
        <div style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)',borderRadius:14,padding:18,marginBottom:12,color:'#fff',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-10,right:-10,opacity:0.12}}><ICBLogo size={80} showText={false}/></div>
          <div style={{fontSize:10,fontWeight:800,color:'#f59e0b',letterSpacing:2,marginBottom:8}}>HISTORY</div>
          <p style={{fontSize:12,lineHeight:1.8,color:'#d1d5db',margin:0}}>Founded in 1982 by <strong style={{color:'#f59e0b'}}>Harish Mehta</strong>, an IIT Madras chemical engineer who identified a supply gap in India's nascent tyre industry and built Indira's first furnace reactor in Kurnool on borrowed capital. His son Vikram scaled the business through the 1990s liberalisation wave — adding Cuddalore in 2001 and doubling capacity by 2010.</p>
        </div>
        <div style={{background:'#fffbeb',borderRadius:14,padding:16,marginBottom:12,border:'2px solid #fde68a'}}>
          <div style={{fontSize:10,fontWeight:800,color:'#92400e',letterSpacing:2,marginBottom:8}}>THE LEADER · RAJAN MEHTA, MD (3RD GENERATION)</div>
          <div style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:12,alignItems:'start'}}>
            <div style={{width:50,height:50,borderRadius:14,background:'linear-gradient(135deg,#f59e0b,#92400e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>👨‍💼</div>
            <p style={{fontSize:12,lineHeight:1.8,color:'#374151',margin:0}}>At 34, <strong>Rajan Mehta</strong> (INSEAD MBA, 2016; ex-global chemicals trading) is the youngest MD in Indira's history. He is convinced that AI and digital transformation are existential. He has visited three Industry 4.0 plants in Germany and South Korea, and has told his board: <em>"In five years, every carbon black plant in the world will be AI-optimised. The question is whether ours leads or follows."</em> He is equally clear-eyed that transformation must be executed with discipline — respecting <strong>plant continuity</strong>, <strong>customer grade quality</strong>, and the <strong>trust of Indira's workforce</strong>.</p>
          </div>
        </div>
        <div style={{background:'rgba(220,38,38,0.06)',borderRadius:14,padding:14,marginBottom:12,border:'2px solid rgba(220,38,38,0.2)'}}>
          <div style={{fontSize:10,fontWeight:800,color:'#dc2626',letterSpacing:2,marginBottom:8}}>⚠️ RAJAN'S NON-NEGOTIABLES — READ BEFORE YOU STRATEGISE</div>
          <div style={{fontSize:11,color:'#374151',lineHeight:1.8}}>{RAJAN_CAUTION}</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
          {[{icon:'🎯',t:'Strategic Objectives',d:'Grow EBITDA from ₹390 Cr to ₹570–660 Cr in 3 years. Expand specialty grades to 35% of revenue. 20%+ export share. Vizag plant by 2027.'},{icon:'🌱',t:'ESG Commitments',d:'Carbon neutrality by 2035. Zero LTI by FY25. GRI-aligned sustainability reporting from FY25.'},{icon:'🔬',t:'R&D Vision',d:'In-house R&D centre at Krishnapatnam (FY25) focused on next-gen EV battery-grade carbon black.'},{icon:'🤖',t:'Digital Appetite',d:'Rajan wants AI at enterprise scale — but only where the data foundation is ready and operational risk is managed.'}].map(({icon,t,d})=>(
            <div key={t} style={{background:'#f9fafb',borderRadius:12,padding:14,border:'1px solid #e5e7eb'}}>
              <div style={{fontSize:20,marginBottom:5}}>{icon}</div>
              <div style={{fontWeight:800,fontSize:12,color:'#1a1a2e',marginBottom:4}}>{t}</div>
              <div style={{fontSize:11,color:'#4b5563',lineHeight:1.6}}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{background:'linear-gradient(135deg,rgba(245,158,11,0.1),rgba(146,64,14,0.05))',borderRadius:12,padding:16,marginBottom:16,border:'1px solid rgba(245,158,11,0.3)',textAlign:'center'}}>
          <div style={{fontStyle:'italic',color:'#374151',fontSize:12,lineHeight:1.8,maxWidth:560,margin:'0 auto'}}>"My grandfather built this company with a reactor and a phone. My father scaled it with contracts and relationships. My job is to make it digital, defensible, and worthy of the next 40 years. I need Accenture to help me draw that map — and I need a number I can take to my board."</div>
          <div style={{marginTop:8,fontSize:11,color:'#92400e',fontWeight:800}}>— Rajan Mehta, MD · Indira Carbon Black Ltd.</div>
        </div>
        <div style={{display:'flex',gap:12,justifyContent:'center'}}>
          <Btn secondary onClick={()=>setScreen(SCREENS.CONTEXT)}>← Back</Btn>
          <Btn onClick={()=>setScreen(SCREENS.GUIDELINES)}>VIEW SIMULATION GUIDE →</Btn>
        </div>
      </Card>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // SCREEN: GUIDELINES
  // ════════════════════════════════════════════════════════════════════════════
  if (screen === SCREENS.GUIDELINES) return (
    <div style={S.page}><ParticlesBg/>
      <Card>
        <Header/>
        <div style={{textAlign:'center',marginBottom:18}}>
          <Badge>HOW IT WORKS</Badge>
          <h1 style={{fontSize:20,fontWeight:900,color:'#1a1a2e'}}>Your Consultant Playbook</h1>
        </div>
        {[{n:'1',icon:'🏗️',t:'Select 2 Business Functions',d:'Pick 2 of 7 functional areas — from Manufacturing to Finance — where you believe the highest value lies for Indira.'},{n:'2',icon:'📂',t:'Choose 2 Focus Areas per Function',d:'Within each function, select 2 specific sub-areas. 4 focus areas total.'},{n:'3',icon:'🎯',t:'Select Your Approach for Each Initiative',d:"For each initiative, choose: Process-led (structured & safe), Hybrid (balanced), or AI-led (bold & frontier). Consider Rajan's non-negotiables."},{n:'4',icon:'🚀',t:'Measure the Impact on Indira\'s EBITDA',d:'Submit to see initiative-by-initiative impact, what you could have done differently, and where you rank among peers.'}].map(({n,icon,t,d})=>(
          <div key={n} style={{display:'flex',gap:12,background:'#f9fafb',borderRadius:14,padding:14,marginBottom:10,border:'1px solid #e5e7eb'}}>
            <div style={{width:34,height:34,borderRadius:10,background:'linear-gradient(135deg,#f59e0b,#92400e)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:15,flexShrink:0}}>{n}</div>
            <div>
              <div style={{fontWeight:800,color:'#1a1a2e',fontSize:12,marginBottom:3}}>{icon} {t}</div>
              <div style={{color:'#6b7280',fontSize:11,lineHeight:1.6}}>{d}</div>
            </div>
          </div>
        ))}
        <div style={{textAlign:'center',marginTop:4}}><Btn onClick={()=>setScreen(SCREENS.SELECT_FUNC)}>ENTER THE BOARDROOM →</Btn></div>
      </Card>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // SCREEN: SELECT FUNCTIONS
  // ════════════════════════════════════════════════════════════════════════════
  if (screen === SCREENS.SELECT_FUNC) return (
    <div style={S.page}><ParticlesBg/>
      <Card wide>
        <Header/>
        <div style={{textAlign:'center',marginBottom:16}}>
          <Badge>STEP 1 OF 3</Badge>
          <h1 style={{fontSize:20,fontWeight:900,color:'#1a1a2e'}}>Select 2 Business Functions</h1>
          <p style={{color:'#6b7280',fontSize:12}}>Which areas of Indira's business will you lead the transformation in?</p>
        </div>
        <div style={{textAlign:'center',marginBottom:14}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'#f3f4f6',padding:'7px 16px',borderRadius:20}}>
            <span style={{color:'#f59e0b',fontWeight:900,fontSize:18}}>{funcs.length}</span>
            <span style={{color:'#6b7280',fontSize:12}}>/ 2 selected</span>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:18}}>
          {MASTER_DATA.functions.map(f => {
            const sel = funcs.includes(f.id); const dis = funcs.length>=2 && !sel;
            return (
              <div key={f.id} onClick={()=>{
                if(dis) return;
                let nf;
                if(sel){ nf=funcs.filter(x=>x!==f.id); const ns={...areas}; delete ns[f.id]; setAreas(ns); setFuncCommentary([]); }
                else { nf=[...funcs,f.id]; setAreas({...areas,[f.id]:[]}); }
                setFuncs(nf);
                if(nf.length===2) setFuncCommentary(getFuncCommentary(nf));
              }} style={{background:sel?'rgba(245,158,11,0.1)':'#f9fafb',borderRadius:14,padding:'16px 8px',textAlign:'center',border:sel?'2px solid #f59e0b':'2px solid #e5e7eb',cursor:dis?'not-allowed':'pointer',opacity:dis?0.4:1,position:'relative',transition:'all 0.2s',boxShadow:sel?'0 4px 14px rgba(245,158,11,0.18)':'none'}}
              onMouseEnter={e=>{if(!dis&&!sel){e.currentTarget.style.borderColor='#6366f1';e.currentTarget.style.transform='translateY(-2px)';}}}
              onMouseLeave={e=>{if(!sel){e.currentTarget.style.borderColor='#e5e7eb';e.currentTarget.style.transform='translateY(0)';}}}
              >
                <div style={{fontSize:28,marginBottom:6}}>{funcIcons[f.id]||'📋'}</div>
                <div style={{fontWeight:800,fontSize:10,color:'#1a1a2e',lineHeight:1.4}}>{f.name}</div>
                <div style={{fontSize:9,color:'#9ca3af',marginTop:3}}>{f.subFunctions.length} focus areas</div>
                {sel && <div style={{position:'absolute',top:7,right:7,width:20,height:20,borderRadius:'50%',background:'#f59e0b',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:900}}>✓</div>}
              </div>
            );
          })}
        </div>
        {funcs.length===2 && (
          <div style={{marginBottom:18,animation:'slideIn 0.4s ease'}}>
            {funcs.map((fid,idx)=>{
              const f = MASTER_DATA.functions.find(x=>x.id===fid);
              const cs = FUNC_CURRENT_STATE[fid];
              return (
                <div key={fid} style={{background:'#f9fafb',borderRadius:14,marginBottom:12,border:'2px solid #e5e7eb',overflow:'hidden'}}>
                  <div style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)',padding:'10px 16px',display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:20}}>{cs?.icon}</span>
                    <div style={{fontSize:11,fontWeight:800,color:'#f59e0b',letterSpacing:1}}>{cs?.title||`${f.name} – Current State`}</div>
                  </div>
                  <div style={{padding:'14px 16px'}}>
                    <div style={{fontSize:11,color:'#374151',lineHeight:1.8,whiteSpace:'pre-wrap'}}>{cs?.narrative}</div>
                  </div>
                  <div style={{padding:'0 16px 14px'}}>
                    <div style={{background:'linear-gradient(135deg,rgba(99,102,241,0.07),rgba(139,92,246,0.05))',borderRadius:10,padding:'10px 14px',border:'1px solid rgba(99,102,241,0.15)',display:'flex',gap:10,alignItems:'flex-start'}}>
                      <span style={{fontSize:18,flexShrink:0}}>🧠</span>
                      <div>
                        <div style={{fontSize:9,fontWeight:800,color:'#6366f1',letterSpacing:1,marginBottom:3}}>ACCENTURE CONSULTANT'S READ</div>
                        <div style={{fontSize:11,color:'#374151',lineHeight:1.6,fontStyle:'italic'}}>{funcCommentary[idx]}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{textAlign:'center'}}>
          <Btn onClick={()=>setScreen(SCREENS.SELECT_AREA)} disabled={funcs.length!==2}>CHOOSE FOCUS AREAS →</Btn>
        </div>
      </Card>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // SCREEN: SELECT AREAS
  // ════════════════════════════════════════════════════════════════════════════
  if (screen === SCREENS.SELECT_AREA) return (
    <div style={S.page}><ParticlesBg/>
      <Card wide>
        <Header/>
        <div style={{textAlign:'center',marginBottom:16}}>
          <Badge>STEP 2 OF 3</Badge>
          <h1 style={{fontSize:20,fontWeight:900,color:'#1a1a2e'}}>Select 2 Focus Areas per Function</h1>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginBottom:20}}>
          {funcs.map(fid=>{
            const f = MASTER_DATA.functions.find(x=>x.id===fid);
            const selected = areas[fid]||[];
            return (
              <div key={fid} style={{background:'#f9fafb',borderRadius:14,padding:16,border:'2px solid #e5e7eb'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,paddingBottom:10,borderBottom:'2px solid #e5e7eb'}}>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{fontSize:18}}>{funcIcons[fid]}</span>
                    <div style={{fontWeight:800,color:'#1a1a2e',fontSize:13}}>{f.name}</div>
                  </div>
                  <div style={{background:selected.length===2?'rgba(22,163,74,0.1)':'rgba(99,102,241,0.1)',color:selected.length===2?'#16a34a':'#6366f1',padding:'4px 10px',borderRadius:10,fontSize:11,fontWeight:700}}>{selected.length}/2</div>
                </div>
                {f.subFunctions.map(sf=>{
                  const sel = selected.includes(sf.id); const dis = selected.length>=2&&!sel;
                  return (
                    <div key={sf.id} onClick={()=>{
                      if(dis) return;
                      if(sel) setAreas({...areas,[fid]:selected.filter(x=>x!==sf.id)});
                      else setAreas({...areas,[fid]:[...selected,sf.id]});
                    }} style={{background:sel?'rgba(22,163,74,0.06)':'#fff',borderRadius:10,padding:12,marginBottom:7,border:sel?'2px solid #16a34a':'2px solid #e5e7eb',cursor:dis?'not-allowed':'pointer',opacity:dis?0.4:1,display:'flex',justifyContent:'space-between',alignItems:'center',transition:'all 0.2s'}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:12}}>{sf.name}</div>
                        <div style={{fontSize:10,color:'#9ca3af'}}>{sf.initiatives.length} initiative(s)</div>
                      </div>
                      {sel && <div style={{width:20,height:20,borderRadius:'50%',background:'#16a34a',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:900}}>✓</div>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div style={{display:'flex',gap:12,justifyContent:'center'}}>
          <Btn secondary onClick={()=>setScreen(SCREENS.SELECT_FUNC)}>← Back</Btn>
          <Btn onClick={()=>setScreen(SCREENS.GAME)} disabled={!canProceed()}>SELECT YOUR APPROACH →</Btn>
        </div>
      </Card>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // SCREEN: GAME
  // ════════════════════════════════════════════════════════════════════════════
  if (screen === SCREENS.GAME) {
    const inits = getInits();
    const done = Object.keys(selections).filter(k=>selections[k]).length;
    return (
      <div style={{minHeight:'100vh',background:'#f5f7fa',fontFamily:"'Segoe UI',sans-serif",paddingBottom:100}}>
        <ParticlesBg/>
        {/* Sticky top bar */}
        <div style={{position:'sticky',top:0,background:'rgba(255,255,255,0.96)',backdropFilter:'blur(10px)',padding:'10px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #f3f4f6',zIndex:100,flexWrap:'wrap',gap:10}}>
          <ICBLogo size={32}/>
          <Badge>STEP 3 — BUILD YOUR PORTFOLIO</Badge>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <AccentureLogo/>
            {userName && <span style={{fontSize:12,color:'#6366f1',fontWeight:700}}>👤 {userName}</span>}
          </div>
        </div>
        {/* Progress bar */}
        <div style={{background:'#fff',padding:'8px 18px',borderBottom:'1px solid #f3f4f6',position:'relative',zIndex:1}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
            <span style={{fontSize:11,color:'#4b5563',fontWeight:700}}>Portfolio Progress</span>
            <span style={{fontSize:11,fontWeight:800,color:'#16a34a'}}>{done}/{inits.length} selected</span>
          </div>
          <div style={{height:6,background:'#e5e7eb',borderRadius:4,overflow:'hidden'}}>
            <div style={{height:'100%',background:'linear-gradient(90deg,#f59e0b,#16a34a)',width:`${inits.length>0?(done/inits.length)*100:0}%`,transition:'width 0.3s',borderRadius:4}}/>
          </div>
        </div>

        <div style={{padding:'16px 14px',maxWidth:960,margin:'0 auto',position:'relative',zIndex:1}}>
          {inits.map((i,idx) => {
            const isExp = expandedInit===i.id;
            const sel = selections[i.id];
            const showC = showCommentary===i.id && commentary[i.id];
            return (
              <div key={i.id} style={{background:'#fff',borderRadius:16,padding:18,marginBottom:12,border:`2px solid ${sel?'#fde68a':'#e5e7eb'}`,boxShadow:'0 4px 18px rgba(0,0,0,0.05)',transition:'border-color 0.3s'}}>
                <div style={{display:'flex',gap:10,marginBottom:12,cursor:'pointer'}} onClick={()=>setExpandedInit(isExp?null:i.id)}>
                  <div style={{width:30,height:30,borderRadius:9,background:'linear-gradient(135deg,#f59e0b,#92400e)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:13,flexShrink:0}}>{idx+1}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:9,color:'#9ca3af',fontWeight:600}}>{funcIcons[i.funcId]} {i.func} · {i.subFunc}</div>
                    <div style={{fontSize:13,fontWeight:800,color:'#1a1a2e'}}>{i.name}</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    {sel && <span style={{background:'rgba(22,163,74,0.1)',color:'#16a34a',padding:'3px 9px',borderRadius:8,fontSize:9,fontWeight:800}}>{sel==='processLed'?'⚙️ Process':sel==='hybrid'?'🔄 Hybrid':'🤖 AI-led'}</span>}
                    <span style={{color:'#9ca3af',fontSize:14}}>{isExp?'▲':'▼'}</span>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:9}}>
                  {[{k:'processLed',label:'PROCESS-LED',emoji:'⚙️',color:'#6b7280'},{k:'hybrid',label:'HYBRID',emoji:'🔄',color:'#6366f1'},{k:'aiLed',label:'AI-LED',emoji:'🤖',color:'#8b5cf6'}].map(({k,label,emoji,color})=>{
                    const chosen = sel===k; const d = i.approaches[k];
                    return (
                      <div key={k} onClick={()=>handleApproachSelect(i.id,k)}
                        style={{padding:12,borderRadius:12,cursor:'pointer',position:'relative',background:chosen?'rgba(245,158,11,0.08)':'#f9fafb',border:chosen?'2px solid #f59e0b':'2px solid #e5e7eb',transition:'all 0.2s',boxShadow:chosen?'0 4px 12px rgba(245,158,11,0.18)':'none'}}
                        onMouseEnter={e=>{if(!chosen){e.currentTarget.style.borderColor=color;e.currentTarget.style.transform='translateY(-1px)';}}}
                        onMouseLeave={e=>{if(!chosen){e.currentTarget.style.borderColor='#e5e7eb';e.currentTarget.style.transform='translateY(0)';}}}
                      >
                        <div style={{textAlign:'center',marginBottom:7}}>
                          <div style={{fontSize:22,marginBottom:2}}>{emoji}</div>
                          <div style={{fontSize:9,fontWeight:800,color,letterSpacing:1.5}}>{label}</div>
                        </div>
                        <div style={{fontSize:10,fontWeight:700,color:'#1a1a2e',lineHeight:1.4}}>{d.name}</div>
                        {isExp && (
                          <div style={{marginTop:8,paddingTop:8,borderTop:'1px dashed #e5e7eb'}}>
                            <div style={{fontSize:10,color:'#4b5563',lineHeight:1.6,marginBottom:6}}>{d.description}</div>
                            <div style={{background:'#f3f4f6',padding:'7px 9px',borderRadius:7}}>
                              <div style={{fontSize:9,color:'#374151',fontWeight:600}}>💰 Inv: ₹{(d.year1+d.year2+d.year3).toFixed(1)} Cr · ⚠️ Risk: ₹{d.riskPenalty.toFixed(2)} Cr</div>
                            </div>
                          </div>
                        )}
                        {chosen && <div style={{position:'absolute',top:7,right:7,width:18,height:18,borderRadius:'50%',background:'#f59e0b',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:900}}>✓</div>}
                      </div>
                    );
                  })}
                </div>
                {showC && (
                  <div style={{marginTop:10,background:'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.06))',borderRadius:10,padding:'10px 14px',border:'1px solid rgba(99,102,241,0.2)',animation:'slideIn 0.3s ease',display:'flex',gap:9}}>
                    <span style={{fontSize:18,flexShrink:0}}>🧠</span>
                    <div>
                      <div style={{fontSize:9,fontWeight:800,color:'#6366f1',marginBottom:2,letterSpacing:1}}>ACCENTURE CONSULTANT'S TAKE</div>
                      <div style={{fontSize:11,color:'#374151',lineHeight:1.6,fontStyle:'italic'}}>{commentary[i.id]}</div>
                    </div>
                  </div>
                )}
                {!showC && sel && commentary[i.id] && (
                  <div style={{marginTop:8,background:'#f9fafb',borderRadius:8,padding:'7px 12px',border:'1px solid #e5e7eb',display:'flex',gap:7,alignItems:'center'}}>
                    <span style={{fontSize:13}}>🧠</span>
                    <div style={{fontSize:10,color:'#6b7280',fontStyle:'italic',lineHeight:1.5}}>{commentary[i.id]}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Fixed bottom bar */}
        <div style={{position:'fixed',bottom:0,left:0,right:0,background:'rgba(255,255,255,0.96)',backdropFilter:'blur(10px)',padding:'12px 18px',borderTop:'2px solid #f3f4f6',display:'flex',flexDirection:'column',alignItems:'center',zIndex:100,gap:6}}>
          {submitError && <div style={{color:'#dc2626',fontSize:12,fontWeight:600}}>⚠ {submitError}</div>}
          <Btn green onClick={handleSubmit} disabled={!allSelected()||loading}>
            {loading ? '⏳ Crunching the numbers...' : allSelected() ? '🚀 DELIVER THE RECOMMENDATION' : `Complete all selections (${done}/${inits.length})`}
          </Btn>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SCREEN: RESULTS
  // ════════════════════════════════════════════════════════════════════════════
  if (screen === SCREENS.RESULTS) {
    const inits = getInits();
    const funcIds = [...new Set(inits.map(i=>i.funcId))];
    const altTexts = getPersonalisedAlternatives(inits, selections);
    return (
      <div style={S.page}><ParticlesBg/>
        <Card wide>
          <Header/>
          <div style={{textAlign:'center',marginBottom:16}}>
            <Badge color="22,163,74">✅ PORTFOLIO DELIVERED</Badge>
            <div style={{display:'flex',justifyContent:'center',marginBottom:8}}><ICBLogo size={46}/></div>
            <h1 style={{fontSize:22,fontWeight:900,color:'#1a1a2e'}}>Rajan Has Seen the Numbers</h1>
            <p style={{color:'#6b7280',fontSize:11}}>{userName} · Accenture Consultant · Rank #{rank}</p>
          </div>

          {/* EBITDA banner */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:14,flexWrap:'wrap'}}>
            {[{label:'BASELINE EBITDA',val:`₹${BASELINE_EBITDA} Cr`,sub:'Starting point',c:'#6b7280'},{label:'3-YR EBITDA UPLIFT',val:`+₹${totals.te.toFixed(1)} Cr`,sub:'From your portfolio',c:'#6366f1'},{label:'PROJECTED EBITDA',val:`₹${totals.newE.toFixed(1)} Cr`,sub:`+${totals.pct}% above baseline`,c:'#16a34a',big:true}].map(({label,val,sub,c,big})=>(
              <div key={label} style={{background:big?'rgba(22,163,74,0.08)':'#f9fafb',borderRadius:12,padding:'10px 18px',textAlign:'center',border:`2px solid ${big?'#16a34a':'#e5e7eb'}`}}>
                <div style={{fontSize:9,color:'#9ca3af',fontWeight:700,letterSpacing:1}}>{label}</div>
                <div style={{fontSize:big?24:17,fontWeight:900,color:c,marginTop:2}}>{val}</div>
                <div style={{fontSize:9,color:'#9ca3af'}}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Net Value Score */}
          <div style={{textAlign:'center',marginBottom:16}}>
            <div style={{display:'inline-block',background:'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.08))',borderRadius:14,padding:'12px 32px',border:'2px solid rgba(99,102,241,0.25)'}}>
              <div style={{fontSize:10,color:'#6b7280',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:4}}>Net Value Score</div>
              <div style={{fontSize:30,fontWeight:900,color:totals.score>=0?'#16a34a':'#dc2626'}}>{totals.score.toFixed(1)}</div>
              <div style={{fontSize:10,color:'#9ca3af'}}>EBITDA − Investment − Risk Penalty</div>
            </div>
          </div>

          {/* Initiative stories */}
          <div style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)',borderRadius:14,padding:18,marginBottom:16}}>
            <div style={{fontSize:10,fontWeight:800,color:'#f59e0b',letterSpacing:2,marginBottom:12}}>📖 HOW YOUR PORTFOLIO MOVED INDIRA'S EBITDA</div>
            {inits.map(i=>{
              const a = selections[i.id]; const d = i.approaches[a];
              const inv = d.year1+d.year2+d.year3;
              const narr = getInitNarrative(i.id,a,d.ebitdaYr1,d.ebitdaYr2,d.ebitdaYr3,inv);
              return (
                <div key={i.id} style={{background:'rgba(255,255,255,0.07)',borderRadius:12,padding:'12px 14px',marginBottom:9,borderLeft:'3px solid #f59e0b'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:6,marginBottom:6}}>
                    <div>
                      <div style={{fontSize:9,color:'#9ca3af',fontWeight:600}}>{i.func} · {i.subFunc}</div>
                      <div style={{fontSize:12,fontWeight:800,color:'#fff'}}>{i.name}</div>
                    </div>
                    <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                      <span style={{background:'rgba(245,158,11,0.2)',color:'#f59e0b',padding:'2px 9px',borderRadius:7,fontSize:9,fontWeight:800}}>{a==='processLed'?'⚙️ Process-led':a==='hybrid'?'🔄 Hybrid':'🤖 AI-led'}</span>
                      <span style={{background:'rgba(22,163,74,0.2)',color:'#4ade80',padding:'2px 9px',borderRadius:7,fontSize:9,fontWeight:800}}>EBITDA +₹{(d.ebitdaYr1+d.ebitdaYr2+d.ebitdaYr3).toFixed(1)} Cr</span>
                      <span style={{background:'rgba(220,38,38,0.2)',color:'#fca5a5',padding:'2px 9px',borderRadius:7,fontSize:9,fontWeight:800}}>Inv −₹{inv.toFixed(1)} Cr</span>
                    </div>
                  </div>
                  <div style={{fontSize:11,color:'#d1d5db',lineHeight:1.7}}>{narr}</div>
                </div>
              );
            })}
          </div>

          {/* KPI cards */}
          <div style={{marginBottom:16}}>
            <div style={{fontWeight:800,fontSize:13,color:'#1a1a2e',marginBottom:10}}>📊 Functional KPI Impact on Indira Carbon</div>
            {funcIds.map(fid=>{
              const fname = MASTER_DATA.functions.find(f=>f.id===fid)?.name;
              const kpis = FUNCTION_KPI_IMPACT[fid]?.hybrid;
              if(!kpis) return null;
              return (
                <div key={fid} style={{background:'#f9fafb',borderRadius:12,padding:14,marginBottom:10,border:'1px solid #e5e7eb'}}>
                  <div style={{fontWeight:800,color:'#1a1a2e',fontSize:12,marginBottom:10,display:'flex',alignItems:'center',gap:7}}><span>{funcIcons[fid]}</span>{fname}</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:7}}>
                    {kpis.map(({name,value,icon})=>(
                      <div key={name} style={{background:'#fff',borderRadius:9,padding:'9px 7px',border:'1px solid #e5e7eb',textAlign:'center'}}>
                        <div style={{fontSize:16,marginBottom:3}}>{icon}</div>
                        <div style={{fontSize:9,color:'#6b7280',fontWeight:700,marginBottom:2,lineHeight:1.3}}>{name}</div>
                        <div style={{fontSize:11,fontWeight:900,color:'#16a34a'}}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alternatives */}
          <div style={{background:'#fffbeb',borderRadius:12,padding:16,marginBottom:16,border:'2px solid #fde68a'}}>
            <div style={{fontSize:10,fontWeight:800,color:'#92400e',letterSpacing:2,marginBottom:10}}>🔭 WHAT ELSE COULD HAVE MOVED THE NEEDLE?</div>
            {altTexts.length===0
              ? <div style={{fontSize:11,color:'#6b7280'}}>Your portfolio choices were well-balanced — no obvious missed levers identified.</div>
              : altTexts.map((t,idx)=>(
                <div key={idx} style={{display:'flex',gap:9,marginBottom:idx<altTexts.length-1?9:0,padding:'9px 12px',background:'#fff',borderRadius:9,border:'1px solid #fde68a'}}>
                  <span style={{fontSize:15,flexShrink:0}}>💡</span>
                  <div style={{fontSize:11,color:'#374151',lineHeight:1.7}}>{t}</div>
                </div>
              ))}
          </div>

          {/* Portfolio summary */}
          <div style={{background:'#f9fafb',borderRadius:12,padding:14,marginBottom:16,border:'1px solid #e5e7eb',maxHeight:190,overflowY:'auto'}}>
            <div style={{fontWeight:800,fontSize:12,marginBottom:8}}>📋 Portfolio Summary</div>
            {inits.map(i=>{
              const a=selections[i.id]; const d=i.approaches[a];
              return (
                <div key={i.id} style={{display:'flex',justifyContent:'space-between',padding:'7px 10px',background:'#fff',borderRadius:9,marginBottom:5,border:'1px solid #e5e7eb',flexWrap:'wrap',gap:5,alignItems:'center'}}>
                  <div style={{flex:1,minWidth:130}}>
                    <div style={{fontSize:11,fontWeight:700,color:'#1a1a2e'}}>{i.name}</div>
                    <div style={{fontSize:9,color:'#9ca3af'}}>{i.func} · {i.subFunc}</div>
                  </div>
                  <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                    <span style={{background:'rgba(245,158,11,0.1)',color:'#92400e',padding:'2px 9px',borderRadius:7,fontSize:9,fontWeight:800}}>{a==='processLed'?'⚙️ Process':a==='hybrid'?'🔄 Hybrid':'🤖 AI-led'}</span>
                    <span style={{background:'rgba(22,163,74,0.1)',color:'#16a34a',padding:'2px 9px',borderRadius:7,fontSize:9,fontWeight:800}}>+₹{(d.ebitdaYr1+d.ebitdaYr2+d.ebitdaYr3).toFixed(1)} Cr</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{textAlign:'center'}}>
            <Btn onClick={handleViewLeaderboard}>SEE HOW YOU RANK →</Btn>
          </div>
        </Card>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SCREEN: LEADERBOARD
  // ════════════════════════════════════════════════════════════════════════════
  if (screen === SCREENS.LEADERBOARD) return (
    <div style={S.page}><ParticlesBg/>
      <Card>
        <Header/>
        <div style={{textAlign:'center',marginBottom:18}}>
          <Badge>HALL OF CONSULTANTS</Badge>
          <div style={{fontSize:38,margin:'6px 0'}}>🏆</div>
          <h1 style={{fontSize:20,fontWeight:900,color:'#1a1a2e'}}>Leaderboard</h1>
          <p style={{color:'#6b7280',fontSize:11}}>Net value score: EBITDA − Investment − Risk Penalty</p>
        </div>
        <div style={{marginBottom:18}}>
          <div style={{display:'grid',gridTemplateColumns:'32px 1fr 80px 100px 80px',padding:'7px 12px',background:'#f3f4f6',borderRadius:9,marginBottom:7,fontSize:9,color:'#6b7280',fontWeight:800,textTransform:'uppercase',letterSpacing:1}}>
            <span>#</span><span>Name</span><span>Score</span><span>EBITDA Uplift</span><span>Risk</span>
          </div>
          {leaderboard.length===0
            ? <div style={{textAlign:'center',padding:36,color:'#9ca3af',fontSize:13}}>No submissions yet — be the first!</div>
            : leaderboard.slice(0,15).map((p,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'32px 1fr 80px 100px 80px',padding:'11px 12px',borderRadius:10,marginBottom:5,fontSize:11,alignItems:'center',background:p.userId===userId?'rgba(245,158,11,0.1)':i===0?'rgba(255,215,0,0.1)':i===1?'rgba(192,192,192,0.12)':i===2?'rgba(205,127,50,0.1)':'#f9fafb',border:p.userId===userId?'2px solid #f59e0b':i<3?'1px solid rgba(0,0,0,0.08)':'1px solid #e5e7eb'}}>
                <span style={{fontWeight:800,fontSize:14}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`}</span>
                <span style={{fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {p.name}
                  {p.userId===userId && <span style={{marginLeft:5,fontSize:9,color:'#92400e',background:'rgba(245,158,11,0.15)',padding:'2px 5px',borderRadius:5}}>YOU</span>}
                </span>
                <span style={{color:'#16a34a',fontWeight:800}}>{p.score}</span>
                <span style={{color:'#16a34a',fontWeight:700}}>₹{p.ebitda} Cr</span>
                <span style={{color:'#dc2626',fontWeight:700}}>₹{p.risk} Cr</span>
              </div>
            ))
          }
        </div>

        {/* Closing card */}
        <div style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)',borderRadius:14,padding:22,textAlign:'center',marginBottom:18}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:10}}><ICBLogo size={42}/></div>
          <div style={{display:'flex',justifyContent:'center',marginBottom:12}}><AccentureLogo dark/></div>
          <div style={{fontWeight:900,fontSize:17,color:'#fff',marginBottom:9}}>You Proved Your Mettle as a Reinventor.</div>
          <div style={{fontSize:12,color:'#d1d5db',lineHeight:1.8,maxWidth:420,margin:'0 auto'}}>
            You walked into Rajan Mehta's boardroom, absorbed the complexity of a 40-year-old business at a crossroads, balanced ambition against operational reality, and delivered a transformation portfolio that a real Steering Committee could act on.
            <br/><br/>
            <span style={{color:'#f59e0b',fontWeight:700}}>We are Reinventors. And today, so were you.</span>
          </div>
          <div style={{marginTop:10,fontSize:10,color:'#9ca3af'}}>Share your score · Challenge a colleague · Try a different portfolio</div>
        </div>
        <div style={{display:'flex',gap:12,justifyContent:'center'}}>
          <Btn secondary onClick={()=>setScreen(SCREENS.RESULTS)}>← Results</Btn>
          <Btn onClick={reset}>🔄 Play Again</Btn>
        </div>
      </Card>
    </div>
  );

  return null;
}

const S = {
  page: {
    minHeight:'100vh',
    background:'linear-gradient(135deg,#f5f7fa,#e8eaf0)',
    display:'flex', alignItems:'center', justifyContent:'center',
    padding:20, fontFamily:"'Segoe UI',sans-serif", position:'relative',
  },
};
