import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  // Import ONLY tables and relations confirmed to exist and be exported
  // Core
  aiModelsTable,
  usersTable,
  ideasTable,
  ideaNotesTable,
  ideaVotesTable,
  conversationsTable,
  messagesTable,
  // Roles
  rolesTable,
  userRolesTable,
  roleToolsTable,
  // Assistant Architect
  assistantArchitectsTable,
  toolInputFieldsTable,
  chainPromptsTable,
  toolExecutionsTable,
  promptResultsTable,
  // toolEditsTable, // Assuming toolEdits doesn't exist or relations aren't defined
  // Tools
  toolsTable,
  // Communication
  communicationSettingsTable,
  audiencesTable,
  accessControlTable,
  // Communication Analysis
  analysisPromptsTable,
  analysisResultsTable,
  audienceConfigsTable,
  // Meta Prompting
  metaPromptingTechniquesTable,
  metaPromptingTemplatesTable,
  // Navigation
  navigationItemsTable,

  // RELATIONS
  aiModelsRelations,
  conversationsRelations,
  messagesRelations,
  rolesRelations,
  userRolesRelations,
  roleToolsRelations,
  assistantArchitectsRelations,
  toolInputFieldsRelations,
  chainPromptsRelations,
  toolExecutionsRelations,
  promptResultsRelations,
  // toolEditsRelations, // Removed
  toolsRelations,
  audiencesRelations,
  navigationItemsRelations,
} from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);

// Define the schema object using ONLY the successfully imported items
const schema = {
  // Core
  aiModels: aiModelsTable,
  users: usersTable,
  ideas: ideasTable,
  ideaNotes: ideaNotesTable,
  ideaVotes: ideaVotesTable,
  conversations: conversationsTable,
  messages: messagesTable,
  // Roles
  roles: rolesTable,
  userRoles: userRolesTable,
  roleTools: roleToolsTable,
  // Assistant Architect
  assistantArchitects: assistantArchitectsTable,
  toolInputFields: toolInputFieldsTable,
  chainPrompts: chainPromptsTable,
  toolExecutions: toolExecutionsTable,
  promptResults: promptResultsTable,
  // toolEdits: toolEditsTable,
  // Tools
  tools: toolsTable,
  // Communication
  communicationSettings: communicationSettingsTable,
  audiences: audiencesTable,
  accessControl: accessControlTable,
   // Communication Analysis
  analysisPrompts: analysisPromptsTable,
  analysisResults: analysisResultsTable,
  audienceConfigs: audienceConfigsTable,
  // Meta Prompting
  metaPromptingTechniques: metaPromptingTechniquesTable,
  metaPromptingTemplates: metaPromptingTemplatesTable,
  // Navigation
  navigationItems: navigationItemsTable,
  
  // RELATIONS 
  aiModelsRelations,
  conversationsRelations,
  messagesRelations,
  rolesRelations,
  userRolesRelations,
  roleToolsRelations,
  assistantArchitectsRelations,
  toolInputFieldsRelations,
  chainPromptsRelations,
  toolExecutionsRelations,
  promptResultsRelations,
  // toolEditsRelations,
  toolsRelations,
  audiencesRelations,
  navigationItemsRelations,
};

export const db = drizzle(client, { schema }); 