import {
  usersTable,
  ideasTable,
  ideaNotesTable,
  ideaVotesTable,
  aiModelsTable,
  conversationsTable,
  messagesTable
} from "@/db/schema"

export type Role = 'student' | 'staff' | 'administrator'

// Core Types
export type InsertUser = typeof usersTable.$inferInsert
export type SelectUser = typeof usersTable.$inferSelect

export type InsertIdea = typeof ideasTable.$inferInsert
export type SelectIdea = typeof ideasTable.$inferSelect

export type InsertIdeaNote = typeof ideaNotesTable.$inferInsert
export type SelectIdeaNote = typeof ideaNotesTable.$inferSelect

export type InsertIdeaVote = typeof ideaVotesTable.$inferInsert
export type SelectIdeaVote = typeof ideaVotesTable.$inferSelect

export type InsertAiModel = typeof aiModelsTable.$inferInsert
export type SelectAiModel = typeof aiModelsTable.$inferSelect

export type InsertConversation = typeof conversationsTable.$inferInsert
export type SelectConversation = typeof conversationsTable.$inferSelect

export type InsertMessage = typeof messagesTable.$inferInsert
export type SelectMessage = typeof messagesTable.$inferSelect

// Re-export all types from db/schema
export * from '@/db/schema';

// Add any additional types that aren't from the schema here 