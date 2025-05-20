"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#FFB300] to-[#1E88E5] bg-clip-text text-transparent">
              BladiPay
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="#about" className="text-sm font-medium hover:text-[#1E88E5] transition-colors">
            À propos
          </Link>
          <Link href="#services" className="text-sm font-medium hover:text-[#1E88E5] transition-colors">
            Services
          </Link>
          <Link href="#testimonials" className="text-sm font-medium hover:text-[#1E88E5] transition-colors">
            Témoignages
          </Link>
          <Link href="#contact" className="text-sm font-medium hover:text-[#1E88E5] transition-colors">
            Contact
          </Link>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="border-[#1E88E5] text-[#1E88E5] hover:bg-[#1E88E5] hover:text-white">
              Se connecter
            </Button>
            <Button className="bg-gradient-to-r from-[#FFB300] to-[#1E88E5] text-white hover:opacity-90">
              S'inscrire
            </Button>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4 bg-white">
            <Link
              href="#about"
              className="text-sm font-medium hover:text-[#1E88E5] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              À propos
            </Link>
            <Link
              href="#services"
              className="text-sm font-medium hover:text-[#1E88E5] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium hover:text-[#1E88E5] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Témoignages
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium hover:text-[#1E88E5] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                className="border-[#1E88E5] text-[#1E88E5] hover:bg-[#1E88E5] hover:text-white w-full"
              >
                Se connecter
              </Button>
              <Button className="bg-gradient-to-r from-[#FFB300] to-[#1E88E5] text-white hover:opacity-90 w-full">
                S'inscrire
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
