"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { SelectNavigationItem } from "@/db/schema"
import { iconMap, IconName } from "@/components/navigation/icon-map"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { createNavigationItemAction, updateNavigationItemAction } from "@/actions/db/navigation-actions"
import { toast } from "sonner"
import React from "react"

interface NavigationItemFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
  initialData?: SelectNavigationItem
  items?: SelectNavigationItem[]
}

const formSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(2, "Label must be at least 2 characters"),
  icon: z.custom<IconName>((val) => Object.keys(iconMap).includes(val as string), "Invalid icon"),
  link: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(["link", "section", "page"]),
  parentId: z.string().optional(),
  toolId: z.string().optional().nullable(),
  requiresRole: z.string().optional().nullable(),
  position: z.number().optional(),
  isActive: z.boolean().optional()
}).refine((data) => {
  if (data.type === "section") {
    return true;
  }
  return data.link && data.link.length > 0;
}, {
  message: "Link is required for non-section items",
  path: ["link"]
});

type FormValues = z.infer<typeof formSchema>

export function NavigationItemForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  items = []
}: NavigationItemFormProps) {
  const router = useRouter()
  const [parents, setParents] = useState<SelectNavigationItem[]>([])
  const [tools, setTools] = useState<{ id: string; name: string }[]>([])
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialData?.id,
      label: initialData?.label || "",
      icon: (initialData?.icon as IconName) || "IconHome",
      link: initialData?.link || "",
      description: initialData?.description || "",
      type: initialData?.type || "link",
      parentId: initialData?.parentId || undefined,
      toolId: initialData?.toolId || null,
      requiresRole: initialData?.requiresRole || null,
      position: initialData?.position || 0,
      isActive: initialData?.isActive ?? true
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      // Fetch potential parent items
      const navResponse = await fetch("/api/admin/navigation")
      const navData = await navResponse.json()
      if (navData.isSuccess) {
        setParents(navData.data.filter((item: SelectNavigationItem) => 
          item.type === "section" && item.id !== initialData?.id
        ))
      }

      // Fetch tools
      const toolsResponse = await fetch("/api/admin/tools")
      const toolsData = await toolsResponse.json()
      if (toolsData.isSuccess) {
        setTools(toolsData.data)
      }

      // Fetch roles
      const rolesResponse = await fetch("/api/admin/roles")
      const rolesData = await rolesResponse.json()
      if (rolesData.isSuccess) {
        setRoles(rolesData.data)
      }
    }

    if (open) {
      fetchData()
    }
  }, [open, initialData?.id])

  const onFormSubmit = async (values: FormValues) => {
    console.log("Form values:", values);
    try {
      // Generate an ID for new items based on the label
      const id = initialData?.id || values.label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Format the data correctly
      const data = {
        ...values,
        id,
        toolId: values.toolId || null,
        parentId: values.parentId || null,
        requiresRole: values.requiresRole || null,
        position: values.position || 0,
        isActive: values.isActive ?? true
      };

      const response = await fetch('/api/admin/navigation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.isSuccess) {
        toast.success(result.message);
        router.refresh();
        onSubmit();
        onOpenChange(false);
        form.reset();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] p-0 sm:max-w-[700px]">
        <DialogHeader className="sticky top-0 z-50 bg-background p-6 pb-4 border-b">
          <DialogTitle>
            {initialData ? "Edit Navigation Item" : "Add Navigation Item"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <Form {...form}>
            <form id="navigation-form" onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Label</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the label that will be displayed in the navigation.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="link">Link</SelectItem>
                            <SelectItem value="section">Section</SelectItem>
                            <SelectItem value="page">Page</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This determines how the navigation item will be displayed.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue>
                                <div className="flex items-center gap-2">
                                  {field.value && (
                                    <>
                                      {iconMap[field.value as IconName] && (
                                        <div className="flex h-4 w-4 items-center justify-center">
                                          {React.createElement(iconMap[field.value as IconName], { className: "h-4 w-4" })}
                                        </div>
                                      )}
                                      <span>{field.value}</span>
                                    </>
                                  )}
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <ScrollArea className="h-[200px]">
                              {Object.entries(iconMap).map(([name, Icon]) => (
                                <SelectItem key={name} value={name}>
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-4 w-4 items-center justify-center">
                                      {React.createElement(Icon, { className: "h-4 w-4" })}
                                    </div>
                                    <span>{name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This is the icon that will be displayed next to the label.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the link that will be used when the item is clicked.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="h-20" />
                      </FormControl>
                      <FormDescription>
                        This will be displayed when the navigation item is of type page.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}
                          defaultValue={field.value || "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select parent" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {parents.map((parent) => (
                              <SelectItem key={parent.id} value={parent.id}>
                                {parent.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This determines where in the navigation hierarchy this item will be placed.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="toolId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Required Tool</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                          defaultValue={field.value || "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tool" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {tools.map((tool) => (
                              <SelectItem key={tool.id} value={tool.id}>
                                {tool.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="requiresRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Role</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                        defaultValue={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <div className="sticky bottom-0 z-50 bg-background p-6 pt-4 border-t">
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="navigation-form">
              {initialData ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 