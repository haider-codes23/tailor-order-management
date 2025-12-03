import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>shadcn/ui + Tailwind v4 ✨</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600">Everything is working perfectly!</p>
          <Button onClick={() => alert("Button clicked!")} className="w-full">
            Test Button
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
