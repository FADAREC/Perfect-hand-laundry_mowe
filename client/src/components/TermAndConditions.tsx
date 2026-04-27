import { businessConfig } from "../../../config/business";

export default function TermsAndConditions() {
  const { name } = businessConfig;
  const lastUpdated = "January 2, 2026";
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms & Conditions
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Premium Care, Proper Laundry
          </p>
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        
        {/* Intro */}
        <div className="mb-12 p-6 bg-primary/5 rounded-lg border-l-4 border-primary">
          <p className="text-lg text-gray-700 leading-relaxed">
            Special attention to stains, gentle handling, and crisp ironing—because your clothes deserve it. By using our services, you agree to the following conditions of acceptance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="space-y-8">
            
            {/* Payment Policy */}
            <section className="border border-gray-200 rounded-lg p-6 bg-yellow-50">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">💳</span> Payment Policy
              </h2>
              <p className="text-gray-700 mb-4 font-semibold">
                Dear valued customer, we wish to advise you that we operate a <strong>100% prepayment policy</strong>.
              </p>
              <p className="text-gray-700 mb-6">
                Kindly pay 100% of the value of your cleaning bill at drop-off. Payment confirms your order and ensures prompt service.
              </p>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-300">
                  <p className="text-sm font-semibold text-gray-600 mb-2">YABA BRANCH</p>
                  <p className="text-lg font-bold text-gray-900">5799599578</p>
                  <p className="text-sm text-gray-600">MONIEPOINT</p>
                  <p className="text-sm font-medium text-gray-700">CAPERBERRY FABRIC CARE</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-300">
                  <p className="text-sm font-semibold text-gray-600 mb-2">ORCHID BRANCH (LEKKI)</p>
                  <p className="text-lg font-bold text-gray-900">5195709104</p>
                  <p className="text-sm text-gray-600">MONIEPOINT</p>
                  <p className="text-sm font-medium text-gray-700">CAPERBERRY FABRIC CARE - ORCHID</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-4 italic">
                Thank you for your cooperation.
              </p>
            </section>
            
            {/* Express Service */}
            <section className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">⚡</span> Express Service
              </h2>
              <p className="text-gray-700">
                Need it fast? We're happy to help—pricing varies by location and urgency. Please contact us to discuss your specific needs.
              </p>
            </section>
            
            {/* Standard Turnaround */}
            <section className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">📅</span> Standard Turnaround
              </h2>
              <p className="text-gray-700">
                Laundry is ready in <strong>4 working days</strong>. Kindly confirm availability with customer service.
              </p>
            </section>
            
            {/* Stain Notice */}
            <section className="border border-gray-200 rounded-lg p-6 bg-blue-50">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">🔍</span> Stain Notice
              </h2>
              <p className="text-gray-700 mb-3">
                <strong>Please highlight garments with stains for proper treatment.</strong>
              </p>
              <p className="text-sm text-gray-600 bg-white p-3 rounded border border-blue-200">
                <strong>Wash & Dry Disclaimer:</strong> No special stain treatment is included in wash & dry services.
              </p>
            </section>
            
            {/* Stain Removal */}
            <section className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">🧴</span> Stain Removal
              </h2>
              <p className="text-gray-700">
                We do our best, but not all stains can be removed.
              </p>
            </section>
            
            {/* Unclaimed Garments */}
            <section className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">📦</span> Unclaimed Garments
              </h2>
              <p className="text-gray-700">
                Items not picked up <strong>1 month after completion</strong> (and notification) may be given out.
              </p>
            </section>
          </div>
          
          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            
            {/* Damage & Return Policy */}
            <section className="border border-gray-200 rounded-lg p-6 bg-red-50">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">⚠️</span> Damage & Return Policy
              </h2>
              <p className="text-gray-700 mb-4">
                In the event of loss or damage of the cleaned items, we will reimburse you up to <strong>5 times the laundry charge</strong> for that item.
              </p>
              <p className="text-gray-700 font-semibold">
                Should you find an issue with one of your pieces, please notify us within <strong>24 hours</strong> of your delivery.
              </p>
            </section>
            
            {/* Pockets & Personal Items */}
            <section className="border border-gray-200 rounded-lg p-6 bg-orange-50">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">👕</span> Pockets & Personal Items
              </h2>
              <p className="text-gray-700">
                <strong>Please check your clothes—</strong> Caperberry isn't liable for lost money, jewelry, or other personal items.
              </p>
            </section>
            
            {/* Quality Promise */}
            <section className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">✨</span> Quality Promise
              </h2>
              <p className="text-gray-700">
                We aim to provide top-tier cleaning—always with care.
              </p>
            </section>
            
            {/* Cleaning Disclaimer */}
            <section className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">🧼</span> Cleaning Disclaimer
              </h2>
              <p className="text-gray-700">
                We're not liable for damage from standard cleaning or customer-requested wash of dry-clean-only items.
              </p>
            </section>
            
            {/* Special Care Items */}
            <section className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">🎀</span> Special Care Items
              </h2>
              <p className="text-gray-700">
                Delicate or specialty garments are cleaned at the customer's risk.
              </p>
            </section>
            
            {/* Fabric Reactions */}
            <section className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">🧵</span> Fabric Reactions
              </h2>
              <p className="text-gray-700">
                We're not responsible for shrinking, bleeding, or fabric changes due to normal cleaning.
              </p>
            </section>
            
            {/* Right to Refuse */}
            <section className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">🚫</span> Right to Refuse
              </h2>
              <p className="text-gray-700">
                We may decline any garment we believe is unsafe to clean.
              </p>
            </section>
          </div>
        </div>
        
        {/* Footer Signature */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-gray-600 mb-4">
            By booking our services, you acknowledge and accept these conditions.
          </p>
          <p className="text-sm text-gray-500 italic">
            Signed, Management
          </p>
          <p className="text-sm font-semibold text-gray-700 mt-2">
            {name}
          </p>
        </div>
      </div>
      
      {/* Footer CTA */}
      <div className="bg-gray-50 border-t py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <a 
            href="/" 
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300 text-lg"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
