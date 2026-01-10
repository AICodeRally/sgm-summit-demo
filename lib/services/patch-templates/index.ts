/**
 * Patch Templates Module
 *
 * Loads and applies patch templates for governance gap remediation.
 */

export {
  PatchTemplateLoader,
  getPatchTemplateLoader,
  loadPatchTemplate,
  getPatchForRequirement,
  getStateNotes,
} from './patch-loader';

export type {
  PatchTemplate,
  PatchEntry,
  PatchLanguage,
  Placeholder,
  ValidationRule,
  PatchTemplateIndex,
  IndexEntry,
} from './patch-loader';

export {
  PatchApplicator,
  getPatchApplicator,
  applyPatch,
  previewPatch,
} from './patch-applicator';

export type {
  PatchApplicationOptions,
  AppliedPatch,
} from './patch-applicator';
