"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Users, Star, MapPin, UserCheck, Search, Map, MessageCircle } from "lucide-react"
import { ApiAuthService } from "@/services/ApiAuthService"
import { motion, useScroll, useTransform, useMotionValue, useAnimationFrame } from "framer-motion"
import crestImg from "@/public/crest.png"
import phoneCarImg from "@/public/phone-car.png"
import carpoolGridImg from "@/public/carpool-grid.png"
import Image from "next/image"
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

// --- AnimatedCarStraightPath component for hero background ---
function AnimatedCarStraightPath({ carSize = 1, showArrivalGlow = false, active = false }: { carSize?: number, showArrivalGlow?: boolean, active?: boolean }) {
  // Animation progress (0 to 1)
  const [progress, setProgress] = useState<number>(0);
  const requestRef = useRef<number | undefined>();
  useEffect(() => {
    if (!active) {
      setProgress(0);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }
    let start: number | undefined;
    function animate(ts: number) {
      if (start === undefined) start = ts;
      let elapsed = (ts - start);
      let t = Math.min(elapsed / 1600, 1); // 1.6s to reach end
      // Ease out for slow stop
      t = t < 1 ? 1 - Math.pow(1 - t, 2.5) : 1;
      setProgress(t);
      if (t < 1) requestRef.current = requestAnimationFrame(animate);
    }
    setProgress(0);
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [active]);
  // Longer straight path: from x=60 to x=460, y=220
  const xStart = 60;
  const xEnd = 460;
  const y = 220;
  const path = `M ${xStart} ${y} L ${xEnd} ${y}`;
  const pathLength = xEnd - xStart;
  // Get car position and angle along the path
  function getPoint(p: number) {
    const x = xStart + (xEnd - xStart) * p;
    const angle = 0;
    return { x, y, angle };
  }
  const { x, angle } = getPoint(progress);
  const isArriving = progress > 0.98;
  return (
    <svg
      viewBox="0 0 520 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full max-w-2xl max-h-[80px] mx-auto"
      style={{ position: 'relative', left: 0, top: 0, right: 0, bottom: 0 }}
    >
      {/* Energetic, glowing path */}
      <path
        d={path}
        stroke="url(#gold-gradient-straight)"
        strokeWidth={14}
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength - pathLength * progress}
        style={{ filter: 'drop-shadow(0 0 32px #FFD700)' }}
        opacity="0.95"
        fill="none"
      />
      {/* Static faint path for context */}
      <path
        d={path}
        stroke="#FFC857"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray="16 12"
        opacity="0.18"
        fill="none"
      />
      {/* Car at current position, larger and with arrival glow if at end */}
      <g transform={`translate(${x},${y}) rotate(${angle}) scale(${carSize})`}>
        {showArrivalGlow && isArriving && (
          <g>
            <circle cx="0" cy="0" r="32" fill="#FFD700" opacity="0.18">
              <animate attributeName="r" values="24;40;24" dur="0.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="0" cy="0" r="18" fill="#FFD700" opacity="0.12">
              <animate attributeName="r" values="12;28;12" dur="0.8s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
        {/* Gold glossy car SVG */}
        <g filter="url(#car-glow)">
          <rect x="-22" y="-12" rx="8" width="44" height="24" fill="#FFC857" stroke="#FFD700" strokeWidth="3" />
          <ellipse cx="0" cy="10" rx="16" ry="6" fill="#FFD700" opacity="0.25" />
          <rect x="-10" y="-10" width="20" height="10" rx="3" fill="#18181B" />
          <circle cx="-12" cy="10" r="4" fill="#23272f" stroke="#FFD700" strokeWidth="2" />
          <circle cx="12" cy="10" r="4" fill="#23272f" stroke="#FFD700" strokeWidth="2" />
          {/* Shine */}
          <ellipse cx="0" cy="-8" rx="10" ry="3" fill="#fff" opacity="0.18" />
        </g>
      </g>
      {/* Car glow filter and gold gradient */}
      <defs>
        <filter id="car-glow" x="-40" y="-30" width="80" height="60" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="gold-gradient-straight" x1="60" y1="220" x2="460" y2="220" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD700" />
          <stop offset="0.5" stopColor="#FFC857" />
          <stop offset="1" stopColor="#FFD700" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeCard, setActiveCard] = useState(0)
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const howItWorksRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const [isCarActive, setIsCarActive] = useState(false)

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
    const fetchUser = async () => {
      try {
        const user = await ApiAuthService.getCurrentUser()
        setIsLoggedIn(!!user)
      } catch (err) {
        setIsLoggedIn(false) // Not authenticated, show guest view
      }
    }
    fetchUser()
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
        style={{ scale: headerScale, boxShadow: headerShadow, zIndex: 50, position: 'sticky', top: 0, background: 'rgba(24,24,27,0.92)', backdropFilter: 'blur(8px)', transition: 'box-shadow 0.3s' }}
        className="border-b border-border shadow-lg"
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {/* Gold-accented logo */}
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="#FFC857" strokeWidth="3" fill="#18181B" />
              <path d="M12 28L20 12L28 28" stroke="#FFC857" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="20" cy="25" r="2.5" fill="#FFC857" />
            </svg>
            <span className="text-3xl font-extrabold tracking-tight text-[#FFC857] drop-shadow-lg">UniPool</span>
          </div>
          <div className="flex space-x-4">
            <Button onClick={() => router.push("/auth/login")}
              className="bg-[#FFC857] text-[#18181B] font-semibold border-2 border-[#FFC857] hover:bg-[#FFD700] transition">
              Login
            </Button>
            <Button onClick={() => router.push("/auth/register")}
              className="bg-[#18181B] text-[#FFC857] font-semibold border-2 border-[#FFC857] hover:bg-[#23272f] transition">
              Register
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section with car animation above the headline */}
      <motion.section
        ref={heroRef}
        style={{ scale: heroScale, opacity: heroOpacity, background: '#18181B' }}
        className="relative py-16 px-4 flex flex-col items-center justify-start min-h-[60vh] text-center text-[#FFC857] overflow-hidden will-change-transform"
      >
        {/* Energetic shining/aurora background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Animated radial shine */}
          <div className="absolute left-1/2 top-1/6 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[40vh] bg-gradient-radial from-[#FFD70033] via-[#FFC85722] to-transparent animate-pulse-slow rounded-full blur-2xl opacity-80" />
          {/* Subtle aurora wave */}
          <div className="absolute left-0 right-0 top-1/3 w-full h-24 bg-gradient-to-r from-[#FFD70022] via-[#FFC85733] to-transparent blur-2xl opacity-60 animate-aurora" />
        </div>
        {/* Headline, subheading, and button perfectly aligned above the path */}
        <div className="relative z-20 flex flex-col items-center justify-center mt-4" style={{ marginBottom: '0.5rem' }}>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-3 drop-shadow-xl">Your Campus Carpool, Reimagined</h1>
          <p className="text-xl md:text-2xl font-medium mb-7 max-w-2xl mx-auto drop-shadow-lg text-[#F3F4F6]">
            Find or offer rides with fellow students. Save money, make friends, and help the planet — all in one energetic, secure platform.
          </p>
          <Button
            size="lg"
            className="bg-[#FFC857] text-[#18181B] font-extrabold px-12 py-5 text-2xl shadow-xl hover:bg-[#FFD700] transition rounded-full mb-2"
            onClick={handleGetStarted}
            onMouseEnter={() => setIsCarActive(true)}
            onMouseLeave={() => setIsCarActive(false)}
            onFocus={() => setIsCarActive(true)}
            onBlur={() => setIsCarActive(false)}
          >
            Get Started
          </Button>
          {/* Car animation straight path directly under the button, only active on hover/focus */}
          <div className="relative w-full flex items-center justify-center" style={{ height: '60px', marginTop: '-8px' }}>
            <div style={{ width: '420px', maxWidth: '95vw' }}>
              <AnimatedCarStraightPath carSize={1.15} showArrivalGlow active={isCarActive} />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features (What Makes UniPool Different) */}
      <section className="relative py-20 px-4 bg-[#18181B]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#FFC857] text-center mb-4">What Makes UniPool Different?</h2>
          <div className="mx-auto mb-10 flex justify-center">
            <div className="h-1 w-32 bg-gradient-to-r from-[#FFD700] via-[#FFC857] to-[#FFD700] rounded-full animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {featureHighlights.map((feature, i) => {
              const [flipped, setFlipped] = useState(false);
              return (
                <motion.div
                  key={feature.title}
                  className="group perspective-1000"
                  onMouseEnter={() => setFlipped(true)}
                  onMouseLeave={() => setFlipped(false)}
                  onTouchStart={() => setFlipped((f) => !f)}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.6, type: 'spring' }}
                  viewport={{ once: true }}
                  style={{ perspective: 1000 }}
                >
                  <motion.div
                    className="relative w-full h-64 cursor-pointer"
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Front Side */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#23272f] bg-opacity-80 border-2 border-[#FFC857] rounded-2xl shadow-lg overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
                      <div className="mb-4 flex items-center justify-center relative">
                        <div className="w-16 h-16 rounded-full bg-[#18181B] border-2 border-[#FFC857] flex items-center justify-center shadow-gold-glow relative overflow-hidden">
                          <img src={feature.icon} alt={feature.title + ' icon'} className="w-9 h-9 object-contain z-10" />
                          {/* Animated gold shine overlay */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#FFD70099] to-transparent opacity-60 pointer-events-none"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                          />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-[#FFC857] mb-2 z-10">{feature.title}</h3>
                    </div>
                    {/* Back Side */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#23272f] bg-opacity-90 border-2 border-[#FFC857] rounded-2xl shadow-lg overflow-hidden" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
                      <div className="mb-4 flex items-center justify-center relative">
                        {/* Gold shimmer/sparkle */}
                        <motion.div
                          className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-[#FFD70066] via-[#FFC85799] to-transparent opacity-70 blur-2xl animate-pulse"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        />
                        <img src={feature.icon} alt={feature.title + ' icon'} className="w-9 h-9 object-contain z-10" />
                      </div>
                      <p className="text-base text-[#FFC857] font-semibold px-4 text-center z-10">{feature.desc}</p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 px-4 bg-[#18181B]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#FFC857] text-center mb-4">How UniPool Works</h2>
          <div className="mx-auto mb-10 flex justify-center">
            <div className="h-1 w-32 bg-gradient-to-r from-[#FFD700] via-[#FFC857] to-[#FFD700] rounded-full animate-pulse" />
          </div>
          <div className="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0 items-start">
            {tutorialSteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6, type: 'spring' }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.06, rotateX: 6, boxShadow: '0 8px 32px 0 #FFC85755' }}
                className="relative flex-1 bg-[#23272f] border-2 border-[#FFC857] rounded-2xl p-8 flex flex-col items-center text-center shadow-lg hover:shadow-2xl transition will-change-transform"
                style={{ boxShadow: '0 2px 16px 0 #FFC85733' }}
              >
                {/* Gold number badge with pulse/shine */}
                <div className="mb-4 flex items-center justify-center relative">
                  <motion.div
                    className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FFD700] via-[#FFC857] to-[#FFD700] text-[#18181B] flex items-center justify-center font-extrabold text-3xl border-2 border-[#FFD700] shadow-gold-glow relative overflow-hidden"
                    animate={{ scale: [1, 1.08, 1], boxShadow: [
                      '0 0 24px 4px #FFC85733',
                      '0 0 36px 8px #FFD70066',
                      '0 0 24px 4px #FFC85733'
                    ] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  >
                    {i + 1}
                    {/* Animated shine */}
                    <motion.div
                      className="absolute left-0 top-0 w-full h-full bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-40 pointer-events-none"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                    />
                  </motion.div>
                </div>
                <div className="mb-2 text-3xl text-[#FFC857]">{step.icon}</div>
                <h3 className="text-lg font-bold text-[#FFC857] mb-1">{step.title}</h3>
                <p className="text-base text-[#F3F4F6] mb-2">{step.desc}</p>
                {/* Animated connector (desktop only, not last step) */}
                {i < tutorialSteps.length - 1 && (
                  <motion.div
                    className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-1 bg-gradient-to-r from-[#FFC857] to-transparent opacity-60"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.7, type: 'spring' }}
                    style={{ transformOrigin: 'left' }}
                  />
                )}
                {/* Optional sparkle/micro-interaction on hover */}
                <motion.div
                  className="absolute -top-4 -right-4 w-8 h-8 pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1, scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                  style={{ zIndex: 2 }}
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 2v6M16 24v6M2 16h6M24 16h6M7.757 7.757l4.243 4.243M20 20l4.243 4.243M7.757 24.243l4.243-4.243M20 12l4.243-4.243" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/></svg>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#18181B] flex flex-col items-center justify-center border-t border-[#23272f]">
        <div className="flex items-center space-x-3 mb-2">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" stroke="#FFC857" strokeWidth="3" fill="#18181B" />
            <path d="M12 28L20 12L28 28" stroke="#FFC857" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="20" cy="25" r="2.5" fill="#FFC857" />
          </svg>
          <span className="text-2xl font-extrabold text-[#FFC857] tracking-tight">UniPool</span>
        </div>
        <p className="text-[#F3F4F6] text-lg text-center max-w-xl mb-2">Connecting FCC students through safe, convenient ride sharing</p>
        <div className="h-1 w-24 bg-gradient-to-r from-[#FFD700] via-[#FFC857] to-[#FFD700] rounded-full animate-pulse mb-2" />
      </footer>
    </div>
  )
}
