"use client";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, telephone, Mail, Send } from "lucide-react"
import { motion } from "framer-motion"

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
}

const buttonVariants = {
  hover: { scale: 1.05, boxShadow: "0 0 8px rgb(255, 179, 0)" },
  tap: { scale: 0.95 },
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e : any) => {
    e.preventDefault()
    console.log(formData)
    alert("Merci pour votre message ! Nous vous contacterons bientôt.")
    setFormData({ name: "", email: "", message: "" })
  }
      const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
}
  return (
    <motion.section
      id="contact"
      className="py-20"
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4">
        {/* ... rest unchanged ... */}
       <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#FFB300] to-[#1E88E5] bg-clip-text text-transparent">
              Contactez-nous
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Vous avez des questions ? Notre équipe est là pour vous aider
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left info part unchanged */}
    <div>
            <h3 className="text-2xl font-bold mb-6">Restons en contact</h3>
            <p className="text-gray-700 mb-8">
              Nous sommes toujours ravis d'entendre nos utilisateurs. N'hésitez pas à nous contacter pour toute
              question, suggestion ou demande d'assistance.
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-gradient-to-r from-[#FFB300] to-[#1E88E5] p-3 rounded-full mr-4">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">Adresse</h4>
                  <p className="text-gray-600">123 Boulevard Haussmann, 75008 Paris, France</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-gradient-to-r from-[#FFB300] to-[#1E88E5] p-3 rounded-full mr-4">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">Téléphone</h4>
                  <p className="text-gray-600">+33 1 23 45 67 89</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-gradient-to-r from-[#FFB300] to-[#1E88E5] p-3 rounded-full mr-4">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">Email</h4>
                  <p className="text-gray-600">contact@bladipay.com</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold mb-6">Envoyez-nous un message</h3>
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
    <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Comment pouvons-nous vous aider ?"
                  rows={5}
                  required
                />
              </div>


<Button
  asChild
  className="w-full bg-gradient-to-r from-[#FFB300] to-[#1E88E5] text-white hover:opacity-90"
>
  <motion.button
    type="submit"
    variants={buttonVariants}
    whileHover="hover"
    whileTap="tap"
  >
    Envoyer
    <Send className="ml-2 h-4 w-4" />
    
  </motion.button>
  </Button>
            </motion.form>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
