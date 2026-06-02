import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BentoGrid, BentoGridItem } from '@/components/ui/BentoGrid';
import { HLSBackground } from '@/components/ui/HLSBackground';
import {
  ArrowRight,
  Upload,
  MessageSquare,
  BarChart2,
  Shield,
  Zap,
  Info,
  UserCheck,
  ClipboardCheck,
  Brain,
  Activity,
  Files,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function Landing() {
  const { user } = useAuth();
  // Theme is managed by ThemeProvider — no forced dark mode

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      {/* Hero Section — full viewport, video + text + badges at bottom */}
      <section className="relative h-screen flex flex-col overflow-hidden">
        <HLSBackground src="/hero-bg.mp4" />

        {/* Main content — centered vertically in the viewport */}
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="container mx-auto px-4 text-center pt-16">
            <div className="max-w-4xl mx-auto">

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 leading-tight text-crystal-shine-video"
              >
                Meet MediVision.
              </motion.h1>

              {/* Animated gradient line */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="mx-auto mt-2 mb-6 h-[2px] w-32 md:w-48 origin-center"
                style={{
                  background: 'linear-gradient(90deg, transparent, hsl(217 91% 60%), hsl(172 66% 50%), transparent)',
                }}
              />

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-base md:text-xl text-white/75 mb-16 max-w-2xl mx-auto leading-relaxed drop-shadow-md"
              >
                Advanced AI-powered diagnostics for educational and research purposes.
                Experience the future of radiology with clinical-grade precision.
              </motion.p>

              {/* Buttons — pushed down with extra top margin */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-5 justify-center items-center"
              >
                {user ? (
                  <Button asChild size="xl" className="h-14 px-10 text-lg rounded-full shadow-2xl shadow-primary/50 transition-all bg-primary hover:bg-primary/90 text-primary-foreground border-none group relative overflow-hidden">
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <span className="relative z-10">Go to Dashboard</span>
                      <ArrowRight className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="xl" className="h-14 px-10 text-lg rounded-full shadow-2xl shadow-primary/50 transition-all bg-primary hover:bg-primary/90 text-primary-foreground border-none group relative overflow-hidden animate-[glow-pulse_3s_ease-in-out_infinite]">
                    <Link to="/register" className="flex items-center gap-2">
                      <span className="relative z-10">Get Started Free</span>
                      <ArrowRight className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" size="xl" className="h-14 px-10 text-lg rounded-full border-2 border-white/60 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white shadow-xl transition-all">
                  <Link to="/about">
                    Learn More
                  </Link>
                </Button>
              </motion.div>

            </div>
          </div>
        </div>

        {/* Trust Badges — pinned to the bottom of the viewport */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="relative z-10 pb-8 flex flex-wrap justify-center gap-4 md:gap-6 px-4"
        >
          {[
            { icon: Brain, label: "AI-Powered Analysis" },
            { icon: Shield, label: "Privacy Focused" },
            { icon: ClipboardCheck, label: "Research Ready" },
          ].map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm"
            >
              <badge.icon className="h-4 w-4 text-accent" />
              <span>{badge.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Animated Text Marquee Below Hero */}
      <section className="py-6 border-y border-white/5 bg-muted/5 overflow-hidden relative flex">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 40, repeat: Infinity }}
          className="flex whitespace-nowrap w-fit"
        >
          {Array(4).fill("• EMPOWERING HEALTHCARE WITH AI DIAGNOSTICS • NEXT-GENERATION RADIOLOGY • REAL-TIME X-RAY ANALYSIS • HIGH-FIDELITY PREDICTIONS ").map((text, i) => (
             <span key={i} className="text-sm md:text-lg font-medium tracking-widest text-muted-foreground/70 px-4 uppercase">
                {text}
             </span>
          ))}
        </motion.div>
      </section>

      {/* Dashboard & Video Showcase */}
      <section className="py-16 md:py-24 bg-background relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
            
            {/* Left side: Video intro */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(34,211,238,0.15)] border border-primary/20 group bg-black"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent pointer-events-none z-10 mix-blend-overlay"></div>
              <video 
                src="/xray-intro.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>

            {/* Right side: Dashboard Image */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative w-full aspect-video"
              style={{ perspective: '1000px' }}
            >
              <motion.div
                whileHover={{ rotateX: 2, rotateY: -2, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="liquid-glass-premium rounded-2xl h-full w-full p-2 shadow-2xl overflow-hidden relative flex items-center justify-center border border-white/5 bg-white/5 backdrop-blur-xl"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 via-transparent to-primary/10 pointer-events-none rounded-2xl" />
                <img
                  src="/images/hero_dashboard_1769245460172.png"
                  alt="MediVision Dashboard"
                  className="w-full h-full object-contain filter drop-shadow-2xl"
                />
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Modern Bento Grid Features */}
      <section className="py-24 bg-muted/20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need for comprehensive medical image analysis in one unified platform.
            </p>
          </div>

          <BentoGrid className="max-w-6xl mx-auto">
            <BentoGridItem
              title={<span className="text-xl">AI X-Ray Analysis</span>}
              description="State-of-the-art computer vision models to detect abnormalities with heatmaps and confidence scores."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden"><img src="/images/feature_xray_scan_1769245475435.png" alt="AI X-Ray Analysis" className="w-full h-full object-cover" /></div>}
              icon={<Brain className="h-4 w-4 text-neutral-500" />}
              className="md:col-span-2"
            />
            <BentoGridItem
              title={<span className="text-xl">Instant Reporting</span>}
              description="Generate detailed, exportable PDF reports for clinical reviews and patient records."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden"><img src="/images/hero_dashboard_1769245460172.png" alt="Instant Reporting" className="w-full h-full object-cover" /></div>}
              icon={<ClipboardCheck className="h-4 w-4 text-neutral-500" />}
              className="md:col-span-1"
            />
            <BentoGridItem
              title={<span className="text-xl">Analytics Dashboard</span>}
              description="Track your analysis history, common findings, and operational metrics over time."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden"><img src="/images/feature_analytics_1769245511189.png" alt="Analytics Dashboard" className="w-full h-full object-cover" /></div>}
              icon={<BarChart2 className="h-4 w-4 text-neutral-500" />}
              className="md:col-span-1"
            />
            <BentoGridItem
              title={<span className="text-xl">Clinical Assistant</span>}
              description="Chat with our AI assistant to get context-aware answers about medical conditions."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden"><img src="/images/feature_chatbot_1769245495974.png" alt="Clinical Assistant" className="w-full h-full object-cover" /></div>}
              icon={<MessageSquare className="h-4 w-4 text-neutral-500" />}
              className="md:col-span-2"
            />
          </BentoGrid>
        </div>
      </section>

      {/* Simplified How It Works */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-foreground animate-membrane">Streamlined Workflow</h2>
            <p className="text-lg text-muted-foreground">
              From upload to diagnosis in four simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-accent/20 to-transparent -z-10" />

            {[
              { icon: Upload, title: 'Upload Scan', desc: 'Securely upload high-res X-ray images.' },
              { icon: Zap, title: 'AI Analysis', desc: 'Advanced algorithms process the image.' },
              { icon: UserCheck, title: 'Review', desc: 'Expert verification of AI findings.' },
              { icon: Files, title: 'Report', desc: 'Download comprehensive PDF report.' }
            ].map((item, index, arr) => (
              <div key={index} className="relative flex flex-col items-center text-center p-4 group">
                <div className="w-24 h-24 rounded-full bg-muted/50 border border-border shadow-2xl flex items-center justify-center mb-6 z-10 relative group-hover:border-accent/50 transition-all duration-500 backdrop-blur-xl">
                  <item.icon className="h-10 w-10 text-accent group-hover:scale-110 transition-transform" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground border-2 border-background">
                    {index + 1}
                  </div>
                </div>
                {/* Arrow connector between steps */}
                {index < arr.length - 1 && (
                  <div className="hidden md:flex absolute top-12 -right-4 transform translate-x-1/2 z-20 opacity-30">
                    <ArrowRight className="h-6 w-6 text-accent" />
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-32 relative overflow-hidden bg-muted/20">
        <div className="absolute inset-0 bg-accent/5 -z-10" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-accent/10 dark:bg-accent/20 blur-[150px] rounded-full" />
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] bg-primary/10 dark:bg-primary/20 blur-[150px] rounded-full" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 tracking-tight max-w-3xl mx-auto leading-tight text-foreground">
            Ready to experience the future <span className="text-primary">of medical imaging?</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto px-4">
            Join thousands of medical professionals using MediVision to enhance their diagnostic capabilities.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4 px-4">
            <Button asChild size="lg" className="h-12 md:h-16 px-6 md:px-12 text-base md:text-xl rounded-full shadow-2xl shadow-primary/20 w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground transition-all border-none">
              <Link to="/register">
                Create Free Account
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 md:h-16 px-6 md:px-12 text-base md:text-xl rounded-full w-full md:w-auto border-border hover:bg-muted backdrop-blur-md">
              <Link to="/about">
                Contact Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
