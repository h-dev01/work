import Navbar from "../components/Navbar";
import ScrollToTop from "../components/ScrollToTop";
import Hero from "../components/Hero";
import RoleShowcase from "../components/RoleShowcase";
import Stats from "../components/Stats";
import Partners from "../components/Partners";
import CallToAction from "../components/CallToAction";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";

import { Helmet } from 'react-helmet-async';

const LandingPage = () => {
  return (
    <>
      <Helmet>
        <title>StudyPulse AI - Academic Performance Intelligence</title>
        <meta name="description" content="Detect risk, understand progress, and guide student success with role-based academic dashboards." />
      </Helmet>
      <div id="back-to-top-anchor" />
      <Navbar />
      <main>
        <Hero />
        <Partners />
        <Stats />
        <RoleShowcase />
        <FAQ />
        <CallToAction />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
};

export default LandingPage;
