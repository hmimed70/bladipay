"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import MyImage from '@/public/transfer.jpeg'
export default function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFB300]/10 to-[#1E88E5]/10" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Text Section with Animation */}
          <motion.div
            className="flex flex-col space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-[#FFB300] to-[#1E88E5] bg-clip-text text-transparent">
                BladiPay
              </span>
              <br />
              <span>Connectez l'Europe et l'Algérie</span>
            </h1>
            <p className="text-lg text-gray-700 max-w-lg">
              Une solution innovante pour les transferts d'argent bidirectionnels entre l'Europe et l'Algérie. Simple,
              rapide et sécurisée.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-gradient-to-r from-[#FFB300] to-[#1E88E5] text-white hover:opacity-90 px-8 py-6 text-lg">
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="border-[#1E88E5] text-[#1E88E5] hover:bg-[#1E88E5] hover:text-white px-8 py-6 text-lg"
              >
                En savoir plus
              </Button>
            </div>
          </motion.div>

          {/* Right: Image Section with Animation */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <div className="relative w-full max-w-xl h-[400px] rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={MyImage}
                alt="BladiPay Transfer Illustration"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#FFB300]/40 to-[#1E88E5]/40 mix-blend-overlay" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
