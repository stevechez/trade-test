"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ClipboardCheck, Rocket } from "lucide-react"
import { createClient } from "@/lib/supabase"

// 1. Move Schema out of the component to ensure clean type extraction
const formSchema = z.object({
  fullName: z.string().min(2, "Name required"),
  companyName: z.string().min(2, "Company name required"),
  projectVolume: z.string().min(1, "Please select volume"),
  primaryTrade: z.string().min(1, "Please select primary trade"),
  phone: z.string().min(10, "Valid phone required"),
})

// Extract the type from the schema
type FormValues = z.infer<typeof formSchema>;

export default function PilotApplication() {
  const supabase = createClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      fullName: "", 
      companyName: "", 
      phone: "",
      projectVolume: "",
      primaryTrade: ""
    },
  })

  async function onSubmit(values: FormValues) {
    const { error } = await supabase
      .from('pilot_leads')
      .insert([{
        full_name: values.fullName,
        company_name: values.companyName,
        phone_number: values.phone,
        monthly_volume: values.projectVolume,
        primary_trade: values.primaryTrade,
        status: 'new'
      }]);

    if (error) {
      toast.error("Submission failed. Please try again.");
    } else {
      toast.success("Application received! Steven will reach out shortly.");
      form.reset();
    }
  }

  return (
    <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 p-2 rounded-xl">
          <ClipboardCheck className="text-white w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Apply for the Q1 Pilot</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 2. Explicitly type the render argument if inference fails */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }: { field: any }) => ( 
                <FormItem>
                  <FormLabel className="font-bold text-slate-700">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" className="rounded-xl border-slate-200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="font-bold text-slate-700">Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe Construction" className="rounded-xl border-slate-200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="primaryTrade"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">Primary Trade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl border-slate-200"><SelectValue placeholder="Select your trade" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="general">General Contractor</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="framing">Framing/Structural</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="projectVolume"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">Active Projects (Monthly)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl border-slate-200"><SelectValue placeholder="Select volume" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1-3">1-3 Projects</SelectItem>
                    <SelectItem value="4-10">4-10 Projects</SelectItem>
                    <SelectItem value="10+">10+ Projects</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">Direct Mobile (for SMS alerts)</FormLabel>
                <FormControl>
                  <Input placeholder="(831) 000-0000" className="rounded-xl border-slate-200" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-blue-100 mt-4">
            Join the Elite Pilot <Rocket className="ml-2 w-5 h-5" />
          </Button>
        </form>
      </Form>
    </div>
  )
}