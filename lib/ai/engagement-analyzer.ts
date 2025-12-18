/**
 * Engagement Analyzer - AI Integration for SPM Engagement Workbench
 *
 * Analyzes scoping documents and SOWs to:
 * 1. Generate alignment analysis between scoping and SOW
 * 2. Assess technical feasibility and client value alignment
 * 3. Generate AI-recommended requirements based on scope
 * 4. Identify risks and mitigation strategies
 * 5. Create implementation strategy
 */

import type {
  ScopingDocument,
  StatementOfWork,
  AIAnalysis,
  AlignmentAnalysis,
  AiGeneratedRequirement,
  IdentifiedRisk,
  ImplementationStrategy,
} from "@/lib/types/engagement-workbench";

/**
 * Analyzes scoping document and SOW to generate comprehensive AI analysis
 * In production, this would call Claude API for AI-powered analysis
 */
export async function analyzeEngagementAlignment(
  scoping: ScopingDocument,
  sow: StatementOfWork,
  engagementType: string
): Promise<AIAnalysis> {
  // Simulate AI analysis generation
  // In production, this would call Claude API with the documents

  const alignmentAnalysis = generateAlignmentAnalysis(scoping, sow);
  const requirements = generateRequirements(scoping, sow, engagementType);
  const risks = identifyRisks(scoping, sow);
  const recommendations = generateRecommendations(scoping, sow);
  const strategy = createImplementationStrategy(scoping, sow);

  return {
    id: `analysis-${Date.now()}`,
    engagementId: scoping.engagementId,
    scopingId: scoping.id,
    sowId: sow.id,
    alignment: alignmentAnalysis,
    requirements,
    risks,
    recommendations,
    strategy,
    status: "complete",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Analyzes alignment between scoping document and SOW
 */
function generateAlignmentAnalysis(
  scoping: ScopingDocument,
  sow: StatementOfWork
): AlignmentAnalysis {
  // Score scoping-SOW alignment (0-100)
  const scopingSowScore = Math.max(
    Math.min(100, 75 + Math.random() * 20),
    60
  );

  const sowDeliverables = sow.deliverables.length;
  const scopingConstraints = scoping.constraints.length;

  return {
    scopingSowAlignment: {
      score: Math.round(scopingSowScore),
      issues: scopingConstraints > 3
        ? ["High number of constraints may impact timeline", "Budget constraints may limit scope"]
        : [],
      suggestions: [
        "Ensure all success criteria are linked to measurable deliverables",
        "Document assumptions about team availability and skills",
        "Create detailed milestone calendar aligned with business calendar",
      ],
    },
    clientValueAlignment: {
      score: Math.round(80 + Math.random() * 15),
      alignment: `SOW deliverables are ${sowDeliverables >= 5 ? "comprehensive" : "focused"} and aligned with stated business context. Success criteria are ${
        scoping.successCriteria.length >= 3 ? "well-defined" : "need refinement"
      }.`,
      gaps: scopingConstraints > 0
        ? ["Timeline constraints may limit customization", "Budget constraints may require phased approach"]
        : [],
    },
    technicalFeasibility: {
      score: Math.round(75 + Math.random() * 20),
      feasible: true,
      challenges: [
        "Integration complexity with existing systems",
        "Data migration scope and validation",
        "User adoption and training requirements",
      ],
    },
    timelineRisk: {
      score: Math.round(Math.random() * 40),
      risks: sow.timeline.endDate
        ? [
            `Timeline of ${calculateDays(sow.timeline.startDate, sow.timeline.endDate)} days may be aggressive`,
            "Resource availability during peak season may be limited",
            "Holiday periods could impact delivery schedule",
          ]
        : [],
      recommendations: [
        "Build in 10-15% buffer for unforeseen delays",
        "Establish weekly checkpoint calls with stakeholders",
        "Define escalation path for timeline risks",
      ],
    },
    budgetRisk: {
      score: Math.round(Math.random() * 30),
      costAnalysis: `Estimated effort of ${sow.resources.estimatedEffort} hours with team size of ${sow.resources.team.length} resources. Budget appears ${
        sow.budget.totalAmount > sow.resources.estimatedEffort * 150 ? "adequate" : "tight"
      }.`,
      recommendations: [
        "Establish change request process with budget impact analysis",
        "Track actuals against budget monthly",
        "Hold 10-15% contingency reserve",
      ],
    },
  };
}

/**
 * Generates AI-recommended requirements based on scoping and SOW
 */
function generateRequirements(
  scoping: ScopingDocument,
  sow: StatementOfWork,
  engagementType: string
): AiGeneratedRequirement[] {
  const requirements: AiGeneratedRequirement[] = [];

  // Functional requirements based on pain points
  scoping.painPoints.forEach((painPoint, idx) => {
    requirements.push({
      id: `req-func-${idx}`,
      category: "functional",
      name: `Address: ${painPoint.substring(0, 50)}`,
      description: `Implement solution to resolve: ${painPoint}`,
      priority: idx === 0 ? "critical" : idx === 1 ? "high" : "medium",
      rationale: `Directly addresses stated pain point from scoping`,
      acceptanceCriteria: [
        `Pain point is measurably reduced`,
        `Solution meets defined acceptance criteria`,
        `Users report improvement in workflow`,
      ],
      estimatedEffort: 40 + Math.random() * 80,
      tracedFrom: `Scoping pain point: ${painPoint.substring(0, 30)}`,
    });
  });

  // Non-functional requirements (always important)
  const nfRequirements: Record<string, Omit<AiGeneratedRequirement, "id">> = {
    performance: {
      category: "non-functional",
      name: "System Performance & Scalability",
      description:
        "System must handle current and projected user load with acceptable response times",
      priority: "high",
      rationale: "Critical for user adoption and operational efficiency",
      acceptanceCriteria: [
        "Page load time < 2 seconds",
        "Support 2x current user load",
        "Database queries < 100ms",
      ],
      estimatedEffort: 60,
      tracedFrom: "Standard non-functional requirement for all engagements",
    },
    security: {
      category: "non-functional",
      name: "Security & Data Protection",
      description: "Implement appropriate security controls and data protection measures",
      priority: "critical",
      rationale: "Essential for compliance and customer trust",
      acceptanceCriteria: [
        "Data encrypted at rest and in transit",
        "Role-based access control implemented",
        "Security audit completed",
      ],
      estimatedEffort: 80,
      tracedFrom: "Standard security requirements for all engagements",
    },
    usability: {
      category: "non-functional",
      name: "User Experience & Adoption",
      description: "Ensure system is intuitive and supports user adoption",
      priority: "high",
      rationale: "Directly impacts project success metrics",
      acceptanceCriteria: [
        "User training completed",
        "80% user adoption within 30 days",
        "Support ticket volume within acceptable range",
      ],
      estimatedEffort: 40,
      tracedFrom: "Standard UX requirements for all engagements",
    },
  };

  Object.entries(nfRequirements).forEach(([key, req], idx) => {
    requirements.push({
      id: `req-nf-${idx}`,
      ...req,
    });
  });

  // Integration requirements based on stated needs
  sow.resources.skillsRequired.forEach((skill, idx) => {
    requirements.push({
      id: `req-int-${idx}`,
      category: "integration",
      name: `Integration: ${skill}`,
      description: `Integrate with or implement capability for ${skill}`,
      priority: idx === 0 ? "high" : "medium",
      rationale: `Listed as required skill in SOW`,
      acceptanceCriteria: [
        `${skill} capability fully functional`,
        "Test cases covering all scenarios passed",
        "Documentation and training completed",
      ],
      estimatedEffort: 50 + Math.random() * 60,
      tracedFrom: `SOW requirement: ${skill}`,
    });
  });

  // Compliance requirements (if mentioned)
  const complianceKeywords = ["compliance", "regulatory", "audit", "governance"];
  const hasComplianceNeeds = scoping.constraints.some((c) =>
    complianceKeywords.some((k) => c.toLowerCase().includes(k))
  );

  if (hasComplianceNeeds) {
    requirements.push({
      id: "req-comp-1",
      category: "compliance",
      name: "Compliance Framework Implementation",
      description: "Implement controls to meet compliance and regulatory requirements",
      priority: "critical",
      rationale: "Explicitly mentioned in project constraints",
      acceptanceCriteria: [
        "Compliance audit completed",
        "All control gaps remediated",
        "Documentation prepared for audit",
      ],
      estimatedEffort: 100,
      tracedFrom: "Compliance constraint in scoping document",
    });
  }

  return requirements;
}

/**
 * Identifies risks based on scoping and SOW
 */
function identifyRisks(
  scoping: ScopingDocument,
  sow: StatementOfWork
): IdentifiedRisk[] {
  const risks: IdentifiedRisk[] = [];
  const daysAvailable = calculateDays(sow.timeline.startDate, sow.timeline.endDate);
  const totalEffort = sow.resources.estimatedEffort;
  const resourceCount = sow.resources.team.length;
  const effortPerResource = totalEffort / resourceCount;

  // Timeline risk
  if (daysAvailable < 30) {
    risks.push({
      id: "risk-timeline-1",
      title: "Aggressive Timeline",
      description: `Only ${daysAvailable} days available for ${totalEffort} hours of work`,
      severity: "high",
      probability: "likely",
      impact: "May require overtime or additional resources, impacting budget and team morale",
      mitigation: "Negotiate extended timeline or reduce scope",
      owner: "Project Manager",
    });
  }

  // Resource availability risk
  if (resourceCount < 2) {
    risks.push({
      id: "risk-resource-1",
      title: "Single Point of Failure",
      description: "Limited number of resources assigned to project",
      severity: "high",
      probability: "possible",
      impact: "Illness or departure of key resource could delay project",
      mitigation: "Cross-train backup resources, document knowledge",
      owner: "Resource Manager",
    });
  }

  // Budget risk
  const budgetRatio = sow.budget.totalAmount / totalEffort;
  if (budgetRatio < 100) {
    risks.push({
      id: "risk-budget-1",
      title: "Budget Constraint",
      description: `Budget of $${sow.budget.totalAmount} for ${totalEffort} hours is below market rate`,
      severity: "medium",
      probability: "likely",
      impact: "May limit quality, timeline, or resource quality",
      mitigation: "Negotiate budget increase or reduce scope",
      owner: "Finance",
    });
  }

  // Scope risk if many pain points
  if (scoping.painPoints.length > 5) {
    risks.push({
      id: "risk-scope-1",
      title: "Scope Creep Risk",
      description: `${scoping.painPoints.length} pain points identified - high risk of scope expansion`,
      severity: "high",
      probability: "likely",
      impact: "Project could exceed timeline and budget",
      mitigation: "Establish formal change control process with stakeholder sign-off",
      owner: "Project Manager",
    });
  }

  // Stakeholder alignment risk
  if (scoping.stakeholders.length === 0) {
    risks.push({
      id: "risk-stakeholder-1",
      title: "Stakeholder Clarity",
      description: "No stakeholders identified in scoping document",
      severity: "medium",
      probability: "likely",
      impact: "May result in misaligned expectations and project delays",
      mitigation: "Identify and engage all key stakeholders immediately",
      owner: "Account Manager",
    });
  }

  return risks;
}

/**
 * Generates AI-recommended recommendations
 */
function generateRecommendations(
  scoping: ScopingDocument,
  sow: StatementOfWork
): string[] {
  const recommendations: string[] = [];

  recommendations.push("Establish weekly steering committee meetings with all stakeholders");
  recommendations.push("Document all assumptions and decisions in shared RACI matrix");
  recommendations.push("Create detailed project charter with clear success criteria");
  recommendations.push("Implement daily standup meetings with core team");

  if (scoping.painPoints.length > 3) {
    recommendations.push(
      "Consider phased approach to address pain points incrementally"
    );
  }

  if (sow.resources.team.length > 3) {
    recommendations.push("Establish clear roles and responsibilities for team members");
    recommendations.push("Implement formal communication plan across distributed team");
  }

  if (sow.deliverables.length > 5) {
    recommendations.push(
      "Use Agile methodology with 2-week sprints for better progress visibility"
    );
  }

  recommendations.push(
    "Build in 2-week buffer before go-live for final testing and adjustments"
  );
  recommendations.push(
    "Plan user training 2 weeks before go-live, not during go-live"
  );

  return recommendations;
}

/**
 * Creates implementation strategy
 */
function createImplementationStrategy(
  scoping: ScopingDocument,
  sow: StatementOfWork
): ImplementationStrategy {
  const daysAvailable = calculateDays(sow.timeline.startDate, sow.timeline.endDate);
  const phaseCount = Math.ceil(sow.deliverables.length / 3);

  const phases: string[] = [];
  if (phaseCount >= 1) phases.push("Phase 1: Requirements & Design (20% of timeline)");
  if (phaseCount >= 2) phases.push("Phase 2: Development & Integration (50% of timeline)");
  if (phaseCount >= 3) phases.push("Phase 3: Testing & Optimization (20% of timeline)");
  phases.push("Phase 4: Deployment & Support (10% of timeline)");

  return {
    approach:
      "Phased implementation with iterative delivery of features, enabling early feedback and risk mitigation.",
    phases,
    criticalSuccessFactors: [
      "Executive sponsorship and clear governance",
      "Qualified and dedicated project team",
      "Strong vendor partnership and communication",
      "Comprehensive change management program",
      "Realistic timeline with built-in contingency",
      "Clear success metrics and KPIs",
    ],
    dependencies: [
      "Timely decisions from steering committee",
      "Resource availability as committed",
      "Access to required systems and data",
      "Third-party integrations delivered on schedule",
    ],
    assumptions: [
      "Stakeholders will be available for required meetings and decisions",
      "Resource allocation will remain consistent throughout project",
      "Existing systems will remain stable during implementation",
      "Business processes will not significantly change during project",
    ],
    constraints: scoping.constraints,
  };
}

/**
 * Helper function to calculate days between two dates
 */
function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Generates requirements from AI analysis
 * In production, this would integrate with Claude API for true AI-powered analysis
 */
export async function generateRequirementsFromAnalysis(
  analysis: AIAnalysis,
  scopingDocument: ScopingDocument
) {
  // This would be called to generate detailed requirements spec from AI analysis
  // For now, return the AI-generated requirements
  return analysis.requirements;
}

/**
 * Generates design recommendations from requirements
 */
export async function generateDesignRecommendations(requirements: AiGeneratedRequirement[]) {
  // This would be called to generate design recommendations from requirements
  // In production, would use Claude API with requirements as context
  return {
    recommendations: requirements.map((req) => ({
      requirement: req.name,
      designApproach: `Implement ${req.category} requirement: ${req.name}`,
      technologies: ["Based on client environment"],
      riskLevel: "Standard",
    })),
  };
}

/**
 * Generates test strategy from requirements
 */
export async function generateTestStrategy(requirements: AiGeneratedRequirement[]) {
  // This would be called to generate test strategy from requirements
  // In production, would use Claude API
  return {
    testApproach: "Comprehensive testing including unit, integration, and user acceptance testing",
    estimatedTestHours: requirements.reduce((sum, req) => sum + req.estimatedEffort * 0.4, 0),
    testScenarios: requirements.map((req) => ({
      requirement: req.name,
      scenario: `Verify ${req.name} meets all acceptance criteria`,
      priority: req.priority,
    })),
  };
}
