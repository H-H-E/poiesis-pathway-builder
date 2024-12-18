import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ProfileHeader } from "./ProfileHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle, List, TrendingUp, BookOpen } from "lucide-react"
import { PlenaryFormModal } from "../plenaries/PlenaryFormModal"
import { RecentPlenariesModal } from "../plenaries/RecentPlenariesModal"
import { EmptyState } from "../ui/empty-state"
import { LoadingSpinner } from "../ui/loading-spinner"

export function StudentDashboard() {
  const [isPlenaryFormOpen, setIsPlenaryFormOpen] = useState(false)
  const [isRecentPlenariesOpen, setIsRecentPlenariesOpen] = useState(false)
  const { user } = useAuth()

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
    enabled: !!user?.id,
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
    enabled: !!user?.id,
  })

  return (
    <div className="space-y-6 pt-6">
      <ProfileHeader />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Plenary Management Card */}
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Plenary Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <Button 
                onClick={() => setIsPlenaryFormOpen(true)}
                size="lg"
                className="w-full h-auto py-6"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Add New Plenary
              </Button>
              <Button 
                onClick={() => setIsRecentPlenariesOpen(true)}
                variant="outline"
                size="lg"
                className="w-full h-auto py-6"
              >
                <List className="mr-2 h-5 w-5" />
                View Recent Plenaries
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Points Graph */}
        <Card className="col-span-full lg:col-span-1">
          <CardHeader>
            <CardTitle>Poiesis Points</CardTitle>
          </CardHeader>
          <CardContent>
            {pointsLoading ? (
              <LoadingSpinner />
            ) : points && points.length > 0 ? (
              <div className="h-[200px] w-full">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <path
                    d={points
                      .map((point, i) => {
                        const x = (i / (points.length - 1)) * 100
                        const y = 100 - ((point.points / Math.max(...points.map(p => p.points))) * 100)
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                      })
                      .join(' ')}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-primary"
                  />
                </svg>
              </div>
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No points yet"
                description="Complete projects and plenaries to earn Poiesis points. They'll appear here as you progress."
              />
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
              <LoadingSpinner />
            ) : pathways && pathways.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pathways.map((pathway) => (
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
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No active pathways"
                description="Join a learning pathway to start tracking your progress and earning points."
              />
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