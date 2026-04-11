import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Heart, Github, Target, Users, Zap } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Mission */}
          <section className="mb-16">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Mission</h1>
              <p className="text-xl text-muted-foreground">
                Breaking communication barriers through technology
              </p>
            </div>
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="p-8 space-y-4">
                <p className="text-lg leading-relaxed">
                  SignBridge is dedicated to creating an inclusive world where communication knows no boundaries. 
                  By leveraging advanced AI and computer vision, we translate Indian Sign Language in real-time, 
                  empowering deaf and hearing-impaired individuals to connect seamlessly with the world.
                </p>
                <p className="text-lg leading-relaxed">
                  Our platform integrates with popular communication tools like Discord, Google Meet, and Zoom, 
                  ensuring that everyone can participate fully in conversations, meetings, and social interactions.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* How It Works */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">1. Detection</h3>
                  <p className="text-muted-foreground">
                    Advanced computer vision models detect and recognize Indian Sign Language gestures in real-time.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-secondary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center">
                    <Zap className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">2. Translation</h3>
                  <p className="text-muted-foreground">
                    AI models translate detected signs into text across multiple languages with &lt;2s latency.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-success/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-success" />
                  </div>
                  <h3 className="text-lg font-semibold">3. Communication</h3>
                  <p className="text-muted-foreground">
                    Translations appear as text and audio, seamlessly integrating with your communication platforms.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-16" id="faq">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border-2 border-border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  What sign languages are supported?
                </AccordionTrigger>
                <AccordionContent>
                  Currently, we support Indian Sign Language (ISL) with plans to expand to other sign languages 
                  in the future. Our AI models are continuously trained to improve accuracy and coverage.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-2 border-border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  How accurate is the translation?
                </AccordionTrigger>
                <AccordionContent>
                  Our system achieves approximately 94% accuracy on common ISL signs and phrases. Accuracy 
                  continues to improve as we gather more data and refine our models. Performance may vary 
                  based on lighting conditions and camera quality.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-2 border-border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  Is my video data stored or shared?
                </AccordionTrigger>
                <AccordionContent>
                  No. Your privacy is our priority. Video streams are processed in real-time and are not stored 
                  on our servers. We only retain anonymous usage statistics to improve the service. No personal 
                  data is shared with third parties without explicit consent.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-2 border-border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  What are the system requirements?
                </AccordionTrigger>
                <AccordionContent>
                  You need a modern web browser (Chrome, Firefox, Safari, or Edge), a webcam, and a stable 
                  internet connection. For platform integrations, additional extensions or permissions may 
                  be required.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-2 border-border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  Can I use this offline?
                </AccordionTrigger>
                <AccordionContent>
                  Currently, an internet connection is required for real-time translation as processing happens 
                  on our servers. We're exploring offline capabilities through desktop applications for future releases.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Contribute */}
          <section className="mb-16" id="contribute">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Contribute to the Project</h2>
            <Card className="border-2 border-secondary/20">
              <CardContent className="p-8 space-y-4">
                <p className="text-lg">
                  SignBridge is an open-source project. We welcome contributions from developers, 
                  designers, and sign language experts to help improve accessibility worldwide.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild variant="hero">
                    <a 
                      href="https://github.com/SiddharthaChakrabarty/Sign-Language-Translation-Across-Multiple-Languages" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center"
                    >
                      <Github className="w-5 h-5 mr-2" />
                      View on GitHub
                    </a>
                  </Button>
                  <Button asChild variant="outline">
                    <a 
                      href="https://github.com/SiddharthaChakrabarty/Sign-Language-Translation-Across-Multiple-Languages/blob/main/CONTRIBUTING.md" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Contribution Guidelines
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Support */}
          <section id="support">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Support & Community</h2>
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="p-8 text-center space-y-4">
                <Heart className="w-12 h-12 text-destructive mx-auto" />
                <h3 className="text-xl font-semibold">Help Us Grow</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  If you find SignBridge helpful, consider starring our repository, sharing with your community, 
                  or contributing to development. Together, we can make communication truly universal.
                </p>
                <Button asChild variant="secondary" size="lg">
                  <a 
                    href="https://github.com/SiddharthaChakrabarty/Sign-Language-Translation-Across-Multiple-Languages" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Star on GitHub
                  </a>
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
