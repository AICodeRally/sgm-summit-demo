#!/usr/bin/env tsx

/**
 * Policy Markdown to JSON Converter
 *
 * Converts SCP policy markdown files to structured JSON format.
 * Eliminates markdown artifacts and enables structured queries.
 *
 * Usage: npx tsx scripts/convert-policies-to-json.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const POLICIES_DIR = path.join(__dirname, '..', 'lib', 'data', 'policies');

interface PolicyMetadata {
  code: string;
  name: string;
  category: string;
  frameworkArea: string;
  status: string;
  legalReviewRequired: boolean;
}

/**
 * Extract metadata from markdown header
 */
function extractMetadata(markdown: string): PolicyMetadata {
  const lines = markdown.split('\n');

  let code = '';
  let name = '';
  let category = '';
  let frameworkArea = '';
  let status = 'DRAFT';
  let legalReviewRequired = false;

  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i];

    if (line.startsWith('# ') && !name) {
      name = line.replace(/^# /, '').trim();
    }

    if (line.includes('**Policy Code:**')) {
      code = line.split('**Policy Code:**')[1].trim();
    }

    if (line.includes('**Category:**')) {
      category = line.split('**Category:**')[1].trim();
    }

    if (line.includes('**Framework Area:**')) {
      frameworkArea = line.split('**Framework Area:**')[1].trim();
    }

    if (line.includes('**Status:**')) {
      status = line.split('**Status:**')[1].trim();
    }

    if (line.includes('**Legal Review Required:**')) {
      const value = line.split('**Legal Review Required:**')[1].trim().toLowerCase();
      legalReviewRequired = value === 'yes';
    }
  }

  return { code, name, category, frameworkArea, status, legalReviewRequired };
}

/**
 * Extract purpose section
 */
