import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, useSpring, AnimatePresence, useReducedMotion, useMotionValueEvent } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu, X, ArrowRight, Activity, PieChart, Zap, CreditCard, LayoutDashboard } from 'lucide-react';

// Utilities
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);
  return matches;
};

const FadeUp = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 1. Navigation
const LandingNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 100], [0, 0.95]);
  const blur = useTransform(scrollY, [0, 100], [0, 8]);
  const { user } = useSelector(state => state.auth);

  return (
    <>
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex items-center justify-between pointer-events-none"
      >
        {/* Background layer */}
        <motion.div 
          className="absolute inset-0 bg-cream pointer-events-auto border-b border-cream-secondary"
          style={{ opacity: bgOpacity, backdropFilter: `blur(${blur}px)` }}
        />
        
        <Link to="/" className="relative z-10 font-serif text-3xl tracking-tighter text-ink pointer-events-auto">Sundae</Link>
        
        <div className="hidden md:flex relative z-10 items-center space-x-10 font-medium text-xs tracking-[0.2em] uppercase pointer-events-auto">
          <a href="#showcase" className="text-ink hover:text-yellow transition-colors">Experience</a>
          <a href="#features" className="text-ink hover:text-yellow transition-colors">Features</a>
          {user ? (
            <Link to="/app" className="bg-ink text-cream px-6 py-3 hover:bg-yellow hover:text-ink transition-colors">
              Dashboard
            </Link>
          ) : (
            <Link to="/register" className="bg-ink text-cream px-6 py-3 hover:bg-yellow hover:text-ink transition-colors">
              Start
            </Link>
          )}
        </div>

        <button 
          className="md:hidden relative z-50 p-2 text-ink pointer-events-auto" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X strokeWidth={1.5} size={32} /> : <Menu strokeWidth={1.5} size={32} />}
        </button>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-ink flex flex-col justify-center px-12"
          >
            <div className="flex flex-col space-y-6">
              {[
                { name: 'Experience', href: '#showcase' },
                { name: 'Features', href: '#features' },
                user ? { name: 'Dashboard', href: '/app' } : { name: 'Sign up', href: '/register' },
                !user && { name: 'Sign in', href: '/login' }
              ].filter(Boolean).map((link, i) => (
                <motion.div 
                  key={link.name}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  {link.href.startsWith('#') ? (
                    <a href={link.href} onClick={() => setIsOpen(false)} className="font-serif text-5xl sm:text-7xl text-cream hover:text-yellow transition-colors">
                      {link.name}
                    </a>
                  ) : (
                    <Link to={link.href} onClick={() => setIsOpen(false)} className="font-serif text-5xl sm:text-7xl text-cream hover:text-yellow transition-colors">
                      {link.name}
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// 2. Hero (Experimental)
const Hero = ({ onInitialize }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  
  useEffect(() => {
    if (isMobile || reducedMotion) return;
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile, reducedMotion]);

  const smoothX = useSpring(mousePos.x, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mousePos.y, { stiffness: 50, damping: 20 });

  return (
    <>
      <section className="relative min-h-screen pt-32 pb-20 px-6 overflow-hidden bg-cream flex flex-col justify-center">
      <div className="max-w-[1400px] mx-auto w-full relative z-10 flex flex-col lg:flex-row items-center justify-between">
        
        {/* Typographic Core */}
        <div className="w-full lg:w-[60%] relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="text-xs uppercase tracking-[0.3em] font-medium text-olive mb-12 flex items-center space-x-4"
          >
            <div className="w-8 h-px bg-olive" />
            <span>The clarity engine</span>
          </motion.div>
          
          <h1 className="font-serif text-[14vw] lg:text-[8rem] leading-[0.9] tracking-tighter text-ink m-0">
            <motion.div 
              initial={{ opacity: 0, y: 40, rotateZ: 2 }}
              animate={{ opacity: 1, y: 0, rotateZ: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              MAKE SENSE
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 40, rotateZ: 2 }}
              animate={{ opacity: 1, y: 0, rotateZ: 0 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative inline-block mt-4 lg:mt-0"
            >
              <span className="relative z-10">OF YOUR MONEY.</span>
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-[10%] left-0 w-[105%] h-[35%] bg-yellow origin-left -z-0 mix-blend-multiply"
              />
            </motion.div>
          </h1>
          
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1, delay: 1 }}
             className="mt-16 lg:mt-24"
          >
            <button onClick={onInitialize} className="inline-flex items-center space-x-6 group cursor-pointer border border-ink/10 pl-2 pr-8 py-2 rounded-full hover:border-ink/30 transition-colors bg-white outline-none">
              <div className="w-12 h-12 rounded-full bg-ink flex items-center justify-center group-hover:bg-yellow group-hover:scale-95 transition-all duration-300">
                <ArrowRight className="text-cream group-hover:text-ink w-5 h-5 transition-colors" />
              </div>
              <span className="font-medium tracking-[0.2em] uppercase text-xs text-ink">
                Initialize
              </span>
            </button>
          </motion.div>
        </div>

        {/* Abstract Object (Aesthetic / Gen-Z) */}
        <div className="w-full lg:w-[40%] mt-20 lg:mt-0 relative h-[500px] flex items-center justify-center perspective-[2000px]">
          
          <motion.div 
            style={isMobile || reducedMotion ? {} : { rotateX: smoothY, rotateY: smoothX }}
            className="relative w-full h-full max-w-[400px] transform-style-3d flex items-center justify-center"
          >
            {/* Spinning Circular Text */}
            <motion.div 
              animate={reducedMotion ? {} : { rotate: 360 }} 
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute w-[350px] h-[350px] opacity-40 pointer-events-none"
              style={{ transform: 'translateZ(-60px)' }}
            >
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                <defs>
                  <path id="circlePath" d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" />
                </defs>
                <text className="text-[9px] font-medium tracking-[0.2em] fill-ink uppercase">
                  <textPath href="#circlePath" startOffset="0%">
                    Personal Capital • Financial Clarity • System Online • 
                  </textPath>
                </text>
              </svg>
            </motion.div>

            {/* The Receipt / Log (Background Layer) */}
            <motion.div 
              initial={{ opacity: 0, y: 50, rotateZ: -5 }}
              animate={{ opacity: 1, y: 0, rotateZ: -5 }}
              transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute w-56 h-80 bg-[#FDFCF8] border border-ink/10 shadow-xl p-5 flex flex-col font-mono text-[10px] text-ink/60"
              style={{ transform: 'translateZ(-20px)' }}
            >
              <div className="flex justify-between border-b border-ink/10 pb-3 mb-3 uppercase tracking-widest text-ink font-bold">
                <span>Receipt</span>
                <span>#4092</span>
              </div>
              <div className="flex justify-between py-1.5"><span>System</span><span>OK</span></div>
              <div className="flex justify-between py-1.5"><span>Sync</span><span>24ms</span></div>
              <div className="flex justify-between py-1.5"><span>Capital</span><span>Verified</span></div>
              <div className="flex justify-between py-1.5"><span>Anomalies</span><span>0</span></div>
              <div className="mt-auto border-t border-ink/10 pt-3 flex justify-between items-end">
                <span>Total</span><span className="text-ink font-bold font-serif text-lg leading-none">₹24,500</span>
              </div>
            </motion.div>

            {/* The Main Dark Card */}
            <motion.div 
              initial={{ opacity: 0, y: 50, rotateZ: 5 }}
              animate={{ opacity: 1, y: 0, rotateZ: 5 }}
              transition={{ duration: 1.5, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute w-64 h-40 bg-[#171714]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden"
              style={{ transform: 'translateZ(40px)' }}
            >
              {/* Noise texture overlay */}
              <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGZpbHRlciBpZD0ibm9pc2UiPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjgiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgibm9pc2UpIiBvcGFjaXR5PSIwLjMiLz48L3N2Zz4=')]" />
              
              <div className="relative z-10 flex justify-between items-start">
                <div className="w-10 h-10 rounded-full bg-yellow flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#171714" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"/></svg>
                </div>
                <div className="text-white/40 text-[10px] tracking-widest uppercase font-mono">Status: Active</div>
              </div>
              <div className="relative z-10 font-serif text-5xl text-cream tracking-tighter leading-none mt-2">
                82% <span className="text-sm font-sans text-white/40 tracking-widest font-medium uppercase ml-2">Growth</span>
              </div>
            </motion.div>

            {/* Floating Badges */}
            <motion.div 
              animate={reducedMotion ? {} : { y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[15%] left-[5%] bg-yellow border border-ink/20 text-ink font-bold text-[10px] px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg rotate-[-12deg]"
              style={{ transform: 'translateZ(80px)' }}
            >
              100% Valid
            </motion.div>

            <motion.div 
              animate={reducedMotion ? {} : { y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[20%] right-[5%] bg-coral text-ink font-bold text-[10px] px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg border border-ink/10 rotate-[5deg]"
              style={{ transform: 'translateZ(60px)' }}
            >
              Verified +
            </motion.div>

            <motion.div 
              animate={reducedMotion ? {} : { scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-1/4 -right-4 w-12 h-12 bg-olive/20 backdrop-blur-md rounded-full border border-olive/30 flex items-center justify-center shadow-lg"
              style={{ transform: 'translateZ(100px)' }}
            >
              <Activity className="w-5 h-5 text-olive" />
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
    </>
  );
};

// 3. Creative Scroll Intro
const MoneyIntro = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  const value = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 10000]);
  const displayValue = useTransform(value, v => `₹ ${Math.floor(v).toLocaleString()}`);
  const textOpacity = useTransform(scrollYProgress, [0.8, 1], [0, 1]);
  const numOpacity = useTransform(scrollYProgress, [0.7, 0.9], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-[120vh] bg-[#FDFCF8] flex items-center justify-center overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-[30%] bg-ink/10" />
      
      <div className="sticky top-1/2 -translate-y-1/2 text-center">
        <motion.div style={{ opacity: numOpacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div className="font-serif text-[15vw] tracking-tighter text-ink/20 whitespace-nowrap">
            {displayValue}
          </motion.div>
        </motion.div>
        
        <motion.div style={{ opacity: textOpacity }} className="relative z-10 font-serif text-[10vw] md:text-8xl leading-none tracking-tighter text-ink">
          Every number <br />
          <span className="text-olive">tells a story.</span>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-[30%] bg-ink/10" />
    </section>
  );
};

// 4. Product Showcase (Interactive Editorial)
const ProductShowcase = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.4], [40, 0]);
  const y = useTransform(scrollYProgress, [0, 0.4], [200, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.8, 1]);

  return (
    <section id="showcase" ref={containerRef} className="py-40 px-6 bg-[#FDFCF8] overflow-hidden perspective-[2000px]">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          style={{ rotateX, y, scale }}
          className="relative rounded-3xl bg-white border border-cream-secondary shadow-2xl overflow-hidden transform-style-3d"
        >
          {/* Header */}
          <div className="h-14 border-b border-cream-secondary flex items-center px-6 space-x-3 bg-cream/30">
            <div className="w-3 h-3 rounded-full bg-coral/80" />
            <div className="w-3 h-3 rounded-full bg-yellow/80" />
            <div className="w-3 h-3 rounded-full bg-olive/80" />
          </div>
          
          <div className="p-8 md:p-12 grid md:grid-cols-12 gap-12 bg-white">
            {/* Sidebar */}
            <div className="hidden md:block col-span-3 space-y-12">
              <div className="space-y-4">
                <div className="h-4 w-20 bg-ink/5 rounded-sm" />
                <div className="h-8 w-full bg-ink/5 rounded-sm" />
                <div className="h-8 w-3/4 bg-ink/5 rounded-sm" />
              </div>
              <div className="space-y-4">
                <div className="h-4 w-20 bg-ink/5 rounded-sm" />
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded bg-ink/5" />
                    <div className="h-4 w-24 bg-ink/5 rounded-sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="col-span-12 md:col-span-9 space-y-12">
              <div className="flex justify-between items-end border-b border-cream-secondary pb-6">
                <div>
                  <FadeUp delay={0.2}><div className="text-xs uppercase tracking-widest text-olive mb-2">Total Balance</div></FadeUp>
                  <FadeUp delay={0.3}><div className="font-serif text-5xl">₹24,500.00</div></FadeUp>
                </div>
                <FadeUp delay={0.4}>
                  <div className="h-10 w-32 bg-ink text-cream text-xs uppercase tracking-widest flex items-center justify-center rounded-full">
                    Add Entry
                  </div>
                </FadeUp>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { label: "Income", value: "₹80,000", bg: "bg-ink", text: "text-cream", highlight: "bg-yellow", icon: <ArrowRight className="w-4 h-4 -rotate-45" /> },
                  { label: "Expenses", value: "₹45,200", bg: "bg-white", text: "text-ink", border: true, highlight: "bg-coral", icon: <ArrowRight className="w-4 h-4 rotate-45" /> },
                  { label: "Transfers", value: "₹10,300", bg: "bg-[#F3F0E6]", text: "text-ink", highlight: "bg-olive", icon: <ArrowRight className="w-4 h-4" /> }
                ].map((card, i) => (
                  <FadeUp key={i} delay={0.4 + (i * 0.1)}>
                    <motion.div 
                      whileHover={{ scale: 1.02, rotateZ: i === 1 ? 1 : -1 }}
                      className={`relative p-6 rounded-2xl ${card.bg} ${card.text} ${card.border ? 'border border-cream-secondary' : ''} h-36 flex flex-col justify-between overflow-hidden group cursor-crosshair`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-[10px] uppercase tracking-widest opacity-60 font-mono">{card.label}</div>
                        <div className={`w-8 h-8 rounded-full ${card.highlight} text-ink flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110`}>
                          {card.icon}
                        </div>
                      </div>
                      <div className="font-serif text-3xl z-10">{card.value}</div>
                      
                      {/* Decorative background element */}
                      {i === 0 && <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />}
                    </motion.div>
                  </FadeUp>
                ))}
              </div>

              <div>
                <FadeUp delay={0.7}><div className="text-[10px] uppercase tracking-[0.2em] text-olive mb-6 font-mono border-b border-cream-secondary pb-4">Recent Ledger Activity</div></FadeUp>
                <div className="space-y-3 mt-4">
                  {[
                    { title: "Design Subscription", amount: "-₹1,200", type: "expense", color: "bg-coral", date: "Today, 14:20" },
                    { title: "Client Retainer", amount: "+₹45,000", type: "income", color: "bg-yellow", date: "Yesterday" },
                    { title: "Server Costs", amount: "-₹3,400", type: "expense", color: "bg-olive", date: "Oct 12" }
                  ].map((item, i) => (
                    <FadeUp key={i} delay={0.8 + (i * 0.1)}>
                      <motion.div 
                        whileHover={{ x: 10 }}
                        className="group relative flex items-center justify-between p-4 rounded-xl border border-cream-secondary/50 hover:bg-[#F3F0E6] hover:border-cream-secondary transition-all cursor-pointer overflow-hidden"
                      >
                        {/* Hover indicator strip */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.color} transform -translate-x-full group-hover:translate-x-0 transition-transform`} />
                        
                        <div className="flex items-center space-x-4 relative z-10">
                          <div className={`w-10 h-10 rounded-full ${item.color}/10 flex items-center justify-center`}>
                            <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          </div>
                          <div>
                            <div className="font-medium text-ink mb-1">{item.title}</div>
                            <div className="text-[10px] uppercase tracking-widest text-olive font-mono">{item.date}</div>
                          </div>
                        </div>
                        <div className="font-serif text-xl text-ink relative z-10">{item.amount}</div>
                      </motion.div>
                    </FadeUp>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// 5. Cinematic Feature Journey (Numa-Inspired Minimalist Showcase)
const FeatureJourney = () => {
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Track active chapter as user scrolls through the 300vh container
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    let next = 0;
    if (latest >= 0.75) next = 3;
    else if (latest >= 0.50) next = 2;
    else if (latest >= 0.25) next = 1;
    setActiveTab((prev) => (prev !== next ? next : prev));
  });

  const handleSelectTab = (index) => {
    setActiveTab(index);
    if (containerRef.current) {
      const top = containerRef.current.offsetTop;
      const height = containerRef.current.offsetHeight;
      const targetScroll = top + (index / 3.2) * (height - window.innerHeight);
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  };

  const chapters = [
    {
      id: "convergence",
      num: "01",
      name: "Convergence",
      title: "All in one.",
      desc: "Bank accounts, cards, and cash. Automatically synced into one clean view."
    },
    {
      id: "guardrails",
      num: "02",
      name: "Guardrails",
      title: "Smart limits.",
      desc: "Visual caps that keep your spending in check without checking spreadsheets."
    },
    {
      id: "analytics",
      num: "03",
      name: "Analytics",
      title: "Clean breakdown.",
      desc: "Instant visual flow of your capital. Clear categories, zero manual math."
    },
    {
      id: "intelligence",
      num: "04",
      name: "Intelligence",
      title: "Instant signals.",
      desc: "Quiet alerts for unusual spikes, double charges, and price shifts."
    }
  ];

  return (
    <section ref={containerRef} className="relative bg-[#11110F] text-[#F7F4EC] w-full font-sans">
      {/* 300vh scroll track */}
      <div className="h-[300vh] relative">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center px-6 lg:px-16 overflow-hidden">
          
          <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 py-12">
            
            {/* Left Column: Heading, Minimal Selector & Active Story */}
            <div className="w-full lg:w-5/12 flex flex-col justify-between z-10">
              <div>
                {/* Minimal Kicker */}
                <div className="text-[11px] uppercase tracking-[0.25em] text-[#E8D75A] font-mono mb-4 flex items-center space-x-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8D75A]" />
                  <span>01 — 04 // THE FLOW</span>
                </div>

                {/* Section Main Title with Modern Bold Sans */}
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F7F4EC] tracking-tight leading-[1.05] mb-8">
                  Money, <br />
                  <span className="text-[#E8D75A]">clarified.</span>
                </h2>

                {/* Minimal Tab Selector (Numa style, refined) */}
                <div className="space-y-3 mb-10">
                  {chapters.map((chapter, idx) => {
                    const isActive = activeTab === idx;
                    return (
                      <button
                        key={chapter.id}
                        type="button"
                        onClick={() => handleSelectTab(idx)}
                        className="w-full flex items-center justify-between py-2 text-left group cursor-pointer transition-all outline-none"
                      >
                        <div className="flex items-center space-x-4">
                          {/* Radio Dot indicator */}
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isActive 
                              ? 'border border-[#E8D75A]' 
                              : 'border border-white/20 group-hover:border-white/40'
                          }`}>
                            <motion.div 
                              animate={{ scale: isActive ? 1 : 0 }}
                              transition={{ type: "spring", stiffness: 450, damping: 28 }}
                              className="w-1.5 h-1.5 rounded-full bg-[#E8D75A]"
                            />
                          </div>

                          {/* Item Name */}
                          <span className={`text-sm tracking-wider font-mono uppercase transition-colors duration-300 ${
                            isActive 
                              ? 'text-[#F7F4EC] font-semibold' 
                              : 'text-white/40 group-hover:text-white/70'
                          }`}>
                            {chapter.num} &nbsp;{chapter.name}
                          </span>
                        </div>

                        {/* Subtle arrow indicator for active state */}
                        <span className={`text-xs font-mono transition-opacity duration-300 ${isActive ? 'opacity-100 text-[#E8D75A]' : 'opacity-0'}`}>
                          →
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Chapter Details */}
              <div className="min-h-[100px] pt-6 border-t border-white/[0.08]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <h3 className="text-2xl sm:text-3xl font-bold text-[#F7F4EC] mb-2 tracking-tight">
                      {chapters[activeTab].title}
                    </h3>
                    <p className="text-white/50 text-sm sm:text-base font-normal leading-relaxed max-w-sm">
                      {chapters[activeTab].desc}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Right Column: Sleek Matte Hardware Card */}
            <div className="w-full lg:w-7/12 flex items-center justify-center z-10">
              <div className="w-full max-w-xl aspect-[16/11] bg-[#141412] border border-white/[0.08] rounded-[2rem] shadow-2xl overflow-hidden relative">
                
                {/* Ambient vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(232,215,90,0.06),_transparent_60%)] pointer-events-none" />

                <AnimatePresence mode="wait">
                  {activeTab === 0 && (
                    <motion.div
                      key="convergence"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full flex flex-col justify-between p-8 lg:p-10 relative"
                    >
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">01 / BALANCES</span>
                        <span className="font-mono text-[11px] text-[#E8D75A] flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E8D75A] animate-pulse" />
                          <span>LIVE</span>
                        </span>
                      </div>

                      <div className="my-auto py-2">
                        <div className="text-[11px] uppercase tracking-[0.2em] font-mono text-white/40 mb-1">Total Position</div>
                        <div className="text-4xl sm:text-5xl font-bold text-[#F7F4EC] tracking-tight flex items-baseline space-x-3">
                          <span>₹1,65,200</span>
                          <span className="font-mono text-xs font-normal text-[#E8D75A] tracking-normal">↑ 8.4%</span>
                        </div>

                        <div className="space-y-2.5 mt-6 pt-5 border-t border-white/[0.06]">
                          {[
                            { name: "Primary Checking", balance: "₹1,24,500", tag: "Synced" },
                            { name: "Credit Facility", balance: "−₹28,300", tag: "Due 7d" },
                            { name: "Liquid Reserve", balance: "₹12,400", tag: "Available" }
                          ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between py-1 text-xs font-mono">
                              <span className="text-white/60">{item.name}</span>
                              <div className="flex items-center space-x-3">
                                <span className="text-[#F7F4EC] font-semibold">{item.balance}</span>
                                <span className="text-[10px] text-white/30 w-14 text-right">{item.tag}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-[11px] font-mono text-white/30 flex items-center justify-between border-t border-white/[0.06] pt-3">
                        <span>3 accounts connected</span>
                        <span>Auto-synced</span>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 1 && (
                    <motion.div
                      key="guardrails"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full flex flex-col justify-between p-8 lg:p-10 relative"
                    >
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">02 / GUARDRAIL</span>
                        <span className="font-mono text-[11px] text-[#E8D75A]">75% PACED</span>
                      </div>

                      <div className="my-auto py-2">
                        <div className="text-[11px] uppercase tracking-[0.2em] font-mono text-white/40 mb-1">Monthly Ceiling</div>
                        <div className="text-4xl sm:text-5xl font-bold text-[#F7F4EC] tracking-tight">
                          ₹15,000 <span className="text-white/30 text-2xl font-normal">/ ₹20,000</span>
                        </div>

                        {/* Minimal Progress Track */}
                        <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden mt-6 relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "75%" }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full bg-gradient-to-r from-[#E8D75A] to-[#E88268] rounded-full"
                          />
                        </div>

                        <div className="flex justify-between items-center mt-2.5 text-[11px] font-mono text-white/40">
                          <span>₹0</span>
                          <span className="text-[#E8D75A]">₹5,000 safe margin</span>
                          <span>₹20,000</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/[0.06]">
                          {[
                            { name: "Dining", spend: "₹6,200" },
                            { name: "Living", spend: "₹5,400" },
                            { name: "Transit", spend: "₹3,400" }
                          ].map((cat, i) => (
                            <div key={i} className="text-xs font-mono">
                              <div className="text-[10px] text-white/40 uppercase">{cat.name}</div>
                              <div className="text-[#F7F4EC] font-semibold mt-0.5">{cat.spend}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-[11px] font-mono text-white/30 flex items-center justify-between border-t border-white/[0.06] pt-3">
                        <span>11 days remaining</span>
                        <span>Within safe limit</span>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 2 && (
                    <motion.div
                      key="analytics"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full flex flex-col justify-between p-8 lg:p-10 relative"
                    >
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">03 / ALLOCATION</span>
                        <span className="font-mono text-[11px] text-white/40">MAY 2026</span>
                      </div>

                      <div className="my-auto py-2">
                        {/* Segmented Distribution Strip */}
                        <div className="flex h-2 w-full rounded-full overflow-hidden bg-white/[0.08] mb-6 space-x-1">
                          <div className="w-[40%] bg-[#E8D75A] rounded-full" />
                          <div className="w-[30%] bg-[#7C8060] rounded-full" />
                          <div className="w-[18%] bg-[#C87855] rounded-full" />
                          <div className="w-[12%] bg-[#F7F3E8] rounded-full" />
                        </div>

                        <div className="space-y-2.5">
                          {[
                            { name: "Dining & Social", pct: "40%", val: "₹18,400", dot: "bg-[#E8D75A]" },
                            { name: "Living & Space", pct: "30%", val: "₹14,200", dot: "bg-[#7C8060]" },
                            { name: "Movement & Fuel", pct: "18%", val: "₹8,400", dot: "bg-[#C87855]" },
                            { name: "Core Reserve", pct: "12%", val: "₹5,600", dot: "bg-[#F7F3E8]" }
                          ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-xs font-mono py-1 border-b border-white/[0.03]">
                              <div className="flex items-center space-x-2.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                                <span className="text-white/70">{item.name}</span>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="text-white/40 text-[11px]">{item.pct}</span>
                                <span className="text-[#F7F4EC] font-semibold">{item.val}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-[11px] font-mono text-white/30 flex items-center justify-between border-t border-white/[0.06] pt-3">
                        <span>4 categories</span>
                        <span>Zero manual math</span>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 3 && (
                    <motion.div
                      key="intelligence"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full flex flex-col justify-between p-8 lg:p-10 relative"
                    >
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#E8D75A]">04 / SIGNAL</span>
                        <span className="font-mono text-[11px] text-[#E8D75A] flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E8D75A] animate-pulse" />
                          <span>TODAY</span>
                        </span>
                      </div>

                      <div className="my-auto py-2">
                        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] relative">
                          <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#E8D75A] mb-2">Notice</div>
                          <div className="text-2xl sm:text-3xl font-bold text-[#F7F4EC] tracking-tight">
                            Dining is up <span className="text-[#E8D75A]">18%</span> this week
                          </div>
                          
                          <p className="text-white/50 text-sm sm:text-base mt-2 leading-relaxed font-normal">
                            Three weekend outings totaled ₹4,280 outside typical pacing.
                          </p>

                          <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                            <span className="text-white/40">Buffer: Safe</span>
                            <span className="text-[#E8D75A]">Pacing adjusted →</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] font-mono text-white/30 flex items-center justify-between border-t border-white/[0.06] pt-3">
                        <span>Autonomous detection</span>
                        <span>No rules to configure</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

// 6. Signature Interaction: Money Flow
const MoneyFlow = () => {
  return (
    <section className="py-40 px-6 bg-cream overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <FadeUp className="text-center mb-32">
          <h2 className="font-serif text-6xl md:text-8xl tracking-tighter leading-none text-ink">FOLLOW THE MONEY.</h2>
        </FadeUp>

        <div className="relative w-full max-w-5xl mx-auto aspect-[10/6] mt-20 hidden md:block">
          
          {/* Fluid Curved SVG Path */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
              <motion.path 
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: "easeInOut" }}
                d="M 200,150 C 350,150 350,300 500,300" 
                fill="none" stroke="currentColor" strokeWidth="2" className="text-ink/10" strokeDasharray="8 8" 
              />
              <motion.path 
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                d="M 500,300 C 650,300 650,150 800,150" 
                fill="none" stroke="currentColor" strokeWidth="2" className="text-ink/10" strokeDasharray="8 8" 
              />
              <motion.path 
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                d="M 500,300 C 650,300 650,450 800,450" 
                fill="none" stroke="currentColor" strokeWidth="2" className="text-ink/10" strokeDasharray="8 8" 
              />
              
              {/* Moving Orbs along the paths */}
              <circle r="6" fill="#D4D386" className="text-olive">
                <animateMotion dur="4s" repeatCount="indefinite" path="M 200,150 C 350,150 350,300 500,300" />
              </circle>
              <circle r="6" fill="#E88268" className="text-coral">
                <animateMotion dur="4s" repeatCount="indefinite" path="M 500,300 C 650,300 650,150 800,150" />
              </circle>
              <circle r="6" fill="#F4CF68" className="text-yellow">
                <animateMotion dur="4s" repeatCount="indefinite" path="M 500,300 C 650,300 650,450 800,450" />
              </circle>
            </svg>
          </div>

          <div className="absolute inset-0 z-10">
            {/* Source: Income */}
            <div className="absolute left-[20%] top-[25%] -translate-x-1/2 -translate-y-1/2 group">
              <div className="w-40 h-24 bg-white border border-cream-secondary shadow-xl rounded-2xl flex flex-col items-center justify-center cursor-crosshair hover:scale-110 transition-all rotate-[-6deg]">
                <div className="text-[9px] uppercase tracking-widest text-olive mb-1">Source</div>
                <div className="font-serif text-2xl">Income</div>
              </div>
              <div className="absolute top-full mt-6 left-1/2 -translate-x-1/2 w-56 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="text-xs bg-ink text-cream p-4 rounded-xl shadow-2xl">Money enters your ecosystem here.</div>
              </div>
            </div>

            {/* Hub: Account */}
            <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 group">
              <div className="w-56 h-56 bg-ink rounded-[2rem] shadow-2xl flex flex-col items-center justify-center cursor-crosshair hover:scale-105 transition-all">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(244,207,104,0.15),_transparent_60%)]" />
                <div className="text-[10px] uppercase tracking-widest text-yellow mb-2 z-10">Hub</div>
                <div className="font-serif text-4xl text-cream z-10">Account</div>
              </div>
              <div className="absolute top-full mt-6 left-1/2 -translate-x-1/2 w-64 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <div className="text-xs bg-white text-ink p-4 rounded-xl shadow-2xl border border-cream-secondary">Your central holding. Transfers between accounts do not affect total net worth.</div>
              </div>
            </div>

            {/* Drain: Expense */}
            <div className="absolute left-[80%] top-[25%] -translate-x-1/2 -translate-y-1/2 group">
              <div className="w-40 h-24 bg-white border border-cream-secondary shadow-xl rounded-full flex flex-col items-center justify-center cursor-crosshair hover:scale-110 transition-all rotate-[4deg]">
                <div className="text-[9px] uppercase tracking-widest text-coral mb-1">Drain</div>
                <div className="font-serif text-2xl">Expense</div>
              </div>
              <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 w-56 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="text-xs bg-coral text-ink font-medium p-4 rounded-xl shadow-2xl">Money leaves your ecosystem. This affects net worth.</div>
              </div>
            </div>

            {/* Credit: Payment */}
            <div className="absolute left-[80%] top-[75%] -translate-x-1/2 -translate-y-1/2 group">
              <div className="w-40 h-24 bg-[#FDFCF8] border border-cream-secondary shadow-xl rounded-xl flex flex-col items-center justify-center cursor-crosshair hover:scale-110 transition-all rotate-[-2deg]">
                <div className="text-[9px] uppercase tracking-widest text-yellow mb-1">Credit</div>
                <div className="font-serif text-2xl">Payment</div>
              </div>
              <div className="absolute top-full mt-6 left-1/2 -translate-x-1/2 w-56 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <div className="text-xs bg-yellow text-ink font-medium p-4 rounded-xl shadow-2xl border border-ink/10">A transfer from Bank to Credit Card. Net impact: ₹0.</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile fallback */}
        <div className="md:hidden flex flex-col space-y-8 mt-12 items-center">
          <div className="w-40 h-24 bg-white border border-cream-secondary shadow-xl rounded-2xl flex flex-col items-center justify-center">
            <div className="text-[9px] uppercase tracking-widest text-olive mb-1">Source</div>
            <div className="font-serif text-2xl">Income</div>
          </div>
          <div className="w-px h-12 bg-ink/20" />
          <div className="w-56 h-56 bg-ink rounded-[2rem] shadow-2xl flex flex-col items-center justify-center">
            <div className="text-[10px] uppercase tracking-widest text-yellow mb-2 z-10">Hub</div>
            <div className="font-serif text-4xl text-cream z-10">Account</div>
          </div>
          <div className="w-px h-12 bg-ink/20" />
          <div className="flex space-x-6">
            <div className="w-32 h-32 bg-white border border-cream-secondary shadow-xl rounded-full flex flex-col items-center justify-center">
              <div className="text-[9px] uppercase tracking-widest text-coral mb-1">Drain</div>
              <div className="font-serif text-xl">Expense</div>
            </div>
            <div className="w-32 h-32 bg-[#FDFCF8] border border-cream-secondary shadow-xl rounded-xl flex flex-col items-center justify-center">
              <div className="text-[9px] uppercase tracking-widest text-yellow mb-1">Credit</div>
              <div className="font-serif text-xl">Payment</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// 7. Final CTA (Typographic Lockup)
const FinalCTA = ({ onInitialize }) => {
  return (
    <section className="py-40 px-6 bg-yellow flex flex-col items-center justify-center text-center overflow-hidden">
      <FadeUp>
        <div className="font-serif text-[12vw] md:text-[8rem] leading-[0.85] tracking-tighter text-ink mb-16">
          KNOW YOUR<br/>MONEY.<br/>
          <span className="text-ink/40">NOT JUST YOUR<br/>BALANCE.</span>
        </div>
      </FadeUp>
      
      <FadeUp delay={0.2}>
        <button onClick={onInitialize} className="inline-flex items-center space-x-6 group cursor-pointer border border-ink/20 pl-4 pr-10 py-3 rounded-full hover:bg-ink hover:text-cream transition-colors bg-transparent text-ink">
          <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center group-hover:bg-cream transition-colors">
            <ArrowRight className="text-cream group-hover:text-ink w-5 h-5 transition-colors" />
          </div>
          <span className="font-medium tracking-[0.2em] uppercase text-sm">
            Start
          </span>
        </button>
      </FadeUp>
    </section>
  );
};

// 8. Footer
const Footer = () => (
  <footer className="bg-cream pt-32 pb-12 px-6 border-t border-cream-secondary">
    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 mb-24">
      <div>
        <div className="font-serif text-5xl mb-6 text-ink tracking-tighter">Sundae</div>
        <div className="text-olive font-light text-lg">Money is everywhere.<br/>Sundae makes it make sense.</div>
      </div>
      <div className="grid grid-cols-2 gap-8 text-xs tracking-widest uppercase font-medium text-olive">
        <div className="flex flex-col space-y-4">
          <div className="text-ink/40 mb-4">Platform</div>
          <Link to="/login" className="hover:text-ink transition-colors">Sign In</Link>
          <Link to="/register" className="hover:text-ink transition-colors">Create Account</Link>
          <a href="#features" className="hover:text-ink transition-colors">Features</a>
        </div>
        <div className="flex flex-col space-y-4">
          <div className="text-ink/40 mb-4">Legal</div>
          <span className="hover:text-ink transition-colors cursor-not-allowed">Privacy</span>
          <span className="hover:text-ink transition-colors cursor-not-allowed">Terms</span>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto text-xs text-olive/30 uppercase tracking-widest border-t border-cream-secondary pt-8">
      &copy; {new Date().getFullYear()} Sundae Systems. All rights reserved.
    </div>
  </footer>
);

export default function Landing() {
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(false);

  const handleInitialize = () => {
    setIsInitializing(true);
    setTimeout(() => {
      navigate('/register');
    }, 1800);
  };

  return (
    <div className="bg-cream min-h-screen font-sans text-ink selection:bg-yellow selection:text-ink relative">
      <AnimatePresence>
        {isInitializing && (
          <div className="fixed inset-0 z-[100] pointer-events-none flex">
            {/* Staggered Vertical Slices */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-100%" }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.76, 0, 0.24, 1],
                  delay: i * 0.1 
                }}
                className="h-full flex-1 bg-ink"
              />
            ))}
            
            {/* Elegant Typography Reveal */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="overflow-hidden py-8 px-4">
                <motion.div 
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1], delay: 0.8 }}
                  className="font-serif text-[18vw] md:text-[15vw] leading-none tracking-tighter text-cream"
                >
                  SUNDAE
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
      <LandingNav />
      <Hero onInitialize={handleInitialize} />
      <MoneyIntro />
      <ProductShowcase />
      <FeatureJourney />
      <MoneyFlow />
      <FinalCTA onInitialize={handleInitialize} />
      <Footer />
    </div>
  );
}
