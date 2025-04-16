"use server"

import { redirect } from "next/navigation"
import { getAssistantArchitectAction } from "@/actions/db/assistant-architect-actions"
import { AssistantArchitectExecution } from "@/components/features/assistant-architect/assistant-architect-execution"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import { auth } from "@clerk/nextjs/server"
import { hasToolAccess } from "@/utils/roles"
import { AssistantArchitectWithRelations } from "@/types"

/**
 * Public route for executing approved Assistant Architect tools.
 * This is the route that users will access through the navigation menu.
 * 
 * The route will:
 * 1. Only show approved tools (404 for non-approved tools)
 * 2. Show a simplified interface focused on execution
 * 3. Remove administrative functions
 * 
 * URL Pattern: /tools/assistant-architect/{id}
 * where {id} is the UUID of the Assistant Architect tool
 */

interface AssistantArchitectToolPageProps {
  params: { id: string }
}

export default async function AssistantArchitectToolPage({
  params
}: AssistantArchitectToolPageProps) {
  // Properly await params
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")
  
  // Check if user has access to the assistant-architect tool
  const hasAccess = await hasToolAccess(userId, "assistant-architect")
  if (!hasAccess) redirect("/dashboard")
  
  const result = await getAssistantArchitectAction(id)
  
  if (
    !result.isSuccess ||
    !result.data ||
    result.data.status !== "approved"
  ) {
    return (
      <div className="container mx-auto py-12">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Assistant Architect not found, not approved, or you do not have access.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const tool = result.data as AssistantArchitectWithRelations

  return (
    <div className="container py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{tool.name}</CardTitle>
          {tool.description && <CardDescription className="pt-2">{tool.description}</CardDescription>}
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Execute Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <AssistantArchitectExecution tool={tool} />
        </CardContent>
      </Card>
    </div>
  )
} 