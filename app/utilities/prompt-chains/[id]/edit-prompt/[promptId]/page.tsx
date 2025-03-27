"use server"

import { redirect, notFound } from "next/navigation"
import { getPromptChainToolAction } from "@/actions/db/prompt-chains-actions"
import { getAiModelsAction } from "@/actions/db/ai-models-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@clerk/nextjs/server"
import { EditPromptForm } from "./_components/edit-prompt-form"

interface Props {
  params: Promise<{
    id: string
    promptId: string
  }>
}

export default async function EditPromptPage({ params }: Props) {
  const { id, promptId } = await params
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/signin")
  }
  
  const toolResult = await getPromptChainToolAction(id)
  if (!toolResult.isSuccess) {
    notFound()
  }
  
  const tool = toolResult.data
  
  // Check if user can edit this tool
  const isCreator = userId === tool.creatorId
  const canEdit = isCreator && (tool.status === "draft" || tool.status === "rejected")
  
  if (!canEdit) {
    redirect(`/utilities/prompt-chains/${id}`)
  }
  
  // Get models for the form
  const modelsResult = await getAiModelsAction()
  const models = modelsResult.isSuccess ? modelsResult.data : []
  
  // Find the prompt to edit
  const prompt = tool.prompts?.find(p => p.id === promptId)
  if (!prompt) {
    notFound()
  }
  
  // Get previous prompts (excluding current prompt)
  const previousPrompts = tool.prompts
    ?.filter(p => p.id !== promptId && p.position < prompt.position)
    .sort((a, b) => a.position - b.position) || []
  
  // Sort input fields by position
  const sortedInputFields = tool.inputFields?.slice().sort((a, b) => a.position - b.position) || []
  
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Prompt: {prompt.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <EditPromptForm 
            toolId={tool.id}
            prompt={prompt}
            models={models}
            isParallel={tool.isParallel}
            previousPrompts={previousPrompts}
            inputFields={sortedInputFields}
          />
        </CardContent>
      </Card>
    </div>
  )
} 