function extractPurpose(markdown: string): { summary: string; objectives: string[] } {
  const purposeMatch = markdown.match(/# 1\. Purpose\s+([\s\S]*?)(?=# 2\.|$)/);

  if (!purposeMatch) {
    return { summary: '', objectives: [] };
  }

  const purposeText = purposeMatch[1].trim();

  // First sentence/paragraph is summary
  const summary = purposeText.split('\n')[0].trim();

  // Extract bullet points as objectives if present
  const objectives: string[] = [];
  const bulletMatch = purposeText.match(/•\s+(.+)/g);
  if (bulletMatch) {
    bulletMatch.forEach((bullet) => {
      objectives.push(bullet.replace(/^•\s+/, '').trim());
    });
  }

  return { summary, objectives };
}

/**
 * Extract scope section
 */
function extractScope(markdown: string): { appliesTo: string[]; exclusions: string[]; geographic: string[] } {
  const scopeMatch = markdown.match(/# 2\. Scope\s+([\s\S]*?)(?=# 3\.|$)/);

  if (!scopeMatch) {
    return { appliesTo: [], exclusions: [], geographic: [] };
  }

  const scopeText = scopeMatch[1].trim();

  const appliesTo: string[] = [];
  const bulletMatch = scopeText.match(/•\s+(.+)/g);
  if (bulletMatch) {
    bulletMatch.forEach((bullet) => {
      appliesTo.push(bullet.replace(/^•\s+/, '').trim());
    });
  }

  return { appliesTo, exclusions: [], geographic: [] };
}

/**
 * Extract definitions section
 */
function extractDefinitions(markdown: string): Array<{ term: string; definition: string; examples: string[] }> {
  const definitionsMatch = markdown.match(/# 3\. Definitions\s+([\s\S]*?)(?=# 4\.|$)/);

  if (!definitionsMatch) {
    return [];
  }

  const definitionsText = definitionsMatch[1].trim();
  const definitions: Array<{ term: string; definition: string; examples: string[] }> = [];

  // Split by term pattern
  const termPattern = /^([A-Z][a-zA-Z\s/()]+):/gm;
  const matches = [...definitionsText.matchAll(termPattern)];

  matches.forEach((match, index) => {
    const term = match[1].trim();
    const startPos = match.index! + match[0].length;
    const endPos = index < matches.length - 1 ? matches[index + 1].index! : definitionsText.length;
    const definition = definitionsText.substring(startPos, endPos).trim();

    definitions.push({
      term,
      definition,
      examples: [],
    });
  });

  return definitions;
}

/**
 * Extract keywords for compliance
 */
function extractKeywords(metadata: PolicyMetadata): string[] {
  const keywords: string[] = [];

  // Generate keywords from policy name and framework area
  const name = metadata.name.toLowerCase();
  keywords.push(name);

  const words = name.split(/\s+/);
  words.forEach((word) => {
    if (word.length > 4) {
      keywords.push(word);
    }
  });

  const frameworkWords = metadata.frameworkArea.toLowerCase().split(/\s+/);
  frameworkWords.forEach((word) => {
    if (word.length > 4 && !keywords.includes(word)) {
      keywords.push(word);
    }
  });

  return keywords;
}

/**
 * Convert a single policy markdown file to JSON
 */
function convertPolicyToJSON(mdFilePath: string): void {
  const markdown = fs.readFileSync(mdFilePath, 'utf-8');
  const filename = path.basename(mdFilePath, '.md');

  // Skip if not a numbered SCP policy
  if (!filename.match(/^SCP-\d{3}$/)) {
    console.log(`Skipping ${filename} (not a numbered SCP policy)`);
    return;
  }

  console.log(`Converting ${filename}...`);

  const metadata = extractMetadata(markdown);

  if (!metadata.code || !metadata.name) {
    console.log(`  ⚠️  Missing metadata in ${filename}, skipping`);
    return;
  }

  const purpose = extractPurpose(markdown);
  const scope = extractScope(markdown);
  const definitions = extractDefinitions(markdown);
  const keywords = extractKeywords(metadata);

  // For now, create basic provisions structure
  // More detailed extraction can be added later
  const provisions: any[] = [
    {
      id: 'prov-001',
      title: 'Policy Requirements',
      content: 'See full policy document for detailed provisions.',
      priority: 'HIGH',
      subProvisions: [],
      tables: [],
    },
  ];

  // Determine related policies from framework area
  const relatedPolicies: string[] = [];
  if (markdown.includes('SCP-')) {
    const scpMatches = markdown.match(/SCP-\d{3}/g);
    if (scpMatches) {
      scpMatches.forEach((code) => {
        if (code !== metadata.code && !relatedPolicies.includes(code)) {
          relatedPolicies.push(code);
        }
      });
    }
  }

  const policyJSON = {
    code: metadata.code,
    name: metadata.name,
    category: metadata.category || 'Governance',
    frameworkArea: metadata.frameworkArea || 'General',
    status: metadata.status,
    version: '0.1.0',
    effectiveDate: '2024-01-01T00:00:00Z',
    legalReviewRequired: metadata.legalReviewRequired,

    purpose: {
      summary: purpose.summary || `Policy governing ${metadata.frameworkArea.toLowerCase()}.`,
      objectives: purpose.objectives.length > 0 ? purpose.objectives : [
        `Establish framework for ${metadata.frameworkArea.toLowerCase()}`,
        'Ensure compliance and consistency',
        'Provide clear governance structure',
      ],
    },

    scope: {
      appliesTo: scope.appliesTo.length > 0 ? scope.appliesTo : [
        'All applicable roles and divisions',
      ],
      exclusions: scope.exclusions,
      geographic: scope.geographic,
    },

    definitions: definitions.length > 0 ? definitions : [],

    provisions: provisions,

    compliance: {
      federalLaws: [],
      stateLaws: [],
      industryStandards: [],
      keywords: keywords,
    },

    relatedPolicies: relatedPolicies,

    metadata: {
      createdAt: '2025-11-01T00:00:00Z',
      updatedAt: '2025-11-01T00:00:00Z',
      createdBy: 'policy-team',
      approvedBy: 'Pending Legal & Executive Review',
      sourceFile: `lib/data/policies/${filename}.md`,
      wordCount: markdown.split(/\s+/).length,
      changeLog: [
        {
          version: '0.1.0',
          date: '2025-11-01',
          author: 'Sales Compensation Governance Committee',
          description: 'Initial draft created from Gap Analysis requirements',
        },
      ],
    },
  };

  // Write JSON file
  const jsonFilePath = mdFilePath.replace('.md', '.json');
  fs.writeFileSync(jsonFilePath, JSON.stringify(policyJSON, null, 2), 'utf-8');

  console.log(`  ✅ Converted to ${path.basename(jsonFilePath)}`);
}

/**
 * Main conversion function
 */
function main() {
  console.log('🔄 Converting policy markdown files to JSON...\n');

  const files = fs.readdirSync(POLICIES_DIR);
  const mdFiles = files.filter((f) => f.endsWith('.md') && f.match(/^SCP-\d{3}\.md$/));

  console.log(`Found ${mdFiles.length} SCP policy files\n`);

  let converted = 0;
  let skipped = 0;

  mdFiles.forEach((file) => {
    const filePath = path.join(POLICIES_DIR, file);

    try {
      // Skip if JSON already exists and is newer
      const jsonPath = filePath.replace('.md', '.json');
      if (fs.existsSync(jsonPath)) {
        const mdStats = fs.statSync(filePath);
        const jsonStats = fs.statSync(jsonPath);

        if (jsonStats.mtime > mdStats.mtime) {
          console.log(`Skipping ${file} (JSON is up to date)`);
          skipped++;
          return;
        }
      }

      convertPolicyToJSON(filePath);
      converted++;
    } catch (error) {
      console.error(`  ❌ Error converting ${file}:`, error);
    }
  });

  console.log(`\n✅ Conversion complete!`);
  console.log(`   Converted: ${converted}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${mdFiles.length}`);
}

main();
