import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Eye, Type, Volume2, Captions } from "lucide-react";

export default function Accessibility() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Accessibility Settings</h1>
            <p className="text-muted-foreground">
              Customize your experience for optimal accessibility
            </p>
          </div>

          <div className="space-y-6">
            {/* Visual Settings */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center">
                    <Eye className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>Visual Settings</CardTitle>
                    <CardDescription>Adjust display and contrast options</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="high-contrast">High Contrast Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <Switch id="high-contrast" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="large-cursor">Large Cursor</Label>
                    <p className="text-sm text-muted-foreground">
                      Make cursor easier to see
                    </p>
                  </div>
                  <Switch id="large-cursor" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="color-blind">Color Blind Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Adjust colors for color blindness
                    </p>
                  </div>
                  <Switch id="color-blind" />
                </div>

                <div className="space-y-2">
                  <Label>Color Blind Type</Label>
                  <Select defaultValue="none">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="protanopia">Protanopia (Red-blind)</SelectItem>
                      <SelectItem value="deuteranopia">Deuteranopia (Green-blind)</SelectItem>
                      <SelectItem value="tritanopia">Tritanopia (Blue-blind)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Text Settings */}
            <Card className="border-2 border-secondary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-accent flex items-center justify-center">
                    <Type className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <CardTitle>Text Settings</CardTitle>
                    <CardDescription>Customize text size and style</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Text Size</Label>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-12">Small</span>
                    <Slider defaultValue={[100]} max={200} min={80} step={10} className="flex-1" />
                    <span className="text-sm text-muted-foreground w-12 text-right">Large</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Current size: 100%
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select defaultValue="default">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="arial">Arial</SelectItem>
                      <SelectItem value="verdana">Verdana</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="opensans">Open Sans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dyslexic-font">Dyslexic-Friendly Font</Label>
                    <p className="text-sm text-muted-foreground">
                      Use fonts optimized for dyslexia
                    </p>
                  </div>
                  <Switch id="dyslexic-font" />
                </div>
              </CardContent>
            </Card>

            {/* Audio Settings */}
            <Card className="border-2 border-success/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center">
                    <Volume2 className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <CardTitle>Audio Settings</CardTitle>
                    <CardDescription>Control audio output and speech</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-play">Auto-Play Translation Audio</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically speak translations
                    </p>
                  </div>
                  <Switch id="auto-play" defaultChecked />
                </div>

                <div className="space-y-3">
                  <Label>Speech Rate</Label>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-12">Slow</span>
                    <Slider defaultValue={[100]} max={200} min={50} step={10} className="flex-1" />
                    <span className="text-sm text-muted-foreground w-12 text-right">Fast</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Voice Type</Label>
                  <Select defaultValue="default">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Caption Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Captions className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Caption Settings</CardTitle>
                    <CardDescription>Customize subtitle appearance</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="always-captions">Always Show Captions</Label>
                    <p className="text-sm text-muted-foreground">
                      Display text alongside video
                    </p>
                  </div>
                  <Switch id="always-captions" defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Caption Background</Label>
                  <Select defaultValue="semi">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="semi">Semi-transparent</SelectItem>
                      <SelectItem value="solid">Solid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="visual-feedback">Visual Sign Feedback</Label>
                    <p className="text-sm text-muted-foreground">
                      Highlight detected signs on screen
                    </p>
                  </div>
                  <Switch id="visual-feedback" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
