"use client"
import { CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

export default function About() {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <motion.div
        className="container mx-auto px-4"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#FFB300] to-[#1E88E5] bg-clip-text text-transparent">
              À propos de BladiPay
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Une startup Franco-Algérienne née d'un besoin concret : simplifier et sécuriser les transferts d'argent et
            recharges mobiles entre l'Europe et l'Algérie.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeUp}>
            <h3 className="text-2xl font-bold mb-6">Notre mission</h3>
            <p className="text-gray-700 mb-6">
              Offrir un service rapide, transparent et fiable pour l'envoi d'argent et de crédits mobiles, tout en
              respectant les normes internationales de sécurité.
            </p>

            <h3 className="text-2xl font-bold mb-6">Notre vision</h3>
            <p className="text-gray-700 mb-6">
              BladiPay souhaite devenir le pont technologique entre la diaspora et le territoire algérien, en
              démocratisant l'accès aux services financiers transfrontaliers.
              <br />
              <br />
              Nous croyons en une Algérie connectée, soutenue par sa diaspora à travers des outils modernes, éthiques et
              accessibles à tous.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold mb-6 text-center">
              <span className="bg-gradient-to-r from-[#FFB300] to-[#1E88E5] bg-clip-text text-transparent">
                Pourquoi nous choisir
              </span>
            </h3>

            <motion.ul variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {[
                {
                  title: "100% Digital & Moderne",
                  desc: "Une interface intuitive et fluide développée from scratch avec des technologies web avancées.",
                },
                {
                  title: "Sécurité de niveau bancaire",
                  desc: "Chiffrement des données, authentification renforcée, conformité aux normes GDPR et AML.",
                },
                {
                  title: "Taux compétitifs & transparents",
                  desc: "Pas de frais cachés, tout est clair dès la simulation.",
                },
                {
                  title: "Connectivité locale",
                  desc: "Intégration avec les réseaux télécoms et canaux financiers en Algérie.",
                },
                {
                  title: "Support client humain",
                  desc: "Une équipe réactive, bilingue, proche de sa communauté.",
                },
              ].map((item, i) => (
                <motion.li key={i} className="flex items-start mb-4" variants={fadeUp}>
                  <CheckCircle className="h-6 w-6 text-[#1E88E5] mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
