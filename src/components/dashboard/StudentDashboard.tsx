import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ProfileHeader } from "./ProfileHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle, List } from "lucide-react"
import { PlenaryFormModal } from "../plenaries/PlenaryFormModal"
import { RecentPlenariesModal } from "../plenaries/RecentPlenariesModal"

export function StudentDashboard() {
  const { user } = useAuth()
  const [isPlenaryFormOpen, setIsPlenaryFormOpen] = useState(false)
  const [isRecentPlenariesOpen, setIsRecentPlenariesOpen] = useState(false)

  const { data: points, isLoading: pointsLoading } = useQuery({
    queryKey: ['points', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('poiesis_points')
        .select('points, created_at')
        .eq('student_id', user?.id)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data
    },
  })

  const { data: pathways, isLoading: pathwaysLoading } = useQuery({
    queryKey: ['pathways', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_pathways')
        .select(`
          pathway_id,
          status,
          pathways (
            id,
            title,
            description
          )
        `)
        .eq('student_id', user?.id)
      
      if (error) throw error
      return data
    },
  })

  return (
    <div className="space-y-6">
      <ProfileHeader />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Plenary Management Card */}
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Plenary Management</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row">
            <Button 
              onClick={() => setIsPlenaryFormOpen(true)}
              className="flex-1"
              size="lg"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Plenary
            </Button>
            <Button 
              onClick={() => setIsRecentPlenariesOpen(true)}
              className="flex-1"
              variant="outline"
              size="lg"
            >
              <List className="mr-2 h-5 w-5" />
              View Recent Plenaries
            </Button>
          </CardContent>
        </Card>

        {/* Points Graph */}
        <Card className="col-span-full lg:col-span-1">
          <CardHeader>
            <CardTitle>Poiesis Points</CardTitle>
          </CardHeader>
          <CardContent>
            {pointsLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={points}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="created_at" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="points" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Active Pathways */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Active Pathways</CardTitle>
          </CardHeader>
          <CardContent>
            {pathwaysLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pathways?.map((pathway) => (
                  <Card key={pathway.pathway_id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{pathway.pathways.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{pathway.pathways.description}</p>
                      <p className="mt-2 text-sm font-medium">Status: {pathway.status}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PlenaryFormModal 
        open={isPlenaryFormOpen} 
        onOpenChange={setIsPlenaryFormOpen} 
      />
      <RecentPlenariesModal
        open={isRecentPlenariesOpen}
        onOpenChange={setIsRecentPlenariesOpen}
      />
    </div>
  )
}