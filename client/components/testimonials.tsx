"use client";

import Image from "next/image"
import { Star } from "lucide-react"
import { motion } from "framer-motion"

const testimonials = [
  {
    id: 1,
    rating: 5,
    text: "BladiPay a vraiment simplifié mes transferts d'argent entre l'Europe et l'Algérie.",
    name: "Fatima B.",
    location: "Paris, France",
  },
  {
    id: 2,
    rating: 4,
    text: "Le service de recharge mobile instantanée est rapide et fiable. Je recommande !",
    name: "Ahmed K.",
    location: "Alger, Algérie",
  },
  {
    id: 3,
    rating: 5,
    text: "Excellente plateforme avec un support client très réactif.",
    name: "Sophie M.",
    location: "Lyon, France",
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.5, ease: "easeOut" },
  }),
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#FFB300] to-[#1E88E5] bg-clip-text text-transparent">
              Témoignages
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Découvrez ce que nos utilisateurs disent de BladiPay
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex mb-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-5 w-5 ${
                      index < testimonial.rating
                        ? "text-[#FFB300] fill-[#FFB300]"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
              <div className="flex items-center">
                <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={`/placeholder.svg?height=100&width=100`}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
