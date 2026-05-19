import { useEffect, useRef } from 'react'
import './index.css'
import {
  Nav,
  Hero,
  Features,
  Architecture,
  Stack,
  MLEngine,
  APIReference,
  GettingStarted,
  Testing,
  Author,
  Footer,
} from './components'

function useAnimateOnScroll() {
  useEffect(() => {
    const elements = document.querySelectorAll('.animate-on-scroll')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08 }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

export default function App() {
  useAnimateOnScroll()

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <div className="divider" />
        <Features />
        <div className="divider" />
        <Architecture />
        <div className="divider" />
        <Stack />
        <div className="divider" />
        <MLEngine />
        <div className="divider" />
        <APIReference />
        <div className="divider" />
        <GettingStarted />
        <div className="divider" />
        <Testing />
        <div className="divider" />
        <Author />
      </main>
      <Footer />
    </>
  )
}
