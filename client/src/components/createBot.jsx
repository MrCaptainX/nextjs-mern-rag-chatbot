import React, { useState } from 'react';

const CreateBot = ({ whenDone , state , close }) => {
  const [chatbotName, setChatbotName] = useState('');
  const [context, setContext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

      

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/chats/new` || "http://localhost:5000/chats/new", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
          name: chatbotName,
          context: context,
        }),
        });
        const data = await res.json();
        close()
        whenDone(data);
      } catch(e) {
        alert("Failed to create chat" );
      }
    setIsSubmitting(false);
  };

   const randomContexts = [
  `Dr. HealWell Clinic is a multi-specialty medical clinic providing general medicine, pediatrics, dermatology, cardiology, and internal medicine services. We are committed to providing high-quality patient care with a focus on preventive health and wellness. Our doctors are board-certified with years of experience in their fields. Clinic hours are Monday to Friday, 9:00 AM to 6:00 PM, and Saturdays from 9:00 AM to 1:00 PM. We offer online appointment booking and teleconsultation services. Patients can contact the clinic at appointments@healwell.com or call 555-101-2020. Our clinic provides diagnostic services, routine health check-ups, vaccination programs, and health education sessions. We follow strict hygiene protocols, maintain electronic health records, and offer insurance support for covered treatments.`,
  `Brew & Bean Café is a cozy neighborhood café specializing in premium coffees, teas, and freshly baked pastries. We offer a variety of espresso-based drinks, cold brews, seasonal beverages, sandwiches, and desserts. Opening hours are Monday-Sunday from 7:00 AM to 9:00 PM. Customers can dine in, take away, or order online through our website or mobile app. The café has a loyalty program offering points for every purchase, redeemable for free drinks or treats. We provide allergy information for all menu items. The ambiance is relaxed with free Wi-Fi and comfortable seating, making it a popular spot for students and professionals. Contact us at contact@brewbean.com or call 555-202-3030 for reservations, catering orders, or special events.`,
  `HealthSure Diagnostics is a full-service diagnostic center offering a wide range of laboratory tests, imaging services, and health screenings. Services include blood tests, urine tests, X-rays, MRI, CT scans, ultrasound, and specialized tests for diabetes, heart disease, and vitamin deficiencies. Operating hours are Monday to Saturday, 8:00 AM to 6:00 PM. Patients can book tests online, visit the center for sample collection, or schedule home collection for certain tests. HealthSure Diagnostics provides detailed reports, electronic access to results, and guidance on test interpretation. All procedures follow strict hygiene and safety protocols. For inquiries, test bookings, or insurance claims, contact info@healthsure.com or call 555-303-4040. We also offer preventive health packages, annual health check-ups, and corporate health screening programs.`,
  `Justice & Partners Law Firm provides legal services across corporate law, civil litigation, family law, property law, and contract advisory. Our team of experienced lawyers ensures professional, ethical, and timely legal assistance. Office hours are Monday to Friday, 9:00 AM to 6:00 PM. We offer consultations in person, online, or via phone. Clients can contact us at info@justicepartners.com or call 555-404-5050. Our services include drafting contracts, legal opinions, case representation, dispute resolution, and compliance advisory. We maintain strict confidentiality and provide guidance on legal rights, obligations, and procedures. The firm also offers workshops and resources to educate clients about legal processes and preventive measures to avoid disputes.`,
  `FashionHub is a retail clothing store offering a wide range of apparel for men, women, and children. Our collections include casual wear, formal wear, sportswear, and accessories. The store operates Monday to Saturday from 10:00 AM to 8:00 PM. Customers can shop in-store or order online with home delivery options. FashionHub provides size guides, styling recommendations, and seasonal discounts. We accept returns and exchanges within 14 days of purchase. Contact customer support at support@fashionhub.com or call 555-505-6060. Our staff offers personalized styling assistance, and we host periodic fashion events, new arrivals showcases, and loyalty programs for frequent shoppers. We maintain high-quality standards and source products from trusted brands to ensure durability and style.`
];

  const handleRandomContext = () => {
    const randomContext = randomContexts[Math.floor(Math.random() * randomContexts.length)];
    setContext(randomContext);
  };

  return (
    <div className={state ? 'block' : 'hidden'}>
    <div className='fixed top-0 bottom-0 left-0 right-0 bg-black opacity-50' onClick={close}></div>
    <div className="fixed min-h-screen flex items-center w-full  justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 w-[90%] max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Chatbot Setup</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="chatbotName" className="block text-sm font-medium text-gray-700 mb-1">
              Chatbot Name
            </label>
            <input
              id="chatbotName"
              type="text"
              value={chatbotName}
              onChange={(e) => setChatbotName(e.target.value)}
              placeholder="Like Idiot Bot"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>

          <div>
            <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-1">
              Context
            </label>
            <textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Enter information about your business that the chatbot should know..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
             <button
                type="button"
                onClick={handleRandomContext}
                className="mt-2 bg-gray-800 text-white py-2 px-4 rounded-lg text-xs hover:bg-gray-600 transition"
              >
                Fill Random Context
              </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !chatbotName.trim() || !context.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Setting Up...
              </span>
            ) : (
              'Create Chatbot'
            )}
          </button>

           <button
            className="w-full bg-red-400 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            onClick={close}
          >
            Cancel
          </button>
          
        </form>
      </div>
    </div>
     </div>
  );
};

export default CreateBot;