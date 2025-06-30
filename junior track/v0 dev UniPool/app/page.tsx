"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Users, Star, MapPin, UserCheck, Search, Map, MessageCircle } from "lucide-react"
import { AuthService } from "@/services/AuthService"
import { motion, useScroll, useTransform } from "framer-motion"
import crestImg from "@/public/crest.png"
import phoneCarImg from "@/public/phone-car.png"
import carpoolGridImg from "@/public/carpool-grid.png"
import Image from "next/image"
import { useMotionValue, useSpring } from "framer-motion"
import { UniPoolLogo } from "@/components/ui/UniPoolLogo"

const heroCards = [
  {
    icon: <Users className="h-12 w-12 text-accent mb-4" />,
    title: "Student Community",
    desc: "Connect with verified FCC students and faculty. Build trust through our rating system."
  },
  {
    icon: <MapPin className="h-12 w-12 text-primary mb-4" />,
    title: "Smart Matching",
    desc: "AI-powered route matching finds the best rides based on your schedule and location."
  },
  {
    icon: <Star className="h-12 w-12 text-accent mb-4" />,
    title: "Safety First",
    desc: "Verified university emails, mutual ratings, and community guidelines ensure safe rides."
  }
]

// Feature highlights for new grid with image icons
const featureHighlights = [
  {
    icon: "/partners.png",
    title: "Verified Student Rides",
    desc: "Only real students, always safe."
  },
  {
    icon: "/location.png",
    title: "Campus-Based Pickup Points",
    desc: "Meet and ride from trusted locations."
  },
  {
    icon: "/shield.png",
    title: "Safe & Profile-Linked",
    desc: "Every ride is linked to a real profile."
  },
  {
    icon: "/chat.png",
    title: "In-App Messaging",
    desc: "Chat securely with your carpool."
  }
]

