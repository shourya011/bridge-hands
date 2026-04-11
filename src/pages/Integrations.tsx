import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Video, Chrome, Link as LinkIcon, CheckCircle2 } from "lucide-react";

export default function Integrations() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Platform Integrations</h1>
            <p className="text-muted-foreground">
              Connect SignBridge with your favorite communication platforms
            </p>
          </div>

          <div className="space-y-6">
            {/* Discord Integration */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle>Discord Integration</CardTitle>
                      <CardDescription>Send translations as messages or overlays</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="discord-token">Bot Token</Label>
                  <Input 
                    id="discord-token" 
                    type="password" 
                    placeholder="Enter your Discord bot token"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discord-server">Server ID</Label>
                  <Input 
                    id="discord-server" 
                    placeholder="Enter your Discord server ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discord-channel">Channel ID</Label>
                  <Input 
                    id="discord-channel" 
                    placeholder="Enter your Discord channel ID"
                  />
                </div>
                <Button variant="hero" className="w-full" disabled>
                  Connect Discord
                </Button>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Features:</strong> Send translations as text messages, 
                    integrate with voice channels, display subtitles during streams
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Google Meet Integration */}
            <Card className="border-2 border-secondary/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center">
                      <Video className="w-6 h-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <CardTitle>Google Meet Integration</CardTitle>
                      <CardDescription>Real-time subtitle overlay for meetings</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Floating Translation Widget</p>
                      <p className="text-xs text-muted-foreground">Draggable overlay for seamless integration</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">WebRTC Camera Bridge</p>
                      <p className="text-xs text-muted-foreground">Direct camera feed processing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Real-time Subtitles</p>
                      <p className="text-xs text-muted-foreground">Semi-transparent captions in any language</p>
                    </div>
                  </div>
                </div>
                <Button variant="secondary" className="w-full" disabled>
                  Install Chrome Extension
                </Button>
              </CardContent>
            </Card>

            {/* Zoom Integration */}
            <Card className="border-2 border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center">
                      <Chrome className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <CardTitle>Zoom Integration</CardTitle>
                      <CardDescription>Translation overlay for Zoom meetings</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Similar to Google Meet integration, SignBridge will provide a floating translation widget 
                  that overlays your Zoom calls with real-time subtitles.
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Setup Zoom Integration
                </Button>
              </CardContent>
            </Card>

            {/* WebSocket Configuration */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <LinkIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Backend Connection</CardTitle>
                    <CardDescription>Configure your backend WebSocket endpoint</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="websocket-url">WebSocket URL</Label>
                  <Input 
                    id="websocket-url" 
                    placeholder="ws://localhost:8000/ws"
                    defaultValue="ws://localhost:8000/ws"
                  />
                  <p className="text-xs text-muted-foreground">
                    Connect to your backend system from the GitHub repository
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key (Optional)</Label>
                  <Input 
                    id="api-key" 
                    type="password"
                    placeholder="Enter your API key if required"
                  />
                </div>
                <Button variant="success" className="w-full">
                  Test Connection
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
