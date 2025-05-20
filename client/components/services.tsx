"use client";

import Image from "next/image"
import { ArrowRight, RefreshCw, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.3, duration: 0.6, ease: "easeOut" },
  }),
}

const ctaVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

export default function Services() {
  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#FFB300] to-[#1E88E5] bg-clip-text text-transparent">
              Nos Services
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Des solutions innovantes pour connecter l'Europe et l'Algérie
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {[ // Array of service data for map iteration
            {
              id: 1,
              icon: <RefreshCw className="h-6 w-6 text-white" />,
              title: "Transferts Bidirectionnels",
              description:
                "Contrairement à d'autres services, BladiPay permet des transferts dans les deux sens : de l'Europe vers l'Algérie et de l'Algérie vers l'Europe, répondant ainsi à tous vos besoins financiers transfrontaliers.",
              imgAlt: "Transferts Bidirectionnels",
            },
            {
              id: 2,
              icon: <Smartphone className="h-6 w-6 text-white" />,
              title: "Recharge Mobile Instantanée",
              description:
                "Offrez du crédit téléphonique directement sur le mobile de vos proches en Algérie depuis l'Europe. Un service pratique qui maintient vos connexions familiales même dans l'urgence.",
              imgAlt: "Recharge Mobile Instantanée",
            },
          ].map((service, i) => (
            <motion.div
              key={service.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-[#FFB300] to-[#1E88E5] p-3 rounded-full mr-4">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold">{service.title}</h3>
              </div>
              <p className="text-gray-700 mb-6">{service.description}</p>
              <div className="relative h-60 w-full rounded-lg overflow-hidden mb-6">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt={service.imgAlt}
                  fill
                  className="object-cover"
                />
              </div>
              <Button className="bg-gradient-to-r from-[#FFB300] to-[#1E88E5] text-white hover:opacity-90 flex items-center">
                Découvrir
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={ctaVariants}
          className="bg-gradient-to-r from-[#FFB300]/20 to-[#1E88E5]/20 p-8 md:p-12 rounded-xl text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-6">
            Prêt à simplifier vos transferts d'argent ?
          </h3>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui font confiance à BladiPay pour leurs transferts entre l'Europe et
            l'Algérie.
          </p>
          <Button className="bg-gradient-to-r from-[#FFB300] to-[#1E88E5] text-white hover:opacity-90 px-8 py-6 text-lg flex items-center justify-center mx-auto">
            Commencer maintenant
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