// Tutorial steps for How It Works
const tutorialSteps = [
  {
    icon: <UserCheck className="w-8 h-8 text-accent" />,
    title: "Sign Up & Verify",
    desc: "Create your account with your FCC email."
  },
  {
    icon: <Search className="w-8 h-8 text-accent" />,
    title: "Find or Offer a Ride",
    desc: "Browse rides or post your own."
  },
  {
    icon: <Map className="w-8 h-8 text-accent" />,
    title: "Smart Matching",
    desc: "Get matched with students on your route."
  },
  {
    icon: <MessageCircle className="w-8 h-8 text-accent" />,
    title: "Connect & Ride",
    desc: "Message, coordinate, and enjoy your ride!"
  }
]

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeCard, setActiveCard] = useState(0)
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const howItWorksRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()

  // Header parallax/3D effect
  const headerScale = useTransform(scrollY, [0, 120], [1, 0.96])
  const headerShadow = useTransform(scrollY, [0, 120], ["0 1px 0 0 rgba(0,0,0,0.05)", "0 8px 32px 0 rgba(63,43,150,0.18)"])

  // Hero parallax: scale and fade out more dramatically
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.85])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])

  // Features section parallax: move up and forward as it comes in
  const featuresY = useTransform(scrollY, [200, 600], [80, -120])
  const featuresScale = useTransform(scrollY, [200, 600], [0.98, 1.04])
  const featuresOpacity = useTransform(scrollY, [200, 600], [0.7, 1])

  // How It Works parallax: slide in from below as features fade out
  const howY = useTransform(scrollY, [600, 900], [120, 0])
  const howOpacity = useTransform(scrollY, [600, 900], [0, 1])

  // For card scatter/fly-away effect, use scrollY directly for each card
  const featuresScatter = useTransform(scrollY, [500, 800], [0, 1])

  // Animate minHeight and background opacity of features section to bridge gap
  const featuresSectionHeight = useTransform(scrollY, [500, 800], [480, 0])
  const featuresBgOpacity = useTransform(scrollY, [500, 800], [1, 0])

  useEffect(() => {
    const user = AuthService.getCurrentUser()
    setIsLoggedIn(!!user)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % heroCards.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push("/dashboard")
    } else {
      router.push("/auth/login")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        style={{ scale: headerScale, boxShadow: headerShadow, zIndex: 50, position: 'sticky', top: 0, background: 'var(--background)', transition: 'box-shadow 0.3s' }}
        className="border-b border-border"
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <UniPoolLogo size={32} className="h-8 w-8" />
            <span className="text-2xl font-bold text-foreground">UniPool</span>
          </div>
          <div className="space-x-4">
            {isLoggedIn ? (
              <>
                <Button onClick={() => router.push("/dashboard")} variant="outline">
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => router.push("/auth/login")} variant="outline">
                  Login
                </Button>
                <Button onClick={() => router.push("/auth/register")}>Sign Up</Button>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ scale: heroScale, opacity: heroOpacity, background: 'var(--background)' }}
        className="relative py-20 px-4 will-change-transform overflow-hidden"
      >
        {/* Symmetrical grid of images behind the headline */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          animate={{ x: [0, -80] }}
          transition={{ repeat: Infinity, repeatType: 'loop', duration: 30, ease: 'linear' }}
          style={{ willChange: 'transform' }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 w-full h-full grid grid-cols-12 grid-rows-6 gap-8">
              {Array.from({ length: 72 }).map((_, i) => {
                const icons = [
                  "/white crest.png",
                  "/car.png",
                  "/car-sharing.png"
                ];
                const row = Math.floor(i / 12);
                const col = i % 12;
                let iconIdx = (col + row) % 3;
                return (
                  <Image
                    key={i}
                    src={icons[iconIdx]}
                    alt="Grid Icon"
                    width={40}
                    height={40}
                    className="object-contain opacity-60"
                    style={{
                      opacity: (row === 2 && col === 6) ? 1 : 0.6
                    }}
                  />
                );
              })}
            </div>
          </div>
          {/* Fade out edges with a mask */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-transparent to-[var(--background)] pointer-events-none" style={{maskImage: 'radial-gradient(circle at center, white 60%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle at center, white 60%, transparent 100%)'}} />
        </motion.div>
        {/* Headline and subheadline centered */}
        <div className="relative z-10 w-full flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold fun-gradient mb-6 drop-shadow-lg leading-tight" style={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
            Join the Pool, Skip the Fuel.
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-xl mx-auto">
            Save fuel. Save money. Save that one guy always asking for a ride.
          </p>
          <Button onClick={handleGetStarted} size="lg" className="btn-fun px-10 py-5 text-lg shadow-xl">
            Get Started
          </Button>
        </div>
      </motion.section>

      {/* Features (What Makes UniPool Different) */}
      <motion.section
        ref={featuresRef}
        style={{ y: featuresY, scale: featuresScale, opacity: featuresOpacity, zIndex: 10, position: 'relative' }}
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="py-8 px-4 bg-gradient-to-r from-background via-muted/30 to-accent/10"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8 text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-2 tracking-tight">What Makes UniPool Different?</h2>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl italic">We're not Careem. We're campus-powered.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {featureHighlights.map((f, idx) => {
              // Per-card transforms based on scrollY
              const cardY = useTransform(scrollY, [500, 800], [0, -120 - idx * 40])
              const cardRotate = useTransform(scrollY, [500, 800], [0, idx % 2 === 0 ? -12 : 12])
              const cardOpacity = useTransform(scrollY, [500, 800], [1, 0])
              return (
                <motion.div
                  key={f.title}
                  style={{ y: cardY, rotate: cardRotate, opacity: cardOpacity, zIndex: 20 - idx }}
                  whileHover={{ y: -8, scale: 1.04, boxShadow: "0 8px 32px 0 rgba(63,43,150,0.15)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="bg-card rounded-2xl p-8 flex flex-col items-start shadow-lg border-2 border-transparent group-hover:border-accent transition-all duration-200 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 rounded-2xl pointer-events-none z-0 border-2 border-transparent group-hover:border-accent" style={{
                    background: 'linear-gradient(90deg, #3F2B96 0%, #A8C0FF 100%)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    borderRadius: '1rem',
                    zIndex: 1
                  }} />
                  <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-muted/50 drop-shadow-2xl shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:rotate-2 z-10">
                    <Image src={f.icon} alt={f.title + ' icon'} width={64} height={64} className="object-contain drop-shadow-[0_6px_18px_rgba(63,43,150,0.25)]" />
                  </div>
                  <div className="font-bold text-xl md:text-2xl text-foreground mb-2 tracking-tight z-10">{f.title}</div>
                  <div className="text-base text-muted-foreground font-medium leading-snug z-10">{f.desc}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        ref={howItWorksRef}
        style={{ y: howY, opacity: howOpacity, zIndex: 5, position: 'relative' }}
        className="pt-2 pb-12 px-4"
      >
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">How UniPool Works</h2>
          <p className="text-center text-muted-foreground mb-10">A quick guide to getting started</p>
          {/* Visual Tutorial */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
            {tutorialSteps.map((step, idx) => (
              <div key={step.title} className="flex flex-col items-center bg-card rounded-xl shadow-md p-6 w-full max-w-xs border border-border">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-accent/10 to-muted/30 mb-3">
                  {step.icon}
                </div>
                <div className="text-accent font-bold text-lg mb-1">Step {idx + 1}</div>
                <div className="font-semibold text-foreground text-xl mb-1 text-center">{step.title}</div>
                <div className="text-muted-foreground text-base text-center">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-muted text-foreground py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <UniPoolLogo size={24} className="h-6 w-6" />
            <span className="text-xl font-bold">UniPool</span>
          </div>
          <p className="text-muted-foreground">Connecting FCC students through safe, convenient ride sharing</p>
        </div>
      </footer>
    </div>
  )
}
