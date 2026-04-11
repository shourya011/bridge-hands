import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { 
  Video, 
  Globe, 
  Zap, 
  Users, 
  MessageSquare, 
  Shield,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-hero opacity-5" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Breaking Barriers with AI
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Breaking the Silence with
                <span className="bg-gradient-hero bg-clip-text text-transparent"> Technology</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Real-time Indian Sign Language translation powered by AI. 
                Connect seamlessly across Discord, Google Meet, and Zoom.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild variant="hero" size="lg" className="text-base">
                  <Link to="/translate">
                    Start Translating
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base">
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                "You sign, the world understands."
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Inclusive Communication Made Simple
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed for accessibility and seamless integration
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-2 hover:border-primary/50 hover:shadow-soft transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
                    <Video className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Real-Time Translation</h3>
                  <p className="text-muted-foreground">
                    Live ISL recognition with &lt;2s latency. Instant text and audio output.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 hover:shadow-soft transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center">
                    <Globe className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Multi-Language Support</h3>
                  <p className="text-muted-foreground">
                    Translate to English, Hindi, and regional Indian languages seamlessly.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 hover:shadow-soft transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-success" />
                  </div>
                  <h3 className="text-xl font-semibold">Lightning Fast</h3>
                  <p className="text-muted-foreground">
                    Optimized AI models ensure minimal latency for natural conversations.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 hover:shadow-soft transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Platform Integration</h3>
                  <p className="text-muted-foreground">
                    Works with Discord, Google Meet, Zoom, and standalone modes.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 hover:shadow-soft transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center">
                    <Shield className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Privacy First</h3>
                  <p className="text-muted-foreground">
                    Your video streams are processed securely. No data stored without consent.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 hover:shadow-soft transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-success" />
                  </div>
                  <h3 className="text-xl font-semibold">Accessible Design</h3>
                  <p className="text-muted-foreground">
                    Built for everyone with high contrast, large text, and visual cues.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-glow">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Ready to Bridge the Communication Gap?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of users creating a more inclusive world through technology.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild variant="hero" size="lg">
                    <Link to="/translate">
                      Start Translating Now
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg">
                    <Link to="/integrations">Connect Your Platform</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
