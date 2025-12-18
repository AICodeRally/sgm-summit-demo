import type { BlockManifest } from "@rally/blocks-ai";
import type { RagDomain } from "@rally/ai-contracts";

export const aiManifest: BlockManifest = {
  blocks: {
    orgChief: { enabled: true, slot: "global.overlay.bottomLeft" },
    askItem: { enabled: true, slot: "global.overlay.bottomRight" },
    glowBar: { enabled: true, slot: "global.overlay.bottomCenter" },
  },
};

export const enabledRagDomains: RagDomain[] = ["spm_plans", "governance", "interviews", "frameworks"];

export const aiConfig = {
  telemetryBufferCapacity: 100,
  signalBusCapacity: 50,
  ragDomainsEnabled: enabledRagDomains,
};
