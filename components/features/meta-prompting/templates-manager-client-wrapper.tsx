"use client"

import { useEffect, useState } from "react"
import { TemplatesManager } from "./templates-manager"
import { SelectMetaPromptingTemplate, SelectMetaPromptingTechnique } from "@/db/schema"
import { toast } from "sonner"

export function TemplatesManagerClientWrapper() {
  const [templates, setTemplates] = useState<SelectMetaPromptingTemplate[]>([])
  const [techniques, setTechniques] = useState<SelectMetaPromptingTechnique[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch templates
        const templatesRes = await fetch("/api/meta-prompting/templates")
        const templatesResult = await templatesRes.json()
        
        if (templatesResult.isSuccess) {
          setTemplates(templatesResult.data)
        } else {
          toast.error(templatesResult.message)
        }

        // Fetch techniques
        const techniquesRes = await fetch("/api/meta-prompting/techniques")
        const techniquesResult = await techniquesRes.json()
        
        if (techniquesResult.isSuccess) {
          setTechniques(techniquesResult.data)
        } else {
          toast.error(techniquesResult.message)
        }
      } catch (error) {
        toast.error("Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return <TemplatesManager initialTemplates={templates} techniques={techniques} />
} 