"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Users, Star, MapPin } from "lucide-react"
import { AuthService } from "@/services/AuthService"
import { motion, useScroll, useTransform } from "framer-motion"

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

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeCard, setActiveCard] = useState(0)
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.92])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.7])

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
      <header className="border-b border-border">
                  <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-foreground" />
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
      </header>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ scale: heroScale, opacity: heroOpacity }}
        className="py-20 px-4 bg-gradient-to-br from-background via-muted/50 to-accent/20 will-change-transform"
      >
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold fun-gradient mb-6 drop-shadow-lg leading-tight" style={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
              Join the Pool, Skip the Fuel.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-xl mx-auto md:mx-0">
              Save fuel. Save money. Save that one guy always asking for a ride.
            </p>
            <Button onClick={handleGetStarted} size="lg" className="btn-fun px-10 py-5 text-lg shadow-xl">
              Get Started
            </Button>
          </div>
          <div className="flex-1 flex justify-center md:justify-end">
            {/* Illustration Placeholder - replace with SVG or image as needed */}
            <div className="w-[320px] h-[320px] bg-gradient-to-br from-accent/30 to-primary/20 rounded-3xl flex items-center justify-center shadow-2xl border-2 border-accent">
              <Car className="h-40 w-40 text-accent opacity-80" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <motion.section
        ref={featuresRef}
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="py-16 px-4 bg-gradient-to-r from-background via-muted/30 to-accent/10 animate-fade-in will-change-transform"
      >
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center fun-gradient mb-12 animate-fade-in">Why Choose UniPool?</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
            {heroCards.map((card) => (
              <Card key={card.title} className="flex-1 card-fun p-8 rounded-3xl shadow-2xl border-2 border-accent bg-gradient-to-br from-card via-card/80 to-accent/10 hover:shadow-accent/20 flex flex-col items-center">
                <CardHeader className="flex flex-col items-center gap-2 p-0 mb-2">
                  <div className="mb-2">{card.icon}</div>
                  <CardTitle className="fun-gradient text-2xl font-extrabold drop-shadow-md mb-1 text-center">{card.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center p-0">
                  <CardDescription className="text-base text-muted-foreground font-semibold text-center max-w-xs">{card.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-12">
                          <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">For Drivers</h3>
                <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    1
                  </span>
                  Post your ride with pickup area, destination, and departure time
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    2
                  </span>
                  Set recurring rides for your regular schedule
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    3
                  </span>
                  Accept ride requests and coordinate pickup details
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    4
                  </span>
                  Complete the ride and rate your passengers
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4">For Riders</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    1
                  </span>
                  Search for rides by area, destination, and time
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    2
                  </span>
                  Request to join rides with your specific pickup point
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    3
                  </span>
                  Get confirmation and coordinate with your driver
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    4
                  </span>
                  Enjoy your ride and rate your driver
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted text-foreground py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Car className="h-6 w-6" />
            <span className="text-xl font-bold">UniPool</span>
          </div>
          <p className="text-muted-foreground">Connecting FCC students through safe, convenient ride sharing</p>
        </div>
      </footer>
    </div>
  )
}
